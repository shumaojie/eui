/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath init/eui.init.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($) {

	/**
	 * 全局默认配置项.
	 *
	 * @type {Object}
	 * @alias #global
	 * @memberof Eui
	 * @property {Object} gestureConfig 手势事件
	 * @property {Boolean} gestureConfig.tap=true 单击屏幕
	 * @property {Boolean} gestureConfig.doubletap=false 双击屏幕
	 * @property {Boolean} gestureConfig.longtap=false 长按屏幕
	 * @property {Boolean} gestureConfig.hold=false 按住屏幕
	 * @property {Boolean} gestureConfig.flick=true 快速单击屏幕
	 * @property {Boolean} gestureConfig.swipe=true 滑动
	 * @property {Boolean} gestureConfig.drag=true 拖动中
	 * @property {Boolean} gestureConfig.pinch=false 捏屏幕
	 */
	$.global = $.options = {
		gestureConfig: {
			tap: true,
			doubletap: false,
			longtap: false,
			hold: false,
			flick: true,
			swipe: true,
			drag: true,
			pinch: false
		}
	};

	/**
	 * 初始化全局配置。配置项可以是，比如：
	 *
	 * - `beforeback` : 后退之前执行的方法.
	 *
	 * @alias #initGlobal
	 * @memberof Eui
	 * @param {Object} options 配置项将会合并并覆盖默认[global]{@link Eui#global}配置.
	 * @returns {Eui}
	 */
	$.initGlobal = function(options) {
		$.options = $.extend(true, $.global, options);
		return this;
	};
	var inits = {};

	var isInitialized = false;

	/**
	 * eui框架将很多功能配置都集中在$.init方法中，要使用某项功能，只需要在$.init方法中完成对应参数配置即可，
	 * 目前支持在$.init方法中配置的功能包括：创建子页面、关闭页面、手势事件配置、预加载、下拉刷新、上拉加载。
	 *
	 * ### 创建子页面 ###
	 *
	 * 在mobile app开发过程中，经常遇到卡头卡尾的页面，此时若使用局部滚动，
	 * 在android手机上会出现滚动不流畅的问题； eui的解决思路是：将需要滚动的区域通过单独的webview实现，完全使用原生滚动。
	 * 具体做法则是：将目标页面分解为主页面和内容页面，主页面显示卡头卡尾区域，比如顶部导航、底部选项卡等；
	 * 内容页面显示具体需要滚动的内容，然后在主页面中调用$.init方法初始化内容页面。
	 *
	 * 	   $.init({
	 *		 subpages:[{
	 *		   url:your-subpage-url,//子页面HTML地址，支持本地地址和网络地址
	 *		   id:your-subpage-id,//子页面标志
	 *		   styles:{
	 *			  top:subpage-top-position,//子页面顶部位置
	 *			  bottom:subpage-bottom-position,//子页面底部位置
	 *			  width:subpage-width,//子页面宽度，默认为100%
	 *			  height:subpage-height,//子页面高度，默认为100%
	 *			  ......
	 *		   },
	 *		   extras:{}//额外扩展参数
	 *		  }]
	 *		});
	 *
	 * 参数说明：
	 *
	 * - `styles` : 表示窗口属性，参考[5+规范中的WebviewStyle](http://www.dcloud.io/docs/api/zh_cn/webview.shtml#plus.webview.WebviewStyle)；特别注意，height和width两个属性,即使不设置，也默认按100%计算；因此若设置了top值为非"0px"的情况，建议同时设置bottom值，否则5+ runtime根据高度100%计算，可能会造成页面真实底部位置超出屏幕范围的情况；left、right同理。
	 *
	 * 示例：Hello eui的首页其实就是index.html加list.html合并而成的;
	 * index.html的作用就是显示固定导航，list.html显示具体列表内容，列表项的滚动是在list.html所在webview中使用原生滚动，既保证了滚动条不会穿透顶部导航，符合app的体验，也保证了列表流畅滚动，解决了区域滚动卡顿的问题。 list.html就是index.html的子页面，创建代码比较简单，如下：
	 *
	 *     $.init({
	 *		 subpages:[{
	 *		    url:'list.html',
	 *		    id:'list.html',
	 *		    styles:{
	 *			  top:'45px',//eui标题栏默认高度为45px；
	 *			  bottom:'0px'//默认为0px，可不定义；
	 *		    }
	 *		}]
	 *	  });
	 *
	 * ### 关闭页面 ###
	 *
	 * eui框架将窗口关闭功能封装在$.back方法中，具体执行逻辑是：
     *
	 * - 若当前webview为预加载页面，则hide当前webview；
	 * - 否则，close当前webview；
	 *
	 * 在eui框架中，有三种操作会触发页面关闭（执行$.back方法）：
	 *
	 * - 点击包含`.mui-action-back`类的控件
	 * - 在屏幕内，向右快速滑动
	 * - Android手机按下back按键
	 *
	 * <h4>iOS平台原生支持从屏幕边缘右滑关闭</h4>
	 *
	 * iOS平台可通过popGesture参数实现从屏幕边缘右滑关闭webview，参考[5+规范](http://www.html5plus.org/doc/zh_cn/webview.html#plus.webview.WebviewStyle)，若想禁用该功能，可通过setStyle方法设置`popGesture`为none。
	 *
	 * hbuilder中敲`mheader`生成的代码块，会自动生成带有返回导航箭头的标题栏，点击返回箭头可关闭当前页面，原因就是因为该返回箭头包含`.mui-action-back`类，代码如下：
	 *
	 * 		<header class="mui-bar mui-bar-nav">
	 *		 <a class="mui-action-back mui-icon mui-icon-left-nav mui-pull-left"></a>
	 *		 <h1 class="mui-title">标题</h1>
	 *		</header>
	 *
	 * 若希望在顶部导航栏之外的其它区域添加关闭页面的控件，只需要在对应控件上添加`.mui-action-back`类即可，如下为一个关闭按钮示例：
	 *
	 * 		<button type="button" class='mui-btn mui-btn-danger mui-action-back'>关闭</button>
	 *
	 * eui框架封装的页面右滑关闭功能，默认未启用，若要使用右滑关闭功能，需要在`$.init()`;方法中设置`swipeBack`参数，如下：
	 *
	 * 	  $.init({
	 *		swipeBack:true //启用右滑关闭功能
	 *	  });
	 *
	 * eui框架默认会监听Android手机的`back`按键，然后执行页面关闭逻辑； 若不希望eui自动处理`back`按键，可通过如下方式关闭eui的`back`按键监听；
	 *
	 * 	  $.init({
	 *        keyEventBind: {
	 *			 backbutton: false  //关闭back按键监听
	 *		  }
	 *	  });
	 *
	 * 除了如上三种操作外，也可以直接调用`$.back()`方法，执行窗口关闭逻辑；
	 *
	 * `$.back()`仅处理窗口逻辑，若希望在窗口关闭之前再处理一些其它业务逻辑，则可将业务逻辑抽象成一个具体函数，然后注册为$.init方法的`beforeback`参数;beforeback的执行逻辑为：
	 *
	 * - 执行beforeback参数对应的函数若返回false，则不再执行$.back()方法；
	 * - 否则（返回true或无返回值），继续执行$.back()方法；
	 *
	 * 示例：从列表打开详情页面，从详情页面再返回后希望刷新列表界面，此时可注册beforeback参数，然后通过自定义事件通知列表页面刷新数据，示例代码如下：
	 *
	 *     $.init({
	 *		  beforeback: function(){
	 *			//获得列表界面的webview
	 *			var list = plus.webview.getWebviewById('list');
	 *			//触发列表界面的自定义事件（refresh）,从而进行数据刷新
	 *			$.fire(list,'refresh');
	 *			//返回true，继续页面关闭逻辑
	 *			return true;
	 *		  }
	 *	   });
	 *
	 * 注意：beforeback的执行返回必须是同步的（阻塞模式），若使用nativeUI这种异步js（非阻塞模式），则可能会出现意想不到的结果；
	 * 比如：通过`plus.nativeUI.confirm()`弹出确认框，可能用户尚未选择，页面已经返回了（beforeback同步执行完毕，无返回值，
	 * 继续执行`$.back()`方法，nativeUI不会阻塞js进程）：在这种情况下，若要自定义业务逻辑，就需要复写`$.back`方法了；
	 * 如下为一个自定义示例，每次都需要用户确认后，才会关闭当前页面
	 *
	 * 		//备份$.back，$.back已将窗口关闭逻辑封装的比较完善（预加载及父子窗口），因此最好复用$.back
	 *		 var old_back = $.back;
	 *		 $.back = function(){
	 *	  		var btn = ["确定","取消"];
	 *	  		$.confirm('确认关闭当前窗口？','Hello MUI',btn,function(e){
	 *				if(e.index==0){
	 *				//执行mui封装好的窗口关闭逻辑；
	 *				old_back();
	 *			}
	 *	 	  });
	 *		}
	 *
	 * <h3>为何设置了swipeBack: false，在iOS上依然可以右滑关闭？</h3>
	 * iOS平台原生支持从屏幕边缘右滑关闭，这个是通过popGesture参数控制的，参考[5+规范](http://www.html5plus.org/doc/zh_cn/webview.html#plus.webview.WebviewStyle)，若需禁用，可通过setStyle方法设置popGesture为none。
	 *
	 * <h3>能否通过addEventListener增加back按键监听实现自定义关闭逻辑？</h3>
	 * addEventListener只会增加新的执行逻辑，老的监听逻辑($.back)依然会执行，因此，若需实现自定义关闭逻辑，一定要重写`$.back`。
	 *
	 * ### 手势事件 ###
	 *
	 * 在开发移动端的应用时，会用到很多的手势操作，比如滑动、长按等，为了方便开放者快速集成这些手势，eui内置了常用的手势事件，目前支持的手势事件见如下列表：
	 *
	 *  <pre class="">
	 * 分类			参数				描述
	 * ------       ----------------    -----------------------
	 * 点击         tap                  单击屏幕
	 * 				doubletap			 双击屏幕
	 * 长按			longtap				 长按屏幕
	 *				hold				 按住屏幕
	 *				release				 离开屏幕
	 * 滑动			swipeleft			 向左滑动
	 * 				swiperight			 向右滑动
	 * 				swipeup				 向上滑动
	 * 				swipedown			 向下滑动
	 * 拖动			dragstart			 开始拖动
	 * 				drag				 拖动中
	 * 				dragend	             拖动结束
	 * </pre>
	 *
	 *
	 * <h3>手势事件配置</h3>
	 *
	 * 根据使用频率，eui默认会监听部分手势事件，如点击、滑动事件；为了开发出更高性能的moble App，
	 * eui支持用户根据实际业务需求，通过$.init方法中的gestureConfig参数，配置具体需要监听的手势事件。
	 *
	 * 	  $.init({
	 *		   gestureConfig:{
	 *		     tap: true, //默认为true
	 *		     doubletap: true, //默认为false
	 *		     longtap: true, //默认为false
	 *		     swipe: true, //默认为true
	 *		     drag: true, //默认为true
	 *		     hold:false,//默认为false，不监听
	 *		     release:false//默认为false，不监听
	 *		   }
	 *	  });
	 *
	 * 注意:dragstart、drag、dragend共用drag开关，swipeleft、swiperight、swipeup、swipedown共用swipe开关
	 *
	 * <h3>事件监听</h3>
	 *
	 * 单个元素上的事件监听，直接使用addEventListener即可，如下：
	 *
	 * 		elem.addEventListener("swipeleft",function(){
	 *			 console.log("你正在向左滑动");
	 *		});
	 *
	 * 若多个元素执行相同逻辑，则建议使用事件绑定{@link Event#on|on()}。
	 *
	 * <h3>自定义事件</h3>
	 *
	 * 通过自定义事件，用户可以轻松实现多webview间数据传递。
	 *
	 * <span style="color:red;">仅能在5+ App及流应用中使用?</span>
	 *
	 * 因为是多webview之间传值，故无法在手机浏览器、微信中使用；
	 *
	 * <h3>监听自定义事件</h3>
	 *
	 * 添加自定义事件监听操作和标准js事件监听类似，可直接通过window对象添加，如下：
	 *
	 *		window.addEventListener('customEvent',function(event){
	 *		  //通过event.detail可获得传递过来的参数内容
	 *		  ....
	 *		});
	 *
	 *<h3>触发自定义事件</h3>
	 *
	 * 通过{@link Eui#fire|$.fire()}方法可触发目标窗口的自定义事件.
	 *
	 * ### 预加载 ###
	 *
	 * 所谓的预加载技术就是在用户尚未触发页面跳转时，提前创建目标页面，这样当用户跳转时，就可以立即进行页面切换，节省创建新页面的时间，提升app使用体验。eui提供两种方式实现页面预加载。
	 *
	 * 通过$.init方法中的preloadPages参数进行配置.
	 *
	 * 		$.init({
	 *			  preloadPages:[
	 *				{
	 *				  url:prelaod-page-url,
	 *				  id:preload-page-id,
	 *				  styles:{},//窗口参数
	 *				  extras:{},//自定义扩展参数
	 *				  subpages:[{},{}]//预加载页面的子页面
	 *				}
	 *			  ]
	 *			});
     *
	 * 该种方案使用简单、可预加载多个页面，但不会返回预加载每个页面的引用，若要获得对应webview引用，还需要通过`plus.webview.getWebviewById`方式获得；另外，因为$.init是异步执行，执行完$.init方法后立即获得对应webview引用，可能会失败，例如如下代码：
	 *
	 * 	   $.init({
	 *		  preloadPages:[{
	 *			 url:'list.html',
	 *			 id:'list'
	 *		 }]
	 *	   });
	 *	   var list = plus.webview.getWebviewByid('list');//这里可能返回空；
	 *
	 * 也可以通过{@link Eui#preload|$.preload}方法预加载，可立即返回对应webview的引用。
	 *
	 * ### 下拉刷新 ###
	 *
	 * 为实现下拉刷新功能，大多H5框架都是通过DIV模拟下拉回弹动画，在低端android手机上，
	 * DIV动画经常出现卡顿现象（特别是图文列表的情况）； eui通过双webview解决这个DIV的拖动流畅度问题；
	 * 拖动时，拖动的不是div，而是一个完整的webview（子webview），回弹动画使用原生动画；
	 * 在iOS平台，H5的动画已经比较流畅，故依然使用H5方案。
	 * 两个平台实现虽有差异，但eui经过封装，可使用一套代码实现下拉刷新。
	 *
	 * 主页面内容比较简单，只需要创建子页面即可：
	 *
	 * 		$.init({
	 *			subpages:[{
	 *			  url:pullrefresh-subpage-url,//下拉刷新内容页面地址
	 *			  id:pullrefresh-subpage-id,//内容页面标志
	 *			  styles:{
	 *				top:subpage-top-position,//内容页面顶部位置,需根据实际页面布局计算，若使用标准eui导航，顶部默认为48px；
	 *				.....//其它参数定义
	 *			  }
	 *			}]
	 *		  });
	 *
	 * 内容页面需按照如下DOM结构构建：
	 *
	 * 		<!--下拉刷新容器-->
	 *		<div id="refreshContainer" class="mui-content mui-scroll-wrapper">
	 *		  <div class="mui-scroll">
	 *		   <!--数据列表-->
	 *		   <ul class="mui-table-view mui-table-view-chevron">
	 *
	 *		   </ul>
	 *		  </div>
	 *		 </div>
	 *
	 * 其次，通过$.init方法中pullRefresh参数配置下拉刷新各项参数，如下：
	 *
	 * 	   $.init({
	 *		  pullRefresh : {
	 *			container:"#refreshContainer",//下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
	 *			down : {
	 *			  contentdown : "下拉可以刷新",//可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
	 *			  contentover : "释放立即刷新",//可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
	 *			  contentrefresh : "正在刷新...",//可选，正在刷新状态时，下拉刷新控件上显示的标题内容
	 *			  callback :pullfresh-function //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
	 * 			}
	 *		  }
	 *		});
	 *
	 * 最后，根据具体业务编写刷新函数，需要注意的是，加载完新数据后，需要执行`endPulldownToRefresh()`方法；
	 *
	 * 		function pullfresh-function() {
	 *			 //业务逻辑代码，比如通过ajax从服务器获取新数据；
	 *			 ......
	 *			 //注意，加载完新数据后，必须执行如下代码，注意：若为ajax请求，则需将如下代码放置在处理完ajax响应数据之后
	 *			 $('#refreshContainer').pullRefresh().endPulldownToRefresh();
	 *		}
	 *
	 * ### 上拉加载 ###
	 * eui的上拉加载实现比较简单，检测5+ runtime提供的滚动条滚动到底事件（plusscrollbottom），
	 * <br/>显示“正在加载”提示`-->`开始加载业务数据`-->`隐藏"正在加载"提示。
	 * </br>
	 * 使用方式类似下拉刷新，首先、通过`$.init`方法中pullRefresh参数配置上拉加载各项参数，如下：
	 *
	 *	  $.init({
	 *	  	pullRefresh : {
	 *			container:refreshContainer,//待刷新区域标识，querySelector能定位的css选择器均可，比如：id、.class等
	 *			up : {
	 *		  		contentrefresh : "正在加载...",//可选，正在加载状态时，上拉加载控件上显示的标题内容
	 *		  		contentnomore:'没有更多数据了',//可选，请求完毕若没有更多数据时显示的提醒内容；
	 *		  		callback :pullfresh-function //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
	 *			}
	 *	  	}
	 *     });
	 *
	 * 其次，根据具体业务编写加载函数，需要注意的是，加载完新数据后，需要执行`endPullupToRefresh()`方法；
	 *
	 *		 function pullfresh-function() {
	 *		   //业务逻辑代码，比如通过ajax从服务器获取新数据；
	 *		   ......
	 *		   //注意，加载完新数据后，必须执行如下代码，true表示没有更多数据了，两个注意事项：
	 *		   //1、若为ajax请求，则需将如下代码放置在处理完ajax响应数据之后
	 *		   //2、注意this的作用域，若存在匿名函数，需将this复制后使用，参考hello mui中的代码示例；
	 *		   this.endPullupToRefresh(true|false);
	 *	    }
	 *
	 * 注意：
	 *
     * - 因为使用的是滚动到底事件，因此若当前页面内容过少，没有滚动条的话，就不会触发上拉加载
	 * - 多次上拉加载后，若已没有更多数据可加载时，调用`this.endPullupToRefresh(true)`;，之后滚动条滚动到底时，将不再显示“上拉显示更多”的提示语，而显示“没有更多数据了”的提示语；
	 * - 若实际业务中，有重新触发上拉加载的需求（比如当前类别已无更多数据，但切换到另外一个类别后，应支持继续上拉加载），此时调用上拉加载的重置函数即可，如下代码：
	 *
	 *
	 *     //pullup-container为在$.init方法中配置的pullRefresh节点中的container参数；
	 *     $('#pullup-container').pullRefresh().refresh(true);
     *
	 * @alias #init
	 * @memberof Eui
	 * @param {Object} [options]
	 */
	$.init = function(options) {
		isInitialized = true;
		$.options = $.extend(true, $.global, options || {});
		$.ready(function() {
			$.doAction('inits', function(index, init) {
				var isInit = !!(!inits[init.name] || init.repeat);
				if (isInit) {
					init.handle.call($);
					inits[init.name] = true;
				}
			});
		});
		return this;
	};

	// 增加初始化执行流程
	$.addInit = function(init) {
		return $.addAction('inits', init);
	};
	$(function() {
		var classList = document.body.classList;
		var os = [];
		if ($.os.ios) {
			os.push({
				os: 'ios',
				version: $.os.version
			});
			classList.add($.className('ios'));
		} else if ($.os.android) {
			os.push({
				os: 'android',
				version: $.os.version
			});
			classList.add($.className('android'));
		}
		if ($.os.wechat) {
			os.push({
				os: 'wechat',
				version: $.os.wechat.version
			});
			classList.add($.className('wechat'));
		}
		if (os.length) {
			$.each(os, function(index, osObj) {
				var version = '';
				var classArray = [];
				if (osObj.version) {
					$.each(osObj.version.split('.'), function(i, v) {
						version = version + (version ? '-' : '') + v;
						classList.add($.className(osObj.os + '-' + version));
					});
				}
			});
		}
	});
})(Eui);