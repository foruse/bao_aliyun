(function(Drag, NonstaticClass, StaticClass, Panel, HTML, Event, IntervalTimer){
this.Scroll = (function(scrollPanel, body){
	function Scroll(){
		///	<summary>
		///	滚动条。
		///	</summary>
		var Scroll = this;

		this.assign({
			buttonStyle : scrollPanel.find(">button").style,
			timer : new IntervalTimer(500)
		});

		jQun(window).attach({
			beforehide : function(){
				Scroll.hidePanel();
			},
			settop : function(e){
				Scroll.reposition(e.overflowPanel);
			}
		});
	};
	Scroll = new StaticClass(Scroll, "jQun.Scroll", {
		buttonStyle : undefined,
		timer : undefined
	});

	Scroll.properties({
		hidePanel : function(){
			///	<summary>
			///	隐藏滚动条。
			///	</summary>
			if(!this.isShow)
				return;

			this.timer.stop();
			this.panel.hidden = true;
			this.panel.remove();
			this.isShow = false;
		},
		isShow : false,
		panel : scrollPanel,
		panelStyle : scrollPanel.style,
		reposition : function(overflowPanel){
			///	<summary>
			///	重新定位。
			///	</summary>
			///	<param name="overflowPanel" type="Bao.API.DOM.OverflowPanel">溢出的元素。</param>
			var buttonStyle = this.buttonStyle,
			
				parentEl = overflowPanel.parent(),

				rect = parentEl[0].getBoundingClientRect(),

				parentHeight = parentEl.height(),

				height = overflowPanel.height();
				
			jQun.forEach({
				top : rect.top + 5,
				left : rect.left + rect.width - 10,
				height : parentHeight - 10
			}, function(value, name){
				this[name] = value + "px";
			}, this.panelStyle);

			// 取父容器的content的高度要使用 height 方法
			buttonStyle.height = (parentHeight * 100 / height) + "%";
			buttonStyle.top = overflowPanel.getTop() * -100 / height + "%";
			
			if(this.times > 0){
				this.times--;
			}
			this.showPanel();
		},
		showPanel : function(){
			///	<summary>
			///	显示滚动条。
			///	</summary>
			if(this.isShow)
				return;

			var Scroll = this;

			this.isShow = true;
			this.panel.appendTo(body);
			this.panel.hidden = false;

			this.timer.start(function(){
				if(Scroll.times++ < 2)
					return;
			
				Scroll.hidePanel();
			});
		},
		times : 0
	});

	return Scroll;
}(
	// scrollPanel
	new HTML([
		'<aside class="scroll normalRadius" hidden>',
			'<button class="normalRadius"></button>',
		'</aside>'
	].join("")).create(),
	document.body
));

this.Navigator = (function(Timer, Math, focusTabEvent, failingFocusEvent, panelHtml, tabItemsHtml, emptyContentHtml){
	function Navigator(){
		///	<summary>
		///	导航。
		///	</summary>
		var contentEl, navigator = this, x = 0;

		this.combine(panelHtml.create());

		contentEl = this.find(">nav");

		this.assign({
			contentEl : contentEl,
			tabEl : this.find(">aside>ol"),
			timer : new IntervalTimer(70)
		});

		this.attach({
			click : function(e){
				var buttonEls = navigator.buttonEls;

				if(!buttonEls)
					return;

				var target = e.target;

				if(!buttonEls.contains(target))
					return;

				navigator.focusTab(jQun(target).get("idx", "attr") - 0);
			},
			touchstart : function(){
				x = 0;
			},
			continuousgesture : function(e){
				var gestureOffsetX = e.gestureOffsetX,
				
					left = (contentEl.getCSSPropertyValue("left").split("px").join("") - 0 || 0) + gestureOffsetX;

				x += gestureOffsetX;

				// 如果是起手势，即(touchend)
				if(e.isLastOfGestureType && Math.abs(x) > 10){
					navigator["focus" + (x > 0 ? "Prev" : "Next") + "Tab"]();


					/* 以下是根据滑动幅度来调整focustab
					
					var width = navigator.width();

					left = Math.round(left / width);

					// left小于0，则说明还可以继续滑动
					if(left < 0){
						// 内容宽度除以容器宽度，得到最大值
						var max = Math.ceil(contentEl.width() / width);

						left = left * -1;

						// 超过最大值
						if(left >= max){
							// 内容本身要占1个长度单位，所以最大值要减去这个1
							left = max - 1;
						}
					}
					// left>=0，则说明，已经到了起始点
					else {
						left = 0;
					}

					//contentEl.setCSSPropertyValue("left", (left * -100) + "%");
					navigator.focusTab(left);
					
					*/

					return;
				}

				contentEl.setCSSPropertyValue("left", left + "px");
			}
		});
	};
	Navigator = new NonstaticClass(Navigator, "Bao.UI.Control.Drag.Navigator", Panel.prototype);

	Navigator.properties({
		buttonEls : undefined,
		content : function(htmlStr){
			///	<summary>
			///	设置导航的主体内容。
			///	</summary>
			/// <param name="htmlStr" type="string">主体内容html字符串</param>
			var contentEl = this.contentEl;

			contentEl.innerHTML = htmlStr;
			contentEl.setCSSPropertyValue("left", 0);

			this.resetTab();
		},
		contentEl : undefined,
		currentTabIndex : 0,
		focusNextTab : function(){
			this.focusTab(this.currentTabIndex + 1);
		},
		focusPrevTab : function(){
			this.focusTab(this.currentTabIndex - 1);
		},
		focusTab : function(idx){
			///	<summary>
			///	切换tab。
			///	</summary>
			/// <param name="idx" type="number">tab的索引</param>
			var tabEl = this.tabEl, focusEl = tabEl.find('button[idx="' + idx + '"]');

			if(focusEl.length === 0){
				failingFocusEvent.setEventAttrs({ tabIndex : idx });
				failingFocusEvent.trigger(tabEl[0]);

				idx = this.currentTabIndex;
				focusEl = tabEl.find('button[idx="' + idx + '"]');
			}

			var classList = focusEl.classList;

			this.contentEl.setCSSPropertyValue("left", (idx * this.contentEl.parent().width() * -1) + "px");

			if(classList.contains("focused"))
				return;

			tabEl.find('button.focused').classList.remove("focused");
			classList.add("focused");
			this.currentTabIndex = idx;

			focusTabEvent.setEventAttrs({ tabIndex : idx });
			focusTabEvent.trigger(focusEl[0]);
		},
		resetTab : function(){
			///	<summary>
			///	设置选项卡。
			///	</summary>
			var tabEl = this.tabEl;
			
			tabEl.innerHTML = tabItemsHtml.render({ length : Math.ceil(this.contentEl.width() / this.width()) || 0 });
			this.buttonEls = tabEl.find("button");
			this.focusTab(0);
		},
		tabEl : undefined,
		timer : undefined
	});

	return Navigator.constructor;
}(
	Bao.API.Management.Timer,
	Math,
	// focusTabEvent
	new Event("focustab"),
	// failingFocusEvent
	new Event("failingfocus"),
	// panelHtml
	new HTML([
		'<div class="navigator onlyBorderBottom lightBdColor">',
			'<nav></nav>',
			'<aside>',
				'<ol class="inlineBlock"></ol>',
			'</aside>',
		'</div>'
	].join("")),
	// tabItemsHtml
	new HTML([
		'@for(length ->> idx){',
			 '<li>',
				'<button class="normalRadius" idx="{idx}"></button>',
			 '</li>',
		'}'
	].join(""))
));

Drag.members(this);
}.call(
	{},
	Bao.UI.Control.Drag,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML,
	jQun.Event,
	Bao.API.Management.IntervalTimer
));