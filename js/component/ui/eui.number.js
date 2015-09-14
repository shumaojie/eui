/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/eui.number.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * @desc eui提供了数字输入框控件，可直接输入数字，也可以点击“+”、“-”按钮变换当前数值；默认numbox控件dom结构比较简单，如下:
 *
 *		<div class="mui-numbox">
 *		  <!-- "-"按钮，点击可减小当前数值 -->
 *		  <button class="mui-btn mui-numbox-btn-minus" type="button">-</button>
 *		  <input class="mui-numbox-input" type="number" />
 *		  <!-- "+"按钮，点击可增大当前数值 -->
 *		  <button class="mui-btn mui-numbox-btn-plus" type="button">+</button>
 *		</div>
 *
 * 可通过`data-*`自定义属性设置数字输入框的参数，如下：
 *
 * - `data-numbox-min` : 输入框允许使用的最小值，默认无限制
 * - `data-numbox-max` : 输入框允许使用的最大值，默认无限制
 * - `data-numbox-step` : 每次点击“+”、“-”按钮变化的步长，默认步长为1
 *
 * 示例：设置取值范围为0~100，每次变化步长为10，则代码如下:
 *
 *  	<div class="mui-numbox" data-numbox-step='10' data-numbox-min='0' data-numbox-max='100'>
 *		 <button class="mui-btn mui-numbox-btn-minus" type="button">-</button>
 *		 <input class="mui-numbox-input" type="number" />
 *		 <button class="mui-btn mui-numbox-btn-plus" type="button">+</button>
 *		</div>
 *
 * @class Numbox
 * @param {Object} options
 * @param {Number} [options.decimal=1] 小数位数
 * @param {Number} [options.step] 步长
 * @param {Number} [options.min] 输入框允许使用的最小值
 * @param {Number} [options.max] 输入框允许使用的最大值
 */
(function($) {

	var touchSupport = ('ontouchstart' in document);
	var tapEventName = touchSupport ? 'tap' : 'click';
	var changeEventName = 'change';
	var holderClassName = $.className('numbox');
	var plusClassName = $.className('numbox-btn-plus');
	var minusClassName = $.className('numbox-btn-minus');
	var inputClassName = $.className('numbox-input');

	var Numbox = $.Numbox = $.Class.extend({
		init: function(holder, options) {
			var self = this;
			if (!holder) {
				throw "构造 numbox 时缺少容器元素";
			}
			self.holder = holder;
			options = options || {};
			options.decimal = options.decimal || 1;
			options.step = parseFloat(options.step || 1/(Math.pow(10,options.decimal)));
			self.options = options;

			self.input = $.qsa('.' + inputClassName, self.holder)[0];
			self.plus = $.qsa('.' + plusClassName, self.holder)[0];
			self.minus = $.qsa('.' + minusClassName, self.holder)[0];
			self.checkValue();
			self.initEvent();
		},
		initEvent: function() {
			var self = this;
			self.plus.addEventListener(tapEventName, function(event) {
				var val = parseFloat(self.input.value) + self.options.step;
				self.input.value = val.toString();
				$.trigger(self.input, changeEventName, null);
			});
			self.minus.addEventListener(tapEventName, function(event) {
				var val = parseFloat(self.input.value) - self.options.step;
				self.input.value = val.toString();
				$.trigger(self.input, changeEventName, null);
			});
			self.input.addEventListener(changeEventName, function(event) {
				self.checkValue();
			});
		},
		checkValue: function() {
			var self = this;
			var val = self.input.value;
			if (val == null || val == '' || isNaN(val)) {
				self.input.value = self.options.min || 0;
				self.minus.disabled = self.options.min != null;
			} else {
				var val = parseFloat(val);
				if (self.options.max != null && !isNaN(self.options.max) && val >= parseFloat(self.options.max)) {
					val = self.options.max;
					self.plus.disabled = true;
				} else {
					self.plus.disabled = false;
				}
				if (self.options.min != null && !isNaN(self.options.min) && val <= parseFloat(self.options.min)) {
					val = self.options.min;
					self.minus.disabled = true;
				} else {
					self.minus.disabled = false;
				}
				self.options.decimal > 0 && val != 0 ? self.input.value = val.toFixed(self.options.decimal) : self.input.value = val;
			}
		},

		/**
		 * 更新选项.
		 * @alias #setOption
		 * @memberof Numbox
 		 * @param {String} name 配置项的名称
		 * @param {Number} value 配置项值
		 * @example
		 * //获取组件对象
		 * var obj = $('#dnumbox').numbox();
		 * //更新精度
		 * obj.setOption('decimal',2);
		 */
		setOption: function(name, value) {
			var self = this;
			self.options[name] = value;
		}
	});

	/**
	 * 初始化数字输入框控件.
	 *
	 * 框架默认处理`class='mui-numbox'`的DOM元素.
	 *
	 * 	   <div class="mui-numbox" data-numbox-step='10' data-numbox-min='0' data-numbox-max='100'>
	 * 		<button class="mui-btn mui-numbox-btn-minus" type="button">-</button>
	 * 		<input class="mui-numbox-input" type="number" />
	 * 		<button class="mui-btn mui-numbox-btn-plus" type="button">+</button>
	 * 	   </div>
	 *
	 * @see Numbox
	 * @alias #numbox
	 * @memberof $.fn
	 * @param {Object} options
	 * @param {Number} [options.decimal=1] 小数位数
	 * @param {Number} [options.step] 步长
	 * @param {Number} [options.min] 输入框允许使用的最小值
	 * @param {Number} [options.max] 输入框允许使用的最大值
	 * @returns {Numbox}
	 */
	$.fn.numbox = function(options) {
		var instanceArray = [];
		//遍历选择的元素
		this.each(function(i, element) {
			if (element.numbox) return;
			if (options) {
				element.numbox = new Numbox(element, options);
			} else {
				var optionsText = element.getAttribute('data-numbox-options');
				var options = optionsText ? JSON.parse(optionsText) : {};
				options.decimal = element.getAttribute('data-numbox-decimal') || options.decimal;
				options.step = element.getAttribute('data-numbox-step') || options.step;
				options.min = element.getAttribute('data-numbox-min') || options.min;
				options.max = element.getAttribute('data-numbox-max') || options.max;
				element.numbox = new Numbox(element, options);
			}
		});
		return this[0] ? this[0].numbox : null;
	}

	//自动处理 class='mui-numbox' 的 dom
	$.ready(function() {
		$('.' + holderClassName).numbox();
	});
}(Eui));