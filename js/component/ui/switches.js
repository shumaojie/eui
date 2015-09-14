/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/switches.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, name) {

	var CLASS_SWITCH = $.className('switch');
	var CLASS_SWITCH_HANDLE = $.className('switch-handle');
	var CLASS_ACTIVE = $.className('active');
	var CLASS_DRAGGING = $.className('dragging');

	var CLASS_DISABLED = $.className('disabled');

	var SELECTOR_SWITCH_HANDLE = '.' + CLASS_SWITCH_HANDLE;

	var handle = function(event, target) {
		if (target.classList && target.classList.contains(CLASS_SWITCH)) {
			return target;
		}
		return false;
	};

	$.registerTarget({
		name: name,
		index: 100,
		handle: handle,
		target: false
	});

	var Toggle = function(element) {
		this.element = element;
		this.classList = this.element.classList;
		this.handle = this.element.querySelector(SELECTOR_SWITCH_HANDLE);
		this.init();
		this.initEvent();
	};

	Toggle.prototype.init = function() {
		this.toggleWidth = this.element.offsetWidth;
		this.handleWidth = this.handle.offsetWidth;
		this.handleX = this.toggleWidth - this.handleWidth - 3;
	};
	Toggle.prototype.initEvent = function() {
		this.element.addEventListener('touchstart', this);
		this.element.addEventListener('drag', this);
		this.element.addEventListener('swiperight', this);
		this.element.addEventListener('touchend', this);
		this.element.addEventListener('touchcancel', this);

	};
	Toggle.prototype.handleEvent = function(e) {
		if (this.classList.contains(CLASS_DISABLED)) {
			return;
		}
		switch (e.type) {
			case 'touchstart':
				this.start(e);
				break;
			case 'drag':
				this.drag(e);
				break;
			case 'swiperight':
				this.swiperight();
				break;
			case 'touchend':
			case 'touchcancel':
				this.end(e);
				break;
		}
	};
	Toggle.prototype.start = function(e) {
		this.classList.add(CLASS_DRAGGING);
		if (this.toggleWidth === 0 || this.handleWidth === 0) { //当switch处于隐藏状态时，width为0，需要重新初始化
			this.init();
		}
	};
	Toggle.prototype.drag = function(e) {
		var detail = e.detail;
		if (!this.isDragging) {
			if (detail.direction === 'left' || detail.direction === 'right') {
				this.isDragging = true;
				this.lastChanged = undefined;
				this.initialState = this.classList.contains(CLASS_ACTIVE);
			}
		}
		if (this.isDragging) {
			this.setTranslateX(detail.deltaX);
			e.stopPropagation();
			detail.gesture.preventDefault();
		}
	};
	Toggle.prototype.swiperight = function(e) {
		if (this.isDragging) {
			e.stopPropagation();
		}
	};
	Toggle.prototype.end = function(e) {
		this.classList.remove(CLASS_DRAGGING);
		if (this.isDragging) {
			this.isDragging = false;
			e.stopPropagation();
			$.trigger(this.element, 'toggle', {
				isActive: this.classList.contains(CLASS_ACTIVE)
			});
		} else {
			this.toggle();
		}
	};
	Toggle.prototype.toggle = function() {
		var classList = this.classList;
		if (classList.contains(CLASS_ACTIVE)) {
			classList.remove(CLASS_ACTIVE);
			this.handle.style.webkitTransform = 'translate(0,0)';
		} else {
			classList.add(CLASS_ACTIVE);
			this.handle.style.webkitTransform = 'translate(' + this.handleX + 'px,0)';
		}
		$.trigger(this.element, 'toggle', {
			isActive: this.classList.contains(CLASS_ACTIVE)
		});
	};
	Toggle.prototype.setTranslateX = $.animationFrame(function(x) {
		if (!this.isDragging) {
			return;
		}
		var isChanged = false;
		if ((this.initialState && -x > (this.handleX / 2)) || (!this.initialState && x > (this.handleX / 2))) {
			isChanged = true;
		}
		if (this.lastChanged !== isChanged) {
			if (isChanged) {
				this.handle.style.webkitTransform = 'translate(' + (this.initialState ? 0 : this.handleX) + 'px,0)';
				this.classList[this.initialState ? 'remove' : 'add'](CLASS_ACTIVE);
			} else {
				this.handle.style.webkitTransform = 'translate(' + (this.initialState ? this.handleX : 0) + 'px,0)';
				this.classList[this.initialState ? 'add' : 'remove'](CLASS_ACTIVE);
			}
			this.lastChanged = isChanged;
		}

	});

	/**
	 * eui提供了开关控件，点击滑动两种手势都可以对开关控件进行操作;
	 *
	 * 默认开关控件,带on/off文字提示，打开时为绿色背景，基本class类为`.mui-switch`、`.mui-switch-handle`，DOM结构如下：
	 *
	 *	  <div class="mui-switch">
	 *		<div class="mui-switch-handle"></div>
	 *	  </div>
	 *
	 * 若希望开关默认为打开状态，只需要在`.mui-switch`节点上增加`.mui-active`类即可，如下：
	 *
	 * 	  <!-- 开关打开状态，多了一个.mui-active类 -->
	 *	  <div class="mui-switch mui-active">
	 *     <div class="mui-switch-handle"></div>
	 *     </div>
	 *
	 * 若希望隐藏on/off文字提示，变成简洁模式，需要在`.mui-switch`节点上增加`.mui-switch-mini`类，如下：
	 *
	 * 	  <!-- 简洁模式开关关闭状态 -->
	 *	  <div class="mui-switch mui-switch-mini">
	 *		 <div class="mui-switch-handle"></div>
	 *	  </div>
	 *	  <!-- 简洁模式开关打开状态 -->
	 *	  <div class="mui-switch mui-switch-mini mui-active">
	 *		<div class="mui-switch-handle"></div>
	 *	  </div>
	 *
	 * eui默认还提供了蓝色开关控件，只需在`.mui-switch`节点上增加`.mui-switch-blue`类即可，如下：
	 *
	 * 		<!-- 蓝色开关关闭状态 -->
	 *		<div class="mui-switch mui-switch-blue">
	 *		 <div class="mui-switch-handle"></div>
	 *		</div>
	 *		<!-- 蓝色开关打开状态 -->
	 *		<div class="mui-switch mui-switch-blue mui-active">
	 *		  <div class="mui-switch-handle"></div>
	 *		</div>
	 *
	 * 蓝色开关上增加`.mui-switch-mini`即可变成无文字的简洁模式.
	 *
	 * ### 方法 ###
	 *
	 * 若要获得当前开关状态，可通过判断当前开关控件是否包含`.mui-active`类来实现，
	 * 若包含，则为打开状态，否则即为关闭状态；如下为代码示例：
	 *
	 * 	    var isActive = document.getElementById("mySwitch").classList.contains("mui-active");
	 *		 if(isActive){
	 *	       console.log("打开状态");
	 *	    }else{
	 *	       console.log("关闭状态");
	 *	    }
	 *
	 * 若使用js打开、关闭开关控件，可使用switch插件的`toggle()`方法，如下为示例代码：
	 *
	 * 		$("#mySwitch").switch().toggle();
	 *
	 * ### 事件 ###
	 *
	 * 开关控件在打开/关闭两种状态之间进行切换时，会触发toggle事件,通过事件的`detail.isActive`属性可以判断当前开关状态。
	 * 可通过监听toggle事件，可以在开关切换时执行特定业务逻辑。如下为使用示例：
	 *
	 *		document.getElementById("mySwitch").addEventListener("toggle",function(event){
	 *		  if(event.detail.isActive){
	 *			console.log("你启动了开关");
	 *		  }else{
	 *			console.log("你关闭了开关");
	 *		  }
	 *		})
	 *
	 * @alias #switch
	 * @memberof $.fn
	 * @returns {Array}
	 */
	$.fn['switch'] = function(options) {
		var switchApis = [];
		this.each(function() {
			var switchApi = null;
			var id = this.getAttribute('data-switch');
			if (!id) {
				id = ++$.uuid;
				$.data[id] = new Toggle(this);
				this.setAttribute('data-switch', id);
			} else {
				switchApi = $.data[id];
			}
			switchApis.push(switchApi);
		});
		return switchApis.length > 1 ? switchApis : switchApis[0];
	};

	$.ready(function() {
		$('.' + CLASS_SWITCH)['switch']();
	});
})(Eui, window, 'toggle');