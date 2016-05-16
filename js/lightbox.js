;
(function($) {
	var Carousel = function(poster) {
		var _self = this;
		//保存单个对象
		this.poster = poster;
		this.posterItemMain = poster.find("ul.poster-list");
		this.prevbtn = poster.find("div.prev-btn");
		this.nextbtn = poster.find("div.next-btn");
		this.posterItem = poster.find("li.poster-item");
		this.posterFirstItem = this.posterItem.first();
		this.posterLastItem = this.posterItem.last();
		this.flag = true;
		//配置默认参数
		this.setting = {
			"width": 1000, //幻灯片高度
			"height": 270, //幻灯片宽度
			"posterWidth": 640, //幻灯片第一帧高度
			"posterHeight": 270,
			"verticalAlign": "middle",
			"speed": 500,
			"autoPlay":true,
			"delay":500,
			"scale": 0.9
		};
		$.extend(this.setting, this.getSetting());
		console.log(this.setting);
		this.setSettingValue();
		this.setPosterPos();

		if(_self.setting.autoPlay){
			_self.autoPlay();
		}
		this.poster.hover(function(){
			window.clearInterval(_self.timer);
		},function(){
			_self.autoPlay();
		});
		this.prevbtn.click(function() {
			if (_self.flag) {
				_self.flag = false;
				_self.move("right");
			}
		});
		this.nextbtn.click(function() {
			if (_self.flag) {
				_self.flag = false;
				_self.move("left");
			}
		});

	};
	Carousel.prototype = {
		
		autoPlay:function(){
			var self=this;
			self.timer=window.setInterval(function(){
				self.prevbtn.click();
			},self.setting.delay);
		},
		//移动事件
		move: function(dir) {
			var _this = this;
			var zIndexArr=[];
			if (dir === "left") {
				this.posterItem.each(function() {
					var self = $(this),
						prev = self.prev().get(0) ? self.prev() : _this.posterLastItem,
						zIndex = prev.css("zIndex"),
						width = prev.width(),
						height = prev.height(),
						opacity = prev.css("opacity"),
						left = prev.css("left"),
						top = prev.css("top");
						zIndexArr.push(zIndex);
					self.animate({
//						zIndex: zIndex,
						width: width,
						height: height,
						opacity: opacity,
						left: left,
						top: top,
					}, _this.setting.speed,function() {
						_this.flag = true;
					});
				});
				this.posterItem.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);
				});
			} else if (dir === "right") {
				this.posterItem.each(function() {
					var self = $(this),
						next = self.next().get(0) ? self.next() : _this.posterFirstItem,
						zIndex = next.css("zIndex"),
						width = next.width(),
						height = next.height(),
						opacity = next.css("opacity"),
						left = next.css("left"),
						top = next.css("top");
						zIndexArr.push(zIndex);
					self.animate({
//						zIndex: zIndex,
						width: width,
						height: height,
						opacity: opacity,
						left: left,
						top: top,
					}, _this.setting.speed,function() {
						_this.flag = true;
					});
				});
				this.posterItem.each(function(i){
					$(this).css("zIndex",zIndexArr[i]);
				});
			}
		},

		//设置位置
		setVerticalAlign: function(height) {
			var vertical = this.setting.verticalAlign,
				top = 0;
			if (vertical === "top") {
				top = 0;
			} else if (vertical === "middle") {
				top = (this.setting.height - height) / 2;
			} else if (vertical === "bottom") {
				top = this.setting.height - height;
			} else {
				top = (this.setting.height - height) / 2;
			}
			return top;
		},
		//设置剩余帧的位置关系
		setPosterPos: function() {
			var self = this;
			var slicesitem = this.posterItem.slice(1),
				sliceSize = slicesitem.size() / 2,
				sliceright = slicesitem.slice(0, sliceSize),
				sliceleft = slicesitem.slice(sliceSize),
				level = Math.floor(this.posterItem.size() / 2);
			var rw = this.setting.posterWidth,
				rh = this.setting.posterHeight,
				w = (this.setting.width - this.setting.posterWidth) / 2,
				gap = w / level;
			var offsetw = rw + w;
			sliceright.each(function(i) {
				level--;
				rw = rw * self.setting.scale;
				rh = rh * self.setting.scale;
				$(this).css({
					zIndex: level,
					width: rw,
					height: rh,
					opacity: 1 / (++i),
					left: offsetw + gap * i - rw,
					top: self.setVerticalAlign(rh),
				});
			});
			//设置左边的位置关系
			var lw = sliceright.last().width(),
				lh = sliceright.last().height(),
				oloop = Math.floor(this.posterItem.size() / 2);
			sliceleft.each(function(i) {
				$(this).css({
					zIndex: i,
					width: lw,
					height: lh,
					opacity: 1 / oloop,
					left: gap * i,
					top: self.setVerticalAlign(lh),
				});
				lw = lw / self.setting.scale;
				lh = lh / self.setting.scale;
				oloop++;
			});

		},
		setSettingValue: function() {
			var mw = this.setting.width,
				mh = this.setting.height,
				rw = this.setting.posterWidth,
				rh = this.setting.posterHeight,
				w = (this.setting.width - this.setting.posterWidth) / 2;

			this.poster.css({
				width: mw,
				height: mh,
			});

			this.posterItemMain.css({
				width: mw,
				height: mh,
			});

			this.prevbtn.css({
				width: w,
				height: mh,
				zIndex: Math.ceil(this.posterItem.size() / 2),
			});
			this.nextbtn.css({
				width: w,
				height: mh,
				zIndex: Math.ceil(this.posterItem.size() / 2),
			});
			this.posterFirstItem.css({
				width: rw,
				height: rh,
				left: w,
				zIndex: Math.floor(this.posterItem.size() / 2),
			});
		},
		//获取人工配置的参数
		getSetting: function() {
			var setting = this.poster.attr("data-setting");
			if (setting && setting != "") {
				return $.parseJSON(setting);
			} else {
				return {};
			}
		},
	};
	Carousel.init = function(posters) {
		var _this_ = this;
		posters.each(function() {
			new _this_($(this));
		});
	}
	window['Carousel'] = Carousel;
})(jQuery);