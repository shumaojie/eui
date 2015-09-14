/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath dialog/eui.dialog.prompt.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window) {

	/**
	 * 显示`输入`对话框.
	 *
	 *      prompt(text)
	 *      prompt(text, callback)
	 *      prompt(text, defaultText,callback)
	 *      prompt(text, defaultText,title,callback)
	 *      prompt(text, defaultText,title,btnArray,callback)
	 *
	 * @alias #prompt
	 * @memberof Eui
	 * @param {String} text 文本label
	 * @param {String} [defaultText] 默认显示文本值
	 * @param {String} [title] 标题
	 * @param {Array} [btnArray] 按钮显示的文本
	 * @param callback 点击'确认'的回调函数.
	 */
	$.prompt = function(text,defaultText,title,btnArray,callback) {
		if ($.os.plus) {
			if(typeof text === undefined){
				return;
			}else{
				if(typeof defaultText ==='function'){
					callback = defaultText;
					defaultText = null;
					title = null;
					btnArray = null;
				}else if(typeof title === 'function'){
					callback = title;
					title = null;
					btnArray = null;
				}else if(typeof btnArray ==='function'){
					callback = btnArray;
					btnArray = null;
				}
				$.plusReady(function(){
					plus.nativeUI.prompt(text,callback,title,defaultText,btnArray);
				});
			}

		}else{
			//H5版本(确认index为0，取消index为1)
			var result = window.prompt(text);
			if (result) {
				callback({
					index: 0,
					value: result
				});
			} else {
				callback({
					index: 1,
					value: ''
				});
			}
		}
	};

})(Eui, window);