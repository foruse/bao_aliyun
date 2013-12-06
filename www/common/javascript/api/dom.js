(function(DOM, NonstaticClass, StaticClass, Management, Event, windowEl){
this.EventCollection = (function(Timer, IntervalTimer, isMobile, childGestureConstructor){
	function UserGesture(name, _init){
		///	<summary>
		///	手势事件。
		///	</summary>
		///	<param name="name" type="string">事件名称。</param>
		///	<param name="_init" type="function">事件初始化函数。</param>
		var startX, startY, lastX, lastY, target,
		
			userGesture = this,

			continuousTimer = new IntervalTimer(70),
		
			fastTimer = new Timer(250);

		jQun(window).attach({
			touchstart : function(e){
				var touch = e.touches[0];

				startX = lastX = touch.pageX;
				startY = lastY = touch.pageY;
				target = e.target;

				if(fastTimer.isEnabled){
					fastTimer.stop();
				}

				fastTimer.start();
				continuousTimer.stop();
			},
			touchmove : function(e){
				// 如果计时器是未启动的，就return
				if(!fastTimer.isEnabled)
					return;

				// 如果还在等待上一个touchmove的操作，以避免太过频繁执行事件，那么return
				if(continuousTimer.isEnabled)
					return;

				var touch = e.touches[0], pageX = touch.pageX, pageY = touch.pageY;

				userGesture.setEventAttrs("continuous", pageX - lastX, pageY - lastY);
				userGesture.trigger(target);

				lastX = pageX;
				lastY = pageY;

				e.preventDefault();

				// 保护函数
				continuousTimer.start(function(){
					continuousTimer.stop();
				});
			},
			touchend : function(e){
				if(!target)
					return;

				var touch = e.changedTouches[0],

					pageX = touch.pageX, pageY = touch.pageY;

				continuousTimer.stop();

				// 手势结束的时候再执行最后一次
				userGesture.setEventAttrs("continuous", pageX - lastX, pageY - lastY, true);
				userGesture.trigger(target);

				fastTimer.stop(function(){
					// 如果进入该中断函数，证明手势速度比较快
					userGesture.setEventAttrs("fast", pageX - startX, pageY - startY, true);
					userGesture.trigger(target);
				});
			}
		});
	};
	UserGesture = new NonstaticClass(UserGesture, null, Event.prototype);

	UserGesture.override({
		setEventAttrs : function(type, x, y, _isLastOfGestureType){
			///	<summary>
			///	设置手势事件属性。
			///	</summary>
			///	<param name="type" type="string">事件类型。</param>
			///	<param name="x" type="number">x方向上的偏移量。</param>
			///	<param name="y" type="string">y方向上的偏移量。</param>
			///	<param name="_isLastOfGestureType" type="boolean">是否为最后一次此次该类型事件的触发。</param>
			return Event.prototype.setEventAttrs.call(this, {
				gestureType : type,
				gestureOffsetX : x,
				gestureOffsetY : y,
				isLastOfGestureType : _isLastOfGestureType === true
			});
		}
	});

	function EventCollection(){};
	EventCollection = new StaticClass(EventCollection, "BAO.API.DOM.EventCollection");

	EventCollection.properties({
		// 持续的手势事件
		continuousgesture : new Event("continuousgesture", childGestureConstructor),
		// 快速的手势事件
		fastgesture : new Event("fastgesture", childGestureConstructor),
		longpress : new Event("longpress", function(){
			var longPress = this, isKeepPress = false, timer = new Timer(1000);

			windowEl.attach({
				touchstart : function(e){
					isKeepPress = true;

					timer.start(function(){
						if(!isKeepPress)
							return;

						timer.stop();
						isKeepPress = false;
						longPress.trigger(e.target);
					});
				},
				touchend : function(){
					if(timer.isEnabled){
						timer.stop();
					}

					isKeepPress = false;
				},
				continuousgesture : function(e){
					if(e.gestureOffsetX > 0 || e.gestureOffsetY > 0){
						isKeepPress = false;
					}
				}
			});

			this.attachTo("*");
		}),
		// 点击事件：pc上防止滑动的时候触发click事件而产生的替代的、具有保护性质的事件
		userclick : new Event("userclick", function(){
			var userClick = this, abs = Math.abs;

			windowEl.attach(
				/* MY PROJECTS页面，iPhone不兼容，用原生态的click居然不能点击..........
					isMobile ? {
						click : function(e){
							userClick.trigger(e.target);
						}
					} :
				*/
				{
					fastgesture : function(e){
						// 如果任何一方向上的偏移量大于5，就不算click
						if(abs(e.gestureOffsetY) > 5 || abs(e.gestureOffsetX) > 5)
							return;

						userClick.trigger(e.target);
						e.stopPropagation();
					}
				},
				true
			);

			this.attachTo("*");
		}),
		// 用户手势事件
		usergesture : new UserGesture.constructor("usergesture").attachTo("*")
	});

	return EventCollection;
}(
	Management.Timer,
	Management.IntervalTimer,
	// isMobile
	jQun.Browser.isMobile,
	// childGestureConstructor
	function(event){
		var gesture = this;

		windowEl.attach({
			usergesture : function(e){
				if(e.gestureType + "gesture" !== gesture.name)
					return;

				gesture.setEventAttrs({
					gestureOffsetX : e.gestureOffsetX,
					gestureOffsetY : e.gestureOffsetY,
					isLastOfGestureType : e.isLastOfGestureType
				});
				gesture.trigger(e.target);
			}
		});

		this.attachTo("*");
	}
));

this.Panel = (function(HTMLElementList){
	function Panel(_selector){};
	Panel = new NonstaticClass(Panel, "Bao.API.DOM.Panel", HTMLElementList.prototype);

	return Panel.constructor;
}(
	jQun.HTMLElementList
));

this.TitleBarColor = (function(Enum){
	return new Enum(
		["None", "Schedule", "Project", "Partner"]
	);
}(
	jQun.Enum
));

this.PagePanel = (function(Panel, TitleBarColor, beforeShowEvent, afterShowEvent, beforeHideEvent, afterHideEvent){
	function PagePanel(selector){};
	PagePanel = new NonstaticClass(PagePanel, "Bao.API.DOM.PagePanel", Panel.prototype);

	PagePanel.properties({
		// 是否隐藏返回按钮
		hideBackButton : false,
		// 该panel是否是无痕的
		isNoTraces : false,
		// 在无痕的情况下所执行的还原函数
		restore : undefined,
		// 是否显示标题栏
		showTitleBar : true,
		// 标题
		title : "",
		titleBarColor : TitleBarColor.None,
		// 工具
		tools : undefined
	});

	PagePanel.override({
		hide : function(){
			this.parent().hide();
			
			beforeHideEvent.setEventAttrs({
				currentPanel : this
			});
			beforeHideEvent.trigger(this[0]);

			Panel.prototype.hide.apply(this, arguments);

			afterHideEvent.setEventAttrs({
				currentPanel : this
			});
			afterHideEvent.trigger(this[0]);
			return this;
		},
		show : function(_display, _isBack){
			this.parent().show();

			_isBack = !!_isBack;

			if(this.isNoTraces){
				this.restore(_isBack);
			}

			beforeShowEvent.setEventAttrs({
				currentPanel : this,
				isBack : _isBack
			});
			beforeShowEvent.trigger(this[0]);

			Panel.prototype.show.apply(this, arguments);

			afterShowEvent.setEventAttrs({
				currentPanel : this
			});
			afterShowEvent.trigger(this[0]);
			return this;
		}
	});

	return PagePanel.constructor;
}(
	this.Panel,
	this.TitleBarColor,
	// beforeShowEvent
	new Event("beforeshow", function(){
		this.attachTo("*");
	}),
	// afterShowEvent
	new Event("aftershow", function(){
		this.attachTo("*");
	}),
	// beforeHideEvent
	new Event("beforehide", function(){
		this.attachTo("*");
	}),
	// afterHideEvent
	new Event("afterhide", function(){
		this.attachTo("*");
	})
));

this.OverflowPanel = (function(Panel, IntervalTimer, setTopEvent, leaveborder){
	function OverflowPanel(selector, _isHideScrollBar){
		///	<summary>
		///	溢出区域。
		///	</summary>
		///	<param name="selector" type="string">元素选择器。</param>
		///	<param name="_isHideScrollBar" type="boolean">是否显示滚动条。</param>
		var overflowPanel = this,
		
			isLeaveborder = false, panelStyle = this.style,
			
			timer = new IntervalTimer(40);

		this.assign({
			isHideScrollBar : _isHideScrollBar,
			panelStyle : panelStyle
		});
		
		this.setAttribute("overflow", "");
		this.setCSSPropertyValue("position", "relative");

		this.attach({
			touchstart : function(){
				tm = 0;
				timer.stop();
			},
			continuousgesture : function(e){
				var top = overflowPanel.getTop() + e.gestureOffsetY;
				
				if(e.isLastOfGestureType){
					isLeaveborder = false;

					leaveborder(overflowPanel, overflowPanel.parent().height(), top, function(t, type){
						top = t;
						isLeaveborder = true;
					});
				}

				overflowPanel.setTop(top);
			},
			fastgesture : function(e){
				if(isLeaveborder)
					return;

				var abs = Math.abs,
				
					y = e.gestureOffsetY / 2, n = y > 0 ? 100 : -100;
				
				if(abs(y) < 10)
					return;

				var ts = 24, parentHeight = overflowPanel.parent().height();

				// 快速滑动事件
				timer.start(function(i){
					var top = overflowPanel.getTop() + (isNaN(i) ? n : y * (1 - i++ / ts));

					leaveborder(overflowPanel, parentHeight, top, function(t, type){
						top = t;
						timer.stop();
					});

					overflowPanel.setTop(top);
				}, abs(y) > parentHeight / 2 * 0.6 ? undefined : ts);
			}
		});
	};
	OverflowPanel = new NonstaticClass(OverflowPanel, "Bao.API.DOM.OverflowPanel", Panel.prototype);

	OverflowPanel.properties({
		bottom : function(){
			var top = this.parent().height() - this.height();

			if(top > 0){
				top = 0;
			}

			this.setTop(top);
		},
		getTop : function(){
			return this.panelStyle.top.toString().split("px").join("") - 0 || 0;
		},
		isHideScrollBar : false,
		panelStyle : undefined,
		setTop : function(top){
			this.panelStyle.top = Math.round(top) + "px";
			
			if(this.isHideScrollBar)
				return;

			setTopEvent.setEventAttrs({
				overflowPanel : this
			});
			setTopEvent.trigger(this[0]);
		}
	});

	return OverflowPanel.constructor;
}(
	this.Panel,
	Management.IntervalTimer,
	// setTopEvent
	new Event("settop"),
	// leaveborder
	function(overflowPanel, parentHeight, top, fn){
		// top等于0，说明处于恰好状态，就可以return了
		if(top === 0)
			return;
		
		var type = "", offsetBorder = top,

			h = parentHeight - overflowPanel.height();
		
		// 父容器比溢出容器还要高（未溢出或隐藏了，t应该为正数）
		if(h > 0){
			type = top > 0 ? "top" : "bottom";
			top = 0;
		}
		// 如果是最上方的时候
		else if(top > 0){
			type = "top";
			top = 0;
		}
		// 如果是最下方的时候(这时t应该为负数)
		else if(top < h){
			type = "bottom";
			offsetBorder = h - top;
			top = h;
		}
		else {
			return;
		}

		this.setEventAttrs({
			direction : type,
			offsetBorder : offsetBorder
		});
		this.trigger(overflowPanel[0]);
		fn(top, type);
	}.bind(new Event("leaveborder"))
));

this.Validation = (function(ValidationBase, ValidationRegExpString, Mask, RegExp){
	function OverrideValidationBase(){
		// jQun.js改版至1.0.7.0后，Validation类的match方法修改了许多，为了迎合app老代码，所以要还原此方法
		ValidationBase.override({
			match : function(str, type, _regxAttrs){
				return str.match(new RegExp(ValidationRegExpString[type[0].toUpperCase() + type.substring(1)], _regxAttrs));
			}
		});
	};
	OverrideValidationBase = new StaticClass(OverrideValidationBase);

	function Validation(validationEl, handler, errorText, _action){
		///	<summary>
		///	验证元素。
		///	</summary>
		///	<param name="validationEl" type="jQun.HTMLElementList">对应的元素。</param>
		///	<param name="handler" type="function">验证函数，需要返回true或false。</param>
		var validation = this;

		this.assign({
			action : _action,
			validationEl : validationEl,
			handler : handler,
			errorText : errorText
		});
	};
	Validation = new NonstaticClass(Validation, "Bao.API.DOM.Validation");

	Validation.properties({
		action : undefined,
		errorText : "",
		handler : undefined,
		showError : function(){
			var text = this.errorText;

			if(typeof text === "function"){
				text = text();
			}

			new Mask.Alert(text, this.action).show();
		},
		validate : function(){
			///	<summary>
			///	进行验证。
			///	</summary>
			if(this.handler(this.validationEl, ValidationBase)){
				return true;
			}

			this.showError();
			return false;
		},
		validationEl : undefined
	});

	return Validation.constructor;
}(
	jQun.Validation,
	jQun.ValidationRegExpString,
	Bao.UI.Control.Mask,
	RegExp
));

this.ValidationList = (function(List, Validation){
	function ValidationList(){ };
	ValidationList = new NonstaticClass(ValidationList, "Bao.API.DOM.ValidationList", List.prototype);

	ValidationList.properties({
		addValidation : function(validationEl, handler, errorText, _action){
			///	<summary>
			///	添加验证。
			///	</summary>
			this.push(new Validation(validationEl, handler, errorText, _action));
		},
		validate : function(){
			///	<summary>
			///	进行验证。
			///	</summary>
			return this.every(function(validation){
				return validation.validate();
			});
		}
	});

	return ValidationList.constructor;
}(
	jQun.List,
	this.Validation
));

DOM.members(this);
}.call(
	{},
	Bao.API.DOM,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.Management,
	jQun.Event,
	// windowEl
	jQun(window)
));