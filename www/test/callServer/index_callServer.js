(function(Bao, JSON, Text, Index){
this.CallServer = (function(CallServer, Wait, open, allHandlers){
	CallServer.setResponseType("json");
	// 开始测试
	CallServer.beginTesting();

	// 重写open方法
	CallServer.override({
		open : function(name, params, _complete, _isUpload){
			var LoadingBar = Wait.LoadingBar;

			//LoadingBar.show(_isUpload ? "正在上传数据.." : null);

			open.call(CallServer, name, params, function(data, isCache, isSuccess){
				if(isCache){
					LoadingBar.hide();
					_complete(data);
					return;
				}

				// 测试延迟设置
				setTimeout(function(){
					if(!isSuccess){
						//LoadingBar.error((_isUpload ? "上传" : "加载") + "数据失败..");
						return;
					}

					LoadingBar.hide();

					if(typeof _complete === "function"){
						_complete(data);
					}
				}, 0);
			});
		}
	});

	CallServer.save([
		["addProject",			new Text("url?title={title}&color={color}&desc={desc}&users={users}"), "POST"],
		["getLoginInfo",		"url",										""],
		["messagesListener",	new Text("url?id={id}&type={type}"),		"", true],
		["getPartnerGroups",	"url",										"", true],
		["getPartners",			new Text("url?groupId={groupId}"),			"", true],
		["getProjects",			"url",										"", true],
		["getSchedules",		new Text("url?time={time}"),	"", true],
		["getSingleProject",	new Text("url?id={id}"),					"", true],
		["getUser",				new Text("url?id={id}"),					"", true],
		["globalSearch",		new Text("url?search={search}"),			"", true],
		["invitation",			new Text("url?emails={emails}"),			""],
		["login",				new Text("url?email={email}&pwd={pwd}"),	""],
		["myInformation",		"url",										"", true],
		["praise",				new Text("url?messageId={messageId}"),		""],
		["register",			new Text("url?name={name}&pwd={pwd}&email={email}&validation={validation}"),	""],
		["getTodo",				new Text("url?id={id}"),					"", true],
		["getTodoList",			new Text("url?id={id}"),					"",	true],
		["sendTodo",			new Text("url?title={title}&remind={remind}&desc={desc}&attachments={attachments}&date={date}"), "POST"],
		["todoCompleted",		new Text("url?id={id}"),					""],
		["getWorkStream",		new Text("url?id={id}"),					"", true],
		["addComment",			new Text("url?text={text}&type={type}&projectId={projectId}"),	""],
		["createGroup",			new Text("url?users=[users]&name={name}"),	""],
		["getSystemContacts",	"url",										"", true],
		["getAllArchives",		"url",										"", true],
		["getArchivedProject",	new Text("url?id={id}"),					"", true],
		["addCommentForTodo",	new Text("url?text={text}&type={type}&projectId={projectId}"),	""],
		["logout",				"",											""],
		["editProjectInfo",		new Text("url?projectId={projectId}&users={users}"),		""],
		["removeProject",		new Text("url?projectId={projectId}"),		""],
		["editAccount",			new Text("url?positon={positon}&avatar={avatar}&phoneNum={phoneNum}&email={email}&password={password}"), ""],
		["archiveProject",		new Text("url?porjectId={projectId}"),		""],
		["registerUserInfo",	new Text("url?id={id}&name={name}&avatar={avatar}"),""],
		["assignPermissions",	new Text("url?id={id}"),					""],
		["removePermissions",	new Text("url?id={id}"),					""],
		["getReportedInfo",		"",											""],
		["deleteReport",		new Text("url?id={id}"),											""],
		["ignoreReport",		new Text("url?id={id}"),											""],
		["getCountOfReports",	"",											""],
		["stopMessagesListener",new Text("url?id={id}&from={from}"),		""],
		["reportMessage",		new Text("url?messageId={messageId}"),		""]
	], allHandlers);

	return CallServer;
}(
	jQun.Ajax,
	Bao.UI.Control.Wait,
	jQun.Ajax.open,
	// allHandlers
	{
		getPartnerGroups : function(data){
			data = Index.SPP.getPartnerGroups();

			return {
				groups : data
			};
		},
		getPartners : function(data){
			var userListCollection = [], letters = {},
				forEach = jQun.forEach, charCodeAt = "".charCodeAt;

			forEach("ABCDEFGHIJKLMNOPQRSTUVWXYZ", function(l){
				letters[l] = -1;
			});

			data = Index.Common.getUsers(30);

			forEach(data, function(user){
				var firstLetter = user.pinyin.substring(0, 1).toUpperCase(),
						
					idx = letters[firstLetter];

				if(idx === -1){
					letters[firstLetter] = userListCollection.length;
					userListCollection.push({
						firstLetter : firstLetter,
						users : [user]
					});

					return;
				}

				userListCollection[idx].users.push(user);
			});

			userListCollection.sort(function(i, n){
				return charCodeAt.call(i.firstLetter) - charCodeAt.call(n.firstLetter);
			});

			return {
				letters : letters,
				userListCollection : userListCollection
			};
		},
		getProjects : function(data){
			data = {
				projects : Index.SPP.getProjects(15),
				pageIndex : 1,
				pageMax : 1,
				pageSize : 15,
				emptyFolders : 3
			};
			/*
			data.projects.forEach(function(pro){
				pro.status = 1;
			});
			*/
			return data;
		},
		getSchedules : function(data, params){
			data = Index.SPP.getSchedules(params.time);

			data.forEach(function(d){
				var localDate = new Date(d.time);

				jQun.set(d, {
					localeDateString : localDate.toLocaleDateString(),
					date : localDate.getDate()
				});

				d.todos.forEach(function(todo){
					todo.key = todo.id;
				});
			});

			return {
				schedules : data
			};
		},
		getUser : function(data){
			data = Index.Common.getUser();

			return data;
		},
		myInformation : function(data){
			data = Index.Common.myInformation();

			return data;
		},
		addProject : function(data){
			data = { id : Bao.Test.DummyData.Generate.Number.random(6) };
			
			return data;
		},
		globalSearch : function(data){
			var random = Bao.Test.DummyData.Generate.Number.random,

				projects = Index.SPP.getProjects(random(10)),

				partners = Index.Common.getUsers(random(10)),

				dt = {
					projects : [],
					todo : [],
					comments : [],
					partners : []
				};
				/*
			projects.forEach(function(pro){
				var creator = pro.creator, time = new Date(pro.creationTime);

				this.push({
					key : pro.id,
					title : creator.name,
					desc : pro.title,
					time : [time.getDate(), time.getMonth() + 1, time.getFullYear().toString().substring(2)].join("/"),
					avatar : creator.avatar
				});
			}, dt.projects);
			*/
			partners.forEach(function(user){
				this.push({
					key : user.id,
					title : user.name,
					avatar : user.avatar,
					desc : user.position
				});
			}, dt.partners);

			data = dt;

			return data;
		},
		getSingleProject : function(data, params){
			data = Index.SingleProject.getSingleProject();

			data.id = params.id;
			data.pageMax = data.pageIndex + (data.emptyFolders > 0 ? 0 : 1);

			return data;
		},
		getLoginInfo : function(data){
			data = {
				count : Bao.Test.DummyData.Generate.Number.random(9999999),
				validationImage : "javascript:void(0);"
			};

			return data;
		},
		messagesListener : function(data, params){
			var id = Bao.Global.loginUser.id;

			if(params.id !== Infinity){
				data = Index.SingleProject.getMessages();

				data.forEach(function(dt){
					var poster = dt.poster;

					poster.isLoginUser = poster.id === id;
				});
			}
			else {
				var random = Bao.Test.DummyData.Generate.Number.random;

				data = {
					id : random(555),
					messagesCount  : random(10)
				};
			}

			return data;
		},
		login : function(data){
			var user = Index.Common.getUser();

			data = {
				user : user,
				status : 0
			};

			return data;
		},
		getTodo : function(data){
			data = Index.Deep.getTodoInfo();

			return data;
		},
		getTodoList : function(data){
			var completed = [], uncompleted = [];

			jQun.forEach(Bao.Test.DummyData.Generate.Number.random(15), function(){
				completed.push(Index.Deep.getTodoInfo());
			}, this);

			jQun.forEach(Bao.Test.DummyData.Generate.Number.random(15), function(){
				uncompleted.push(Index.Deep.getTodoInfo());
			}, this);

			data = {
				completed : completed,
				uncompleted : uncompleted
			};

			return data;
		},
		sendTodo : function(data){
			data = { id : Bao.Test.DummyData.Generate.Number.random(15) };

			return data;
		},
		getWorkStream : function(data){
			var ws = [];

			jQun.forEach(Bao.Test.DummyData.Generate.Number.random(15), function(){
				var todoList = [];

				jQun.forEach(Bao.Test.DummyData.Generate.Number.random(5), function(){
					todoList.push(Index.Deep.getTodoInfo());
				});

				ws.push({
					todoList : todoList,
					user : Index.Common.getUser()
				});
			}, this);

			data = ws;

			return data;
		},
		getSystemContacts : function(data){
			data = Index.Common.getUsers();

			return data;
		},
		getAllArchives : function(data){
			data = Index.SPP.getProjects();

			return data;
		},
		getArchivedProject : function(data){
			data = {
				project : Index.SingleProject.getSingleProject(),
				todoList : Index.Deep.getTodoInfoList()
			};

			return data;
		},
		addComment : function(data){
			data = { id : Bao.Test.DummyData.Generate.Number.random(99999) };

			return data;
		},
		addCommentForTodo : function(data){
			data = { id : Bao.Test.DummyData.Generate.Number.random(99999) };

			return data;
		},
		editAccount : function(data){
			data = Index.Common.getUser();

			return data;
		},
		registerUserInfo : function(data){
			data = Index.Common.getUser();

			return data;
		},
		invitation : function(data, params){
			data = {
				status : -1,
				error : "邮箱已存在：<br />" + params.emails.split(",")[0]
			};

			return data;
		},
		getReportedInfo : function(data){
			var info = [], random = Bao.Test.DummyData.Generate.Number.random;

			jQun.forEach(random(5), function(){
				info.push({
					reporter : Index.Common.getUser(),
					source : Bao.Test.DummyData.Generate.String.random(),
					time : random(99999),
					message : Index.SingleProject.getMessage()
				});
			}, this);

			data = info;

			return data;
		},
		getCountOfReports : function(data){
			data = {
				count : Bao.Test.DummyData.Generate.Number.random(99)
			};

			return data;
		}
	}
));

Bao.members(this);
}.call(
	{},
	Bao,
	jQun.JSON,
	jQun.Text,
	// 以下为测试用的类
	Bao.Test.DummyData.Index
));