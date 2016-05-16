;(function($){
	var Section3=function(sec){
		var self=this;
		this.obj=sec;
		// alert(this.sec);
		
	}
	Section3.prototype={
		
	}
	Section3.init=function(sec){
		new this($(sec));
	}
	window['Section3']=Section3;
	
	var Section2=function(sec){
		var self=this;
//		alert("section2");
		this.sec=sec;
		this.tip=sec.find('ul.tip');
		this.skill=sec.find('ul.skill-ul');
		this.prevbtn=this.tip.find('li.tip-prev');
		this.nextbtn=this.tip.find('li.tip-next');
		this.li1=this.skill.find('li.li1');
		this.li2=this.skill.find('li.li2');
		this.left=this.prevbtn.find('span.tip-left');
		this.right=this.nextbtn.find('span.tip-right');
		this.wr=$(window).width();
		
		this.left.click(function(){
			self.prevEvent("next");
		});
		this.right.click(function(){
			self.prevEvent("prev");
		});
	};
	Section2.prototype={
		
		prevEvent:function(dir){
			var self=this;
			if (dir==="prev") {
				$(this.li1).animate({
					top:0,
					left:"-100%",
				});
				$(this.right).removeClass('fa-circle-o').addClass('fa-circle');
				$(this.left).removeClass('fa-circle').addClass('fa-circle-o');
				$(this.li2).animate({
					left:0,
					top:0
				});
			} else{
				$(this.li1).animate({
					top:0,
					left:0,
				});
				$(this.li2).animate({
					left:"100%",
					top:0
				});
				$(this.left).removeClass('fa-circle-o').addClass('fa-circle');
				$(this.right).removeClass('fa-circle').addClass('fa-circle-o');
				
			}
		},
	};
	
	Section2.init=function(sec){
		new this($(sec));
	};
	window['Section2']=Section2;
})(jQuery);