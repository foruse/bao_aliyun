(function(NonstaticClass, StaticClass, Event, TouchEvent, isMobile){
(function(appLoadEvent){
	window.onload = function(){
		appLoadEvent.trigger(this);
	};
}(
	new Event("appload")
));

// 如果是移动设备，则不需要虚拟这些方法及事件
if(isMobile){
	return;
}

TouchEvent = (function(List, window, attrs){
	function Touch(){}
	Touch = new StaticClass(null, "Touch");

	attrs.forEach(function(attr){
		var properties = {};

		properties[attr] = {
			get : function(){
				return window.event[attr];
			},
			set : function(value){
				window.event[attr] = value;
			}
		};

		Touch.properties(properties, { gettable : true, settable : true });
	});


	function TouchList(){
		this.push(Touch);
	};
	TouchList = new NonstaticClass(TouchList, "TouchList", List.prototype);


	function TouchEvent(name, replacement){
		var touchEvent = this, touchList = touchEvent.touchList;
			
		window.addEventListener(replacement, function(e){
			var touchEventArgs = {
				changedTouches : touchList,
				touches : touchList
			};

			attrs.forEach(function(attr){
				touchEventArgs[attr] = e[attr];
			});
				
			touchEvent.setEventAttrs(touchEventArgs);
			touchEvent.trigger(e.target);
		});

		this.attachTo("*");
	};
	TouchEvent = new NonstaticClass(TouchEvent, null, Event.prototype);

	TouchEvent.properties({
		touchList : new TouchList.constructor()
	});

	return TouchEvent.constructor;
}(
	jQun.List,
	window,
	// attrs
	["clientX", "clientY", "pageX", "pageY", "screenX", "screenY"]
));

(function(events){
	jQun.forEach(events, function(replacement, name){
		new TouchEvent(name, replacement);
	});
}(
	// events 手势事件pc上无法模拟（因为需要2点触发，pc上目前做不到）
	{
		touchstart : "mousedown",
		touchmove : "mousemove",
		touchend : "mouseup",
		touchcancel : "mouseup"
	}
));

}(
	jQun.NonstaticClass,
	jQun.StaticClass,
	jQun.Event,
	undefined,
	jQun.Browser.isMobile
));