/**
 * (c)2015  Create at: 2015-05-28
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @namespace Event
 */


(function($){
    var _zid = 1, undefined,
        slice = Array.prototype.slice,
        isFunction = $.isFunction,
        isString = function(obj){ return typeof obj == 'string' },
        handlers = {},
        specialEvents={},
        focusinSupported = 'onfocusin' in window,
        focus = { focus: 'focusin', blur: 'focusout' },
        hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

    function zid(element) {
        return element._zid || (element._zid = _zid++)
    }
    function findHandlers(element, event, fn, selector) {
        event = parse(event)
        if (event.ns) var matcher = matcherFor(event.ns)
        return (handlers[zid(element)] || []).filter(function(handler) {
            return handler
                && (!event.e  || handler.e == event.e)
                && (!event.ns || matcher.test(handler.ns))
                && (!fn       || zid(handler.fn) === zid(fn))
                && (!selector || handler.sel == selector)
        })
    }
    function parse(event) {
        var parts = ('' + event).split('.')
        return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
    }
    function matcherFor(ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
    }

    function eventCapture(handler, captureSetting) {
        return handler.del &&
            (!focusinSupported && (handler.e in focus)) ||
            !!captureSetting
    }

    function realEvent(type) {
        return hover[type] || (focusinSupported && focus[type]) || type
    }

    function add(element, events, fn, data, selector, delegator, capture){
        var id = zid(element), set = (handlers[id] || (handlers[id] = []))
        events.split(/\s/).forEach(function(event){
            if (event == 'ready') return $(document).ready(fn)
            var handler   = parse(event)
            handler.fn    = fn
            handler.sel   = selector
            // emulate mouseenter, mouseleave
            if (handler.e in hover) fn = function(e){
                var related = e.relatedTarget
                if (!related || (related !== this && !$.contains(this, related)))
                    return handler.fn.apply(this, arguments)
            }
            handler.del   = delegator
            var callback  = delegator || fn
            handler.proxy = function(e){
                e = compatible(e)
                if (e.isImmediatePropagationStopped()) return
                e.data = data
                var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
                if (result === false) e.preventDefault(), e.stopPropagation()
                return result
            }
            handler.i = set.length
            set.push(handler)
            if ('addEventListener' in element){
                element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
            }
        })
    }
    function remove(element, events, fn, selector, capture){
        var id = zid(element)
            ;(events || '').split(/\s/).forEach(function(event){
            findHandlers(element, event, fn, selector).forEach(function(handler){
                delete handlers[id][handler.i]
                if ('removeEventListener' in element)
                    element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
            })
        })
    }

    $.event = { add: add, remove: remove }

    /**
     * 接受一个函数，然后返回一个新函数，并且这个新函数始终保持了特定的上下文(context)语境，
     * 新函数中`this`指向context参数。另外一种形式，原始的function是从上下文(context)对象的特定属性读取。
     *
     *      $.proxy(fn, context) ⇒ function
     *      $.proxy(fn, context, [additionalArguments...]) ⇒ function
     *      $.proxy(context, property) ⇒ function
     *      $.proxy(context, property, [additionalArguments...]) ⇒ function
     *
     * 如果传递超过2个的额外参数，它们被用于 传递给fn参数的函数 引用。
     *
     * @memberof $
     * @param {Function} [fn] 函数
     * @param {Object} context 上下文
     * @param {Object} [property] 特定属性
     * @returns {Function}
     * @example
     * var obj = {name: 'Eui'},
     * handler = function(){ console.log("hello from + ", this.name) }
     * // ensures that the handler will be executed in the context of `obj`:
     * $(document).on('click', $.proxy(handler, obj))
     */
    $.proxy = function(fn, context) {
        var args = (2 in arguments) && slice.call(arguments, 2)
        if (isFunction(fn)) {
            var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
            proxyFn._zid = zid(fn)
            return proxyFn
        } else if (isString(context)) {
            if (args) {
                args.unshift(fn[context], fn)
                return $.proxy.apply(null, args)
            } else {
                return $.proxy(fn[context], fn)
            }
        } else {
            throw new TypeError("expected function")
        }
    }

    /**
     * 为一个元素绑定一个处理事件。
     *
     *      bind(type, function(e){ ... }) ⇒ self
     *      bind(type, [data], function(e){ ... }) ⇒ self
     *      bind({ type: handler, type2: handler2, ... }) ⇒ self
     *      bind({ type: handler, type2: handler2, ... }, [data]) ⇒ self
     *
     * @function
     * @name Event#bind
     * @memberof Event
     * @param {String} event 事件名称
     * @param {Object} [data] 参数
     * @param {Function} callback 回调函数
     * @param {event} callback.e 事件对象
     * @returns {$}
     */
    $.fn.bind = function(event, data, callback){
        return this.on(event, data, callback)
    }

    /**
     * 移除通过[bind](#bind)注册的事件。
     *
     *      undelegate(selector, type, function(e){ ... }) ⇒ self
     *      undelegate(selector, { type: handler, type2: handler2, ... }) ⇒ self
     *
     * @function
     * @name #unbind
     * @memberof Event
     * @param {String} event 事件名称
     * @param {Function} callback 回调函数
     * @returns {$}
     * @deprecated user {@link Event#off|off} instead.
     */
    $.fn.unbind = function(event, callback){
        return this.off(event, callback)
    }

    /**
     * 添加一个处理事件到元素，当第一次执行事件以后，该事件将自动解除绑定，保证处理函数在每个元素上最多执行一次。
     * `selector` 和 `data` 等参数说明请查看[`.bind()`](#bind)。
     *
     *       one(type, [selector], function(e){ ... }) ⇒ self
     *       one(type, [selector], [data], function(e){ ... }) ⇒ self
     *       one({ type: handler, type2: handler2, ... }, [selector]) ⇒ self
     *       one({ type: handler, type2: handler2, ... }, [selector], [data]) ⇒ self
     *
     * @function
     * @name #one
     * @memberof Event
     * @param {string} type 事件名称
     * @param {string} [selector] 选择器
     * @param {Object} [data] 参数
     * @param {Function} callback 回调函数
     * @returns {$}
     */
    $.fn.one = function(event, selector, data, callback){
        return this.on(event, selector, data, callback, 1)
    }

    var returnTrue = function(){return true},
        returnFalse = function(){return false},
        ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
        eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
        }

    //兼容模式
    function compatible(event, source) {
        if (source || !event.isDefaultPrevented) {
            source || (source = event)

            $.each(eventMethods, function(name, predicate) {
                var sourceMethod = source[name]
                event[name] = function(){
                    this[predicate] = returnTrue
                    return sourceMethod && sourceMethod.apply(source, arguments)
                }
                event[predicate] = returnFalse
            })

            if (source.defaultPrevented !== undefined ? source.defaultPrevented :
                    'returnValue' in source ? source.returnValue === false :
                    source.getPreventDefault && source.getPreventDefault())
                event.isDefaultPrevented = returnTrue
        }
        return event
    }

    function createProxy(event) {
        var key, proxy = { originalEvent: event }
        for (key in event)
            if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

        return compatible(proxy, event)
    }

    /**
     * 基于一组特定的根元素为所有选择器匹配的元素附加一个处理事件，匹配的元素可能现在或将来才创建。
     *
     *      delegate(selector, type, function(e){ ... }) ⇒ self
     *      delegate(selector, { type: handler, type2: handler2, ... }) ⇒ self
     *
     * @function
     * @name Event#delegate
     * @memberof Event
     * @param {String} selector 选择器
     * @param {String} event 事件名称
     * @param {Function} callback 回调函数
     * @returns {$}
     * @deprecated user {@link Event#on|on} instead.
     */
    $.fn.delegate = function(selector, event, callback){
        return this.on(event, selector, callback)
    }

    /**
     * 移除通过[delegate](#delegate) 注册的事件。
     *
     *      undelegate(selector, type, function(e){ ... }) ⇒ self
     *      undelegate(selector, { type: handler, type2: handler2, ... }) ⇒ self
     *
     * @function
     * @name Event#undelegate
     * @memberof Event
     * @param {String} selector 选择器
     * @param {String} type 事件名称
     * @param {Function} callback 回调函数
     * @returns {$}
     * @deprecated user {@link Event#off|off} instead.
     */
    $.fn.undelegate = function(selector, event, callback){
        return this.off(event, selector, callback)
    }

    /**
     * 类似[delegate](#delegate)，添加一个个事件处理器到符合目前选择器的所有元素匹配，匹配的元素可能现在或将来才创建。
     *
     *      live(type, function(e){ ... }) ⇒ self
     *      live({ type: handler, type2: handler2, ... }) ⇒ self
     *
     * @function
     * @name Event#live
     * @memberof Event
     * @param {String} type 事件名称
     * @param {Function} callback 回调函数
     * @returns {$}
     * @deprecated user {@link Event#on|on} instead.
     */
    $.fn.live = function(event, callback){
        $(document.body).delegate(this.selector, event, callback)
        return this
    }

    /**
     * 删除通过 [live](#live) 添加的事件。
     *
     *      die(type, function(e){ ... }) ⇒ self
     *      die({ type: handler, type2: handler2, ... }) ⇒ self
     *
     * @function
     * @name Event#die
     * @memberof Event
     * @param {String} type 事件类型
     * @param {Function} callback 回调函数
     * @returns {$}
     * @deprecated user {@link Event#off|off} instead.
     */
    $.fn.die = function(event, callback){
        $(document.body).undelegate(this.selector, event, callback)
        return this
    }

    /**
     * 添加事件处理程序到对象集合中得元素上。多个事件可以通过空格的字符串方式添加， 或者以事件类型为键、
     * 以函数为值的对象 方式。如果给定css选择器， 当事件在匹配该选择器的元素上发起时，事件才会被触发（注：即事件委派，或者说事件代理）。
     *
     *      on(type, [selector], function(e){ ... }) ⇒ self
     *      on(type, [selector], [data], function(e){ ... }) ⇒ self
     *      on({ type: handler, type2: handler2, ... }, [selector]) ⇒ self
     *      on({ type: handler, type2: handler2, ... }, [selector], [data]) ⇒ self
     *
     * 如果给定data参数，这个值将在事件处理程序执行期间被作为有用的 event.data 属性。
     *
     * 事件处理程序在添加该处理程序的元素、或在给定选择器情况下匹配该选择器的元素的上下文中执行 (注：this指向触发事件的元素)。 当一个事件处理程序返回false，
     * preventDefault() 和 stopPropagation()被当前事件调用的情况下， 将防止默认浏览器操作，如链接。
     *
     * 如果`false`在回调函数的位置上作为参数传递给这个方法， 它相当于传递一个函数，
     * 这个函数直接返回false。（注：即将 false 当作 `function(e){ ... }` 的参数，
     * 作为 `function(){ return false; }` 的简写形式，例如： `$("a.disabled").on("click", false);
     * 这相当于$("a.disabled").on("click", function(){ return false; } );）`
     *
     * @function
     * @name #on
     * @memberof Event
     * @param {string} type 事件名称
     * @param {string} [selector] 选择器
     * @param {Object} [data] 参数
     * @param {Function} callback 回调函数
     * @param {boolean} one
     * @returns {$}
     * @example
     * var elem = $('#content')
     * // observe all clicks inside #content:
     * elem.on('click', function(e){ ... })
     * // observe clicks inside navigation links in #content
     * elem.on('click', 'nav a', function(e){ ... })
     * // all clicks inside links in the document
     * $(document).on('click', 'a', function(e){ ... })
     * // disable following any navigation link on the page
     * $(document).on('click', 'nav a', false)
     */
    $.fn.on = function(event, selector, data, callback, one){
        var autoRemove, delegator, $this = this
        if (event && !isString(event)) {
            $.each(event, function(type, fn){
                $this.on(type, selector, data, fn, one)
            })
            return $this
        }

        if (!isString(selector) && !isFunction(callback) && callback !== false)
            callback = data, data = selector, selector = undefined
        if (callback === undefined || data === false)
            callback = data, data = undefined

        if (callback === false) callback = returnFalse

        return $this.each(function(_, element){
            if (one) autoRemove = function(e){
                remove(element, e.type, callback)
                return callback.apply(this, arguments)
            }

            if (selector) delegator = function(e){
                var evt, match = $(e.target).closest(selector, element).get(0)
                if (match && match !== element) {
                    evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
                    return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
                }
            }

            add(element, event, callback, data, selector, delegator || autoRemove)
        })
    }

    /**
     * 移除通过 [on](#on) 添加的事件.移除一个特定的事件处理程序， 必须通过用`on()`添加的那个相同的函数。
     * 否则，只通过事件类型调用此方法将移除该类型的所有处理程序。
     * 如果没有参数，将移出当前元素上 _全部_ 的注册事件。
     *
     *      off(type, [selector], function(e){ ... }) ⇒ self
     *      off({ type: handler, type2: handler2, ... }, [selector]) ⇒ self
     *      off(type, [selector]) ⇒ self
     *      off() ⇒ self
     *
     * @function
     * @name Event#off
     * @memberof Event
     * @param {string} type 事件名称
     * @param {string} [selector] 选择器
     * @param {Function} callback 回调函数
     * @returns {$}
     */
    $.fn.off = function(event, selector, callback){
        var $this = this
        if (event && !isString(event)) {
            $.each(event, function(type, fn){
                $this.off(type, selector, fn)
            })
            return $this
        }

        if (!isString(selector) && !isFunction(callback) && callback !== false)
            callback = selector, selector = undefined

        if (callback === false) callback = returnFalse

        return $this.each(function(){
            remove(this, event, callback, selector)
        })
    }

    /**
     * 在对象集合的元素上触发指定的事件。事件可以是一个字符串类型，
     * 也可以是一个 通过{@link $.Event} 定义的事件对象。如果给定`args`参数，它会作为参数传递给事件函数。
     *
     *      trigger(event, [args]) ⇒ self
     *
     * @function
     * @name #trigger
     * @memberof Event
     * @param {string} event 事件名称
     * @param {Object} [args] 参数
     * @returns {$}
     * @example
     * // add a handler for a custom event
     * $(document).on('mylib:change', function(e, from, to){
     * console.log('change on %o with data %s, %s', e.target, from, to)
     * })
     * // trigger the custom event
     * $(document.body).trigger('mylib:change', ['one', 'two'])
     */
    $.fn.trigger = function(event, args){
        event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
        event._args = args
        return this.each(function(){
            // handle focus(), blur() by calling them directly
            if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
            // items in the collection might not be DOM elements
            else if ('dispatchEvent' in this) this.dispatchEvent(event)
            else $(this).triggerHandler(event, args)
        })
    }

    /**
     * 像 [trigger](#trigger)，它只在当前元素上触发事件，但不冒泡。
     *
     *      triggerHandler(event, [args]) ⇒ self
     *
     * @function
     * @name #triggerHandler
     * @memberof Event
     * @param {string} event 事件名称
     * @param {Object} [args] 参数
     * @returns {$}
     * @example
     * $("input").triggerHandler('focus');
     // 此时input上的focus事件触发，但是input不会获取焦点
     $("input").trigger('focus');
     // 此时input上的focus事件触发，input获取焦点
     */
    $.fn.triggerHandler = function(event, args){
        var e, result
        this.each(function(i, element){
            e = createProxy(isString(event) ? $.Event(event) : event)
            e._args = args
            e.target = element
            $.each(findHandlers(element, event.type || event), function(i, handler){
                result = handler.proxy(e)
                if (e.isImmediatePropagationStopped()) return false
            })
        })
        return result
    }

        // shortcut methods for `.bind(event, fn)` for each event type
    ;('focusin focusout focus blur load resize scroll unload click dblclick '+
    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
    'change select keydown keypress keyup error').split(' ').forEach(function(event) {
            $.fn[event] = function(callback) {
                return (0 in arguments) ?
                    this.bind(event, callback) :
                    this.trigger(event)
            }
        })

    /**
     * 创建并初始化一个指定的DOM事件。如果给定properties对象，使用它来扩展出新的事件对象。
     * 默认情况下，事件被设置为冒泡方式；这个可以通过设置bubbles为false来关闭。
     *
     * 一个事件初始化的函数可以使用 trigger来触发。
     *
     *      $.Event(type, [properties]) ⇒ event
     *
     * @memberof $
     * @param {String} type 事件名称
     * @param {Object} [props] 参数
     * @returns {event}
     * @example
     * $.Event('mylib:change', { bubbles: false })
     */
    $.Event = function(type, props) {
        if (!isString(type)) props = type, type = props.type
        var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
        if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
        event.initEvent(type, bubbles, true)
        return compatible(event)
    }

})(Eui);