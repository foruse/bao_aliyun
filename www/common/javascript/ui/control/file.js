(function(File, NonstaticClass, StaticClass, HTML, Event, Panel, fullName){
this.ImageFile = (function(Models, Mask, inputHtml, fileReader, imageLoadedEvent){
	function FileReader(){
		var FileReader = this;
		
		fileReader.onload = function(){
			imageLoadedEvent.setEventAttrs({
				file : FileReader.file,
				base64 : this.result,
				src : ""
			});

			imageLoadedEvent.trigger(FileReader.fileElement);

			FileReader.file = undefined;
			FileReader.fileElement = undefined;
		};
	};
	FileReader = new StaticClass(FileReader);

	FileReader.properties({
		file : undefined,
		fileElement : undefined,
		read : function(file, element){
			this.file = file;
			this.fileElement = element;
			fileReader.readAsDataURL(file);
		}
	});

	function ImageFile(_selector){
		var imageFile = this, Picture = Models.Picture;

		if(!_selector){
			this.combine(inputHtml.create());
		}

		if(Picture){
			this.attach({
				click : function(e){
					e.preventDefault();

					Picture.album(function(src){
						imageLoadedEvent.setEventAttrs({
							file : null,
							src : src,
							base64 : src
						});

						imageLoadedEvent.trigger(imageFile[0]);
					});
				}
			});

			return;
		}

		this.attach({
			change : function(){
				var file = this.files[0];

				if(!file){
					return;
				}

				if(!file.name.match(/\.(png|jpg|jpeg|bmp|gif)$/)){
					new Mask.Alert("请选择图像文件！").show();
					this.value = "";
					return;
				}

				FileReader.read(file, this);
				this.value = "";
			},
			imageloaded : function(e){
				imageFile.selectSrc = e.src;
			}
		});
	};
	ImageFile = new NonstaticClass(ImageFile, fullName("ImageFile"), Panel.prototype);

	ImageFile.properties({
		selectedSrc : null
	});

	return ImageFile.constructor;
}(
	window.Models,
	Bao.UI.Control.Mask,
	// inputHtml
	new HTML('<input class="imageFile" type="file" accept="image/*" />'),
	// fileReader
	new FileReader(),
	// imageLoadedEvent
	new Event("imageloaded")
));

this.VoiceRecorder = (function(voiceHtml, Global, Voice, stopRecordEvent){
	function VoiceRecorder(_selector){
		var voiceRecorder = this;

		if(!_selector){
			this.combine(voiceHtml.create());
		}

		this.attach({
			touchstart : function(e){
				voiceRecorder.start();
			}
		}, true);

		jQun(window).attach({
			touchend : function(){
				voiceRecorder.stop();
			},
			touchcancel : function(){
				voiceRecorder.stop();
			}
		});
	};
	VoiceRecorder = new NonstaticClass(VoiceRecorder, fullName("VoiceRecorder"), Panel.prototype);

	VoiceRecorder.properties({
		isRecording : false,
		start : function(){
			if(this.isRecording)
				return;

			this.isRecording = true;
			Global.mask.fillBody("", true);
			Global.mask.show("voiceRecording");
			Voice.recordStart();
		},
		stop : function(){
			if(!this.isRecording)
				return;

			this.isRecording = false;
			Global.mask.hide();

			stopRecordEvent.setEventAttrs({
				voiceSrc : Voice.recordStop()
			});
			stopRecordEvent.trigger(this[0]);
		}
	});

	return VoiceRecorder.constructor;
}(
	// voiceHtml
	new HTML('<button class="voiceRecorder"></button>'),
	Bao.Global,
	Bao.API.Media.Voice,
	// stopRecordEvent
	new Event("stoprecord")
));

this.Attachment = (function(ImageFile, VoiceRecorder, attachmentHtml, attchmentCompletedEvent){
	function Attachment(){
		var attachment = this;

		this.combine(attachmentHtml.create());

		new VoiceRecorder().appendTo(this.find('li[atype="voice"]')[0]);
		new ImageFile().appendTo(this.find('li[atype="image"]')[0]);

		this.attach({
			imageloaded : function(e){
				attachment.completed("image", e.src);
			},
			stoprecord : function(e){
				attachment.completed("voice", e.voiceSrc);
			}
		});
	};
	Attachment = new NonstaticClass(Attachment, fullName("Attachment"), Panel.prototype);

	Attachment.properties({
		completed : function(type, src){
			attchmentCompletedEvent.setEventAttrs({
				attachmentType : type,
				attachmentSrc : src
			});
			attchmentCompletedEvent.trigger(this[0]);
		}
	});

	return Attachment.constructor;
}(
	this.ImageFile,
	this.VoiceRecorder,
	// attachmentHtml
	new HTML([
		'<div class="attachment">',
			'<ul class="inlineBlock lightBdColor smallRadius">',
				'<li class="lightBdColor" atype="voice"></li>',
				'<li class="lightBdColor" atype="image"></li>',
				'<li class="lightBdColor" atype="map"></li>',
			'</ul>',
		'</div>'
	].join("")),
	// attchmentCompletedEvent
	new Event("attachmentcompleted")
));

this.SelectImage = (function(Confirm, ImageFile){
	function SelectImage(_action){
		var selectImageFile = this, imageFile = new ImageFile();
		
		this.classList.add("selectImage");
		this.addButton("image", "添加图片", false);
		this.addButton("camera", "相机拍照", false);
		this.addButton("map", "添加地图", false);

		imageFile.appendTo(this.find('button[action="image"]')[0]);

		this.attach({
			imageloaded : function(){
				selectImageFile.hide();
			},
			clickbutton : function(e){
				var action = e.maskButton.action;

				console.log(action);
			}
		});
	};
	SelectImage = new NonstaticClass(SelectImage, fullName("SelectImage"), Confirm.prototype);

	SelectImage.override({
		action : "all",
		hide : function(){
			if(this.disabled)
				return;

			Confirm.prototype.hide.apply(this, arguments);
		},
		show : function(){
			if(this.disabled)
				return;

			Confirm.prototype.show.apply(this, arguments);
		}
	});

	SelectImage.properties({
		disable : function(){
			this.disabled = true;
		},
		disabled : false,
		enable : function(){
			this.disabled = false;
		}
	});

	return SelectImage.constructor;
}(
	Bao.UI.Control.Mask.Confirm,
	this.ImageFile
));

File.members(this);
}.call(
	{},
	Bao.UI.Control.File,
	jQun.NonstaticClass,
	jQun.StaticClass,
	jQun.HTML,
	jQun.Event,
	Bao.API.DOM.Panel,
	// fullName
	function(name){
		return "Bao.UI.Control.File." + name;
	}
));