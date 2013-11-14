(function(SPP, NonstaticClass, Panel, PagePanel, OverflowPanel, Control, LoadingBar, BatchLoad, Global){
this.Schedule = (function(Calendar, LevelAnchorList, groupingHtml){
	function Grouping(data){
		this.combine(groupingHtml.create({
			dateData : data
		}));

		new LevelAnchorList(data.todos).appendTo(this.find("dd")[0]);
	};
	Grouping = new NonstaticClass(Grouping, null, Panel.prototype);


	function ScheduleContent(selector, calendar){
		var topLi, scheduleContent = this,

			dateTable = calendar.dateTable,

			rect = this.rect(), x = rect.x + this.width() / 2, y = rect.y + 20;

		// 初始化日程信息的滚动效果
		this.attach({
			continuousgesture : function(e){
				return;

				var date = new Date(dateTable.getFocused().get("time", "attr") - 0),
				
					top = scheduleContent.get("top", "css").split("px").join("") - 0 || 0;
					
				// 如果top小于0，说明滚动区域上方还有一部分未显示
				if(top < 0){
					// 如果高度加上top小于父容器高度，说明离开底部
					if(scheduleContent.height() + top <= scheduleContent.parent().height()){
						date.setDate(date.getDate() + 1);
					}
					else {
						var rect = scheduleContent.parent().rect(),

							pointEl = jQun(document.elementFromPoint(rect.left + scheduleContent.width() / 2, rect.top + 20)).between(">li", this);

						// 如果对应日期元素切换（即日期切换），而且是向上滑动
						if(pointEl[0] !== topLi && e.gestureOffsetY < 0){
							topLi = pointEl[0];
							date = new Date(pointEl.get("time", "attr") - 0);
						}
					}
				}
				// 如果滚动区域上方已经全部显示
				else {
					date.setDate(date.getDate() - 1);
				}
				
				dateTable.focus(date);
			},
			clickanchor : function(e){
				e.stopPropagation();
				Global.history.go("todo").fill(e.anchor);
			}
		}, true);
	};
	ScheduleContent = new NonstaticClass(ScheduleContent, null, OverflowPanel.prototype);


	function Schedule(selector, signHtml){
		var batchLoad,
		
			schedule = this, lastData = {},
			
			contentEl = this.find("section ol"),

			calendar = new Calendar(true);

		// 初始化batchload
		batchLoad = new BatchLoad("getSchedules", function(data){
			lastData = {};

			data.schedules.forEach(function(dt){
				var asideEl = calendar.find('li[datestatus][time="' + dt.time + '"] aside');

				lastData[dt.time] = dt;

				if(asideEl.length === 0)
					return;
					
				var asideAttr = asideEl.attributes;

				if(asideAttr.get("todoslength") != null)
					return;
				
				asideEl.innerHTML = signHtml.render(dt);
				asideAttr.set("todoslength", dt.todos.length);
			});
		});

		// 初始化日历
		calendar.appendTo(this.find(">header")[0]);
		calendar.attach({
			shrink : function(){
				contentEl.parent().classList.remove("calendarStretched");
			},
			stretch : function(){
				contentEl.parent().classList.add("calendarStretched");
			}
		});

		calendar.attach({
			focusmonth : function(e){
				batchLoad.setParam("time", e.monthTime);
				batchLoad.callServer();
			},
			focusdate : function(e){
				var targetEl = jQun(e.target), topEl = contentEl.find("li.top"),

					time = targetEl.get("time", "attr");

				if(topEl.length > 0){
					if(time === topEl.get("time", "attr")){
						return;
					}

					topEl.classList.remove("top");
				}

				var date = new Date(time - 0), contentUl = contentEl[0],

					scheduleItemEls = contentEl.find(">li");

				if(scheduleItemEls.length > 0){
					var d = new Date(time - 0),
					
						t = d.setDate(d.getDate() + 1);

					if(jQun(scheduleItemEls[0]).get("time", "attr") == t){
						var dt = lastData[time];

						if(!dt)
							return;

						var el = new Grouping.constructor(lastData[time]);

						el.insertTo(contentUl, 0);
						scheduleItemEls.splice(0, scheduleItemEls.length - 1);
						scheduleItemEls.remove();
						contentEl.set("top", el.height() * -1 + "px", "css");
						return;
					}

					t = d.setDate(d.getDate() - 2);

					if(jQun(scheduleItemEls[scheduleItemEls.length - 1]).get("time", "attr") == t){
						var dt = lastData[time];

						if(!dt)
							return;

						var el = new Grouping.constructor(dt);

						el.appendTo(contentUl, 0);
						scheduleItemEls.splice(0, 1);
						scheduleItemEls.remove();
						return;
					}
				}
				
				contentEl.innerHTML = "";

				for(var i = 0;i < 10;i++){
					if(lastData[date.getTime()]){
						new Grouping.constructor(lastData[date.getTime()]).appendTo(contentUl);
					}
					date.setDate(date.getDate() + 1);
				}

				contentEl.setCSSPropertyValue("top", 0);
			}
		});

		this.attach({
			aftershow : function(){
				calendar.dateTable.focus(new Date());
			}
		});
	
		new ScheduleContent.constructor(contentEl[0], calendar);
	};
	Schedule = new NonstaticClass(Schedule, null, PagePanel.prototype);

	Schedule.override({
		hideBackButton : true,
		title : "MY CALENDAR 日程",
		tools : [
			/*{ urlname : "sendTodo", action : "sendTodo" },*/
			{ urlname : "systemOption", action : "set" }
		]
	});

	Schedule.properties({
		add : function(data){
			this.find("> header > dl").innerHTML = this.html.render(data);
		},
		batchLoad : undefined,
		html : undefined
	});

	return Schedule.constructor;
}(
	Control.Time.Calendar,
	Control.List.LevelAnchorList,
	new jQun.HTML([
		'<li time="{dateData.time}" todoslength="{dateData.todos.length}">',
			'<dt class="whiteFont">',
				'<span class="lightBgColor smallRadius">{dateData.localeDateString}</span>',
			'</dt>',
			'<dd></dd>',
		'</li>'
	].join(""))				
));

this.Project = (function(CallServer, Confirm){
	function Project(selector, html){
		///	<summary>
		///	项目。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		/// <param name="html" type="jQun.HTML">项目html模板</param>
		var project = this,

			batchLoad = new BatchLoad("getProjects", function(data){
				project.add(data);

				if(!this.isEqual("pageIndex", "pageMax"))
					return;
				
				return;

				// 添加空文件夹
				project.addEmptyFolders(1);
				// 添加未解锁的项目
				project.addEmptyFolders(this.getParam("pageSize") - data.projects.length, true);
			});
		
		this.assign({
			html : html,
			batchLoad : batchLoad,
			overflowPanel : new OverflowPanel(this.find(">ul"))
		});

		batchLoad.setParam("pageIndex", 0, 1);
		batchLoad.setParam("pageSize", 10);
		batchLoad.setParam("pageMax", -1);
		batchLoad.setParam("othersOffset", 0);

		this.attach({
			beforeshow : function(){
				project.load(true);
			},
			leaveborder : function(e){
				if(e.direction !== "bottom")
					return;

				project.load();
			},
			userclick : function(e, targetEl){
				if(targetEl.between('figure[status="0"]', this).length > 0){
					Global.history.go("addProject");
					return;
				}

				var el = targetEl.between('figure[status="1"]', this);

				if(el.length > 0){
					Global.history.go("discussion").fill(el.parent().getAttribute("projectid"));
					return;
				}
			},
			longpress : function(e, targetEl){
				var singleProjectEl = targetEl.between(">ul>li", this);

				if(singleProjectEl.length === 0)
					return;

				if(singleProjectEl.find(">figure").getAttribute("status") !== "1")
					return;

				//if(singleProjectEl.getAttribute("creatorid") !== Global.loginUser.id)
					//return;

				var confirm = new Confirm(
					"你想要存档和删除<br/>“ " + singleProjectEl.find("figcaption>span").innerHTML + " ”?",
					[
						{ text : "永久删除", action : "remove", autoClose : true },
						{ text : "存入归档", action : "archving", autoClose : true }
					],
					"projectConfirm"
				);
				
				confirm.attach({ clickbutton : function(e){
					var maskButton = e.maskButton;

					if(maskButton.action === "close")
						return;

					if(maskButton.action === "remove"){
						CallServer.open("removeProject", {
							projectId : singleProjectEl.getAttribute("projectid")
						}, function(){
							singleProjectEl.remove();
						});

						console.log(singleProjectEl.getAttribute("projectid"));
						return;
					}

					if(maskButton.action === "archving"){
						CallServer.open("archiveProject", {
							projectId : singleProjectEl.getAttribute("projectid")
						}, function(){
							singleProjectEl.remove();
						});
						return;
					}
				} });

				confirm.show();
			}
		});
	};
	Project = new NonstaticClass(Project, null, PagePanel.prototype);

	Project.override({
		hideBackButton : true,
		title : "MY PROJECTS 项目",
		tools : [
			{ urlname : "addProject", action : "addProject" },
			{ urlname : "systemOption", action : "set" }
		]
	});

	Project.properties({
		add : function(data){
			///	<summary>
			///	添加数据。
			///	</summary>
			/// <param name="data" type="array">项目数据</param>
			this.html.create(data).appendTo(this.find(">ul")[0]);
		},
		addEmptyFolders : function(_len, _isUnopened){
			///	<summary>
			///	添加未解锁的项目，1次为10个。
			///	</summary>
			var data = [], i = {
				id : -1,
				importantLevel : 0,
				title : "新建项目",
				users : [],
				lastMessage : {
					content : "",
					type : "text"
				},
				unread : 0,
				status : _isUnopened ? -1 : 0,
				color : -1,
				creator : {}
			};

			jQun.forEach(_len == undefined ? this.batchLoad.getParam("pageSize") : _len, function(){
				data.push(i);
			});

			this.add({ projects : data });
		},
		batchLoad : undefined,
		html : undefined,
		load : function(_isRefresh){
			///	<summary>
			///	去服务器取数据，并加载。
			///	</summary>
			/// <param name="_isRefresh" type="boolean">该操作是否为刷新</param>
			var batchLoad = this.batchLoad;

			if(!_isRefresh){
				if(batchLoad.isEqual("pageIndex", "pageMax")){
					// this.addEmptyFolders(10, true);
					return;
				}
			}
			else {
				batchLoad.restoreParams();
				this.find(">ul").innerHTML = "";
				this.overflowPanel.setTop(0);
			}

			batchLoad.callServer();
		},
		overflowPanel : undefined
	});

	return Project.constructor;
}(
	Bao.CallServer,
	Bao.UI.Control.Mask.Confirm
));

this.Partner = (function(Navigator, UserIndexList, InputSelectionList, Validation, CallServer, createGroupEvent){
	function SelectorList(text, _placeholder){
		///	<summary>
		///	选择列表。
		///	</summary>
		/// <param name="text" type="string">标题文字</param>
		/// <param name="_placeholder" type="string">输入框默认文字</param>
		var validation = new Validation(this.find(">header>input"), function(textEl, Validation){
			return Validation.result(textEl.value, "notEmpty");
		}, "组名称不能为空！");

		this.attach({
			clickbutton : function(e){
				if(e.buttonType === "cancel")
					return;

				var inputText = e.inputText;

				if(!validation.validate()){
					e.stopPropagation();
					return;
				}

				var selectorList = this;
				
				CallServer.open("createGroup", {
					users : e.users,
					name : e.inputText
				}, function(data){
					createGroupEvent.trigger(selectorList);
				});
			}
		}, true);
	};
	SelectorList = new NonstaticClass(SelectorList, null, InputSelectionList.prototype);

	function Partner(selector, groupingHtml){
		///	<summary>
		///	拍档。
		///	</summary>
		/// <param name="selector" type="string">元素选择器</param>
		/// <param name="groupingHtml" type="jQun.HTML">分组模板</param>
		var userIndexList, groupPanel,

			partner = this, panelStyle = this.style,

			navigator = new Navigator();


		// 初始化用户列表
		userIndexList = new UserIndexList();

		this.assign({
			groupingHtml : groupingHtml,
			navigator : navigator,
			userIndexList : userIndexList
		});
	
		// 添加navigator
		navigator.appendTo(this.header[0]);

		// 监听事件
		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target), el = targetEl.between(".group button", this);

				// 如果点击的是分组栏上的按钮
				if(el.length > 0){
					// 如果点击的是添加分组
					if(el.get("action", "attr") === "addGroup"){
						new SelectorList.constructor("添加组拍档", "输入组名称").attach({
							creategroup : function(){
								partner.load();
							}
						});
						return;
					}
					
					// 否则点击的是分组按钮
					partner.focus(el.get("groupId", "attr"), el);
				}
			},
			aftershow : function(){
				partner.load();

				Global.titleBar.find('button[action="addPartner"]').onuserclick = function(){
					Global.history.go("systemContacts");
				};
			}
		});

		userIndexList.appendTo(this.section[0]);
	};
	Partner = new NonstaticClass(Partner, null, PagePanel.prototype);

	Partner.override({
		hideBackButton : true,
		title : "MY PARTNERS 拍档",
		tools : [
			{ urlname : "javascript:void(0);", action : "addPartner" },
			{ urlname : "systemOption", action : "set" }
		]
	});

	Partner.properties({
		focus : function(groupId, _groupEl){
			///	<summary>
			///	切换分组。
			///	</summary>
			/// <param name="groupId" type="number">分组的id</param>
			/// <param name="_groupEl" type="jQun.HTMLElementList">该分组元素</param>
			var partner = this, classList;

			// 如果分组元素不存在
			if(!_groupEl){
				_groupEl = this.find('.group button[groupid="' + groupId + '"]');
			}

			classList = _groupEl.classList;
			
			// 如果聚焦的分组已经是当前分组
			if(classList.contains("focused")){
				return;	
			}

			var userIndexList = this.userIndexList;

			// 聚焦当前分组
			this.find('.group button.focused').classList.remove("focused");
			_groupEl.classList.add("focused");
			this.set("top", 0, "css");

			userIndexList.hide();

			// 还没当前分组的数据，那么就去取数据，再进行加载
			CallServer.open("getPartners", { groupId : groupId }, function(data){
				// 渲染数据
				userIndexList.refresh(data);
				userIndexList.show();

				// 防止用户快速切换分组导致数据错误
				if(classList.contains("focused"))
					return;

				partner.focus(groupId, _groupEl);
			});
		},
		groupingHtml : undefined,
		load : function(){
			var partner = this, navigator = this.navigator;

			// 获取分组数据
			CallServer.open("getPartnerGroups", null, function(data){
				var groups = data.groups;
				
				// 添加分组区域
				navigator.content(partner.groupingHtml.render(data));

				if(groups.length === 0)
					return;

				partner.focus(groups[0].id);
			});
		},
		navigator : undefined,
		userIndexList : undefined
	});

	return Partner.constructor;
}(
	Control.Drag.Navigator,
	Control.List.UserIndexList,
	Control.List.InputSelectionList,
	Bao.API.DOM.Validation,
	Bao.CallServer,
	// createGroupEvent
	new jQun.Event("creategroup")
));

this.Tab = (function(focusTabEvent, blurTabEvent){
	function Tab(selector){
		///	<summary>
		///	SPP脚部选项卡。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		/// <param name="itemHtml" type="jQun.HTML">选项卡html模板</param>
		var btnEls, btnClassList, tab = this;

		this.assign({
			btnEls : this.find("button")
		});

		this.attach({
			userclick : function(e){
				var buttonEl = jQun(e.target).between("button", this);

				if(buttonEl.length === 0)
					return;

				if(buttonEl.classList.contains("focused"))
					return;

				tab.blur();
				tab.focus(buttonEl.parent().get("tab", "attr"));
				Global.history.go(buttonEl.parent().get("tab", "attr"));
			}
		});
	};
	Tab = new NonstaticClass(Tab, null, Panel.prototype);

	Tab.properties({
		blur : function(){
			///	<summary>
			///	让选项卡失去焦点。
			///	</summary>
			var focusedEl = this.btnEls.between(".focused", this[0]);

			if(focusedEl.length === 0)
				return;

			focusedEl.classList.remove("focused");
		},
		btnEls : undefined,
		focus : function(name){
			///	<summary>
			///	使指定名称的选项卡聚焦。
			///	</summary>
			/// <param name="name" type="string">选项卡名称</param>
			var buttonEl = this.btnEls.between('[tab="' + name + '"]', this[0]);

			buttonEl.classList.add("focused");
		}
	});

	return Tab.constructor;
}(
	new jQun.Event("focustab")
));

this.Self = (function(Tab, HTML){
	function Self(selector){
		///	<summary>
		///	日程、项目、拍档页。
		///	</summary>
		/// <param name="selector" type="string">对应的元素</param>
		var tab = new Tab("#tab_SPP");

		this.attach({
			beforeshow : function(e){
				tab.blur();
				tab.focus(e.currentPanel.id);
			}
		});
	};
	Self = new NonstaticClass(Self, "Bao.Page.Index.Self", Panel.prototype);

	return Self.constructor;
}(
	this.Tab,
	jQun.HTML
));

SPP.members(this);
}.call(
	{},
	Bao.Page.Index.SPP,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	Bao.API.DOM.PagePanel,
	Bao.API.DOM.OverflowPanel,
	Bao.UI.Control,
	Bao.UI.Control.Wait.LoadingBar,
	Bao.API.Data.BatchLoad,
	Bao.Global
));