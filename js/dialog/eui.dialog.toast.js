/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath dialog/eui.dialog.toast.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window) {

	/**
	 * 显示`自动消失`提示框.
	 * @alias #toast
	 * @memberof Eui
	 * @param {String} message 提示消息
	 */
	$.toast = function(message) {
		if($.os.plus){
			//默认显示在底部；
			$.plusReady(function(){
				plus.nativeUI.toast(message,{
					verticalAlign:'bottom'
				});
			});
		}else{
			var toast = document.createElement('div');
			toast.classList.add($.className('toast-container'));
			toast.innerHTML = '<div class="'+$.className('toast-message')+'">'+message+'</div>';
			document.body.appendChild(toast);
			setTimeout(function(){
		  		document.body.removeChild(toast);
			},2000);
		}
	};

})(Eui, window);