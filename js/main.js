$(function(){
	$('#fullpage').fullpage({
		anchors:['page1','page2','page3','page4'],
		verticalCentered:false,
		// continuousVertical:true,
//		navigation:true,
		navigationTooltips:['page1','page2','page3','page4'],
		showActiveTooltips:false,
//		 autoScrolling:false,
		// menu:'#fullpageMenu',
//		afterLoad:function(link,index){
//			switch(index){
//				case 1:
//					move('.section1 h1').scale(1.5).end();
//					move('.section1 p').set('margin-top','5%').end();
//				break;
//
//				case 2:
////					move('.section2 h1').scale(0.6).end();
//				break;
//
//				case 3:
//					move('.section3 h1').set('margin-left','20%').end();
//					move('.section3 p').set('margin-left','20%').end();
//				break;
//				case 4:
//					move('.section4 h1').set('opacity','1').end();
//					move('.section4 img.img1').rotate(360).end(function(){
//						move('.section4 img.img2').rotate(360).end(function(){
//							move('.section4 img.img3').rotate(360).end();
//						});
//					});
//				break;
//			}
//		},
//		onLeave:function(index,nextindex,direction){
//			switch(index){
//				case 1:
//					move('.section1 h1').scale(1).end();
//					move('.section1 p').set('margin-top','800px').end();
//				break;
//
//				case 2:
//					move('.section2 h1').scale(1).end();
//				break;
//
//				case 3:
//					move('.section3 h1').set('margin-left','-1500px').end();
//					move('.section3 p').set('margin-left','1500px').end();
//				break;
//				case 4:
//					move('.section4 img.img1').rotate(-360).end(function(){
//						move('.section4 img.img2').rotate(-360).end(function(){
//							move('.section4 img.img3').rotate(-360).end();
//						})
//					});
//					move('.section4 h1').set('opacity','0').end();
//				break;
//			}
//		}
	});
});