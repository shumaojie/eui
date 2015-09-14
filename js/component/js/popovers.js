/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/js/popovers.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, document, name) {

	var CLASS_POPOVER = $.className('popover');
	var CLASS_POPOVER_ARROW = $.className('popover-arrow');
	var CLASS_ACTION_POPOVER = $.className('popover-action');
	var CLASS_BACKDROP = $.className('backdrop');
	var CLASS_BAR_POPOVER = $.className('bar-popover');
	var CLASS_BAR_BACKDROP = $.className('bar-backdrop');
	var CLASS_ACTION_BACKDROP = $.className('backdrop-action');
	var CLASS_ACTIVE = $.className('active');
	var CLASS_BOTTOM = $.className('bottom');

	var handle = function(event, target) {
		if (target.tagName === 'A' && target.hash) {
			$.targets._popover = document.getElementById(target.hash.replace('#', ''));
			if ($.targets._popover && $.targets._popover.classList.contains(CLASS_POPOVER)) {
				return target;
			} else {
				$.targets._popover = null;
			}
		}
		return false;
	};

	$.registerTarget({
		name: name,
		index: 60,
		handle: handle,
		target: false,
		isReset: false,
		isContinue: true
	});

	var fixedPopoverScroll = function(isPopoverScroll) {
		//		if (isPopoverScroll) {
		//			document.body.setAttribute('style', 'overflow:hidden;');
		//		} else {
		//			document.body.setAttribute('style', '');
		//		}
	};
	var onPopoverShown = function(e) {
		this.removeEventListener('webkitTransitionEnd', onPopoverShown);
		this.addEventListener('touchmove', $.preventDefault);
		$.trigger(this, 'shown', this);
	}
	var onPopoverHidden = function(e) {
		setStyle(this,'none');
		this.removeEventListener('webkitTransitionEnd', onPopoverHidden);
		this.removeEventListener('touchmove', $.preventDefault);
		fixedPopoverScroll(false);
		$.trigger(this, 'hidden', this);
	};

	var backdrop = (function() {
		var element = document.createElement('div');
		element.classList.add(CLASS_BACKDROP);
		element.addEventListener('touchmove', $.preventDefault);
		element.addEventListener('tap', function(e) {
			var popover = $.targets._popover;
			if (popover) {
				popover.addEventListener('webkitTransitionEnd', onPopoverHidden);
				popover.classList.remove(CLASS_ACTIVE);
				removeBackdrop(popover);
				document.body.setAttribute('style', ''); //webkitTransitionEnd有时候不触发？
			}
		});

		return element;
	}());
	var removeBackdrop = function(popover) {
		backdrop.setAttribute('style', 'opacity:0');
		$.targets.popover = $.targets._popover = null; //reset
		setTimeout(function() {
			if (!popover.classList.contains(CLASS_ACTIVE) && backdrop.parentNode && backdrop.parentNode === document.body) {
				document.body.removeChild(backdrop);
			}
		}, 350);
	};
	window.addEventListener('tap', function(e) {
		if (!$.targets.popover) {
			return;
		}
		var toggle = false;
		var target = e.target;
		for (; target && target !== document; target = target.parentNode) {
			if (target === $.targets.popover) {
				toggle = true;
			}
		}
		if (toggle) {
			e.detail.gesture.preventDefault(); //fixed hashchange
			togglePopover($.targets._popover, $.targets.popover);
		}

	});

	var togglePopover = function(popover, anchor) {
		//remove一遍，以免来回快速切换，导致webkitTransitionEnd不触发，无法remove
		popover.removeEventListener('webkitTransitionEnd', onPopoverShown);
		popover.removeEventListener('webkitTransitionEnd', onPopoverHidden);
		backdrop.classList.remove(CLASS_BAR_BACKDROP);
		backdrop.classList.remove(CLASS_ACTION_BACKDROP);
		var _popover = document.querySelector($.classSelector('.popover.active'));
		if (_popover) {
			//			_popover.setAttribute('style', '');
			_popover.addEventListener('webkitTransitionEnd', onPopoverHidden);
			_popover.classList.remove(CLASS_ACTIVE);
			//			_popover.removeEventListener('webkitTransitionEnd', onPopoverHidden);
			//			fixedPopoverScroll(false);
			//同一个弹出则直接返回，解决同一个popover的toggle
			if (popover === _popover) {
				removeBackdrop(_popover);
				return;
			}
		}
		var isActionSheet = false;
		if (popover.classList.contains(CLASS_BAR_POPOVER) || popover.classList.contains(CLASS_ACTION_POPOVER)) { //navBar
			if (popover.classList.contains(CLASS_ACTION_POPOVER)) { //action sheet popover
				isActionSheet = true;
				backdrop.classList.add(CLASS_ACTION_BACKDROP);
			} else { //bar popover
				backdrop.classList.add(CLASS_BAR_BACKDROP);
				//				if (anchor) {
				//					if (anchor.parentNode) {
				//						var offsetWidth = anchor.offsetWidth;
				//						var offsetLeft = anchor.offsetLeft;
				//						var innerWidth = window.innerWidth;
				//						popover.style.left = (Math.min(Math.max(offsetLeft, defaultPadding), innerWidth - offsetWidth - defaultPadding)) + "px";
				//					} else {
				//						//TODO anchor is position:{left,top,bottom,right}
				//					}
				//				}
			}
		}
		setStyle(popover, 'block'); //actionsheet transform
		popover.offsetHeight;
		popover.classList.add(CLASS_ACTIVE);
		backdrop.setAttribute('style', '');
		document.body.appendChild(backdrop);
		fixedPopoverScroll(true);
		calPosition(popover, anchor, isActionSheet); //position
		backdrop.classList.add(CLASS_ACTIVE);
		popover.addEventListener('webkitTransitionEnd', onPopoverShown);
	};
	var setStyle = function(popover, display, top, left) {
		var style = popover.style;
		if (typeof display !== 'undefined')
			style.display = display;
		if (typeof top !== 'undefined')
			style.top = top + 'px';
		if (typeof left !== 'undefined')
			style.left = left + 'px';
	};
	var calPosition = function(popover, anchor, isActionSheet) {
		if (!popover || !anchor) {
			return;
		}

		if (isActionSheet) { //actionsheet
			setStyle(popover, 'block')
			return;
		}

		var wWidth = window.innerWidth;
		var wHeight = window.innerHeight;

		var pWidth = popover.offsetWidth;
		var pHeight = popover.offsetHeight;

		var aWidth = anchor.offsetWidth;
		var aHeight = anchor.offsetHeight;
		var offset = $.offset(anchor);

		var arrow = popover.querySelector('.' + CLASS_POPOVER_ARROW);
		if (!arrow) {
			arrow = document.createElement('div');
			arrow.className = CLASS_POPOVER_ARROW;
			popover.appendChild(arrow);
		}
		var arrowSize = arrow && arrow.offsetWidth / 2 || 0;



		var pTop = 0;
		var pLeft = 0;
		var diff = 0;
		var arrowLeft = 0;
		var defaultPadding = popover.classList.contains(CLASS_ACTION_POPOVER) ? 0 : 5;

		var position = 'top';
		if ((pHeight + arrowSize) < (offset.top - window.pageYOffset)) { //top
			pTop = offset.top - pHeight - arrowSize;
		} else if ((pHeight + arrowSize) < (wHeight - (offset.top - window.pageYOffset) - aHeight)) { //bottom
			position = 'bottom';
			pTop = offset.top + aHeight + arrowSize;
		} else { //middle
			position = 'middle';
			pTop = Math.max((wHeight - pHeight) / 2 + window.pageYOffset, 0);
			pLeft = Math.max((wWidth - pWidth) / 2 + window.pageXOffset, 0);
		}
		if (position === 'top' || position === 'bottom') {
			pLeft = aWidth / 2 + offset.left - pWidth / 2;
			diff = pLeft;
			if (pLeft < defaultPadding) pLeft = defaultPadding;
			if (pLeft + pWidth > wWidth) pLeft = wWidth - pWidth - defaultPadding;

			if (arrow) {
				if (position === 'top') {
					arrow.classList.add(CLASS_BOTTOM);
				} else {
					arrow.classList.remove(CLASS_BOTTOM);
				}
				diff = diff - pLeft;
				arrowLeft = (pWidth / 2 - arrowSize / 2 + diff);
				arrowLeft = Math.max(Math.min(arrowLeft, pWidth - arrowSize * 2 - 6), 6);
				arrow.setAttribute('style', 'left:' + arrowLeft + 'px');
			}
		} else if (position === 'middle') {
			arrow.setAttribute('style', 'display:none');
		}
		setStyle(popover, 'block', pTop, pLeft);
	};

	/**
	 * 在popover、侧滑菜单等界面，经常会用到蒙版遮罩；
	 * 比如popover弹出后，除popover控件外的其它区域都会遮罩一层蒙版，
	 * 用户点击蒙版不会触发蒙版下方的逻辑，而会关闭popover同时关闭蒙版；再比如侧滑菜单界面，
	 * 菜单划出后，除侧滑菜单之外的其它区域都会遮罩一层蒙版，用户点击蒙版会关闭侧滑菜单同时关闭蒙版。
	 *
	 * 遮罩蒙版常用的操作包括：创建、显示、关闭，如下代码:
	 *
	 *		var mask = $.createMask(callback);//callback为用户点击蒙版时自动执行的回调；
	 *		mask.show();//显示遮罩
	 *		mask.close();//关闭遮罩
	 *
	 * 注意：关闭遮罩仅会关闭，不会销毁；关闭之后可以再次调用mask.show();打开遮罩；
	 *
	 * eui默认的蒙版遮罩使用`.mui-backdrop`类定义（如下代码），若需自定义遮罩效果，
	 * 只需覆盖定义`.mui-backdrop`即可；
	 *
	 * 		.mui-backdrop {
	 *			position: fixed;
	 *			top: 0;
	 *			right: 0;
	 *			bottom: 0;
	 *			left: 0;
	 *			z-index: 998;
	 *			background-color: rgba(0,0,0,.3);
	 *		}
	 *
	 * @alias #createMask
	 * @memberof Eui
	 * @param {Function} callback 点击蒙版时自动执行的回调
	 */
	$.createMask = function(callback) {
		var element = document.createElement('div');
		element.classList.add(CLASS_BACKDROP);
		element.addEventListener('touchmove', $.preventDefault);
		element.addEventListener('tap', function() {
			mask.close();
		});
		var mask = [element];
		mask._show = false;
		mask.show = function() {
			mask._show = true;
			element.setAttribute('style', 'opacity:1');
			document.body.appendChild(element);
			return mask;
		};
		mask._remove = function() {
			if (mask._show) {
				mask._show = false;
				element.setAttribute('style', 'opacity:0');

				$.later(function() {
					var body = document.body;
					element.parentNode === body && body.removeChild(element);
				}, 350);
			}
			return mask;
		};
		mask.close = function() {
			if (callback) {
				if (callback() !== false) {
					mask._remove();
				}
			} else {
				mask._remove();
			}
		};
		return mask;
	};

	/**
	 * eui框架内置了弹出菜单插件，弹出菜单显示内容不限，但必须包裹在一个含.mui-popover类的div中，
	 * 如下即为一个弹出菜单内容：
	 *
	 * 		<div id="popover" class="mui-popover">
	 *		   <ul class="mui-table-view">
	 *		     <li class="mui-table-view-cell"><a href="#">Item1</a></li>
	 *		     <li class="mui-table-view-cell"><a href="#">Item2</a></li>
	 *		     <li class="mui-table-view-cell"><a href="#">Item3</a></li>
	 *		     <li class="mui-table-view-cell"><a href="#">Item4</a></li>
	 *		     <li class="mui-table-view-cell"><a href="#">Item5</a></li>
	 *		   </ul>
	 *		 </div>
	 *
	 *  要显示、隐藏如上菜单，eui推荐使用锚点方式，例如：
	 *
	 *  	<a href="#popover" class="mui-btn mui-btn-primary mui-btn-block">打开弹出菜单</a>
	 *
	 *
	 * 点击如上定义的按钮，即可显示弹出菜单，再次点击弹出菜单之外的其他区域，均可关闭弹出菜单；这种使用方式最为简洁。
     *
	 * 若希望通过js的方式控制弹出菜单，则通过如下一个方法即可：
	 *
	 *  	//传入toggle参数，用户也无需关心当前是显示还是隐藏状态，eui会自动识别处理；
	 *		$('.mui-popover').popover('toggle');
	 *
	 * @alias #popover
	 * @param {String} args 可以是`show`|`hide`|`toggle`
	 * @memberof $.fn
	 */
	$.fn.popover = function() {
		var args = arguments;
		this.each(function() {
			$.targets._popover = this;
			if (args[0] === 'show' || args[0] === 'hide' || args[0] === 'toggle') {
				togglePopover(this, args[1]);
			}
		});
	};

})(Eui, window, document, 'popover');