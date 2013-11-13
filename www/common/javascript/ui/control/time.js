(function(Time, NonstaticClass, Panel, HTML, Event){
this.DateTable = (function(OverflowPanel, Date, tablePanelHtml, dateTableHtml, focusDateEvent, focusMonthEvent){
	function DateTable(){
		///	<summary>
		///	日期表格。
		///	</summary>
		var dateTable = this;

		this.combine(tablePanelHtml.create());
		
		// 采用溢出功能
		new OverflowPanel(this[0], true);

		this.attach({
			userclick : function(e){
				var dateEl = jQun(e.target).between('li[datestatus="0"]', this);

				if(dateEl.length === 0)
					return;

				dateTable.focus(dateEl.get("time", "attr"));
			},
			leaveborder : function(e){
				// 如果偏离边框的距离小于2行半就return 45*2.5=112.5
				if(e.offsetBorder < 110)
					return;

				var toFocusEl = dateTable.find(
						'li:' + (e.direction === "top" ? "first" : "last") + '-child ol > li[datestatus="0"]'
					);

				toFocusEl.splice(1);

				dateTable.focus(toFocusEl.get("time", "attr") - 0);
			}
		});

		// 更新月份
		this.updateSiblingMonths(new Date() - 0);
	};
	DateTable = new NonstaticClass(DateTable, "Bao.UI.Control.Time.DateTable", Panel.prototype);

	DateTable.properties({
		addMonth : function(time){
			///	<summary>
			///	添加一个月的表格。
			///	</summary>
			/// <param name="time" type="number">当月第一天的0时0分的毫秒数</param>
			var firstDate = new Date(time), lastDate = new Date(time),
			
				monthData = [], month = firstDate.getMonth() + 1;
			
			// 设置本月第一天
			firstDate.setDate(1);
			firstDate.setHours(0, 0, 0, 0);
			// 设置本月最后一天
			lastDate.setMonth(month, 0);
			lastDate.setHours(0, 0, 0, 0);

			// 数据
			for(
				var maxDate = lastDate.getDate(),
					i = firstDate.getDay() * -1,
					j = maxDate + (6 - lastDate.getDay()),
					k = new Date(firstDate.getTime());
				i < j;
				i++	
			){
				var d = k.getDate();

				monthData.push(i < 0 || i >= maxDate ? {
					time : -1,
					date : -1,
					day : -1,
					dateStatus : "-1"
				} : {
					time : k.getTime(),
					date : d,
					day : k.getDay(),
					dateStatus : "0"
				});

				if(i < 0){
					continue;
				}

				k.setDate(d + 1);
			}

			// 渲染数据
			dateTableHtml.create({
				monthData : monthData,
				month : month,
				year : firstDate.getFullYear(),
				time : firstDate.getTime()
			}).appendTo(this[0]);
		},
		clearTable : function(){
			///	<summary>
			///	清空表格。
			///	</summary>
			this.innerHTML = "";
		},
		focus : function(time){
			///	<summary>
			///	聚焦到某一天上。
			///	</summary>
			/// <param name="time" type="number">当天任意时刻的毫秒数</param>
			var focusedDateEl,
			
				oldFocusedDateEl = this.getFocused();

			time = new Date(time - 0).setHours(0, 0, 0, 0);
			focusedDateEl = this.find('ol > li[time="' + time + '"]');

			if(oldFocusedDateEl.length > 0){
				var oldTime = oldFocusedDateEl.get("time", "attr") - 0;

				// 如果是同一天
				if(oldTime === time){
					return;
				}

				var date = new Date(oldTime);

				oldFocusedDateEl.classList.remove("focusedDate");

				// 如果是同月份的日期切换
				if(date.getMonth() === new Date(time).getMonth()){
					focusedDateEl.classList.add("focusedDate");
					focusDateEvent.trigger(focusedDateEl[0]);
					return;
				}

				this.find('li[time="' + date.setDate(1) + '"]').classList.remove("focused");
			}
			
			var monthEl = this.find('li[time="' + new Date(time).setDate(1) + '"]');

			focusedDateEl = this.find('ol > li[time="' + time + '"]');
			monthEl = this.find('li.calendar_month[time="' + (new Date(time).setDate(1)) + '"]');
			
			monthEl.classList.add("focused");
			focusedDateEl.classList.add("focusedDate");

			focusMonthEvent.setEventAttrs({
				monthTime : monthEl.getAttribute("time") - 0
			});
			focusMonthEvent.trigger(monthEl[0]);

			focusDateEvent.trigger(focusedDateEl[0]);
		},
		getFocused : function(){
			///	<summary>
			///	获取当前聚焦的日期元素。
			///	</summary>
			return this.find('ol > li.focusedDate');
		},
		savedTable : undefined,
		top : function(){
			///	<summary>
			///	将当前聚焦的日期置顶。
			///	</summary>
			var focusedDateEl = this.find("li.focusedDate");

			if(focusedDateEl.length === 0)
				return;

			var top, 

				focusedMonthEl = focusedDateEl.between("li.focused", this[0]);

			this.set("top",	this.rect("top") - focusedDateEl.rect("top") + "px", "css");
		},
		updateSiblingMonths : function(time){
			///	<summary>
			///	更新相邻的月份（指定月份之前的半年，指定的月份，指定的月份后1年）。
			///	</summary>
			/// <param name="time" type="number">指定月份的某一天的0时0分的毫秒数</param>
			var date = new Date(time),
				
				month = date.getMonth(), year = date.getFullYear();

			// 清空
			this.clearTable();

			for(var i = -6;i < 13;i++){
				date.setFullYear(year, month + i, 1);
				this.addMonth(date.getTime());
			}
		}
	});

	return DateTable.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	window.Date,
	// tablePanelHtml
	new HTML('<ul></ul>'),
	// dateTableHtml
	new HTML([
		'<li class="calendar_month" time="{time}">',
			'<p class="whiteFont">',
				'<strong>{year}年{month}月</strong>',
			'</p>',
			'<ol class="inlineBlock">',
				'@for(monthData ->> dt){',
					'<li datestatus="{dt.dateStatus}" day="{dt.day}" time="{dt.time}">',
						'<aside purpose="用户自定义内容"></aside>',
						'<p>',
							'<small>{month}月</small>',
							'<span>{dt.date}</span>',
						'</p>',
					'</li>',
				'}',
			'</ol>',
		'</li>'
	].join("")),
	// focusDateEvent
	new Event("focusdate"),
	// focusMonthEvent
	new Event("focusmonth")
));

this.Calendar = (function(DateTable, calendarHtml, stretchEvent, shrinkEvent){
	function Calendar(_isStretch){
		///	<summary>
		///	日历控件。
		///	</summary>
		/// <param name="_isStretch" type="boolean">该控件是否可以伸展的</param>
		var dateTable = new DateTable();

		_isStretch = _isStretch === true;

		this.assign({
			dateTable : dateTable,
			isStretch : _isStretch
		});

		// 添加日期表格
		this.combine(calendarHtml.create());
		dateTable.appendTo(this.find("dd")[0]);

		if(!_isStretch)
			return;

		var calendar = this;

		// 重写classList属性
		this.override({
			classList : this.classList
		});

		dateTable.attach({
			focusdate : function(e){
				dateTable.top();
				calendar.shrink();
			}
		});

		jQun(window).attach({
			touchstart : function(e){
				// 如果点的是在该日历控件上，那么展开，否则收起
				if(jQun(e.target).between(calendar[0], calendar.parent()[0]).length > 0){
					if(calendar.isStretched()){
						return;
					}
					calendar.stretch();
					e.stopPropagation();
					return;
				}
	
				dateTable.top();
				calendar.shrink();
			}
		}, true);
	};
	Calendar = new NonstaticClass(Calendar, "Bao.UI.Control.Time.Calendar", Panel.prototype);

	Calendar.properties({
		dateTable : undefined,
		isStretch : false,
		isStretched : function(){
			///	<summary>
			///	判断该日历是否已经是展开的。
			///	</summary>
			return this.classList.contains("stretch");
		},
		shrink : function(){
			///	<summary>
			///	收起该日历。
			///	</summary>
			if(!this.isStretched())
				return;

			this.classList.remove("stretch");
			shrinkEvent.trigger(this[0]);
		},
		stretch : function(){
			///	<summary>
			///	展开该日历。
			///	</summary>
			if(this.isStretched())
				return;

			this.classList.add("stretch");
			stretchEvent.trigger(this[0]);
		}
	});

	return Calendar.constructor;
}(
	this.DateTable,
	// calendarHtml
	new HTML([
		'<div class="calendar lightBdColor">',
			'<dl>',
				'<dt class="inlineBlock whiteFont">',
					'@for(["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"] ->> title, day){',
						'<span day="{day}">{title}</span>',
					'}',
				'</dt>',
				'<dd></dd>',
			'</dl>',
		'</div>'
	].join("")),
	// stretch
	new Event("stretch"),
	// shrink
	new Event("shrink")
));

Time.members(this);
}.call(
	{},
	Bao.UI.Control.Time,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML,
	jQun.Event
));