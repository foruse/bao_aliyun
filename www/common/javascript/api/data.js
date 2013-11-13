(function(Data, NonstaticClass, StaticClass){
this.BatchLoad = (function(CallServer, forEach){
	function BatchLoad(name, _complete){
		///	<summary>
		///	分页加载。
		///	</summary>
		/// <param name="name" type="string">ajax名称</param>
		/// <param name="_complete" type="function">当ajax完成时所执行的函数</param>

		this.assign({
			name : name,
			params : {},
			complete : _complete
		});
	};
	BatchLoad = new NonstaticClass(BatchLoad, "Bao.API.Data.BatchLoad");

	BatchLoad.properties({
		callServer : function(){
			///	<summary>
			///	访问服务器取数据。
			///	</summary>
			var p = {},	params = this.params;

			// 初始化ajax参数
			forEach(params, function(param, name){
				var handler = param.handler, value = param.value;

				// 如果没有处理逻辑
				if(handler === undefined){
					p[name] = value;
					return;
				}

				p[name] = typeof handler === "function" ? handler(value, name) : value + handler;
			});

			// 访问服务器
			CallServer.open(this.name, p, function(data){
				// 设置回馈参数信息，确保参数统一
				forEach(params, function(param, name){
					var value = data[name];

					if(value === undefined)
						return;

					param.value = value;
				});

				// 是否执行完成时所需调用的函数
				if(typeof this.complete !== "function")
					return;

				this.complete(data);
			}.bind(this));
		},
		complete : undefined,
		getParam : function(name){
			///	<summary>
			///	获取参数值。
			///	</summary>
			/// <param name="name" type="string">参数的名称</param>
			var param = this.params[name];

			return param ? param.value : undefined;
		},
		isEqual : function(name, anotherName){
			///	<summary>
			///	判断2个参数的值是否相等。
			///	</summary>
			/// <param name="name" type="string">参数的名称</param>
			/// <param name="anotherName" type="string">需要对比的另一个参数名称</param>
			return this.getParam(name) == this.getParam(anotherName);
		},
		name : "",
		params : undefined,
		restoreParams : function(){
			///	<summary>
			///	恢复所有参数初始值。
			///	</summary>
			forEach(this.params, function(p){
				p.value = p.def;
			});
		},
		setParam : function(name, value, _handler){
			///	<summary>
			///	设置参数。
			///	</summary>
			/// <param name="name" type="string">参数的名称</param>
			/// <param name="value" type="*">参数的值</param>
			/// <param name="_handler" type="*">参数的处理逻辑</param>
			this.params[name] = {
				value : value,
				handler : _handler,
				def : value
			};
		}
	});

	return BatchLoad.constructor;
}(
	Bao.CallServer,
	jQun.forEach
));

Data.members(this);
}.call(
	{},
	Bao.API.Data,
	jQun.NonstaticClass,
	jQun.StaticClass
));