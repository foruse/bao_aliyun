(function(DummyData, StaticClass){
var Common,

	Index = DummyData.Index,
	
	Generate = DummyData.Generate,
	
	Number = Generate.Number,
	
	String = Generate.String;

this.Common = Common = (function(){
	function Common(){};
	Common = new StaticClass(null, "Bao.Test.DummyData.Common");

	Common.properties({
		getAttachment : function(){
			var type = ["image", "voice", "map"][Number.random(2)];

			return {
				id : Number.id(),
				type : type,
				src : type === "voice" ? "javascript:void(0);" : "../../test/image/avatar/" + Number.random(16) + ".jpg",
				from : "project"
			};
		},
		getAttachments : function(){
			var attachments = [];

			jQun.forEach(Number.random(30), function(){
				attachments.push(this.getAttachment());
			}, this);

			return attachments;
		},
		getUser : function(){
			var name = String.random(5), firstLetter = name.substring(0, 1);

			return {
				id : Number.id(),
				name : name,
				pinyin : firstLetter.match(/[A-Za-z]/) ? firstLetter : isNaN(firstLetter - 0) ? "z" : "a", // 这里只返回拼音首字母
				avatar : "../../test/image/avatar/" + Number.random(16) + ".jpg",
				company : String.random(10),
				companyAdress : String.random(30),
				position : String.random(4),
				phoneNum : Number.random(14000000000),
				email : String.random(8) + "@BaoPiQi.com",
				adress : String.random(30),
				isNewUser : false,
				permission : 1,
				QRCode : "../../test/image/avatar/" + Number.random(16) + ".jpg"
			};
		},
		getUsers : function(_len){
			var users = [];

			if(_len == undefined){
				_len = Number.random(100);
			}

			for(var i = 0;i < _len;i++){
				users.push(this.getUser());
			}

			return users;
		},
		myInformation : function(){
			return this.getUser();
		}
	});

	return Common;
}());

this.SingleProject = (function(){
	function SingleProject(){};
	SingleProject = new StaticClass(null, "Bao.Test.DummyData.SingleProject");

	SingleProject.properties({
		getMessage : function(_date){
			return {
				id : Number.id(),
				text : String.random(),
				poster : Number.random(20) > 10 ? Common.getUser() : Bao.Global.loginUser,
				attachment : Common.getAttachment(),
				praise : Common.getUsers(Number.random(20)),
				time : _date ? _date.getTime() : new Date() - 0,
				type : ["text", "voice", "image"][Number.random(2)]
			};
		},
		getMessages : function(){
			var msgs = [], date = new Date(), maxDate = new Date() - 5000;

			date.setDate(date.getDate() - 2);

			jQun.forEach(Number.random(15), function(){
				date = new Date(date.getTime() + Number.random(86400000 / 5));

				if(date > maxDate){
					date = maxDate;
				}

				msgs.push(SingleProject.getMessage(date));
			});

			return msgs;
		},
		getSingleProject : function(){
			return {
				id : Number.id(),
				level : Number.random(3),
				title : String.random(),
				color : Number.random(5),
				users : Common.getUsers(Number.random(20)),
				lastMessage : {
					content : String.random(),
					type : ["text", "voice", "image"][Number.random(2)]
				},
				creator : Common.getUser(),
				creationTime : new Date().getTime(),
				unread : Number.random(2) > 1 ? 0 : Number.random(),
				desc : String.random(1000),
				status : Number.random(4) > 2 ? 1 : 2,
				attachments : Common.getAttachments(),
				completeDate : new Date().setMonth(Number.random(10), Number.random(30))
			};
		}
	})

	return SingleProject;
}());

this.Deep = (function(SingleProject){
	function Deep(){};
	Deep = new StaticClass(null, "Bao.Test.DummyData.Deep");

	Deep.properties({
		getTodoInfo : function(){
			return {
				id : Number.random(100),
				color : Number.random(6),
				title : String.random(),
				desc : String.random(30),
				attachments : Common.getAttachments(),
				endTime : new Date().getTime(),
				user : Common.getUser()
			};
		},
		getTodoInfoList : function(){
			var todoInfoList = [];

			jQun.forEach(Number.random(10), function(){
				todoInfoList.push(this());
			}, this.getTodoInfo);

			return todoInfoList;
		}
	});

	return Deep;
}(
	this.SingleProject
));

this.SPP = (function(SingleProject, Deep){
	function SPP(){};
	SPP = new StaticClass(null, "Bao.Test.DummyData.SPP");

	SPP.properties({
		getPartnerGroups : function(){
			var groups = [], length = Number.random(60);

			for(var i = 0;i < length;i++){
				groups.push({
					name : String.random(6),
					id : Number.random(10000)
				});
			}

			return groups;
		},
		getPartners : function(name){
			return {
				partners : Common.getUsers(),
				letter : ["a", "b", "c"]
			};
		},
		getProjects : function(_len){
			var projects = [];

			if(!_len){
				_len = Number.random(30);
			}

			for(var i = 0;i < _len;i++){
				var project = SingleProject.getSingleProject();

				if(project.status === 2){
					projects.push(project);
				}
				else {
					projects.splice(0, 0, project);
				}
			}

			return projects;
		},
		getSchedules : function(time){
			var endDate, schedule = [],
			
				beginDate = new Date(time);

			beginDate.setDate(1);
			beginDate.setHours(0, 0, 0, 0);

			endDate = new Date(time);
			endDate.setMonth(beginDate.getMonth() + 1, 0);

			for(var j = endDate.getTime();beginDate.getTime() < j;){
				var todos = [];

				jQun.forEach(Number.random(5), function(){
					todos.push({
						title : String.random(),
						desc : String.random(),
						color : Number.random(6),
						level : Number.random(3),
						id : Number.random(100000000),
						isSendBySelf : Number.random(3) > 2
					});
				});

				schedule.push({
					time : beginDate.setDate(beginDate.getDate() + 1),
					todos : todos
				});
			}

			return schedule;
		}
	});

	return SPP;
}(
	this.SingleProject,
	this.Deep
));

Index.members(this);
}.call(
	{},
	Bao.Test.DummyData,
	jQun.StaticClass
));