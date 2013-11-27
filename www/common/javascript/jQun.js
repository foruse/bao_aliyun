/*
 *  类库名称 ：jQun
 *  中文释义 ：骥群(聚集在一起的千里马)
 *  文档状态 ：1.0.7.0
 *  本次修改 ：本类库结构大改及优化。
 *  开发浏览器信息 ：firefox 20.0+ 、 chrome 26.0+、基于webkit的手机浏览器
 */

// jQun的定义
(function(){

this.jQun = (function(create){
	function jQun(cstctor, _ParentClass){
		///	<summary>
		///	生成一个继承指定父类的新生类。
		///	</summary>
		///	<param name="cstctor" type="Function">新生类的构造函数。</param>
		///	<param name="_ParentClass" type="jQun">需要继承的父类。</param>
		var callee = arguments.callee;

		with(callee){
			if(!isInstanceOf(this, callee)){
				return new HTMLElementList(arguments[0]);
			}

			cstctor.toString = toString;
		}
		
		return cstctor.prototype = create(
			_ParentClass || this.getOwnClass(),
			{
				constructor : { value : cstctor, writable : true, configurable : true }
			}
		);
	}

	return jQun;
}(
	Object.create
));

}.call(
	window
));

// 基本方法和属性的定义
(function(jQun, Object, Array, undefined){

this.every = (function(){
	return function(obj, fn, _this){
		///	<summary>
		///	确定对象的所有成员是否满足指定的测试。
		///	</summary>
		///	<param name="obj" type="Object">需要测试成员的对象。</param>
		///	<param name="fn" type="Function">用于测试对象成员的测试函数。</param>
		///	<param name="_this" type="*">指定测试函数的 this 对象。</param>
		if(obj instanceof Array)
			return obj.every(fn, _this);

		var isNumber = typeof obj === "number";

		if(_this !== undefined){
			fn = fn.bind(_this);
		}

		if(isNumber){
			obj = new Array(obj + 1).join(" ");
		}

		for(var o in obj){
			if(fn.apply(_this, isNumber ? [o] : [obj[o], o, obj])){
				continue;
			}

			return false;
		}
		return true;
	};
}());

this.forEach = (function(every){
	return function(obj, fn, _this){
		///	<summary>
		///	遍历对象的所有成员并对其执行指定操作函数。
		///	</summary>
		///	<param name="obj" type="Object">需要遍历的对象。</param>
		///	<param name="fn" type="Function">指定操作的函数。</param>
		///	<param name="_this" type="*">指定操作函数的 this 对象。</param>
		every(obj, function(){
			fn.apply(this, arguments);
			return true;
		}, _this);

		return obj;
	};
}(
	this.every
));

this.define = (function(forEach, defineProperty){
	return function(obj, name, value, _descriptor){
		///	<summary>
		///	将属性添加到对象或修改现有属性的特性。
		///	</summary>
		///	<param name="obj" type="Object">对其添加或修改属性的对象。</param>
		///	<param name="name" type="String">需要添加或修改的属性名。</param>
		///	<param name="value" type="*">需要添加或修改的属性值。</param>
		///	<param name="_descriptor" type="Object">需要添加或修改的属性描述符。</param>
		var desc = { configurable : true, writable : true };

		forEach(_descriptor, function(d){
			desc[d] = _descriptor[d];
		});

		if(_descriptor && !!(_descriptor.gettable || _descriptor.settable)){
			desc.get = value.get;
			desc.set = value.set;

			delete desc["writable"];
		}
		else{
			desc.value = value;
		}

		defineProperty(obj, name, desc);
		return obj;
	};
}(
	this.forEach,
	Object.defineProperty
));

this.defineProperties = (function(forEach, define){
	return function(obj, properties, _descriptor){
		///	<summary>
		///	将一个或多个属性添加到对象，并/或修改现有属性的特性。
		///	</summary>
		///	<param name="obj" type="Object">对其添加或修改属性的对象。</param>
		///	<param name="properties" type="Object">包含一个或多个属性的键值对。</param>
		///	<param name="_descriptor" type="Object">需要添加或修改的属性描述符。</param>
		forEach(properties, function(value, name){
			define(obj, name, value, _descriptor);
		});

		return obj;
	};
}(
	this.forEach,
	this.define
));

this.set = (function(forEach){
	return function(obj, properties){
		///	<summary>
		///	添加或修改指定对象的属性。
		///	</summary>
		///	<param name="obj" type="Object">需要添加或修改属性的对象。</param>
		///	<param name="properties" type="Object">需要添加或修改的属性集合。</param>
		forEach(properties, function(val, name){
			obj[name] = val;
		});

		return obj;
	};
}(
	this.forEach
));

this.except = (function(set, forEach){
	return function(obj, properties){
		///	<summary>
		///	返回一个不包含所有指定属性名称的对象。
		///	</summary>
		///	<param name="obj" type="Object">需要排除属性的对象。</param>
		///	<param name="properties" type="Array">需要排除的属性名称数组。</param>
		var result = set({}, obj);

		forEach(properties, function(name){
			delete result[name];
		});
		return result;
	}
}(
	this.set,
	this.forEach
));

this.isInstanceOf = (function(getPrototypeOf){
	return function(obj, constructor){
		///	<summary>
		///	判断对象是否为指定类构造函数的一级实例（即直接由该类实例化）。
		///	</summary>
		///	<param name="obj" type="Object">用于判断的实例对象。</param>
		///	<param name="constructor" type="Function">指定的类。</param>
		return getPrototypeOf(obj) === constructor.prototype;
	};
}(
	Object.getPrototypeOf
));

this.isPropertyOf = (function(every, getOwnPropertyDescriptor){
	return function(obj, property){
		///	<summary>
		///	检测对象自己是否具有指定属性或访问器。
		///	</summary>
		///	<param name="obj" type="Object">一个可能具有指定属性或访问器的对象。</param>
		///	<param name="property" type="*">用于检测的属性或访问器。</param>
		return !every(getOwnPropertyNames(obj), function(name){
			return every(this, function(n){
				return this[n] !== property;
			}, getOwnPropertyDescriptor(obj, name));
		}, ["value", "get", "set"]);
	};
}(
	this.every,
	Object.getOwnPropertyDescriptor
));

this.nesting = (function(forEach){
	return function(obj, fn, _this){
		///	<summary>
		///	将对象中的每个枚举元素进行再枚举并执行指定操作（双重嵌套的forEach）。
		///	</summary>
		///	<param name="obj" type="Object">需要嵌套枚举并执行指定操作的对象（一般为json）。</param>
		///	<param name="fn" type="Function">指定的操作函数。</param>
		///	<param name="_this" type="*">指定操作函数的 this 对象。</param>
		if(fn === undefined){
			fn = fn.bind(_this);
		}

		forEach(obj, function(o){
			forEach(o, fn);
		});

		return obj;
	};
}(
	this.forEach
));

this.toArray = (function(slice){
	return function(obj, _start, _end){
		///	<summary>
		///	将类似数组的对象转化为数组。
		///	</summary>
		///	<param name="obj" type="Object">需要转化为数组的对象。</param>
		///	<param name="_start" type="Number">进行截取，截取的起始索引。</param>
		///	<param name="_start" type="Number">需要截取的末尾索引。</param>
		return slice.call(obj, _start || 0, _end);
	};
}(
	Array.prototype.slice
));

this.merge = (function(nesting, toArray){
	return function(obj, args){
		///	<summary>
		///	深度合并对象中所有项。
		///	</summary>
		///	<param name="obj" type="Object, Array">需要合并的项。</param>
		///	<param name="args" type="Object, Array">其他需要合并的项列表。</param>
		if(obj instanceof Array)
			return obj.concat.apply(obj, toArray(arguments, 1));

		var result = {}, another = arguments[1];

		nesting(arguments, function(value, name){
			result[name] = typeof value === "object" ? this(value) : value;
		}, arguments.callee);
		return result;
	};
}(
	this.nesting,
	this.toArray
));

this.toString = (function(){
	return function(){
		///	<summary>
		///	使函数在控制台里看起来像本地代码。
		///	</summary>
		var name = this.name;

		if(name){
			return "function " + name + "() { [native code] }";
		}

		return "function (){ [native code] }";
	};
}());

this.prototype = (function(prototype, forEach, define, defineProperties, getPrototypeOf){
	defineProperties(prototype, {
		assign : function(properties){
			///	<summary>
			///	给该类的属性赋值。
			///	</summary>
			///	<param name="properties" type="Object">包含一个或多个属性的键值对。</param>
			/// <returns>this</returns>
			forEach(properties, function(val, name){
				if(val === undefined)
					return;

				this[name] = val;
			}, this);

			return this;
		},
		getOwnClass : function(){
			///	<summary>
			///	获取自身类。
			///	</summary>
			return this.constructor.prototype;
		},
		getParentClass : function(){
			///	<summary>
			///	获取父类。
			///	</summary>
			return getPrototypeOf(this.getOwnClass());
		},
		isChildOf : function(AncestorClass){
			///	<summary>
			///	判断该类是否是指定类的子孙类。
			///	</summary>
			///	<param name="AncestorClass" type="jQun, Function">指定的类，或指定类的构造函数。</param>
			return this instanceof AncestorClass.constructor;
		},
		override : function(properties, _descriptor){
			///	<summary>
			///	重写一个或多个属性的值。
			///	</summary>
			///	<param name="properties" type="Object">包含一个或多个属性的键值对。</param>
			///	<param name="_descriptor" type="Object">被添加或修改属性的描述符。</param>
			this.properties(properties, _descriptor);

			return this;
		},
		properties : function(properties, _descriptor){
			///	<summary>
			///	将一个或多个属性添加到该类，并/或修改现有属性的特性。
			///	</summary>
			///	<param name="properties" type="Object">包含一个或多个属性的键值对。</param>
			///	<param name="_descriptor" type="Object">被添加或修改属性的描述符。</param>
			defineProperties(this, properties, _descriptor);

			return this;
		},
		toString : function(){
			///	<summary>
			///	对象字符串。
			///	</summary>
			return "[class " + this.constructor.name + "]";
		}
	});

	// (2013.08.20)目前有些浏览器不支持，如：手机QQ浏览器，手机百度浏览器
	try {
		define(
			prototype,
			"__proto__",
			Object.getOwnPropertyDescriptor(Object.prototype, "__proto__"),
			{ settable : true, gettable : true }
		);
	}
	catch(e){}

	return prototype;
}(
	Object.create(null, { constructor : { value : jQun, writable : true } }),
	this.forEach,
	this.define,
	this.defineProperties,
	Object.getPrototypeOf
));

with(this){
	forEach(this, function(property, name){
		if(name !== "prototype"){
			property.toString = toString;
		}

		this[name] = property;
	}, jQun);
}

}.call(
	{},
	jQun,
	Object,
	Array
));

// 面向对象的基础
(function(jQun, Function, defineProperties, forEach, set, getDescriptor){

this.Enum = (function(every, freeze){
	function Enum(data){
		///	<summary>
		///	枚举。
		///	</summary>
		if(data instanceof Array){
			forEach(data, function(val, i){
				this[val] = i;
			}, this);
		}
		else {
			set(this, data);
		}

		freeze(this);
	};
	Enum = new jQun(Enum);

	Enum.properties({
		every : function(fn, _this){
			///	<summary>
			///	确定枚举的所有成员是否满足指定的测试。
			///	</summary>
			///	<param name="fn" type="Function">用于测试对象成员的测试函数。</param>
			///	<param name="_this" type="*">指定测试函数的 this 对象。</param>
			return every(this, fn, _this);
		},
		forEach : function(fn, _this){
			///	<summary>
			///	遍历枚举的所有成员并对其执行指定操作函数。
			///	</summary>
			///	<param name="fn" type="Function">指定操作的函数。</param>
			///	<param name="_this" type="*">指定操作函数的 this 对象。</param>
			return forEach(this, fn, _this);
		}
	});

	return Enum.constructor;
}(
	jQun.every,
	Object.freeze
));

this.Namespace = (function(){
	function Namespace(){
		///	<summary>
		///	开辟一个命名空间。
		///	</summary>
	};
	Namespace = new jQun(Namespace);

	Namespace.properties({
		members : function(members){
			///	<summary>
			///	给该命名空间赋予成员。
			///	</summary>
			return set(this, members);
		}
	});

	return Namespace.constructor;
}());

this.NonstaticClass = (function(ARG_LIST_REGX, ARG_REGX, toString, getConstructor){
	function AnonymousNonstaticClass(){ };

	function NonstaticClass(_constructor, _name, _ParentClass){
		///	<summary>
		///	派生出一个非静态类。
		///	</summary>
		///	<param name="_constructor" type="Function">源构造函数。</param>
		///	<param name="_name" type="String">构造函数的名称。</param>
		///	<param name="_ParentClass" type="jQun.NonstaticClass">需要继承的父类</param>
		var constructor = _constructor ? _constructor : AnonymousNonstaticClass;

		return new jQun(
			getConstructor(
				constructor,
				_name ? _name : (constructor.name || AnonymousNonstaticClass.name),
				toString.call(constructor).match(ARG_LIST_REGX)[1].match(ARG_REGX)
			),
			_ParentClass || this.getOwnClass()
		);
	};
	NonstaticClass = new jQun(NonstaticClass);

	NonstaticClass.override({
		toString : function(){
			///	<summary>
			///	对象字符串。
			///	</summary>
			return "[NonstaticClass " + this.constructor.name + "]";
		}
	});

	NonstaticClass.properties({
		base : function(args){
			///	<summary>
			///	子类访问父类。
			///	</summary>
			///	<param name="args" type="*">子类的参数列表。</param>
			var parentList = [],
			
				ParentClass = this.getParentClass();

			while(ParentClass){
				if(ParentClass === NonstaticClass)
					break;

				parentList.unshift(ParentClass);
				ParentClass = ParentClass.getParentClass();
			}

			if(parentList.length === 0)
				return;

			var arg = {};

			forEach(arguments.callee.caller.argumentNames, function(name, i){
				arg["_" + name] = arg[name] = this[i];
			}, arguments);

			forEach(parentList, function(Parent){
				var transferArgs = [], constructor = Parent.constructor;

				forEach(constructor.argumentNames, function(name){
					transferArgs.push(arg[name]);
				});

				constructor.source.apply(this, transferArgs);
			}, this);
		}
	});

	return NonstaticClass.constructor;
}(
	// ARG_LIST_REGX
	/function[^\(]*\(([^\)]*)/,
	// ARG_REGX
	/([^\s\,]+)/g,
	Function.prototype.toString,
	// getConstructor
	function(source, name, argumentNames){
		var constructor = getDescriptor(
			new Function([
				"return {",
					"get '" + name + "' (){\r",
						"this.base.apply(this, arguments);\r",
						"return arguments.callee.source.apply(this, arguments);\r",
					"}",
				" };"
			].join(""))(),
			name
		).get;

		defineProperties(constructor, {
			argumentNames : argumentNames,
			source : source
		});

		return constructor;
	}
));

this.StaticClass = (function(getConstructor){
	function AnonymousStaticClass(){ };

	function StaticClass(_constructor, _name, _properties, _descriptor){
		///	<summary>
		///	派生出一个静态类。
		///	</summary>
		///	<param name="_constructor" type="Function">源构造函数。</param>
		///	<param name="_name" type="String">构造函数的名称。</param>
		///	<param name="_properties" type="Object">类的属性。</param>
		///	<param name="_descriptor" type="Object, Array">被添加属性的描述符。</param>
		var SClass,	constructor = _constructor ? _constructor : AnonymousStaticClass;

		SClass = new jQun(
			getConstructor(_name ? _name : (constructor.name || AnonymousStaticClass.name)),
			this.getOwnClass()
		);

		if(_properties){
			SClass.properties(_properties, _descriptor);
		}

		constructor.call(SClass);
		return SClass;
	};
	StaticClass = new jQun(StaticClass);

	StaticClass.override({
		toString : function(){
			///	<summary>
			///	对象字符串。
			///	</summary>
			return "[StaticClass " + this.constructor.name + "]";
		}
	});

	return StaticClass.constructor;
}(
	// getConstructor
	function(name){
		return getDescriptor(
			new Function("return { get '" + name + "' (){} };")(),
			name
		).get;
	}
));

defineProperties(jQun, this);
}.call(
	{},
	jQun,
	Function,
	jQun.defineProperties,
	jQun.forEach,
	jQun.set,
	Object.getOwnPropertyDescriptor
));

/*
	这里比以往多了一层闭包，
	为了用户执行效率，必须让该层闭包函数被系统回收，
	所有参数所用之处必须只能一次性使用(如需闭包使用需再次引用)，
	确保本闭包资源在使用后能合理释放掉
*/
(function(jQun, NonstaticClass, StaticClass, Enum, defineProperties, forEach){

// 一些独立的基础类
(function(forEach){

this.Browser = (function(RegExp, MOBILE_VERSION_STRING, userAgent){
	function Browser(){
		///	<summary>
		///	浏览器基本信息类。
		///	</summary>
		[
			new RegExp("(Android)" + MOBILE_VERSION_STRING),
			new RegExp("(Windows Phone)" + MOBILE_VERSION_STRING),
			new RegExp("(iPad)" + MOBILE_VERSION_STRING),
			new RegExp("(iPod)" + MOBILE_VERSION_STRING),
			/(iPhone)\sOS\s([\d_]+).*\s(Mobile)/,
			/(MSIE) ([\d\.]+)/,
			/(Firefox)\/([\d\.]+)/,
			/(Opera).([\d\.]+)/,
			/(Chrome)\/([\d\.]+)/,
			/(AppleWebkit).*Version\/([\d\.]+).*Safari/
		].every(function(regx){
			var info = userAgent.match(regx);

			if(!info)
				return true;

			var agent = info[1], version = info[2];

			this.assign({
				agent : agent === "AppleWebkit" ? "Safari" : agent,
				isMobile : info[3] === "Mobile",
				version : version,
				majorVersion : version.split(/\D+/)[0]
			});

			return false;
		}, this);
	}
	Browser = new StaticClass(Browser, "jQun.Browser", {
		agent : "unkown",
		isMobile : false,
		majorVersion : "0",
		version : "0"
	});

	return Browser;
}(
	RegExp,
	// MOBILE_VERSION_STRING
	".*\\s(?:\\S)+\\/([\\d\\.]+)\\s(Mobile)",
	navigator.userAgent
));

this.List = (function(ArrayClass, define, hasOwnProperty){
	function List(){
		///	<summary>
		///	对列表进行管理、操作的类。
		///	</summary>
		this.override({ length : 0 });
	};
	List = new NonstaticClass(List, "jQun.List");

	List.properties({
		alternate : function(num, _remainder){
			///	<summary>
			///	交替性取出集合中的符合项。
			///	</summary>
			///	<param name="num" type="Number">取模运算值。</param>
			///	<param name="_remainder" type="Number">余数。</param>
			var list = this.createList();

			_remainder = _remainder || 0;

			this.forEach(function(item, i){
				if(i % num === _remainder){
					list.push(item);
				}
			});
			return list;
		},
		clear : function(){
			///	<summary>
			///	清空整个集合。
			///	</summary>
			this.splice(0);
			return this;
		},
		combine : function(list){
			///	<summary>
			///	合并另一个集合。
			///	</summary>
			///	<param name="list" type="Array">另一个集合。</param>
			this.push.apply(this, list);
			return this;
		},
		contains : function(item){
			///	<summary>
			///	返回一个布尔值，表示该列表中是否包含指定项。
			///	</summary>
			///	<param name="item" type="*">可能包含的项。</param>
			return !this.every(function(i){
				return i !== item;
			});
		},
		createList : function(){
			///	<summary>
			///	创建个新的列表。
			///	</summary>
			return new List.constructor();
		},
		distinct : function(){
			///	<summary>
			///	对列表进行去重。
			///	</summary>
			var list = this;

			this.splice(0).forEach(function(item){
				if(list.contains(item))
					return;

				list.push(item);
			});
			return list;
		},
		even : function(){
			///	<summary>
			///	返回集合中偶数项集合。
			///	</summary>
			return this.alternate(2);
		},
		length : undefined,
		odd : function(){
			///	<summary>
			///	返回集合中奇数项集合。
			///	</summary>
			return this.alternate(2, 1);
		}
	});
	
	
	Object.getOwnPropertyNames(
		ArrayClass
	).forEach(function(name){
		if(hasOwnProperty.call(List, name))
			return;

		define(List, name, ArrayClass[name]);
	});

	return List.constructor;
}(
	Array.prototype,
	jQun.define,
	Object.prototype.hasOwnProperty
));

}.call(
	this
));


// 与字符串处理有关的类
(function(){

this.ValidationRegExpString = (function(){
	return new Enum({
		Chinese : "[\\u4e00-\\u9fa5]",
		Email : "(\\w+(?:[-+.]\\w+)*)@(\\w+(?:[-.]\\w+)*)\\.(\\w+(?:[-.]\\w+)*)",
		Empty : "^$",
		NotEmpty : "[\\s\\S]",
		UserInfo : "^\\w{6,16}$",
		Telephone : "^(\\d{3}|\\d{4})?-(\\d{7,8}|\\d{11})$",
		WebURL : "http:\\/\\/([\\w-]+)\\.+([\\w-]+)(?:\\/([\\w- .\\/?%&=]*))?"
	});
}());

this.JSON = (function(JSONBase){
	function JSON(){
		///	<summary>
		///	JSON功能类。
		///	</summary>
	};
	JSON = new StaticClass(JSON, "jQun.JSON");

	JSON.properties({
		parse : function(jsonStr){
			///	<summary>
			///	将字符串转化为json。
			///	</summary>
			///	<param name="jsonStr" type="String">需要转化为json的字符串。</param>
			try {
				return JSONBase.parse(jsonStr);
			} catch(e){
				return (new Function("return " + jsonStr + ";"))();
			}
		},
		stringify : JSONBase.stringify
	});

	return JSON;
}(
	JSON
));

this.Text = (function(Array, T_REGX, encodeURIComponent){
	function Text(text){
		///	<summary>
		///	用于操作字符串文本的类。
		///	</summary>
		///	<param name="text" type="String, Array">字符串文本。</param>
		this.assign({
			text : text instanceof Array ? text.join("") : text
		});
	};
	Text = new NonstaticClass(Text, "jQun.Text");

	Text.properties({
		removeSpace : function(){
			///	<summary>
			///	 移除字符串中的前后空格。
			///	</summary>
			return this.text.match(/^\s*([\S\s]*?)\s*$/)[1];
		},
		replace : function(replacement){
			///	<summary>
			///	返回一个替换数据后的字符串。
			///	</summary>
			///	<param name="replacement" type="Object, Function">需要替换的数据或者自行替换的处理函数。</param>
			return this.text.replace(
				T_REGX,
				typeof replacement === "function" ? replacement : function(str, modifier, word){
					if(modifier === ":"){
						return "{" + word + "}";
					}

					if(word in replacement){
						return replacement[word];
					}

					return modifier === "~" ? "" : word;
				}
			);
		},
		toUrlParams : function(params){
			///	<summary>
			///	 返回一个替换数据后的连接字符串。
			///	</summary>
			///	<param name="params" type="Object, Function">需要替换的数据或者自行替换的处理函数。</param>
			return this.replace(function(str, modifier, word){
				return encodeURIComponent(params[word]);
			});
		},
		text : ""
	});

	return Text.constructor;
}(
	Array,
	// T_REGX
	/\{\s*(?:\?([^\{\}\s]{1}))?\s*([^\{\}]*?)\s*\}/g,
	encodeURIComponent
));

this.Validation = (function(ValidationRegExpString, RegExp){
	function Validation(){
		///	<summary>
		///	验证。
		///	</summary>
	};
	Validation = new StaticClass(Validation, "jQun.Validation");

	Validation.properties({
		match : function(str, regExpString, _regxAttrs){
			///	<summary>
			///	验证匹配。
			///	</summary>
			///	<param name="str" type="String">需要验证的字符串。</param>
			///	<param name="regExpString" type="String">用于匹配的正则字符串。</param>
			///	<param name="_regxAttrs" type="String">正则属性。</param>
			return str.match(new RegExp(regExpString, _regxAttrs));
		},
		result : function(str, regExpString){
			///	<summary>
			///	验证结果。
			///	</summary>
			///	<param name="str" type="String">需要验证的字符串。</param>
			///	<param name="regExpString" type="String">用于匹配的正则字符串。</param>
			return !!this.match(str, regExpString);
		}
	});

	return Validation;
}(
	this.ValidationRegExpString,
	RegExp
));

}.call(
	this
));

// List的直接子类
(function(List){

this.ElementPropertyCollection = (function(){
	function ElementPropertyCollection(elementList){
		///	<summary>
		///	所有元素属性的基类。
		///	</summary>
		///	<param name="elementList" type="Array, List">元素列表。</param>
		var name = this.propertyName;

		this.assign({
			sources : elementList
		});

		if(name === "")
			return;

		elementList.forEach(function(element){
			this.push(element[name]);
		}, this);
	};
	ElementPropertyCollection = new NonstaticClass(ElementPropertyCollection, "jQun.ElementPropertyCollection", List.prototype);

	ElementPropertyCollection.properties({
		propertyName : "",
		sources : undefined,
		valueOf : function(){
			///	<summary>
			///	返回当前对象。
			///	</summary>
			return this;
		}
	});

	return ElementPropertyCollection.constructor;
}());

}.call(
	this,
	this.List
));

// 与ElementPropertyCollection（元素属性）有关的类
(function(ElementPropertyCollection){

this.AttributeCollection = (function(){
	function AttributeCollection(elementList){
		///	<summary>
		///	元素特性类。
		///	</summary>
	};
	AttributeCollection = new NonstaticClass(AttributeCollection, "jQun.AttributeCollection", ElementPropertyCollection.prototype);

	AttributeCollection.override({
		propertyName : "attributes"
	});

	AttributeCollection.properties({
		contains : function(name){
			///	<summary>
			///	判断是否包含指定名称的属性。
			///	</summary>
			///	<param name="name" type="String">属性的名称。</param>
			return !this.sources.every(function(element){
				return element.getAttribute(name) == null;
			});
		},
		get : function(name){
			///	<summary>
			///	通过指定名称获取属性。
			///	</summary>
			///	<param name="name" type="String">需要获取属性的名称。</param>
			return this.sources[0].getAttribute(name);
		},
		set : function(name, value){
			///	<summary>
			///	设置集合中所有元素的属性。
			///	</summary>
			///	<param name="name" type="String">需要设置属性的名称。</param>
			///	<param name="value" type="*">需要设置属性的值。</param>
			this.sources.forEach(function(element){
				element.setAttribute(name, value);
			});
			return this;
		},
		remove : function(name){
			///	<summary>
			///	移除具有指定名称的属性。
			///	</summary>
			///	<param name="name" type="String">需要移除属性的名称。</param>
			this.sources.forEach(function(element){
				element.removeAttribute(name);
			});
			return this;
		},
		replace : function(oldAttrName, newAttrName, newAttrValue){
			///	<summary>
			///	移除指定的旧属性，添加指定的新属性。
			///	</summary>
			///	<param name="oldAttrName" type="String">需要移除属性的名称。</param>
			///	<param name="newAttrName" type="String">需要添加属性的名称。</param>
			///	<param name="newAttrValue" type="*">需要添加属性的值。</param>
			this.sources.forEach(function(element){
				element.removeAttribute(oldAttrName);
				element.setAttribute(newAttrName, newAttrValue);
			});
			return this;
		},
		valueOf : function(){
			///	<summary>
			///	返回一个键值对，该键值对具有第一个元素所有属性。
			///	</summary>
			var value = {};

			if(this.length === 0)
				return value;

			var attributes = this[0];

			for(var i = 0, j = attributes.length;i < j;i++){
				var attr = attributes[i];

				value[attr.nodeName] = attr.nodeValue;
			}

			return value;
		}
	});

	return AttributeCollection.constructor;
}());

this.CSSPropertyCollection = (function(isNaN, hasOwnProperty){
	function CSSPropertyCollection(elementList){
		///	<summary>
		///	元素CSS属性类。
		///	</summary>
	};
	CSSPropertyCollection = new NonstaticClass(CSSPropertyCollection, "jQun.CSSPropertyCollection", ElementPropertyCollection.prototype);

	CSSPropertyCollection.override({
		propertyName : "style"
	});

	CSSPropertyCollection.properties({
		get : function(name){
			///	<summary>
			///	获取集合中第一个元素的CSS属性。
			///	</summary>
			///	<param name="name" type="String">CSS属性名。</param>
			return this[0][name];
		},
		set : function(name, value){
			///	<summary>
			///	设置集合中所有元素的CSS属性。
			///	</summary>
			///	<param name="properties" type="Object">CSS属性键值对。</param>
			this.forEach(function(style){
				style[name] = value;
			});
			return this;
		},
		valueOf : function(){
			///	<summary>
			///	返回集合中第一个元素的style。
			///	</summary>
			return this.get("cssText");
		}
	});

	forEach(getComputedStyle(document.documentElement), function(value, name, CSSStyle){
		// firefox、chrome 与 IE 的 CSSStyleDeclaration 结构都不一样
		var cssName = isNaN(name - 0) ? name : value;

		if(hasOwnProperty.call(CSSPropertyCollection, cssName))
			return;

		if(typeof CSSStyle[cssName] !== "string")
			return;

		var property = {};

		property[cssName] = {
			get : function(){
				return this.get(cssName);
			},
			set : function(value){
				this.set(cssName, value);
			}
		};

		CSSPropertyCollection.properties(property, { gettable : true, settable : true });
	});

	return CSSPropertyCollection.constructor;
}(
	isNaN,
	Object.prototype.hasOwnProperty
));

this.ChildrenCollection = (function(){
	function ChildrenCollection(elementList){
		///	<summary>
		///	children类。
		///	</summary>
	};
	ChildrenCollection = new NonstaticClass(ChildrenCollection, "jQun.ChildrenCollection", ElementPropertyCollection.prototype);

	ChildrenCollection.override({
		propertyName : "children"
	});

	ChildrenCollection.properties({
		append : function(node){
			///	<summary>
			///	添加一个子节点。
			///	</summary>
			///	<param name="node" type="Node">需要添加的子节点。</param>
			return this.insert(node);
		},
		contains : function(node){
			///	<summary>
			///	返回一个布尔值，该值表示该集合内的所有子节点是否包含指定的子节点。
			///	</summary>
			///	<param name="node" type="Node">可能包含的子节点。</param>
			return this.valueOf().contains(node);
		},
		insert : function(node, _idx){
			///	<summary>
			///	在指定的索引处插入节点。
			///	</summary>
			///	<param name="node" type="Node">需要插入的节点。</param>
			///	<param name="_idx" type="Number">指定的索引处。</param>
			var sources = this.sources;

			sources.insertTo.call([node], sources[0], _idx);
			return this;
		},
		remove : function(){
			///	<summary>
			///	移除所有子节点。
			///	</summary>
			this.valueOf().remove();
			return this;
		},
		valueOf : function(){
			///	<summary>
			///	返回所有子节点的一个集合。
			///	</summary>
			return this.sources.find(">*");
		}
	});

	return ChildrenCollection.constructor;
}());

this.ClassListCollection = (function(){
	function ClassListCollection(elementList){
		///	<summary>
		///	classList类。
		///	</summary>
	};
	ClassListCollection = new NonstaticClass(ClassListCollection, "jQun.ClassListCollection", ElementPropertyCollection.prototype);

	ClassListCollection.override({
		propertyName : "classList"
	});

	ClassListCollection.properties({
		add : function(className){
			///	<summary>
			///	为集合中每一个元素添加指定的单个class。
			///	</summary>
			///	<param name="className" type="String">指定的单个class。</param>
			this.forEach(function(classList){
				classList.add(className);
			});
			return this;
		},
		contains : function(className){
			///	<summary>
			///	判断集合中是否有一个元素包含指定的class。
			///	</summary>
			///	<param name="className" type="String">指定的单个class。</param>
			return !this.every(function(classList){
				return !classList.contains(className);
			});
		},
		remove : function(className){
			///	<summary>
			///	为集合中每一个元素移除指定的单个class。
			///	</summary>
			///	<param name="className" type="String">指定的单个class。</param>
			this.forEach(function(classList){
				classList.remove(className);
			});
			return this;
		},
		replace : function(oldClass, newClass){
			///	<summary>
			///	为集合中每一个元素移除指定的旧class，添加指定的新class。
			///	</summary>
			///	<param name="oldClass" type="String">指定的旧class。</param>
			///	<param name="newClass" type="String">指定的新class。</param>
			this.forEach(function(classList){
				classList.remove(oldClass);
				classList.add(newClass);
			});
			return this;
		},
		toggle : function(className){
			///	<summary>
			///	自行判断集合中每一个元素是否含有指定的class：有则移除，无则添加。
			///	</summary>
			///	<param name="className" type="String">指定的单个class。</param>
			this.forEach(function(classList){
				classList.toggle(className);
			});
			return this;
		},
		valueOf : function(){
			///	<summary>
			///	返回集合中第一个元素的className。
			///	</summary>
			return this[0].toString();
		}
	});

	return ClassListCollection.constructor;
}());

}.call(
	this,
	this.ElementPropertyCollection
));

// 与元素节点有关的类
(function(List, Window, emptyAttrCollection, forEach, define){

this.NodeList = (function(AttributeCollection, toArray){
	function NodeList(){
		///	<summary>
		///	节点列表类。
		///	</summary>
	};
	NodeList = new NonstaticClass(NodeList, "jQun.NodeList", List.prototype);

	NodeList.override({
		createList : function(){
			///	<summary>
			///	创建个新的节点集合。
			///	</summary>
			return new NodeList.constructor();
		}
	});

	NodeList.properties({
		attributes : {
			get : function(){
				///	<summary>
				///	获取属性集合。
				///	</summary>
				return new AttributeCollection(this);
			},
			set : function(attrs){
				///	<summary>
				///	初始化属性。
				///	</summary>
				///	<param name="attrs" type="Object">属性键值对。</param>
				forEach(
					attrs,
					function(value, name){
						emptyAttrCollection.set.call(this, name, attrs[name]);
					},
					{ sources : this }
				);
			}
		}
	}, { gettable : true, settable : true });

	NodeList.properties({
		appendTo : function(parentNode){
			///	<summary>
			///	将集合中所有节点添加至指定的父节点。
			///	</summary>
			///	<param name="parentNode" type="Node">指定的父节点。</param>
			this.insertTo(parentNode);
			return this;
		},
		attach : function(events, _capture, _priority, _useWeakReference){
			///	<summary>
			///	向集合中所有元素注册事件侦听器。
			///	</summary>
			///	<param name="events" type="Object">事件侦听器键值对。</param>
			///	<param name="_capture" type="Boolean">侦听器是否运行于捕获阶段。</param>
			///	<param name="_priority" type="Number">优先级，数字越大，优先级越高。</param>
			///	<param name="_useWeakReference" type="Boolean">是否是属于强引用。</param>
			var nodeList = this, otherArgs = toArray(arguments, 1);
			
			forEach(events, function(fn, type){
				var eventArgs = [
						type,
						fn.length === 2 ? function(e){
							fn.call(this, e, nodeList.createList(e.target));
						} : fn
					].concat(otherArgs);

				nodeList.forEach(function(node){
					node.addEventListener.apply(node, eventArgs);
				});
			});

			return this;
		},
		detach : function(events){
			///	<summary>
			///	移除集合中所有节点的事件侦听器。
			///	</summary>
			///	<param name="events" type="Object">事件侦听器键值对。</param>
			this.forEach(function(node){
				forEach(events, function(fn, type){
					node.removeEventListener(type, fn);
				});
			});
			return this;
		},
		hasChild : function(childNode){
			///	<summary>
			///	判断指定节点是否是该集合中某个节点的后代节点。
			///	</summary>
			///	<param name="childNode" type="Node">指定的节点。</param>
			return !this.every(function(node){
				return !node.contains(childNode);
			});
		},
		insertBefore : function(targetNode){
			///	<summary>
			///	将集合中所有节点插入至指定的节点之前。
			///	</summary>
			///	<param name="targetNode" type="Node">指定节点。</param>
			this.forEach(function(node){
				this.insertBefore(node, targetNode);
			}, targetNode.parentNode);

			return this;
		},
		insertTo : function(parentNode, _idx){
			///	<summary>
			///	将集合中所有节点插入至指定索引的节点之前。
			///	</summary>
			///	<param name="parentNode" type="Node">指定的父节点。</param>
			///	<param name="_idx" type="Number">指定节点的索引值。</param>
			if(_idx !== undefined){
				var childNodes = parentNode.childNodes;

				if(childNodes.length === 0){
					return this.appendTo(parentNode);
				}

				return this.insertBefore(childNodes[_idx]);
			}

			this.forEach(function(node){
				parentNode.appendChild(node);
			});
			return this;
		},
		remove : function(){
			///	<summary>
			///	将集合中的节点从其父节点内移除。
			///	</summary>
			this.forEach(function(node){
				node.parentNode.removeChild(node);
			});
			return this;
		},
		replace : function(targetNode){
			///	<summary>
			///	将集合中所有节点去替换指定的节点。
			///	</summary>
			///	<param name="targetNode" type="Node">指定的节点。</param>
			this.insertBefore(targetNode);
			this.remove.call([targetNode]);

			return this;
		}
	});

	return NodeList.constructor;
}(
	this.AttributeCollection,
	jQun.toArray
));

this.ElementList = (function(
	NodeList, ChildrenCollection, ClassListCollection, Node, SELECTORREGX, document, getComputedStyle, setter
){
	function ElementList(_selector, _parent){
		///	<summary>
		///	通过指定选择器筛选元素。
		///	</summary>
		///	<param name="_selector" type="String, Element">选择器或dom元素。</param>
		///	<param name="_parent" type="Element">指定查询的父节元素。</param>
		if(!_selector)
			return;

		this.assign({
			selector : _selector
		});

		if(typeof _selector === "string"){
			var elements;

			if(!_parent){
				_parent = document;
			}

			_selector = _selector.replace(SELECTORREGX, function(str, modifier, val){
				return '[' + (modifier === "#" ? "id" : "class~") + '="' + val + '"]';
			});
			
			try{
				elements = _parent.querySelectorAll(_selector);
			} catch(e){
				if(_parent === document){
					console.error('document 不支持选择器："' + _selector + '"');
					return;
				}

				_parent.setAttribute("__selector__", "__jQun__");
				elements = _parent.querySelectorAll('[__selector__="__jQun__"]' + _selector);
				_parent.removeAttribute("__selector__");
			}

			this.combine(elements);
			return;
		}

		if(_selector instanceof Node || _selector instanceof Window){
			this.push(_selector);
			return;
		}

		if("length" in _selector){
			this.combine(_selector);
			return;
		}
	};
	ElementList = new NonstaticClass(ElementList, "jQun.ElementList", NodeList.prototype);

	ElementList.override({
		createList : function(_selector, _parent){
			///	<summary>
			///	创建个新的元素集合。
			///	</summary>
			///	<param name="_selector" type="String, Element">选择器、html或dom元素。</param>
			///	<param name="_parent" type="Element">指定查询的父节点。</param>
			return new ElementList.constructor(_selector, _parent);
		}
	});

	ElementList.properties({
		between : function(_selector, _ancestor){
			///	<summary>
			///	在该集合内的每一个元素与指定的祖先元素之间，查找其他符合条件的元素。
			///	</summary>
			///	<param name="_selector" type="String">指定查找的祖先元素选择器。</param>
			///	<param name="_ancestor" type="Element">指定的一个祖先元素。</param>
			var list = this.createList(), els = this.createList(_selector || "*", _ancestor);

			this.forEach(function(element){
				do {
					if(element === _ancestor)
						return;

					if(els.contains(element)){
						if(!list.contains(element)){
							list.push(element);
						}
					}
					
					element = element.parentElement;
				} while(element)
			});

			return list;
		},
		blur : function(){
			///	<summary>
			///	让聚焦元素的失去焦点。
			///	</summary>
			this.forEach(function(element){
				element.blur();
			});

			return this;
		},
		del : function(name, _type){
			///	<summary>
			///	将指定属性从集合的所有元素中删除。
			///	</summary>
			///	<param name="name" type="String">需要删除的属性名。</param>
			///	<param name="_type" type="String">需要删除的属性种类。</param>
			if(_type === "css"){
				this.style[name] = "";
				return this;
			}

			if(_type === "attr"){
				emptyAttrCollection.remove.call({ sources : this }, name);
				return this;
			}

			this.forEach(function(element){
				delete element[name];
			});
			return this;
		},
		find : function(_selector){
			///	<summary>
			///	通过选择器查找子孙元素。
			///	</summary>
			///	<param name="_selector" type="String">选择器。</param>
			var source = ElementList.constructor.source, list = this.createList();

			this.forEach(function(htmlElement){
				source.call(list, _selector, htmlElement);
			});

			if(this.length < 2)
				return list;

			return list.distinct();
		},
		focus : function(){
			///	<summary>
			///	聚焦元素。
			///	</summary>
			var length = this.length;

			if(length > 0){
				this[length - 1].focus();
			}

			return this;
		},
		get : function(name, _type){
			///	<summary>
			///	获取集合中第一个元素的属性。
			///	</summary>
			///	<param name="name" type="String">属性名。</param>
			///	<param name="_type" type="String">需要获取的属性种类。</param>
			if(_type === "css")
				return this.getCSSPropertyValue(name);

			if(_type === "attr")
				return this.getAttribute(name);

			return this[0][name];
		},
		getAttribute : function(name){
			///	<summary>
			///	获取集合中第一个元素的特性属性。
			///	</summary>
			///	<param name="name" type="String">属性名。</param>
			return emptyAttrCollection.get.call({ sources : this }, name);
		},
		getCSSPropertyValue : function(name){
			///	<summary>
			///	获取集合中第一个元素的css属性。
			///	</summary>
			///	<param name="name" type="String">属性名。</param>
			return getComputedStyle(this[0])[name];
		},
		parent : function(){
			///	<summary>
			///	返回该集合所有元素的父元素。
			///	</summary>
			var list = this.createList();

			this.forEach(function(element){
				var parent = element.parentElement;

				if(!parent || list.contains(parent))
					return;

				list.push(parent);
			});
			return list;
		},
		removeAttribute : function(name){
			///	<summary>
			///	根据指定名称，移除集合中每一个元素的特性属性。
			///	</summary>
			///	<param name="name" type="String">属性名。</param>
			emptyAttrCollection.remove.call({ sources : this }, name);
			return this;
		},
		selector : "",
		set : function(name, value, _type){
			///	<summary>
			///	设置集合中所有元素的属性。
			///	</summary>
			///	<param name="name" type="String">属性名。</param>
			///	<param name="value" type="*">属性值。</param>
			///	<param name="_type" type="String">需要设置的属性种类。</param>
			if(_type){
				this[_type === "css" ? "setCSSPropertyValue" : "setAttribute"](name, value);
				return this;
			}

			this.forEach(function(element){
				element[name] = value;
			});
			return this;
		},
		setAttribute : function(name, value){
			///	<summary>
			///	设置集合中每一个元素的特性属性。
			///	</summary>
			///	<param name="name" type="String">属性名。</param>
			///	<param name="value" type="String">属性值。</param>
			emptyAttrCollection.set.call({ sources : this }, name, value);
			return this;
		},
		setCSSPropertyValue : function(name, value){
			///	<summary>
			///	设置集合中每一个元素的css属性。
			///	</summary>
			///	<param name="name" type="String">属性名。</param>
			///	<param name="value" type="String">属性值。</param>
			this.forEach(function(element){
				element.style[name] = value;
			});
			return this;
		},
		sibling : function(){
			///	<summary>
			///	返回集合中所有元素紧邻的下一个兄弟元素。
			///	</summary>
			return this.find("+*");
		},
		siblings : function(){
			///	<summary>
			///	返回集合中所有元素之后的兄弟元素。
			///	</summary>
			return this.find("~*");
		}
	});

	ElementList.properties({
		article : {
			get : function(){
				///	<summary>
				///	获取元素的章节部分(直接子元素标签：article)。
				///	</summary>
				return this.find(">article");
			},
			set : setter
		},
		children : {
			get : function(){
				///	<summary>
				///	获取子元素集合。
				///	</summary>
				return new ChildrenCollection(this);
			},
			set : function(elements){
				///	<summary>
				///	移除所有现有子元素，添加指定的子元素。
				///	</summary>
				///	<param name="elements" type="Array, jQun.NodeList">需要添加的子元素集合。</param>
				this.children.remove();
				this.constructor(elementList).appendTo(this[0]);
			}
		},
		classList : {
			get : function(){
				///	<summary>
				///	获取class列表集合。
				///	</summary>
				return new ClassListCollection(this);
			},
			set : function(className){
				///	<summary>
				///	设置集合中所有元素的class属性。
				///	</summary>
				///	<param name="className" type="String">需要设置的class字符串。</param>
				this.set("className", className);
			}
		},
		footer : {
			get : function(){
				///	<summary>
				///	获取元素的脚部(直接子元素标签：footer)。
				///	</summary>
				return this.find(">footer");
			},
			set : setter
		},
		header : {
			get : function(){
				///	<summary>
				///	获取元素的头部(直接子元素标签：header)。
				///	</summary>
				return this.find(">header");
			},
			set : setter
		},
		section : {
			get : function(){
				///	<summary>
				///	获取元素的段落部分(直接子元素标签：section)。
				///	</summary>
				return this.find(">section");
			},
			set : setter
		}
	}, { gettable : true, settable : true });

	return ElementList.constructor;
}(
	this.NodeList,
	this.ChildrenCollection,
	this.ClassListCollection,
	Node,
	// SELECTORREGX
	/([\#\.])([^\s\:\#\.\,\+\~\[\>\(\)]+)/g,
	document,
	getComputedStyle,
	// setter
	function(element){
		this.createList(element).insertTo(this[0], 0);
	}
));

this.HTMLElementList = (function(ElementList, CSSPropertyCollection, addProperty){
	function HTMLElementList(_selector, _parent){
		///	<summary>
		///	通过指定选择器筛选HTML元素。
		///	</summary>
		///	<param name="_selector" type="String, Element">选择器或dom元素。</param>
		///	<param name="_parent" type="Element">指定查询的父元素。</param>
	};
	HTMLElementList = new NonstaticClass(HTMLElementList, "jQun.HTMLElementList", ElementList.prototype);

	// firefox 把id、innerHTML归为了Element的属性，但是w3c与IE9都归为了HTMLElement的属性
	forEach(
		[
			"className", "hidden", "href",
			"id", "innerHTML", "src",
			"tabIndex", "title", "value"
		],
		addProperty,
		HTMLElementList
	);

	// firefox 把onmouseenter、onmouseleave、onwheel归为了Element的属性(chrome并不支持该3个事件)
	forEach(
		Object.getOwnPropertyNames(Window.prototype),
		function(name){
			if(name.substring(0, 2) != "on")
				return;
			
			addProperty.call(HTMLElementList, name);
		}
	);

	HTMLElementList.override({
		createList : function(_selector, _parent){
			///	<summary>
			///	创建个新的HTML元素集合。
			///	</summary>
			///	<param name="_selector" type="String, Element">选择器或dom元素。</param>
			///	<param name="_parent" type="Element">指定查询的父元素。</param>
			return new HTMLElementList.constructor(_selector, _parent);
		}
	});

	HTMLElementList.properties({
		style : {
			get : function(){
				///	<summary>
				///	获取style属性集合。
				///	</summary>
				return new CSSPropertyCollection(this);
			},
			set : function(cssText){
				///	<summary>
				///	设置集合中每一个元素的style属性。
				///	</summary>
				///	<param name="cssText" type="String">需要设置的style属性字符串。</param>
				emptyAttrCollection.set.call({ sources : this }, "style", cssText);
			}
		}
	}, { gettable : true, settable : true });

	HTMLElementList.properties({
		height : function(h){
			///	<summary>
			///	获取或设置集合中每一个元素的高。
			///	</summary>
			///	<param name="h" type="String, Number">元素的高。</param>
			return this.metrics("height", h);
		},
		hide : function(){
			///	<summary>
			///	隐藏元素。
			///	</summary>
			return this.setCSSPropertyValue("display", "none");
		},
		metrics : function(name, _value){
			///	<summary>
			///	获取或设置元素指定盒模型属性值。
			///	</summary>
			///	<param name="name" type="String">盒模型属性名称。</param>
			///	<param name="_value" type="String, Number">盒模型属性值。</param>
			if(_value === undefined){
				return this.get(name, "css").split(/[^\d\.]*/).join("") - 0;
			}

			if(typeof _value === "number"){
				_value += "px";
			}

			this.setCSSPropertyValue(name, _value);
			return this;
		},
		rect : function(_name){
			///	<summary>
			///	获取第一个元素的客户端属性。
			///	</summary>
			///	<param name="_name" type="String">需要只返回单个属性值的属性名称。</param>
			var rect = this[0].getBoundingClientRect();

			return _name in rect ? rect[_name] : rect;
		},
		show : function(_display){
			///	<summary>
			///	显示元素。
			///	</summary>
			///	<param name="_display" type="String">修改元素display的css值。</param>
			return this.setCSSPropertyValue("display", _display || "block");
		},
		width : function(w){
			///	<summary>
			///	获取或设置集合中每一个元素的宽。
			///	</summary>
			///	<param name="w" type="String, Number">元素的宽。</param>
			return this.metrics("width", w);
		}
	});

	return HTMLElementList.constructor;
}(
	this.ElementList,
	this.CSSPropertyCollection,
	// addProperty
	function(name){
		define(this, name, {
			get : function(){
				return this.get(name);
			},
			set : function(value){
				this.set(name, value);
			}
		}, { gettable : true, settable : true });
	}
));

}.call(
	this,
	this.List,
	window.Window || window.constructor,
	new this.AttributeCollection([]),
	forEach,
	jQun.define
));

// 与HTMLElementList相关的类
(function(HTMLElementList, forEach){

this.Event = (function(Node, EventTarget, window, document, define, set, toArray){
	function Event(name, _init, _type, _initEventArgs){
		///	<summary>
		///	DOM事件类。
		///	</summary>
		///	<param name="name" type="String">事件名称。</param>
		///	<param name="_init" type="Function">事件初始化函数。</param>
		///	<param name="_type" type="String">事件类型(MouseEvent、UIEvent、WheelEvent等)。</param>
		this.assign({
			initEventArgs : [name].concat(_initEventArgs ? toArray(arguments, 3) : [true, true]),
			name : name,
			type : _type
		});

		if(typeof _init !== "function")
			return;
		
		_init.call(this);
	};
	Event = new NonstaticClass(Event, "jQun.Event");

	Event.properties({
		attachTo : function(target){
			///	<summary>
			///	应该附加该事件的标签。
			///	</summary>
			///	<param name="target" type="String, Node">标签名称。</param>
			var t = [], name = this.name, attach = HTMLElementList.prototype.attach;

			if(typeof target === "string"){
				if(target === "*"){
					if(EventTarget){
						t.push(EventTarget.prototype);
					}
					else {
						t.push(Node.prototype, window.constructor.prototype);
					}

					t.push(HTMLElementList.prototype);
				}
				else {
					t.push(document.createElement(target).constructor.prototype);
				}
			}
			else {
				t.push(target);
			}

			forEach(
				t,
				function(tg){
					define(tg, "on" + name, this,	{ settable : true, gettable : true });
				},
				{
					get : function(){
						return null;
					},
					set : function(fn){
						var obj = {};

						obj[name] = fn;
						attach.call(this instanceof HTMLElementList ? this : [this], obj);
					}
				}
			);

			return this;
		},
		eventAttrs : undefined,
		initEventArgs : undefined,
		name : "",
		setEventAttrs : function(attrs){
			///	<summary>
			///	设置事件属性。
			///	</summary>
			///	<param name="attrs" type="Object">属性键值对。</param>
			this.eventAttrs = attrs;
			return this;
		},
		source : undefined,
		trigger : function(target){
			///	<summary>
			///	触发事件。
			///	</summary>
			///	<param name="target" type="Node">触发该事件的节点。</param>
			var type = this.type, event = new window[type](this.name);

			event["init" + type].apply(event, this.initEventArgs);
			set(event, this.eventAttrs);

			return target.dispatchEvent(event);
		},
		type : "Event"
	});

	return Event.constructor;
}(
	Node,
	window.EventTarget,
	window,
	document,
	jQun.define,
	jQun.set,
	jQun.toArray
));

this.HTML = (function(Function, SPACEREGX, FORREGX, replaceMethod, document){
	function HTML(template){
		///	<summary>
		///	html模板。
		///	</summary>
		///	<param name="template" type="String, HTMLElement, jQun.HTMLElementList">html模板源字符串或标签(一般为script标签)。</param>

		// 此类代码还需优化
		var arr = [], variables = {};

		arr.push("with(this){ return (function(", "undefined){ this.push('");

		arr.push(
			// 使用Text类的replace替换参数
			replaceMethod.call({
				text : (typeof template === "string" ? template : template.innerHTML)
					// 给单引号加保护
					.split("'").join("\\'")
					// 替换掉特殊的空白字符
					.replace(SPACEREGX, "")
					// 替换for循环
					.replace(FORREGX, function(str, condition, i){
						return [
							"');forEach(",
							condition.split("{").join("\t").split("}").join("\n"),
							", function(" + (i || "") + ")\t this.push('"
						].join("");
					})
			}, function(str, modifier, word){
				if(modifier === ":"){
					return "\t" + word + "\n";
				}

				if(word.indexOf(".") > -1){
					if(modifier === "~"){
						return "'+ (" + word + " || '') + '";
					}
				}
				else{
					variables[word] = modifier === "~";
				}

				return "'+ " + word + " + '";
			})
			// 替换for循环的结束标识“}”
			.split("}").join("');}, this);this.push('")
			// 替换临时产生的大括号
			.split("\t").join("{")
			.split("\n").join("}")
		);

		arr.push("');return this.join('');}.call([]");

		// 定义参数
		forEach(variables, function(isEmpty, word){
			arr[0] += word + ", ";
			arr.push(
				replaceMethod.call(
					{
						text : ", '{word}' in this ? this['{word}'] : " + (isEmpty ? "''" : "'{word}'")
					},
					{ word : word }
				)
			);
		});

		arr.push(")); }");

		this.assign({
			template : arr.join("")
		});
	};
	HTML = new NonstaticClass(HTML, "jQun.HTML");

	HTML.properties({
		create : function(_data){
			///	<summary>
			///	将模板转化为html元素。
			///	</summary>
			///	<param name="data" type="Object, Array">需要渲染的数据。</param>
			var htmlElementList = new HTMLElementList(""), parent = document.createElement("div");

			parent.innerHTML = this.render(_data);

			htmlElementList.combine(parent.childNodes);
			htmlElementList.remove();

			return htmlElementList;
		},
		render : function(_data){
			///	<summary>
			///	渲染模板。
			///	</summary>
			///	<param name="_data" type="Object, Array">需要渲染的数据。</param>
			return new Function("forEach", this.template).call(_data || {}, forEach);
		},
		template : ""
	});

	return HTML.constructor;
}(
	Function,
	// SPACEREGX => space(查找特殊的空白字符)
	/[\r\t\n]/g,
	// FORREGX => for(查找for语句)
	/@for\s*\(([\s\S]+?)(?:\s*->>\s*([\s\S]+?))*?\)\s*\{/g,
	// replaceMethod
	this.Text.prototype.replace,
	document
));

this.StaticHTML = (function(HTML){
	function StaticHTML(){
		///	<summary>
		///	静态html模板。
		///	</summary>
		var docEl = new HTMLElementList(document);

		docEl.attach({
			DOMContentLoaded : function(){
				new HTMLElementList(document.scripts).attributes.forEach(function(attr, i, attrs){
					var type = attr.type;

					if(!type)
						return;

					if(type.value !== "text/static-html")
						return;

					new HTML(
						attrs.sources[i].innerHTML
					).create().replace(attrs.sources[i]);
				});

				docEl.detach({ DOMContentLoaded : arguments.callee });
			}
		});
	};
	StaticHTML = new StaticClass(StaticHTML, "jQun.StaticHTML");

	return StaticHTML;
}(
	this.HTML
));

}.call(
	this,
	this.HTMLElementList,
	forEach
));

// 与数据有关的类
(function(JSON){

this.SessionCache = (function(sessionStorage){
	function SessionCache(name){
		///	<summary>
		///	缓存数据。
		///	</summary>
		/// <param name="name" type="String">缓存数据的标识名称</param>
		this.assign({
			name : name
		});
	};
	SessionCache = new NonstaticClass(SessionCache, "jQun.SessionCache");

	SessionCache.properties({
		del : function(key){
			///	<summary>
			///	删除某一条缓存数据。
			///	</summary>
			/// <param name="key" type="String">缓存数据的主键</param>
			var storage = this.get();

			delete storage[key];
			sessionStorage.setItem(this.name, JSON.stringify(storage));
		},
		get : function(_key){
			///	<summary>
			///	获取某一条缓存数据。
			///	</summary>
			/// <param name="_key" type="String">缓存数据的主键</param>
			var storage = JSON.parse(sessionStorage.getItem(this.name));

			if(!storage){
				storage = {};
			}

			if(_key === undefined){
				return storage;
			}

			return storage[_key];
		},
		name : "",
		set : function(key, value){
			///	<summary>
			///	设置某一条缓存数据。
			///	</summary>
			/// <param name="key" type="String">缓存数据的主键</param>
			/// <param name="value" type="Object, String, Number, Boolean">缓存数据的值</param>
			var storage = this.get();

			storage[key] = value;
			sessionStorage.setItem(this.name, JSON.stringify(storage));
		}
	});

	return SessionCache.constructor;
}(
	// sessionStorage
	sessionStorage
));

this.Storage = (function(forEach){
	function Storage(){ };
	Storage = new NonstaticClass(Storage, "jQun.Storage");

	Storage.properties({
		clear : function(){
			///	<summary>
			///	清空所有储存数据。
			///	</summary>
			forEach(this, function(value, key){
				this.del(key);
			}, this);
			return this;
		},
		del : function(key){
			///	<summary>
			///	删除一项储存数据。
			///	</summary>
			///	<param name="key" type="String">数据主键。</param>
			return delete this[key];
		},
		get : function(key){
			///	<summary>
			///	获取数据。
			///	</summary>
			///	<param name="key" type="String">数据主键。</param>
			return this[key];
		},
		set : function(key, value){
			///	<summary>
			///	设置数据。
			///	</summary>
			///	<param name="key" type="String">数据主键。</param>
			///	<param name="value" type="*">数据值。</param>
			this[key] = value;
			return this;
		}
	});

	return Storage.constructor;
}());

}.call(
	this,
	this.JSON,
	forEach
));

// 与ajax相关的类
(function(JSON, forEach, encodeURIComponent){

this.RequestConnection = (function(Text, SessionCache, toUpperCase, getEncodedParams){
	function RequestConnection(name, url, type, _handler, _cacheable){
		///	<summary>
		///	ajax请求连接。
		///	</summary>
		///	<param name="name" type="String">连接名称。</param>
		///	<param name="url" type="String">连接url。</param>
		///	<param name="type" type="String">发送数据的方式("POST"、"GET")。</param>
		///	<param name="_handler" type="Function">接收数据后的处理函数。</param>
		///	<param name="_cacheable" type="Boolean">是否缓存数据。</param>
		var cache;

		_cacheable = _cacheable === true;

		if(_cacheable){
			cache = new SessionCache("jQun.Cache_" + name);
		}

		this.assign({
			cache : cache,
			name : name,
			url : url,
			isPost : toUpperCase.call(type) === "POST",
			handler : _handler
		});
	};
	RequestConnection = new NonstaticClass(RequestConnection, "jQun.RequestConnection");

	RequestConnection.properties({
		cache : undefined,
		handler : undefined,
		isPost : false,
		name : "",
		url : ""
	});

	RequestConnection.properties({
		open : function(name, params, complete, responseType, isTesting){
			///	<summary>
			///	开打一个ajax连接。
			///	</summary>
			///	<param name="name" type="String">连接名称。</param>
			///	<param name="params" type="Object">url的替换参数及post方法的传递参数。</param>
			///	<param name="complete" type="Function">异步完成后所执行的回调函数。</param>
			///	<param name="responseType" type="String">返回的数据格式。</param>
			///	<param name="isTesting" type="Boolean">是否在测试环境中。</param>
			var url = this.url, cache = this.cache,

				isJSON = responseType === "JSON",

				request = new XMLHttpRequest();

			if(url instanceof Text){
				url = url.toUrlParams(params);
			}

			if(typeof complete === "function"){
				if(cache){
					var data = cache.get(url);

					if(data){
						complete(data, true, 200);
						return;
					}
				}

				var handler = this.handler;

				request.onreadystatechange =  function(){
					if(this.readyState < 4)
						return;

					var isSuccess = this.status === 200, responseData = isSuccess ? this.responseText : "";

					if(isSuccess){
						if(isJSON){
							responseData = JSON.parse(responseData);
						}

						if(typeof handler === "function"){
							responseData = handler(responseData, params);
						}

						if(cache){
							cache.set(url, responseData);
						}
					}

					complete(responseData, false, isSuccess);
				};
			}

			if(isTesting){
				request.onreadystatechange.call({
					readyState : 4,
					status : 200,
					responseText : ""
				});

				return;
			}

			var isPost = this.isPost, type = isPost ? "POST" : "GET";

			request.open(type, url, true);
			request.responseType = isJSON ? "text" : responseType;
			
			if(isPost){
				this.RequestHeader.addTo(request);
			}

			request.send(isPost ? getEncodedParams(params) : null);
			return request;
		}
	});

	return RequestConnection.constructor;
}(
	this.Text,
	this.SessionCache,
	String.prototype.toUpperCase,
	// getEncodedParams
	function(params){
		///	<summary>
		///	获取post方法的参数字符串。
		///	</summary>
		///	<param name="params" type="Object">参数。</param>
		var arr = [];

		forEach(params, function(value, name){
			arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
			arr.push("&");
		});

		arr.splice(-1);
		return arr.join("");
	}
));

this.RequestHeader = (function(){
	function RequestHeader(){
		///	<summary>
		///	请求头部信息。
		///	</summary>
	};
	RequestHeader = new StaticClass(null, "jQun.RequestHeader");

	RequestHeader.properties({
		name : "Content-type",
		value : "application/x-www-form-urlencoded"
	});

	RequestHeader.properties({
		addTo : function(request){
			///	<summary>
			///	向指定的ajax请求添加头部信息。
			///	</summary>
			///	<param name="name" type="Object">ajax请求。</param>
			request.setRequestHeader(this.name, this.value);
			return this;
		},
		reset : function(name, value){
			///	<summary>
			///	重新设置请求头部信息。
			///	</summary>
			///	<param name="name" type="String">名称。</param>
			///	<param name="value" type="String">值。</param>
			this.name = name;
			this.value = value;
			return this;
		}
	});

	return RequestHeader;
}());

this.Ajax = (function(Storage, RequestHeader, RequestConnection){
	function Ajax(){
		///	<summary>
		///	ajax异步类。
		///	</summary>
		if(!!(new XMLHttpRequest())){
			this.enabled = true;
			return;
		}

		console.warn("当前浏览器不支持XMLHttpRequest。");
	};
	Ajax = new StaticClass(Ajax, "jQun.Ajax", {
		enabled : false
	});

	Ajax.properties({
		RequestHeader : RequestHeader,
		beginTesting : function(){
			this.isTesting = true;
		},
		isTesting : false,
		open : function(name, params, _complete){
			///	<summary>
			///	开打一个ajax连接。
			///	</summary>
			///	<param name="name" type="String">连接名称。</param>
			///	<param name="params" type="Object">url的替换参数及post方法的传递参数。</param>
			///	<param name="_complete" type="Function">异步完成后所执行的回调函数。</param>
			var requstConnection = this.requestStorage.get(name);

			if(!requstConnection){
				console.error("ajax请求信息错误：请检查连接名称是否正确。", arguments);
				return;
			}

			var args = jQun.toArray(arguments);

			args.push(this.responseType, this.isTesting);
			requstConnection.open.apply(requstConnection, args);
		},
		requestStorage : new Storage(),
		responseType : "text",
		save : function(allSettings, _handlers){
			///	<summary>
			///	存储ajax连接信息。
			///	</summary>
			///	<param name="allSettings" type="Array">ajax连接信息。</param>
			///	<param name="_handlers" type="Function">所有的数据格式转换函数。</param>
			var requestStorage = this.requestStorage

			if(!_handlers){
				_handlers = {};
			}

			forEach(allSettings, function(settings){
				var name = settings[0];

				requestStorage.set(
					name,
					new RequestConnection(settings[0], settings[1], settings[2], _handlers[name], settings[3])
				);
			});
			return requestStorage;
		},
		setResponseType : function(type){
			///	<summary>
			///	设置返回数据的格式。
			///	</summary>
			///	<param name="type" type="String">数据的格式("text"、"json"、"arraybuffer"、"blob"或"document")。</param>
			this.responseType = type.toLowerCase();
		}
	});

	return Ajax;
}(
	this.Storage,
	this.RequestHeader,
	this.RequestConnection
));

}.call(
	this,
	this.JSON,
	forEach,
	encodeURIComponent
));

defineProperties(jQun, this);
}.call(
	{},
	jQun,
	jQun.NonstaticClass,
	jQun.StaticClass,
	jQun.Enum,
	jQun.defineProperties,
	jQun.forEach
));
