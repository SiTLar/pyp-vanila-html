"use strict";

define("Drawer", ["./Autolinker.min"],function(Autolinker){

function _Drawer(d, v,n,u){
	this.doc = d;
	this.cView = v;
	this.gNodes = n;
	this.Utils = u;
}
_Drawer.prototype = {
	constructor: _Drawer
	,"writeAllLikes":function(id,nodeLikes){
		var Drawer = this;
		var post = Drawer.doc.getElementById(id).rawData;
		nodeLikes.innerHTML = "";
		var nodeLike = Drawer.doc.createElement("span");
		nodeLike.className = "p-timeline-user-like";
		for(var like = 0; like < post.likes.length; like++){
			var nodeCLike = nodeLike.cloneNode();
			nodeCLike.innerHTML = Drawer.cView.gUsers[post.likes[like]].link;
			//nodeLikes.childNodes[idx].appendChild(nodeCLike);
			nodeLikes.appendChild(nodeCLike);
		}
		var suffix = Drawer.doc.createElement("span");
		suffix.innerHTML = " liked this";
		//nodeLikes.childNodes[idx].appendChild(suffix);
		nodeLikes.parentNode.appendChild(suffix);
	}
	,"genLikes":function(nodePost){
		var Drawer = this;
		var post = nodePost.rawData;
		var postNBody = nodePost.cNodes["post-body"];
		var node = Drawer.doc.createElement("div");
		node.className = "likes";
		postNBody.cNodes["post-info"].replaceChild(node,  postNBody.cNodes["post-info"].cNodes["likes"]);
		postNBody.cNodes["post-info"].cNodes["likes"] = node;
		if(!Array.isArray(post.likes) || !post.likes.length ) return;
		postNBody.cNodes["post-info"].cNodes["likes"].appendChild(Drawer.gNodes["likes-smile"].cloneNode(true));
		var nodeLikes = Drawer.doc.createElement( "span");

		/*
		var l =  post.likes.length;
		if(typeof Drawer.cView.gMe !== "undefined"){
			for (var idx = 0; idx< l;idx++) {
				var like = post.likes[idx];
				if(like == Drawer.cView.gMe.users.id){
					post.likes.splice(idx,1);
					post.likes.unshift(like);
					break;
				}
			}
		}
		*/


		var nodeLike = Drawer.doc.createElement("span");
		nodeLike.className = "p-timeline-user-like";
		post.likes.forEach(function(like){
			var nodeCLike = nodeLike.cloneNode();
			nodeCLike.innerHTML = Drawer.cView.gUsers[like].link;
			nodeLikes.appendChild(nodeCLike);
		});
		var suffix = Drawer.doc.createElement("span");
		suffix.id = post.id+"-unl"
		if (post.omittedLikes)
			suffix.innerHTML = 'and <a onclick="unfoldLikes(\''+post.id+'\')">'+ post.omittedLikes +" other people</a> ";
		suffix.innerHTML += "liked this";
		suffix.className = "nocomma";
		postNBody.cNodes["post-info"].cNodes["likes"].appendChild(nodeLikes);
		postNBody.cNodes["post-info"].cNodes["likes"].cNodes = new Object();
		postNBody.cNodes["post-info"].cNodes["likes"].cNodes["comma"] = nodeLikes;
		postNBody.cNodes["post-info"].cNodes["likes"].appendChild(suffix);
		//postNBody.cNodes["post-info"].cNodes["likes"].appendChild(suffix);
		nodeLikes.className = "comma";
		if(typeof Drawer.cView.gMe !== "undefined"){
			if(post.likes[0] == Drawer.cView.gMe.users.id){
				postNBody.cNodes["post-info"].myLike = nodeLikes.childNodes[0];
				if( postNBody.cNodes["post-info"].nodeLike) {
					postNBody.cNodes["post-info"].nodeLike.innerHTML = "Un-like";
					postNBody.cNodes["post-info"].nodeLike.action = false;

				}

			}
		}
	}
	,"loadGlobals":function(data){
		var Drawer = this;
		if(data.attachments)data.attachments.forEach(function(attachment){ Drawer.cView.gAttachments[attachment.id] = attachment; });
		if(data.comments)data.comments.forEach(function(comment){ Drawer.cView.gComments[comment.id] = comment; });
		if(data.users)data.users.forEach(Drawer.Utils.addUser);
		if(data.subscribers && data.subscriptions ){
			var subscribers = new Object();
			data.subscribers.forEach(function(sub){subscribers[sub.id]=sub;Drawer.Utils.addUser(sub);});
			data.subscriptions.forEach(function(sub){
				if(["Posts", "Directs"].some(function(a){ return a == sub.name })){
					var userTitle;
					var user = subscribers[sub.user];
					var mode = Drawer.cView.localStorage.getItem("display_name");
					if (mode == null) mode = "screen";
					switch(mode){
					case "screen":
						userTitle  = user.screenName;
						break;
					case "screen_u":
						if(user.screenName != user.username)
							userTitle  = user.screenName + " <div class=username>("+user.username+")</div>";
						else userTitle  = "<div class=username>"+user.username+"</div>";
						break;
					case "username":
						userTitle  = "<div class=username>"+user.username+"</div>";
					}
					var className = "not-my-link";
					if((typeof Drawer.cView.gMe !== "undefined")&&(typeof Drawer.cView.gMe.users !== "undefined"))
						className = (user.id==Drawer.cView.gMe.users.id?"my-link":"not-my-link");
					Drawer.cView.gFeeds[sub.id] = user;
					Drawer.cView.gFeeds[sub.id].link = '<a class="'+className+'" href="' + gConfig.front+ user.username+'">'+ userTitle+"</a>";
				}
			});
		}
	}
	,"makeContainer":function(){
		var Drawer = this;
		var body = Drawer.doc.createElement("div");
		body.className = "content";
		body.id = "content";
		Drawer.doc.getElementsByTagName("body")[0].appendChild(body);
		var title =  Drawer.doc.createElement("div");
		title.className = "pagetitle";
		title.innerHTML = "<h1>" +Drawer.cView.timeline+ "</h1>"
		Drawer.doc.title = "FreeFeed: " + Drawer.cView.timeline; 
		var controls = Drawer.gNodes["controls-user"].cloneAll();
		if((typeof Drawer.cView.gMe !== "undefined") 
			&& Array.isArray(Drawer.cView.gMe.users.subscriptionRequests)){
			controls.cNodes["sr-info"].cNodes["sr-info-a"].innerHTML = "You have "
			+ Drawer.cView.gMe.users.subscriptionRequests.length 
			+ " subscription requests to review.";
			controls.cNodes["sr-info"].hidden = false;
			Drawer.cView.subReqsCount = Drawer.cView.gMe.users.subscriptionRequests.length;
		} else Drawer.cView.subReqsCount = 0;
		body.appendChild(controls );
		body.appendChild(title);
		return body;
	}
	,"drawSettings":function(){
		var Drawer = this;
		var body = makeContainer();
		var nodeSettings = Drawer.gNodes["global-settings"].cloneAll();
		body.appendChild(nodeSettings);
		Drawer.doc.getElementById("my-screen-name").value = Drawer.cView.gMe.users.screenName;
		if(typeof Drawer.cView.gMe.users.email !== "undefined" )Drawer.doc.getElementById("my-email").value = Drawer.cView.gMe.users.email;
		Drawer.doc.getElementById("me-private").checked = (Drawer.cView.gMe.users.isPrivate == 1);
		var mode = Drawer.cView.localStorage.getItem("display_name");
		if (mode == null) mode = "screen";
		var theme = Drawer.cView.localStorage.getItem("display_theme");
		if (theme  == null) mode = "main.css";
		var nodes = nodeSettings.getElementsByTagName("input");
		for(var idx = 0; idx < nodes.length; idx++){
			var node = nodes[idx];
			if(node.type == "radio" ){
				if (( node.name == "display_name") &&(node.value == mode)
				|| ( node.name == "display_theme") &&(node.value == theme))
					node.checked = true;
			}
		};
		var nodeLinkPreview =  Drawer.doc.getElementById("link-preview");
		if(Drawer.cView.localStorage.getItem("show_link_preview") == "1")
			nodeLinkPreview.checked = true;
		else nodeLinkPreview.checked = false;

		Drawer.doc.getElementById("rt-chkbox").checked = parseInt(Drawer.cView.localStorage.getItem("rt"));
		var bump = (Drawer.cView.localStorage.getItem("rtbump") == 1);
		Drawer.doc.getElementById("rt-params").hidden = !bump;
		Drawer.doc.getElementById("rt-bump").checked = bump ;
		var oRTParams = Drawer.cView.localStorage.getItem("rt_params");
		if (oRTParams != null)
			oRTParams = JSON.parse(oRTParams);
		["rt-bump-int", "rt-bump-cd", "rt-bump-d"].forEach(function(id){
			var node = Drawer.doc.getElementById(id);
			if(oRTParams)node.value = oRTParams[id];
			node.parentNode.getElementsByTagName("span")[0].innerHTML = node.value + " minutes";
		});
		
		addIcon("favicon.ico");
		Drawer.doc.body.removeChild(Drawer.doc.getElementById("splash"));
	  (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,Drawer.doc,"script","//www.google-analytics.com/analytics.js","ga");

	  ga("create", "UA-0-1", "auto");
	  ga("send", "pageview");
	}
	,"draw":function(content){
		var Drawer = this;
		matrix = new CryptoPrivate(gCryptoPrivateCfg );
		matrix.storage = Drawer.cView.sessionStorage;
		/*
		var body = Drawer.doc.createElement("div");
		body.className = "content";
		body.id = "content";
		Drawer.doc.getElementsByTagName("body")[0].appendChild(body);
		var title =  Drawer.doc.createElement("div");
		title.innerHTML = "<h1>" +Drawer.cView.timeline+ "</h1>"
		title.className = "pagetitle";
		*/
		var body = makeContainer();
		loadGlobals(content);
		Drawer.cView.cTxt = null;
		["blockPosts", "blockComments"].forEach(function(list){
			Drawer.cView[list]= JSON.parse(Drawer.cView.localStorage.getItem(list));
		})
		//var nodeRTControls = Drawer.gNodes["rt-controls"].cloneAll();
		if(typeof Drawer.cView.gMe === "undefined"){
			var nodeGControls = Drawer.gNodes["controls-anon"].cloneAll();
			var controls = body.getElementsByClassName("controls-user")[0];
			body.replaceChild(nodeGControls, controls);
		}else{
			if ((typeof Drawer.cView.gMe.users.subscribers !== "undefined") 
			&& (typeof Drawer.cView.gMe.users.subscriptions !== "undefined")){
				Drawer.cView.gMe.subscribers.forEach(Drawer.Utils.addUser);
				var oSubscriptions = new Object();
				Drawer.cView.gMe.subscriptions.forEach(function(sub){
					if(sub.name =="Posts"){
						oSubscriptions[sub.id] = sub.user;
					}
				});
				Drawer.cView.gMe.users.subscribers.forEach(function(sub){
					Drawer.Utils.addUser(sub);
					Drawer.cView.gUsers[sub.id].subscriber = true;
				});
				Drawer.cView.gMe.users.subscriptions.forEach(function(subid){
					if (typeof oSubscriptions[subid] !== "undefined") {
						if (typeof Drawer.cView.gUsers[oSubscriptions[subid]] !== "undefined")
							Drawer.cView.gUsers[oSubscriptions[subid]].friend = true;
					}
				});
			}

			switch (Drawer.cView.timeline.split("/")[0]){
			case "filter":
				if (Drawer.cView.timeline.split("/")[1] == "direct"){
					var nodeAddPost = Drawer.gNodes["new-post"].cloneAll();
					body.appendChild(nodeAddPost);
					genDirectTo(nodeAddPost);
					break;
				}
			case "home":
			case Drawer.cView.gMe.users.username:
				var nodeAddPost = Drawer.gNodes["new-post"].cloneAll();
				body.appendChild(nodeAddPost);
				genPostTo(nodeAddPost);
				break;
			default:
				setChild(body, "up-controls", genUpControls(Drawer.cView.timeline));

			}
		}
		if(content.timelines){
			var nodeMore = Drawer.doc.createElement("div");
			nodeMore.className = "more-node";
			var htmlPrefix = '<a href="' + gConfig.front+Drawer.cView.timeline ;
			var htmlForward;
			var htmlBackward;
			//var fLastPage = (content.posts.length != Drawer.cView.offset);
			var backward = Drawer.cView.cSkip*1 - Drawer.cView.offset*1;
			var forward = Drawer.cView.cSkip*1 + Drawer.cView.offset*1;
			if (Drawer.cView.cSkip){
				if (backward>=0) htmlBackward = htmlPrefix + "?offset="
					+ backward*1+ "&limit="+Drawer.cView.offset*1
					+ '"><span style="font-size: 120%">&larr;</span> Newer entries</a>';
				nodeMore.innerHTML = htmlBackward ;
			}
			/*if(!fLastPage)*/ if(content.posts){
				htmlForward = htmlPrefix + "?offset="
				+ forward*1 + "&limit="+Drawer.cView.offset*1
				+'">Older entries<span style="font-size: 120%">&rarr;</span></a>';
				if (htmlBackward) nodeMore.innerHTML += '<span class="spacer">&mdash;</span>'
				nodeMore.innerHTML +=  htmlForward;
			}
			body.appendChild(nodeMore.cloneNode(true));
			Drawer.doc.posts = Drawer.doc.createElement("div");
			Drawer.doc.posts.className = "posts";
			body.appendChild(Drawer.doc.posts);
			Drawer.doc.hiddenPosts = new Array();
			Drawer.doc.hiddenCount = 0;
			var idx = 0;
			if (content.posts){
				content.posts.forEach(function(post){
					post.idx = idx++;
					if(post.isHidden){
						Drawer.doc.hiddenCount++;
					}else{
						post.isHidden = false;
						Drawer.doc.posts.appendChild(genPost(post));
					}
					Drawer.doc.hiddenPosts.push({"is":post.isHidden,"data":post});
				});
			}
			var nodeShowHidden = Drawer.gNodes["show-hidden"].cloneAll();
			nodeShowHidden.cNodes["href"].action = true;
			body.appendChild(nodeShowHidden);
			if(Drawer.doc.hiddenCount) nodeShowHidden.cNodes["href"].innerHTML= "Show "+ Drawer.doc.hiddenCount + " hidden entries";
			body.appendChild(nodeMore);
			var drop = Math.floor(Drawer.cView.cSkip/3);
			var toAdd = drop + Math.floor(Drawer.cView.offset/3);
			if((!gPrivTimeline.done)&& (Drawer.cView.timeline == "home")&& matrix.ready){
				gPrivTimeline.done = true;
				new Promise(function (){addPosts(drop,toAdd,0);});
			};
		}else{
			var singlePost = genPost(content.posts);
			body.appendChild(singlePost);
			var nodesHide = singlePost.getElementsByClassName("hide");
			singlePost.hidden = false;
			if (nodesHide.lenght)nodesHide[0].hidden = true;
			Drawer.doc.title = "@" 
				+ Drawer.cView.gUsers[singlePost.rawData.createdBy].username + ": "
				+ singlePost.rawData.body.slice(0,20).trim()
				+ (singlePost.rawData.body.length > 20?"\u2026":"" )
				+ " (FreeFeed)";
		}
	/*
		var nodeRTCtrl = body.getElementsByClassName("rt-controls")[0];
		nodeRTCtrl.cNodes["rt-chkbox"].checked = parseInt(Drawer.cView.localStorage.getItem("rt"));
		var nodeBump = nodeRTCtrl.cNodes["rt-bump"];
		for(var idx = 0; idx<nodeBump.childNodes.length; idx++)
			if(nodeBump.childNodes[idx].value == bump){
				nodeBump.selectedIndex = idx;
				break;
			}
		*/
		var bump = Drawer.cView.localStorage.getItem("rtbump");
		if(content.timelines) Drawer.cView.rt = {"timeline":[content.timelines.id]};
		else Drawer.cView.rt = {"post":[content.posts.id]};
		if(parseInt(Drawer.cView.localStorage.getItem("rt")) ){
			gRt = new RtUpdate(Drawer.cView.token, bump);
			gRt.subscribe(Drawer.cView.rt);
		}
		var nodes = Drawer.doc.getElementsByClassName("post");
		for(var idx = 0; idx < nodes.length; idx++ ){
			var nodePost = nodes[idx];
			var nodeImgAtt = nodePost.cNodes["post-body"].cNodes["attachments"].cNodes["atts-img"];
			if(chkOverflow(nodeImgAtt))
				nodeImgAtt.parentNode.cNodes["atts-unfold"].hidden = false;
		};
		if(Drawer.cView.localStorage.getItem("show_link_preview") == "1"){
			(function(a,b,c){
				var d,e,f;
				f="PIN_"+~~((new Date).getTime()/864e5),
				a[f]||(a[f]=!0,a.setTimeout(function(){
					d=b.getElementsByTagName("SCRIPT")[0],
					e=b.createElement("SCRIPT"),
					e.type="text/javascript",
					e.async=!0,
					e.src=c+"?"+f,
					d.parentNode.insertBefore(e,d)
				}
				,10))
			})(window,Drawer.doc,"//assets.pinterest.com/js/pinit_main.js");
		}
		Drawer.doc.body.removeChild(Drawer.doc.getElementById("splash"));
	  (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,Drawer.doc,"script","//www.google-analytics.com/analytics.js","ga");

	  ga("create", "UA-0-1", "auto");
	  ga("send", "pageview");

	}
	,"chkOverflow":function(victim){
		var Drawer = this;
		var test = victim.cloneNode(true);
		test.style.opacity = 0;
		test.style.position = "absolute";
		victim.appendChild(test);
		test.style.width = victim.clientWidth;
		var height = test.clientHeight;
		test.style.display = "block";
		var ret = height < test.clientHeight;
		victim.removeChild(test);
		return ret;
	}
	,"drawRequests":function(){
		var Drawer = this;
		var oReq = new XMLHttpRequest();
		oReq.open("get", gConfig.serverURL +"users/whoami", true);
		oReq.setRequestHeader("X-Authentication-Token", Drawer.cView.token);
		oReq.onload = function(){
			if(oReq.status < 400) {
				Drawer.cView.gMe = JSON.parse(oReq.response);
				if (Drawer.cView.gMe.users) {
					Drawer.Utils.refreshDrawer.cView.gMe();
					completeRequests();
					return true;
				}
			}
		}
		oReq.send();
	}
	,"completeRequests":function(){
		var Drawer = this;
		var body = makeContainer();
		if (Array.isArray(Drawer.cView.gMe.requests)) Drawer.cView.gMe.requests.forEach( Drawer.Utils.addUser);
		else body.getElementsByClassName("pagetitle")[0].innerHTML = "<h1>No requests</h1>";
		
		if(Array.isArray(Drawer.cView.gMe.users.subscriptionRequests)){
			var nodeTPReq = Drawer.doc.createElement("h3");
			nodeTPReq.innerHTML = "Pending requests";
			nodeTPReq.id = "sr-header";
			body.appendChild(nodeTPReq);
			Drawer.cView.gMe.users.subscriptionRequests.forEach(function(req){
				body.appendChild(genReqNode(Drawer.cView.gUsers[req]));
			});
		}
		if(Array.isArray(Drawer.cView.gMe.users.pendingSubscriptionRequests)){
			var nodeTReq = Drawer.doc.createElement("h3");
			nodeTReq.innerHTML = "Sent requests";
			body.appendChild(nodeTReq);
			Drawer.cView.gMe.users.pendingSubscriptionRequests.forEach(function(req){
				var node = genReqNode(Drawer.cView.gUsers[req]);
				node.cNodes["sr-ctrl"].hidden = true;
				body.appendChild(node);
			});
		}

		addIcon("favicon.ico");
		Drawer.doc.body.removeChild(Drawer.doc.getElementById("splash"));
		function genReqNode(user){
			var node = Drawer.gNodes["sub-request"].cloneAll();
			node.cNodes["sr-name"].innerHTML = "<a href="+gConfig.front+user.username+">"
				+user.screenName
				+"</a>"
				+" @" + user.username; 
			node.cNodes["sr-avatar"].src =  user.profilePictureMediumUrl ;
			node.cNodes["sr-user"].value = user.username;
			return node;
		}

	}
	,"genUpControls":function(username){
		var Drawer = this;
		var controls = Drawer.gNodes["up-controls"].cloneAll();
		var sub = controls.cNodes["up-s"];
		var user = Drawer.cView.gUsers.byName[username];
		if (typeof user !== "undifined") gen();
		else new Promise(function(resolve, reject){
			var oReq = new XMLHttpRequest();
			oReq.onload = function(){
				if(this.status < 400){
					var oRes = JSON.parse(oReq.response);
					Drawer.Utils.addUser(oRes.users);
					user = Drawer.cView.gUsers.byName[comment.user];
					resolve();
				}
			};
			oReq.open("get",gConfig.serverURL + "users/"+username, true);
			oReq.setRequestHeader("X-Authentication-Token", Drawer.cView.token);
			oReq.send();
		}).then(gen);
		function gen() {
			controls.user = username;
			sub.innerHTML = user.friend?"Unsubscribe":"Subscribe";
			sub.subscribed = user.friend;
			if (!user.friend && (user.isPrivate == 1 )){
				sub.removeEventListener("click",subscribe);
				var oRequests = new Object();
				if (Array.isArray(Drawer.cView.gMe.requests)){
					Drawer.cView.gMe.requests.forEach(function(req){
						oRequests[req.id] = req;
					});
				}
				if(Array.isArray(Drawer.cView.gMe.users.pendingSubscriptionRequests)
				&&Drawer.cView.gMe.users.pendingSubscriptionRequests.some(function(a){
						return oRequests[a].username == username
					})){
					controls.cNodes["up-s"] = Drawer.doc.createElement("span");
					controls.cNodes["up-s"].innerHTML = "Subscription request sent";
					controls.replaceChild(controls.cNodes["up-s"], sub);
				}else{
					sub.innerHTML = "Request subscription";
					sub.addEventListener("click", reqSubscription);
				}
			}
			if(user.friend && user.subscriber){
				controls.cNodes["up-d"].href = gConfig.front + "filter/direct#"+username;
				controls.cNodes["up-d"].target = "_blank";
			}else{
				controls.cNodes["up-d"].hidden = true;
				controls.cNodes["up-d"].nextSibling.hidden = true;
			}
			var aBan = controls.cNodes["up-b"];
			if (user.type == "group"){
				aBan.nextSibling.hidden = true;
				aBan.hidden = true;
				return;
			}
			aBan.banned = Drawer.cView.gMe.users.banIds.some(function(a){
				return a == user.id;
			});
			if (aBan.banned){
				aBan.innerHTML = "Un-ban";
				aBan.removeEventListener("click",genBlock);
				aBan.addEventListener("click", doUnBan);
			}
		}
		return controls;
	}

	,"regenHides":function(){
		var Drawer = this;
		var idx = 0;
		Drawer.doc.hiddenPosts.forEach(function(victim){
			victim.data.idx = idx++;
		});
	}
	,"updateDate":function(node){
		var Drawer = this;
		node.innerHTML =  relative_time(node.date);
		var txtdate = new Date(node.date).toString();
		node.title = txtdate.slice(0, txtdate.indexOf("(")).trim();
		window.setTimeout(updateDate, 30000, node );
	}
	 
	,"genPost":function(post){
		var Drawer = this;
		function spam(){nodePost = Drawer.doc.createElement("span");};
		function ham(){
			nodePost.feed = cpost.payload.feed;
			gPrivTimeline.posts.push(nodePost);
			gPrivTimeline.postsById[post.id] = nodePost;
			nodePost.rawData.body = cpost.payload.data;
			postNBody.cNodes["post-cont"].innerHTML = autolinker.link(cpost.payload.data.replace(/&/g,"&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
			if(typeof user === "undefined"){
				if (Drawer.cView.gUsers.byName[cpost.payload.author]){
					user = Drawer.cView.gUsers.byName[cpost.payload.author];
					post.createdBy = user.id;
					gotUser();
				} else if(Drawer.cView.gUsersQ[cpost.payload.author]) Drawer.cView.gUsersQ[cpost.payload.author].then(
					function(){
						user = Drawer.cView.gUsers.byName[cpost.payload.author];
						post.createdBy = user.id;
						gotUser();
					},spam);
				else{
					Drawer.cView.gUsersQ[cpost.payload.author] = new Promise (function(resolve,reject){

						var oReq = new XMLHttpRequest();
						oReq.onload = function(){
							if(this.status < 400){
								var oRes = JSON.parse(oReq.response);
								Drawer.Utils.addUser(oRes.users);
								user = Drawer.cView.gUsers.byName[cpost.payload.author];
								post.createdBy = user.id;
								resolve();
							}
						};

						oReq.open("get",gConfig.serverURL + "users/"+post.username, true);
						oReq.setRequestHeader("X-Authentication-Token", Drawer.cView.token);
						oReq.send();
					}).then(gotUser,spam);
				}
			}else gotUser();
		}
		function gotUser(){
			var urlMatch ;		
			if(( typeof Drawer.cView["blockPosts"]!== "undefined")&& (Drawer.cView["blockPosts"] != null)&& (Drawer.cView["blockPosts"][user.id])){
				nodePost.hidden = true  ;
			}
			nodePost.gotLock  = false;
			if(typeof user !== "undefined"){
				nodePost.cNodes["avatar"].cNodes["avatar-h"].innerHTML = '<img src="'+ user.profilePictureMediumUrl+'" />';
				nodePost.cNodes["avatar"].cNodes["avatar-h"].userid = user.id;
				postNBody.cNodes["title"].innerHTML = genTitle(nodePost);
			}
			if(nodePost.gotLock == true)
				postNBody.cNodes["post-info"].cNodes["post-controls"].cNodes["post-lock"].innerHTML = "<i class='fa fa-lock icon'>&nbsp;</i>";
			if(post.attachments){
				var attsNode = postNBody.cNodes["attachments"];
				post.attachments.forEach(function(att){
					var nodeAtt = Drawer.doc.createElement("div");
					var oAtt = Drawer.cView.gAttachments[att];
					switch(oAtt.mediaType){
					case "image":
						nodeAtt.innerHTML = '<a target="_blank" href="'+oAtt.url+'" border=none ><img src="'+oAtt.thumbnailUrl+'"></a>';
						attsNode.cNodes["atts-img"].appendChild(nodeAtt);
						nodeAtt.className = "att-img";
						break;
					case "audio":
						nodeAtt.innerHTML = '<audio style="height:40" preload="none" controls><source src="'+oAtt.url+'" ></audio> <br><a href="'+oAtt.url+'" target="_blank" ><i class="fa fa-download"></i> '+oAtt.fileName+'</a>';
						nodeAtt.className = "att-audio";
						attsNode.cNodes["atts-audio"].appendChild(nodeAtt);
						break;
					default:
						nodeAtt.innerHTML = '<a href="'+oAtt.url+'" target="_blank" ><i class="fa fa-download"></i> '+oAtt.fileName+'</a>';
						attsNode.appendChild(nodeAtt);

					}
				});		
			}else 
			if(((urlMatch = post.body.match(/https?:\/\/[^\s\/$.?#].[^\s]*/i) )!= null)
			&&(Drawer.cView.localStorage.getItem("show_link_preview") == "1")){
				gEmbed.p.then(function(oEmbedPr){
					embedPreview(oEmbedPr
						,urlMatch[0]
						,postNBody.cNodes["attachments"] 
					);
				});
			}
			var anchorDate = Drawer.doc.createElement("a");
			if(typeof user !== "undefined") anchorDate.href = gConfig.front+user.username+"/"+post.id;
			postNBody.cNodes["post-info"].cNodes["post-controls"].cNodes["post-date"].appendChild(anchorDate);
			anchorDate.date = post.createdAt*1;
			window.setTimeout(updateDate, 10,anchorDate);

			if(typeof Drawer.cView.gMe !== "undefined"){
				var nodeControls;
				if (post.createdBy == Drawer.cView.gMe.users.id){
					nodeControls = Drawer.gNodes["controls-self"].cloneAll();
				}else {
					nodeControls = Drawer.gNodes["controls-others"].cloneAll();
					postNBody.cNodes["post-info"].nodeLike = nodeControls.cNodes["post-control-like"];
					nodeControls.cNodes["post-control-like"].action = true;
				}
				var nodeHide  = Drawer.gNodes["hide"].cloneAll();
				nodeControls.appendChild(nodeHide);
				var aHide = nodeHide.cNodes["href"]
				aHide.className = "hide";
				aHide.innerHTML = post.isHidden?"Un-hide":"Hide";
				aHide.action = !post.isHidden;
				postNBody.cNodes["post-info"].cNodes["post-controls"].appendChild( nodeControls);
				postNBody.cNodes["post-info"].cNodes["post-controls"].nodeHide = aHide;
			}
			if (post.likes)	genLikes(nodePost );
			if (post.comments){
				if(post.omittedComments){
					if(post.comments[0])
						postNBody.cNodes["comments"].appendChild(genComment(Drawer.cView.gComments[post.comments[0]]));
					var nodeComment = Drawer.gNodes["comment"].cloneAll();
					nodeComment.cNodes["comment-date"].innerHTML = "";
					nodeComment.cNodes["comment-body"].innerHTML = "<a id="+post.id+'-unc  onclick="unfoldComm(\''+post.id +'\')" style="font-style: italic;">'+ post.omittedComments+" more comments</a>";
					postNBody.cNodes["comments"].appendChild(nodeComment);
					if(post.comments[1])
						postNBody.cNodes["comments"].appendChild(genComment(Drawer.cView.gComments[post.comments[1]]));
				}
				else post.comments.forEach(function(commentId){ postNBody.cNodes["comments"].appendChild(genComment(Drawer.cView.gComments[commentId]))});
			}
			postNBody.cNodes["comments"].cnt = postNBody.cNodes["comments"].childNodes.length;
			if (postNBody.cNodes["comments"].cnt > 4)
					addLastCmtButton(postNBody);
		}
		var nodePost = Drawer.gNodes["post"].cloneAll();
		var postNBody = nodePost.cNodes["post-body"];
		var user = undefined;
		if(post.createdBy) user = Drawer.cView.gUsers[post.createdBy];
		nodePost.homed = false;
		nodePost.rawData = post;
		nodePost.id = post.id;
		nodePost.isPrivate = false;

		var cpost = matrix.decrypt(post.body);
		if (typeof cpost.error !== "undefined"){
			switch(cpost.error){
			case "0":
				break;
			case "3":
				gPrivTimeline.noKey[post.id] = post;
				console.log(post.id+": unknown key");
				break;
			case "4":
				gPrivTimeline.noDecipher[post.id] = post;
				console.log("Private keys not loaded");
				break;
			}
			postNBody.cNodes["post-cont"].innerHTML =  autolinker.link(post.body.replace(/\n/g,"").replace(/&/g,"&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
			gotUser();
		}else{
			nodePost.isPrivate = true;
			post.createdAt = Date.parse(post.createdAt);
			nodePost.rawData.createdAt = post.createdAt;
			cpost = JSON.parse(cpost);
			if (typeof cpost.payload.author === "undefined" ) return spam();
			matrix.verify(JSON.stringify(cpost.payload), cpost.sign, cpost.payload.author).then(ham,spam);
			nodePost.sign = cpost.sign;
		}
		return nodePost;

	}
	,"genTitle":function(nodePost){
		var Drawer = this;
		var post = nodePost.rawData;
		var user = Drawer.cView.gUsers[post.createdBy];
		var title = user.link;
		if(nodePost.isPrivate) title += "<span> posted a secret to "+StringView.makeFromBase64(matrix.gSymKeys[cpost.payload.feed].name)+"</span>";
		else if(post.postedTo){
			nodePost.gotLock  = true;
			post.postedTo.forEach(function(id){
				if (Drawer.cView.gFeeds[id].isPrivate == "0")
					nodePost.gotLock = false;
			});
			if ((post.postedTo.length >1)||(Drawer.cView.gFeeds[post.postedTo[0]].id!=user.id)){
				title += "<span> posted to: </span>";
				post.postedTo.forEach(function(id){
					title += Drawer.cView.gFeeds[id].link;
				});
			}
		}
		return title;

	}
	,"embedPreview": function (oEmbedPrs, victim, target){
		var Drawer = this;
		var oEmbedURL;
		var m;
		if((m = /^https:\/\/docs\.google\.com\/(Drawer.doc|spreadsheets|presentation|drawings)\/d\/([^\/]+)/.exec(victim)) !== null) {
			new Promise(function(resolve,reject){
				var oReq = new XMLHttpRequest();
				oReq.onload = function(){
					if(oReq.status < 400)
						resolve(JSON.parse(oReq.response));
					else reject(oReq.response);
				}

				oReq.open("get","https://www.googleapis.com/drive/v2/files/" + m[2] + "?key=AIzaSyA8TI6x9A8VdqKEGFSE42zSexn5HtUkaT8",true);
				oReq.send();
			}).then(function(info){
				//var nodeiFrame = Drawer.doc.createElement("iframe");
				//nodeiFrame.src = info.embedLink;
				var nodeA = Drawer.doc.createElement("a");
				var img = Drawer.doc.createElement("img");
				var width = Drawer.doc.getElementById("content").clientWidth*3/4;
				img.src = info.thumbnailLink.replace("=s220","=w"+ width+"-c-h"+ width/5 );// "=s"+Drawer.doc.getElementById("content").clientWidth/2+"-p");
				var node = Drawer.doc.createElement("div");
				node.className = "att-img";
				nodeA.appendChild(img);
				nodeA.href = victim;
				node.appendChild(nodeA);
				target.appendChild(node);
				img.onerror=function(){nodeA.hidden = true;};
			});
		return;	
		}else if (/^https?:\/\/(www\.)?pinterest.com\/pin\/.*/.exec(victim) !== null){
			var node = Drawer.doc.createElement("div");
			node.className = "att-img";
			node.innerHTML = '<a data-pin-do="embedPin" href="' + victim + '"></a>';
			target.appendChild(node);
			return;
		}
		var bIsOEmbed = oEmbedPrs.some(function(o){
			return o.endpoints.some(function(endp){
				if(!endp.schemes)console.log(endp.url)
				else if (endp.schemes.some(function (scheme){
					return victim.match(scheme) != null; })){
					oEmbedURL = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D'"
						+ encodeURIComponent(endp.url 
							+ "?url=" + victim 
							+ "&format=json"
							+ "&maxwidth="+Drawer.doc.getElementById("content").clientWidth*3/4
						)
						+ "'&format=json";
					return true;
				}else return false;
			});
		});

		if(bIsOEmbed){
			new Promise(function(resolve,reject){
				var oReq = new XMLHttpRequest();
				oReq.onload = function(){
					if(oReq.status < 400)
						resolve(JSON.parse(oReq.response));
					else reject(oReq.response);
				}

				oReq.open("get",oEmbedURL,true);
				oReq.send();
			}).then(function(qoEmbed){
				if (!qoEmbed.query.count) return;
				var oEmbed = qoEmbed.query.results.json;
				if(oEmbed.type == "photo"){
					target.appendChild(oEmbedImg(oEmbed.url,victim));
				}else if (typeof oEmbed.html !== "undefined"){
					if(oEmbed.html.indexOf("iframe") == 1){
						var node = Drawer.doc.createElement("div");
						node.innerHTML = oEmbed.html;
						target.appendChild(node);
					}else if(typeof oEmbed.thumbnail_url !== "undefined"){
						target.appendChild(oEmbedImg(oEmbed.thumbnail_url,victim));
					}else{
						var iframe = Drawer.doc.createElement("iframe");	
						iframe.sandbox = true;
						iframe.srcdoc = oEmbed.html;
						iframe.style.width = oEmbed.width;
						iframe.style.height = oEmbed.height;
						target.appendChild(iframe);
					}
				}
			},doEmbedly );
		}else doEmbedly();
		function oEmbedImg(url,victim){
			if(!url.match(/^['"]?https?/)) return Drawer.doc.createElement("img");
			var img = Drawer.doc.createElement("img");
			img.src = url;
			//img.style.width = oEmbed.width;
			//img.style.height = oEmbed.height;
			var node = Drawer.doc.createElement("a");
			node.appendChild(img);
			return node;	
		}
		function doEmbedly(){
			var aEmbed = Drawer.doc.createElement("a");
			aEmbed.href = victim;
			aEmbed.className = "embedly-card";
			target.appendChild(aEmbed);
		}
	}
	,"genEditNode":function(post,cancel){
		var Drawer = this;
		var nodeEdit = Drawer.gNodes["edit"].cloneAll();
		nodeEdit.cNodes["edit-buttons"].cNodes["edit-buttons-post"].addEventListener("click",post);
		nodeEdit.cNodes["edit-buttons"].cNodes["edit-buttons-cancel"].addEventListener("click",cancel);
		Drawer.cView.cTxt = nodeEdit.cNodes["edit-txt-area"];
		return nodeEdit;
	}
	,"genComment":function(comment){
		var Drawer = this;
		var nodeComment = Drawer.gNodes["comment"].cloneAll();
		var cUser = Drawer.cView.gUsers[comment.createdBy];
		var nodeSpan = Drawer.doc.createElement("span");
		nodeComment.userid = null;
		function gotUser(){
			nodeComment.userid = cUser.id;
			nodeSpan.innerHTML += " - " + cUser.link ;
			if(typeof Drawer.cView.gMe !== "undefined"){
				if(cUser.id == Drawer.cView.gMe.users.id)
					nodeComment.cNodes["comment-body"].appendChild(Drawer.gNodes["comment-controls"].cloneAll());
				else if(!cUser.friend) nodeComment.cNodes["comment-date"].cNodes["date"].style.color = "#787878";
			}
			if(( typeof Drawer.cView["blockComments"]!== "undefined") && ( Drawer.cView["blockComments"]!= null) && (Drawer.cView["blockComments"][cUser.id]))
				nodeComment.innerHTML = "---";

		}
		function spam(){nodeComment = Drawer.doc.createElement("span");};
		nodeComment.cNodes["comment-body"].appendChild(nodeSpan);
		nodeSpan.innerHTML = autolinker.link(comment.body.replace(/&/g,"&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
		nodeComment.id = comment.id;
		nodeComment.createdAt = comment.createdAt;
		if(typeof cUser !== "undefined"){
			gotUser();
		}else if(comment.user) {
			if (Drawer.cView.gUsers.byName[comment.user]) {
				cUser = Drawer.cView.gUsers.byName[comment.user];
				gotUser();
			}
			else if(Drawer.cView.gUsersQ[comment.user]) Drawer.cView.gUsersQ[comment.user].then(gotUser,spam);
			else{
				Drawer.cView.gUsersQ[comment.user] = new Promise (function(resolve,reject){

					var oReq = new XMLHttpRequest();
					oReq.onload = function(){
						if(this.status < 400){
							var oRes = JSON.parse(oReq.response);
							Drawer.Utils.addUser(oRes.users);
							cUser = Drawer.cView.gUsers.byName[comment.user];
							resolve();
						}
					};
					oReq.open("get",gConfig.serverURL + "users/"+comment.username, true);
					oReq.setRequestHeader("X-Authentication-Token", Drawer.cView.token);
					oReq.send();
				}).then(gotUser,spam);
			}
		}
		return nodeComment;
	}
	,"addLastCmtButton":function(postNBody){
		var Drawer = this;
		if (postNBody.lastCmtButton == true)return;
		var aAddComment = Drawer.doc.createElement("a");
		var aIcon = Drawer.doc.createElement("a");
		aAddComment.className = "post-control-comment";
		aIcon.className = "fa-stack fa-1x";
		aIcon.innerHTML = '<i class="fa fa-comment-o fa-stack-1x"></i>'
		+'<i class="fa fa-square fa-inverse fa-stack-1x" style="left: 3px; top: 3px; font-size: 60%"></i>'
		+'<i class="fa fa-plus fa-stack-1x" style="left: 3px; top: 3px; font-size: 60%"></i>';
		aAddComment.innerHTML  = "Add comment";
		aAddComment.addEventListener("click",addComment);
		postNBody.appendChild(aIcon);
		postNBody.appendChild(aAddComment );
		postNBody.lastCmtButton = true;
	}
	,"genDirectTo":function(victim){
		var Drawer = this;
		var nodeDirectTo = Drawer.gNodes["new-direct-to"].cloneAll();
		victim.replaceChild(nodeDirectTo, victim.cNodes["new-post-to"]);
		victim.cNodes["new-post-to"] = nodeDirectTo;
		nodeDirectTo.feeds = new Array();
		victim.cNodes["edit-buttons"].cNodes["edit-buttons-post"].removeEventListener("click", newPost);
		victim.cNodes["edit-buttons"].cNodes["edit-buttons-post"].addEventListener("click", postDirect);
		victim.cNodes["edit-buttons"].cNodes["edit-buttons-post"].disabled = true;
		if(Drawer.doc.location.hash != ""){
			victim.cNodes["edit-buttons"].cNodes["edit-buttons-post"].disabled = false;
			nodeDirectTo.cNodes["new-direct-input"].value = Drawer.doc.location.hash.slice(1);
		}
		if ((typeof Drawer.cView.gMe.users.subscribers !== "undefined") && (typeof Drawer.cView.gMe.users.subscriptions !== "undefined")){
			var oDest = new Object();
			for (var username in Drawer.cView.gUsers.byName){
				if (!Drawer.cView.gUsers.byName[username].friend || !(Drawer.cView.gUsers.byName[username].subscriber || (Drawer.cView.gUsers.byName[username].type == "group")))
					continue;
				var pos = oDest;
				for(var idx = 0; idx < username.length; idx++){
					if (typeof pos.arr === "undefined") pos.arr = new Array();
					pos.arr.push(username);
					if (typeof pos[username.charAt(idx)] === "undefined")
						pos[username.charAt(idx)] = new Object();
					pos = pos[username.charAt(idx)];
				}
			}
		}
		nodeDirectTo.cNodes["new-direct-input"].dest = oDest;
		Drawer.cView.regenPostTo = function (){return genDirectTo(victim);};
	}
	,"genPostTo":function(victim){
		var Drawer = this;
		var nodePostTo = Drawer.gNodes["new-post-to"].cloneAll();
		victim.replaceChild(nodePostTo, victim.cNodes["new-post-to"]);
		victim.cNodes["new-post-to"] = nodePostTo;
		nodePostTo.feeds = new Array();
		nodePostTo.feeds.push(Drawer.cView.gMe.users.username);
		nodePostTo.parentNode.isPrivate  = false;
		nodePostTo.cNodes["new-post-feeds"].firstChild.idx = 1;
		nodePostTo.cNodes["new-post-feeds"].firstChild.oValue = Drawer.cView.gMe.users.username;
		var option = Drawer.doc.createElement("option");
		option.selected = true;
		var select = Drawer.doc.createElement("select");
		select.className = "new-post-feed-select";
		select.hidden = nodePostTo.cNodes["new-post-feed-select"].hidden;
		select.addEventListener("change",newPostSelect);
		nodePostTo.replaceChild(select, nodePostTo.cNodes["new-post-feed-select"]);
		nodePostTo.cNodes["new-post-feed-select"] = select;
		nodePostTo.cNodes["new-post-feed-select"].appendChild(option);
		option = Drawer.doc.createElement("option");
		option.disabled = true;
		option.innerHTML = "My feed";
		option.value = Drawer.cView.gMe.users.username;
		nodePostTo.cNodes["new-post-feed-select"].appendChild(option);
		var groups = Drawer.doc.createElement("optgroup");
		groups.label = "Public groups";
		if (typeof Drawer.cView.gMe.users.subscriptions !== "undefined"){
			var oSubscriptions = new Object();
			Drawer.cView.gMe.subscriptions.forEach(function(sub){if (sub.name == "Posts")oSubscriptions[sub.id] = sub; });
			Drawer.cView.gMe.users.subscriptions.forEach(function(subid){
				if (typeof oSubscriptions[subid] === "undefined") return;
				var sub = Drawer.cView.gUsers[oSubscriptions[subid].user];
				if((typeof sub !=="undefined") && (sub.type == "group")){
					option = Drawer.doc.createElement("option");
					option.value = sub.username;
					option.innerHTML = sub.screenName;
					groups.appendChild(option);
				}
			});

		};
		if (groups.childNodes.length > 0 )
			nodePostTo.cNodes["new-post-feed-select"].appendChild(groups);
		groups = Drawer.doc.createElement("optgroup");
		groups.label = "Private groups";
		for (var id in matrix.gSymKeys){
			option = Drawer.doc.createElement("option");
			option.value = id;
			option.privateFeed = true;
			option.innerHTML = StringView.makeFromBase64(matrix.gSymKeys[id].name);
			groups.appendChild(option);
		}
		if (groups.childNodes.length > 0 )
			nodePostTo.cNodes["new-post-feed-select"].appendChild(groups);

		Drawer.cView.regenPostTo = function (){return genPostTo(victim);};

	}
	,"frfAutolinker":function( autolinker,match ){
		switch (match.getType()){
		case "twitter":
			return "<a href=" + gConfig.front+match.getTwitterHandle()+">@" +match.getTwitterHandle( ) + "</a>" ;
		/*
		case "url":
			if( match.getUrl().indexOf(".freefeed.net") != -1 ) return true;
			else if( match.getUrl().indexOf("freefeed.net") != -1 ) {
			    match.url = match.url.replace("freefeed.net","m.freefeed.net","gm");
			    var tag = autolinker.getTagBuilder().build( match );
			    return tag;

			} else {
			    return true;
			}

		*/
		default:
			return true;
		}
	}
};
return _Drawer;
});
