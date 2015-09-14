/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath dialog/eui.dialog.alert.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window) {

	/**
	 * 显示`警告`消息框.
	 *
	 *      alert(message)
	 *      alert(message, callback)
	 *      alert(message,title, callback)
	 *      alert(message,title,btnValue, callback)
	 *
	 * @alias #alert
	 * @memberof Eui
	 *
	 * @param {String} message 提示信息
	 * @param {String} [title] 标题
	 * @param {String} [btnValue] 按钮文本
	 * @param {Function} callback 按钮点击回调函数.
	 */
	$.alert = function(message,title,btnValue,callback) {
		if ($.os.plus) {
			if(typeof message === undefined){
				return;
			}else{
				if(typeof title ==='function'){
					callback = title;
					title = null;
					btnValue = '确定';
				}else if(typeof btnValue ==='function'){
					callback = btnValue;
					btnValue = null;
				}
				$.plusReady(function(){
					plus.nativeUI.alert(message,callback,title,btnValue);
				});
			}

		}else{
			//TODO H5版本
			window.alert(message);
		}
	};

})(Eui, window);