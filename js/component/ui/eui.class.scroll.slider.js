/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/eui.class.scroll.sliders.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * @desc 轮播组件是eui提供的一个核心组件，在该核心组件基础上，衍生出了图片轮播、可拖动式图文表格、可拖动式选项卡、
 * 左右滑动9宫格等组件，这些组件有较多共同点。首先，Dom构造基本相同，如下：
 *
 *	   <div class="mui-slider">
 *		 <div class="mui-slider-group">
 *		   <!--第一个内容区容器-->
 *		  <div class="mui-slider-item">
 *		   <!-- 具体内容 -->
 *		  </div>
 *		   <!--第二个内容区-->
 *		  <div class="mui-slider-item">
 *		   <!-- 具体内容 -->
 *		  </div>
 *		 </div>
 *		</div>
 *
 * 当拖动切换显示内容时，会触发slide事件，通过该事件的`detail.slideNumber`参数可以获得当前显示项的索引（第一项索引为0，第二项为1，以此类推），利用该事件，可在显示内容切换时，动态处理一些业务逻辑。
 *
 * 如下为一个可拖动式选项卡示例，为提高页面加载速度，页面加载时，仅显示第一个选项卡的内容，第二、第三选项卡内容为空。
 *
 * 当切换到第二、第三个选项卡时，再动态获取相应内容进行显示：
 *
 *	  var item2Show = false,item3Show = false;//子选项卡是否显示标志
      document.querySelector('.mui-slider').addEventListener('slide', function(event) {
		  if (event.detail.slideNumber === 1&&!item2Show) {
			//切换到第二个选项卡
			//根据具体业务，动态获得第二个选项卡内容；
			var content = ....
			//显示内容
			document.getElementById("item2").innerHTML = content;
			//改变标志位，下次直接显示
			item2Show = true;
		  } else if (event.detail.slideNumber === 2&&!item3Show) {
			//切换到第三个选项卡
			//根据具体业务，动态获得第三个选项卡内容；
			var content = ....
			//显示内容
			document.getElementById("item3").innerHTML = content;
			//改变标志位，下次直接显示
			item3Show = true;
		  }
		});
 *
 * 图片轮播、可拖动式图文表格等均可按照同样方式监听内容变化，比如我们可以在图片轮播界面显示当前正在看的是第几张图片：
 *
 * 	  document.querySelector('.mui-slider').addEventListener('slide', function(event) {
	        //注意slideNumber是从0开始的；
	        document.getElementById("info").innerText = "你正在看第"+(event.detail.slideNumber+1)+"张图片";
		  });
 *
 * @class Slider
 * @extends Scroll
 * @param {Object} options
 * @param {Number} [options.fingers=1]
 * @param {Number} [options.interval=0] 设置为0，则不定时轮播
 * @param {Boolean} [options.scrollY=false]
 * @param {Boolean} [options.scrollX=true]
 * @param {Boolean} [options.indicators=false]
 * @param {Number} [options.bounceTime=200]
 * @param {Boolean} [options.startX=false]
 * @param {String} [options.snap='mui-slider-item']
 */
(function($, window) {
	var CLASS_SLIDER = $.className('slider');
	var CLASS_SLIDER_GROUP = $.className('slider-group');
	var CLASS_SLIDER_LOOP = $.className('slider-loop');
	var CLASS_SLIDER_INDICATOR = $.className('slider-indicator');
	var CLASS_ACTION_PREVIOUS = $.className('action-previous');
	var CLASS_ACTION_NEXT = $.className('action-next');
	var CLASS_SLIDER_ITEM = $.className('slider-item');

	var CLASS_ACTIVE = $.className('active');

	var SELECTOR_SLIDER_ITEM = '.' + CLASS_SLIDER_ITEM;
	var SELECTOR_SLIDER_INDICATOR = '.' + CLASS_SLIDER_INDICATOR;
	var SELECTOR_SLIDER_PROGRESS_BAR = $.classSelector('.slider-progress-bar');

	var Slider = $.Slider = $.Scroll.extend({
		init: function(element, options) {
			this._super(element, $.extend(true, {
				fingers: 1,
				interval: 0, //设置为0，则不定时轮播
				scrollY: false,
				scrollX: true,
				indicators: false,
				bounceTime: 200,
				startX: false,
				snap: SELECTOR_SLIDER_ITEM
			}, options));
			if (this.options.startX) {
				//				$.trigger(this.wrapper, 'scrollend', this);
			}
		},
		_init: function() {
			var groups = this.wrapper.querySelectorAll('.' + CLASS_SLIDER_GROUP);
			for (var i = 0, len = groups.length; i < len; i++) {
				if (groups[i].parentNode === this.wrapper) {
					this.scroller = groups[i];
					break;
				}
			}
			if (this.scroller) {
				this.scrollerStyle = this.scroller.style;
				this.progressBar = this.wrapper.querySelector(SELECTOR_SLIDER_PROGRESS_BAR);
				if (this.progressBar) {
					this.progressBarWidth = this.progressBar.offsetWidth;
					this.progressBarStyle = this.progressBar.style;
				}
				//忘记这个代码是干什么的了？
				//				this.x = this._getScroll();
				//				if (this.options.startX === false) {
				//					this.options.startX = this.x;
				//				}
				//根据active修正startX

				this._super();
				this._initTimer();
			}
		},
		_triggerSlide: function() {
			var self = this;
			self.isInTransition = false;
			var page = self.currentPage;
			self.slideNumber = self._fixedSlideNumber();
			if (self.loop) {
				if (self.slideNumber === 0) {
					self.setTranslate(self.pages[1][0].x, 0);
				} else if (self.slideNumber === self.itemLength - 3) {
					self.setTranslate(self.pages[self.itemLength - 2][0].x, 0);
				}
			}
			if (self.lastSlideNumber != self.slideNumber) {
				self.lastSlideNumber = self.slideNumber;
				self.lastPage = self.currentPage;
				$.trigger(self.wrapper, 'slide', {
					slideNumber: self.slideNumber
				});
			}
			self._initTimer();
		},
		_handleSlide: function(e) {
			var self = this;
			if (e.target !== self.wrapper) {
				return;
			}
			var detail = e.detail;
			detail.slideNumber = detail.slideNumber || 0;
			var items = self.scroller.querySelectorAll(SELECTOR_SLIDER_ITEM);
			var _slideNumber = detail.slideNumber;
			if (self.loop) {
				_slideNumber += 1;
			}
			if (!self.wrapper.classList.contains($.className('segmented-control'))) {
				for (var i = 0, len = items.length; i < len; i++) {
					var item = items[i];
					if (item.parentNode === self.scroller) {
						if (i === _slideNumber) {
							item.classList.add(CLASS_ACTIVE);
						} else {
							item.classList.remove(CLASS_ACTIVE);
						}
					}
				}
			}
			var indicatorWrap = self.wrapper.querySelector($.classSelector('.slider-indicator'));
			if (indicatorWrap) {
				if (indicatorWrap.getAttribute('data-scroll')) { //scroll
					$(indicatorWrap).scroll().gotoPage(detail.slideNumber);
				}
				var indicators = indicatorWrap.querySelectorAll($.classSelector('.indicator'));
				if (indicators.length > 0) { //图片轮播
					for (var i = 0, len = indicators.length; i < len; i++) {
						indicators[i].classList[i === detail.slideNumber ? 'add' : 'remove'](CLASS_ACTIVE);
					}
				} else {
					var number = indicatorWrap.querySelector($.classSelector('.number span'));
					if (number) { //图文表格
						number.innerText = (detail.slideNumber + 1);
					} else { //segmented controls
						var controlItems = self.wrapper.querySelectorAll($.classSelector('.control-item'));
						for (var i = 0, len = controlItems.length; i < len; i++) {
							controlItems[i].classList[i === detail.slideNumber ? 'add' : 'remove'](CLASS_ACTIVE);
						}
					}
				}
			}
			e.stopPropagation();
		},
		_handleTabShow: function(e) {
			var self = this;
			self.gotoItem((e.detail.tabNumber || 0), self.options.bounceTime);
		},
		_handleIndicatorTap: function(event) {
			var self = this;
			var target = event.target;
			if (target.classList.contains(CLASS_ACTION_PREVIOUS) || target.classList.contains(CLASS_ACTION_NEXT)) {
				self[target.classList.contains(CLASS_ACTION_PREVIOUS) ? 'prevItem' : 'nextItem']();
				event.stopPropagation();
			}
		},
		_initEvent: function(detach) {
			var self = this;
			self._super(detach);
			var action = detach ? 'removeEventListener' : 'addEventListener';
			self.wrapper[action]('swiperight', $.stopPropagation);
			self.wrapper[action]('scrollend', self._triggerSlide.bind(this));

			self.wrapper[action]('slide', self._handleSlide.bind(this));

			self.wrapper[action]($.eventName('shown', 'tab'), self._handleTabShow.bind(this));
			//indicator
			var indicator = self.wrapper.querySelector(SELECTOR_SLIDER_INDICATOR);
			if (indicator) {
				indicator[action]('tap', self._handleIndicatorTap.bind(this));
			}
		},
		_drag: function(e) {
			this._super(e);
			var direction = e.detail.direction;
			if (direction === 'left' || direction === 'right') {
				//拖拽期间取消定时
				var slidershowTimer = this.wrapper.getAttribute('data-slidershowTimer');
				slidershowTimer && window.clearTimeout(slidershowTimer);

				e.stopPropagation();
			}
		},
		_initTimer: function() {
			var self = this;
			var slider = self.wrapper;
			var interval = self.options.interval;
			var slidershowTimer = slider.getAttribute('data-slidershowTimer');
			slidershowTimer && window.clearTimeout(slidershowTimer);
			if (interval) {
				slidershowTimer = window.setTimeout(function() {
					if (!slider) {
						return;
					}
					//仅slider显示状态进行自动轮播
					if (!!(slider.offsetWidth || slider.offsetHeight)) {
						self.nextItem(true);
						//下一个
					}
					self._initTimer();
				}, interval);
				slider.setAttribute('data-slidershowTimer', slidershowTimer);
			}
		},

		_fixedSlideNumber: function(page) {
			page = page || this.currentPage;
			var slideNumber = page.pageX;
			if (this.loop) {
				if (page.pageX === 0) {
					slideNumber = this.itemLength - 3;
				} else if (page.pageX === (this.itemLength - 1)) {
					slideNumber = 0;
				} else {
					slideNumber = page.pageX - 1;
				}
			}
			return slideNumber;
		},
		_reLayout: function() {
			this.hasHorizontalScroll = true;
			this.loop = this.scroller.classList.contains(CLASS_SLIDER_LOOP);
			this._super();
		},
		_getScroll: function() {
			var result = $.parseTranslateMatrix($.getStyles(this.scroller, 'webkitTransform'));
			return result ? result.x : 0;
		},
		_transitionEnd: function(e) {
			if (e.target !== this.scroller || !this.isInTransition) {
				return;
			}
			this._transitionTime();
			this.isInTransition = false;
			$.trigger(this.wrapper, 'scrollend', this);
		},
		_flick: function(e) {
			if (!this.moved) { //无moved
				return;
			}
			var detail = e.detail;
			var direction = detail.direction;
			this._clearRequestAnimationFrame();
			this.isInTransition = true;
			//			if (direction === 'up' || direction === 'down') {
			//				this.resetPosition(this.options.bounceTime);
			//				return;
			//			}
			if (e.type === 'flick') {
				if (detail.deltaTime < 200) { //flick，太容易触发，额外校验一下deltaTime
					this.x = this._getPage((this.slideNumber + (direction === 'right' ? -1 : 1)), true).x;
				}
				this.resetPosition(this.options.bounceTime);
			} else if (e.type === 'dragend' && !detail.flick) {
				this.resetPosition(this.options.bounceTime);
			}
			e.stopPropagation();
		},
		_initSnap: function() {
			this.scrollerWidth = this.itemLength * this.scrollerWidth;
			this.maxScrollX = Math.min(this.wrapperWidth - this.scrollerWidth, 0);
			this._super();
			if (!this.currentPage.x) {
				//当slider处于隐藏状态时，导致snap计算是错误的，临时先这么判断一下，后续要考虑解决所有scroll在隐藏状态下初始化属性不正确的问题
				var currentPage = this.pages[this.loop ? 1 : 0];
				currentPage = currentPage || this.pages[0];
				if (!currentPage) {
					return;
				}
				this.currentPage = currentPage[0];
				this.slideNumber = 0;
				this.lastSlideNumber = typeof this.lastSlideNumber === 'undefined' ? 0 : this.lastSlideNumber;
			} else {
				this.slideNumber = this._fixedSlideNumber();
				this.lastSlideNumber = typeof this.lastSlideNumber === 'undefined' ? this.slideNumber : this.lastSlideNumber;
			}
			this.options.startX = this.currentPage.x || 0;
		},
		_getSnapX: function(offsetLeft) {
			return Math.max(-offsetLeft, this.maxScrollX);
		},
		_getPage: function(slideNumber, isFlick) {
			if (this.loop) {
				if (slideNumber > (this.itemLength - (isFlick ? 2 : 3))) {
					slideNumber = 1;
					time = 0;
				} else if (slideNumber < (isFlick ? -1 : 0)) {
					slideNumber = this.itemLength - 2;
					time = 0;
				} else {
					slideNumber += 1;
				}
			} else {
				if (!isFlick) {
					if (slideNumber > (this.itemLength - 1)) {
						slideNumber = 0;
						time = 0;
					} else if (slideNumber < 0) {
						slideNumber = this.itemLength - 1;
						time = 0;
					}
				}
				slideNumber = Math.min(Math.max(0, slideNumber), this.itemLength - 1);
			}
			return this.pages[slideNumber][0];
		},
		_gotoItem: function(slideNumber, time) {
			this.currentPage = this._getPage(slideNumber, true); //此处传true。可保证程序切换时，动画与人手操作一致(第一张，最后一张的切换动画)
			this.scrollTo(this.currentPage.x, 0, time, this.options.bounceEasing);
			if (time === 0) {
				$.trigger(this.wrapper, 'scrollend', this);
			}
		},
		setTranslate: function(x, y) {
			this._super(x, y);
			var progressBar = this.progressBar;
			if (progressBar) {
				this.progressBarStyle.webkitTransform = this._getTranslateStr((-x * (this.progressBarWidth / this.wrapperWidth)), 0);
			}
		},
		resetPosition: function(time) {
			time = time || 0;
			if (this.x > 0) {
				this.x = 0;
			} else if (this.x < this.maxScrollX) {
				this.x = this.maxScrollX;
			}
			this.currentPage = this._nearestSnap(this.x);
			this.scrollTo(this.currentPage.x, 0, time);
			return true;
		},

		/**
		 * 跳转到指定项.
		 *
		 * @memberof Slider
		 * @param {Number} slideNumber 滑块索引，从`0`开始
		 * @param {Number} [time=200] 默认值与`bounceTime`相等
		 */
		gotoItem: function(slideNumber, time) {
			this._gotoItem(slideNumber, typeof time === 'undefined' ? this.options.bounceTime : time);
		},

		/**
		 * 跳转到下一个选项.
		 * @memberof Slider
		 */
		nextItem: function() {
			this._gotoItem(this.slideNumber + 1, this.options.bounceTime);
		},

		/**
		 * 跳转到上个选项.
		 * @memberof Slider
		 */
		prevItem: function() {
			this._gotoItem(this.slideNumber - 1, this.options.bounceTime);
		},

		/**
		 * 获取当前选项的索引.
		 * @memberof Slider
		 */
		getSlideNumber: function() {
			return this.slideNumber || 0;
		},

		/**
		 * 重新初始化组件.
		 * @memberof Slider
		 * @param {Object} [options] 具体配置项查看初始化参数.
		 */
		refresh: function(options) {
			if (options) {
				$.extend(this.options, options);
				this._super();
				this.nextItem();
			} else {
				this._super();
			}
		},

		/**
		 * 销毁组件.
		 * @memberof Slider
		 */
		destory: function() {
			this._initEvent(true); //detach
			delete $.data[this.wrapper.getAttribute('data-slider')];
			this.wrapper.setAttribute('data-slider', '');
		}
	});

	/**
	 *
	 * 图片轮播继承自slide插件，因此其DOM结构、事件均和slide插件相同；
	 *
	 * ### DOM结构 ###
	 *
	 * 默认不支持循环播放，DOM结构如下：
	 *
	 *	  <div class="mui-slider">
	 *		<div class="mui-slider-group">
	 *		 <div class="mui-slider-item"><a href="#"><img src="1.jpg" /></a></div>
	 *		 <div class="mui-slider-item"><a href="#"><img src="2.jpg" /></a></div>
	 *		 <div class="mui-slider-item"><a href="#"><img src="3.jpg" /></a></div>
	 *		 <div class="mui-slider-item"><a href="#"><img src="4.jpg" /></a></div>
	 *		</div>
	 *	  </div>
	 *
	 * 假设当前图片轮播中有1、2、3、4四张图片，从第1张图片起，依次向左滑动切换图片，当切换到第4张图片时，继续向左滑动，接下来会有两种效果：
	 *
	 * - `支持循环` : 左滑，直接切换到第1张图片；
	 * - `不支持循环` : 左滑，无反应，继续显示第4张图片，用户若要显示第1张图片，必须连续向右滑动切换到第1张图片；
	 *
	 * 当显示第1张图片时，继续右滑是否显示第4张图片，是同样问题；这个问题的实现需要通过`.mui-slider-loop`类及DOM节点来控制；
	 *
	 * 若要支持循环，则需要在`.mui-slider-group`节点上增加`.mui-slider-loop`类，同时需要重复增加2张图片，图片顺序变为：4、1、2、3、4、1，代码示例如下：
	 *
	 * 	   <div class="mui-slider">
	 *		 <div class="mui-slider-group mui-slider-loop">
	 *		  <!--支持循环，需要重复图片节点-->
	 *		  <div class="mui-slider-item mui-slider-item-duplicate"><a href="#"><img src="4.jpg" /></a></div>
	 *		  <div class="mui-slider-item"><a href="#"><img src="1.jpg" /></a></div>
	 *		  <div class="mui-slider-item"><a href="#"><img src="2.jpg" /></a></div>
	 *		  <div class="mui-slider-item"><a href="#"><img src="3.jpg" /></a></div>
	 *		  <div class="mui-slider-item"><a href="#"><img src="4.jpg" /></a></div>
	 *		  <!--支持循环，需要重复图片节点-->
	 *		 <div class="mui-slider-item mui-slider-item-duplicate"><a href="#"><img src="1.jpg" /></a></div>
	 *		 </div>
	 *	   </div>
	 *
	 * ### JS 方法 ###
	 *
	 * eui框架内置了图片轮播插件，通过该插件封装的JS API，用户可以设定是否自动轮播及轮播周期，如下为代码示例：
	 *
	 * 	  //获得slider插件对象
	 *	  var gallery = $('.mui-slider');
	 *	  gallery.slider({
	 *	  	interval:5000//自动轮播周期，若为0则不自动播放，默认为0；
	 *	  });
	 *
	 * 因此若希望图片轮播不要自动播放，而是用户手动滑动才切换，只需要通过如上方法，将`interval`参数设为0即可。
	 *
	 * 若要跳转到第x张图片，则可以使用图片轮播插件的`gotoItem`方法，例如：
	 *
	 *     //获得slider插件对象
	 *	   var gallery = $('.mui-slider');
	 *	   gallery.slider().gotoItem(index);//跳转到第index张图片，index从0开始；
	 *
	 * 注意：eui框架会默认初始化当前页面的图片轮播组件；若轮播组件内容为js动态生成时（比如通过ajax动态获取的营销信息），
	 * 则需要在动态DOM生成后，手动调用图片轮播的初始化方法；代码如下：
	 *
	 * 	   //获得slider插件对象
	 *     var gallery = $('.mui-slider');
	 *	   gallery.slider({
	 *	     interval:5000//自动轮播周期，若为0则不自动播放，默认为0；
	 *	   });
	 *
	 * @alias #slider
	 * @memberof $.fn
	 * @param {Object} options
	 * @param {Number} [options.fingers=1]
	 * @param {Number} [options.interval=0] 设置为0，则不定时轮播
	 * @param {Boolean} [options.scrollY=false]
	 * @param {Boolean} [options.scrollX=true]
	 * @param {Boolean} [options.indicators=false]
	 * @param {Number} [options.bounceTime=200]
	 * @param {Boolean} [options.startX=false]
	 * @param {String} [options.snap='mui-slider-item']
	 *
	 * @returns {Slider}
	 */
	$.fn.slider = function(options) {
		var slider = null;
		this.each(function() {
			var sliderElement = this;
			if (!this.classList.contains(CLASS_SLIDER)) {
				sliderElement = this.querySelector('.' + CLASS_SLIDER);
			}
			if (sliderElement && sliderElement.querySelector(SELECTOR_SLIDER_ITEM)) {
				var id = sliderElement.getAttribute('data-slider');
				if (!id) {
					id = ++$.uuid;
					$.data[id] = slider = new Slider(sliderElement, options);
					sliderElement.setAttribute('data-slider', id);
				} else {
					slider = $.data[id];
					if (slider && options) {
						slider.refresh(options);
					}
				}
			}
		});
		return slider;
	};

	$.ready(function() {
		//		setTimeout(function() {
		$($.classSelector('.slider')).slider();
		$($.classSelector('.scroll-wrapper.slider-indicator.segmented-control')).scroll({
			scrollY: false,
			scrollX: true,
			indicators: false,
			snap: $.classSelector('.control-item')
		});
		//		}, 500); //临时处理slider宽度计算不正确的问题(初步确认是scrollbar导致的)

	});
})(Eui, window);