(function(Bao, StaticClass, Enum){
this.Permission = (function(){
	return new Enum(
		["None", "Leader", "Creator"]
	);
}());

this.Global = (function(Fixed, Management, HTML, Permission, windowEl){
	function Global(){
		///	<summary>
		///	全局类，用于存储页面中的一些全局属性。
		///	</summary>
		var Global = this;

		windowEl.attach({
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
				var loginUser = e.loginUser;

				Global.loginUser = loginUser;

				jQun(".main").setAttribute("permission", loginUser.permission);
				// Global.history.go("report");
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
	this.Permission,
	jQun(window)
));

Bao.members(this);
}.call(
	{},
	Bao,
	jQun.StaticClass,
	jQun.Enum
));