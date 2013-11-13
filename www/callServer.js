(function(Bao, StaticClass, Text, Index) {
    this.CallServer = (function(Mdls, Wait, Stroage, allHandlers) {
        function Models(){};

        Models = new StaticClass(Models);
        Models.properties({
            addProject: function(params, complete) {
                params = jQun.set({descr: params.desc}, params);
                delete params.desc;
                Mdls.Project.create({
                    project: jQun.except(params, ["users"]),
                    users: params.users
                }, complete);
            },
            getLoginInfo: function(_params, complete) {
                Mdls.UsersCounter.read(complete);
            },
            getWorkStream: function(params, complete) {
//                Mdls.Partner(complete);
                console.log("getWorkStream");
                console.log(params);
//                Mdls.Partner.read(function(data) {
//                    console.log(data);
//                    complete(data);
//                });

            },
            getPartnerGroups: function(_params, complete) {
                Mdls.Partner_Groups.read(complete);
            },
            getPartners: function(params, complete) {
                console.log(params)
                if(params.groupId == "-1"){
                    Mdls.Partner.read(complete);    
                }else{
                    Mdls.Partner_Groups.get_group_users(params.groupId, complete);    
                }
            },
            // getSchedules : function(){ },
            getSingleProject: function(params, complete) {
//                Mdls.Project.read(params, complete);
                console.log("_______________________getSingleProject");
                Mdls.Project.read(params, function(data) {
                    console.log("getSingleProject");
                    console.log(data);
                    complete(data);
                });
            },
            getMessages: function(params, complete) {
                console.log("_______________________getMessages");
                switch (params.type) {
                    case "project":
//                        Mdls.ProjectChat.chat_init(params.id, complete);
                        Mdls.ProjectChat.chat_init(params.id, function(data) {
                            console.log("getMessages");
                            console.log(data);
                            complete(data);
                        });
                        break;
                    case "todo":
//                        Mdls.TodoChat.chat_init(params.id, complete)
                        Mdls.TodoChat.chat_init(params.id, function(data){
                            console.log(data);
                            complete(data);
                        });
                        break;
                }
            },
            addComment: function(params, complete) {
//                alert("project")
//                console.log(params)
                var _params = {};
                switch (params.type) {
                    case "text":
                        _params = {
                            project_id: params.projectId,
                            content: params.text,
                            type: params.type
                        };
                        break;
                    case "voice":
//                        console.log(params)
                        _params = {
                            project_id: params.projectId,
                            content: params.text,
                            type: params.type,
                            local_path: params.attachment.src
                        };
                        break;
                    case "image":
                        console.log(params)
                        _params = {
                            project_id: params.projectId,
                            content: params.text,
                            type: params.type,
                            local_path: params.attachment.base64
//                            local_path: params.attachment.src
                        };
//                        console.log(_params)
                        break;
                    default:
                        return;
                }
//                var _params = {
//                    project_id : params.projecetId,
//                    attachment : params.attachment,
//                    content : params.text,
//                    type : params.type
//                };
//                Mdls.ProjectChat.send_message(_params, complete);
                Mdls.ProjectChat.send_message(_params, function(data){
                    console.log(data);
                    complete(data);
                });
            },
            addCommentForTodo: function(params, complete){
                console.log(params)
                var _params = {};
                switch (params.type) {
                    case "text":
                        _params = {
                            todo_id: params.todoId,
                            content: params.text,
                            type: params.type
                        };
                        break;
                    case "voice":
                        _params = {
                            todo_id: params.todoId,
                            content: params.text,
                            type: params.type,
                            local_path: params.attachment.src
                        };
                        break;
                    case "image":
                        _params = {
                            todo_id: params.todoId,
                            content: params.text,
                            type: params.type,
                            local_path: params.attachment.base64
//                            local_path: params.attachment.src
                        };
                        break;
                    default:
                        return;
                }
                Mdls.TodoChat.send_message(_params, complete);
            },
            getUser: function(params, complete) {
                console.log(params)
                Mdls.Partner.read(params.id, complete);
//                Mdls.Partner.read(params.id, function(data){
//                    console.log(data);
//                    complete(data);
//                });
            },
            // globalSearch : function(){ },
            // invitation : function(){ },
            login: function(params, complete) {
                Mdls.User.login(params, complete);
            },
            logout: function(params, complete) {
                Mdls.User.logout(complete);
            },
            getProjects: function(params, complete) {
                console.log(params)
                Mdls.Project.read(params, function(data){
                    console.log("getProjects data")
                    console.log(data);
                    complete(data);
                });
            },
            editProjectInfo: function(params, complete){
                console.log(params);
                // for now
                // userIds: Array[3]
                    //0: "undefined"
                    //1: "undefined"
                    //2: "undefined"
                // project_id: ALSO NEEDED
                Mdls.Project.update({
                    users       :   params.userIds,
                    project_id  :   params.projectId
                }, complete);
            },
            archiveProject : function(params, complete){
                console.log(params);
                Mdls.Project.archive(params.projectId, complete);
            },
            removeProject: function(params, complete){
                console.log(params);
                Mdls.Project.remove(params.projectId, complete);
            },
            myInformation: function(_params, complete) {
                // Mdls.User.read(function(data){
                // 	data['count'] = 123;
                // 	complete(data)
                // });
                Mdls.User.read(function(data) {
                    console.log(data);
                    complete(data);
                });
//                return {count: 123}
            },
            createGroup: function(params, complete) {
                console.log(params);
                Mdls.Partner_Groups.create(params, complete);
            },
            praise : function(params, complete){
                switch(params.type){
                    case "project":
                        Mdls.ProjectChat.like(params.messageId,complete);
                        break;
                    case "todo":
                        Mdls.TodoChat.like(params.messageId,complete);
                        break;
                    default:
                        return;
                }
            },
            register: function(params, complete) {
                Mdls.User.create(params, complete);
            },
			registerUserInfo: function(params, complete) {
				delete params['avatar'];
				delete params['id'];
				Mdls.User.update(params, complete);
			},
            // toDoCompleted : function(){ },
            getToDo: function(params, complete) {
                console.log(params);
//                 Mdls.Todo.read({project_id: params.id}, complete);
                Mdls.Todo.read(params, function(data) {
                    console.log(data);
                    complete(data);
                });
            },
//             getToDoInfo : function(params, complete){ 
//                 console.log("getToDoInfo");
//                 console.log(params);
////                 Mdls.Todo.read({project_id: params.id}, complete);
////                 Mdls.Todo.read({project_id: params.id}, function(data){
////                    console.log(data);
////                    complete(data);
////                });
//             },
            getTodoList: function(params, complete) {
                console.log(params);
//                 Mdls.Todo.read({project_id: params.id}, complete);
                Mdls.Todo.read({project_id: params.id}, function(data) {
                    console.log(data);
                    complete(data);
                });
            },
            getTodo: function(params, complete) {
                console.log(params);
//                 Mdls.Todo.read({project_id: params.id}, complete);
                Mdls.Todo.read(params, function(data) {
                    complete(data);
                });
            },
            getSchedules: function(params, complete) {
                console.log(params);
//                 Mdls.Todo.read({project_id: params.id}, complete);
//                Mdls.Todo.read({project_id: params.id}, function(data) {
//                    console.log(data);
//                    complete(data);
//                });
            },
            sendTodo    : function(params, complete){
                console.log(params)
//                attachment: Array[0]
//                creator_id: "4"
//                date: 1381760403700
//                desc: ""
//                projectId: "20131010120006f6705041_xiao_projects"
//                remind: 1
//                title: "gggbbbvv"
//                userId: "17"
                Mdls.Todo.create({
                        creator_id  : params.creator_id,
                        user_id     : params.userId,
                        title       : params.title,
                        descr       : params.desc,
                        project_id  : params.projectId,
                        endTime     : params.date
                    },
                    params.attachments, //attachments
                    complete
                );
            },
            getAllArchives: function(params, complete){
                console.log(params);
                Mdls.Archive.read(params, complete);
            },
            getArchivedProject: function(params, complete){
                console.log(params)
                Mdls.Archive.read(params, complete);
            },
            ArchiveDetail: function(params, complete){
                console.log(params)
//                Mdls.Project.getArchive(params, complete)
            },
            getSystemContacts   : function(params, complete){
                console.log(params)
//                Mdls.Contacts.read(complete)
                Mdls.Contacts.read(function(data){
                    console.log(data);
                    complete(data)
                });
            },
            editAccount : function(params, complete){
                console.log(params)
                var _params = {};
                for(var el in params){
                    if(params[el] !== null)_params[el] = params[el];
                }
                console.log(_params)
                Mdls.User.update(_params, complete);
//                Mdls.User.update(_params, function(data){
//                    console.log(data)
//                    complete(data)
//                });
            }
            
        });


        function CallServer() {
        }
        ;
        CallServer = new StaticClass(CallServer, "Bao.CallServer");

        CallServer.properties({
            open: function(name, params, _complete, _isUpload) {
                var LoadingBar = Wait.LoadingBar;

//                LoadingBar.show(_isUpload ? "正在上传数据.." : null);
                Models[name](params, function(data) {
                    if (name in allHandlers) {
                        data = allHandlers[name](data);
                    }

                    LoadingBar.hide();
                    _complete(data);
                });
            }
        });

        return CallServer;
    }(
            Models,
            Bao.UI.Control.Wait,
            jQun.Stroage,
            // allHandlers
                    {
                        getPartnerGroups: function(data) {
                            return {
                                groups: data
                            };
                        },
                        getPartners: function(data) {
                            var userListCollection = [], letters = {},
                                    forEach = jQun.forEach, charCodeAt = "".charCodeAt;

                            forEach("ABCDEFGHIJKLMNOPQRSTUVWXYZ", function(l) {
                                letters[l] = -1;
                            });

                            forEach(data, function(user) {
                                var firstLetter = user.pinyin.substring(0, 1).toUpperCase(),
                                        idx = letters[firstLetter];
								
								if (user.name) {
									if (idx === -1) {
										letters[firstLetter] = userListCollection.length;
										userListCollection.push({
											firstLetter: firstLetter,
											users: [user]
										});

										return;
									}
								} else {
									idx = 0;
								}
								
								
								/*alert(JSON.stringify(userListCollection));
								alert(idx);*/
								
								if (userListCollection[idx] == undefined) {
									userListCollection[idx] = [];
									userListCollection[idx]['users'] = [];
								}

                                userListCollection[idx]['users'].push(user);
                            });

                            userListCollection.sort(function(i, n) {
                                return charCodeAt.call(i.firstLetter) - charCodeAt.call(n.firstLetter);
                            });

                            return {
                                letters: letters,
                                userListCollection: userListCollection
                            };
                        },
                        getProjects: function(data) {
//                            data.projects.forEach(function(pro) {
//                                pro.status = 1;
//                            });
//                            data.pageMax = data.pageIndex + (data.pageSize - data.emptyFolders === 0 ? 0 : 1);
                            data.pageMax = data.pageIndex + (data.emptyFolders > 0 ? 0 : 1);
                            return data;
                        },
                        getSchedules: function(data) {
                            data.forEach(function(d) {
                                var localDate = new Date(d.time);

                                jQun.set(d, {
                                    localeDateString: localDate.toLocaleDateString(),
                                    date: localDate.getDate()
                                });

                                d.projects.forEach(function(pro) {
                                    pro.key = pro.id;
                                });
                            });

                            return {
                                schedules: data
                            };
                        }
//                        getMessages: function(data) {
//                            var id = Bao.Global.loginUser.id;
//
//                            data.forEach(function(dt) {
//                                var poster = dt.poster;
//
//                                poster.isLoginUser = poster.id === id;
//                            });
//
//                            return data;
//                        }
                    }
            ));

            Bao.members(this);
        }.call(
        {},
        Bao,
        jQun.StaticClass,
        jQun.Text,
        // 以下为测试用的类
        Bao.Test.DummyData.Index
        ));