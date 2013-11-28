(function(Secondary, NonstaticClass, StaticClass, Panel, PagePanel, CallServer, TitleBarColor){
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
			},
			"标题不能为空！"
		);
		colorValidation = new Validation(
			this.find('section[desc="color"]'),
			function(colorEl){
				return colorEl.find("button.selected").length !== 0;
			},
			"请选择项目颜色！"
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
		titleBarColor : TitleBarColor.project,
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

this.BusinessCard = (function(Global, Permission, Confirm, Switch, SwitchStatus, clickAvatarEvent){
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
		var businessCard = this, swt = new Switch();

		this.assign({
			userInfoHtml : userInfoHtml
		});

		swt.appendTo(this.find('li[action="authority"]>aside')[0]);

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

		swt.attach({
			statuschanged : function(e){
				CallServer.open(
					e.status === SwitchStatus.On ? "assignPermissions" : "removePermissions",
					{ id : businessCard.userId },
					function(){}
				);
			}
		});
	};
	BusinessCard = new NonstaticClass(BusinessCard, "Bao.Page.Index.Secondary.BusinessCard", PagePanel.prototype);

	BusinessCard.override({
		isNoTraces : true,
		restore : function(){
			this.find(">section>dl").innerHTML = "";
		},
		title : "个人名片",
		titleBarColor : TitleBarColor.Partner
	});

	BusinessCard.properties({
		fillUser : function(id){
			///	<summary>
			///	填充用户。
			///	</summary>
			/// <param name="id" type="string">用户id</param>
			var businessCard = this;

			CallServer.open("getUser", { id : id }, function(data){
				if(data.permission === Permission.Creator){
					businessCard.setAttribute("creator", "");
				}
				else {
					businessCard.removeAttribute("creator");
				}

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
	Bao.Permission,
	Bao.UI.Control.Mask.Confirm,
	Bao.UI.Control.Drag.Switch,
	Bao.UI.Control.Drag.SwitchStatus,
	// clickAvatarEvent
	new jQun.Event("clickavatar", function(){
		this.attachTo("*");
	})
));

this.SystemOption = (function(AnchorList, Global, localStorage, anchorData){
	function Header(selector){
		this.attach({
			userclick : function(e, targetEl){
				if(targetEl.between(">button", this).length > 0){
					Global.history.go("report");
					return;
				}
			}
		});
	};
	Header = new NonstaticClass(Header, null, Panel.prototype);

	Header.properties({
		recall : function(){
			var header = this;

			CallServer.open("getCountOfReports", null, function(data){
				header.setCount(data.count);
			});
		},
		setCount : function(count){
			var countEl = this.find(">button>span");

			countEl.setAttribute("count", count);
			countEl.innerHTML = count;
		}
	});


	function SystemOption(selector){
		///	<summary>
		///	系统项。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		var header = new Header.constructor(this.header);

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
			},
			beforeshow : function(){
				header.recall();
			}
		});
	};
	SystemOption = new NonstaticClass(SystemOption, "Bao.Page.Index.Secondary.SystemOption", PagePanel.prototype);

	SystemOption.override({
		title : "系统选项"
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
		titleBarColor : TitleBarColor.Partner,
		tools : [{ urlname : "javascript:void(0);", action : "systemContacts_done" }]
	});

	return SystemContacts.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	Bao.Global
));

this.Invitation = (function(ValidationList, OverflowPanel, Global, Mask, Validation){
	function InputValidationList(inputs){
		///	<summary>
		///	所有email输入验证。
		///	</summary>
		/// <param name="inputs" type="array">所有的input</param>
		inputs.forEach(function(input){
			this.addValidation(input);
		}, this);
	};
	InputValidationList = new NonstaticClass(InputValidationList, null, ValidationList.prototype);

	InputValidationList.override({
		addValidation : function(input){
			///	<summary>
			///	添加验证。
			///	</summary>
			/// <param name="inputs" type="element">input</param>
			ValidationList.prototype.addValidation.call(this, jQun(input), function(inputEl, Validation){
				var value = inputEl.value;

				if(Validation.result(value, "empty")){
					return true;
				}

				return Validation.result(value, "email");
			}, function(){
				return "邮箱错误：" + input.value;
			});
		}
	});

	InputValidationList.properties({
		getEmptyLength : function(){
			///	<summary>
			///	获取空文本的input数量。
			///	</summary>
			var length = this.length;
			
			this.forEach(function(validation){
				if(!Validation.result(validation.validationEl.value, "empty"))
					length--;
			});

			return length;
		}
	});


	function Invitation(selector, textHtml){
		///	<summary>
		///	邀请团队页面。
		///	</summary>
		/// <param name="selector" type="string">对应元素选择器</param>
		/// <param name="textHtml" type="jQun.HTML">文本模板</param>
		var inputEls, inputValidationList, ulEl = this.find(">ul");

		this.attach({
			userclick : function(e, targetEl){
				// 如果点击的是 文本框
				if(inputEls.contains(e.target)){
					// 如果未输入的文本框的数量小于2
					if(inputValidationList.getEmptyLength() < 2){
						// 创建新的文本区域
						var el = textHtml.create({ length : 1 }), newInput = el.find(">input")[0];

						el.appendTo(ulEl[0]);
						inputEls.push(newInput);
						inputValidationList.addValidation(newInput);
					}
					return;
				}
			},
			beforeshow : function(){
				ulEl.innerHTML = textHtml.render({ length : 5 });
				inputEls = ulEl.find("input");
				inputValidationList = new InputValidationList.constructor(inputEls);
			},
			aftershow : function(){
				// 如果点击的 邀请 按钮
				Global.titleBar.find('>ul button').attach({
					userclick : function(){
						if(!inputValidationList.validate())
							return;

						var emails = [];

						inputEls.forEach(function(input){
							var value = input.value;

							if(!value)
								return;

							emails.push(value);
						});

						if(emails.length === 0)
							return;

						CallServer.open("invitation", { emails : emails.join(",") }, function(data){
							if(data.status === -1){
								new Mask.Alert(data.error).show();

								return;
							}

							var alert = new Mask.Alert("已成功发送邀请函！");

							alert.attach({
								clickbutton : function(){
									Global.history.go("partner");
								}
							});

							alert.show();
						}, true);
					}
				});
			}
		});

		new OverflowPanel(ulEl[0]);
	};
	Invitation = new NonstaticClass(Invitation, "Bao.Page.Index.Secondary.Invitation", PagePanel.prototype);

	Invitation.override({
		title : "邀请拍档",
		titleBarColor : TitleBarColor.Partner,
		tools : [
			{ urlname : "javascript:void(0);", action : "invite submit" }
		]
	});

	return Invitation.constructor;
}(
	Bao.API.DOM.ValidationList,
	Bao.API.DOM.OverflowPanel,
	Bao.Global,
	Bao.UI.Control.Mask,
	jQun.Validation
));

Secondary.members(this);
}.call(
	{},
	Bao.Page.Index.Secondary,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.DOM.Panel,
	Bao.API.DOM.PagePanel,
	Bao.CallServer,
	Bao.API.DOM.TitleBarColor
));