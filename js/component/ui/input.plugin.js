/**
 * (c)2015  Create at: 2015-09-08 10:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/input.plugin.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * @desc
 *
 * ## radio (单选框) ##
 *
 * radio用于单选的情况
 *
 * 		<div class="mui-input-row mui-radio">
 *		 <label>radio</label>
 *		 <input name="radio1" type="radio">
 *		</div>
 *
 * 默认radio在右侧显示，若希望在左侧显示，只需增加`.mui-left`类即可，如下：
 *
 * 		<div class="mui-input-row mui-radio">
 *	 	 <label>radio</label>
 *		 <input name="radio1" type="radio">
 *		</div>
 *
 * 若要禁用radio，只需在radio上增加`disabled`属性即可；
 *
 * eui基于列表控件，提供了列表式单选实现；在列表根节点上增加`.mui-table-view-radio`类即可，
 * 若要默认选中某项，只需要在对应li节点上增加`.mui-selected`类即可，dom结构如下：
 *
 *	   <ul class="mui-table-view mui-table-view-radio">
 *	      <li class="mui-table-view-cell">
 *		    <a class="mui-navigate-right">Item 1</a>
 *		  </li>
 *		  <li class="mui-table-view-cell mui-selected">
 *		    <a class="mui-navigate-right">Item 2</a>
 *		   </li>
 *		   <li class="mui-table-view-cell">
 *		    <a class="mui-navigate-right">Item 3</a>
 *		   </li>
 *	    </ul>
 *
 * 列表式单选在切换选中项时会触发`selected`事件，在事件参数（e.detail.el）中可以获得当前选中的dom节点，如下代码打印当前选中项的innerHTML：
 *
 *     var list = document.querySelector('.mui-table-view.mui-table-view-radio');
 *	   list.addEventListener('selected',function(e){
 *		 console.log("当前选中的为："+e.detail.el.innerText);
 *	   });
 *
 * ## checkbox (复选框) ##
 *
 * checkbox常用于多选的情况，比如批量删除、添加群聊等；
 *
 * 		<div class="mui-input-row mui-checkbox">
 *		   <label>checkbox示例</label>
 *         <input name="checkbox1" value="Item 1" type="checkbox" checked>
 *       </div>
 *
 * 默认checkbox在右侧显示，若希望在左侧显示，只需增加`.mui-left`类即可，如下：
 *
 * 		<div class="mui-input-row mui-checkbox mui-left">
 *		  <label>checkbox左侧显示示例</label>
 *		  <input name="checkbox1" value="Item 1" type="checkbox">
 *		</div>
 *
 * 若要禁用checkbox，只需在checkbox上增加`disabled`属性即可.
 *
 * ## range (滑块) ##
 *
 * 滑块常用于区间数字选择
 *
 *	  <div class="mui-input-row mui-input-range">
 *		<label>Range</label>
 *		<input type="range" min="0" max="100">
 *	  </div>
 *
 * ## 输入增强 ##
 *
 * eui目前提供的输入增强包括：快速删除和语音输入两项功能。要删除输入框中的内容，使用输入法键盘上的删除按键，只能逐个删除字符，
 * eui提供了快速删除能力，只需要在对应input控件上添加`.mui-input-clear`类，当input控件中有内容时，右侧会有一个删除图标，
 * 点击会清空当前input的内容；另外，为了方便快速输入，mui集成了HTML5+的语音输入，只需要在对应input控件上添加`.mui-input-speech`类，
 * 就会在该控件右侧显示一个语音输入的图标，点击会启用科大讯飞语音输入界面。
 *
 * @class Input
 */
(function($, window, document) {
	var CLASS_ICON = $.className('icon');
	var CLASS_ICON_CLEAR = $.className('icon-clear');
	var CLASS_ICON_SPEECH = $.className('icon-speech');
	var CLASS_ICON_SEARCH = $.className('icon-search');
	var CLASS_INPUT_ROW = $.className('input-row');
	var CLASS_PLACEHOLDER = $.className('placeholder');
	var CLASS_TOOLTIP = $.className('tooltip');
	var CLASS_HIDDEN = $.className('hidden');
	var CLASS_FOCUSIN = $.className('focusin');
	var SELECTOR_ICON_CLOSE = '.' + CLASS_ICON_CLEAR;
	var SELECTOR_ICON_SPEECH = '.' + CLASS_ICON_SPEECH;
	var SELECTOR_PLACEHOLDER = '.' + CLASS_PLACEHOLDER;
	var SELECTOR_TOOLTIP = '.' + CLASS_TOOLTIP;

	var findRow = function(target) {
		for (; target && target !== document; target = target.parentNode) {
			if (target.classList && target.classList.contains(CLASS_INPUT_ROW)) {
				return target;
			}
		}
		return null;
	};

	var Input = function(element, options) {
		this.element = element;
		this.options = options || {
			actions: 'clear'
		};
		if (~this.options.actions.indexOf('slider')) { //slider
			this.sliderActionClass = CLASS_TOOLTIP + ' ' + CLASS_HIDDEN;
			this.sliderActionSelector = SELECTOR_TOOLTIP;
		} else { //clear,speech,search
			if (~this.options.actions.indexOf('clear')) {
				this.clearActionClass = CLASS_ICON + ' ' + CLASS_ICON_CLEAR + ' ' + CLASS_HIDDEN;
				this.clearActionSelector = SELECTOR_ICON_CLOSE;
			}
			if (~this.options.actions.indexOf('speech')) { //only for 5+
				this.speechActionClass = CLASS_ICON + ' ' + CLASS_ICON_SPEECH;
				this.speechActionSelector = SELECTOR_ICON_SPEECH;
			}
			if (~this.options.actions.indexOf('search')) {
				this.searchActionClass = CLASS_PLACEHOLDER;
				this.searchActionSelector = SELECTOR_PLACEHOLDER;
			}
		}
		this.init();
	};
	Input.prototype.init = function() {
		this.initAction();
		this.initElementEvent();
	};
	Input.prototype.initAction = function() {
		var self = this;
		var row = self.element.parentNode;
		if (row) {
			if (self.sliderActionClass) {
				self.sliderAction = self.createAction(row, self.sliderActionClass, self.sliderActionSelector);
			} else {
				if (self.searchActionClass) {
					self.searchAction = self.createAction(row, self.searchActionClass, self.searchActionSelector);
					self.searchAction.addEventListener('tap', function(e) {
						$.focus(self.element);
						e.stopPropagation();
					});
				}
				if (self.speechActionClass) {
					self.speechAction = self.createAction(row, self.speechActionClass, self.speechActionSelector);
					self.speechAction.addEventListener('click', $.stopPropagation);
					self.speechAction.addEventListener('tap', function(event) {
						self.speechActionClick(event);
					});
				}
				if (self.clearActionClass) {
					self.clearAction = self.createAction(row, self.clearActionClass, self.clearActionSelector);
					self.clearAction.addEventListener('tap', function(event) {
						self.clearActionClick(event);
					});

				}
			}
		}
	};
	Input.prototype.createAction = function(row, actionClass, actionSelector) {
		var action = row.querySelector(actionSelector);
		if (!action) {
			var action = document.createElement('span');
			action.className = actionClass;
			if (actionClass === this.searchActionClass) {
				action.innerHTML = '<span class="' + CLASS_ICON + ' ' + CLASS_ICON_SEARCH + '"></span><span>' + this.element.getAttribute('placeholder') + '</span>';
				this.element.setAttribute('placeholder', '');
				if (this.element.value.trim()) {
					row.classList.add($.className('active'));
				}
			}
			row.insertBefore(action, this.element.nextSibling);
		}
		return action;
	};
	Input.prototype.initElementEvent = function() {
		var element = this.element;

		if (this.sliderActionClass) {
			var tooltip = this.sliderAction;
			//TODO resize
			var offsetLeft = element.offsetLeft;
			var width = element.offsetWidth - 28;
			var tooltipWidth = tooltip.offsetWidth;
			var distince = Math.abs(element.max - element.min);

			var timer = null;
			var showTip = function() {
				tooltip.classList.remove(CLASS_HIDDEN);
				tooltipWidth = tooltipWidth || tooltip.offsetWidth;
				var scaleWidth = (width / distince) * Math.abs(element.value - element.min);
				tooltip.style.left = (14 + offsetLeft + scaleWidth - tooltipWidth / 2) + 'px';
				tooltip.innerText = element.value;
				if (timer) {
					clearTimeout(timer);
				}
				timer = setTimeout(function() {
					tooltip.classList.add(CLASS_HIDDEN);
				}, 1000);
			};
			element.addEventListener('input', showTip);
			element.addEventListener('tap', showTip);
			element.addEventListener('touchmove', function(e) {
				e.stopPropagation();
			});
		} else {
			if (this.clearActionClass) {
				var action = this.clearAction;
				if (!action) {
					return;
				}
				$.each(['keyup', 'change', 'input', 'focus', 'cut', 'paste'], function(index, type) {
					(function(type) {
						element.addEventListener(type, function() {
							action.classList[element.value.trim() ? 'remove' : 'add'](CLASS_HIDDEN);
						});
					})(type);
				});
				element.addEventListener('blur', function() {
					action.classList.add(CLASS_HIDDEN);
				});
			}
			if (this.searchActionClass) {
				element.addEventListener('focus', function() {
					element.parentNode.classList.add($.className('active'));
				});
				element.addEventListener('blur', function() {
					if (!element.value.trim()) {
						element.parentNode.classList.remove($.className('active'));
					}
				});
			}
		}
	};
	Input.prototype.setPlaceholder = function(text) {
		if (this.searchActionClass) {
			var placeholder = this.element.parentNode.querySelector(SELECTOR_PLACEHOLDER);
			placeholder && (placeholder.getElementsByTagName('span')[1].innerText = text);
		} else {
			this.element.setAttribute('placeholder', text);
		}
	};
	Input.prototype.clearActionClick = function(event) {
		var self = this;
		self.element.value = '';
		$.focus(self.element);
		self.clearAction.classList.add(CLASS_HIDDEN);
		event.preventDefault();
	};
	Input.prototype.speechActionClick = function(event) {
		if (window.plus) {
			var self = this;
			var oldValue = self.element.value;
			self.element.value = '';
			document.body.classList.add(CLASS_FOCUSIN);
			plus.speech.startRecognize({
				engine: 'iFly'
			}, function(s) {
				self.element.value += s;
				$.focus(self.element);
				plus.speech.stopRecognize();
				$.trigger(self.element, 'recognized', {
					value: self.element.value
				});
				if (oldValue !== self.element.value) {
					$.trigger(self.element, 'change');
					$.trigger(self.element, 'input');
				}
				// document.body.classList.remove(CLASS_FOCUSIN);
			}, function(e) {
				document.body.classList.remove(CLASS_FOCUSIN);
			});
		} else {
			alert('only for 5+');
		}
		event.preventDefault();
	};

	/**
	 * 解析 `input`标签扩展range、clear、speech、search类型.
	 *
	 * 框架默认解析`class='.mui-input-row input'`中的元素.
	 *
	 * 		<div class="mui-input-row mui-input-range">
	 *		 <label>Range</label>
	 *		 <input type="range" min="0" max="100">
	 *      </div>
	 *
	 * @alias #input
	 * @memberof $.fn
	 *
	 * @returns {Input[]}
	 * @see Input
	 */
	$.fn.input = function(options) {
		var inputApis = [];
		this.each(function() {
			var inputApi = null;
			var actions = [];
			var row = findRow(this.parentNode);
			if (this.type === 'range' && row.classList.contains($.className('input-range'))) {
				actions.push('slider');
			} else {
				var classList = this.classList;
				if (classList.contains($.className('input-clear'))) {
					actions.push('clear');
				}
				if (classList.contains($.className('input-speech'))) {
					actions.push('speech');
				}
				if (this.type === 'search' && row.classList.contains($.className('search'))) {
					actions.push('search');
				}
			}
			var id = this.getAttribute('data-input-' + actions[0]);
			if (!id) {
				id = ++$.uuid;
				inputApi = $.data[id] = new Input(this, {
					actions: actions.join(',')
				});
				for (var i = 0, len = actions.length; i < len; i++) {
					this.setAttribute('data-input-' + actions[i], id);
				}
			} else {
				inputApi = $.data[id];
			}
			inputApis.push(inputApi);
		});
		return inputApis.length === 1 ? inputApis[0] : inputApis;
	};

	$.ready(function() {
		$($.classSelector('.input-row input')).input();
	});
})(Eui, window, document);