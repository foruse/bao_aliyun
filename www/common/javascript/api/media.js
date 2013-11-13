(function(Media, NonstaticClass, StaticClass){
this.Voice = (function(IntervalTimer, Models){
	function Voice(){};
	Voice = new StaticClass(Voice, "Bao.API.Media");

	Voice.properties({
		pause : function(){
			if(!Models.VoiceMessage)
				return;

			Models.VoiceMessage.pause();
		},
		play : function(id, type, callback, _position){
			var VoiceMessage = Models.VoiceMessage;

			if(!VoiceMessage){
				new IntervalTimer(1000).start(function(i){
					i = i + (_position || 0);

					callback.call(this, i, 5);
				}, 5 - (_position || 0), true);
				return;
			}

			Models.VoiceMessage.play(id, type, function(len, position){
				new IntervalTimer(1000).start(function(i){
					callback.call(this, i + position, len);
				}, len, true);
			});
		},
		recordStart : function(){
			if(!Models.VoiceMessage)
				return;

			var Voice = this;

			Models.VoiceMessage.record_start(function(src){
				Voice.src = src;
			});
		},
		recordStop : function(target){
			if(Models.VoiceMessage){
				Models.VoiceMessage.record_stop();
			}

			return this.src;
		},
		save : function(){
			if(!Models.VoiceMessage)
				return;

			Models.VoiceMessage.save();
		},
		src : "",
		stop : function(){
			if(!Models.VoiceMessage)
				return;

			Models.VoiceMessage.stop();
		}
	});

	return Voice;
}(
	Bao.API.Management.IntervalTimer,
	window.Models
));

Media.members(this);
}.call(
	{},
	Bao.API.Media,
	jQun.NonstaticClass,
	jQun.StaticClass
));