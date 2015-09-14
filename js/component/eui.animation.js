/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/eui.animation.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window) {

	/**
	 * 滚动窗口屏幕到指定位置，该方法是对window.scrollTo()方法在手机端的增强实现，
	 * 可设定滚动动画时间及滚动结束后的回调函数;鉴于手机屏幕大小，该方法仅可实现屏幕纵向滚动。
	 *
	 * 示例：
	 * 1秒钟之内滚动到页面顶部.
	 *
	 *		$.scrollTo(0,1000);
	 *
	 * @alias #scrollTo
	 * @memberof Eui
	 * @param {Number} scrollTop 要在窗口文档显示区左上角显示的文档的 y 坐标
	 * @param {Number} [duration=1000] 持续时间,单位：毫秒
	 * @param {Function} callback 滚动结束后执行的回调函数
	 */
	$.scrollTo = function(scrollTop, duration, callback) {
		duration = duration || 1000;
		var scroll = function(duration) {
			if (duration <= 0) {
				window.scrollTo(0, scrollTop);
				callback && callback();
				return;
			}
			var distaince = scrollTop - window.scrollY;
			setTimeout(function() {
				window.scrollTo(0, window.scrollY + distaince / duration * 10);
				scroll(duration - 10);
			}, 16.7);
		};
		scroll(duration);
	};

	$.animationFrame = function(cb) {
		var args, isQueued, context;
		return function() {
			args = arguments;
			context = this;
			if (!isQueued) {
				isQueued = true;
				requestAnimationFrame(function() {
					cb.apply(context, args);
					isQueued = false;
				});
			}
		};
	};

})(Eui, window);