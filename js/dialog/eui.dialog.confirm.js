/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath dialog/eui.dialog.confirm.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window) {

	/**
	 * 显示`确认`消息框.
	 *
	 *  	confirm(message)
	 *      confirm(message, callback)
	 *      confirm(message, title,callback)
	 *      confirm(message, title,btnArray,callback)
	 *
	 * @alias #confirm
	 * @memberof Eui
	 * @param {String} message 提示信息
	 * @param {String} [title] 标题
	 * @param {Array} [btnArray] 按钮显示的文本
	 * @param {Function} callback 确认回调函数
	 */
	$.confirm = function(message,title,btnArray,callback) {
		if ($.os.plus) {
			if(typeof message === undefined){
				return;
			}else{
				if(typeof title ==='function'){
					callback = title;
					title = null;
					btnArray = null;
				}else if(typeof btnArray ==='function'){
					callback = btnArray;
					btnArray = null;
				}
				$.plusReady(function(){
					plus.nativeUI.confirm(message,callback,title,btnArray);
				});
			}

		}else{
			//H5版本，0为确认，1为取消
			if (window.confirm(message)) {
				callback({
					index: 0
				});
			} else {
				callback({
					index: 1
				});
			}
		}
	};

})(Eui, window);