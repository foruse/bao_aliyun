(function(Fixed, NonstaticClass, Panel){
this.Mask = (function(){
	function Mask(selector){};
	Mask = new NonstaticClass(Mask, "Bao.UI.Fixed.Mask", Panel.prototype);

	Mask.override({
		clearHtml : function(){
			// 清空所有内容
			this.find(">header").innerHTML = "";
			this.find(">article").innerHTML = "";
			this.find(">footer").innerHTML = "";
		},
		fill : function(position, content, _isHtml){
			///	<summary>
			///	填充区域元素。
			///	</summary>
			///	<param name="position" type="string">填充的区域。</param>
			///	<param name="content" type="element">区域内容元素。</param>
			///	<param name="_isHtml" type="boolean">是否是html。</param>
			this.clearHtml();

			(
				_isHtml ? new jQun.HTML(content).create() : jQun(content)
			).appendTo(
				this.find(">" + (position === "body" ? "article" : position))[0]
			);
		},
		fillBody : function(content, _isHtml){
			///	<summary>
			///	填充内容元素。
			///	</summary>
			///	<param name="content" type="element">内容元素。</param>
			///	<param name="_isHtml" type="boolean">是否是html。</param>
			this.fill("body", content, _isHtml);
		},
		fillHeader : function(content, _isHtml){
			///	<summary>
			///	填充头部元素。
			///	</summary>
			///	<param name="content" type="element">头部内容元素。</param>
			///	<param name="_isHtml" type="boolean">是否是html。</param>
			this.fill("header", content, _isHtml);
		},
		fillFooter : function(content, _isHtml){
			///	<summary>
			///	填充脚部元素。
			///	</summary>
			///	<param name="content" type="element">脚部内容元素。</param>
			///	<param name="_isHtml" type="boolean">是否是html。</param>
			this.fill("footer", content, _isHtml);
		},
		hide : function(){
			this.clearHtml();

			return Panel.prototype.hide.call(this);
		},
		show : function(action){
			///	<summary>
			///	显示元素。
			///	</summary>
			///	<param name="action" type="string">遮罩的活动属性。</param>
			this.set("action", action || "none", "attr");

			return Panel.prototype.show.call(this);
		}
	});

	return Mask.constructor;
}());

this.TitleBar = (function(){
	function TitleBar(selector, history, toolsHtml){
		///	<summary>
		///	标题栏。
		///	</summary>
		///	<param name="selector" type="string">标题栏元素选择器。</param>
		///	<param name="history" type="Bao.API.Management.History">页面历史记录。</param>
		///	<param name="toolsHtml" type="jQun.HTML">工具html模板。</param>
		var titleBar = this, backButtonEl = this.find(">nav>button");

		this.assign({
			titleEl : this.find(">p>strong"),
			toolsHtml : toolsHtml,
			toolsPanel : this.find(">ul")
		});

		this.attach({
			userclick : function(e){
				var targetEl = jQun(e.target);

				if(targetEl.between("button", this).length > 0){
					var urlname = targetEl.get("urlname", "attr");

					if(urlname === "javascript:void(0);")
						return;

					if(urlname === "-1"){
						history.back();
						return;
					}

					history.go(urlname);
				}
			}
		});

		jQun(window).attach({
			redirect : function(){
				titleBar.hide();
			},
			beforeshow : function(e){
				var panel = e.currentPanel;

				if(!panel.showTitleBar){
					titleBar.hide();
					return;
				}

				titleBar.show();

				backButtonEl[panel.hideBackButton ? "hide" : "show"]();

				if(panel.title){
					titleBar.resetTitle(panel.title);
				}

				titleBar.resetTools(panel.tools || []);
			}
		}, true);
	};
	TitleBar = new NonstaticClass(TitleBar, "Bao.UI.Fixed.TitleBar", Panel.prototype);

	TitleBar.properties({
		resetTitle : function(title){
			///	<summary>
			///	重新标题。
			///	</summary>
			///	<param name="title" type="string">标题。</param>
			this.titleEl.innerHTML = title;
		},
		resetTools : function(tools){
			///	<summary>
			///	重新设置工具栏。
			///	</summary>
			///	<param name="tools" type="array">工具栏数据。</param>
			this.find(">ul").innerHTML = this.toolsHtml.render({ tools : tools });
		},
		toolsHtml : undefined
	});

	return TitleBar.constructor;
}());

Fixed.members(this);
}.call(
	{},
	Bao.UI.Fixed,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel
));