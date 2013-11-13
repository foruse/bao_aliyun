(function(Generate, StaticClass, random){
this.Number = (function(){
	function Number(){};
	Number = new StaticClass(undefined, "Bao.Test.DummyData.Generate.Number");

	Number.properties({
		id : function(){
			return this.random(1000000);
		},
		random : function(_max){
			///	<summary>
			///	获取随机数字。
			///	</summary>
			///	<param name="_max" type="number">最大随机数。</param>
			return Math.round(random() * (_max || 100));
		}
	}, { enumerable : true });

	return Number;
}());


this.String = (function(baseString){
	function String(){};
	String = new StaticClass(null, "Bao.Test.DummyData.Generate.String");

	String.properties({
		random : function(_len){
			///	<summary>
			///	获取随机字符串。
			///	</summary>
			///	<param name="_len" type="number">需要获取的字符串长度。</param>
			var strArr = [], strLen = baseString.length, ceil = Math.ceil;

			for(
				var i = 0;
				i < (_len == null ? 10 : _len);
				i++
			){
				strArr.push(baseString[ceil(random() * strLen)]);
			}

			return strArr.join("");
		}
	}, { enumerable : true });

	return String;
}("abcdefghtijklmnopqrstuvwxyz张李王赵0123456789!@#$%^&*()_+"));

Generate.members(this);
}.call(
	{},
	Bao.Test.DummyData.Generate,
	jQun.StaticClass,
	Math.random
));