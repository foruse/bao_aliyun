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
                Mdls.Partner.read(function(data) {
                    console.log(data);
                    complete(data);
                });

            },
            getPartnerGroups: function(_params, complete) {
                Mdls.Partner_Groups.read(complete);
            },
            getPartners: function(params, complete) {
                Mdls.Partner_Groups.get_group_users(params.groupId, complete);
            },
            // getSchedules : function(){ },
            getSingleProject: function(params, complete) {
//                Mdls.Project.read(params, complete);
                console.log("getSingleProject");
                Mdls.Project.read(params, function(data) {
                    console.log(data);
                    complete(data);
                });
            },
            getMessages: function(params, complete) {
                switch (params.type) {
                    case "project":
//                        Mdls.ProjectChat.chat_init(params.id, complete);
                        Mdls.ProjectChat.chat_init(params.id, function(data) {
                            console.log(data);
                            complete(data);
                        });
                        break;
                    case "todo":
//                        Mdls.TodoChat.chat_init(params.id, complete)
                        break;
                }
            },
            addComment: function(params, complete) {
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
                        break;
                }
//                var _params = {
//                    project_id : params.projecetId,
//                    attachment : params.attachment,
//                    content : params.text,
//                    type : params.type
//                };
                Mdls.ProjectChat.send_message(_params, complete);
            },
            getUser: function(params, complete) {
                Mdls.Partner.read(params.id, complete);
            },
            // globalSearch : function(){ },
            // invitation : function(){ },
            login: function(params, complete) {
                Mdls.User.login(params, complete);
            },
            getProjects: function(params, complete) {
                Mdls.Project.read(params, complete);
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
            // praise : function(){ },
            register: function(params, complete) {
                Mdls.User.create(params, complete);
            },
            // todoCompleted : function(){ },
            // sendTodo : function(){ },
            getTodo: function(params, complete) {
                console.log(params);
//                 Mdls.Todo.read({project_id: params.id}, complete);
                Mdls.Todo.read(params, function(data) {
                    console.log(data);
                    complete(data);
                });
            },
//             getTodoInfo : function(params, complete){ 
//                 console.log("getTodoInfo");
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
            getSchedules: function(params, complete) {
                console.log(params);
//                 Mdls.Todo.read({project_id: params.id}, complete);
//                Mdls.Todo.read({project_id: params.id}, function(data) {
//                    console.log(data);
//                    complete(data);
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

                LoadingBar.show(_isUpload ? "正在上传数据.." : null);
                console.log(name)
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

                                if (idx === -1) {
                                    letters[firstLetter] = userListCollection.length;
                                    userListCollection.push({
                                        firstLetter: firstLetter,
                                        users: [user]
                                    });

                                    return;
                                }

                                userListCollection[idx].users.push(user);
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
							/*
                            data.projects.forEach(function(pro) {
                                pro.status = 1;
                            });
							data.pageMax = data.pageIndex + (data.pageSize - data.emptyFolders === 0 ? 0 : 1);
							*/
                            data.pageMax = data.pageIndex + (data.emptyFolders > 0 ? 0 : 1);
                            ;
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
                        },
                        getMessages : function(data) {
                            var id = Bao.Global.loginUser.id;

                            data.forEach(function(dt) {
                                var poster = dt.poster;

                                poster.isLoginUser = poster.id == id;
                            });

                            return data;
                        }
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