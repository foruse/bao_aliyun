(function(Guidance, NonstaticClass, Panel, PagePanel, CallServer, Event, ValidationList, Global){
this.LoginInfoManagement = (function(loginEvent, registerEvent){
	function LoginInfoManagement(selector){
		///	<summary>
		///	登录信息管理。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>
		var infoManagement = this, validationList = new ValidationList();

		this.assign({
			loginBtn : this.find("button:first-child"),
			registerBtn : this.find("button:last-child"),
			validationList : validationList
		});

		// 验证
		this.find("input").forEach(function(input, i){
			var inputEl = jQun(input);

			validationList.addValidation(inputEl, function(el, Validation){
				var desc = el.get("desc", "attr");

				if(desc === "repwd"){
					if(el.value !== infoManagement.find('input[desc="pwd"]').value)
						return false;
				}

				return Validation.result(el.value, el.get("vtype", "attr"));
			}, inputEl.getAttribute("errortext"));
		});

		// 登录和注册按钮的事件
		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between("button", this).length > 0){
					var htmlStr = targetEl.innerHTML;

					// 如果点击的是 登录 按钮
					if(htmlStr === "登录"){
						if(!validationList[0].validate())
							return;

						if(!validationList[1].validate())
							return;

						loginEvent.setEventAttrs({
							email : infoManagement.find('input[desc="email"]').value,
							password : infoManagement.find('input[desc="pwd"]').value
						});
						loginEvent.trigger(targetEl[0]);
						return;
					}

					// 如果点击的是 返回登录 按钮
					if(htmlStr === "返回登录"){
						infoManagement.showLogin();
						return;
					}

					// 如果点击的是 注册账号 按钮
					if(htmlStr === "注册账号"){
						infoManagement.showRegister();
						return;
					}

					if(!validationList.validate())
						return;
					
					registerEvent.setEventAttrs({
						email : infoManagement.find('input[desc="email"]').value,
						password : infoManagement.find('input[desc="pwd"]').value
					});
					registerEvent.trigger(targetEl[0]);
				}
			}
		});
	};
	LoginInfoManagement = new NonstaticClass(LoginInfoManagement, null, Panel.prototype);

	LoginInfoManagement.properties({
		clearInputValue : function(desc){
			this.setInputValue("", desc);
		},
		loginBtn : undefined,
		registerBtn : undefined,
		setInputValue : function(value, desc){
			this.find('>ul input[desc="' + desc + '"]').value = value;
		},
		showInfoErrorByIndex : function(i){
			///	<summary>
			///	通过input的索引显示信息错误。
			///	</summary>
			/// <param name="i" type="number">错误信息的input索引</param>
			this.validationList[i].showError();
		},
		showLogin : function(){
			///	<summary>
			///	显示登陆。
			///	</summary>
			this.classList.remove("register");
			this.loginBtn.innerHTML = "登录";
			this.registerBtn.innerHTML = "注册账号";
		},
		showRegister : function(){
			///	<summary>
			///	显示注册。
			///	</summary>
			this.classList.add("register");
			this.loginBtn.innerHTML = "返回登录";
			this.registerBtn.innerHTML = "立即注册";
		},
		validationList : undefined
	});

	return LoginInfoManagement.constructor;
}(
	// loginEvent
	new Event("login"),
	// registerEvent
	new Event("register")
));

this.Login = (function(OverflowPanel, LoginInfoManagement, localStorage, loginEvent){
	function Login(selector){
		///	<summary>
		///	登陆页。
		///	</summary>
		/// <param name="selector" type="string">对应的元素选择器</param>

		var login = this,
			
			// 初始化登录信息管理
			loginInfoManagement = new LoginInfoManagement(this.find(">section"), this);

		this.assign({
			loginInfoManagement : loginInfoManagement
		});

		this.attach({
			afterhide : function(){
				Global.history.clear();
			}
		})

		loginInfoManagement.attach({
			login : function(e){
				login.login(e.email, e.password);
			},
			register : function(e){
				login.register(e.email, e.password);
			}
		});

		new OverflowPanel(this[0]);
		this.getInfo();
	};
	Login = new NonstaticClass(Login, "Bao.Page.Index.Guidance.Login", PagePanel.prototype);

	Login.properties({
		getInfo : function(){
			///	<summary>
			///	获取登录信息。
			///	</summary>
			var login = this;

			CallServer.open("getLoginInfo", null, function(data){
				login.find(">header>span").innerHTML = data.count.toLocaleString();
			});
		},
		login : function(email, pwd){
			///	<summary>
			///	登录。
			///	</summary>
			/// <param name="email" type="string">用户邮箱</param>
			/// <param name="pwd" type="string">用户密码</param>
			var loginInfoManagement = this.loginInfoManagement;

			CallServer.open("login", {
				email : email,
				pwd : pwd
			}, function(data){
				// 如果后台验证有错误
				if(data.status === -1){
					loginInfoManagement.showInfoErrorByIndex(data.error.idx);
					return;
				}

				var user = data.user;
				
				Global.history.go(user.isNewUser ? "uploadAvatar" : "project");

				loginEvent.setEventAttrs({ loginUser : user });
				loginEvent.trigger(window);

				localStorage.user_email = email;
				localStorage.user_pass = pwd;
				loginInfoManagement.clearInputValue("pwd");
			});
		},
		loginInfoManagement : undefined,
		register : function(email, pwd){
			///	<summary>
			///	注册。
			///	</summary>
			/// <param name="email" type="string">用户邮箱</param>
			/// <param name="pwd" type="string">用户密码</param>
			var login = this, loginInfoManagement = this.loginInfoManagement;
			
			CallServer.open("register", {
				email : email,
				pwd : pwd
			}, function(data){
				// 如果后台验证有错误
				if(data.status === -1){
					loginInfoManagement.showInfoErrorByIndex(data.error.idx);
					return;
				}

				login.login(email, pwd);
			}, true);
		},
		tryLogin : function(){
			var email = localStorage.user_email, pwd = localStorage.user_pass;

			if(!email || !pwd)
				return false;

			var loginInfoManagement = this.loginInfoManagement;

			loginInfoManagement.setInputValue(email, "email");
			loginInfoManagement.setInputValue(pwd, "pwd");
			this.login(email, pwd);
		}
	});

	Login.override({
		showTitleBar : false
	});

	return Login.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	this.LoginInfoManagement,
	localStorage,
	// loginEvent
	new Event("login")
));

this.UploadAvatar = (function(ImageFile, SelectionImageArea, Validation){
	function UploadAvatar(selector){
		var validation,
			
			uploadAvatar = this,

			avatarSrc = null,

			imageFile = new ImageFile();

		imageFile.appendTo(this.header.find(">button")[0]);

		validation = new Validation(this.section.find(">input"), function(inputEl, Validation){
			return Validation.result(inputEl.value, "notEmpty");
		}, "请输入姓名！");

		this.attach({
			imageloaded : function(e){
				SelectionImageArea.show();
				SelectionImageArea.loadImage(e.base64, function(src){
					avatarSrc = src;
					uploadAvatar.header.find("img").src = src;
					SelectionImageArea.hide();
				});
			},
			userclick : function(e, targetEl){
				if(targetEl.between(">footer>button", this).length > 0){
					if(!validation.validate())
						return;

					CallServer.open("registerUserInfo", {
						id : Global.loginUser.id,
						name : validation.validationEl.value,
						avatar : avatarSrc
					}, function(userData){
						Global.loginUser = userData;
						Global.history.go("demo");
					});
					return;
				}
			}
		});
	};
	UploadAvatar = new NonstaticClass(UploadAvatar, "Bao.Page.Index.Guidance.UploadAvatar", PagePanel.prototype);

	UploadAvatar.override({
		showTitleBar : false
	});

	return UploadAvatar.constructor;
}(
	Bao.UI.Control.File.ImageFile,
	Bao.UI.Control.File.SelectionImageArea,
	Bao.API.DOM.Validation
));

this.Demo = (function(Navigator, descriptor, descriptorHtml){
	function DemoNavigator(){
		var descriptEl = descriptorHtml.create();

		descriptEl.appendTo(this.find(">aside")[0]);

		this.attach({
			focustab : function(e){
				descriptEl.innerHTML = descriptor[e.tabIndex];
			},
			failingfocus : function(e){
				if(e.tabIndex !== 3)
					return;

				Global.history.go("project");
			}
		});
	};
	DemoNavigator = new NonstaticClass(DemoNavigator, null, Navigator.prototype);

	function Demo(selector, html){
		var demoNavigator = new DemoNavigator.constructor();

		demoNavigator.appendTo(this[0]);

		this.attach({
			aftershow : function(){
				demoNavigator.content(html.render());
			}
		});
	};
	Demo = new NonstaticClass(Demo, "Bao.Page.Index.Guidance.Demo", PagePanel.prototype);

	Demo.override({
		showTitleBar : false
	});

	return Demo.constructor;
}(
	Bao.UI.Control.Drag.Navigator,
	// descriptor
	[
		"可以通过Email添加好友",
		"给拍档发送To Do的时候可以传送语音、图片以及位置",
		"点击空的文件夹新建一个项目"
	],
	// descriptorHtml
	new jQun.HTML('<p></p>')
));

this.CreateFirstProject = (function(){
	function CreateFirstProject(selector){
		///	<summary>
		///	创建第一个项目页。
		///	</summary>
		/// <param name="selector" type="string">对应元素选择器</param>
		var createFirstProject = this,
		
			validationList = new ValidationList(),
			
			namePanel = this.find("section input").parent(),

			colorPanel = this.find("section aside").parent();

		// 添加验证：标题
		validationList.addValidation(namePanel, function(namePanel, Validation){
			return Validation.result(namePanel.find("input").value, "notEmpty");
		});

		// 添加验证：颜色
		validationList.addValidation(colorPanel, function(colorPanel, Validation){
			return colorPanel.find("button.selected").length > 0;
		});

		this.attach({
			userclick : function(e, targetEl){
				// 如果点击的是颜色按钮
				if(targetEl.between("aside>button:not(.selected)", this).length > 0){
					createFirstProject.find("aside>button.selected").classList.remove("selected");
					targetEl.classList.add("selected");
					return;
				}

				// 如果点击的是提交按钮
				if(targetEl.between("footer>button", this).length > 0){
					// 如果验证不通过，则return
					if(!validationList.validate())
						return;

					CallServer.open("addProject", {
						title : namePanel.find("input").value,
						color : createFirstProject.find("aside>button.selected").get("colormark", "attr"),
						desc : createFirstProject.find("li:last-child>textarea").innerHTML,
						users : []
					}, function(data){
						Global.history.go("invitation");
					});
				}
			}
		});
	};
	CreateFirstProject = new NonstaticClass(CreateFirstProject, "Bao.Page.Index.Guidance.CreateFirstProject", PagePanel.prototype);

	CreateFirstProject.override({
		showTitleBar : false
	});

	return CreateFirstProject.constructor;
}());

this.Invitation = (function(Validation, OverflowPanel){
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
		var inputEls, inputValidationList, ulEl = this.find(">section>ul");

		ulEl.innerHTML = textHtml.render({ length : 5 });

		inputEls = this.find(">section li>input");
		inputValidationList = new InputValidationList.constructor(inputEls);

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

				// 如果点击的 邀请 按钮
				if(targetEl.between(">footer>button", this).length > 0){
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

					CallServer.open("invitation", emails, function(data){
						Global.history.go("project");
					}, true);
				}
			}
		});

		new OverflowPanel(this[0]);
	};
	Invitation = new NonstaticClass(Invitation, "Bao.Page.Index.Guidance.Invitation", PagePanel.prototype);

	Invitation.override({
		showTitleBar : false
	});

	return Invitation.constructor;
}(
	jQun.Validation,
	Bao.API.DOM.OverflowPanel
));

this.Footer = (function(){
	function Footer(selector){
		///	<summary>
		///	导航页面底部跳转按钮。
		///	</summary>
		/// <param name="selector" type="string">对应元素选择器</param>
		var footer = this;

		this.attach({
			userclick : function(e, targetEl){
				if(targetEl.between(">button", this).length > 0){
					// 如果点击的是 上一页 按钮
					if(targetEl.getAttribute("desc") === "prev"){
						Global.history.back();
						return;
					}

					// 否则是点击的下一页按钮
					Global.history.go(footer.next);
					return;
				}
			}
		});
	};
	Footer = new NonstaticClass(Footer, "Bao.Page.Index.Guidance.Footer", Panel.prototype);

	Footer.properties({
		hideNext : function(){
			///	<summary>
			///	隐藏下一步按钮。
			///	</summary>
			this.find('>button[desc="next"]').hide();
		},
		hidePrev : function(){
			///	<summary>
			///	隐藏上一步按钮。
			///	</summary>
			this.find('>button[desc="prev"]').hide();
		},
		next : "project",
		setNext : function(next){
			///	<summary>
			///	设置下一步跳转页。
			///	</summary>
			/// <param name="next" type="string">跳转页</param>
			this.next = next;
		},
		showNext : function(){
			///	<summary>
			///	显示下一步按钮。
			///	</summary>
			this.find('>button[desc="next"]').show("inline-block");
		},
		showPrev : function(){
			///	<summary>
			///	显示上一步按钮。
			///	</summary>
			this.find('>button[desc="prev"]').show("inline-block");
		}
	});

	return Footer.constructor;
}());

this.Self = (function(Login, CreateFirstProject, Invitation, Footer){
	function Self(selector){
		///	<summary>
		///	导航页自身类。
		///	</summary>
		/// <param name="selector" type="string">对应元素选择器</param>
		var footer = new Footer("#guidance_footer");

		// 新设计不需要footer部分
		footer.hidePrev();
		footer.hideNext();
		return;

		this.attach({
			beforeshow : function(e){
				switch(e.currentPanel.ownClass().constructor){
					case Login :
						footer.hidePrev();
						footer.hideNext();
						break;

					case CreateFirstProject :
						footer.hidePrev();
						footer.showNext();
						footer.setNext("invitation");
						break;

					case Invitation :
						footer.showPrev();
						footer.showNext();
						footer.setNext("project");
						break;
				}
			}
		});
	};
	Self = new NonstaticClass(Self, "Bao.Page.Index.Guidance.Self", Panel.prototype);

	return Self.constructor;
}(
	this.Login,
	this.CreateFirstProject,
	this.Invitation,
	this.Footer
));

Guidance.members(this);
}.call(
	{},
	Bao.Page.Index.Guidance,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	Bao.API.DOM.PagePanel,
	Bao.CallServer,
	jQun.Event,
	Bao.API.DOM.ValidationList,
	Bao.Global
));