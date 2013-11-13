(function(Wait, NonstaticClass, StaticClass, Panel, HTML){
this.LoadingBar = (function(Global, Timer, panelEl){
	function LoadingBar(){
		///	<summary>
		///	加载类。
		///	</summary>
		var LoadingBar = this;

		jQun(window).attach({
			"beforehide" : function(e){
				LoadingBar.hide();
			}
		}, true);
	};
	LoadingBar = new StaticClass(LoadingBar, "Bao.UI.Others.Wait.LoadingBar");

	LoadingBar.properties({
		clearText : function(){
			///	<summary>
			///	清除文字。
			///	</summary>
			this.text("");
		},
		defaultText : "正在加载数据..",
		error : function(str){
			///	<summary>
			///	显示加载错误信息。
			///	</summary>
			/// <param name="str" type="string">错误信息文本。</param>
			this.text(str, "error");
		},
		errorText : "数据加载超时..",
		hide : function(){
			this.isLoading = false;
			this.clearText();
			Global.mask.hide();
		},
		nomore : false,
		text : function(str, _type){
			///	<summary>
			///	显示加载信息。
			///	</summary>
			/// <param name="str" type="string">信息文本。</param>
			/// <param name="_type" type="string">信息类型。</param>
			panelEl.find("dd").innerHTML = str;
			panelEl.set("type", _type || "normal", "attr");
			this.timer.stop();
		},
		show : function(_text, _errorText){
			var mask = Global.mask;

			this.isLoading = true;
			this.text(typeof _text === "string" ? _text : this.defaultText, "loading");
			
			mask.fillBody(panelEl[0]);
			mask.show("loadingBar");

			this.timer.start(function(){
				this.error(this.errorText);
			}.bind(this));
		},
		timer : new Timer(20000),
		warn : function(str){
			///	<summary>
			///	警告信息。
			///	</summary>
			/// <param name="str" type="string">警告信息文本。</param>
			this.text(str, "warn");
		}
	});

	return LoadingBar;
}(
	Bao.Global,
	Bao.API.Management.Timer,
	// panelEl
	new HTML([
		'<div class="loadingBar" type="normal">',
			'<dl>',
				'<dt>',
					'<button></button>',
				'</dt>',
				'<dd class="whiteFont">ss</dd>',
			'</dl>',
		'</div>'
	].join("")).create()
));

Wait.members(this);
}.call(
	{},
	Bao.UI.Control.Wait,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML
));