(function(Mask, NonstaticClass, StaticClass, HTML, Event, Panel, Global){
this.MaskButton = (function(buttonHtml, clickButtonEvent){
	function MaskButton(_action, _text, _autoClose){
		var maskButton = this;

		this.assign({
			action : _action,
			autoClose : _autoClose,
			text : _text
		});

		this.combine(buttonHtml.create(this));

		this.attach({
			userclick : function(){
				clickButtonEvent.setEventAttrs({ maskButton : maskButton });
				clickButtonEvent.trigger(maskButton[0]);
			}
		});
	};
	MaskButton = new NonstaticClass(MaskButton, "Bao.UI.Control.Mask.MaskButton", Panel.prototype);

	MaskButton.properties({
		action : "ok",
		autoClose : true,
		text : "确定"
	});

	return MaskButton.constructor;
}(
	// buttonHtml
	new HTML('<button class="smallRadius" action="{action}">{text}</button>'),
	// clickButtonEvent
	new Event("clickbutton")
));

this.Confirm = (function(MaskButton, bodyHtml){
	function Confirm(text, _buttons, _action){
		var confirm = this;

		this.assign({
			action : _action,
			text : text
		});

		this.combine(bodyHtml.create(this));
		new MaskButton("close", "", true).appendTo(this.find(">header")[0]);

		if(_buttons){
			var footerEl = this.find(">footer");

			_buttons.forEach(function(button){
				confirm.addButton(button.action, button.text, button.autoClose);
			});
		}

		this.attach({
			clickbutton : function(e){
				if(e.maskButton.autoClose){
					confirm.hide();
				}
			}
		});
	};
	Confirm = new NonstaticClass(Confirm, "Bao.UI.Control.Mask.Confirm", Panel.prototype);

	Confirm.override({
		hide : function(){
			Global.mask.hide();
			Panel.prototype.hide.call(this);
		},
		show : function(text, _buttons){
			var mask = Global.mask;

			mask.fillBody(this[0]);
			mask.show("confirm");
			Panel.prototype.show.call(this);
		}
	});

	Confirm.properties({
		action : "",
		addButton : function(_action, _text, _autoClose){
			return new MaskButton(_action, _text, _autoClose).appendTo(this.find(">footer")[0]);
		},
		text : ""
	});

	return Confirm.constructor;
}(
	this.MaskButton,
	// bodyHtml
	new HTML([
		'<div class="confirm" action="{action}">',
			'<header></header>',
			'<article class="whiteFont">{text}</article>',
			'<footer></footer>',
		'</div>'
	].join(""))
));

this.Alert = (function(Confirm, MaskButton){
	function Alert(text){
		this.classList.add("alert");
		new MaskButton("ok", "确定", true).appendTo(this.find(">footer")[0]);
	};
	Alert = new NonstaticClass(Alert, "Bao.UI.Control.Mask.Alert", Confirm.prototype);

	return Alert.constructor;
}(
	this.Confirm,
	this.MaskButton
));

Mask.members(this);
}.call(
	{},
	Bao.UI.Control.Mask,
	jQun.NonstaticClass,
	jQun.StaticClass,
	jQun.HTML,
	jQun.Event,
	Bao.API.DOM.Panel,
	Bao.Global
));