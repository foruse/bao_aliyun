(function(window, jQun){

(function(a){
return;
this.onerror = function(){
	if(a !== 0)
		return;
	
	a++;
	alert([].slice.call(arguments, 0, 3).join("\r\n"));
};
}(0));

(function(){
	if(window.Models)
		return;
	
	window.Models = {};
}());

(function(Object){
	if(window.Window)
		return;

	window.Window = window.constructor;
}(window.Object));

(function(NodeList, toArray){
	try{
		[].push.apply([], new NodeList());
	}
	catch(e){
		NodeList.prototype.override({
			combine : function(list){
				this.push.apply(this, toArray(list));
				return this;
			}
		});
	}
}(
	jQun.NodeList,
	jQun.toArray
));

(function(Event, set, document){
	try{
		new Event("test").trigger(window);
	}
	catch(e){
		Event.prototype.override({
			trigger : function(target){
				var type = this.type, event = document.createEvent(type);

				event["init" + type].apply(event, this.initEventArgs);
				set(event, this.eventAttrs);

				return target.dispatchEvent(event);
			}
		});
	}
}(
	jQun.Event,
	jQun.set,
	document
));
}(window, jQun));