(function(Secondary, NonstaticClass, StaticClass, PagePanel, CallServer){
this.AddProject = (function(Global, Validation, UserManagementList){
	function AddProject(selector){
		///	<summary>
		///	添加项目。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		var titleValidation, colorValidation, addProject = this;

		// 标题验证
		titleValidation = new Validation(
			this.find('section[desc="title"]'),
			function(titleEl){
				return titleEl.find(">input").value !== "";
			}
		);
		colorValidation = new Validation(
			this.find('section[desc="color"]'),
			function(colorEl){
				return colorEl.find("button.selected").length !== 0;
			}
		);

		this.assign({
			colorValidation : colorValidation,
			titleValidation : titleValidation,
			userManagementList : new UserManagementList("添加项目拍档")
		});

		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between('>section[desc="color"] button', this).length > 0){
					addProject.find('>section[desc="color"] button').classList.remove("selected");
					targetEl.classList.add("selected");
				}
			},
			beforeshow : function(){
				Global.titleBar.find('button[action="submit"]').onuserclick = function(){
					if(!titleValidation.validate())
						return;

					if(!colorValidation.validate())
						return;

					CallServer.open("addProject", {
						title : addProject.find('>section[desc="title"]>input').value,
						color : addProject.find('>section[desc="color"] button.selected').get("colormark", "attr"),
						desc : addProject.find('>footer textarea').value,
						users : addProject.userManagementList.getAllUsers()
					}, function(data){
						Global.history.go("project");
					}, true);
				};
			}
		});

		this.userManagementList.appendTo(this.find(">header")[0]);
	};
	AddProject = new NonstaticClass(AddProject, "Bao.Page.Index.Secondary.AddProject", PagePanel.prototype);

	AddProject.override({
		isNoTraces : true,
		restore : function(){
			// 还原标题
			this.find(">section input").value = "";
			// 清空已选择的用户
			this.userManagementList.clearUsers();
			// 还原颜色
			this.find('>section[desc="color"] dd .selected').classList.remove("selected");
			// 清空文本框
			this.find(">footer textarea").value = "";
		},
		title : "添加项目",
		tools : [{ urlname : "javascript:void(0);", action : "submit" }]
	});

	AddProject.properties({
		colorValidation : undefined,
		titleValidation : undefined,
		userManagementList : undefined
	});

	return AddProject.constructor;
}(
	Bao.Global,
	Bao.API.DOM.Validation,
	Bao.UI.Control.List.UserManagementList
));

this.BusinessCard = (function(Global, Confirm, clickAvatarEvent){
	function ClickUserAvatar(){
		///	<summary>
		///	点击用户头像。
		///	</summary>
		var bodyEl = jQun(document.body);
		
		bodyEl.attach({
			userclick : function(e){
				var avatarPanel = jQun(e.target).between('[class*="AvatarPanel"]');

				if(avatarPanel.length === 0)
					return;

				var userId = avatarPanel.getAttribute("userid");

				if(userId === null)
					return;

				clickAvatarEvent.setEventAttrs({
					userId : userId
				});
				clickAvatarEvent.trigger(e.target);
				
				e.stopPropagation();
			}
		}, true, 2);

		bodyEl.attach({
			clickavatar : function (e){
				Global.history.go("businessCard").fillUser(e.userId);
			}
		});
	};
	ClickUserAvatar = new StaticClass(ClickUserAvatar);


	function BusinessCard(selector, userInfoHtml){
		///	<summary>
		///	个人名片。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		/// <param name="userInfoHtml" type="jQun.HTML">用户信息模板</param>
		this.assign({
			userInfoHtml : userInfoHtml
		});

		this.attach({
			clickavatar : function(e){
				e.stopPropagation();
			},
			userclick : function(e, targetEl){
				if(targetEl.between('>footer li', this).length > 0){
					console.log("你点击了一个按钮：" + targetEl.getAttribute("action"));
					return;
				}
			}
		});
	};
	BusinessCard = new NonstaticClass(BusinessCard, "Bao.Page.Index.Secondary.BusinessCard", PagePanel.prototype);

	BusinessCard.override({
		isNoTraces : true,
		restore : function(){
			this.find(">section>dl").innerHTML = "";
		},
		title : "个人名片"
	});

	BusinessCard.properties({
		fillUser : function(id){
			///	<summary>
			///	填充用户。
			///	</summary>
			/// <param name="id" type="string">用户id</param>
			var businessCard = this;

			CallServer.open("getUser", { id : id }, function(data){
				businessCard.find(">section>dl").innerHTML = businessCard.userInfoHtml.render(data);	
			});

			this.userId = id;
		},
		userId : -1,
		userInfoHtml : undefined
	});

	return BusinessCard.constructor;
}(
	Bao.Global,
	Bao.UI.Control.Mask.Confirm,
	// clickAvatarEvent
	new jQun.Event("clickavatar", function(){
		this.attachTo("*");
	})
));

this.SystemOption = (function(AnchorList, Global, localStorage, anchorData){
	function SystemOption(selector){
		///	<summary>
		///	系统项。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		new AnchorList(anchorData).appendTo(this.find(">section")[0]);

		this.attach({
			userclick : function(e, targetEl){
				if(targetEl.between(">footer>button", this).length > 0){
					CallServer.open("logout", null, function(data){
						Global.history.go("login");
						localStorage.clear();
					});
					return;
				}
			}
		});
	};
	SystemOption = new NonstaticClass(SystemOption, "Bao.Page.Index.Secondary.SystemOption", PagePanel.prototype);

	SystemOption.override({
		title : "系统项"
	});

	return SystemOption.constructor;
}(
	Bao.UI.Control.List.AnchorList,
	Bao.Global,
	localStorage,
	// anchorData
	[
		{ key : "globalSearch", title : "搜索全部" },
		{ key : "account", title : "我的账户" },
		{ key : "accountConnection", title : "连接账户" },
		{ key : "qrCode", title : "我的二维码" },
		{ key : "archive", title : "查看归档" },
		{ key : "aboutBaoPiQi", title : "关于暴脾气" }
	]
));

this.SystemContacts = (function(OverflowPanel, Global){
	function SystemContacts(selector, contactsHtml){
		var systemContacts = this, overflowPanel = new OverflowPanel(this.find(">section>ul"));
		
		this.attach({
			beforeshow : function(){
				Global.titleBar.find('button[action="systemContacts_done"]').onuserclick = function(){
					alert("done");
				};
			}
		});

		CallServer.open("getSystemContacts", null, function(contacts){
			overflowPanel.innerHTML = contactsHtml.render({ contacts : contacts });
			overflowPanel.setTop(0);
		});
	};
	SystemContacts = new NonstaticClass(SystemContacts, "Bao.Page.Index.Secondary.SystemContacts", PagePanel.prototype);

	SystemContacts.override({
		title : "邀请朋友",
		tools : [{ urlname : "javascript:void(0);", action : "systemContacts_done" }]
	});

	return SystemContacts.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	Bao.Global
));

Secondary.members(this);
}.call(
	{},
	Bao.Page.Index.Secondary,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.DOM.PagePanel,
	Bao.CallServer
));