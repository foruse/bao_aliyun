(function(List, NonstaticClass, Panel, HTML){
this.AnchorList = (function(Global, anchorListHtml, clickAnchorEvent){
	function AnchorList(listData, _hasDescription){
		///	<summary>
		///	连接列表。
		///	</summary>
		/// <param name="listData" type="array">列表数据</param>
		/// <param name="_hasDescription" type="boolean">是否应该有描述</param>
		this.combine(anchorListHtml.create({
			listData : listData,
			descriptstatus : _hasDescription ? "show" : "hide"
		}));

		this.attach({
			userclick : function(e){
				var anchorEl = jQun(e.target).between(">ul>li", this);

				if(anchorEl.length === 0)
					return;

				clickAnchorEvent.setEventAttrs({
					anchor : anchorEl.get("key", "attr")
				});
				clickAnchorEvent.trigger(anchorEl[0]);
			},
			clickanchor : function(e){
				Global.history.go(e.anchor);
			}
		});
	};
	AnchorList = new NonstaticClass(AnchorList, "Bao.UI.Control.List.AnchorList", Panel.prototype);

	AnchorList.properties({
		resetPlaceholder : function(placeHolder){
			this.find(">p").innerHTML = placeHolder;
		}
	});

	return AnchorList.constructor;
}(
	Bao.Global,
	// anchorListHtml
	new HTML([
		'<div class="anchorList" descriptstatus="{descriptstatus}">',
			'<ul class="themeBdColor normalRadius">',
				'@for(listData ->> data){',
					'<li class="lightBdColor onlyBorderBottom inlineBlock" key="{data.key}" extra={?~data.extra}>',
						'<nav>',
							'<aside>',
								'<dl>',
									'<dt>',
										'<span>{?~data.title}</span>',
										'<small>{?~data.time}</small>',
									'</dt>',
									'<dd class="grayFont">{?~data.desc}</dd>',
								'</dl>',
							'</aside>',
							'<p>',
								'<a href="javascript:void(0);"></a>',
							'</p>',
						'</nav>',
					'</li>',
				'}',
			'</ul>',
			'<p class="lightBdColor normalRadius grayFont">空列表</p>',
		'</div>'
	].join("")),
	// clickAnchorEvent
	new jQun.Event("clickanchor")
));

this.UserAnchorList = (function(AnchorList, forEach, avatarHtml){
	function UserAnchorList(listData){
		///	<summary>
		///	用户连接列表。
		///	</summary>
		/// <param name="listData" type="array">列表数据</param>
		this.classList.add("userAnchorList");
		this.set("descriptstatus", "show", "attr");

		forEach(listData, function(dt){
			var asideEl = this.find('li[key="' + dt.key + '"] aside');

			asideEl.classList.add("inlineBlock");
			avatarHtml.create(dt).insertTo(asideEl[0], 0);
		}, this);
	};
	UserAnchorList = new NonstaticClass(UserAnchorList, "Bao.UI.Control.List.UserAnchorList", AnchorList.prototype);

	return UserAnchorList.constructor;
}(
	this.AnchorList,
	jQun.forEach,
	// avatarHtml
	new HTML([
		'<p class="normalAvatarPanel">',
			'<img src="{avatar}" />',
		'</p>'
	].join(""))
));

this.LevelAnchorList = (function(AnchorList, levelHtml){
	function LevelAnchorList(listData){
		///	<summary>
		///	具有等级标识的连接列表。
		///	</summary>
		var anchorList = this;

		this.classList.add("levelAnchorList");
		this.set("descriptstatus", "show", "attr");

		listData.forEach(function(project){
			var descEl = anchorList.find('li[key="' + project.id + '"] dd');

			if(descEl.length === 0)
				return;

			descEl.innerHTML = levelHtml.render(project);
		});
	};
	LevelAnchorList = new NonstaticClass(LevelAnchorList, "Bao.UI.Control.List.LevelAnchorList", AnchorList.prototype);

	return LevelAnchorList.constructor;
}(
	this.AnchorList,
	// levelHtml
	new HTML([
		'<ul class="anchorList_level inlineBlock">',
			'@for(level){',
				'<li></li>',
			'}',
		'</ul>'
	].join(""))
));

this.UserList = (function(panelHtml, userListHtml){
	function UserList(_avatarSize){
		///	<summary>
		///	用户列表。
		///	</summary>
		this.assign({
			avatarSize : _avatarSize
		});
		
		this.combine(panelHtml.create());
		this.classList.add(this.avatarSize + "Avatar");
	};
	UserList = new NonstaticClass(UserList, "Bao.UI.Control.UserList", Panel.prototype);

	UserList.properties({
		addUsers : function(users){
			users = users.concat([]);

			for(var i = 0;i < users.length;i++){
				var user = users[i];

				if(this.find('figure > p[userid="' + user.id + '"]').length === 0){
					continue;
				}

				users.splice(i--, 1);
			};

			userListHtml.create({
				users : users,
				avatarSize : this.avatarSize
			}).appendTo(this[0]);
		},
		avatarSize : "large",
		clearUsers : function(){
			this.find(">figure").remove();
		},
		delUser : function(id){
			this.find('>figure > p[userid="' + id + '"]').parent().remove();
		},
		getAllUsers : function(){
			var users = [];

			this.find(">figure>p").forEach(function(p){
				users.push(jQun(p).get("userid", "attr"));
			});

			return users;
		},
		refresh : function(users){
			this.innerHTML = "";
			this.addUsers(users);

			return this;
		}
	});

	return UserList.constructor;
}(
	// panelHtml
	new HTML('<div class="userList inlineBlock"></div>'),
	// userListHtml
	new HTML([
		'@for(users ->> u){',
			'<figure>',
				'<p class="{avatarSize}AvatarPanel" userid="{u.id}">',
					'<img src="{u.avatar}" />',
				'</p>',
				'<figcaption title="{u.name}">{u.name}</figcaption>',
			'</figure>',
		'}'
	].join(""))
));

this.UserIndexList = (function(OverflowPanel, UserList, panelHtml, listHtml){
	function UserIndexList(){
		///	<summary>
		///	用户索引列表。
		///	</summary>
		var listStyle, userIndexList = this;

		this.combine(panelHtml.create());
		listStyle = this.style;

		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target),
					el = targetEl.between('aside li', this);

				if(el.length > 0){
					if(el.get("idx", "attr") === "-1")
						return;

					listStyle.top = (
						userIndexList.rect("top") - 
						userIndexList.find('> ol > [letter="' + el.get("letter", "attr") + '"]').rect("top")
					) + "px";
				}
			}
		});

		new OverflowPanel(this[0]);
	};
	UserIndexList = new NonstaticClass(UserIndexList, "Bao.UI.Control.UserIndexList", Panel.prototype);

	UserIndexList.properties({
		refresh : function(data, _avatarSize){
			///	<summary>
			///	渲染数据。
			///	</summary>
			/// <param name="data" type="*">用户数据</param>
			/// <param name="_avatarSize" type="string">头像大小</param>
			var userIndexList = this;

			this.innerHTML = listHtml.render(data);
			this.set("top", "0", "css");

			data.userListCollection.forEach(function(userListData){
				new UserList(_avatarSize).refresh(userListData.users).appendTo(
					this.find('li[letter="' + userListData.firstLetter + '"] dd')[0]
				);
			}, this);

			return this;
		}
	});

	return UserIndexList.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	this.UserList,
	// panelHtml
	new HTML([
		'<div class="userIndexList"></div>'
	].join("")),
	// listHtml
	new HTML([
		'<ol>',
			'@for(userListCollection ->> userList){',
				'<li letter="{userList.firstLetter}">',
					'<dl>',
						'<dt>',
							'<strong>{userList.firstLetter}</strong>',
						'</dt>',
						'<dd></dd>',
					'</dl>',
				'</li>',
			'}',
		'</ol>',
		'<aside>',
			'<ol>',
				'@for(letters ->> idx, letter){',
					'<li letter="{letter}" idx="{idx}">{letter}</li>',
				'}',
			'</ol>',
		'</aside>',
	].join(""))
));

this.UserSelectionList = (function(UserIndexList, CallServer, Global, selectUsersHtml, clickButtonEvent){
	function UserSelectionList(text, _paramsOfGetPartners){
		///	<summary>
		///	用户选择列表。
		///	</summary>
		/// <param name="text" type="string">选择信息的文本</param>
		var userSelectionList = this, mask = Global.mask,
		
			userIndexList = new UserIndexList();

		this.assign({
			userIndexList : userIndexList
		});

		this.combine(selectUsersHtml.create({ text : text }));

		// 将userIndexList添加至fillEl
		userIndexList.appendTo(this.find(">article")[0]);
		
		userIndexList.attach({
			clickavatar : function(e, targetEl){
				var el = targetEl.between(">ol figure>p", this);

				if(el.length > 0){
					userSelectionList.toggleUser(el.getAttribute("userid"));
				}

				e.stopPropagation();
			}
		});

		this.attach({
			userclick : function(e, targetEl){
				if(targetEl.between(">*>button", this).length > 0){
					var users = [];

					userIndexList.find(">ol figure>p.selected").forEach(function(element){
						var el = jQun(element), parentEl = el.parent();

						users.push({
							id : el.get("userid", "attr"),
							avatar : parentEl.find("img").src,
							name : parentEl.find(">figcaption").innerHTML
						});
					});

					clickButtonEvent.setEventAttrs({
						users : users,
						buttonType : targetEl.get("action", "attr")
					});
					clickButtonEvent.trigger(targetEl[0]);
				}
			},
			clickbutton : function(e){
				// 隐藏遮罩
				mask.hide();
			}
		});

		CallServer.open("getPartners", _paramsOfGetPartners || { groupId : -1 }, function(data){
			userIndexList.refresh(data, "normal");
			// 填充遮罩内容
			mask.fillBody(userSelectionList[0]);
			// 显示遮罩
			mask.show("userSelectionList " + text);
		});
	};
	UserSelectionList = new NonstaticClass(UserSelectionList, null, Panel.prototype);

	UserSelectionList.properties({
		toggleUser : function(id){
			this.userIndexList.find('>ol figure>p[userid="' + id + '"]').classList.toggle("selected");
		},
		userIndexList : undefined
	});
	
	return UserSelectionList.constructor;
}(
	this.UserIndexList,
	Bao.CallServer,
	Bao.Global,
	// selectUsersHtml
	new HTML([
		'<div class="userSelectionList">',
			'<header>',
				'<span>{text}</span>',
				'<button action="cancel"></button>',
			'</header>',
			'<article></article>',
			'<footer>',
				'<button action="ok"></button>',
			'</footer>',
		'</div>'
	].join("")),
	// clickButtonEvent
	new jQun.Event("clickbutton")
));

this.InputSelectionList = (function(UserSelectionList, Global, inputHtml){
	function InputSelectionList(text, _placeholder){
		var inputEl = inputHtml.create();

		this.assign({
			inputEl : inputEl
		});

		this.classList.add("inputSelectionList");
		inputEl.insertTo(this.find(">header")[0], 0);

		if(_placeholder){
			inputEl.set("placeholder", _placeholder, "attr");
		}

		this.attach({
			clickbutton : function(e){
				e.inputText = inputEl.value;
			}
		}, true);
	};
	InputSelectionList = new NonstaticClass(InputSelectionList, "Bao.UI.Control.List.InputSelectionList", UserSelectionList.prototype);

	InputSelectionList.properties({
		inputEl : undefined
	});

	return InputSelectionList.constructor;
}(
	this.UserSelectionList,
	Bao.Global,
	// inputHtml
	new HTML('<input class="normalRadius" type="text" placeholder="请输入名称" />')
));

this.UserManagementList = (function(UserList, UserSelectionList, Alert, OverflowPanel, selecetUsersEvent, listHtml){
	function UserManagementList(text, _userData){
		///	<summary>
		///	用户管理列表。
		///	</summary>
		/// <param name="text" type="string">标题</param>
		/// <param name="_userData" type="array">用户数据</param>
		var uMLClassList, userManagementList = this, userList = new UserList("normal");

		this.assign({
			userList : userList
		});

		_userData = _userData ? _userData.concat([]) : [];

		this.combine(listHtml.create());
		userList.refresh(_userData);
		userList.appendTo(this.find(">dl>dd")[0]);

		uMLClassList = userManagementList.classList,

		this.attach({
			clickavatar : function(e){
				// 如果不处于删除状态,就return
				if(!uMLClassList.contains("readyToDel"))
					return;
						
				// 删除用户，此用户元素被删除
				userList.delUser(e.userId);
				uMLClassList.remove("readyToDel");
				e.stopPropagation();
			}
		}, true);

		this.attach({
			userclick : function(e, targetEl){
				var userEl = targetEl.between(".userList>figure>p", this);

				// 不管怎么样，只要点击的不是删除按钮，就要取消删除状态
				uMLClassList.remove("readyToDel");

				// 如果点击的是添加按钮
				if(targetEl.between('dt > button:first-child', this).length > 0){
					// 初始化用户选择列表
					var userSelectionList = new UserSelectionList(text, userManagementList.paramsOfGetPartners);

					userList.getAllUsers().forEach(function(userId){
						userSelectionList.toggleUser(userId);
					});

					// 添加事件
					userSelectionList.attach({
						clickbutton : function(e){
							if(e.buttonType === "ok"){
								var users = e.users, maxLength = userManagementList.maxLength;

								if(users.length > maxLength){
									e.stopPropagation();
									new Alert("只能至多选择" + maxLength + "位用户！").show();
									return;
								}

								// 清除所有用户
								userManagementList.clearUsers();
								// 选择后，点击确认并添加用户
								userList.addUsers(users);
								selecetUsersEvent.setEventAttrs({ users : users });
								selecetUsersEvent.trigger(userManagementList[0]);
							}
						}
					}, true);
					return;
				}

				// 如果点的是删除按钮
				if(targetEl.between('dt > button:last-child', this).length > 0){
					uMLClassList.toggle("readyToDel");
					return;
				}
			}
		});

		new OverflowPanel(this[0]);
	};
	UserManagementList = new NonstaticClass(UserManagementList, "Bao.UI.Control.List.UserSelectionList", Panel.prototype);

	UserManagementList.properties({
		clearUsers : function(){
			this.userList.clearUsers();
		},
		getAllUsers : function(){
			return this.userList.getAllUsers();
		},
		paramsOfGetPartners : undefined,
		maxLength : Infinity,
		resetParamsOfGetPartners : function(paramsOfGetPartners){
			this.paramsOfGetPartners = paramsOfGetPartners;
		},
		restore : function(){
			this.userList.clearUsers();
			this.classList.remove("readyToDel");
		},
		setMaxLength : function(length){
			this.maxLength = length;
		},
		userList : undefined
	});

	return UserManagementList.constructor;
}(
	this.UserList,
	this.UserSelectionList,
	Bao.UI.Control.Mask.Alert,
	Bao.API.DOM.OverflowPanel,
	// selecetUsersEvent
	new jQun.Event("selectusers"),
	// listHtml
	new HTML([
		'<div class="userManagementList">',
			'<dl>',
				'<dt>',
					'<button action="add"></button>',
					'<button action="del"></button>',
				'</dt>',
				'<dd></dd>',
			'</dl>',
		'</div>'
	].join(""))
));

List.members(this);
}.call(
	{},
	Bao.UI.Control.List,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML
));