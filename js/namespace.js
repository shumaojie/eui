/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath namespace.js
 *
 * Eui.js may be freely distributed under the MIT license.
 * @namespace Eui
 */
(function($) {

	/**
	 * 默认命名空间.
	 * @memberof Eui
	 * @name #namespace
	 * @type {String}
	 * @default 'mui'
	 */
	$.namespace = 'mui';

	/**
	 * 样式类的前缀.
	 * @memberof Eui
	 * @name #classNamePrefix
	 * @type {String}
	 * @default 'mui-'
	 */
	$.classNamePrefix = $.namespace + '-';

	/**
	 * 样式选择器的前缀.
	 * @memberof Eui
	 * @alias #classSelectorPrefix
	 * @type {String}
	 * @default '.mui-'
	 */
	$.classSelectorPrefix = '.' + $.classNamePrefix;

	/**
	 * 返回最终的样式名称.
	 * @alias #className
	 * @memberof Eui
	 * @param {String} className
	 * @returns {String} 默认{@link $.classNamePrefix|classNamePrefix} + className
	 */
	$.className = function(className) {
		return $.classNamePrefix + className;
	};

	/**
	 * 返回最终的classSelector.
	 * @alias #classSelector
	 * @memberof Eui
	 * @param {String} classSelector
	 * @returns {String}
	 */
	$.classSelector = function(classSelector) {
		return classSelector.replace(/\./g, $.classSelectorPrefix);
	};

	//
	// 返回最终的eventName.
	// @param {String} event
	// @param {Boolean} module
	// @returns {String}
	//
	$.eventName = function(event, module) {
		return event + ($.namespace ? ('.' + $.namespace) : '') + ( module ? ('.' + module) : '');
	};
})(Eui);
