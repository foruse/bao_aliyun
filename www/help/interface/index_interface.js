(function(CallServer, Text){
with(window.index_dataStructure){ // from ../dataStructure/index_dataStructure.js
	/*
		CallServer.save([
			"getUser",  // ajax name
			new Text("url?id={userid}"), // ajax url and url params, and the params will be automatically replace by params
			"", // ajax type, "get" or "post"
			true // cacheable
		]);

		{
			params : {
				userid : 1000
			},
			return : {
				DS_user
			}
		};
	*/

	CallServer.save([
		
		/*
			{
				params : {
					id : 1 // number
				},
				return : DS_user
			};
		*/
		["getUser",				new Text("url?id={id}"),					"", true],
		
		/*
			{
				params : null,
				return : [
					DS_group,
					...,
					DS_group
				]
			}
		*/
		["getPartnerGroups",			"url",								"", true],
		
		/*
			{
				params : {
					groupId : 1 // number
				},
				return : DS_users
			}
		*/
		["getPartners",			new Text("url?groupId={groupId}"),			"", true],

		/*
			{
				params : {
					name : "1234",
					users : [
						
					]
				}
			}
		*/
		["createGroup",			new Text("url?name={name}&users={users}"),	""],
		
		/*
			{
				params : null,
				return : data = {
					projects : DS_project,
					pageIndex : 1, // number
					pageMax : 1, // number
					pageSize : 15, // number
					emptyFolders : 3 // number
				}
			}
		*/
		["getProjects",			"url",										"", true],
		
		/*
			{
				params : {
					time : 123456 // number : time ticks
				},
				return [
					DS_schedule,
					// ..
					DS_schedule
				]
			}
		*/
		["getSchedules",		new Text("url?time={time}"),	"", true],
		
		/*
			{
				params : {
					title : "", // string
					color : 0, // number : from 0 to 5
					desc : "" // string : descript
					users : "1,2,3,4,5" // string : "id,id,id,id"
				},
				return : 1 // number : return an id of the project
			}
		*/
		["addProject",			new Text("url?title={title}&color={color}&desc={desc}&users={users}"), "POST"],
		
		/*
			{
				params : null,
				return : DS_user
			}
		*/
		["myInformation",		"url",										"", true],
		
		/*
			{
				params : null,
				return : {
					count : 123456, // number : get the count of all users which they are used the app
					validationImage : "javascript:void(0);" // string : url of validation image
				}
			}
		*/
		["getLoginInfo",		"url"],
		
		/*
			{
				params : {
					name : "name", // string : name
					pwd : "password", // string : password
					email : "what@vision2.com", // string : email
					validation : "1234" // string
				},
				return : {
					error : {
						type : "name", // string : "name", "pwd", "email" or "validation"
						idx : 0, // number : "name" -> 0, "email" -> 1, "pwd" -> 2, "validation" -> 4
						desc : "The name already exist." // string : description of the error
					},
					status : -1 // number : -1 -> error, 0 -> ok; if status is 0 and the error will be undefined, or you can only return an attribute.
				}
			}
		*/
		["register",			new Text("url?name={name}&pwd={password}&email={email}"),	""],

		/*
			{
				params : {
					pwd : "password", // string : password
					email : "what@vision2.com", // string : email
					validation : "1234" // string
				},
				return : {
					error : {
						type : "email", // string : "pwd", "email" or "validation"
						idx : 1, // number : "email" -> 1, "pwd" -> 2, "validation" -> 4
						desc : "The email is not exist." // string : description of the error
					},
					user : DS_user,
					status : -1 // number : -1 -> error, 0 -> ok; if status is 0 and the error will be undefined, or you can only return an attribute.
				}
			}
		*/
		["login",				new Text("url?email={email}&pwd={pwd}"),	""],

		/*
			{
				params : {
					emails : "a@bixinews.com,b@bixinews.com,c@bixinews.com"
				},
				return : {
					status : -1, if it has some errors
					error : "error information"
				}
			}
		*/
		["invitation",		new Text("url?emails={emails}"),				""],

		/*
			{
				params {
					id : "1213"
				},
				return : null
			}
		*/
		["todoCompleted",		new Text("url?id={id}"),					""],

		/*
			{
				params : {
					title : "sss",
					remind : 0, // number : 0 -> false, 1 -> true
					desc : "sss",
					userId : 11,
					projectId : 22,
					attachments : [
						DS_attachment,
						// ...
						DS_attachment
					]
				},
				return : {
					id : 1 // the id of todo
				}
			}	
		*/
		["sendTodo",			new Text("url?title={title}&remind={remind}&desc={desc}&attachments={attachments}&date={date}"), "POST"],

		/*
			{
				params : {
					id : 1 // the id of todo
				},
				return : DS_todoInfo
			}
		*/
		["getTodo",				new Text("url?id={id}"),					"", true],

		/*
			{
				params : {
					id : 1 // the id of project
				},
				return : [
					DS_todoInfo,
					// ...
					DS_todoInfo
				]
			}
		*/
		["getTodoList",			new Text("url?id={id}"),					"",	true],


		/*
			{
				params : {
					id : 123, // number : the id of the type(project or todo)
					type : "project" // string : "project" or "todo"
				},
				return : [
					DS_message,
					// ..
					DS_message
				]
			}
		*/
		["getMessages",			new Text("url?id={id}&type={type}"),		"", true],

		/*
			{
				params : {
					projectId : 1234,
					text : "1234",
					type : "text" // string : "text", "image" or "voice",
					attachment : DS_attachment
				},
				return {
					attachmentId : 1,
					id : 2
				}
			}
		*/
		["addComment",			new Text("url?text={text}&type={type}"),	""],

		/*
			{
				params : null,
				return : DS_users
			}
		*/
		["getSystemContacts",	"url",										"", true],

		/*
			{
				params : null,
				return : [
					DS_project,
					// ..
					DS_project
				]
			}
		*/
		["getAllArchives",		"url",										"", true],

		/*
			{
				params : {
					id : 123 // number : the id of archived project
				},
				return : {
					project : DS_project,
					todoList : [
						DS_todoInfo,
						// ..,
						DS_todoInfo
					]
				}
			}
		*/
		["getArchivedProject",	new Text("url?id={id}"),					"", true],

		/*
			{
				params : {
					id : 1,
					name : "abc", // string : user name
					avatar : "javascript:void(0);"
				},
				return : DS_user
			}
		*/
		["registerUserInfo",	new Text("url?name={name}&avatar={avatar}"),""],
		
		/*
			params : {
				text : "abc",
				type : "image", // message type
				projectId : 1
			},
			return {
				id : 1, // the id of comment
				attachmentId : 2
			}
		*/
		["addCommentForTodo",	new Text("url?text={text}&type={type}&projectId={projectId}"),	""],

		/*
			params : null,
			return : null
		*/
		["logout",				"",											""],

		/*
			params : {
				projectId : 1,
				users : [1, 2, 3, 4] // all of the user id
			},
			return : null
		*/
		["editProjectInfo",		new Text("url?projectId={projectId}&users={users}"),		""],

		/*
			params : {
				projectId : 1
			},
			return : null
		*/
		["removeProject",		new Text("url?projectId={projectId}"),		""],

		/*
			params : {
				position : "boss",
				avatar : "javascript:void(0);",
				phoneNum : 13611111111,
				email : "liji@baopiqi.com",
				password : 123456 // if the user didn't edit his password and the value is null
			},
			return : DS_user // new user data
		*/
		["editAccount",			new Text("url?positon={positon}&avatar={avatar}&phoneNum={phoneNum}&email={email}&password={password}"), ""]

		/*
			params : {
				projectId : 1
			},
			return : return
		*/
		["archiveProject",		new Text("url?porjectId={projectId}"),		""],

		/*
			params : {
				id : 1,
				name : "michael lee",
				avatar : "javascript:void(0);"
			},
			return : DS_user
		*/
		["registerUserInfo",	new Text("url?id={id}&name={name}&avatar={avatar}"),""],

		/*
			params : {
				id : 1 // user id
			},
			return : null
		*/
		["assignPermissions",	new Text("url?id={id}"),					""],

		/*
			params : {
				id : 1 // user id
			},
			return : null
		*/
		["removePermissions",	new Text("url?id={id}"),					""],

		/*
			params : {
				reporter : DS_user,
				source : "abc", // project title or todo title
				time : 1234567, // time ticks
				message : DS_message
			},
			return : null
		*/
		["getReportedInfo",		"",											""],
		/*
			params : {
				id : 1 // report id
			},
			return : null
		*/
		["deleteReport",		new Text("url?id={id}"),											""],

		/*
			params : {
				id : 1 // report id
			},
			return : null
		*/
		["ignoreReport",		new Text("url?id={id}"),											""],

		/*
			params : null,
			return : null
		*/
		["getCountOfReports",	"",											""],

		/*
			params : {
				id : 1, // project id or todo id
				from : "project"  // "project" or "todo"
			},
			return : null
		*/
		["stopMessagesListener",new Text("url?id={id}&from={from}"),		""],

		/*
			params : {
				messageId : 1 // message id
			},
			return : null
		*/
		["reportMessage",		new Text("url?messageId={messageId}"),		""]
	]);
}
}(
	Bao.CallServer,
	jQun.Text
));