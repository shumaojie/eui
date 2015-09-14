/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath init/eui.back.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window) {

	//register back
	$.addBack = function(back) {
		return $.addAction('backs', back);
	};
	/**
	 * default
	 */
	$.addBack({
		name: 'browser',
		index: 100,
		handle: function() {
			if (window.history.length > 1) {
				window.history.back();
				return true;
			}
			return false;
		}
	});

	/**
	 * 后退到上层webview窗口，调用后退之前会判断是否可退。
	 *
	 * 备注：如果全局配置了`beforeback`,它是个function且返回false，那么将不执行后退方法.
	 * 全局参数配置可查看[global]{@link Eui#global}.
	 *
	 * @alias #back
	 * @memberof Eui
	 */
	$.back = function() {
		if (typeof $.options.beforeback === 'function') {
			if ($.options.beforeback() === false) {
				return;
			}
		}
		$.doAction('backs');
	};

	window.addEventListener('tap', function(e) {
		var action = $.targets.action;
		if (action && action.classList.contains($.className('action-back'))) {
			$.back();
		}
	});

	window.addEventListener('swiperight', function(e) {
		var detail = e.detail;
		if ($.options.swipeBack === true && Math.abs(detail.angle) < 3) {
			$.back();
		}
	});
})(Eui, window);