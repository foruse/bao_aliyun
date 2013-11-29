(function(Deep, NonstaticClass, StaticClass, PagePanel, Panel, OverflowPanel, TitleBarColor, CallServer){
this.GlobalSearch = (function(OverflowPanel, UserAnchorList, Global, forEach, config){
	function GlobalSearch(selector, groupHtml){
		///	<summary>
		///	全局搜索。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		/// <param name="groupHtml" type="jQun.HTML">分组的html模板</param>
		var globalSearch = this, textEl = this.find(">header input"),
			
			groupPanel = new OverflowPanel(this.find(".globalSearch_content>ul")[0]);

		this.assign({
			groupHtml : groupHtml,
			groupPanel : groupPanel
		});

		this.find(">header").attach({
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between(">aside>button", this).length > 0){
					var val = textEl.value;

					if(val === "")
						return;

					globalSearch.search(val);
					return;
				}

				if(targetEl.between(">nav>button", this).length > 0){
					Global.history.go("systemOption", true);
				}
			}
		});

		groupPanel.attach({
			clickanchor : function(e){
				var group = jQun(e.target).between(">li>dl", this).get("group", "attr");

				e.stopPropagation();

				if(!group){
					return;
				}

				var cfg = config[group];

				Global.history.go(cfg.panel)[cfg.method](e.anchor);
			}
		}, true);
	};
	GlobalSearch = new NonstaticClass(GlobalSearch, "Bao.Page.Index.Deep.GlobalSearch", PagePanel.prototype);

	GlobalSearch.override({
		showTitleBar : false
	});

	GlobalSearch.properties({
		groupHtml : undefined,
		groupPanel : undefined,
		search : function(text){
			///	<summary>
			///	搜索。
			///	</summary>
			/// <param name="text" type="string">需要搜索的文本值</param>
			if(text === "")
				return;

			var globalSearch = this;

			CallServer.open("globalSearch", { search : text }, function(data){
				var groupPanel = globalSearch.groupPanel;

				// 将top设置为0
				groupPanel.setTop(0);
				// 重新渲染分组
				groupPanel.innerHTML = globalSearch.groupHtml.render();

				// 数据渲染
				forEach(data, function(listData, name){
					if(listData.length === 0){
						return;
					}

					var groupContentEl = groupPanel.find('dl[group="' + name + '"]>dd');

					new UserAnchorList(listData).appendTo(groupContentEl[0]);
					groupContentEl.parent().parent().show();
				});
			});
		}
	});

	return GlobalSearch.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	Bao.UI.Control.List.UserAnchorList,
	Bao.Global,
	jQun.forEach,
	// config
	{
		projects : {
			panel : "",
			method : ""
		},
		partners : {
			panel : "businessCard",
			method : "fillUser"
		},
		todo : {
			panel : "",
			method : ""
		},
		comments : {
			panel : "",
			method : ""
		}
	}
));

this.Account = (function(Global, ValidationList, SelectImage, SelectionImageArea){
	function InputPanel(){};
	InputPanel = new NonstaticClass(InputPanel, null, Panel.prototype);

	InputPanel.properties({
		readonly : function(){
			this.find("input").addAttribute();
		},
		writable : function(){
			this.find("input").removeAttribute("readonly");
		}
	});


	function Header(selector){
		var header = this, selectImage = new SelectImage("localPicture");

		this.assign({
			selectImage : selectImage
		});

		selectImage.disable();

		selectImage.attach({
			imageloaded : function(e){
				SelectionImageArea.show();
				SelectionImageArea.loadImage(e.base64, function(src){
					header.newSrc = src;
					header.find(".largeAvatarPanel>img").src = src;
					SelectionImageArea.hide();
				});
			}
		});

		this.attach({
			clickavatar : function(e){
				e.stopPropagation();

				selectImage.show();
			}
		}, true);
	};
	Header = new NonstaticClass(Header, null, Panel.prototype);

	Header.properties({
		getAvatar : function(){
			return this.newSrc;
		},
		newSrc : null,
		selectImage : undefined
	});


	function Section(selector){
	
	};
	Section = new NonstaticClass(Section, null, InputPanel);

	Section.properties({
		getEmail : function(){
			return this.find('dl[desc="email"] input').value;
		},
		getPhoneNumber : function(){
			return this.find('dl[desc="phoneNum"] input').value;
		},
		getPosition : function(){
			return this.find('dl[desc="position"] input').value;
		}
	});


	function Footer(selector){
		var footer = this, validationList = new ValidationList();

		this.assign({
			validationList : validationList
		});

		this.attach({
			userclick : function(e, targetEl){
				var classList = this.classList;

				if(targetEl.between("button", this).length > 0){
					if(classList.contains("editable")){
						targetEl.innerHTML = "修改密码";
						classList.remove("editable");
						return;
					}

					targetEl.innerHTML = "取消修改";
					classList.add("editable");
				}
			}
		});

		// 验证信息
		this.find("dl").forEach(function(parent){
			var parentEl = jQun(parent), inputEl = parentEl.find("input"), vtype = inputEl.get("vtype", "attr");

			validationList.addValidation(parentEl, function(el, Validation){
				if(inputEl.between("input", footer[0]).length > 0){
					if(!footer.classList.contains("editable")){
						return true;
					}
				}

				if(vtype === "rePwd"){
					return inputEl.value === footer.find('dl[desc="editPwd"] input').value;
				}

				return Validation.result(inputEl.value, vtype);
			}, inputEl.getAttribute("errortext"));
		});
	};
	Footer = new NonstaticClass(Footer, null, InputPanel);

	Footer.override({
		readonly : function(){
			InputPanel.readonly.apply(this, arguments);
			this.hide();
		},
		writable : function(){
			InputPanel.writable.apply(this, arguments);
			this.show();
		}
	});

	Footer.properties({
		getPassword : function(){
			return this.classList.contains("editable") ? this.find('dl[desc="rePwd"] input').value : null
		},
		validationList : undefined
	});


	function Account(selector, contentHtml){
		///	<summary>
		///	我的账户。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		/// <param name="contentHtml" type="jQun.HTML">内容的html模板</param>
		var footerEl,
		
			account = this, accountClassList = account.classList;

		this.assign({
			contentHtml : contentHtml
		});

		// 渲染空数据
		footerEl = this.find(">footer");

		// 监听事件
		this.attach({
			beforeshow : function(){
				var titleBar = Global.titleBar, editButtonEl = titleBar.find('button[action="editAccount"]');

				editButtonEl.onuserclick = function(){
					var contentHeader = account.contentHeader,

						contentSection = account.contentSection,
					
						contentFooter = account.contentFooter;

					// 如果点击了编辑按钮
					if(editButtonEl.get("action", "attr") === "editAccount"){
						// 所有input变为可以输入
						contentHeader.selectImage.enable();
						contentSection.writable();
						contentFooter.writable();
						// 编辑按钮变成提交按钮
						editButtonEl.set("action", "submit account", "attr");
						// 修改标题栏的标题
						titleBar.resetTitle("修改账户");
						footerEl.show();
						return;
					}

					if(!contentFooter.validationList.validate())
						return;

					CallServer.open("editAccount", {
						position : contentSection.getPosition(),
						avatar : contentHeader.getAvatar(),
						phoneNum : contentSection.getPhoneNumber(),
						email : contentSection.getEmail(),
						password : contentFooter.getPassword()
					}, function(data){
						Global.loginUser = data;

						account.restore();
					});
				};
			}
		});
	};
	Account = new NonstaticClass(Account, "Bao.Page.Index.Deep.Account", PagePanel.prototype);

	Account.override({
		isNoTraces : true,
		restore : function(){
			var titleBar = Global.titleBar;

			this.innerHTML = this.contentHtml.render(Global.loginUser);

			this.contentHeader = new Header.constructor(this.header[0]);
			this.contentSection = new Section.constructor(this.section[0]);
			this.contentFooter = new Footer.constructor(this.footer[0]);

			titleBar.find('button[action="submit account"]').set("action", "editAccount", "attr");
			// 修改标题栏的标题
			titleBar.resetTitle("我的账户");
		},
		title : "我的账户",
		tools : [
			{ urlname : "javascript:void(0);", action : "editAccount" }
		]
	});

	Account.properties({
		contentHeader : undefined,
		contentHtml : undefined,
		contentFooter : undefined,
		contentSection : undefined
	});

	return Account.constructor;
}(
	Bao.Global,
	Bao.API.DOM.ValidationList,
	Bao.UI.Control.File.SelectImage,
	Bao.UI.Control.File.SelectionImageArea
));

this.QRCode = (function(){
	function QRCode(selector, contentHtml){
		///	<summary>
		///	我的二维码。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		/// <param name="contentHtml" type="jQun.HTML">内容的html模板</param>
		var qrCode = this;

		CallServer.open("myInformation", null, function(data){
			qrCode.innerHTML = contentHtml.render(data);
		});
	};
	QRCode = new NonstaticClass(QRCode, "Bao.Page.Index.Deep.QRCode", PagePanel.prototype);

	QRCode.override({
		title : "我的二维码"
	});

	return QRCode.constructor;
}());

this.TC = (function(){
	function TC(selector){
		new OverflowPanel(this.section);
	};
	TC = new NonstaticClass(TC, "Bao.Page.Index.Deep.TC", PagePanel.prototype);

	TC.override({
		title : "使用条款 和 隐私政策"
	});

	return TC.constructor;
}());

this.AboutBaoPiQi = (function(){
	function AboutBaoPiQi(selector){
		///	<summary>
		///	关于暴脾气。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
	};
	AboutBaoPiQi = new NonstaticClass(AboutBaoPiQi, "Bao.Page.Index.Deep.AboutBaoPiQi", PagePanel.prototype);

	AboutBaoPiQi.override({
		title : "关于暴脾气"
	});

	return AboutBaoPiQi.constructor;
}());

this.Todo = (function(ChatListPanel, OverflowPanel, Global){
	function Todo(selector, infoHtml){
		var chatListPanel, todo = this,
		
			overflowPanel = new OverflowPanel(this.find(">section")[0]);

		chatListPanel = new ChatListPanel("todo", "addCommentForTodo", overflowPanel);

		this.assign({
			chatListPanel : chatListPanel,
			infoHtml : infoHtml
		});

		chatListPanel.appendTo(overflowPanel.find(">figure")[0]);

		this.find(">section>header").attach({
			userclick : function(e, targetEl){
				if(targetEl.between("dt>button").length > 0){
					CallServer.open("todoCompleted", { id : todo.id }, function(data){
						Global.history.go("todoList");
					}, true);
					return;
				}
			}
		});
	};
	Todo = new NonstaticClass(Todo, "Bao.Page.Index", PagePanel.prototype);

	Todo.override({
		title : "To Do",
		titleBarColor : TitleBarColor.Project
	});

	Todo.properties({
		chatListPanel : undefined,
		fill : function(id){
			var todo = this;
		
			CallServer.open("getTodo", { id : id }, function(data){
				var figureEl = todo.find(">section>figure");

				todo.find(">section>header").innerHTML = todo.infoHtml.render(data);

				todo.chatListPanel.reset(id, data.color);
			});

			this.id = id;
		},
		id : -1,
		infoHtml : undefined
	});

	return Todo.constructor;
}(
	Bao.UI.Control.Chat.ChatListPanel,
	Bao.API.DOM.OverflowPanel,
	Bao.Global
));

this.SendTodo = (function(UserManagementList, Validation, Attachment, Alert, Global, validationHandle){
	function AttamentArea(selector, attachmentHtml){
		var all = [], ul = this.find(">ul")[0];

		this.assign({
			all : all
		});

		new Attachment().appendTo(this.find('>footer')[0]);

		this.attach({
			attachmentcompleted : function(e){
				var attachment = { type : e.attachmentType, src : e.attachmentSrc };

				attachmentHtml.create(attachment).appendTo(ul);
				all.push(attachment);
			}
		});
	};
	AttamentArea = new NonstaticClass(AttamentArea, null, Panel.prototype);

	AttamentArea.properties({
		all : undefined,
		clear : function(){
			this.find(">ul>li").remove();
			this.all.splice(0);
		}
	});


	function SendTodo(selector, attachmentHtml){
		var titleValidation, dateValidation, userManagementList, attachmentArea,
		
			sendTodo = this, titleBar = Global.titleBar, isBack = true;


		titleValidation = new Validation(this.find('li[desc="title"]>input'), validationHandle, "标题不能为空！");

		dateValidation = new Validation(this.find('li[desc="endDate"]>input[type="text"]'), validationHandle, "日期不能为空！");
			
		userManagementList = new UserManagementList("请选择该To Do的执行者");

		attachmentArea = new AttamentArea.constructor(this.find('>section[desc="attachment"]')[0], attachmentHtml);

		this.assign({
			attachmentArea : attachmentArea,
			dateValidation : dateValidation,
			titleValidation : titleValidation,
			userManagementList : userManagementList
		});

		userManagementList.appendTo(this.header[0]);
		userManagementList.setMaxLength(1);

		// 提交按钮绑定事件
		this.attach({
			afterhide : function(){
				if(!isBack){
					isBack = true;
					Global.history.clear();
				}
			},
			beforeshow : function(e){
				titleBar.find('button[action="sendTodoCompleted"]').onuserclick = function(){
					if(!titleValidation.validate())
						return;

					if(!dateValidation.validate())
						return;

					var users = userManagementList.getAllUsers();

					if(users.length === 0){
						new Alert("请至少选择一位用户才能发送To Do！").show();
						return;
					}

					CallServer.open("sendTodo", {
						attachments : attachmentArea.all,
						title : titleValidation.validationEl.value,
						date : sendTodo.endDate.getTime(),
						remind : sendTodo.remind ? 1 : 0,
						desc : sendTodo.find("textarea").value,
						userId : users[0],
						projectId : sendTodo.projectId
					}, function(data){
						isBack = false;
						Global.history.go("todo").fill(data.id);
					});
				};
			},
			userclick : function(e, targetEl){
				if(targetEl.between('section[desc="remind"] button>span', this).length > 0){
					var classList = targetEl.classList;

					sendTodo.remind = !classList.contains("reminded");
					classList.toggle("reminded");
					return;
				}
			}
		});

		// 绑定日期控件事件
		this.find('li>input[type="date"]').attach({
			change : function(e){
				var endDate = this.valueAsDate;

				this.previousElementSibling.value = endDate.toLocaleDateString();
			}
		});

		new OverflowPanel(this);
	};
	SendTodo = new NonstaticClass(SendTodo, "Bao.Page.Index.Deep.SendTodo", PagePanel.prototype);

	SendTodo.override({
		isNoTraces : true,
		restore : function(isBack){
			if(isBack){
				return;
			}

			var dateValidation = this.dateValidation;

			this.userManagementList.clearUsers();
			this.find('li[desc="title"]>input').value = "";
			// 设置初始时间
			dateValidation.validationEl.value = this.endDate.toLocaleDateString();
			this.find('section[desc="remind"] button>span').classList.remove("reminded");
			this.remind = false;
			this.find("textarea").value = "";
			this.attachmentArea.clear();
		},
		title : "发送 To Do",
		titleBarColor : TitleBarColor.Project,
		tools : [
			{ urlname : "javascript:void(0);", action : "sendTodoCompleted" }
		]
	});

	SendTodo.properties({
		attachmentArea : undefined,
		dateValidation : undefined,
		endDate : new Date(),
		projectId : -1,
		// 完成时候是否提醒
		remind : false,
		resetProjectId : function(id){
			this.projectId = id;
			this.userManagementList.resetParamsOfGetPartners({projectId : id});
		},
		selectUser : function(userData){
			var sendTodo = this;

			this.userManagementList.userList.addUsers([userData]);
		},
		titleValidation : undefined,
		userManagementList : undefined
	});

	return SendTodo.constructor;
}(
	Bao.UI.Control.List.UserManagementList,
	Bao.API.DOM.Validation,
	Bao.UI.Control.File.Attachment,
	Bao.UI.Control.Mask.Alert,
	Bao.Global,
	// validationHandle
	function(inputEl){
		return jQun.Validation.result(inputEl.value, inputEl.getAttribute("vtype"));
	}
));

this.Archive = (function(AnchorList, Global){
	function Archive(selector){
		var archive = this, overflowPanel = new OverflowPanel(this.find(">section")[0]);

		this.attach({
			clickanchor : function(e){
				e.stopPropagation();
				Global.history.go("archivedProjectView").fill(e.anchor);
			},
			beforeshow : function(){
				CallServer.open("getAllArchives", null, function(archives){
					archives.forEach(function(archive){
						archive.key = archive.id;
						archive.desc = new Date(archive.completeDate).toLocaleDateString();
					});
			
					overflowPanel.innerHTML = "";
					overflowPanel.setTop(0);
					new AnchorList(archives, true).appendTo(overflowPanel[0]);

					archives.forEach(function(archive){
						overflowPanel.find('li[key="' + archive.id + '"]').classList.add("projectColor_" + archive.color);
					});
				});
			}
		}, true);
	};
	Archive = new NonstaticClass(Archive, "Bao.Page.Index.Deep.Archive", PagePanel.prototype);

	Archive.override({
		title : "归档"
	});

	return Archive.constructor;
}(
	Bao.UI.Control.List.AnchorList,
	Bao.Global
));

this.ArchivedProjectView = (function(AnchorList, Panel){
	function TodoContent(contentHtml){
		this.assign({
			contentHtml : contentHtml
		});
	};
	TodoContent = new NonstaticClass(TodoContent);

	TodoContent.properties({
		contentHtml : undefined,
		create : function(id){
			var dt;

			this.data.every(function(d){
				if(d.id == id){
					dt = d;
					return false;
				}

				return true;
			});

			return this.contentHtml.create(dt || {});
		},
		data : undefined,
		resetData : function(data){
			this.data = data;
		}
	});


	function ArchivedProjectView(selector, attachmentsHtml, todoContentHtml){
		var archivedProjectView = this,
		
			todoContent = new TodoContent.constructor(todoContentHtml);

		this.assign({
			attachmentsHtml : attachmentsHtml,
			todoContent : todoContent
		});

		this.attach({
			clickanchor : function(e){
				var expendEl = archivedProjectView.find('li[key="' + e.anchor + '"]'),

					classList = expendEl.classList;

				e.stopPropagation();

				if(classList.contains("expend")){
					expendEl.find(">dl").remove();
					classList.remove("expend");
					return;
				}

				var el = archivedProjectView.find("li.expend");

				if(el.length > 0){
					el.find(">dl").remove();
					el.classList.remove("expend");
				}

				todoContent.create(e.anchor).appendTo(expendEl[0]);
				classList.add("expend");
			}
		}, true);

		new OverflowPanel(this.header.find(">ul"));
	};
	ArchivedProjectView = new NonstaticClass(ArchivedProjectView, "Bao.Page.Deep.ArchivedProjectView", PagePanel.prototype);

	ArchivedProjectView.override({
		title : "查看归档",
		titleBarColor : TitleBarColor.Project
	});

	ArchivedProjectView.properties({
		attachmentsHtml : undefined,
		fill : function(id){
			var archiveProjectView = this;

			CallServer.open("getArchivedProject", { id : id }, function(data){
				var anchorList, anchorListData = [],
					
					sectionEl = archiveProjectView.section, todoList = data.todoList;

				archiveProjectView.todoContent.resetData(todoList);

				todoList.forEach(function(todo){
					var t = this({}, todo);

					this(t, {
						key : todo.id,
						desc : new Date(todo.endTime).toLocaleDateString()
					});

					anchorListData.push(t);
				}, jQun.set);

				archiveProjectView.header.find("ul").innerHTML = archiveProjectView.attachmentsHtml.render(data.project);

				sectionEl.innerHTML = "";
				anchorList = new AnchorList(anchorListData, true);

				anchorList.resetPlaceholder("此归档没有任何Todo");
				anchorList.appendTo(sectionEl[0]);
				new OverflowPanel(anchorList);
			});
		},
		todoContent : undefined
	});

	return ArchivedProjectView.constructor;
}(
	Bao.UI.Control.List.AnchorList,
	Bao.API.DOM.Panel
));

this.ProjectManagement = (function(UserManagementList, AnchorList, Global, Confirm, anchorListData){
	function ProjectManagement(selector){
		var projectManagement = this,
		
			anchorList = new AnchorList(anchorListData),
			
			userManagementList = new UserManagementList("选择成员").appendTo(this.find(">header")[0]);

		this.assign({
			userManagementList : userManagementList
		});

		this.attach({
			beforeshow : function(){
				Global.titleBar.find('button[action="projectManagement_done"]').onuserclick = function(){
					CallServer.open("editProjectInfo", {
						projectId : projectManagement.id,
						userIds : userManagementList.userList.getAllUsers()
					}, function(){
						Global.history.go("singleProject").fill(projectManagement.id);
					});
				};
			},
			userclick : function(e, targetEl){
				if(targetEl.between(">footer>button:first-child", this).length > 0){
					new Confirm("确定将此项目归档吗？").attach({
						clickbutton : function(e){
							if(e.maskButton.action !== "ok")
								return;

							var projectId = projectManagement.id;

							CallServer.open("archiveProject", {
								id : projectId
							}, function(){
								var history = Global.history;

								history.go("archivedProjectView").fill(projectId);
								history.clear("projectManagement");
								history.clear("discussion");
							});
						}
					}).show();
					return;
				}

				if(targetEl.between(">footer>button:last-child", this).length > 0){
					new Confirm("确定将此项目删除吗？").attach({
						clickbutton : function(e){
							if(e.maskButton.action !== "ok")
								return;

							CallServer.open("removeProject", {
								id : projectManagement.id
							}, function(){
								Global.history.go("project");
							});
						}
					}).show();

					return;
				}
			},
			selectusers : function(){
				CallServer.open("editProjectInfo", {
					projectId : projectManagement.id,
					userIds : userManagementList.userList.getAllUsers()
				});
			}
		});

		anchorList.attach({
			clickanchor : function(e){
				var anchor = e.anchor;

				e.stopPropagation();

				if(anchor === "sendTodo"){
					Global.history.go(anchor).resetProjectId(projectManagement.id);
					return;
				}
			}
		}, true);

		anchorList.appendTo(this.find(">section")[0]);
	};
	ProjectManagement = new NonstaticClass(ProjectManagement, "Bao.Page.Index.Deep.ProjectManagement", PagePanel.prototype);

	ProjectManagement.override({
		title : "项目管理",
		titleBarColor : TitleBarColor.Project,
		tools : [{ urlname : "javascript:void(0);", action : "projectManagement_done" }]
	});

	ProjectManagement.properties({
		fill : function(id){
			var projectManagement = this;

			CallServer.open("getSingleProject", { id : id }, function(data){
				var userManagementList = projectManagement.userManagementList;
				
				userManagementList.restore();
				userManagementList.userList.addUsers(data.users);

				Global.titleBar.resetTitle("项目管理：" + data.title);
				projectManagement.id = id;
			});
		},
		id : -1,
		userManagementList : undefined
	});

	return ProjectManagement.constructor;
}(
	Bao.UI.Control.List.UserManagementList,
	Bao.UI.Control.List.AnchorList,
	Bao.Global,
	Bao.UI.Control.Mask.Confirm,
	// anchorListData
	[
		{ title : "发送 To Do", key : "sendTodo" } //,
		// { title : "搜索记录", key : "" },
		// { title : "项目二维码", key : "qrCode" }
	]
));

this.Report = (function(ChatList, Message, Confirm, forEach, reportHtml){
	function Single(data){
		var single = this, message = new Message(data.message);

		this.combine(reportHtml.create(data));

		message.appendTo(this.find("figure")[0]);

		this.attach({
			longpress : function(e){
				e.stopPropagation();
			}
		}, true);

		this.footer.attach({
			userclick : function(e, targetEl){
				var btnEl = targetEl.between(">button", this);

				if(btnEl.length > 0){
					var isDel = btnEl.getAttribute("action") === "del",
					
						confirm = new Confirm("确定" + (isDel ? "删除" : "忽略") + "此条信息吗？");

					confirm.attach({
						clickbutton : function(e){
							var buttonAction = e.maskButton.action; 

							if(buttonAction !== "ok")
								return;

							CallServer.open(
								(isDel ? "delete" : "ignore") + "Report",
								{ messageId : data.message.id },
								function(){
									single.remove();
								}
							);
						}
					});

					confirm.show();
					return;
				}
			}
		});
	};
	Single = new NonstaticClass(Single, null, Panel.prototype);


	function Report(selector){
		var report = this, overflowEl = new OverflowPanel(report.find(">ul"));

		this.attach({
			beforeshow : function(){
				overflowEl.innerHTML = "";
				overflowEl.setTop(0);

				CallServer.open("getReportedInfo", null, function(data){
					forEach(data, function(dt){
						new Single.constructor(dt).appendTo(overflowEl[0]);
					});
				});
			}
		});
	};
	Report = new NonstaticClass(Report, "Bao.Page.Index.Deep.Report", PagePanel.prototype);

	Report.override({
		title : "举报信息"
	});

	return Report.constructor;
}(
	Bao.UI.Control.Chat.ChatList,
	Bao.UI.Control.Chat.Message,
	Bao.UI.Control.Mask.Confirm,
	jQun.forEach,
	// reportHtml
	new jQun.HTML([
		'<li>',
			'<dl class="largeRadius lightBdColor">',
				'<dt class="lightBdColor onlyBorderBottom">',
					'举报人：',
					'<a class="normalAvatarPanel" userid="{reporter.id}">',
						'<img src="{reporter.avatar}" />',
					'</a>',
					'<strong>{reporter.name}</strong>',
					'<span class="grayFont">{reporter.position}</span>',
				'</dt>',
				'<dd>',
					'<p>',
						'被举报人：<span>{message.poster.name}</span>',
					'</p>',
					'<p>',
						'被举报消息来源：<span>{source}</span>',
					'</p>',
					'<p>',
						'被举报时间：<span>{time}</span>',
					'</p>',
					'<figure></figure>',
				'</dd>',
			'</dl>',
			'<footer class="whiteFont">',
				'<button class="smallRadius" action="del">删除</button>',
				'<button class="smallRadius" action="ignore">忽略</button>',
			'</footer>',
		'</li>'
	].join(""))
));


Deep.members(this);
}.call(
	{},
	Bao.Page.Index.Deep,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.DOM.PagePanel,
	Bao.API.DOM.Panel,
	Bao.API.DOM.OverflowPanel,
	Bao.API.DOM.TitleBarColor,
	Bao.CallServer
));