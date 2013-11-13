(function(Management, NonstaticClass, StaticClass){
this.Loader = (function(Storage, Index, HTML){
	function Loader(){};
	Loader = new StaticClass(Loader);

	Loader.properties({
		aboutBaoPiQi : function(){
			return new Index.Deep.AboutBaoPiQi("#aboutBaoPiQi");
		},
		account : function(){
			return new Index.Deep.Account("#account", new HTML(jQun("#account_html")));
		},
		addProject : function(){
			return new Index.Secondary.AddProject("#addProject");
		},
		archive : function(){
			return new Index.Deep.Archive("#archive");
		},
		archivedProjectView : function(){
			return new Index.Deep.ArchivedProjectView(
				"#archivedProjectView",
				new HTML(jQun("#archivedProjectView_attachments_html")),
				new HTML(jQun("#archivedProjectView_todo_html"))
			);
		},
		businessCard : function(){
			return new Index.Secondary.BusinessCard("#businessCard", new HTML(jQun("#businessCard_html")));
		},
		createFirstProject : function(){
			this.load("guidance");
			return new Index.Guidance.CreateFirstProject("#createFirstProject");
		},
		demo : function(){
			this.load("guidance");
			return new Index.Guidance.Demo("#demo", new HTML(jQun("#demo_html")));
		},
		discussion : function(){
			this.load("singleProject");
			return new Index.SingleProject.Discussion("#discussion", new HTML(jQun("#discussion_info_html")));
		},
		globalSearch : function(){
			return new Index.Deep.GlobalSearch("#globalSearch", new HTML(jQun("#globalSearch_group_html")));
		},
		guidance : function(){
			return new Index.Guidance.Self("#guidance");
		},
		invitation : function(){
			this.load("guidance");
			return new Index.Guidance.Invitation("#invitation", new HTML(jQun("#invitation_html")));
		},
		load : function(name){
			var pagePanel = this.pageStorage.get(name);

			if(!pagePanel){
				pagePanel = this.pageStorage[name] = this[name]();
			}

			return pagePanel;
		},
		login : function(){
			this.load("guidance");
			return new Index.Guidance.Login("#login");
		},
		pageStorage : new Storage(),
		partner : function(){
			this.load("spp");
			return new Index.SPP.Partner("#partner", new HTML(jQun("#spp_partnerGroups_html")));
		},
		project : function(){
			this.load("spp");
			return new Index.SPP.Project("#project", new HTML(jQun("#spp_project_html")));
		},
		projectManagement : function(){
			return new Index.Deep.ProjectManagement("#projectManagement");
		},
		qrCode : function(){
			return new Index.Deep.QRCode("#QRCode", new HTML(jQun("#QRCode_html")));
		},
		schedule : function(){
			this.load("spp");
			return new Index.SPP.Schedule("#schedule", new HTML(jQun("#spp_scheduleSign_html")));
		},
		sendTodo : function(){
			return new Index.Deep.SendTodo("#sendTodo", new HTML(jQun("#sendTodo_attachment_html")));
		},
		spp : function(){
			return new Index.SPP.Self("#SPP");
		},
		singleProject : function(){
			return new Index.SingleProject.Self("#singleProject");
		},
		systemContacts : function(){
			return new Index.Secondary.SystemContacts("#systemContacts", new HTML(jQun("#systemContacts_html")));
		},
		systemOption : function(){
			return new Index.Secondary.SystemOption("#systemOption");
		},
		todo : function(){
			return new Index.Deep.Todo("#todo", new HTML(jQun("#todo_info_html")));
		},
		todoList : function(){
			this.load("singleProject");
			return new Index.SingleProject.TodoList("#todoList");
		},
		uploadAvatar : function(){
			this.load("guidance");
			return new Index.Guidance.UploadAvatar("#uploadAvatar");
		},
		workStream : function(){
			this.load("singleProject");
			return new Index.SingleProject.WorkStream("#workStream", new HTML(jQun("#workStream_info_html")));
		}
	});

	return Loader;
}(
	jQun.Storage,
	Bao.Page.Index,
	jQun.HTML
));

this.History = (function(List, Loader, redirectEvent){
	function History(){};
	History = new NonstaticClass(History, "Bao.API.Management.History", List.prototype);

	History.properties({
		back : function(){
			///	<summary>
			///	回到上一个记录。
			///	</summary>
			this.go(this[this.length - 2], true);
		},
		clear : function(_name){
			///	<summary>
			///	清除所有记录。
			///	</summary>
			if(!_name){
				return this.splice(0);
			}

			var idx = this.indexOf(_name);

			return idx > -1 ? this.splice(idx, 1) : "";
		},
		go : function(name, _isBack){
			///	<summary>
			///	跳转到指定名称的页面。
			///	</summary>
			///	<param name="name" type="string">需要跳转的页面名称。</param>
			if(!name){
				name = this.homePage;
			}

			var idx = this.indexOf(name), lastIdx = this.length - 1;
			
			// 如果是当前页，或者记录条数为0
			if(lastIdx > -1){
				if(idx === lastIdx){
					return Loader.pageStorage[this[idx]];
				}
				else {
					// 隐藏上一个panel
					Loader.pageStorage[this[lastIdx]].hide();
				}
			}

			var panel;

			redirectEvent.trigger(window);

			if(idx > -1){
				panel = Loader.pageStorage[name];

				if(_isBack){
					this.splice(idx + 1);
				}
				else {
					this.splice(idx, 1);
					this.push(name);
				}

				// 显示当前的panel
				panel.show();
			}
			else {
				// 加载、初始化新panel信息
				panel = Loader.load(name);

				this.push(name);

				panel.show();
			}
			
			return panel;
		},
		homePage : "project"
	});

	return History.constructor;
}(
	jQun.List,
	this.Loader,
	// redirectEvent
	new jQun.Event("redirect", function(){
		this.attachTo(window);
	})
));

this.Timer = (function(setTimeout, clearTimeout){
	function Timer(_timeout){
		///	<summary>
		///	计时器(时间管理器)。
		///	</summary>
		///	<param name="_timeout" type="number">超时时间。</param>
		this.assign({
			timeout : _timeout || 200
		});
	};
	Timer = new NonstaticClass(Timer, "Bao.API.Management.Timer");

	Timer.properties({
		stop : function(_onbreak){
			///	<summary>
			///	停止计时器。
			///	</summary>
			///	<param name="_onbreak" type="function">如果未超时就被停止，那么会执行这个中断函数，否则不会执行。</param>
			var index = this.index;

			this.isEnabled = false;

			// 如果计时器已运行，说明已超时，则return
			if(index === -1)
				return;

			// 清除计时器
			clearTimeout(index);
			this.index = -1;

			if(typeof _onbreak === "function"){
				_onbreak();
			}
		},
		index : -1,
		isEnabled : false,
		timeout : 200,
		start : function(_ontimeout){
			///	<summary>
			///	开始计时器，该计时器需要人为手动停止。
			///	</summary>
			///	<param name="_ontimeout" type="function">超时所执行的函数。</param>

			// 如果已经开始，则return
			if(this.isEnabled)
				return;

			var timer = this;

			this.index = -1;
			this.isEnabled = true;

			// 设置计时器
			this.index = setTimeout(function(){
				this.index = -1;

				if(!_ontimeout)
					return;

				_ontimeout.call(timer);
			}.bind(this), this.timeout || 200);
		}
	});

	return Timer.constructor;
}(
	// setTimeout
	setTimeout,
	// clearTimeout
	clearTimeout
));

this.IntervalTimer = (function(Timer){
	function IntervalTimer(_timeout){ };
	IntervalTimer = new NonstaticClass(IntervalTimer, "Bao.API.Management.IntervalTimer", Timer.prototype);

	IntervalTimer.override({
		start : function(oninterval, _times, _isDirectly){
			///	<summary>
			///	开始计时器，如果为无限循环，则该计时器需要人为手动停止。
			///	</summary>
			///	<param name="oninterval" type="function">间隔时间所执行的函数。</param>
			///	<param name="_times" type="number">执行次数。</param>
			///	<param name="_isDirectly" type="boolean">是否马上执行第一次操作，否则要等第一次间隔再执行。</param>
			var intervalTimer = this,

				// 记录当前执行了多少次
				i = 0,

				isNaN = window.isNaN,

				start = Timer.prototype.start;

			// 如果不存在，则表明是无限次数
			if(!_times){
				i = NaN;
				_times = -1;
			}

			if(_isDirectly){
				oninterval.call(this, i);
			}

			start.call(this, function(){
				// 如果是有限次数，则记录
				if(!isNaN(i)){
					i = i + 1;
				}

				// 执行间隔函数
				oninterval.call(this, i);

				// 如果该计时器在oninterval函数内被中断，就return
				if(!intervalTimer.isEnabled)
					return;

				intervalTimer.stop();

				// 达到最大次数
				if(i === _times)
					return;

				// 递归
				start.call(intervalTimer, arguments.callee);
			});
		}
	});

	return IntervalTimer.constructor;
}(
	this.Timer
));

Management.members(this);
}.call(
	{},
	Bao.API.Management,
	jQun.NonstaticClass,
	jQun.StaticClass
));