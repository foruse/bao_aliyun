(function(Bao, StaticClass){
this.Global = (function(Fixed, Management, HTML, Browser, inputs, inputEvents){
	function Global(){
		///	<summary>
		///	全局类，用于存储页面中的一些全局属性。
		///	</summary>
		var Global = this;

		jQun(window).attach({
			touchstart : function(e, targetEl){
				if(targetEl.between('input[type="text"], input[type="password"], textarea').length > 0){
					/*
					if(targetEl.getAttribute("stayput") != null)
						return;

					var input = targetEl[0];

					if(inputs.indexOf(input) === -1){
						targetEl.blur();
						targetEl.attach(inputEvents);
						inputs.push(input);
					}
					*/
					return;
				}

				var el = jQun(document.activeElement);

				if(el.between('input[type="text"], input[type="password"], textarea').length > 0){
					el.blur();
					return;
				}
			},
			appload : function(){
				// 初始化历史记录
				var history = new Management.History();

				//jQun("body").set("zoom", window.screen.width / 640, "css");

				// iphone ios7标题栏css兼容
				/*
				if(Browser.isMobile && Browser.agent === "iPhone" && Browser.majorVersion === "7"){
					jQun(".main").setCSSPropertyValue("top", "20px");
				}
				*/

				Global.assign({
					history :　history,
					mask : new Fixed.Mask("#mask"),
					// 初始化标题栏
					titleBar : new Fixed.TitleBar(
						"#titleBar",
						history,
						new HTML(jQun("#title_tools_html"))
					)
				});
	
				// 首先要登录才会用登录用户的数据
				history.go("login").tryLogin();
			},
			login : function(e){
				Global.loginUser = e.loginUser;
				//Global.history.go("discussion").fill(1);
			}
		});
	};
	Global = new StaticClass(Global, "Bao.Global", {
		history : undefined,
		// 当前登录用户的数据
		loginUser : undefined,
		titleBar : undefined
	});

	return Global;
}(
	Bao.UI.Fixed,
	Bao.API.Management,
	jQun.HTML,
	jQun.Browser,
	[],
	// inputEvents
	{
		focus : function(){
			jQun(this).classList.add("inputing");
		},
		blur : function(){
			jQun(this).classList.remove("inputing");
		},
		keyup : function(e){
			if(e.keyCode === 13){
				jQun(this).classList.remove("inputing");
			}
		}
	}
));

Bao.members(this);
}.call(
	{},
	Bao,
	jQun.StaticClass
));