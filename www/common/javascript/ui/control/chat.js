(function(Chat, NonstaticClass, StaticClass, Panel, CallServer, HTML, Event, Enum, Global, Voice, set){
this.SmileNames = (function(){
	return new Enum({
		BengKui : "崩溃",
		BiShi : "鄙视",
		DeSe : "得瑟",
		FaHuo : "发火",
		Han : "汗",
		HuaXin : "花心",
		JinQian : "金钱",
		KouBi : "抠鼻",
		Kun : "困",
		KuQi : "哭泣",
		Leng : "冷",
		No : "No",
		ShiHua : "石化",
		ShuaiQi : "帅气",
		YingMing : "英明",
		YiWen : "疑问",
		Yun : "晕",
		Zan : "赞",
		ZhaoDa : "找打",
		ZhenJing : "震惊"
	});
}());

this.MessageMode = (function(){
	return new Enum(
		["Voice", "Text"]
	);
}());

this.SmiliesStatus = (function(){
	return new Enum(
		["Hide", "Show"]
	);
}());

this.SmileButtonActions = (function(){
	return new Enum(
		["Delete", "Enter", "BaoPiQiSmilies"]
	);
}());

this.Attachment = (function(){
	function Attachment(type, from, id, _src, _base64){
		///	<summary>
		///	附件。
		///	</summary>
		/// <param name="type" type="string">附件类型</param>
		/// <param name="id" type="string">附件id</param>
		/// <param name="from" type="string">附件的来源</param>
		/// <param name="_src" type="string">附件src</param>
		/// <param name="_base64" type="string">附件的64位字符串编码(目前仅用于图片)</param>
		this.assign({
			base64 : _base64 || (type === "image" ? _src : ""),
			from : from,
			id : id,
			src : _src,
			type : type
		});
	};
	Attachment = new NonstaticClass(Attachment, "Bao.UI.Control.Chat.Attachment");

	Attachment.properties({
		base64 : "",
		from : "",
		id : -1,
		resetFrom : function(from){
			this.from = from;
		},
		resetId : function(id){
			this.id = id;
		},
		src : "javascript:void(0);",
		type : "image"
	});

	return Attachment.constructor;
}(
	this.AttachmentTypes
));

this.ImageBox = (function(imageBoxHtml){
	function ImageBox(src){
		///	<summary>
		///	图片框，用于放大显示图片。
		///	</summary>
		/// <param name="src" type="string">图片路径</param>
		var mask = Global.mask;

		this.combine(imageBoxHtml.create({
			src : src
		}));

		this.attach({
			userclick : function(e, targetEl){
				if(targetEl.between(">aside>button", this).length > 0){
					mask.hide();
					return;
				}
			}
		});

		mask.fillBody(this[0]);
		mask.show("imageBox");
	};
	ImageBox = new NonstaticClass(ImageBox, "Bao.UI.Control.Chat.Attachment", Panel.prototype);

	return ImageBox.constructor;
}(
	// imageBoxHtml
	new HTML([
		'<div class="imageBox">',
			'<aside>',
				'<button>关闭</button>',
			'</aside>',
			'<p>',
				'<img src="{src}" />',
			'</p>',
		'</div>'
	].join(""))
));

this.ActiveVoice = (function(Attachment, round, lastActiveVoice){
	function ActiveVoice(selector, attachment){
		var activeVoice = this;
		
		this.assign({
			attachment :　attachment,
			buttonStyle : this.find(">button").style
		});

		this.attach({
			userclick : function(e){
				e.stopPropagation();
				activeVoice[activeVoice.isPlaying ? "pause" : "play"]();
			}
		}, true);

		this.play();
	};
	ActiveVoice = new NonstaticClass(ActiveVoice, "Bao.UI.Control.Chat.ActiveVoice", Panel.prototype);

	ActiveVoice.properties({
		attachment : new Attachment(),
		buttonStyle : undefined,
		isPlaying : false,
		pause : function(){
			this.isPlaying = false;
			this.classList = "";
			Voice.pause();
		},
		play : function(){
			var activeVoice = this, classList = this.classList,
			
				buttonStyle = this.buttonStyle, attachment = this.attachment;

			if(lastActiveVoice && lastActiveVoice !== this){
				lastActiveVoice.stop();
			}

			classList.add("downloading");

			Voice.play(attachment.id, attachment.from, function(i, max){
				classList.remove("downloading");

				if(!activeVoice.isPlaying){
					this.stop();
					return;
				}

				buttonStyle.left = round(i * 100 / max) + "%";
				activeVoice.position = i;
				
				if(i < max){
					return;
				}

				setTimeout(function(){
					activeVoice.stop();
				}, 1000);
			}, this.position);

			this.isPlaying = true;
			this.classList.add("playing");
			lastActiveVoice = this;
		},
		// 暂停点
		position : 0,
		stop : function(){
			this.buttonStyle.left = 0;
			this.position = 0;
			this.isPlaying = false;
			this.classList = "";
			Voice.stop();
		}
	});

	return ActiveVoice.constructor;
}(
	this.Attachment,
	Math.round,
	// lastActiveVoice
	undefined
));

this.EscapeSmilies = (function(SmileNames, NAMES_REGX, imgHtml){
	function EscapeSmilies(){};
	EscapeSmilies = new StaticClass(EscapeSmilies, "Bao.UI.Control.Chat.EscapeSmilies");

	EscapeSmilies.properties({
		escapeText : function(text){
			var EscapeSmilies = this;

			return text.replace(NAMES_REGX, function(str, name){
				return EscapeSmilies.getImageStringByName(name) || str;
			});
		},
		getImageStringByName : function(name){
			var src = "";

			SmileNames.every(function(smileName, pinyin){
				if(smileName === name){
					src = imgHtml.render({ pinyin : pinyin });
					return false;
				}
				
				return true;
			});

			return src;
		}
	});

	return EscapeSmilies;
}(
	this.SmileNames,
	// NAMES_REGX
	/\[([\s\S]+?)\]/g,
	// imgHtml
	new HTML('<img src="../../common/image/smilies/{pinyin}.png" />')
));

this.ReportConfirm = (function(Confirm, Alert){
	function ReportConfirm(messageId){
		var reportConfirm = this;

		this.attach({
			clickbutton : function(e){
				if(e.maskButton.action !== "ok")
					return;

				CallServer.open("reportMessage", { messageId : messageId }, function(){
					new Alert("已成功举报！").show();
				});
			}
		});

		this.show();
	};
	ReportConfirm = new NonstaticClass(ReportConfirm, "Bao.UI.Control.Chat.ReportConfirm", Confirm.prototype);

	ReportConfirm.override({
		text : "确定要举报此条消息吗？"
	});

	return ReportConfirm.constructor;
}(
	Bao.UI.Control.Mask.Confirm,
	Bao.UI.Control.Mask.Alert
));

this.MessageContentArea = (function(ActiveVoice){
	function MessageContentArea(selector, attachment){
		this.attach({
			userclick : function(e, targetEl){
				// 查看图片
				if(targetEl.between(">img", this).length > 0){
					// new ImageBox(targetEl.src);
					return;
				}

				var voicePanel = targetEl.between(">a", this);

				// 播放语音，同一个按钮只会进入这里一次，因为之后会被ActiveVoice类给截断冒泡
				if(voicePanel.length > 0){
					new ActiveVoice(voicePanel[0], attachment);
					return;
				}
			}
		});
	};
	MessageContentArea = new NonstaticClass(MessageContentArea, "Bao.UI.Control.Chat.MessageContentArea", Panel.prototype);

	return MessageContentArea.constructor;
}(
	this.ActiveVoice
));

/*
this.MessageAffiliateArea = (function(){
	function MessageAffiliateArea(selector){
	
	};
	MessageAffiliateArea = new NonstaticClass(MessageAffiliateArea, "Bao.UI.Control.Chat.MessageAffiliateArea", Panel.prototype);

	return MessageAffiliateArea.constructor;
}());
*/

this.Message = (function(Attachment, ImageBox, MessageContentArea, EscapeSmilies, ReportConfirm, clickDoEvent, clickPraiseEvent, messageHtml, praiseHtml){
	function Message(msg){
		///	<summary>
		///	单个信息。
		///	</summary>
		/// <param name="msg" type="object">信息数据</param>
		var message = this,
		
			type = msg.type, praise = msg.praise, attachment = msg.attachment;

		this.assign({
			attachment : attachment ? new Attachment(type, attachment.from, attachment.id, attachment.src, attachment.base64) : undefined,
			color : msg.color,
			id : msg.id,
			isSending : msg.isSending,
			poster : msg.poster,
			text : type === "smile" ? EscapeSmilies.escapeText(msg.text) : msg.text,
			time : msg.time,
			type : type
		});

		this.combine(messageHtml.create(this));
		
		new MessageContentArea(this.find(">figure>figcaption")[0], this.attachment);

		// 添加赞
		if(praise){
			praise.forEach(function(userData){
				this.addPraise(userData);
			}, this);
		}

		this.attach({
			longpress : function(){
				new ReportConfirm(message.id);
			}
		});

		// 点击附属功能区域
		this.find(">figure>nav").attach({
			userclick : function(e, targetEl){
				// 判断点击的是否是 赞 按钮
				if(targetEl.between(".chatList_praise>button", this).length > 0){
					var loginUser = Global.loginUser, userId = loginUser.id;

					if(message.isPraisedBy(userId))
						return;
					
					clickPraiseEvent.setEventAttrs({
						action : "add",
						message : message
					});
					clickPraiseEvent.trigger(targetEl[0]);
					return;
				}
				
				// 判断点击的是否是 do 按钮
				if(targetEl.between(">button", this).length > 0){
					clickDoEvent.setEventAttrs({ message : message });
					clickDoEvent.trigger(targetEl[0]);
					return;
				}

				// 判断点击的是否是 展开赞 按钮
				if(targetEl.between(".chatList_praise>sub>button", this).length > 0){
					message.classList.toggle("morePraised");
					return;
				}
			}
		});
	};
	Message = new NonstaticClass(Message, "Bao.UI.Control.Chat.Message", Panel.prototype);

	Message.properties({
		addPraise : function(userData){
			///	<summary>
			///	添加赞。
			///	</summary>
			/// <param name="userData" type="object">称赞用户的数据</param>
			var userId = userData.id;

			if(this.isPraisedBy(userId))
				return;

			var praisePanel = this.find(".chatList_praise"), praiseEl = praisePanel.find(">button");

			praiseEl.innerHTML = praiseEl.innerHTML - 0 + 1;
			praiseHtml.create(userData).insertTo(praisePanel.find(">p")[0], 0);

			if(userId !== Global.loginUser.id)
				return;
			
			this.setAttribute("praisedbyself", "");
		},
		// 附件信息
		attachment : new Attachment(),
		// 颜色
		color : 0,
		// id
		id : -1,
		// 是否发自自己
		isPostBySelf : false,
		isPraisedBy : function(id){
			///	<summary>
			///	是否被指定id的用户称赞过。
			///	</summary>
			/// <param name="id" type="number">称赞用户的id</param>
			return this.find('.chatList_praise>p>a[userid="' + id + '"]').length > 0;
		},
		// 该信息是否处于正在发送状态
		isSending : false,
		// 发送人
		poster : undefined,
		removePraise : function(id){
			///	<summary>
			///	移除赞。
			///	</summary>
			/// <param name="id" type="number">称赞用户的id</param>
			if(!this.isPraisedBy(id))
				return;

			var praisePanel = this.find(".chatList_praise"), praiseEl = praisePanel.find(">button");

			praiseEl.innerHTML = praiseEl.innerHTML - 1;
			praisePanel.find('>p>a[userid="' + id + '"]').remove();

			if(id !== Global.loginUser.id)
				return;
			
			this.removeAttribute("praisedbyself");
		},
		resetId : function(id){
			this.id = id;
		},
		sendCompleted : function(messageId, _attachmentId){
			this.isSending = false;

			this.id = messageId;

			if(_attachmentId === undefined)
				return;

			this.attachment.id = _attachmentId;
		},
		// 信息文本
		text : "",
		// 信息发送时间
		time : 0,
		// 信息种类
		type : "text"
	});

	return Message.constructor;
}(
	this.Attachment,
	this.ImageBox,
	this.MessageContentArea,
	this.EscapeSmilies,
	this.ReportConfirm,
	// clickDoEvent
	new Event("clickdo"),
	// clickPraiseEvent
	new Event("clickpraise"),
	// messageHtml
	new HTML([
		'<div class="chatList_message inlineBlock" action="{type}" ispostbyself="{poster.isLoginUser}">',
			'<aside>',
				'<p class="normalAvatarPanel" userid="{poster.id}">',
					'<img src="{poster.avatar}" />',
				'</p>',
			'</aside>',
			'<figure>',
				'<figcaption>',
					'<span>{text}</span>',
					'<a>',
						'<button></button>',
					'</a>',
					'<img src="{?~ attachment.base64}" />',
				'</figcaption>',
				'<nav class="whiteFont inlineBlock">',
					'<button>do</button>',
					'<aside class="chatList_praise">',
						'<button>0</button>',
						'<p class="inlineBlock"></p>',
						'<sub>',
							'<button></button>',
						'</sub>',
					'</aside>',
				'</nav>',
				'<p class="message_bg normalRadius projectColor_{color}">',
					'<span></span>',
				'</p>',
			'</figure>',
		'</div>'
	].join("")),
	// praiseHtml
	new HTML([
		'<a class="smallAvatarPanel " title="{name}" userid="{id}">',
			'<img src="{avatar}" />',
		'</a>'
	].join(""))
));

this.MessageList = (function(List, Message, itemHtml){
	function MessageList(listContainerOl){
		///	<summary>
		///	信息列表。
		///	</summary>
		this.assign({
			listContainerOl : listContainerOl
		});
	};
	MessageList = new NonstaticClass(MessageList, "Bao.UI.Control.Chat.MessageList", Panel.prototype);

	MessageList.override({
		push : function(msg){
			///	<summary>
			///	添加信息。
			///	</summary>
			/// <param name="msg" type="object">信息数据</param>
			var item = itemHtml.create(), message = new Message(msg);

			message.appendTo(item[0]);
			item.appendTo(this.listContainerOl);

			List.prototype.push.call(this, message);
			return message;
		}
	});

	MessageList.properties({
		listContainerOl : undefined
	});

	return MessageList.constructor;
}(
	jQun.List,
	this.Message,
	// itemHtml
	new HTML('<li></li>')
));

this.MessageGroup = (function(MessageList, Date,messageAppendedEvent, singleNumRegx, messageGroupHtml){
	function MessageGroup(time){
		///	<summary>
		///	信息分组区域。
		///	</summary>
		var dt = new Date(time),

			desc = "今天", t = new Date().setHours(0, 0, 0, 0) - time, hours = dt.getHours();
	console.log(dt);
				
		switch(true){
			case t < 0 :
				break;

			case t < 86400000 :
				desc = "昨天";
				break;

			case t < 86400000 * 2 :
				desc = "前天";
				break;

			default :
				desc = dt.getFullYear() + "年" + (dt.getMonth() + 1) + "月" + dt.getDate() + "日";
				break;
		}

		this.combine(
			messageGroupHtml.create({
				// 注意，这里是中文版本，不能用Date.prototype.toLocaleTimeString()，因为很多手机都是英文版本的。
				localTime : [
					desc,
					hours < 12 ? "上午" : "下午",
					// 如果是1位数，转化为2位数
					hours.toString().replace(singleNumRegx, "0$1"),
					":",
					// 如果是1位数，转化为2位数
					dt.getMinutes().toString().replace(singleNumRegx, "0$1")
				].join(" ")
			})
		);

		this.assign({
			messageList : new MessageList(this.find(">dd>ol")[0])
		});
	};
	MessageGroup = new NonstaticClass(MessageGroup, "Bao.UI.Control.Chat.MessageGroup", Panel.prototype);

	MessageGroup.properties({
		appendMessage : function(message){
			///	<summary>
			///	向信息分组添加信息。
			///	</summary>
			/// <param name="message" type="object">信息数据</param>
			var msg = this.messageList.push(message);

			messageAppendedEvent.setEventAttrs({ message : msg });
			messageAppendedEvent.trigger(this[0]);
			return msg;
		},
		messageList : undefined
	});

	return MessageGroup.constructor;
}(
	this.MessageList,
	Date,
	// messageAppendedEvent
	new Event("messageappended"),
	// singleNumRegx
	/^(\d)$/,
	// messageGroupHtml
	new HTML([
		'<dl>',
			'<dt class="smallRadius lightBgColor whiteFont">{localTime}</dt>',
			'<dd>',
				'<ol></ol>',
			'</dd>',
		'</dl>'
	].join(""))
));

this.ChatListContent = (function(MessageGroup){
	function ChatListContent(selector){
		///	<summary>
		///	聊天列表内容区域。
		///	</summary>
		/// <param name="selector" type="string, element">对应元素选择器</param>
	};
	ChatListContent = new NonstaticClass(ChatListContent, "Bao.UI.Control.Chat.ChatListContent", Panel.prototype);

	ChatListContent.properties({
		appendMessageToGroup : function(msg){
			///	<summary>
			///	添加信息。
			///	</summary>
			/// <param name="msg" type="object">信息数据</param>
			var messageGroup = this.messageGroup;

			msg = set({
				color : this.color
			}, msg);

			// 如果 messageGroup 存在
			if(messageGroup){
				var messageList = messageGroup.messageList, i = messageList.length - 1;

				// 如果 i > -1，说明消息总数大于0
				if(i > -1){
					// 如果 最后一条信息的时间 与 当前信息的时间 相差5分钟
					if(msg.time - messageList[i].time > 300000){
						this.appendMessageGroup(msg);
						return;
					}
				}
			}
			else {
				this.appendMessageGroup(msg);
				return;
			}

			// 添加消息
			return messageGroup.appendMessage(msg);
		},
		appendMessageGroup : function(message){
			///	<summary>
			///	添加信息分组。
			///	</summary>
			var messageGroup = new MessageGroup(message.time);

			messageGroup.appendTo(this[0]);
			messageGroup.appendMessage(message);

			this.messageGroup = messageGroup;
			return messageGroup;
		},
		clearAllMessages : function(){
			this.innerHTML = "";
			this.messageGroup = undefined;
		},
		color : 0,
		messageGroup : undefined,
		resetColor : function(color){
			this.color = color;
		}
	});

	return ChatListContent.constructor;
}(
	this.MessageGroup
));

this.Smilies = (function(Drag, SmiliesStatus, SmileNames, smiliesStatusChangedEvent, clickToolsButtonEvent, clickSmileEvent, smiliesHtml){
	function Smilies(selector){
		var smilies = this, navigator = new Drag.Navigator();

		navigator.content(smiliesHtml.render({ SmileNames : SmileNames }), 2);
		navigator.appendTo(this.find(">nav")[0]);

		this.attach({
			userclick : function(e, targetEl){
				if(targetEl.between(".navigator img", navigator[0]).length > 0){
					clickSmileEvent.setEventAttrs({
						text : targetEl.getAttribute("smilename")
					});

					clickSmileEvent.trigger(targetEl[0]);
					smilies.hide();
					return;
				}

				if(targetEl.between("figcaption>button", this).length > 0){
					clickToolsButtonEvent.setEventAttrs({ action : targetEl.getAttribute("action") - 0 });
					clickToolsButtonEvent.trigger(targetEl[0]);
					return;
				}
			}
		});

		navigator.attach({
			focustab : function(e){
				e.stopPropagation();
			}
		});

		jQun(window).attach({
			userclick : function(e, targetEl){
				if(targetEl.between(smilies[0], this).length === 0){
					smilies.hide();
				}
			}
		}, true);
	};
	Smilies = new NonstaticClass(Smilies, "Bao.UI.Control.Chat.Smilies", Panel.prototype);

	Smilies.override({
		hide : function(){
			var hideStatus = SmiliesStatus.Hide;

			if(this.status === hideStatus)
				return;

			this.status = hideStatus;

			smiliesStatusChangedEvent.setEventAttrs({ smiliesStatus : hideStatus });
			smiliesStatusChangedEvent.trigger(this[0]);

			Panel.prototype.hide.apply(this, arguments);
		},
		show : function(){
			var showStatus = SmiliesStatus.Show;

			if(this.status === showStatus)
				return;

			this.status = showStatus;

			smiliesStatusChangedEvent.setEventAttrs({ smiliesStatus : showStatus });
			smiliesStatusChangedEvent.trigger(this[0]);

			Panel.prototype.show.apply(this, arguments);
		}
	});

	Smilies.properties({
		status : SmiliesStatus.Hide
	});

	return Smilies.constructor;
}(
	Bao.UI.Control.Drag,
	this.SmiliesStatus,
	this.SmileNames,
	// smiliesStatusChangedEvent
	new Event("smiliesstatuschanged"),
	// clickToolsButtonEvent
	new Event("clicktoolsbutton"),
	// clickSmileEvent
	new Event("clicksmile"),
	// smiliesHtml
	new HTML([
		'<ol>',
			'<li action="BaoPiQiSmilies">',
				'@for(SmileNames ->> name, pinyin){',
					'<button>',
						'<img class="smallRadius" smilename="{name}" src="../../common/image/smilies/{pinyin}.png" />',
					'</button>',
				'}',
			'</li>',
		'</ol>'
	].join(""))
));

this.ChatInput = (function(MessageMode, SelectImage, Global, VoiceRecorder, messageCompletedEvent, wantsToShowSmiliesEvent){
	function ChatInput(selector){
		///	<summary>
		///	聊天输入。
		///	</summary>
		/// <param name="selector" type="string">对应元素选择器</param>
		var chatInput = this, selectImage = new SelectImage();
		
		new VoiceRecorder(this.find(">p>button:first-child")[0]);

		// 点击事件
		this.attach({
			userclick : function(e, targetEl){
				if(targetEl.between(">button", this).length > 0){
					// 移除或添加voice
					var voiceMode = MessageMode.Voice;

					chatInput.changeMode(chatInput.mode === voiceMode ? MessageMode.Text : voiceMode);
					return;
				}

				if(targetEl.between(">p>input", this).length > 0){
					targetEl.focus();
					return;
				}

				if(targetEl.between(">aside>button:first-child", this).length > 0){
					chatInput.changeMode(MessageMode.Text);
					wantsToShowSmiliesEvent.trigger(chatInput[0]);
					return;
				}

				if(targetEl.between(">aside>button:last-child", this).length > 0){
					selectImage.show();
					return;
				}
			},
			stoprecord : function(e){
				chatInput.messageCompleted("voice", "", { src : e.voiceSrc });
			}
		});

		// 文本框事件
		this.getTextEl().attach({
			keyup : function(e){
				if(e.keyCode === 13){
					chatInput.enter();
					return;
				}
			}
		});

		selectImage.attach({
			imageloaded : function(e){
				chatInput.messageCompleted(
					"image", 
					"",
					{
						base64 : e.base64,
						src : e.src
					}
				);
			}
		});
	};
	ChatInput = new NonstaticClass(ChatInput, "Bao.UI.Control.Chat.ChatInput", Panel.prototype);

	ChatInput.properties({
		changeMode : function(messageMode){
			if(messageMode === this.mode)
				return;

			this.classList[messageMode === MessageMode.Text ? "remove" : "add"]("voice");
			this.mode = messageMode;
		},
		deleteTextByLength : function(_len){
			var textEl = this.getTextEl(), value = textEl.value;

			textEl.value = _len ? value.substring(0, value.length - _len) : "";
		},
		enter : function(){
			var textEl = this.getTextEl(), value = textEl.value;

			if(value === "")
				return;

			this.messageCompleted("text", value);
			textEl.value = "";
		},
		getTextEl : function(){
			return this.find(">p>input");
		},
		insertText : function(text){
			var input = this.find(">p>input")[0],
			
				value = input.value,

				selectionStart = input.selectionStart;

			//input.setRangeText(text);
			input.value = value.substring(0, selectionStart) + text + value.substring(selectionStart);
			input.selectionEnd = input.selectionStart = selectionStart + text.length;
		},
		messageCompleted : function(type, _text, _attachment){
			// 当用户输入完成，提交的时候触发
			messageCompletedEvent.setEventAttrs({
				message : {
					attachment : _attachment,
					text : _text,
					time : new Date().getTime(),
					type : type
				}
			});
			messageCompletedEvent.trigger(this[0]);
		},
		mode : MessageMode.Text
	});

	return ChatInput.constructor;
}(
	this.MessageMode,
	Bao.UI.Control.File.SelectImage,
	Bao.Global,
	Bao.UI.Control.File.VoiceRecorder,
	// messageCompletedEvent
	new Event("messagecompleted"),
	// wantsToShowSmiliesEvent
	new Event("wantstoshowsmilies")
));

this.ChatFooter = (function(Smilies, ChatInput, SmileButtonActions){
	function ChatFooter(selector){
		var	smilies = new Smilies(this.find("figure")),

			chatInput = new ChatInput(this.find(">nav"));
			
		this.attach({
			continuousgesture : function(e){
				e.stopPropagation();
			},
			fastgesture : function(e){
				e.stopPropagation();
			},
			wantstoshowsmilies : function(){
				smilies.show();
			},
			clicksmile : function(e){
				chatInput.messageCompleted("smile", "[" + e.text + "]");
			},
			clicktoolsbutton : function(e){
				var action = e.action;

				if(action === SmileButtonActions.Enter){
					chatInput.enter();
					return;
				}

				if(action === SmileButtonActions.Delete){
					chatInput.deleteTextByLength(1);
					return;
				}
			}
		});
	};
	ChatFooter = new NonstaticClass(ChatFooter, "Bao.UI.Control.Chat.ChatFooter", Panel.prototype);

	return ChatFooter.constructor;
}(
	this.Smilies,
	this.ChatInput,
	this.SmileButtonActions
));

this.ChatList = (function(ChatListContent, ChatFooter, listPanelHtml){
	function ChatList(){
		///	<summary>
		///	聊天列表。
		///	</summary>
		var chatFooter, chatListContent, chatList = this;
		
		this.combine(listPanelHtml.create({ isLeader : Global.loginUser.isLeader }));

		chatListContent = new ChatListContent(this.article[0]);
		chatFooter = new ChatFooter(this.footer[0]);
		
		this.assign({
			chatListContent : chatListContent
		});
		
		chatFooter.attach({
			messagecompleted : function(e){
				var message = set({}, e.message), poster = set({}, Global.loginUser);

				poster.isLoginUser = true;

				set(message, {
					isPraisedBySelf : false,
					isSending : true,
					poster : poster
				});

				chatListContent.appendMessageToGroup(message);
			}
		});
	};
	ChatList = new NonstaticClass(ChatList, "Bao.UI.Control.Chat.ChatList", Panel.prototype);

	ChatList.properties({
		chatListContent : undefined
	});

	return ChatList.constructor;
}(
	this.ChatListContent,
	this.ChatFooter,
	// listPanelHtml
	new HTML([
		'<div class="chatList">',
			'<article class="chatList_content" isleader="{isLeader}"></article>',
			'<footer class="chatList_footer">',
				'<nav class="chatList_input inlineBlock">',
					'<button></button>',
					'<p>',
						'<button class="smallRadius">按住说话</button>',
						'<input class="smallRadius" type="text" placeholder="输入文字.." stayput="" />',
					'</p>',
					'<aside>',
						'<button></button>',
						'<button></button>',
					'</aside>',
				'</nav>',
				'<figure class="chatList_smilies">',
					'<nav></nav>',
					'<figcaption>',
						'@for(3 ->> i){',
							'<button class="smallRadius" action="{i}"></button>',
						'}',
					'</figcaption>',
				'</figure>',
			'</footer>',
		'</div>'
	].join(""))
));

this.ChatListPanel = (function(ChatList, Global, SmiliesStatus){
	function ChatListPanel(from, messageAppendedMethodName, overflowPanel){
		var chatListPanel = this;

		this.assign({
			from : from,
			overflowPanel : overflowPanel
		});

		this.attach({
			messageappended : function(e){
				var message = e.message;

				overflowPanel.bottom();

				if(!message.isSending)
					return;

				var type = message.type, attachment = message.attachment,

					params = {
						attachment : attachment,
						text : message.text,
						type : type
					};

				attachment.resetFrom(from);

				params[from + "Id"] = chatListPanel.fromId;

				CallServer.open(messageAppendedMethodName, params, function(data){
					if(type === "voice"){
						attachment.resetFrom(from);
						attachment.resetId(data.id);
					}

					message.resetId(data.id);
				});
			},
			clickpraise : function(e){
				var message = e.message, loginUser = Global.loginUser;

				CallServer.open("praise", {
					messageId : message.id,
					userId : loginUser.id,
					type : from
				}, function(){
					message.addPraise(loginUser);
				})
			},
			clickdo : function(e){
				var sendTodo = Global.history.go("sendTodo");

				sendTodo.selectUser(e.message.poster);
				sendTodo.resetProjectId(chatListPanel.fromId);
			},
			smiliesstatuschanged : function(e){
				overflowPanel.parent().classList[e.smiliesStatus === SmiliesStatus.Hide ? "remove" : "add"]("showSmilies");
				overflowPanel.bottom();
			}
		});
	};
	ChatListPanel = new NonstaticClass(ChatListPanel, "Bao.UI.Control.Chat.ChatListPanel", ChatList.prototype);

	ChatListPanel.properties({
		from : "",
		fromId : -1,
		overflowPanel : undefined,
		reset : function(fromId, color){
			var oldFromId = this.fromId, from = this.from,
			
				chatListContent = this.chatListContent;

			if(oldFromId !== -1){
				CallServer.open("stopMessagesListener", { id : oldFromId, type : from });
				return;
			}

			this.fromId = fromId;

			this.overflowPanel.setTop(0);
			chatListContent.clearAllMessages();
			chatListContent.resetColor(color);

			CallServer.open("messagesListener", { id : fromId, type : from }, function(messages){
				// 添加聊天信息
				messages.forEach(function(msg){
					chatListContent.appendMessageToGroup(msg);
				});
			});
		}
	});

	return ChatListPanel.constructor;
}(
	this.ChatList,
	Bao.Global,
	this.SmiliesStatus
));

Chat.members(this);
}.call(
	{},
	Bao.UI.Control.Chat,
	jQun.NonstaticClass,
	jQun.StaticClass,
	Bao.API.DOM.Panel,
	Bao.CallServer,
	jQun.HTML,
	jQun.Event,
	jQun.Enum,
	Bao.Global,
	Bao.API.Media.Voice,
	jQun.set
));