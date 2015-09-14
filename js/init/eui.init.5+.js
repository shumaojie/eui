/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath init/eui.init.5+.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($) {
	var defaultOptions = {
		swipeBack: false,
		preloadPages: [], //5+ lazyLoad webview
		preloadLimit: 10, //预加载窗口的数量限制(一旦超出，先进先出)
		keyEventBind: {
			backbutton: true,
			menubutton: true
		}
	};

	//默认页面动画
	var defaultShow = {
		autoShow: true,
		duration: $.os.ios ? 200 : 100,
		aniShow: 'slide-in-right'
	};
	//若执行了显示动画初始化操作，则要覆盖默认配置
	if ($.options.show) {
		defaultShow = $.extend(true, defaultShow, $.options.show);
	}

	/**
	 * 获取当前页面{@link http://www.html5plus.org/doc/zh_cn/webview.html#plus.webview.WebviewObject|webview}对象.
	 * 备注：必须在`$.plusReady`中引用.
	 *
	 * @alias #currentWebview
	 * @memberof Eui
	 *  @type {WebviewObject}
	 */
	$.currentWebview = null;

	/**
	 * 判断是否是主页.
	 *
	 * @alias #isHomePage
	 * @memberof Eui
	 * @type {Boolean}
	 */
	$.isHomePage = false;

	$.extend(true, $.global, defaultOptions);
	$.extend(true, $.options, defaultOptions);

	/**
	 * 获取等待动画配置.
	 *
	 * @alias #waitingOptions
	 * @memberof Eui
	 *
	 * @param {Object} options
	 * @param {Boolean} options.autoShow=true 是否自动显示等待
	 * @param {String} options.title='' 等待描述文本
	 * @returns {Object}
	 */
	$.waitingOptions = function(options) {
		return $.extend({
			autoShow: true,
			title: ''
		}, options);
	};

	/**
	 * 获取窗口显示配置，合并默认配置项.
	 *
	 * - `autoShow` : true,
	 * - `duration` : $.os.ios ? 200 : 100,
	 * - `aniShow` : 'slide-in-right'
	 *
	 * @alias #showOptions
	 * @memberof Eui
	 * @param {Object} options 配置项.
	 * @returns {Object}
	 */
	$.showOptions = function(options) {
		return $.extend(defaultShow, options);
	};

	/**
	 * 窗口默认配置.
	 *
	 * @alias #windowOptions
	 * @memberof Eui
	 * @param {Object} options
	 * @returns {Object}
	 */
	$.windowOptions = function(options) {
		return $.extend({
			scalable: false,
			bounce: "" //vertical
		}, options);
	};

	/**
	 * 在app开发中，若要使用{@link http://www.html5plus.org/doc/h5p.html|HTML5+}扩展api，必须等`plusready`事件发生后才能正常使用.
	 *
	 * eui将该事件封装成了$.plusReady()方法，涉及到HTML5+的api，建议都写在`$.plusReady`方法中。如下为打印当前页面URL的示例：
	 *
	 *   	$.plusReady(function(){
	 *		    console.log("当前页面URL："+plus.webview.currentWebview().getURL());
	 *		});
	 *
	 * @alias #plusReady
	 * @memberof Eui
	 * @param {Function} callback 回调函数
	 * @returns {$}
	 */
	$.plusReady = function(callback) {
		if (window.plus) {
			setTimeout(function() { //解决callback与plusready事件的执行时机问题(典型案例:showWaiting,closeWaiting)
				callback();
			}, 0);
		} else {
			document.addEventListener("plusready", function() {
				callback();
			}, false);
		}
		return this;
	};

	/**
	 * 触发目标窗口的自定义事件.
	 *
	 * 示例：
	 * 假设如下场景：从新闻列表页面进入新闻详情页面，新闻详情页面为共用页面，通过传递新闻ID通知详情页面需要显示具体哪个新闻，
	 * 详情页面再动态向服务器请求数据，eui要实现类似需求可通过如下步骤实现：
	 *
	 * - 在列表页面中预加载详情页面（假设为detail.html）
	 * - 列表页面在点击新闻标题时，首先，获得该新闻id，触发详情页面的newsId事件，并将新闻id作为事件参数传递过去；然后再打开详情页面；
	 * - 详情页面监听newsId自定义事件
	 *
	 * 列表页面代码如下：
	 *
	 *		//初始化预加载详情页面
	 *		$.init({
	 *		   preloadPages:[{
	 *			 id:'detail.html',
	 *			 url:'detail.html'
	 *		   }]
	 *		});
     *
	 *	    var detailPage = null;
	 *		 //添加列表项的点击事件
	 *		 $('.mui-content').on('tap', 'a', function(e) {
	 *	        var id = this.getAttribute('id');
	 *	        //获得详情页面
	 *	        if(!detailPage){
	 *		       detailPage = plus.webview.getWebviewById('detail.html');
	 *	        }
	 *	        //触发详情页面的newsId事件
	 *	       $.fire(detailPage,'newsId',{
	 *		     id:id
	 *	       });
	 *	       //打开详情页面
	 *	      $.openWindow({
	 *		    id:'detail.html'
	 *	      });
	 *	   });
	 *
	 * 详情页面代码如下：
	 *
	 * 	  //添加newId自定义事件监听
	 *	  window.addEventListener('newsId',function(event){
	 *	  		//获得事件参数
	 *	  		var id = event.detail.id;
	 *	  		//根据id向服务器请求新闻详情
	 *	  		.....
	 *		});
	 *
	 * @alias #fire
	 * @memberof Eui
	 * @param {WebviewObject} webview 需传值的目标webview
	 * @param {String} eventType 自定义事件名称
	 * @param {JSON} data json格式的数据
	 *
	 *
	 */
	$.fire = function(webview, eventType, data) {
		if (webview) {
			if (data !== '') {
				data = data || {};
				if ($.isPlainObject(data)) {
					data = JSON.stringify(data || {}).replace(/\'/g, "\\u0027").replace(/\\/g, "\\u005c");
				}
			}
			webview.evalJS("typeof Eui!=='undefined'&&$.receive('" + eventType + "','" + data + "')");
		}
	};

	/**
	 * 触发页面指定事件.
	 *
	 * @alias #receive
	 * @memberof Eui
	 * @param {String} eventType 事件类型
	 * @param {Object} data 传递参数
	 */
	$.receive = function(eventType, data) {
		if (eventType) {
			try {
				if (data) {
					data = JSON.parse(data);
				}
			} catch (e) {}
			$.trigger(document, eventType, data);
		}
	};

	var triggerPreload = function(webview) {
		if (!webview.preloaded) {
			$.fire(webview, 'preload');
			var list = webview.children();
			for (var i = 0; i < list.length; i++) {
				$.fire(list[i], 'preload');
			}
			webview.preloaded = true;
		}
	};

	var trigger = function(webview, eventType, timeChecked) {
		if (timeChecked) {
			if (!webview[eventType + 'ed']) {
				$.fire(webview, eventType);
				var list = webview.children();
				for (var i = 0; i < list.length; i++) {
					$.fire(list[i], eventType);
				}
				webview[eventType + 'ed'] = true;
			}
		} else {
			$.fire(webview, eventType);
			var list = webview.children();
			for (var i = 0; i < list.length; i++) {
				$.fire(list[i], eventType);
			}
		}

	};

	/**
	 * 以webview打开新的窗口,单webview只承载单个页面的dom，减少dom层级及页面大小；页面切换使用原生动画，将最耗性能的部分交给原生实现.
	 *
	 * 		$.openWindow({
				url:new-page-url,
				id:new-page-id,
				styles:{
				  top:newpage-top-position,//新页面顶部位置
				  bottom:newage-bottom-position,//新页面底部位置
				  width:newpage-width,//新页面宽度，默认为100%
				  height:newpage-height,//新页面高度，默认为100%
				  ......
				},
				extras:{
				  .....//自定义扩展参数，可以用来处理页面间传值
				},
				createNew:false,//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
				show:{
				  autoShow:true,//页面loaded事件发生后自动显示，默认为true
				  aniShow:animationType,//页面显示动画，默认为”slide-in-right“；
				  duration:animationTime//页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒；
				},
				waiting:{
				  autoShow:true,//自动显示等待框，默认为true
				  title:'正在加载...',//等待对话框上显示的提示内容
				  options:{
					width:waiting-dialog-widht,//等待框背景区域宽度，默认根据内容自动计算合适宽度
					height:waiting-dialog-height,//等待框背景区域高度，默认根据内容自动计算合适高度
					......
				  }
				}
			})
	 *
	 * @alias #openWindow
	 * @memberof Eui
	 * @param {string} url 要打开的页面地址
	 * @param {string} id 指定页面ID
	 * @param {Object} options 可选:参数,等待,窗口,显示配置{params:{},waiting:{},styles:{},show:{}}
	 * @param {Object} [options.styles] 表示窗口参数，参考5+规范中的{@link http://www.dcloud.io/docs/api/zh_cn/webview.shtml#plus.webview.WebviewStyle|WebviewStyle}；
	 * 特别注意，height和width两个属性,即使不设置，也默认按100%计算；
	 * 因此若设置了top值为非"0px"的情况，建议同时设置bottom值，否则5+ runtime根据高度100%计算，
	 * 可能会造成页面真实底部位置超出屏幕范围的情况；left、right同理.
	 *
	 * @param {Object} [options.extras] 新窗口的额外扩展参数，可用来处理页面间传值；例如：
	 *
	 * 		var webview = $.openWindow({url:'info.html',extras:{name:'eui'}});
	 * 		console.log(webview.name);，
	 *
	 * 会输出"eui"字符串；注意：扩展参数仅在打开新窗口时有效，若目标窗口为预加载页面，则通过$.openWindow方法打开时传递的extras参数无效。
	 *
	 * @param {Boolean} [options.createNew=false] 是否重复创建相同id的webview；为优化性能、避免app中重复创建webview，
	 * 默认为false；判断逻辑如下：若createNew为true，则不判断重复，每次都新建webview；若为fasle，
	 * 则先计算当前App中是否已存在同样id的webview，若存在则直接显示；否则新创建并根据show参数执行显示逻辑；该参数可能导致的影响：若业务写在plusReady事件中，而plusReady事件仅首次创建时会触发，则下次再次通过mui.openWindow方法打开同样webview时，
	 * 是不会再次触发plusReady事件的，此时可通过自定义事件触发；案例参考：http://ask.dcloud.net.cn/question/6514;
	 *
	 * @param {Object} [options.show] 表示窗口显示控制。autoShow：目标窗口loaded事件发生后，是否自动显示；
	 * 若目标页面为预加载页面，则该参数无效；aniShow表示页面显示动画，
	 * 比如从右侧划入、从下侧划入等，具体可参考5+规范中的{@link http://www.dcloud.io/docs/api/zh_cn/webview.shtml#plus.webview.AnimationTypeShow|AnimationTypeShow}
	 *
	 * @param {Object} [options.waiting] 表示系统等待框；eui框架在打开新页面时等待框的处理逻辑为：
	 * 显示等待框-->创建目标页面webview-->目标页面loaded事件发生-->关闭等待框；
	 * 因此，只有当新页面为新创建页面（webview）时，会显示等待框，否则若为预加载好的页面，则直接显示目标页面，不会显示等待框。
	 * waiting中的参数：autoShow表示自动显示等待框，默认为true，若为false，则不显示等待框；
	 * 注意：若显示了等待框，但目标页面不自动显示，则需在目标页面中通过如下代码关闭等待框plus.nativeUI.closeWaiting();。
	 * title表示等待框上的提示文字，options表示等待框显示参数，
	 * 比如宽高、背景色、提示文字颜色等，具体可参考5+规范中的{@link http://www.dcloud.io/docs/api/zh_cn/nativeUI.shtml#plus.nativeUI.WaitingOption|WaitingOption}。
	 *
	 * @example <caption>示例1：
	 * Hello eui中，点击首页右上角的图标，会打开关于页面，实现代码如下：</caption>
	 * //tap为mui封装的单击事件，可参考手势事件章节
	 * document.getElementById('info').addEventListener('tap', function() {
	 *   //打开关于页面
	 *   $.openWindow({
	 *	  url: 'examples/info.html',
	 *	  id:'info'
	 *	 });
	 * });
	 *
	 * @example <caption>因没有传入`styles`参数，故默认全屏显示；也没有传入`show`参数，故使用`slide-in-right`动画，新页面从右侧滑入。</br>
	 * </br>示例2：从A页面打开B页面，B页面为一个需要从服务端加载的列表页面，若在B页面loaded事件发生时就将其显示出来，
	 * 因服务器数据尚未加载完毕，列表页面为空，用户体验不好；
	 * 可通过如下方式改善用户体验（最好的用户体验应该是通过预加载的方式）：</br>
	 * </br>第一步，B页面loaded事件发生后，不自动显示；
	 * </caption>
	 *
	 * //A页面中打开B页面，设置show的autoShow为false，则B页面在其loaded事件发生后，不会自动显示；
	 *  $.openWindow({
	 *	  url: 'B.html',
	 *	  show:{
	 *	   autoShow:false
	 *	  }
	 * });
	 *
	 * @example <caption>第二步，在B页面获取列表数据后，再关闭等待框、显示B页面</caption>
	 * //B页面onload从服务器获取列表数据；
	 *	window.onload = function(){
	 *	//从服务器获取数据
	 *	....
	 *	//业务数据获取完毕，并已插入当前页面DOM；
	 *	//注意：若为ajax请求，则需将如下代码放在处理完ajax响应数据之后；
	 *	$.plusReady(function(){
	 *		//关闭等待框
	 *		plus.nativeUI.closeWaiting();
	 *		//显示当前页面
	 *		$.currentWebview.show();
	 *	});
	 * }
	 */
	$.openWindow = function(url, id, options) {

		if (!window.plus) {
			return;
		}
		if (typeof url === 'object') {
			options = url;
			url = options.url;
			id = options.id || url;
		} else {
			if (typeof id === 'object') {
				options = id;
				id = url;
			} else {
				id = id || url;
			}
		}
		options = options || {};
		var params = options.params || {};
		var webview, nShow, nWaiting;
		if ($.webviews[id]) { //已缓存
			var webviewCache = $.webviews[id];
			webview = webviewCache.webview;
			//需要处理用户手动关闭窗口的情况，此时webview应该是空的；
			if (!webview || !webview.getURL()) {
				//再次新建一个webview；
				options = $.extend(options, {
					id: id,
					url: url,
					preload: true
				}, true);
				webview = $.createWindow(options);
			}
			//每次show都需要传递动画参数；
			//预加载的动画参数优先级：openWindow配置>preloadPages配置>eui默认配置；
			nShow = webviewCache.show;
			nShow = options.show ? $.extend(nShow, options.show) : nShow;
			webview.show(nShow.aniShow, nShow.duration, function() {
				triggerPreload(webview);
				trigger(webview, 'pagebeforeshow', false);
			});

			webviewCache.afterShowMethodName && webview.evalJS(webviewCache.afterShowMethodName + '(\'' + JSON.stringify(params) + '\')');
			return webview;
		} else { //新窗口
			if (options.createNew !== true) {
				webview = plus.webview.getWebviewById(id);
				if (webview) {//如果已存在
					nShow = $.showOptions(options.show);
					webview.show(nShow.aniShow, nShow.duration, function() {
						triggerPreload(webview);
						trigger(webview, 'pagebeforeshow', false);
					});
					return webview;
				}
			}
			//显示waiting
			var waitingConfig = $.waitingOptions(options.waiting);
			if (waitingConfig.autoShow) {
				nWaiting = plus.nativeUI.showWaiting(waitingConfig.title, waitingConfig.options);
			}
			//创建页面
			options = $.extend(options, {
				id: id,
				url: url
			});

			webview = $.createWindow(options);
			//显示
			nShow = $.showOptions(options.show);
			if (nShow.autoShow) {
				webview.addEventListener("loaded", function() {
					//关闭等待框
					if (nWaiting) {
						nWaiting.close();
					}
					//显示页面
					webview.show(nShow.aniShow, nShow.duration, function() {
						triggerPreload(webview);
						trigger(webview, 'pagebeforeshow', false);
					});
					webview.showed = true;
					options.afterShowMethodName && webview.evalJS(options.afterShowMethodName + '(\'' + JSON.stringify(params) + '\')');
				}, false);
			}
		}
		return webview;
	};

	/**
	 * 根据配置信息创建一个webview.
	 *
	 * @alias #createWindow
	 * @memberof Eui
	 * @param {Object} options 配置项
	 * @param {Object} isCreate 是否直接创建非预加载窗口
	 * @returns {webview}
	 */
	$.createWindow = function(options, isCreate) {
		if (!window.plus) {
			return;
		}
		var id = options.id || options.url;
		var webview;
		if (options.preload) {
			if ($.webviews[id] && $.webviews[id].webview.getURL()) { //已经cache
				webview = $.webviews[id].webview;
			} else { //新增预加载窗口
				//preload
				//preload
				//判断是否携带createNew参数，默认为false
				if (options.createNew !== true) {
					webview = plus.webview.getWebviewById(id);
				}

				//之前没有，那就新创建
				if (!webview) {
					webview = plus.webview.create(options.url, id, $.windowOptions(options.styles), $.extend({
						preload: true
					}, options.extras));
					if (options.subpages) {
						$.each(options.subpages, function (index, subpage) {
							//TODO 子窗口也可能已经创建，比如公用模板的情况；
							var subWebview = plus.webview.create(subpage.url, subpage.id || subpage.url, $.windowOptions(subpage.styles), $.extend({
								preload: true
							}, subpage.extras));
							webview.append(subWebview);
						});
					}
				}
			}

			//TODO 理论上，子webview也应该计算到预加载队列中，但这样就麻烦了，要退必须退整体，否则可能出现问题；
			$.webviews[id] = {
				webview: webview, //目前仅preload的缓存webview
				preload: true,
				show: $.showOptions(options.show),
				afterShowMethodName: options.afterShowMethodName //就不应该用evalJS。应该是通过事件消息通讯
			};
			//索引该预加载窗口
			var preloads = $.data.preloads;
			var index = preloads.indexOf(id);
			if (~index) { //删除已存在的(变相调整插入位置)
				preloads.splice(index, 1);
			}
			preloads.push(id);
			if (preloads.length > $.options.preloadLimit) {
				//先进先出
				var first = $.data.preloads.shift();
				var webviewCache = $.webviews[first];
				if (webviewCache && webviewCache.webview) {
					//需要将自己打开的所有页面，全部close；
					//关闭该预加载webview	
					$.closeAll(webviewCache.webview);
				}
				//删除缓存
				delete $.webviews[first];
			}
		} else {
			if (isCreate !== false) { //直接创建非预加载窗口
				webview = plus.webview.create(options.url, id, $.windowOptions(options.styles), options.extras);
				if (options.subpages) {
					$.each(options.subpages, function(index, subpage) {
						var subWebview = plus.webview.create(subpage.url, subpage.id || subpage.url, $.windowOptions(subpage.styles), subpage.extras);
						webview.append(subWebview);
					});
				}
			}
		}
		return webview;
	};

	/**
	 * 预加载webview。
	 *
	 * 		var page = $.preload({
	 *			url:new-page-url,
	 *			id:new-page-id,//默认使用当前页面的url作为id
	 *			styles:{},//窗口参数
	 *			extras:{}//自定义扩展参数
	 *		});
	 *
	 * 备注：通过该方法预加载，可立即返回对应webview的引用，但一次仅能预加载一个页面；
	 * 若需加载多个webview，则需多次调用`$.preload()`方法.
	 *
	 * @alias #preload
	 * @memberof Eui
	 * @param {Object} options 配置项
	 * @param {Object} [options.id] 默认使用当前页面的url作为id
	 * @param {Object} options.url 路径地址
	 * @param {Object} [options.styles] 窗口样式,参考5+规范中的{@link http://www.dcloud.io/docs/api/zh_cn/webview.shtml#plus.webview.WebviewStyle|WebviewStyle}
	 * @param {Object} [options.extras] 自定义扩展参数
	 * @returns {WebviewObject} 更多方法可查看{@link http://www.dcloud.io/docs/api/zh_cn/webview.shtml#plus.webview.WebviewObject|WebviewObject}
	 */
	$.preload = function(options) {
		//调用预加载函数，不管是否传递preload参数，强制变为true
		if (!options.preload) {
			options.preload = true;
		}
		return $.createWindow(options);
	};

	/**
	 * 关闭当前webview打开的所有webview；
	 *
	 * @alias #closeOpened
	 * @memberof Eui
	 * @param {WebviewObject} webview
	 */
	$.closeOpened = function(webview) {
		var opened = webview.opened();
		if (opened) {
			for (var i = 0, len = opened.length; i < len; i++) {
				var openedWebview = opened[i];
				var open_open = openedWebview.opened();
				if (open_open && open_open.length > 0) {
					$.closeOpened(openedWebview);
				} else {
					//如果直接孩子节点，就不用关闭了，因为父关闭的时候，会自动关闭子；
					if (openedWebview.parent() !== webview) {
						openedWebview.close('none');
					}
				}
			}
		}
	};

	/**
	 * 关闭当前webview打开所有webview，并伴随动画.
	 *
	 * @alias #closeAll
	 * @memberof Eui
	 * @param {WebviewObject} webview
	 * @param {Boolean} aniShow 是否动画
	 */
	$.closeAll = function(webview, aniShow) {
		$.closeOpened(webview);
		if (aniShow) {
			webview.close(aniShow);
		} else {
			webview.close();
		}
	};

	/**
	 * 批量创建webview.
	 *
	 * @alias #createWindows
	 * @memberof Eui
	 * @param {Array} options
	 */
	$.createWindows = function(options) {
		$.each(options, function(index, option) {
			//初始化预加载窗口(创建)和非预加载窗口(仅配置，不创建)
			$.createWindow(option, false);
		});
	};

	/**
	 * 创建当前页面的子webview.
	 *
	 * @alias #appendWebview
	 * @memberof Eui
	 * @param {Object} options
	 * @returns {WebviewObject}
	 */
	$.appendWebview = function(options) {
		if (!window.plus) {
			return;
		}
		var id = options.id || options.url;
		var webview;
		if (!$.webviews[id]) { //保证执行一遍
			//TODO 这里也有隐患，比如某个webview不是作为subpage创建的，而是作为target webview的话；
			webview = plus.webview.create(options.url, id, options.styles, options.extras);
			//之前的实现方案：子窗口loaded之后再append到父窗口中；
			//问题：部分子窗口loaded事件发生较晚，此时执行父窗口的children方法会返回空，导致父子通讯失败；
			//     比如父页面执行完preload事件后，需触发子页面的preload事件，此时未append的话，就无法触发；
			//修改方式：不再监控loaded事件，直接append
			//by chb@20150521
			// webview.addEventListener('loaded', function() {
			plus.webview.currentWebview().append(webview);
			// });
			$.webviews[id] = options;
		}
		return webview;
	};

	//全局webviews
	$.webviews = {};
	//预加载窗口索引
	$.data.preloads = [];
	//$.currentWebview
	$.plusReady(function() {
		$.currentWebview = plus.webview.currentWebview();
	});
	$.addInit({
		name: '5+',
		index: 100,
		handle: function() {
			var options = $.options;
			var subpages = options.subpages || [];
			if ($.os.plus) {
				$.plusReady(function() {
					//TODO  这里需要判断一下，最好等子窗口加载完毕后，再调用主窗口的show方法；
					//或者：在openwindow方法中，监听实现；
					$.each(subpages, function(index, subpage) {
						$.appendWebview(subpage);
					});
					//判断是否首页
					if (plus.webview.currentWebview() === plus.webview.getWebviewById(plus.runtime.appid)) {
						$.isHomePage = true;
						//首页需要自己激活预加载；
						//timeout因为子页面loaded之后才append的，防止子页面尚未append、从而导致其preload未触发的问题；
						setTimeout(function() {
							triggerPreload(plus.webview.currentWebview());
						}, 300);
					}
					//设置ios顶部状态栏颜色；
					if ($.os.ios && $.options.statusBarBackground) {
						plus.navigator.setStatusBarBackground($.options.statusBarBackground);
					}
					if ($.os.android && parseFloat($.os.version) < 4.4) {
						//解决Android平台4.4版本以下，resume后，父窗体标题延迟渲染的问题；
						if (plus.webview.currentWebview().parent() == null) {
							document.addEventListener("resume", function() {
								var body = document.body;
								body.style.display = 'none';
								setTimeout(function() {
									body.style.display = '';
								}, 10);
							});
						}
					}
				});
			} else {
				if (subpages.length > 0) {
					var err = document.createElement('div');
					err.className = 'mui-error';
					//文字描述
					var span = document.createElement('span');
					span.innerHTML = '在该浏览器下，不支持创建子页面，具体参考';
					err.appendChild(span);
					var a = document.createElement('a');
					a.innerHTML = '"EUI框架适用场景"';
					a.href = 'http://ask.dcloud.net.cn/article/113';
					err.appendChild(a);
					document.body.appendChild(err);
					console.log('在该浏览器下，不支持创建子页面');
				}

			}

		}
	});
	window.addEventListener('preload', function() {
		//处理预加载部分
		var webviews = $.options.preloadPages || [];
		$.plusReady(function() {
			$.each(webviews, function(index, webview) {
				$.createWindow($.extend(webview, {
					preload: true
				}));
			});
		});
	});
})(Eui);

