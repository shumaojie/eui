/*!
 * =====================================================
 * Eui Framework v1.1.0 (http://scm-q.github.io/eui/)
 *
 * Copyright (c) 2015 SCM
 *
 * Released under the MIT license
 *
 * last update at : 2015-09-16 09:23:58
  * =====================================================
 */
/**
 * (c)2015  Create at: 2015-05-26
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath eui.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 */

/**
 *  通过执行css选择器，包装dom节点，或者通过一个html字符串创建多个元素 来创建一个Zepto集合对象。
 *  Eui集合是一个类似数组的对象，它具有链式方法来操作它指向的DOM节点，
 *  除了$(`Eui`)对象上的直接方法外(如`$.extend`)，文档对象中的所有方法都是集合方法。
 *
 *  如果选择器中存在content参数(css选择器，dom，或者Eui集合对象)，
 *  那么只在所给的节点背景下进行css选择器；
 *  这个功能和使用`$(context).find(selector)`是一样的。
 *
 *       $(selector, [context]) ⇒ collection
 *       $(<Eui collection>) ⇒ same collection
 *       $(<DOM nodes>) ⇒ collection
 *       $(htmlString) ⇒ collection
 *       $(htmlString, attributes) ⇒ collection [v1.0]
 *       Eui(function($){ ... })
 *
 *  当给定一个html字符串片段来创建一个dom节点时。也可以通过给定一组属性映射来创建节点。
 *  最快的创建但元素，使用`<div>` 或 `<div/>`形式。
 *
 *  当一个函数附加在 DOMContentLoaded 事件的处理流程中。如果页面已经加载完毕，这个方法将会立即被执行。
 *
 *       $('div')  //=> all DIV elements on the page
 *       $('#foo') //=> element with ID "foo"
 *
 *       // create element:
 *       $("<p>Hello</p>") //=> the new P element
 *       // create element with attributes:
 *       $("<p />", { text:"Hello", id:"greeting", css:{color:'darkblue'} })
 *       //=> <p id=greeting style="color:darkblue">Hello</p>
 *
 *        // execute callback when the page is ready:
 *        Eui(function($){
 *         alert('Ready to Eui!')
 *       })
 *
 *   <a href="http://api.jquery.com/category/selectors/jquery-selector-extensions/">jQuery CSS 扩展</a> are not supported.
 *   然而，可选的“selector”模块有限提供了支持几个最常用的伪选择器，而且可以被丢弃，与现有的代码或插件的兼容执行。
 *
 *   如果$变量尚未定义，Eui只设置了全局变量$指向它本身。允许您同时使用的Eui和有用的遗留代码，
 *   例如，prototype.js。只要首先加载Prototype，Eui将不会覆盖Prototype的 <code>$</code>  函数。
 *   Eui将始终设置全局变量<code>Eui</code>指向它本身。
 *
 * @namespace $
 */
var Eui = (function(document, undefined) {

    var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat,
        filter = emptyArray.filter, slice = emptyArray.slice,
        document = window.document,
        elementDisplay = {}, classCache = {},
        cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rootNodeRE = /^(?:body|html)$/i,
        capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

        adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow,
            '*': document.createElement('div')
        },
        readyRE = /complete|loaded|interactive/,
        simpleSelectorRE = /^[\w-]*$/,
        class2type = {},
        toString = class2type.toString,
        eui = {},
        camelize, uniq,
        tempParent = document.createElement('div'),
        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        },
        isArray = Array.isArray ||
            function(object){ return object instanceof Array},

        idSelectorRE = /^#([\w-]+)$/,
        classSelectorRE = /^\.([\w-]+)$/,
        tagSelectorRE = /^[\w-]+$/,
        translateRE = /translate(?:3d)?\((.+?)\)/,
        translateMatrixRE = /matrix(3d)?\((.+?)\)/

    eui.matches = function(element, selector) {
        if (!selector || !element || element.nodeType !== 1) return false
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
            element.oMatchesSelector || element.matchesSelector
        if (matchesSelector) return matchesSelector.call(element, selector)
        // fall back to performing a selector:
        var match, parent = element.parentNode, temp = !parent
        if (temp) (parent = tempParent).appendChild(element)
        match = ~eui.qsa(parent, selector).indexOf(element)
        temp && tempParent.removeChild(element)
        return match
    }

    function type(obj) {
        return obj == null ? String(obj) :
        class2type[toString.call(obj)] || "object"
    }

    function isFunction(value) { return type(value) == "function" }
    function isWindow(obj)     { return obj != null && obj == obj.window }
    function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
    function isObject(obj)     { return type(obj) == "object" }
    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }
    function isNumeric(obj){
        return !isNaN( parseFloat(obj) ) && isFinite( obj );
    }
    function likeArray(obj) { return typeof obj.length == 'number' }

    function isDate(value) {
        return toString.call(value) === '[object Date]'
    }

    function compact(array) { return filter.call(array, function(item){ return item != null }) }
    function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
    camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }

    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase()
    }
    uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

    function classRE(name) {
        return name in classCache ?
            classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
    }

    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
    }

    function defaultDisplay(nodeName) {
        var element, display
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName)
            document.body.appendChild(element)
            display = getComputedStyle(element, '').getPropertyValue("display")
            element.parentNode.removeChild(element)
            display == "none" && (display = "block")
            elementDisplay[nodeName] = display
        }
        return elementDisplay[nodeName]
    }

    function children(element) {
        return 'children' in element ?
            slice.call(element.children) :
            $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
    }

    function E(dom, selector) {
        var i, len = dom ? dom.length : 0
        for (i = 0; i < len; i++) this[i] = dom[i]
        this.length = len
        this.selector = selector || ''
    }

    // `$.eui.fragment` takes a html string and an optional tag name
    // to generate DOM nodes nodes from the given html string.
    // The generated DOM nodes are returned as an array.
    // This function can be overriden in plugins for example to make
    // it compatible with browsers that don't support the DOM fully.
    eui.fragment = function(html, name, properties) {
        var dom, nodes, container;

        // A special case optimization for a single tag
        if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1));

        if (!dom) {
            if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>");
            if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
            if (!(name in containers)) name = '*';

            container = containers[name];
            container.innerHTML = '' + html;
            dom = $.each(slice.call(container.childNodes), function(){
                container.removeChild(this);
            })
        }

        if (isPlainObject(properties)) {
            nodes = $(dom);
            $.each(properties, function(key, value) {
                if (methodAttributes.indexOf(key) > -1) nodes[key](value)
                else nodes.attr(key, value)
            })
        }

        return dom;
    }

    // `$.eui.E` swaps out the prototype of the given `dom` array
    // of nodes with `$.fn` and thus supplying all the Eui functions
    // to the array. This method can be overriden in plugins.
    eui.E = function(dom, selector) {
        return new E(dom, selector);
    }

    // `$.eui.isE` should return `true` if the given object is a Eui
    // collection. This method can be overriden in plugins.
    eui.isE = function(object) {
        return object instanceof eui.E;
    }

    // `$.eui.init` is Eui's counterpart to jQuery's `$.fn.init` and
    // takes a CSS selector and an optional context (and handles various
    // special cases).
    // This method can be overriden in plugins.
    eui.init = function(selector, context) {
        var dom;
        // If nothing given, return an empty Eui collection
        if (!selector) return eui.E()
        // Optimize for string selectors
        else if (typeof selector == 'string') {
            selector = selector.trim()
            // If it's a html fragment, create nodes from it
            // Note: In both Chrome 21 and Firefox 15, DOM error 12
            // is thrown if the fragment doesn't begin with <
            if (selector[0] == '<' && fragmentRE.test(selector))
                dom = eui.fragment(selector, RegExp.$1, context), selector = null
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) return $(context).find(selector)
            // If it's a CSS selector, use it to select nodes.
            else dom = eui.qsa(document, selector)
        }
        // If a function is given, call it when the DOM is ready
        else if (isFunction(selector)) return $(document).ready(selector)
        // If a Eui collection is given, just return it
        else if (eui.isE(selector)) return selector
        else {
            // normalize array if an array of nodes is given
            if (isArray(selector)) dom = compact(selector)
            // Wrap DOM nodes.
            else if (isObject(selector))
                dom = [selector], selector = null
            // If it's a html fragment, create nodes from it
            else if (fragmentRE.test(selector))
                dom = eui.fragment(selector.trim(), RegExp.$1, context), selector = null
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) return $(context).find(selector)
            // And last but no least, if it's a CSS selector, use it to select nodes.
            else dom = eui.qsa(document, selector)
        }
        // create a new Eui collection from the nodes found
        return eui.E(dom, selector)
    }

    // `$` will be the base `Eui` object. When calling this
    // function just call `$.eui.init, which makes the implementation
    // details of selecting nodes and creating Eui collections
    // patchable in plugins.
    $ = function(selector, context){
        return eui.init(selector, context);
    }

    function extend(target, source, deep) {
        for (key in source)
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                    target[key] = {}
                if (isArray(source[key]) && !isArray(target[key]))
                    target[key] = []
                extend(target[key], source[key], deep)
            }
            else if (source[key] !== undefined) target[key] = source[key]
    }

    /**
     * 通过源对象扩展目标对象的属性，源对象属性将覆盖目标对象属性。
     *
     * 默认情况下为，复制为浅拷贝（浅复制）。如果第一个参数为true表示深度拷贝（深度复制）。
     *
     *      $.extend(target, [source, [source2, ...]])   ⇒ target
     *      $.extend(true, target, [source, ...])   ⇒ target
     *
     * @function
     * @name $.extend
     * @param {Object} target 目标对象
     * @returns {Object} 扩展后的目标对象
     * @example
     * var target = { one: 'patridge' },
     * source = { two: 'turtle doves' }
     *
     * $.extend(target, source)
     * //=> { one: 'patridge',
     * //     two: 'turtle doves' }
     */
    $.extend = function(target){
        var deep, args = slice.call(arguments, 1)
        if (typeof target == 'boolean') {
            deep = target
            target = args.shift()
        }
        args.forEach(function(arg){ extend(target, arg, deep) })
        return target
    }

    // `$.eui.qsa` is Eui's CSS selector implementation which
    // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
    // This method can be overriden in plugins.
    eui.qsa = function(element, selector){
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
            isSimple = simpleSelectorRE.test(nameOnly)
        return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
            ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
            (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
                slice.call(
                    isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
                        maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
                            element.getElementsByTagName(selector) : // Or a tag
                        element.querySelectorAll(selector) // Or it's not simple, and we need to query all
                )
    }

    function filtered(nodes, selector) {
        return selector == null ? $(nodes) : $(nodes).filter(selector)
    }

    /**
     * 检查父节点是否包含给定的dom节点，如果两者是相同的节点，则返回 false。
     *
     *      $.contains(parent, node)   ⇒ boolean
     *
     * @function
     * @name $.contains
     * @param {HTMLElement} parent 父节点
     * @param {HTMLElement} node 指定节点
     * @returns {Boolean}
     */
    $.contains = document.documentElement.contains ?
        function(parent, node) {
            return parent !== node && parent.contains(node)
        } :
        function(parent, node) {
            while (node && (node = node.parentNode))
                if (node === parent) return true
            return false
        }

    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg
    }

    function setAttribute(node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
    }

    // access className property while respecting SVGAnimatedString
    function className(node, value){
        var klass = node.className || '',
            svg   = klass && klass.baseVal !== undefined

        if (value === undefined) return svg ? klass.baseVal : klass
        svg ? (klass.baseVal = value) : (node.className = value)
    }

    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    function deserializeValue(value) {
        try {
            return value ?
            value == "true" ||
            ( value == "false" ? false :
                value == "null" ? null :
                    +value + "" == value ? +value :
                        /^[\[\{]/.test(value) ? $.parseJSON(value) :
                            value )
                : value
        } catch(e) {
            return value
        }
    }

    /**
     * 获取JavaScript 对象的类型。可能的类型有： null undefined boolean number string function array date regexp object error。
     *
     *      $.type(object)   ⇒ string
     *
     * 对于其它对象，它只是简单报告为“object”，如果你想知道一个对象是否是一个javascript普通对象，使用 [isPlainObject]{@link $#isPlainObject}。
     *
     * @function
     * @name $.type
     * @param {Object} object
     * @returns {String}
     */
    $.type = type

    /**
     * 如果object是function，则返回ture。
     *
     *      $.isFunction(object)   ⇒ boolean
     *
     * @function
     * @name $.isFunction
     * @param {Function} object
     * @returns {boolean}
     */
    $.isFunction = isFunction

    /**
     * 如果object参数是否为一个window对象，那么返回true。这在处理iframe时非常有用，
     * 因为每个iframe都有它们自己的window对象,使用常规方法obj === window校验这些objects的时候会失败。
     *
     *      $.isWindow(object)   ⇒ boolean
     *
     * @function
     * @name $.isWindow
     * @param {Window} object
     * @returns {boolean}
     */
    $.isWindow = isWindow

    /**
     * 判断一对象是否为数字，返回布尔值.
     *
     *      $.sNumeric(expression)   ⇒ boolean
     *
     * @function
     * @name $.isNumeric
     * @param {Number/String} object
     * @returns {boolean}
     */
    $.isNumeric = isNumeric

    /**
     * 如果object是array，则返回ture。
     *
     *      $.isArray(object)   ⇒ boolean
     *
     * @function
     * @name $.isArray
     * @param {Array} object
     * @returns {boolean}
     */
    $.isArray = isArray

    /**
     * 如果object是object，则返回ture。
     *
     *      $.isObject(object)   ⇒ boolean
     *
     * @function
     * @name $.isObject
     * @param {Object} object
     * @returns {boolean}
     */
    $.isObject = isObject

    /**
     * Returns true if the passed value is a JavaScript Date object, false otherwise.
     *
     * @function
     * @name $.isDate
     * @param {Object} object The object to test
     * @return {Boolean}
     */
    $.isDate = isDate

    /**
     * 测试对象是否是“纯粹”的对象，这个对象是通过 对象常量（"{}"） 或者 new Object 创建的，如果是，则返回true。
     *
     *      $.isPlainObject(object)   ⇒ boolean
     *
     * @function
     * @name $.isPlainObject
     * @param {Object} object
     * @returns {boolean}
     * @example
     * $.isPlainObject({})         // => true
     * $.isPlainObject(new Object) // => true
     * $.isPlainObject(new Date)   // => false
     * $.isPlainObject(window)     // => false
     */
    $.isPlainObject = isPlainObject

    /**
     * 判断指定参数是否是一个空对象。
     *
     * 所谓"空对象"，即不包括任何可枚举(自定义)的属性。简而言之，就是该对象没有属性可以通过`for...in`迭代。
     *
     *      $.isEmptyObject(object)   ⇒ boolean
     *
     * @function
     * @name $.isEmptyObject
     * @param {Object} object
     * @returns {boolean}
     * @example
     * $.isEmptyObject( { } ); // true
     * $.isEmptyObject( new Object() ); // true
     *
     * $.isEmptyObject( [ 0 ] ); // false
     * $.isEmptyObject( { name: "CodePlayer"} ); // false
     * $.isEmptyObject( { sayHi: function(){} } ); // false
     */
    $.isEmptyObject = function(obj) {
        var name
        for (name in obj) return false
        return true
    }

    /**
     * 返回数组中指定元素的索引值（注：以0为基数），如果没有找到该元素则返回-1。
     *
     *      $.inArray(element, array, [fromIndex])   ⇒ number
     *
     * 注：[fromIndex] 参数可选，表示从哪个索引值开始向后查找。
     *
     * @function
     * @name $.inArray
     * @param {String} elem 待检测元素
     * @param {Array} array 数组
     * @param {Number} [i] 开始索引
     * @returns {number}
     * @example
     * $.inArray("abc",["bcd","abc","edf","aaa"]);//=>1
     * $.inArray("abc",["bcd","abc","edf","aaa"],1);//=>1
     * $.inArray("abc",["bcd","abc","edf","aaa"],2);//=>-1
     */
    $.inArray = function(elem, array, i){
        return emptyArray.indexOf.call(array, elem, i)
    }

    $.qsa = function(selector, context) {
        context = context || document;
        return $.slice.call(classSelectorRE.test(selector) ? context.getElementsByClassName(RegExp.$1) : tagSelectorRE.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector));
    }

    $.ready = function(callback) {
        return $().ready(callback)
    }

    /**
     * 将一组字符串变成“骆驼”命名法的新字符串，如果该字符已经是“骆驼”命名法，则不变化。
     *
     *      $.camelCase(string) ⇒ string
     *
     * @function
     * @name $.camelCase
     * @param {String} str 字符串
     * @returns {String} 新字符串
     * @example
     * $.camelCase('hello-there') //=> "helloThere"
     * $.camelCase('helloThere')  //=> "helloThere"
     *
     */
    $.camelCase = camelize

    /**
     * 删除字符串首尾的空白符。类似String.prototype.trim()。
     *
     *      $.trim(string)   ⇒ string
     *
     * @function
     * @name $.trim
     * @param {String} str
     * @returns {string}
     */
    $.trim = function(str) {
        return str == null ? "" : String.prototype.trim.call(str)
    }

    // plugin compatibility
    $.uuid = 0
    $.data = {}
    $.support = { }
    $.expr = { }
    /**
     * 是否debug模式
     * @type {boolean}
     * @name #debug
     * @memberof Eui
     * @default true
     */
    $.debug = true

    //是否是APP应用场景
    $.isApp = true
    $.noop = function() {}

    /**
     * 提取这个数组array的子集，从start开始，如果给定end，提取从从start开始到end结束的元素，但是不包含end位置的元素。
     *
     *      slice(start, [end])   ⇒ array
     *
     * @function
     * @name $.slice
     * @param {Number} start
     * @param {Number} [end]
     * @returns {Array}
     */
    $.slice = slice
    $.filter = filter

    /**
     * 通过遍历集合中的元素，返回通过迭代函数的全部结果，（愚人码头注：一个新数组）null 和 undefined 将被过滤掉。
     *
     *      $.map(collection, function(item, index){ ... })   ⇒ collection
     *
     * @function
     * @name $.map
     * @param {Array} collection
     * @param {Function} func
     * @returns {Array}
     * @example
     * $.map([1,2,3,4,5],function(item,index){
     *  if(item>1){return item*item;}
     *  });
     * // =>[4, 9, 16, 25]
     *
     * $.map({"yao":1,"tai":2,"yang":3},function(item,index){
     * if(item>1){return item*item;}
     * });
     * // =>[4, 9]
     */
    $.map = function(elements, callback){
        var value, values = [], i, key
        if (likeArray(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i)
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback(elements[key], key)
                if (value != null) values.push(value)
            }
        return flatten(values)
    }

    /**
     * 遍历数组元素或以key-value值对方式遍历对象。回调函数返回 `false` 时停止遍历。
     *
     *      $.each(collection, function(index, item){ ... })   ⇒ collection
     *      $.each(obj, function(key, value){ ... })   ⇒ obj
     *
     * @function
     * @name $.each
     * @param {Array/Object} elements 可迭代对象
     * @param {Function} callback 回调函数，当`elements`为数组时，提供`index`,`item`两个参数；当为对象时，提供`key`,`value`两个参数.
     * @returns {Array/Object} 迭代后的值
     * @example
     * $.each(['a', 'b', 'c'], function(index, item){
     * console.log('item %d is: %s', index, item)
     * })
     *
     * var hash = { name: 'eui.js', size: 'micro' }
     * $.each(hash, function(key, value){
     * console.log('%s: %s', key, value)
     * })
     */
    $.each = function(elements, callback){
        var i, key
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements
        }

        return elements
    }

    /**
     * 获取焦点.
     *
     * @function
     * @name $.focus
     * @param {HTMLElement} element
     */
    $.focus = function(element) {
        if ($.os.ios) {
            setTimeout(function() {
                element.focus();
            }, 10);
        } else {
            element.focus();
        }
    }

    $.trigger = function(element, eventType, eventData) {
        element.dispatchEvent(new CustomEvent(eventType, {
            detail: eventData,
            bubbles: true,
            cancelable: true
        }));
        return this
    }

    /**
     * 获取目标元素的样式定义.
     *
     * @function
     * @name $.getStyles
     * @param {HTMLElement} element
     * @param {String} property
     * @returns {styles}
     */
    $.getStyles = function(element, property) {
        var styles = element.ownerDocument.defaultView.getComputedStyle(element, null);
        if (property) {
            return styles.getPropertyValue(property) || styles[property];
        }
        return styles;
    }

    /**
     * parseTranslate
     * @param {String} translateString
     * @param {String} position
     * @returns {Object}
     */
    $.parseTranslate = function(translateString, position) {
        var result = translateString.match(translateRE || '');
        if (!result || !result[1]) {
            result = ['', '0,0,0'];
        }
        result = result[1].split(",");
        result = {
            x: parseFloat(result[0]),
            y: parseFloat(result[1]),
            z: parseFloat(result[2])
        };
        if (position && result.hasOwnProperty(position)) {
            return result[position];
        }
        return result;
    }

    /**
     * parseTranslateMatrix
     * @param {type} translateString
     * @param {type} position
     * @returns {Object}
     */
    $.parseTranslateMatrix = function(translateString, position) {
        var matrix = translateString.match(translateMatrixRE);
        var is3D = matrix && matrix[1];
        if (matrix) {
            matrix = matrix[2].split(",");
            if (is3D === "3d")
                matrix = matrix.slice(12, 15);
            else {
                matrix.push(0);
                matrix = matrix.slice(4, 7);
            }
        } else {
            matrix = [0, 0, 0];
        }
        var result = {
            x: parseFloat(matrix[0]),
            y: parseFloat(matrix[1]),
            z: parseFloat(matrix[2])
        };
        if (position && result.hasOwnProperty(position)) {
            return result[position];
        }
        return result;
    }

    $.hooks = {};
    $.addAction = function(type, hook) {
        var hooks = $.hooks[type];
        if (!hooks) {
            hooks = [];
        }
        hook.index = hook.index || 1000;
        hooks.push(hook);
        hooks.sort(function(a, b) {
            return a.index - b.index;
        });
        $.hooks[type] = hooks;
        return $.hooks[type];
    };

    $.doAction = function(type, callback) {
        if ($.isFunction(callback)) { //指定了callback
            $.each($.hooks[type], callback);
        } else { //未指定callback，直接执行
            $.each($.hooks[type], function(index, hook) {
                return !hook.handle();
            });
        }
    };

    /**
     * setTimeout封装.
     *
     * @function
     * @name $.later
     *
     * @param {Object} fn
     * @param {Number} when
     * @param {Object} context
     * @param {Object/Array} data
     */
    $.later = function(fn, when, context, data) {
        when = when || 0;
        var m = fn;
        var d = data;
        var f;
        var r;

        if (typeof fn === 'string') {
            m = context[fn];
        }

        f = function() {
            m.apply(context, $.isArray(d) ? d : [d]);
        };

        r = setTimeout(f, when);

        return {
            id: r,
            cancel: function() {
                clearTimeout(r);
            }
        };
    }

    /**
     * 返回当前时间。
     *
     * @function
     * @name $.now
     * @returns {Date}
     */
    $.now = Date.now || function() {
        return +new Date();
    }

    /**
     * 获取一个新数组，新数组只包含回调函数中返回 ture 的数组项。
     *
     *      $.grep(items, function(item){ ... })   ⇒ array
     *
     * @function
     * @name $.grep
     * @param {Array} elements 数组
     * @param {Function} callback
     * @param {Function} callback.item 数组项
     * @returns {Array} 新数组
     * @example
     * $.grep([1,2,3],function(item){
     *   return item > 1
     * });//=>[2,3]
     */
    $.grep = function(elements, callback){
        return filter.call(elements, callback)
    }

    /**
     * 原生JSON.parse方法的别名。（注：接受一个标准格式的 JSON 字符串，并返回解析后的 JavaScript 对象。）
     *
     *      $.parseJSON(string)   ⇒ object
     *
     * @function
     * @name $.parseJSON
     * @param {String} str
     * @returns {Object}
     */

    if (window.JSON) $.parseJSON = JSON.parse

    // Populate the class2type map
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase()
    })

    /**
     * eui.fn是一个对象，它拥有Eui对象上所有可用的方法，如 addClass()， attr()，和其它方法。在这个对象添加一个方法，所有的Eui对象上都能用到该方法。
     *
     * 这里有一个实现 Eui 的 empty() 方法的例子：
     *
     *      $.fn.empty = function(){
     *          return this.each(function(){ this.innerHTML = '' })
     *      }
     *
     * @namespace
     * @name $.fn
     */
    $.fn = {
        constructor: eui.E,
        length: 0,

        // Because a collection acts like an array
        // copy over these useful array functions.

        /**
         * 遍历对象集合中每个元素，有点类似 each，但是遍历函数的参数不一样，当函数返回 false 的时候，遍历不会停止。
         *
         *      forEach(function(item, index, array){ ... }, [context])
         *
         * @function
         * @name $.fn#forEach
         * @param {Function} function
         */
        forEach: emptyArray.forEach,

        /**
         * 与 [Array.reduce]{@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce}有相同的用法，遍历当前对象集合。memo是函数上次的返回值。迭代进行遍历。
         *
         *      reduce(function(memo, item, index, array){ ... }, [initial])   ⇒ value
         *
         * @function
         * @name $.fn#reduce
         * @param {Function} function
         */
        reduce: emptyArray.reduce,

        /**
         * 添加元素到当前对象集合的最后。
         *
         *      push(element, [element2, ...])   ⇒ self
         *
         * @function
         * @name $.fn#push
         * @param {Element/String} element
         */
        push: emptyArray.push,

        sort: emptyArray.sort,

        splice: emptyArray.splice,

        /**
         * 在当前对象集合中获取一个元素的索引值（注：从0开始计数）。如果给定formindex参数，
         * 从该位置开始往后查找，返回基于0的索引值，如果没找到，则返回-1。index 方法是基于这个方法实现的。
         *
         *      indexOf(element, [fromIndex])   ⇒ number
         *
         * @function
         * @name $.fn#indexOf
         * @param {String} element
         * @param {Number} [fromIndex]
         * @returns {Number}
         */
        indexOf: emptyArray.indexOf,

        /**
         * 添加元素到一个Eui对象集合形成一个新数组。如果参数是一个数组，那么这个数组中的元素将会合并到Eui对象集合中。
         *
         *      concat(nodes, [node2, ...])   ⇒ self
         *
         * @function
         * @name $.fn#concat
         * @param {Array} nodes
         * @param {Array} [node2]
         * @returns {Array}
         */
        concat: function(){
            var i, value, args = []
            for (i = 0; i < arguments.length; i++) {
                value = arguments[i]
                args[i] = eui.isE(value) ? value.toArray() : value
            }
            return concat.apply(eui.isE(this) ? this.toArray() : this, args)
        },

        /**
         * 遍历对象集合中的所有元素。通过遍历函数返回值形成一个新的集合对象。
         * 在遍历函数中this关键之指向当前循环的项（遍历函数中的第二个参数）。
         *
         * 遍历中返回 null和undefined，遍历将结束。
         *
         *      map(function(index, item){ ... })   ⇒ collection
         *
         * @function
         * @name $.fn#map
         * @param {Function} func
         * @returns {Array}
         * @example
         * // get text contents of all elements in collection
         * elements.map(function(){ return $(this).text() }).get().join(', ')
         */
        map: function(fn){
            return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
        },

        /**
         * 提取这个数组array的子集，从`start`开始，如果给定`end`，提取从`start`开始到`end`结束的元素，但是不包含`end`位置的元素。
         *
         *      slice(start, [end])   ⇒ array
         *
         * @function
         * @name $.fn#slice
         * @param {Number} start
         * @param {Number} [end]
         * @returns {Array}
         */
        slice: function(){
            return $(slice.apply(this, arguments))
        },

        /**
         * 添加一个事件侦听器，当页面DOM加载完毕 “DOMContentLoaded” 事件触发时触发。建议使用 $()来代替这种用法。
         *
         *      ready(function($){ ... })   ⇒ self
         *
         * @function
         * @name $.fn#ready
         * @param {Function} callback
         * @returns {self}
         */
        ready : function(callback){
            // need to check if document.body exists for IE as that browser reports
            // document ready when it hasn't yet created the body element
            if (readyRE.test(document.readyState) && document.body) callback($)
            else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
            return this
        },

        /**
         * 从当前对象集合中获取所有元素或单个元素。当index参数不存在的时，以普通数组的方式返回所有的元素。
         * 当指定index时，只返回该置的元素。这点与[eq]{@link $.fn#eq}不同，该方法返回的是DOM节点，不是Eui对象集合。
         *
         *      get()   ⇒ array
         *      get(index)   ⇒ DOM node
         *
         * @function
         * @name $.fn#get
         * @param {Number} [idx] 索引值
         * @returns {Array.<T>}
         * @example
         * var elements = $('h2')
         * elements.get()   //=> get all headings as an array
         * elements.get(0)  //=> get first heading node
         */
        get: function(idx){
            return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
        },

        toArray: function(){ return this.get() },

        /**
         * 获取对象集合中元素的数量。
         *
         *      size()   ⇒ number
         *
         * @function
         * @name $.fn#size
         * @returns {number}
         */
        size: function(){
            return this.length
        },

        /**
         * 从其父节点中删除当前集合中的元素，有效的从dom中移除。
         *
         * @function
         * @name $.fn#remove
         *
         * @returns {self}
         */
        remove: function(){
            return this.each(function(){
                if (this.parentNode != null)
                    this.parentNode.removeChild(this)
            })
        },

        /**
         * 遍历一个对象集合每个元素。在迭代函数中，this关键字指向当前项(作为函数的第二个参数传递)。
         * 如果迭代函数返回 false，遍历结束。
         *
         *      each(function(index, item){ ... })   ⇒ self
         *
         * @function
         * @name $.fn#each
         * @param {Function} func 回调函数
         * @param {Number} func.index 索引序号
         * @param {Element} func.item 数组元素项
         * @returns {self}
         * @example
         * $('form input').each(function(index){
         *     console.log('input %d is: %o', index, this)
         * })
         */
        each: function(callback){
            emptyArray.every.call(this, function(el, idx){
                return callback.call(el, idx, el) !== false
            })
            return this
        },

        /**
         * 过滤对象集合，返回对象集合中满足css选择器的项。如果参数为一个函数，
         * 函数返回有实际值得时候，元素才会被返回。在函数中， this 关键字指向当前的元素。
         *
         *      filter(selector)   ⇒ collection
         *      filter(function(index){ ... })   ⇒ collection
         *
         * 与此相反的功能，查看[not]{@link $.fn#not}.
         *
         * @function
         * @name $.fn#filter
         * @param {selector} [selector] 选择器表达式
         * @param {Function} [function] 函数
         * @returns {collection}
         *
         */
        filter: function(selector){
            if (isFunction(selector)) return this.not(this.not(selector))
            return $(filter.call(this, function(element){
                return eui.matches(element, selector)
            }))
        },

        /**
         *
         * 添加元素到当前匹配的元素集合中。如果给定content参数，将只在content元素中进行查找，
         * 否则在整个document中查找.
         *
         *      add(selector, [context])   ⇒ self
         *
         * 示例：
         *
         *      <ul>
         *          <li>list item 1</li>
         *          <li>list item 2</li>
         *          <li>list item 3</li>
         *      </ul>
         *      <p>a paragraph</p>
         *
         *      <script type="text/javascript">
         *          $('li').add('p').css('background-color', 'red');
         *      </script>
         *
         * @function
         * @name $.fn#add
         * @param {String} selector 选择器表达式
         * @param {HTMLElement} [context] 上下文
         * @returns {self}
         */
        add: function(selector,context){
            return $(uniq(this.concat($(selector,context))))
        },

        /**
         * 判断当前元素集合中的第一个元素是否符css选择器。
         * 对于基础支持jquery的非标准选择器类似： :visible包含在可选的“selector”模块中。
         *
         *      is(selector)   ⇒ boolean
         *
         * @function
         * @name $.fn#is
         * @param {String} selector
         * @returns {boolean}
         */
        is: function(selector){
            return this.length > 0 && eui.matches(this[0], selector)
        },

        /**
         * 过滤当前对象集合，获取一个新的对象集合，它里面的元素不能匹配css选择器。
         * 如果另一个参数为Eui对象集合，那么返回的新Eui对象中的元素都不包含在该参数对象中。
         * 如果参数是一个函数。仅仅包含函数执行为false值得时候的元素，函数的 this 关键字指向当前循环元素。
         *
         * 与它相反的功能，查看 [filter]{@link $.fn#filter}.
         *
         *     not(selector)   ⇒ collection
         *     not(collection)   ⇒ collection
         *     not(function(index){ ... })   ⇒ collection
         *
         * @function
         * @name $.fn#not
         * @param {String} [selector] 选择器表达式
         * @param {collection} [collection] 对象集合
         * @param {Function} [function] 函数
         * @returns {self}
         */
        not: function(selector){
            var nodes=[]
            if (isFunction(selector) && selector.call !== undefined)
                this.each(function(idx){
                    if (!selector.call(this,idx)) nodes.push(this)
                })
            else {
                var excludes = typeof selector == 'string' ? this.filter(selector) :
                    (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
                this.forEach(function(el){
                    if (excludes.indexOf(el) < 0) nodes.push(el)
                })
            }
            return $(nodes)
        },

        /**
         * 判断当前对象集合的子元素是否有符合选择器的元素，或者是否包含指定的DOM节点，
         * 如果有，则返回新的对象集合，该对象过滤掉不含有选择器匹配元素或者不含有指定DOM节点的对象。
         *
         *      has(selector)   ⇒ collection
         *      has(node)   ⇒ collection
         *
         * @function
         * @name $.fn#has
         * @param {String} [selector] 选择器表达式
         * @param {HTMLElement} [node] 指定DOM元素
         * @returns {self}
         * @example
         * $('ol > li').has('a[href]')
         * //=> get only LI elements that contain links
         */
        has: function(selector){
            return this.filter(function(){
                return isObject(selector) ?
                    $.contains(this, selector) :
                    $(this).find(selector).size()
            })
        },

        /**
         * 从当前对象集合中获取给定索引值（注：以0为基数）的元素。
         *
         *      eq(index)   ⇒ collection
         *
         * @function
         * @name $.fn#eq
         * @param {Number} index 索引值,从`0`开始.
         * @returns {collection}
         *
         * @example
         * $('li').eq(0)   //=> only the first list item
         * $('li').eq(-1)  //=> only the last list item
         */
        eq: function(idx){
            return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
        },

        /**
         * 获取当前对象集合中的第一个元素。
         *
         *      first()   ⇒ collection
         *
         * @function
         * @name $.fn#first
         * @returns {collection}
         *
         * @example
         * $('form').first()
         */
        first: function(){
            var el = this[0]
            return el && !isObject(el) ? el : $(el)
        },

        /**
         * 获取对象集合中最后一个元素。
         *
         *      last()   ⇒ collection
         *
         * @function
         * @name $.fn#last
         * @returns {collection}
         *
         * @example
         * $('li').last()
         */
        last: function(){
            var el = this[this.length - 1]
            return el && !isObject(el) ? el : $(el)
        },

        /**
         * 在当对象前集合内查找符合CSS选择器的每个元素的后代元素。
         *
         * 如果给定Eui对象集合或者元素，过滤它们，只有当它们在当前Eui集合对象中时，才回被返回。
         *
         *      find(selector)   ⇒ collection
         *      find(collection)   ⇒ collection
         *      find(element)   ⇒ collection
         *
         * @function
         * @name $.fn#find
         * @param {String} [selector] 选择器表达式
         * @param {collection} [collection] 集合对象
         * @param {HTMLElement} [element] 元素
         * @returns {collection}
         *
         * @example
         * var form = $('#myform')
         * form.find('input, select')
         */
        find: function(selector){
            var result, $this = this
            if (!selector) result = $()
            else if (typeof selector == 'object')
                result = $(selector).filter(function(){
                    var node = this
                    return emptyArray.some.call($this, function(parent){
                        return $.contains(parent, node)
                    })
                })
            else if (this.length == 1) result = $(eui.qsa(this[0], selector))
            else result = this.map(function(){ return eui.qsa(this, selector) })
            return result
        },

        /**
         * 从元素本身开始，逐级向上级元素匹配，并返回最先匹配selector的元素。如果给定context节点参数，
         * 那么只匹配该节点的后代元素。
         * 这个方法与 [parents(selector)]{@link $.fn#parents}有点相像，但它只返回最先匹配的祖先元素。
         *
         * 如果参数是一个Eui对象集合或者一个元素，结果必须匹配给定的元素而不是选择器。
         *
         *      closest(selector, [context])   ⇒ collection
         *      closest(collection)   ⇒ collection
         *      closest(element)   ⇒ collection
         *
         * @function
         * @name $.fn#closest
         * @param {String} [selector] 选择器表达式
         * @param {collection} [collection] 集合对象
         * @param {HTMLElement} [element] 元素
         * @returns {collection}
         *
         * @example
         * var input = $('input[type=text]')
         * input.closest('form')
         */
        closest: function(selector, context){
            var node = this[0], collection = false
            if (typeof selector == 'object') collection = $(selector)
            while (node && !(collection ? collection.indexOf(node) >= 0 : eui.matches(node, selector)))
                node = node !== context && !isDocument(node) && node.parentNode
            return $(node)
        },

        /**
         * 获取对象集合每个元素所有的祖先元素。如果css选择器参数给出，过滤出符合条件的元素。
         *
         * 如果想获取直接父级元素，使用 [parent]{@$.fn#parent}。如果只想获取到第一个符合css选择器的元素，使用[closest]{@link $.fn#closest}。
         *
         *     parents([selector])   ⇒ collection
         *
         * @function
         * @name $.fn#parents
         * @param {String} [selector] 选择器表达式
         * @returns {collection}
         *
         * @example
         * $('h1').parents()   //=> [`<div#container>, <body>, <html>`]
         */
        parents: function(selector){
            var ancestors = [], nodes = this
            while (nodes.length > 0)
                nodes = $.map(nodes, function(node){
                    if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node)
                        return node
                    }
                })
            return filtered(ancestors, selector)
        },

        /**
         * 获取对象集合中每个元素的直接父元素。如果css选择器参数给出。过滤出符合条件的元素。
         *
         *      parent([selector])   ⇒ collection
         *
         * @function
         * @name $.fn#parent
         * @param {String} [selector] 选择器表达式
         * @returns {collection}
         */
        parent: function(selector){
            return filtered(uniq(this.pluck('parentNode')), selector)
        },

        /**
         * 获得每个匹配元素集合元素的直接子元素，如果给定selector，那么返回的结果中只包含符合css选择器的元素。
         *
         *      children([selector])   ⇒ collection
         *
         * @function
         * @name $.fn#children
         * @param {String} [selector] 选择器表达式
         * @returns {collection}
         *
         * @example
         * $('ol').children('*:nth-child(2n)')
         * //=> every other list item from every ordered list
         */
        children: function(selector){
            return filtered(this.map(function(){ return children(this) }), selector)
        },

        /**
         * 获得每个匹配元素集合元素的子元素，包括文字和注释节点。
         * （注：.contents()和.children()方法类似，只不过前者包括文本节点以及jQuery对象中产生的HTML元素。）
         *
         *      contents()   ⇒ collection
         *
         * @function
         * @name $.fn#contents
         * @returns {Array}
         */
        contents: function() {
            return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
        },

        /**
         * 获取对象集合中所有元素的兄弟节点。如果给定CSS选择器参数，过滤出符合选择器的元素。
         *
         *      siblings([selector])   ⇒ collection
         *
         * @function
         * @name $.fn#siblings
         * @param {String} [selector] 选择器表达式
         * @returns {collection}
         */
        siblings: function(selector){
            return filtered(this.map(function(i, el){
                return filter.call(children(el.parentNode), function(child){ return child!==el })
            }), selector)
        },

        /**
         * 清空对象集合中每个元素的DOM内容。
         *
         *      empty()   ⇒ self
         *
         * @function
         * @name $.fn#empty
         * @returns {self}
         */
        empty: function(){
            return this.each(function(){ this.innerHTML = '' })
        },

        /**
         * 获取对象集合中每一个元素的属性值。返回值为 null或undefined值得过滤掉。
         *
         *     pluck(property)   ⇒ array
         *
         * @function
         * @name $.fn#pluck
         * @param {String} property 属性名称
         * @returns {Array}
         * @example
         * $('body > *').pluck('nodeName') // => ["DIV", "SCRIPT"]
         * // implementation of Eui's `next` method
         * $.fn.next = function(){
         *  return $(this.pluck('nextElementSibling'))
         * }
         */
        pluck: function(property){
            return $.map(this, function(el){ return el[property] })
        },

        /**
         * 恢复对象集合中每个元素默认的“display”值。如果你用[hide]{@link $.fn#hide}将元素隐藏，
         * 用该属性可以将其显示。相当于去掉了display：none。
         *
         *      show()   ⇒ self
         *
         * @function
         * @name $.fn#show
         * @returns {self}
         */
        show: function(){
            return this.each(function(){
                this.style.display == "none" && (this.style.display = '')
                if (getComputedStyle(this, '').getPropertyValue("display") == "none")
                    this.style.display = defaultDisplay(this.nodeName)
            })
        },

        /**
         * 用给定的内容替换所有匹配的元素。(包含元素本身)。content参数可以为 [before]{@link $.fn#before}中描述的类型。
         *
         *      replaceWith(content)   ⇒ self
         *
         * @function
         * @name $.fn#replaceWith
         * @param {String} newContent
         * @returns {self}
         */
        replaceWith: function(newContent){
            return this.before(newContent).remove()
        },

        /**
         * 在每个匹配的元素外层包上一个html元素。structure参数可以是一个单独的元素或者一些嵌套的元素。
         *
         *      wrap(structure)   ⇒ self
         *      wrap(function(index){ ... })   ⇒ self v1.0+
         *
         * 也可以是一个html字符串片段或者dom节点。
         * 还可以是一个生成用来包元素的回调函数，这个函数返回前两种类型的包裹片段。
         *
         * 需要提醒的是：该方法对于dom中的节点有着很好的支持。
         * 如果将wrap() 用在一个新的元素上，然后再将结果插入到document中，此时该方法无效。
         *
         *      // wrap each button in a separate span:
         *      $('.buttons a').wrap('<span>')
         *
         *      // wrap each code block in a div and pre:
         *      $('code').wrap('<div class=highlight><pre /></div>')
         *      // wrap all form inputs in a span with classname
         *      // corresponding to input type:
         *      $('input').wrap(function(index){
         *          return '<span class=' + this.type + 'field />'
         *      })
         *      //=> <span class=textfield><input type=text /></span>,
         *      //   <span class=searchfield><input type=search /></span>
         *
         *      // WARNING: will not work as expected!
         *      $('<em>broken</em>').wrap('<li>').appendTo(document.body)
         *      // do this instead:
         *      $('<em>better</em>').appendTo(document.body).wrap('<li>')
         *
         * @function
         * @name $.fn#wrap
         * @param {HTMLElement/Function} structure
         * @returns {self}
         */
        wrap: function(structure){
            var func = isFunction(structure)
            if (this[0] && !func)
                var dom   = $(structure).get(0),
                    clone = dom.parentNode || this.length > 1

            return this.each(function(index){
                $(this).wrapAll(
                    func ? structure.call(this, index) :
                        clone ? dom.cloneNode(true) : dom
                )
            })
        },

        /**
         * 在所有匹配元素外面包一个单独的结构。结构可以是单个元素或 几个嵌套的元素，并且可以通过在作为HTML字符串或DOM节点。
         *
         *      wrapAll(structure)   ⇒ self
         *
         * 示例：
         *
         *     // wrap all buttons in a single div:
         *      $('a.button').wrapAll('<div id=buttons />')
         *
         * @function
         * @name $.fn#wrapAll
         *
         * @param {HTMLElement} structure
         * @returns {self}
         */
        wrapAll: function(structure){
            if (this[0]) {
                $(this[0]).before(structure = $(structure))
                var children
                // drill down to the inmost element
                while ((children = structure.children()).length) structure = children.first()
                $(structure).append(this)
            }
            return this
        },

        /**
         * 将每个元素中的内容包裹在一个单独的结构中。结构可以是单个元件或多个嵌套元件，并且可以通过在作为HTML字符串或DOM节点，
         * 或者是一个生成用来包元素的回调函数，这个函数返回前两种类型的包裹片段。
         *
         *      wrapInner(structure)   ⇒ self
         *      wrapInner(function(index){ ... })   ⇒ self
         *
         * 示例：
         *
         *      // wrap the contents of each navigation link in a span:
         *      $('nav a').wrapInner('<span>')
         *      // wrap the contents of each list item in a paragraph and emphasis:
         *      $('ol li').wrapInner('<p><em /></p>')
         *
         * @function
         * @name $.fn#wrapInner
         *
         * @param {HTMLElement} structure
         * @returns {self}
         */
        wrapInner: function(structure){
            var func = isFunction(structure)
            return this.each(function(index){
                var self = $(this), contents = self.contents(),
                    dom  = func ? structure.call(this, index) : structure
                contents.length ? contents.wrapAll(dom) : self.append(dom)
            })
        },

        /**
         * 移除集合中每个元素的直接父节点，并把他们的子元素保留在原来的位置。 基本上，这种方法删除上一的祖先元素，同时保持DOM中的当前元素。
         *
         *      unwrap()   ⇒ self
         *
         * @function
         * @name $.fn#unwrap
         * @returns {self}
         * @example
         * (document.body).append(`'<div id=wrapper><p>Content</p></div>'`)
         * $('#wrapper p').unwrap().parents()  //=> `[<body>, <html>]`
         */
        unwrap: function(){
            this.parent().each(function(){
                $(this).replaceWith($(this).children())
            })
            return this
        },

        /**
         * 通过深度克隆来复制集合中的所有元素。
         *
         *     clone()   ⇒ collection
         *
         *  此方法不会将数据和事件处理程序复制到新的元素。这点和jquery中利用一个参数来确定是否复制数据和事件处理不相同。
         *
         * @function
         * @name $.fn#clone
         * @returns {Array}
         */
        clone: function(){
            return this.map(function(){ return this.cloneNode(true) })
        },

        /**
         * 通过设置css的属性display 为 none来将对象集合中的元素隐藏。
         *
         *      hide()   ⇒ self
         *
         * @function
         * @name $.fn#hide
         * @returns {self}
         */
        hide: function(){
            return this.css("display", "none")
        },

        /**
         * 显示或隐藏匹配元素。如果 setting为true，相当于[show]{@link $.fn#show} 法。如果setting为false。相当于[hide]{@link $.fn#hide}方法。
         *
         * @function
         * @name $.fn#toggle
         * @returns {self}
         *
         * @example
         * var input = $('input[type=text]')
         * $('#too_long').toggle(input.val().length > 140)
         */
        toggle: function(setting){
            return this.each(function(){
                var el = $(this)
                    ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
            })
        },

        /**
         * 获取对象集合中每一个元素的前一个兄弟节点，通过选择器来进行过滤.
         *
         *      prev()   ⇒ collection
         *      prev(selector)   ⇒ collection

         * @function
         * @name $.fn#prev
         * @returns {Array}
         */
        prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },

        /**
         * 获取对象集合中每一个元素的下一个兄弟节点(可以选择性的带上过滤选择器)。
         *
         *      next()   ⇒ collection
         *      next(selector)   ⇒ collection
         *
         * @function
         * @name $.fn#next
         * @returns {Array}
         * @example
         * $('dl dt').next()   //=> the DD elements
         */
        next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },

        /**
         * 获取或设置对象集合中元素的HTML内容。当没有给定content参数时，返回对象集合中第一个元素的innerHtml。
         * 当给定content参数时，用其替换对象集合中每个元素的内容。content可以是append中描述的所有类型。
         *
         *      html()   ⇒ string
         *      html(content)   ⇒ self
         *      html(function(index, oldHtml){ ... })   ⇒ self
         *
         * @function
         * @name $.fn#html
         * @param {String} [content]
         * @param {Function} [func]
         * @returns {self}
         * @example
         * // autolink everything that looks like a Twitter username
         * $('.comment p').html(function(idx, oldHtml){
         *  return oldHtml.replace(/(^|\W)@(\w{1,15})/g,
         * '$1@<a href="http://twitter.com/$2">$2</a>')
         * })
         */
        html: function(html){
            return 0 in arguments ?
                this.each(function(idx){
                    var originHtml = this.innerHTML
                    $(this).empty().append( funcArg(this, html, idx, originHtml) )
                }) :
                (0 in this ? this[0].innerHTML : null)
        },

        /**
         * 获取或者设置所有对象集合中元素的文本内容。当没有给定content参数时，
         * 返回当前对象集合中第一个元素的文本内容（包含子节点中的文本内容）。当给定content参数时，
         * 使用它替换对象集合中所有元素的文本内容。它有待点似 {@link $.fn#html html}，与它不同的是它不能用来获取或设置 HTML。
         *
         *      text()   ⇒ string
         *      text(content)   ⇒ self
         *      text(function(index, oldText){ ... })   ⇒ self
         *
         * @function
         * @name $.fn#text
         * @param {String/Function} [text]
         * @returns {String/self}
         */
        text: function(text){
            return 0 in arguments ?
                this.each(function(idx){
                    var newText = funcArg(this, text, idx, this.textContent)
                    this.textContent = newText == null ? '' : ''+newText
                }) :
                (0 in this ? this[0].textContent : null)
        },

        /**
         * 读取或设置dom的属性。如果没有给定value参数，则读取对象集合中第一个元素的属性值。
         * 当给定了value参数。则设置对象集合中所有元素的该属性的值。当value参数为null，
         * 那么这个属性将被移除(类似removeAttr)，多个属性可以通过对象键值对的方式进行设置。
         *
         * 要读取DOM的属性如 checked和selected, 使用 prop。
         *
         *      attr(name)   ⇒ string
         *      attr(name, value)   ⇒ self
         *      attr(name, function(index, oldValue){ ... })   ⇒ self
         *      attr({ name: value, name2: value2, ... })   ⇒ self
         *
         * @function
         * @name $.fn#attr
         * @param {String} name 属性名称
         * @param {String/Function} value 属性值
         * @returns {String/self}
         * @example
         * var form = $('form')
         * form.attr('action')             //=> 读取值
         * form.attr('action', '/create')  //=> 设置值
         * form.attr('action', null)       //=> 移除属性
         *
         * // 多个属性:
         * form.attr({
         *   action: '/create',
         *   method: 'post'
         *  })
         *
         */
        attr: function(name, value){
            var result
            return (typeof name == 'string' && !(1 in arguments)) ?
                (!this.length || this[0].nodeType !== 1 ? undefined :
                    (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
                ) :
                this.each(function(idx){
                    if (this.nodeType !== 1) return
                    if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
                    else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
                })
        },

        /**
         * 移除当前对象集合中所有元素的指定属性。
         *
         *      removeAttr(name)   ⇒ self
         *
         * @function
         * @name $.fn#removeAttr
         * @param {String} name 属性名
         * @returns {self}
         */
        removeAttr: function(name){
            return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
                setAttribute(this, attribute)
            }, this)})
        },

        /**
         * 读取或设置dom元素的属性值。它在读取属性值的情况下优先于 [attr]{@link $.fn#attr}，
         * 因为这些属性值会因为用户的交互发生改变，如`checked` 和 `selected`。
         *
         *      prop(name)   ⇒ value
         *      prop(name, value)   ⇒ self
         *      prop(name, function(index, oldValue){ ... })   ⇒ self
         *
         * 简写或小写名称，比如`for`, `class`, `readonly`及类似的属性，将被映射到实际的属性上，
         * 比如`htmlFor`, `className`, `readOnly` 等等。
         *
         * @function
         * @name $.fn#prop
         * @param {String} name 属性名称
         * @param {String/Function} value
         * @returns {self}
         */
        prop: function(name, value){
            name = propMap[name] || name
            return (1 in arguments) ?
                this.each(function(idx){
                    this[name] = funcArg(this, value, idx, this[name])
                }) :
                (this[0] && this[0][name])
        },

        data: function(name, value){
            var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

            var data = (1 in arguments) ?
                this.attr(attrName, value) :
                this.attr(attrName)

            return data !== null ? deserializeValue(data) : undefined
        },

        /**
         * 获取或设置匹配元素的值。当没有给定value参数，返回第一个元素的值。如果是`<select multiple>`标签，则返回一个数组。
         * 当给定value参数，那么将设置所有元素的值。
         *
         *      val()   ⇒ string
         *      val(value)   ⇒ self
         *      val(function(index, oldValue){ ... })   ⇒ self
         *
         * @function
         * @name $.fn#val
         * @param {String/Function} [value]
         * @returns {string/self}
         */
        val: function(value){
            return 0 in arguments ?
                this.each(function(idx){
                    this.value = funcArg(this, value, idx, this.value)
                }) :
                (this[0] && (this[0].multiple ?
                    $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
                    this[0].value)
                )
        },

        /**
         * 获得当前元素相对于document的位置。返回一个对象含有： `top`, `left`, `width`和`height`
         *
         * 当给定一个含有`left`和`top`属性对象时，使用这些值来对集合中每一个元素进行相对于document的定位。
         *
         *      offset()   ⇒ object
         *      offset(coordinates)   ⇒ self
         *      offset(function(index, oldOffset){ ... })   ⇒ self
         *
         * @function
         * @name $.fn#offset
         * @param {Object} coordinates
         * @returns {Object/self}
         */
        offset: function(coordinates){
            if (coordinates) return this.each(function(index){
                var $this = $(this),
                    coords = funcArg(this, coordinates, index, $this.offset()),
                    parentOffset = $this.offsetParent().offset(),
                    props = {
                        top:  coords.top  - parentOffset.top,
                        left: coords.left - parentOffset.left
                    }

                if ($this.css('position') == 'static') props['position'] = 'relative'
                $this.css(props)
            })
            if (!this.length) return null
            if (!$.contains(document.documentElement, this[0]))
                return {top: 0, left: 0}
            var obj = this[0].getBoundingClientRect()
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            }
        },

        /**
         * 读取或设置DOM元素的css属性。当value参数不存在的时候，返回对象集合中第一个元素的css属性。当value参数存在时，设置对象集合中每一个元素的对应css属性。
         *
         * 多个属性可以通过传递一个属性名组成的数组一次性获取。多个属性可以利用对象键值对的方式进行设置。
         *
         * 当value为空(空字符串，null 或 undefined)，那个css属性将会被移出。当value参数为一个无单位的数字，如果该css属性需要单位，“px”将会自动添加到该属性上。
         *
         *      css(property)   ⇒ value
         *      css([property1, property2, ...])   ⇒ object
         *      css(property, value)   ⇒ self
         *      css({ property: value, property2: value2, ... })   ⇒ self

         * @function
         * @name $.fn#css
         * @param {String} property
         * @param {String} value
         * @returns {Object/self}
         * @example
         * var elem = $('h1')
         * elem.css('background-color')          // read property
         * elem.css('background-color', '#369')  // set property
         * elem.css('background-color', '')      // remove property
         *
         * // set multiple properties:
         * elem.css({ backgroundColor: '#8EE', fontSize: 28 })
         *
         * // read multiple properties:
         * elem.css(['backgroundColor', 'fontSize'])['fontSize']
         */
        css: function(property, value){
            if (arguments.length < 2) {
                var computedStyle, element = this[0]
                if(!element) return
                computedStyle = getComputedStyle(element, '')
                if (typeof property == 'string')
                    return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
                else if (isArray(property)) {
                    var props = {}
                    $.each(property, function(_, prop){
                        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
                    })
                    return props
                }
            }

            var css = ''
            if (type(property) == 'string') {
                if (!value && value !== 0)
                    this.each(function(){ this.style.removeProperty(dasherize(property)) })
                else
                    css = dasherize(property) + ":" + maybeAddPx(property, value)
            } else {
                for (key in property)
                    if (!property[key] && property[key] !== 0)
                        this.each(function(){ this.style.removeProperty(dasherize(key)) })
                    else
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
            }

            return this.each(function(){ this.style.cssText += ';' + css })
        },

        /**
         * 获取一个元素的索引值（注：从0开始计数）。当elemen参数没有给出时，返回当前元素在兄弟节点中的位置。
         * 当element参数给出时，返回它在当前对象集合中的位置。如果没有找到该元素，则返回-1。
         *
         *      index([element])   ⇒ number
         *
         * @function
         * @name $.fn#index
         * @param {Object} [element]
         * @returns {Number}
         * @example
         * $('li:nth-child(2)').index()  //=> 1
         */
        index: function(element){
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
        },

        /**
         * 检查对象集合中是否有元素含有指定的class。
         *
         *      hasClass(name)   ⇒ boolean
         *
         * 示例：
         *
         *      <ul>
         *           <li>list item 1</li>
         *           <li class="yaotaiyang">list item 2</li>
         *           <li>list item 3</li>
         *       </ul>
         *       <p>a paragraph</p>
         *
         *       <script type="text/javascript">
         *         $("li").hasClass("yaotaiyang");
         *         //=> true
         *        </script>
         *
         * @function
         * @name $.fn#hasClass
         * @param {String} name 样式名称
         * @returns {boolean} 是否包含
         *
         */
        hasClass: function(name){
            if (!name) return false
            return emptyArray.some.call(this, function(el){
                return this.test(className(el))
            }, classRE(name))
        },

        /**
         * 为每个匹配的元素添加指定的class类名。多个class类名使用空格分隔。
         *
         *      addClass(name)   ⇒ self
         *      addClass(function(index, oldClassName){ ... })   ⇒ self
         *
         * @function
         * @name $.fn#addClass
         * @param {String/Function} name 多个class类名
         * @returns {self}
         */
        addClass: function(name){
            if (!name) return this
            return this.each(function(idx){
                if (!('className' in this)) return
                classList = []
                var cls = className(this), newName = funcArg(this, name, idx, cls)
                newName.split(/\s+/g).forEach(function(klass){
                    if (!$(this).hasClass(klass)) classList.push(klass)
                }, this)
                classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
            })
        },

        /**
         * 移除当前对象集合中所有元素的指定class。如果没有指定name参数，将移出所有的class。
         * 多个class参数名称可以利用空格分隔。下例移除了两个class。
         *
         *      removeClass([name])   ⇒ self
         *      removeClass(function(index, oldClassName){ ... })   ⇒ self
         *
         * @function
         * @name $.fn#removeClass
         * @param {String/Function} [name] 多个class类名
         * @returns {self}
         */
        removeClass: function(name){
            return this.each(function(idx){
                if (!('className' in this)) return
                if (name === undefined) return className(this, '')
                classList = className(this)
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
                    classList = classList.replace(classRE(klass), " ")
                })
                className(this, classList.trim())
            })
        },

        /**
         * 在匹配的元素集合中的每个元素上添加或删除一个或多个样式类。如果class的名称存在则删除它，如果不存在，就添加它。
         * 如果 setting的值为真，这个功能类似于 [addClass]{@link $.fn#toggleClass}，如果为假，这个功能类似与[removeClass]{@link $.fn#removeClass}。
         *
         *      toggleClass(names, [setting])   ⇒ self
         *      toggleClass(function(index, oldClassNames){ ... }, [setting])   ⇒ self
         *
         * @function
         * @name $.fn#toggleClass
         * @param {String/Function} name
         * @param {Boolean} [setting]
         * @returns {self}
         */
        toggleClass: function(name, when){
            if (!name) return this
            return this.each(function(idx){
                var $this = $(this), names = funcArg(this, name, idx, className(this))
                names.split(/\s+/g).forEach(function(klass){
                    (when === undefined ? !$this.hasClass(klass) : when) ?
                        $this.addClass(klass) : $this.removeClass(klass)
                })
            })
        },

        /**
         * 获取或设置页面上的滚动元素或者整个窗口向下滚动的像素值。
         *
         *      scrollTop()   ⇒ number
         *      scrollTop(value)   ⇒ self
         *
         * @function
         * @name $.fn#scrollTop
         * @param {Number} [value] 滚动的像素值
         * @returns {Number/self}
         */
        scrollTop: function(value){
            if (!this.length) return
            var hasScrollTop = 'scrollTop' in this[0]
            if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
            return this.each(hasScrollTop ?
                function(){ this.scrollTop = value } :
                function(){ this.scrollTo(this.scrollX, value) })
        },

        /**
         * 获取或设置页面上的滚动元素或者整个窗口向右滚动的像素值。
         *
         *      scrollLeft()   ⇒ number
         *      scrollLeft(value)   ⇒ self
         *
         * @function
         * @name $.fn#scrollLeft
         * @param {Number} [value] 滚动的像素值
         * @returns {Number/self}
         */
        scrollLeft: function(value){
            if (!this.length) return
            var hasScrollLeft = 'scrollLeft' in this[0]
            if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
            return this.each(hasScrollLeft ?
                function(){ this.scrollLeft = value } :
                function(){ this.scrollTo(value, this.scrollY) })
        },

        /**
         * 获取对象集合中第一个元素的位置。相对于[offsetParent]{@link $.fn#offsetParent}。当绝对定位的一个元素靠近另一个元素的时候，这个方法是有用的。
         *
         *      position()   ⇒ object
         *
         * @function
         * @name $.fn#position
         * @returns {Object} 对象包含 top, left.
         * @example
         * var pos = element.position()
         * // position a tooltip relative to the element
         * $('#tooltip').css({
         *  position: 'absolute',
         *  top: pos.top - 30,
         *  left: pos.left
         * })
         */
        position: function() {
            if (!this.length) return

            var elem = this[0],
            // Get *real* offsetParent
                offsetParent = this.offsetParent(),
            // Get correct offsets
                offset       = this.offset(),
                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
            offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

            // Add offsetParent borders
            parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
            parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

            // Subtract the two offsets
            return {
                top:  offset.top  - parentOffset.top,
                left: offset.left - parentOffset.left
            }
        },

        /**
         * 找到第一个定位过的祖先元素，意味着它的css中的position 属性值为“relative”, “absolute” or “fixed”.
         *
         *      offsetParent()   ⇒ collection
         *
         * @function
         * @name $.fn#offsetParent
         * @returns {Array}
         */
        offsetParent: function() {
            return this.map(function(){
                var parent = this.offsetParent || document.body
                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
                    parent = parent.offsetParent
                return parent
            })
        }
    }

    // for now
    $.fn.detach = $.fn.remove

        // Generate the `width` and `height` functions
    ;['width', 'height'].forEach(function(dimension){
        var dimensionProperty =
            dimension.replace(/./, function(m){ return m[0].toUpperCase() })

        /**
         * 获取对象集合中第一个元素的宽；或者设置对象集合中所有元素的宽。
         *
         *      width()   ⇒ number
         *      width(value)   ⇒ self
         *      width(function(index, oldWidth){ ... })   ⇒ self
         *
         * @function
         * @name $.fn#width
         * @param {Number} [value] 宽度值
         * @returns {Number/self}
         * @example
         * $('#foo').width()   // => 123
         * $(window).width()   // => 768 (viewport width)
         * $(document).width() // => 768
         */

        /**
         * 获取对象集合中第一个元素的高度；或者设置对象集合中所有元素的高度。
         *
         *      height()   ⇒ number
         *      height(value)   ⇒ self
         *      height(function(index, oldHeight){ ... })   ⇒ self
         *
         * @function
         * @name $.fn#height
         * @param {Number} [value] 高度值
         * @returns {Number/self}
         */

        $.fn[dimension] = function(value){
            var offset, el = this[0]
            if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
                isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
                (offset = this.offset()) && offset[dimension]
            else return this.each(function(idx){
                el = $(this)
                el.css(dimension, funcArg(this, value, idx, el[dimension]()))
            })
        }
    })

    function traverseNode(node, fun) {
        fun(node)
        for (var i = 0, len = node.childNodes.length; i < len; i++)
            traverseNode(node.childNodes[i], fun)
    }

    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function(operator, operatorIndex) {
        var inside = operatorIndex % 2 //=> prepend, append

        /**
         * 将参数内容插入到每个匹配元素的前面（注：元素内部插入）。插入d的元素可以试html字符串片段，一个dom节点，或者一个节点的数组。
         *
         *      prepend(content)   ⇒ self
         *
         * @function
         * @name $.fn#prepend
         * @param {String/HTMLElement/Array} content 内容或DOM节点或节点数组
         * @returns {self}
         * @example
         * $('ul').prepend(`'<li>first list item</li>'`)
         */

        /**
         * 在每个匹配的元素后插入内容（注：外部插入）。内容可以为html字符串，dom节点，或者节点组成的数组。
         *
         *      after(content)   ⇒ self
         *
         * @function
         * @name $.fn#after
         * @param {String/HTMLElement} content 内容或DOM节点
         * @returns {self}
         * @example
         * $('form label').after(`'<p>A note below the label</p>'`)
         */

        /**
         * 在匹配每个元素的前面插入内容（注：外部插入）。内容可以为html字符串，dom节点，或者节点组成的数组。
         *
         *     before(content)   ⇒ self
         *
         * @function
         * @name $.fn#before
         * @param {String/HTMLElement} content 内容或DOM节点
         * @returns {self}
         * @example
         * $('table').before(`'<p>See the following table:</p>'`)
         */

        /**
         * 在每个匹配的元素末尾插入内容（注：内部插入）。内容可以为html字符串，dom节点，或者节点组成的数组。
         *
         *     append(content)   ⇒ self
         *
         * @function
         * @name $.fn#append
         * @param {String/HTMLElement} content 内容或DOM节点
         * @returns {self}
         * @example
         * $('ul').append(`'<li>new list item</li>'`)
         */

        $.fn[operator] = function(){
            // arguments can be nodes, arrays of nodes, Eui objects and HTML strings
            var argType, nodes = $.map(arguments, function(arg) {
                    argType = type(arg)
                    return argType == "object" || argType == "array" || arg == null ?
                        arg : eui.fragment(arg)
                }),
                parent, copyByClone = this.length > 1
            if (nodes.length < 1) return this

            return this.each(function(_, target){
                parent = inside ? target : target.parentNode

                // convert all methods to a "before" operation
                target = operatorIndex == 0 ? target.nextSibling :
                    operatorIndex == 1 ? target.firstChild :
                        operatorIndex == 2 ? target :
                            null

                var parentInDocument = $.contains(document.documentElement, parent)

                nodes.forEach(function(node){
                    if (copyByClone) node = node.cloneNode(true)
                    else if (!parent) return $(node).remove()

                    parent.insertBefore(node, target)
                    if (parentInDocument) traverseNode(node, function(el){
                        if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                            (!el.type || el.type === 'text/javascript') && !el.src)
                            window['eval'].call(window, el.innerHTML)
                    })
                })
            })
        }

        /**
         * 将集合中的元素插入到指定的目标元素后面（注：外部插入）。这个有点像 [after]{@link $.fn#after}，但是使用方式相反。
         *
         *     insertAfter(target)   ⇒ self
         *
         * @function
         * @name $.fn#insertAfter
         * @param {String/HTMLElement} target 目标元素
         * @returns {self}
         * @example
         * $(`'<p>Emphasis mine.</p>'`).insertAfter('blockquote')
         */

        /**
         * 将所有元素插入到目标前面（注：元素内部插入）。这有点像[prepend]{@link $.fn#prepend}，但是是相反的方式。
         *
         *     prependTo(target)   ⇒ self
         *
         * @function
         * @name $.fn#prependTo
         * @param {String/HTMLElement} target 目标元素
         * @returns {self}
         * @example
         * $(`'<li>first list item</li>'`).prependTo('ul')
         */

        /**
         * 将集合中的元素插入到指定的目标元素前面（注：外部插入）。这个有点像 [before]{@link $.fn#before}，但是使用方式相反。
         *
         *     insertBefore(target)   ⇒ self
         *
         * @function
         * @name $.fn#insertBefore
         * @param {String/HTMLElement} target 目标元素
         * @returns {self}
         * @example
         * $(`'<p>See the following table:</p>'`).insertBefore('table')
         */

        /**
         * 将匹配的元素插入到目标元素的末尾（注：内部插入）。这个有点像 [append]{@link $.fn#append}，但是插入的目标与其相反。
         *
         *     appendTo(target)   ⇒ self
         *
         * @function
         * @name $.fn#appendTo
         * @param {String/HTMLElement} target 目标元素
         * @returns {self}
         * @example
         * $(`'<li>new list item</li>'`).appendTo('ul')
         */

        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
            $(html)[operator](this)
            return this
        }
    })

    eui.E.prototype = E.prototype = $.fn

    // Export internal API functions in the `$.eui` namespace
    eui.uniq = uniq
    eui.deserializeValue = deserializeValue
    $.eui = eui

    /**
     * 兼容 AMD 模块
     **/
    //if (typeof define === 'function' && define.amd) {
    //    define('eui', [], function() {
    //        return $;
    //    });
    //}

    return $
})()

// If `$` is not yet defined, point it to `Eui`
window.Eui = Eui
window.$ === undefined && (window.$ = Eui);
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
/**
 * (c)2015  Create at: 2015-08-25 10:41
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath eui.ajax.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function($, window, undefined) {

    var jsonType = 'application/json';
    var htmlType = 'text/html';
    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    var scriptTypeRE = /^(?:text|application)\/javascript/i;
    var xmlTypeRE = /^(?:text|application)\/xml/i;
    var blankRE = /^\s*$/;

    $.ajaxSettings = {
        type: 'GET',
        beforeSend: $.noop,
        success: $.noop,
        error: $.noop,
        complete: $.noop,
        context: null,
        xhr: function(protocol) {
            return new window.XMLHttpRequest();
        },
        accepts: {
            script: 'text/javascript, application/javascript, application/x-javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        timeout: 0,
        processData: true,
        cache: true
    };
    var ajaxBeforeSend = function(xhr, settings) {
        var context = settings.context
        if (settings.beforeSend.call(context, xhr, settings) === false) {
            return false;
        }
    };
    var ajaxSuccess = function(data, xhr, settings) {
        settings.success.call(settings.context, data, 'success', xhr);
        ajaxComplete('success', xhr, settings);
    };
    // type: "timeout", "error", "abort", "parsererror"
    var ajaxError = function(error, type, xhr, settings) {
        settings.error.call(settings.context, xhr, type, error);
        ajaxComplete(type, xhr, settings);
    };
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    var ajaxComplete = function(status, xhr, settings) {
        settings.complete.call(settings.context, xhr, status);
    };

    var serialize = function(params, obj, traditional, scope) {
        var type, array = $.isArray(obj),
            hash = $.isPlainObject(obj);
        $.each(obj, function(key, value) {
            type = $.type(value);
            if (scope) {
                key = traditional ? scope :
                scope + '[' + (hash || type === 'object' || type === 'array' ? key : '') + ']';
            }
            // handle data in serializeArray() format
            if (!scope && array) {
                params.add(value.name, value.value);
            }
            // recurse into nested objects
            else if (type === "array" || (!traditional && type === "object")) {
                serialize(params, value, traditional, key);
            } else {
                params.add(key, value);
            }
        });
    };
    var serializeData = function(options) {
        if (options.processData && options.data && typeof options.data !== "string") {
            options.data = $.param(options.data, options.traditional);
        }
        if (options.data && (!options.type || options.type.toUpperCase() === 'GET')) {
            options.url = appendQuery(options.url, options.data);
            options.data = undefined;
        }
    };
    var appendQuery = function(url, query) {
        if (query === '') {
            return url;
        }
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    };
    var mimeToDataType = function(mime) {
        if (mime) {
            mime = mime.split(';', 2)[0];
        }
        return mime && (mime === htmlType ? 'html' :
                mime === jsonType ? 'json' :
                    scriptTypeRE.test(mime) ? 'script' :
                    xmlTypeRE.test(mime) && 'xml') || 'text';
    };
    var parseArguments = function(url, data, success, dataType) {
        if ($.isFunction(data)) {
            dataType = success, success = data, data = undefined;
        }
        if (!$.isFunction(success)) {
            dataType = success, success = undefined;
        }
        return {
            url: url,
            data: data,
            success: success,
            dataType: dataType
        };
    };
    $.ajax = function(url, options) {
        if (typeof url === "object") {
            options = url;
            url = undefined;
        }
        var settings = options || {};
        settings.url = url || settings.url;
        for (var key in $.ajaxSettings) {
            if (settings[key] === undefined) {
                settings[key] = $.ajaxSettings[key];
            }
        }
        serializeData(settings);
        var dataType = settings.dataType;

        if (settings.cache === false || ((!options || options.cache !== true) && ('script' === dataType))) {
            settings.url = appendQuery(settings.url, '_=' + $.now());
        }
        var mime = settings.accepts[dataType];
        var headers = {};
        var setHeader = function(name, value) {
            headers[name.toLowerCase()] = [name, value];
        };
        var protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol;
        var xhr = settings.xhr(settings);
        var nativeSetHeader = xhr.setRequestHeader;
        var abortTimeout;

        setHeader('X-Requested-With', 'XMLHttpRequest');
        setHeader('Accept', mime || '*/*');
        if (!!(mime = settings.mimeType || mime)) {
            if (mime.indexOf(',') > -1) {
                mime = mime.split(',', 2)[0];
            }
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }
        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() !== 'GET')) {
            setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
        }
        if (settings.headers) {
            for (var name in settings.headers)
                setHeader(name, settings.headers[name]);
        }
        xhr.setRequestHeader = setHeader;

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = $.noop;
                clearTimeout(abortTimeout);
                var result, error = false;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && protocol === 'file:')) {
                    dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;
                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType === 'script') {
                            (1, eval)(result);
                        } else if (dataType === 'xml') {
                            result = xhr.responseXML;
                        } else if (dataType === 'json') {
                            result = blankRE.test(result) ? null : $.parseJSON(result);
                        }
                    } catch (e) {
                        error = e;
                    }

                    if (error) {
                        ajaxError(error, 'parsererror', xhr, settings);
                    } else {
                        ajaxSuccess(result, xhr, settings);
                    }
                } else {
                    ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings);
                }
            }
        };
        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort();
            ajaxError(null, 'abort', xhr, settings);
            return xhr;
        }


        if (settings.xhrFields) {
            for (var name in settings.xhrFields) {
                xhr[name] = settings.xhrFields[name];
            }
        }

        var async = 'async' in settings ? settings.async : true;

        xhr.open(settings.type.toUpperCase(), settings.url, async, settings.username, settings.password);

        for (var name in headers) {
            nativeSetHeader.apply(xhr, headers[name]);
        }
        if (settings.timeout > 0) {
            abortTimeout = setTimeout(function() {
                xhr.onreadystatechange = $.noop;
                xhr.abort();
                ajaxError(null, 'timeout', xhr, settings);
            }, settings.timeout);
        }
        xhr.send(settings.data ? settings.data : null);
        return xhr;
    };


    $.param = function(obj, traditional) {
        var params = [];
        params.add = function(k, v) {
            this.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        };
        serialize(params, obj, traditional);
        return params.join('&').replace(/%20/g, '+');
    };
    $.get = function( /* url, data, success, dataType */ ) {
        return $.ajax(parseArguments.apply(null, arguments));
    };

    $.post = function( /* url, data, success, dataType */ ) {
        var options = parseArguments.apply(null, arguments);
        options.type = 'POST';
        return $.ajax(options);
    };

    $.getJSON = function( /* url, data, success */ ) {
        var options = parseArguments.apply(null, arguments);
        options.dataType = 'json';
        return $.ajax(options);
    };

    $.fn.load = function(url, data, success) {
        if (!this.length)
            return this;
        var self = this,
            parts = url.split(/\s/),
            selector,
            options = parseArguments(url, data, success),
            callback = options.success;
        if (parts.length > 1)
            options.url = parts[0], selector = parts[1];
        options.success = function(response) {
            if (selector) {
                var div = document.createElement('div');
                div.innerHTML = response.replace(rscript, "");
                var selectorDiv = document.createElement('div');
                var childs = div.querySelectorAll(selector);
                if (childs && childs.length > 0) {
                    for (var i = 0, len = childs.length; i < len; i++) {
                        selectorDiv.appendChild(childs[i]);
                    }
                }
                self[0].innerHTML = selectorDiv.innerHTML;
            } else {
                self[0].innerHTML = response;
            }
            callback && callback.apply(self, arguments);
        };
        $.ajax(options);
        return this;
    };

})(Eui, window);
/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath form.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @namespace Form
 * @desc 序列化表单提交参数及赋值等相关封装.
 */
(function($){

    /**
     * 将用作提交的表单元素的值编译成拥有`name`和`value`对象组成的数组。
     * 不能使用的表单元素，buttons，未选中的radio buttons/checkboxs 将会被跳过。 结果不包含file inputs的数据。
     *
     *      serializeArray()   ⇒ array
     *
     * @function
     * @name #serializeArray
     * @memberof Form
     * @returns {Array}
     * @example
     *  $('form').serializeArray()
     * //=> [{ name: 'size', value: 'micro' },
     * //    { name: 'name', value: 'Eui' }]
     */
    $.fn.serializeArray = function() {
        var name, type, result = [],
            add = function(value) {
                if (value.forEach) return value.forEach(add)
                result.push({ name: name, value: value })
            }
        if (this[0]) $.each(this[0].elements, function(_, field){
            type = field.type, name = field.name
            if (name && field.nodeName.toLowerCase() != 'fieldset' &&
                !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
                ((type != 'radio' && type != 'checkbox') || field.checked))
                add($(field).val())
        })
        return result
    }

    /**
     * 在Ajax post请求中将用作提交的表单元素的值编译成 URL编码的 字符串。
     *
     *      serialize()   ⇒ string
     *
     * @function
     * @name #serialize
     * @memberof Form
     * @return {String} 编码后的字符串，用`&`连接
     */
    $.fn.serialize = function(){
        var result = []
        this.serializeArray().forEach(function(elm){
            result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
        })
        return result.join('&')
    }

    /**
     * 表单批量赋值，根据`name`属性匹配.
     *
     * 备注：如果是`span`标签，那么是通过`initname`属性识别.
     *
     * @function
     * @name #setValues
     * @memberof Form
     * @param {Object} data 表单的初始数据
     */
    $.fn.setValues = function(data){
        var form = this;
        for(var name in data){
            var val = data[name];
            if (!_checkField(name, val)){
                form.find('input[name="'+name+'"]').val(val);
                form.find('textarea[name="'+name+'"]').val(val);
                form.find('select[name="'+name+'"]').val(val);
                $('span[initname="'+name + '"]',form).text(val);
            }
        }

         // check the checkbox and radio fields
        function _checkField(name, val){
            var cc = form.find('input[name="'+name+'"][type=radio], input[name="'+name+'"][type=checkbox]');
            if (cc.length){
                cc.prop('checked', false);
                cc.each(function(){
                    var f = $(this);
                    if (f.val() == String(val) || $.inArray(f.val(), $.isArray(val)?val:[val]) >= 0){
                        f.prop('checked', true);
                    }
                });
                return true;
            }
            return false;
        }
    }

    /**
     * 为 “submit” 事件绑定一个处理函数，或者触发元素上的 “submit” 事件。
     * 当没有给定function参数时，触发当前表单“submit”事件， 并且执行默认的提交表单行为，除非调用了 `preventDefault()`。
     *
     * 当给定function参数时，在当前元素上它简单得为其在“submit”事件绑定一个处理函数。
     *
     *      submit() ⇒ self
     *      submit(function(e){ ... }) ⇒ self
     *
     * @function
     * @name #submit
     * @memberof Form
     * @param {Function} callback 成功回调函数.
     * @returns {$}
     */
    $.fn.submit = function(callback) {
        if (0 in arguments) this.bind('submit', callback)
        else if (this.length) {
            var event = $.Event('submit')
            this.eq(0).trigger(event)
            if (!event.isDefaultPrevented()) this.get(0).submit()
        }
        return this
    }

})(Eui);
/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath detect.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @namespace Detect
 * @desc 提供 $.os和 $.browser消息,该检测方法可以在不同的环境中微调你的站点或者应用程序，
 * 并帮助你识别手机和平板；以及不同的浏览器和操作系统。

     // The following boolean flags are set to true if they apply,
     // if not they're either set to `false` or `undefined`.
     // We recommend accessing them with `!!` prefixed to coerce to a boolean.

     // general device type

         $.os.phone
         $.os.tablet

         // specific OS
         $.os.ios
         $.os.android
         $.os.webos
         $.os.blackberry
         $.os.bb10
         $.os.rimtabletos

         // specific device type
         $.os.iphone
         $.os.ipad
         $.os.ipod // [v1.1]
         $.os.touchpad
         $.os.kindle

         // specific browser
         $.browser.chrome
         $.browser.firefox
         $.browser.safari // [v1.1]
         $.browser.webview // (iOS) [v1.1]
         $.browser.silk
         $.browser.playbook
         $.browser.ie // [v1.1]

         // 此外，版本信息是可用的。
         // 下面是运行​​iOS 6.1的iPhone所返回的。
         !!$.os.phone         // => true
         !!$.os.iphone        // => true
         !!$.os.ios           // => true
         $.os.version       // => "6.1"
         $.browser.version  // => "536.26"
 *
 */

(function($){
    function detect(ua, platform){
        var os = this.os = {}, browser = this.browser = {},
            webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
            plus = ua.match(/Html5Plus/i),
            streamApp = ua.match(/StreamApp/i),
            android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
            osx = !!ua.match(/\(Macintosh\; Intel /),
            ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
            ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
            iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
            wechat = ua.match(/(MicroMessenger)\/([\d\.]+)/i),
            webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
            win = /Win\d{2}|Windows/.test(platform),
            wp = ua.match(/Windows Phone ([\d.]+)/),
            touchpad = webos && ua.match(/TouchPad/),
            kindle = ua.match(/Kindle\/([\d.]+)/),
            silk = ua.match(/Silk\/([\d._]+)/),
            blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
            bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
            rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
            playbook = ua.match(/PlayBook/),
            chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
            firefox = ua.match(/Firefox\/([\d.]+)/),
            firefoxos = ua.match(/\((?:Mobile|Tablet); rv:([\d.]+)\).*Firefox\/[\d.]+/),
            ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
            webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
            safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

        // Todo: clean this up with a better OS/browser seperation:
        // - discern (more) between multiple browsers on android
        // - decide if kindle fire in silk mode is android or not
        // - Firefox on Android doesn't specify the Android version
        // - possibly devide in os, device and browser hashes

        if (browser.webkit = !!webkit) browser.version = webkit[1]
        if(plus){
            os.plus = true;
            $(function() {
                document.body.classList.add('mui-plus')
            });
            if (streamApp) { //TODO 最好有流应用自己的标识
                os.stream = true;
                $(function() {
                    document.body.classList.add('mui-plus-stream');
                });
            }
        }
        if (android) os.android = true, os.version = android[2],os.isBadAndroid = !(/Chrome\/\d/.test(window.navigator.appVersion))
        if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
        if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
        if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
        if (wp) os.wp = true, os.version = wp[1]
        if(wechat)os.wechat = { version : wechat[2].replace(/_/g, '.')}
        if (webos) os.webos = true, os.version = webos[2]
        if (touchpad) os.touchpad = true
        if (blackberry) os.blackberry = true, os.version = blackberry[2]
        if (bb10) os.bb10 = true, os.version = bb10[2]
        if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
        if (playbook) browser.playbook = true
        if (kindle) os.kindle = true, os.version = kindle[1]
        if (silk) browser.silk = true, browser.version = silk[1]
        if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
        if (chrome) browser.chrome = true, browser.version = chrome[1]
        if (firefox) browser.firefox = true, browser.version = firefox[1]
        if (firefoxos) os.firefoxos = true, os.version = firefoxos[1]
        if (ie) browser.ie = true, browser.version = ie[1]
        if (safari && (osx || os.ios || win)) {
            browser.safari = true
            if (!os.ios) browser.version = safari[1]
        }
        if (webview) browser.webview = true

        os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
        (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
        os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
        (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
        (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
    }

    detect.call($, navigator.userAgent, navigator.platform)
    // make available to unit tests
    $.__detect = detect

})(Eui);
/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath fx.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @desc The animate()方法.
 */

(function($, undefined){
    var prefix = '', eventPrefix,
        vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
        testEl = document.createElement('div'),
        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
        transform,
        transitionProperty, transitionDuration, transitionTiming, transitionDelay,
        animationName, animationDuration, animationTiming, animationDelay,
        cssReset = {}

    function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
    function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

    $.each(vendors, function(vendor, event){
        if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
            prefix = '-' + vendor.toLowerCase() + '-'
            eventPrefix = event
            return false
        }
    })

    transform = prefix + 'transform'
    cssReset[transitionProperty = prefix + 'transition-property'] =
        cssReset[transitionDuration = prefix + 'transition-duration'] =
            cssReset[transitionDelay    = prefix + 'transition-delay'] =
                cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
                    cssReset[animationName      = prefix + 'animation-name'] =
                        cssReset[animationDuration  = prefix + 'animation-duration'] =
                            cssReset[animationDelay     = prefix + 'animation-delay'] =
                                cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

    /**
     * 全局地动画设置,改变现有值或者添加一个新属性去影响使用一个字符串来设置时间的动画。
     */
    $.fx = {

        /**
         * 在支持css transition 的浏览器中默认为false,设置true来禁止所有animate()效果。
         * @default false
         */
        off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),

        /**
         * 用来设置动画时间的对象：
         *
         * - `_default` 400ms
         * - `fast` 200ms
         * - `slow` 600ms
         */
        speeds: { _default: 400, fast: 200, slow: 600 },
        cssPrefix: prefix,
        transitionEnd: normalizeEvent('TransitionEnd'),
        animationEnd: normalizeEvent('AnimationEnd')
    }

    /**
     * 对当前对象集合中元素进行css transition属性平滑过渡。
     *
     *      animate(properties, [duration, [easing, [function(){ ... }]]]) ⇒ self
     *      animate(properties, { duration: msec, easing: type, complete: fn }) ⇒ self
     *      animate(animationName, { ... }) ⇒ self
     *
     * Eui 还支持以下  [CSS transform][] transform 属性：

     * - `translate(X|Y|Z|3d)`
     * - `rotate(X|Y|Z|3d)`
     * - `scale(X|Y|Z)`
     * - `matrix(3d)`
     * - `perspective`
     * - `skew(X|Y)`
     *
     * 如果duration参数为 `0` 或 `$.fx.off` 为 true(在不支持css transitions的浏览器中默认为true)，
     * 动画将不被执行；替代动画效果的目标位置会即刻生效。类似的，如果指定的动画不是通过动画完成，
     * 而且动画的目标位置即可生效。这种情况下没有动画， `complete`方法也不会被调用。
     *
     * 如果第一个参数是字符串而不是一个对象，它将被当作一个css关键帧动画
     * [CSS keyframe animation][keyframe] 的名称。
     *
     *      $("#some_element").animate({
   *         opacity: 0.25, left: '50px',
   *         color: '#abcdef',
   *         rotateZ: '45deg', translate3d: '0,10px,0'
   *       }, 500, 'ease-out')
     *
     * Eui只使用css过渡效果的动画。jquery的easings不会支持。
     * jquery的相对变化("=+10px") syntax 也不支持。
     * 请查看 <a href="http://www.w3.org/TR/css3-transitions/#animatable-properties-">list of animatable properties</a>。
     * 浏览器的支持可能不同，所以一定要测试你所想要支持的浏览器。
     *
     * [timing]: http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
     * [css transform]: http://www.w3.org/TR/css3-transforms/#transform-functions
     * [keyframe]: http://www.w3.org/TR/css3-animations/#animations
     *
     * @function
     * @name $.fn#animate
     * @param {Object} properties 一个对象，该对象包含了css动画的值，或者css帧动画的名称
     * @param {Number} [duration=400] 以毫秒为单位的时间，或者一个字符串:
     *    - `fast` (200 ms)
     *    - `slow` (600 ms)
     * @param {String} ease 指定动画的缓动类型，使用以下一个:
     *    - `ease`
     *    - `slow`
     *    - ` linear`
     *    - `ease-in / ease-out`
     *    - `ease-in-out`
     *    - `cubic-bezier(...)`
     *
     * @param {Function} callback 动画完成时的回调函数
     * @param {Number} delay 以毫秒为单位的过度延迟时间
     */
    $.fn.animate = function(properties, duration, ease, callback, delay){
        if ($.isFunction(duration))
            callback = duration, ease = undefined, duration = undefined
        if ($.isFunction(ease))
            callback = ease, ease = undefined
        if ($.isPlainObject(duration))
            ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
        if (duration) duration = (typeof duration == 'number' ? duration :
            ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
        if (delay) delay = parseFloat(delay) / 1000
        return this.anim(properties, duration, ease, callback, delay)
    }

    $.fn.anim = function(properties, duration, ease, callback, delay){
        var key, cssValues = {}, cssProperties, transforms = '',
            that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
            fired = false

        if (duration === undefined) duration = $.fx.speeds._default / 1000
        if (delay === undefined) delay = 0
        if ($.fx.off) duration = 0

        if (typeof properties == 'string') {
            // keyframe animation
            cssValues[animationName] = properties
            cssValues[animationDuration] = duration + 's'
            cssValues[animationDelay] = delay + 's'
            cssValues[animationTiming] = (ease || 'linear')
            endEvent = $.fx.animationEnd
        } else {
            cssProperties = []
            // CSS transitions
            for (key in properties)
                if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
                else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

            if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
            if (duration > 0 && typeof properties === 'object') {
                cssValues[transitionProperty] = cssProperties.join(', ')
                cssValues[transitionDuration] = duration + 's'
                cssValues[transitionDelay] = delay + 's'
                cssValues[transitionTiming] = (ease || 'linear')
            }
        }

        wrappedCallback = function(event){
            if (typeof event !== 'undefined') {
                if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
                $(event.target).unbind(endEvent, wrappedCallback)
            } else
                $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

            fired = true
            $(this).css(cssReset)
            callback && callback.call(this)
        }
        if (duration > 0){
            this.bind(endEvent, wrappedCallback)
            // transitionEnd is not always firing on older Android phones
            // so make sure it gets fired
            setTimeout(function(){
                if (fired) return
                wrappedCallback.call(that)
            }, ((duration + delay) * 1000) + 25)
        }

        // trigger page reflow so new elements can animate
        this.size() && this.get(0).clientLeft

        this.css(cssValues)

        if (duration <= 0) setTimeout(function() {
            that.each(function(){ wrappedCallback.call(this) })
        }, 0)

        return this
    }

    testEl = null
})(Eui);
/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath fx_methods.js
 *
 * eui.js may be freely distributed under the MIT license.
 * @desc 以动画形式的 show, hide, toggle, 和 fade*()方法.
 */

(function($, undefined){

    var origShow = $.fn.show, origHide = $.fn.hide, origToggle = $.fn.toggle

    function anim(el, speed, opacity, scale, callback) {
        if (typeof speed == 'function' && !callback) callback = speed, speed = undefined
        var props = { opacity: opacity }
        if (scale) {
            props.scale = scale
            el.css($.fx.cssPrefix + 'transform-origin', '0 0')
        }
        return el.animate(props, speed, null, callback)
    }

    function hide(el, speed, scale, callback) {
        return anim(el, speed, 0, scale, function(){
            origHide.call($(this))
            callback && callback.call(this)
        })
    }

    $.fn.show = function(speed, callback) {
        origShow.call(this)
        if (speed === undefined) speed = 0
        else this.css('opacity', 0)
        return anim(this, speed, 1, '1,1', callback)
    }

    $.fn.hide = function(speed, callback) {
        if (speed === undefined) return origHide.call(this)
        else return hide(this, speed, '0,0', callback)
    }

    $.fn.toggle = function(speed, callback) {
        if (speed === undefined || typeof speed == 'boolean')
            return origToggle.call(this, speed)
        else return this.each(function(){
            var el = $(this)
            el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback)
        })
    }

    $.fn.fadeTo = function(speed, opacity, callback) {
        return anim(this, speed, opacity, null, callback)
    }

    $.fn.fadeIn = function(speed, callback) {
        var target = this.css('opacity')
        if (target > 0) this.css('opacity', 0)
        else target = 1
        return origShow.call(this).fadeTo(speed, target, callback)
    }

    $.fn.fadeOut = function(speed, callback) {
        return hide(this, speed, null, callback)
    }

    $.fn.fadeToggle = function(speed, callback) {
        return this.each(function(){
            var el = $(this)
            el[
                (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
                ](speed, callback)
        })
    }

})(Eui);
/**
 * (c)2015  Create at: 2015-05-28
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath data.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @desc 一个全面的 data()方法, 能够在内存中存储任意对象。
 */

(function($){
    var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
        exp = $.expando = 'Eui' + (+new Date()), emptyArray = []

    // Get value from node:
    // 1. first try key as given,
    // 2. then try camelized key,
    // 3. fall back to reading "data-*" attribute.
    function getData(node, name) {
        var id = node[exp], store = id && data[id]
        if (name === undefined) return store || setData(node)
        else {
            if (store) {
                if (name in store) return store[name]
                var camelName = camelize(name)
                if (camelName in store) return store[camelName]
            }
            return dataAttr.call($(node), name)
        }
    }

    // Store value under camelized key on node
    function setData(node, name, value) {
        var id = node[exp] || (node[exp] = ++$.uuid),
            store = data[id] || (data[id] = attributeData(node))
        if (name !== undefined) store[camelize(name)] = value
        return store
    }

    // Read all "data-*" attributes from a node
    function attributeData(node) {
        var store = {}
        $.each(node.attributes || emptyArray, function(i, attr){
            if (attr.name.indexOf('data-') == 0)
                store[camelize(attr.name.replace('data-', ''))] =
                    $.eui.deserializeValue(attr.value)
        })
        return store
    }

    /**
     * 读取或写入dom的 `data-*` 属性。行为有点像 `attr` ，但是属性名称前面加上 `data-`。
     *
     *      data(name)   ⇒ value
     *      data(name, value)   ⇒ self
     *
     * 当读取属性值时，会有下列转换:
     *
     * - "true”, “false”, and “null” 被转换为相应的类型；
     * - 数字值转换为实际的数字类型；
     * - JSON值将会被解析，如果它是有效的JSON；
     * - 其它的一切作为字符串返回。
     *
     *
     *  Eui基本实现`data()`只能存储字符串。如果你要存储任意对象，
     *  请引入可选的“data”模块到你构建的Eui中。
     *
     * @function
     * @name $.fn#data
     *
     * @param {String} name 绑定的键
     * @param {*} value  绑定的值(任意对象)
     * @returns {*} 返回绑定的值或者当前对象.
     */
    $.fn.data = function(name, value) {
        return value === undefined ?
            // set multiple values via object
            $.isPlainObject(name) ?
                this.each(function(i, node){
                    $.each(name, function(key, value){ setData(node, key, value) })
                }) :
                // get value from first element
                (0 in this ? getData(this[0], name) : undefined) :
            // set value on all elements
            this.each(function(){ setData(this, name, value) })
    }

    /**
     * 根据指定的存储key名称删除绑定的数据。
     *
     * @function
     * @name $.fn#removeData
     * @param {String/Array} names 数组或者以`空格`分隔的字符串.
     * @returns {self}
     */
    $.fn.removeData = function(names) {
        if (typeof names == 'string') names = names.split(/\s+/)
        return this.each(function(){
            var id = this[exp], store = id && data[id]
            if (store) $.each(names || store, function(key){
                delete store[names ? camelize(this) : key]
            })
        })
    }

        // Generate extended `remove` and `empty` functions
    ;['remove', 'empty'].forEach(function(methodName){
        var origFn = $.fn[methodName]
        $.fn[methodName] = function() {
            var elements = this.find('*')
            if (methodName === 'remove') elements = elements.add(this)
            elements.removeData()
            return origFn.call(this)
        }
    })
})(Eui);


/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath callback.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @desc 为"deferred"模块提供 $.Callbacks。
 */

(function($){
    // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
    // Option flags:
    //   - once: Callbacks fired at most one time.
    //   - memory: Remember the most recent context and arguments
    //   - stopOnFalse: Cease iterating over callback list
    //   - unique: Permit adding at most one instance of the same callback
    $.Callbacks = function(options) {
        options = $.extend({}, options)

        var memory, // Last fire value (for non-forgettable lists)
            fired,  // Flag to know if list was already fired
            firing, // Flag to know if list is currently firing
            firingStart, // First callback to fire (used internally by add and fireWith)
            firingLength, // End of the loop when firing
            firingIndex, // Index of currently firing callback (modified by remove if needed)
            list = [], // Actual callback list
            stack = !options.once && [], // Stack of fire calls for repeatable lists
            fire = function(data) {
                memory = options.memory && data
                fired = true
                firingIndex = firingStart || 0
                firingStart = 0
                firingLength = list.length
                firing = true
                for ( ; list && firingIndex < firingLength ; ++firingIndex ) {
                    if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                        memory = false
                        break
                    }
                }
                firing = false
                if (list) {
                    if (stack) stack.length && fire(stack.shift())
                    else if (memory) list.length = 0
                    else Callbacks.disable()
                }
            },

            Callbacks = {
                add: function() {
                    if (list) {
                        var start = list.length,
                            add = function(args) {
                                $.each(args, function(_, arg){
                                    if (typeof arg === "function") {
                                        if (!options.unique || !Callbacks.has(arg)) list.push(arg)
                                    }
                                    else if (arg && arg.length && typeof arg !== 'string') add(arg)
                                })
                            }
                        add(arguments)
                        if (firing) firingLength = list.length
                        else if (memory) {
                            firingStart = start
                            fire(memory)
                        }
                    }
                    return this
                },
                remove: function() {
                    if (list) {
                        $.each(arguments, function(_, arg){
                            var index
                            while ((index = $.inArray(arg, list, index)) > -1) {
                                list.splice(index, 1)
                                // Handle firing indexes
                                if (firing) {
                                    if (index <= firingLength) --firingLength
                                    if (index <= firingIndex) --firingIndex
                                }
                            }
                        })
                    }
                    return this
                },
                has: function(fn) {
                    return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
                },
                empty: function() {
                    firingLength = list.length = 0
                    return this
                },
                disable: function() {
                    list = stack = memory = undefined
                    return this
                },
                disabled: function() {
                    return !list
                },
                lock: function() {
                    stack = undefined;
                    if (!memory) Callbacks.disable()
                    return this
                },
                locked: function() {
                    return !stack
                },
                fireWith: function(context, args) {
                    if (list && (!fired || stack)) {
                        args = args || []
                        args = [context, args.slice ? args.slice() : args]
                        if (firing) stack.push(args)
                        else fire(args)
                    }
                    return this
                },
                fire: function() {
                    return Callbacks.fireWith(this, arguments)
                },
                fired: function() {
                    return !!fired
                }
            }

        return Callbacks
    }
})(Eui);

/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath deferred.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @desc 提供 $.Deferredpromises API. 依赖"callbacks" 模块.
 */

(function($){
    var slice = Array.prototype.slice

    function Deferred(func) {
        var tuples = [
                // action, add listener, listener list, final state
                [ "resolve", "done", $.Callbacks({once:1, memory:1}), "resolved" ],
                [ "reject", "fail", $.Callbacks({once:1, memory:1}), "rejected" ],
                [ "notify", "progress", $.Callbacks({memory:1}) ]
            ],
            state = "pending",
            promise = {
                state: function() {
                    return state
                },
                always: function() {
                    deferred.done(arguments).fail(arguments)
                    return this
                },
                then: function(/* fnDone [, fnFailed [, fnProgress]] */) {
                    var fns = arguments
                    return Deferred(function(defer){
                        $.each(tuples, function(i, tuple){
                            var fn = $.isFunction(fns[i]) && fns[i]
                            deferred[tuple[1]](function(){
                                var returned = fn && fn.apply(this, arguments)
                                if (returned && $.isFunction(returned.promise)) {
                                    returned.promise()
                                        .done(defer.resolve)
                                        .fail(defer.reject)
                                        .progress(defer.notify)
                                } else {
                                    var context = this === promise ? defer.promise() : this,
                                        values = fn ? [returned] : arguments
                                    defer[tuple[0] + "With"](context, values)
                                }
                            })
                        })
                        fns = null
                    }).promise()
                },

                promise: function(obj) {
                    return obj != null ? $.extend( obj, promise ) : promise
                }
            },
            deferred = {}

        $.each(tuples, function(i, tuple){
            var list = tuple[2],
                stateString = tuple[3]

            promise[tuple[1]] = list.add

            if (stateString) {
                list.add(function(){
                    state = stateString
                }, tuples[i^1][2].disable, tuples[2][2].lock)
            }

            deferred[tuple[0]] = function(){
                deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
                return this
            }
            deferred[tuple[0] + "With"] = list.fireWith
        })

        promise.promise(deferred)
        if (func) func.call(deferred, deferred)
        return deferred
    }

    $.when = function(sub) {
        var resolveValues = slice.call(arguments),
            len = resolveValues.length,
            i = 0,
            remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
            deferred = remain === 1 ? sub : Deferred(),
            progressValues, progressContexts, resolveContexts,
            updateFn = function(i, ctx, val){
                return function(value){
                    ctx[i] = this
                    val[i] = arguments.length > 1 ? slice.call(arguments) : value
                    if (val === progressValues) {
                        deferred.notifyWith(ctx, val)
                    } else if (!(--remain)) {
                        deferred.resolveWith(ctx, val)
                    }
                }
            }

        if (len > 1) {
            progressValues = new Array(len)
            progressContexts = new Array(len)
            resolveContexts = new Array(len)
            for ( ; i < len; ++i ) {
                if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
                    resolveValues[i].promise()
                        .done(updateFn(i, resolveContexts, resolveValues))
                        .fail(deferred.reject)
                        .progress(updateFn(i, progressContexts, progressValues))
                } else {
                    --remain
                }
            }
        }
        if (!remain) deferred.resolveWith(resolveContexts, resolveValues)
        return deferred.promise()
    }

    $.Deferred = Deferred
})(Eui);
/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath selector.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @desc 实验性的支持 jQuery CSS 表达式 实用功能，比如 $('div:first')和 el.is(':visible')。
 *
 */

(function($){
    var eui = $.eui, oldQsa = eui.qsa, oldMatches = eui.matches

    function visible(elem){
        elem = $(elem)
        return !!(elem.width() || elem.height()) && elem.css("display") !== "none"
    }

    // Implements a subset from:
    // http://api.jquery.com/category/selectors/jquery-selector-extensions/
    //
    // Each filter function receives the current index, all nodes in the
    // considered set, and a value if there were parentheses. The value
    // of `this` is the node currently being considered. The function returns the
    // resulting node(s), null, or undefined.
    //
    // Complex selectors are not supported:
    //   li:has(label:contains("foo")) + li:has(label:contains("bar"))
    //   ul.inner:first > li
    var filters = $.expr[':'] = {
        visible:  function(){ if (visible(this)) return this },
        hidden:   function(){ if (!visible(this)) return this },
        selected: function(){ if (this.selected) return this },
        checked:  function(){ if (this.checked) return this },
        parent:   function(){ return this.parentNode },
        first:    function(idx){ if (idx === 0) return this },
        last:     function(idx, nodes){ if (idx === nodes.length - 1) return this },
        eq:       function(idx, _, value){ if (idx === value) return this },
        contains: function(idx, _, text){ if ($(this).text().indexOf(text) > -1) return this },
        has:      function(idx, _, sel){ if (eui.qsa(this, sel).length) return this }
    }

    var filterRe = new RegExp('(.*):(\\w+)(?:\\(([^)]+)\\))?$\\s*'),
        childRe  = /^\s*>/,
        classTag = 'Eui' + (+new Date())

    function process(sel, fn) {
        // quote the hash in `a[href^=#]` expression
        sel = sel.replace(/=#\]/g, '="#"]')
        var filter, arg, match = filterRe.exec(sel)
        if (match && match[2] in filters) {
            filter = filters[match[2]], arg = match[3]
            sel = match[1]
            if (arg) {
                var num = Number(arg)
                if (isNaN(num)) arg = arg.replace(/^["']|["']$/g, '')
                else arg = num
            }
        }
        return fn(sel, filter, arg)
    }

    eui.qsa = function(node, selector) {
        return process(selector, function(sel, filter, arg){
            try {
                var taggedParent
                if (!sel && filter) sel = '*'
                else if (childRe.test(sel))
                // support "> *" child queries by tagging the parent node with a
                // unique class and prepending that classname onto the selector
                    taggedParent = $(node).addClass(classTag), sel = '.'+classTag+' '+sel

                var nodes = oldQsa(node, sel)
            } catch(e) {
                console.error('error performing selector: %o', selector)
                throw e
            } finally {
                if (taggedParent) taggedParent.removeClass(classTag)
            }
            return !filter ? nodes :
                eui.uniq($.map(nodes, function(n, i){ return filter.call(n, i, nodes, arg) }))
        })
    }

    eui.matches = function(node, selector){
        return process(selector, function(sel, filter, arg){
            return (!sel || oldMatches(node, sel)) &&
                (!filter || filter.call(node, null, arg) === node)
        })
    }
})(Eui);



/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath stack.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @desc 提供 andSelf& end()链式调用方法
 *
 * @todo 理解链式调用的场景
 *
 */

(function($){
    $.fn.end = function(){
        return this.prevObject || $()
    }

    $.fn.andSelf = function(){
        return this.add(this.prevObject || $())
    }

    'filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings'.split(',').forEach(function(property){
        var fn = $.fn[property]
        $.fn[property] = function(){
            var ret = fn.apply(this, arguments)
            ret.prevObject = this
            return ret
        }
    })
})(Eui);
/**
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath more.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */

(function($){

    var global = this,
        objectPrototype = Object.prototype,
        toString = objectPrototype.toString,
        enumerables = true,
        enumerablesTest = {toString: 1},
        emptyFn = function () {},
        iterableRe = /\[object\s*(?:Array|Arguments|\w*Collection|\w*List|HTML\s+document\.all\s+class)\]/,
        callOverrideParent = function () {
            var method = callOverrideParent.caller.caller; // skip callParent (our caller)
            return method.$owner.prototype[method.$name].apply(this, arguments);
        };

    Function.prototype.$euiIsFunction = true;
    $.global = global;

    for (i in enumerablesTest) {
        enumerables = null;
    }

    if (enumerables) {
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
            'toLocaleString', 'toString', 'constructor'];
    }

    $.enumerables = enumerables;

    /**
     * Copies all the properties of config to the specified object.
     * Note that if recursive merging and cloning without referencing the original objects / arrays is needed, use
     * {@link $.Object#merge} instead.
     * @param {Object} object The receiver of the properties
     * @param {Object} config The source of the properties
     * @param {Object} [defaults] A different object that will also be applied for default values
     * @return {Object} returns obj
     */
    $.apply = function(object, config, defaults) {
        if (defaults) {
            $.apply(object, defaults);
        }

        if (object && config && typeof config === 'object') {
            var i, j, k;

            for (i in config) {
                object[i] = config[i];
            }

            if (enumerables) {
                for (j = enumerables.length; j--;) {
                    k = enumerables[j];
                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }

        return object;
    };

    $.apply($,{

        util : {},

        /**
         * 定义一个空的方法.
         * @function
         * @memberof $
         */
        emptyFn : emptyFn,

        /**
         * @property {Boolean} USE_NATIVE_JSON
         * Indicates whether to use native browser parsing for JSON methods.
         * This option is ignored if the browser does not support native JSON methods.
         *
         * **Note:** Native JSON methods will not work with objects that have functions.
         * Also, property names must be quoted, otherwise the data will not parse.
         */
        USE_NATIVE_JSON : false,

        /**
         * Returns true if the passed value is a boolean.
         *
         * @memberof $
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isBoolean: function(value) {
            return typeof value === 'boolean';
        },

        /**
         * Returns true if the passed value is defined.
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isDefined: function(value) {
            return typeof value !== 'undefined';
        },

        /**
         * Returns true if the passed value is an HTMLElement
         *
         * @memberof $
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isElement: function(value) {
            return value ? value.nodeType === 1 : false;
        },

        /**
         * Returns true if the passed value is a TextNode
         *
         * @memberof $
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isTextNode: function(value) {
            return value ? value.nodeName === "#text" : false;
        },

        /**
         * Returns true if the passed value is a string.
         *
         * @memberof $
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isString: function(value) {
            return typeof value === 'string';
        },

        /**
         * Returns true if the passed value is empty, false otherwise. The value is deemed to be empty if it is either:
         *
         * - `null`
         * - `undefined`
         * - a zero-length array
         * - a zero-length string (Unless the `allowEmptyString` parameter is set to `true`)
         *
         * @memberof $
         * @param {Object} value The value to test
         * @param {Boolean} allowEmptyString (optional) true to allow empty strings (defaults to false)
         * @return {Boolean}
         * @markdown
         */
        isEmpty: function(value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || ($.isArray(value) && value.length === 0);
        },

        /**
         * Copies all the properties of config to object if they don't already exist.
         *
         * @memberof $
         * @param {Object} object The receiver of the properties
         * @param {Object} config The source of the properties
         * @return {Object} returns obj
         */
        applyIf: function(object, config) {
            var property;

            if (object) {
                for (property in config) {
                    if (object[property] === undefined) {
                        object[property] = config[property];
                    }
                }
            }

            return object;
        },

        /**
         * Returns `true` if the passed value is iterable, that is, if elements of it are addressable using array
         * notation with numeric indices, `false` otherwise.
         *
         * Arrays and function `arguments` objects are iterable. Also HTML collections such as `NodeList` and `HTMLCollection'
         * are iterable.
         *
         * @memberof $
         * @param {Object} value The value to test
         * @return {Boolean}
         */
        isIterable: function(value) {
            // To be iterable, the object must have a numeric length property and must not be a string or function.
            if (!value || typeof value.length !== 'number' || typeof value === 'string' || value.$euiIsFunction) {
                return false;
            }

            // Certain "standard" collections in IE (such as document.images) do not offer the correct
            // Javascript Object interface; specifically, they lack the propertyIsEnumerable method.
            // And the item property while it does exist is not typeof "function"
            if (!value.propertyIsEnumerable) {
                return !!value.item;
            }

            // If it is a regular, interrogatable JS object (not an IE ActiveX object), then...
            // If it has its own property called "length", but not enumerable, it's iterable
            if (value.hasOwnProperty('length') && !value.propertyIsEnumerable('length')) {
                return true;
            }

            // Test against whitelist which includes known iterable collection types
            return iterableRe.test(toString.call(value));
        },

        /**
         * Overrides members of the specified `target` with the given values.
         *
         * If the `target` is a function, it is assumed to be a constructor and the contents
         * of `overrides` are applied to its `prototype` using {@link $.apply $.apply}.
         *
         * If the `target` is none of these, the `overrides` are applied to the `target`
         * using {@link $.apply $.apply}.
         *
         * @memberof $
         * @param {Object} target The target to override.
         * @param {Object} overrides The properties to add or replace on `target`.
         * @method override
         */
        override: function (target, overrides) {
            if (target.$isClass) {
                target.override(overrides);
            } else if (typeof target == 'function') {
                $.apply(target.prototype, overrides);
            } else {
                var owner = target.self,
                    name, value;

                if (owner && owner.$isClass) { // if (instance of $.define'd class)
                    for (name in overrides) {
                        if (overrides.hasOwnProperty(name)) {
                            value = overrides[name];

                            if (typeof value == 'function') {
                                //<debug>
                                if (owner.$className) {
                                    value.displayName = owner.$className + '#' + name;
                                }
                                //</debug>

                                value.$name = name;
                                value.$owner = owner;
                                value.$previous = target.hasOwnProperty(name)
                                    ? target[name] // already hooked, so call previous hook
                                    : callOverrideParent; // calls by name on prototype
                            }

                            target[name] = value;
                        }
                    }
                } else {
                    $.apply(target, overrides);
                }
            }
            return target;
        },

        /**
         * Clone simple variables including array, {}-like objects, DOM nodes and Date without keeping the old reference.
         * A reference for the object itself is returned if it's not a direct decendant of Object. For model cloning.
         * @memberof $
         * @param {Object} item The variable to clone
         * @return {Object} clone
         */
        clone: function(item) {
            var type,
                i,
                j,
                k,
                clone,
                key;

            if (item === null || item === undefined) {
                return item;
            }

            // DOM nodes
            // recursively
            if (item.nodeType && item.cloneNode) {
                return item.cloneNode(true);
            }

            type = toString.call(item);

            // Date
            if (type === '[object Date]') {
                return new Date(item.getTime());
            }


            // Array
            if (type === '[object Array]') {
                i = item.length;

                clone = [];

                while (i--) {
                    clone[i] = $.clone(item[i]);
                }
            }
            // Object
            else if (type === '[object Object]' && item.constructor === Object) {
                clone = {};

                for (key in item) {
                    clone[key] = $.clone(item[key]);
                }

                if (enumerables) {
                    for (j = enumerables.length; j--;) {
                        k = enumerables[j];
                        if (item.hasOwnProperty(k)) {
                            clone[k] = item[k];
                        }
                    }
                }
            }

            return clone || item;
        },

        functionFactory: function() {
            var me = this,
                args = Array.prototype.slice.call(arguments),
                ln;

            return Function.prototype.constructor.apply(Function.prototype, args);
        }
    });
}(Eui));
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

/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath target.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 */
(function($, window, document) {

	$.targets = {};

	$.targetHandles = [];

	$.registerTarget = function(target) {

		target.index = target.index || 1000;

		$.targetHandles.push(target);

		$.targetHandles.sort(function(a, b) {
			return a.index - b.index;
		});

		return $.targetHandles;
	};
	window.addEventListener('touchstart', function(event) {
		var target = event.target;
		var founds = {};
		for (; target && target !== document; target = target.parentNode) {
			var isFound = false;
			$.each($.targetHandles, function(index, targetHandle) {
				var name = targetHandle.name;
				if (!isFound && !founds[name] && targetHandle.hasOwnProperty('handle')) {
					$.targets[name] = targetHandle.handle(event, target);
					if ($.targets[name]) {
						founds[name] = true;
						if (targetHandle.isContinue !== true) {
							isFound = true;
						}
					}
				} else {
					if (!founds[name]) {
						if (targetHandle.isReset !== false)
							$.targets[name] = false;
					}
				}
			});
			if (isFound) {
				break;
			}
		}

	});
})(Eui, window, document);

/**
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath supports.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * Determines information about features are supported in the current environment
 */
(function(){

    Eui.supports = {

        /**
         * PointerEvents True if document environment supports the CSS3 pointer-events style.
         * @type {Boolean}
         */
        PointerEvents: 'pointerEvents' in document.documentElement.style,

        // IE10/Win8 throws "Access Denied" accessing window.localStorage, so this test
        // needs to have a try/catch
        /**
         * LocalStorage True if localStorage is supported
         * @type {Boolean}
         */
        LocalStorage: (function() {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        })(),

        /**
         * CSS3BoxShadow True if document environment supports the CSS3 box-shadow style.
         * @type {Boolean}
         */
        CSS3BoxShadow: 'boxShadow' in document.documentElement.style || 'WebkitBoxShadow' in document.documentElement.style || 'MozBoxShadow' in document.documentElement.style,

        /**
         * ClassList True if document environment supports the HTML5 classList API.
         * @type {Boolean}
         */
        ClassList: !!document.documentElement.classList,

        /**
         * OrientationChange True if the device supports orientation change
         * @type {Boolean}
         */
        OrientationChange: ((typeof window.orientation != 'undefined') && ('onorientationchange' in window)),

        /**
         * DeviceMotion True if the device supports device motion (acceleration and rotation rate)
         * @type {Boolean}
         */
        DeviceMotion: ('ondevicemotion' in window),

        /**
         * TimeoutActualLateness True if the browser passes the "actualLateness" parameter to
         * setTimeout.
         * @see {@link https://developer.mozilla.org/en/DOM/window.setTimeout}
         * @type {Boolean}
         */
        TimeoutActualLateness: (function(){
            setTimeout(function(){
                Eui.supports.TimeoutActualLateness = arguments.length !== 0;
            }, 0);
        }())
    };
}());
/**
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/string.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 处理字符串的实用静态方法的一个集合。
 * @namespace Eui.String
 */
Eui.String = (function() {
    var trimRegex     = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g,
        escapeRe      = /('|\\)/g,
        formatRe      = /\{(\d+)\}/g,
        escapeRegexRe = /([-.*+?\^${}()|\[\]\/\\])/g,
        basicTrimRe   = /^\s+|\s+$/g,
        whitespaceRe  = /\s+/,
        varReplace    = /(^[^a-z]*|[^\w])/gi,
        charToEntity,
        entityToChar,
        charToEntityRegex,
        entityToCharRegex,
        htmlEncodeReplaceFn = function(match, capture) {
            return charToEntity[capture];
        },
        htmlDecodeReplaceFn = function(match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        },
        boundsCheck = function(s, other){
            if (s === null || s === undefined || other === null || other === undefined) {
                return false;
            }
            
            return other.length <= s.length; 
        };

    return {
        
        /**
         * 插入一个子串到指定字符串的位置。
         *
         * @memberof Eui.String
         * @param {string} s 原始的字符串。
         * @param {string} value 待插入的子串。
         * @param {number} index 插入子字符串的索引位置. 负数将从末尾开始插入。
         * @return {string} 插入子字符串的值。
         * @example
         * Eui.String.insert("abcdefg", "h", -1); // abcdefhg
         */
        insert: function(s, value, index) {
            if (!s) {
                return value;
            }
            
            if (!value) {
                return s;
            }
            
            var len = s.length;
            
            if (!index && index !== 0) {
                index = len;
            }
            
            if (index < 0) {
                index *= -1;
                if (index >= len) {
                    // negative overflow, insert at start
                    index = 0;
                } else {
                    index = len - index;
                }
            }
            
            if (index === 0) {
                s = value + s;
            } else if (index >= s.length) {
                s += value;
            } else {
                s = s.substr(0, index) + value + s.substr(index);
            }
            return s;
        },
        
        /**
         * 判断一个字符串是否以某一子串开始。
         *
         * @memberof Eui.String
         * @param {string} s 原始的字符串
         * @param {string} start 待检测的子串
         * @param {boolean} [ignoreCase=false] 如果为true,比较时忽略大小写
         */
        startsWith: function(s, start, ignoreCase){
            var result = boundsCheck(s, start);
            
            if (result) {
                if (ignoreCase) {
                    s = s.toLowerCase();
                    start = start.toLowerCase();
                }
                result = s.lastIndexOf(start, 0) === 0;
            }
            return result;
        },
        
        /**
         * 判断一个字符串以子字符串结束。
         *
         * @memberof Eui.String
         * @param {String} s 原始的字符串
         * @param {String} end 待检测的子串
         * @param {Boolean} [ignoreCase=false] 如果为true,比较时忽略大小写。
         */
        endsWith: function(s, end, ignoreCase){
            var result = boundsCheck(s, end);
            
            if (result) {
                if (ignoreCase) {
                    s = s.toLowerCase();
                    end = end.toLowerCase();
                }
                result = s.indexOf(end, s.length - end.length) !== -1;
            }
            return result;
        },

        /**
         * 一个字符串的字符转换成一个合法的,可解析的Javascript var命名，
         * 所传递的字符串包含至少一个字母字符，非字母数字字符， 和 *首字母* 非字母字符将被删除。
         *
         * @memberof Eui.String
         * @param {string} s 一个字符串转换成一个var的命名。
         * @return {string} 一个合法的Javascript var命名。
         */
        createVarName: function(s) {
            return s.replace(varReplace, '');
        },

        /**
         * 转义 `(&, <, >, ', 和 ")` 为能在HTML中显示的字符。
         *
         * @memberof Eui.String
         * @param {string} value 要编码的字符串。
         * @return {string} 编码后的文本。
         */
        htmlEncode: function(value) {
            return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
        },

        /**
         * 将 `(&, <, >, ', 和 ")` 字符从HTML显示的格式还原。
         *
         * @memberof Eui.String
         * @param {String} value 要解码的字符串。
         * @return {String} 解码后的文本。
         */
        htmlDecode: function(value) {
            return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
        },

        /**
         * 将一组字符实体定义添加到{@link Eui.String.htmlEncode|htmlEncode}  和 {@link Eui.String.htmlDecode|htmlDecode} 所使用的集合中。
         *
         * 此对象应由实体名称序列作为键， 值为该实体的文本形式表示。
         *
         *      Eui.String.addCharacterEntities({
         *          '&amp;Uuml;':'Ü',
         *          '&amp;ccedil;':'ç',
         *          '&amp;ntilde;':'ñ',
         *          '&amp;egrave;':'è'
         *      });
         *      var s = Eui.String.htmlEncode("A string with entities: èÜçñ");
         *
         * 注意: 在此对象上定义的字符实体的值预计将是单个字符的值。
         * 为此， 区分 javascript 源文件中定义的字符串文本形式时的字符编码字符所代表的实际值。
         * 引用为字符实体的服务器资源的脚本 tasgs 必须确保脚此节点的 'charset' 属性是符合实际的服务器资源的字符编码。
         *
         * 字符实体的集合可能被重置到默认状态， 通过{@link Eui.String.resetCharacterEntities|resetCharacterEntities}方法。
         *
         * @memberof Eui.String
         * @param {Object} entities 添加到当前定义的字符实体。
         *
         */
        addCharacterEntities: function(newEntities) {
            var charKeys = [],
                entityKeys = [],
                key, echar;
            for (key in newEntities) {
                echar = newEntities[key];
                entityToChar[key] = echar;
                charToEntity[echar] = key;
                charKeys.push(echar);
                entityKeys.push(key);
            }
            charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
            entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
        },

        /**
         * 重置 [htmlEncode]{@link Eui.String.htmlEncode|htmlEncode}  和 {@link Eui.String.htmlDecode|htmlDecode}
         * 所使用的字符实体的定义， 恢复到默认状态。
         *
         * @memberof Eui.String
         */
        resetCharacterEntities: function() {
            charToEntity = {};
            entityToChar = {};
            // add the default set
            this.addCharacterEntities({
                '&amp;'     :   '&',
                '&gt;'      :   '>',
                '&lt;'      :   '<',
                '&quot;'    :   '"',
                '&#39;'     :   "'"
            });
        },

        /**
         * 将内容追加到URL的查询字符串, 根据处理逻辑来判断放置一个'?'或'&'符号。
         *
         * @memberof Eui.String
         * @param {String} url 要追加到的URL。
         * @param {String} string 要加到URL的内容。
         * @return {String} 所生成的URL。
         */
        urlAppend : function(url, string) {
            if (!Eui.isEmpty(string)) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
            }

            return url;
        },

        /**
         * 裁剪字符串两旁的空白符，保留中间空白符，例如:
         *
         *     var s = '  foo bar  ';
         *     alert('-' + s + '-');                   //打印 "- foo bar -"
         *     alert('-' + Eui.String.trim(s) + '-');  //打印 "-foo bar-"
         *
         * @memberof Eui.String
         * @param {string} string 要裁剪的字符串。
         * @return {string} 已裁剪的字符串。
         */
        trim: function(string) {
            return string.replace(trimRegex, "");
        },

        /**
         * 返回一个字符串，该字符串中第一个字母为大写字母。
         *
         * @memberof Eui.String
         * @param {string} string 要转换的字符串。
         * @return {string} 转换后的字符串。
         */
        capitalize: function(string) {
            return string.charAt(0).toUpperCase() + string.substr(1);
        },

        /**
         * 返回一个字符串，该字符串中第一个字母为小写字母.
         *
         * @memberof Eui.String
         * @param {string} string 要转换的字符串。
         * @return {string} 转换后的字符串。
         */
        uncapitalize: function(string) {
            return string.charAt(0).toLowerCase() + string.substr(1);
        },

        /**
         * 对大于指定长度的字符串，进行裁剪，增加省略号('...')的显示。
         *
         * @memberof Eui.String
         * @param {string} value 要裁剪的字符串。
         * @param {number} length 要裁剪允许的最大长度。
         * @param {boolean} [word=false] 如果为 true，则试图找到一个共同的词符。
         * @return {string} 转换后的文本。
         */
        ellipsis: function(value, len, word) {
            if (value && value.length > len) {
                if (word) {
                    var vs = value.substr(0, len - 2),
                    index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                    if (index !== -1 && index >= (len - 15)) {
                        return vs.substr(0, index) + "...";
                    }
                }
                return value.substr(0, len - 3) + "...";
            }
            return value;
        },

        /**
         * 避免所传递的字符串在正则表达式中使用。
         *
         * @memberof Eui.String
         * @param {string} string
         * @return {string}
         */
        escapeRegex: function(string) {
            return string.replace(escapeRegexRe, "\\$1");
        },

        /**
         * 把输入的 ' 与 \ 字符转义。
         *
         * @memberof Eui.String
         * @param {string} string 要转义的字符。
         * @return {string} 转义后的字符。
         */
        escape: function(string) {
            return string.replace(escapeRe, "\\$1");
        },

        /**
         * 比较并交换字符串的值。 参数中的第一个值与当前字符串对象比较，
         * 如果相等则返回传入的第一个参数，否则返回第二个参数。
         *
         * 注意：这个方法返回新值，但并不改变现有字符串。
         *
         *     // 可供选择的排序方向。
         *     sort = Eui.String.toggle(sort, 'ASC', 'DESC');
         *
         *     // 等价判断语句：
         *     sort = (sort === 'ASC' ? 'DESC' : 'ASC');
         *
         * @memberof Eui.String
         * @param {string} string 当前字符串。
         * @param {string} value 第一个参数，与当前字符串相等则返回。
         * @param {string} other 传入的第二个参数，不等返回。
         * @return {string} 新值。
         */
        toggle: function(string, value, other) {
            return string === value ? other : value;
        },

        /**
         * 在字符串左边填充指定字符。 这对于统一字符或日期标准格式非常有用。例如:
         *
         *     var s = Eui.String.leftPad('123', 5, '0');
         *     // s now contains the string: '00123'
         *
         * @memberof Eui.String
         * @param {string} string 原字符串
         * @param {bumber} size 源加上填充字符串的总长度
         * @param {string} [character=' '] （可选的）填充字符串（默认是" "）
         * @return {string} 填充后的字符串。
         */
        leftPad: function(string, size, character) {
            var result = String(string);
            character = character || " ";
            while (result.length < size) {
                result = character + result;
            }
            return result;
        },

        /**
         * 定义带标记的字符串，并用传入的字符替换标记。
         * 每个标记必须是唯一的，而且必须要像{0},{1}...{n}这样地自增长。
         *
         * 例如：
         *
         *     var cls = 'my-class',
         *         text = 'Some text';
         *     var s = Eui.String.format('<div class="{0}">{1}</div>', cls, text);
         *     // s now contains the string: '<div class="my-class">Some text</div>'
         *
         * @memberof Eui.String
         * @param {string} string 带标记的字符串。
         * @param {...Mixed} values 值依次替换标记“{ 0 }”,“{ 1 }”等。
         * @return {string} 格式化后的字符串。
         */
        format: function(format) {
            var args = Eui.Array.toArray(arguments, 1);
            return format.replace(formatRe, function(m, i) {
                return args[i];
            });
        },

        /**
         * 根据给定的格式字符串与指定的重复次数返回一个新的格式字符串。
         * 该格式字符串由一个不同的字符串分隔。
         *
         *      var s = Eui.String.repeat('---', 4); // = '------------'
         *      var t = Eui.String.repeat('--', 3, '/'); // = '--/--/--'
         *
         * @memberof Eui.String
         * @param {string} pattern 要重复的格式字符串。
         * @param {number} count 重复格式字符串的次数(可能是0)。
         * @param {string} sep 要分隔每个格式字符串的选项字符串。
         */
        repeat: function(pattern, count, sep) {
            if (count < 1) {
                count = 0;
            }
            for (var buf = [], i = count; i--; ) {
                buf.push(pattern);
            }
            return buf.join(sep || '');
        },

        /**
         * 根据需要裁剪，按照一个或多个空格进行分割一个字符串并将返回的词存到数组中，
         * 如果词已经是一个数组,它将被返回。
         *
         * @memberof Eui.String
         * @param {string/Array} words
         */
        splitWords: function (words) {
            if (words && typeof words == 'string') {
                return words.replace(basicTrimRe, '').split(whitespaceRe);
            }
            return words || [];
        }
    };
}());

// initialize the default encode / decode entities
Eui.String.resetCharacterEntities();

/**
 * Old alias to {@link Eui.String.htmlEncode|htmlEncode}
 * @deprecated Use {@link Eui.String.htmlEncode|htmlEncode} instead
 * @method htmlEncode
 * @memberof $
 */
Eui.htmlEncode = Eui.String.htmlEncode;


/**
 * Old alias to {@link Eui.String.htmlDecode|htmlDecode}
 * @deprecated Use {@link Eui.String.htmlDecode|htmlDecode} instead
 * @method htmlDecode
 * @memberof $
 */
Eui.htmlDecode = Eui.String.htmlDecode;

/**
 * Old alias to {@link Eui.String.urlAppend|urlAppend}
 * @deprecated Use {@link Eui.String.urlAppend|urlAppend} instead
 * @method urlAppend
 * @memberof $
 * @see {@link Eui.String.urlAppend}
 */
Eui.urlAppend = Eui.String.urlAppend;
/**
 *
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/format.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 此类是一个用于格式化函数集中的类。 它包括要格式化的各种不同类型数据的函数，如文本、日期和数值。
 *  
 * ## 本地化
 *
 * 此类包含本地化的一些选项。
 * 当类库加载完后才可以将这些选项设置进去, 从这里对函数的所有调用将都使用指定的语言环境设置。
 *
 * 选项包括:
 *
 * - thousandSeparator
 * - decimalSeparator
 * - currenyPrecision
 * - currencySign
 * - currencyAtEnd
 *
 * 此类还在这里使用定义的默认日期格式: {@link Eui.Date.defaultFormat}.
 *  
 * @namespace Eui.util.Format
 */
(function() {

    var UtilFormat     = Eui.util.Format = {},
        stripTagsRE    = /<\/?[^>]+>/gi,
        stripScriptsRe = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,
        nl2brRe        = /\r?\n/g,
        allHashes      = /^#+$/,

        // Match a format string characters to be able to detect remaining "literal" characters
        formatPattern = /[\d,\.#]+/,

        // A RegExp to remove from a number format string, all characters except digits and '.'
        formatCleanRe  = /[^\d\.#]/g,

        // A RegExp to remove from a number format string, all characters except digits and the local decimal separator.
        // Created on first use. The local decimal separator character must be initialized for this to be created.
        I18NFormatCleanRe,

        // Cache ofg number formatting functions keyed by format string
        formatFns = {};

    Eui.apply(UtilFormat, {
        //<locale>
        /**
         * @memberof Eui.util.Format
         * @type {String}
         * @default ','
         * @desc {@link Eui.util.Format.number}函数使用作为千位分隔符的字符。
         *
         * 此属性可能被本地文件所覆盖。
         */
        thousandSeparator: ',',
        //</locale>

        //<locale>
        /**
         * @memberof Eui.util.Format
         * @type {String}
         * @default '.'
         * @desc {@link Eui.util.Format.number}函数使用作为小数点的字符。
         *
         * 此属性可能被本地文件所覆盖。
         */
        decimalSeparator: '.',
        //</locale>

        //<locale>
        /**
         * @memberof Eui.util.Format
         * @type {Number}
         * @default 2
         * @desc {@link Eui.util.Format.currency}函数显示的小数位数。
         *
         * 此属性可能被本地文件所覆盖。
         */
        currencyPrecision: 2,
        //</locale>

         //<locale>
        /**
         * @memberof Eui.util.Format
         * @type {String}
         * @default '$'
         * @desc {@link Eui.util.Format.currency}货币函数显示的货币符号。
         *
         * 此属性可能被本地文件所覆盖。
         */
        currencySign: '$',
        //</locale>

        //<locale>
        /**
         * @memberof Eui.util.Format
         * @type {Boolean}
         * @default false
         * @desc 此属性可以设置成true以使{@link Eui.util.Format.currency}函数将货币符号追加到格式化的值。
         *
         * 此属性可能被本地文件所覆盖。
         */
        currencyAtEnd: false,
        //</locale>

        /**
         * 检查一个引用，如果它是undefined则将它转换成空字符串。
         *
         * @memberof Eui.util.Format
         * @param {Object} value 要检查的引用值
         * @return {Object} 如果转换过，则为空字符串，否则为原先的值。
         */
        undef : function(value) {
            return value !== undefined ? value : "";
        },

        /**
         * 检查一个引用，如果它为空则转换成一个默认值。
         *
         * @memberof Eui.util.Format
         * @param {Object} value 要检查的引用值
         * @param {String} [defaultValue=""] 如果为undefined时插入的值(默认为"")。
         * @return {String}
         */
        defaultValue : function(value, defaultValue) {
            return value !== undefined && value !== '' ? value : defaultValue;
        },

        /**
         * 返回原字符串中的一个子串。
         *
         * @memberof Eui.util.Format
         * @param {String} value 原始文本
         * @param {Number} start 子串的起始索引位置
         * @param {Number} length 子串的长度
         * @return {String} 指定长度的子字符串
         * @method
         */
        substr : 'ab'.substr(-1) != 'b'
        ? function (value, start, length) {
            var str = String(value);
            return (start < 0)
                ? str.substr(Math.max(str.length + start, 0), length)
                : str.substr(start, length);
        }
        : function(value, start, length) {
            return String(value).substr(start, length);
        },

        /**
         * 返回一个字符串，该字符串中的字母被转换为小写字母。
         *
         * @memberof Eui.util.Format
         * @param {String} value 要转换的字符串
         * @return {String} 转换后的字符串。
         */
        lowercase : function(value) {
            return String(value).toLowerCase();
        },

        /**
         * 返回一个字符串，该字符串中的字母被转换为大写字母。
         *
         * @memberof Eui.util.Format
         * @param {String} value 要转换的字符串
         * @return {String} 转换后的字符串
         */
        uppercase : function(value) {
            return String(value).toUpperCase();
        },

        /**
         * 将一个数值格式化成美元形式。
         *
         * @memberof Eui.util.Format
         * @param {Number/String} value 需要进行格式化的数值
         * @return {String} 格式化后的美元字符串
         */
        usMoney : function(v) {
            return UtilFormat.currency(v, '$', 2);
        },

        /**
         * 将一个数值格式化成货币形式。
         *
         * @memberof Eui.util.Format
         * @param {Number/String} value 需要进行格式化的数值
         * @param {String} [sign] 使用的货币符号(缺省值为{@link Eui.util.Format.currencySign})
         * @param {Number} [decimals] 使用的货币值小数点后的位数(缺省值为{@link Eui.util.Format.currencyPrecision})
         * @param {Boolean} [end] 如果为true则货币符号应追加在字符串的结尾(缺省值为{@link Eui.util.Format.currencyAtEnd})
         * @return {String} 格式化后的货币字符串
         */
        currency: function(v, currencySign, decimals, end) {
            var negativeSign = '',
                format = ",0",
                i = 0;
            v = v - 0;
            if (v < 0) {
                v = -v;
                negativeSign = '-';
            }
            decimals = Eui.isDefined(decimals) ? decimals : UtilFormat.currencyPrecision;
            format += (decimals > 0 ? '.' : '');
            for (; i < decimals; i++) {
                format += '0';
            }
            v = UtilFormat.number(v, format);
            if ((end || UtilFormat.currencyAtEnd) === true) {
                return Eui.String.format("{0}{1}{2}", negativeSign, v, currencySign || UtilFormat.currencySign);
            } else {
                return Eui.String.format("{0}{1}{2}", negativeSign, currencySign || UtilFormat.currencySign, v);
            }
        },

        /**
         * 将某个值解析成为一个特定格式的日期。
         *
         * @memberof Eui.util.Format
         * @param {String/Date} value 需要格式化的值(字符串必须符合 javascript Date对象的parse()方法期望的格式)。
         * @param {String} [format] 任何有效的日期格式字符串。默认为{@link Eui.Date.defaultFormat}.
         * @return {String} 格式化后的日期字符串。
         */
        date: function(v, format) {
            if (!v) {
                return "";
            }
            if (!Eui.isDate(v)) {
                v = new Date(Date.parse(v));
            }
            return Eui.Date.dateFormat(v, format || Eui.Date.defaultFormat);
        },

        /**
         * 返回一个日期渲染函数，它可以高效地，多次反复应用到日期格式上。
         *
         * @memberof Eui.util.Format
         * @param {String} format 任何有效的日期格式字符串。默认为{@link Eui.Date.defaultFormat}.
         * @return {Function} 日期格式函数
         */
        dateRenderer : function(format) {
            return function(v) {
                return UtilFormat.date(v, format);
            };
        },

        /**
         * 去除所有HTML标签。
         *
         * @memberof Eui.util.Format
         * @param {Object} value 需要从其中去掉标签的文本
         * @return {String} 去除标签后的文本
         */
        stripTags : function(v) {
            return !v ? v : String(v).replace(stripTagsRE, "");
        },

        /**
         * 去掉所有script标签。
         *
         * @memberof Eui.util.Format
         * @param {Object} value 需要去除script标签的文本
         * @return {String} 去掉script标签后的文本
         */
        stripScripts : function(v) {
            return !v ? v : String(v).replace(stripScriptsRe, "");
        },

        /**
         * 对文件大小进行简单的格式化(xxx bytes, xxx KB, xxx MB)
         * @function
         * @memberof Eui.util.Format
         * @param {Number/String} size 需要格式化的数值
         * @return {String} 格式化后的文件大小
         */
        fileSize : (function(){
            var byteLimit = 1024,
                kbLimit = 1048576,
                mbLimit = 1073741824;
                
            return function(size) {
                var out;
                if (size < byteLimit) {
                    if (size === 1) {
                        out = '1 byte';    
                    } else {
                        out = size + ' bytes';
                    }
                } else if (size < kbLimit) {
                    out = (Math.round(((size*10) / byteLimit))/10) + ' KB';
                } else if (size < mbLimit) {
                    out = (Math.round(((size*10) / kbLimit))/10) + ' MB';
                } else {
                    out = (Math.round(((size*10) / mbLimit))/10) + ' GB';
                }
                return out;
            };
        })(),

        /**
         * 进行简单的匹配，以便用在一个模板中。
         * @function
         * @memberof Eui.util.Format
         * @return {Function} 在传递的值上进行操作的函数。
         */
        math : (function(){
            var fns = {};

            return function(v, a){
                if (!fns[a]) {
                    fns[a] = Eui.functionFactory('v', 'return v ' + a + ';');
                }
                return fns[a](v);
            };
        }()),

        /**
         * 将所传递的数字四舍五入到所需的精度。
         *
         * @memberof Eui.util.Format
         * @param {Number/String} value 需要四舍五入的数值。
         * @param {Number} precision 用来四舍五入第一个参数值的小数位数值。
         * @return {Number} 四舍五入后的值。
         */
        round : function(value, precision) {
            var result = Number(value);
            if (typeof precision == 'number') {
                precision = Math.pow(10, precision);
                result = Math.round(value * precision) / precision;
            }
            return result;
        },

        /**
         * 根据传入的格式字符串将传递的数字格式化。
         *
         * 小数分隔符数字的数量 ，精确了小数位 在字条串的位置。在结果中使用*区域特定设置*的小数位字符。
         *
         * *出现*在格式字符串中的千位分隔字符将被插入到 *区域特定设置*(如果存在)的千位分隔符列表中。
         *
         * 默认情况下，","预期作为千位分隔符，和"."预期作为小数点分隔符。
         *
         * 当插入千位和小数分隔符进行格式化输出时总是 使用区域设置的特定字符。
         *
         * 根据美国/英国的惯例，格式化字符串必须指定分隔字符 ("," 作为 千位分隔符, 和 "." 作为小数点分隔符)。
         *
         * 允许字符串的格式规范根据当地惯例的分隔字符,将字符串 /i添加到格式字符串的末尾。
         *
         * 例如 (123456.789):
         * 
         * - `0` - (123456) 只显示整数，没有小数
         * - `0.00` - (123456.78) 精确到两位小数
         * - `0.0000` - (123456.7890) 精确到四位小数
         * - `0,000` - (123,456) 显示逗号和整数，没有小数
         * - `0,000.00` - (123,456.78) 显示逗号和两位小数
         * - `0,0.00` - (123,456.78) 快捷方法，显示逗号和两位小数
         * - `0.####` - (123,456,789) 在一些国际化的场合需要反转分组（,）和小数位（.），那么就在后面加上/i. 例如: 0.000,00/i
         *
         * @memberof Eui.util.Format
         * @param {Number} v 需要格式化的数字。
         * @param {String} format 你需要格式化文本的方式。
         * @return {String} 格式化后的数字。
         */
        number : function(v, formatString) {
            if (!formatString) {
                return v;
            }
            var formatFn = formatFns[formatString];

            // Generate formatting function to be cached and reused keyed by the format string.
            // This results in a 100% performance increase over analyzing the format string each invocation.
            if (!formatFn) {

                var originalFormatString = formatString,
                    comma = UtilFormat.thousandSeparator,
                    decimalSeparator = UtilFormat.decimalSeparator,
                    hasComma,
                    splitFormat,
                    extraChars,
                    precision = 0,
                    multiplier,
                    trimTrailingZeroes,
                    code;

                // The "/i" suffix allows caller to use a locale-specific formatting string.
                // Clean the format string by removing all but numerals and the decimal separator.
                // Then split the format string into pre and post decimal segments according to *what* the
                // decimal separator is. If they are specifying "/i", they are using the local convention in the format string.
                if (formatString.substr(formatString.length - 2) == '/i') {
                    if (!I18NFormatCleanRe) {
                        I18NFormatCleanRe = new RegExp('[^\\d\\' + UtilFormat.decimalSeparator + ']','g');
                    }
                    formatString = formatString.substr(0, formatString.length - 2);
                    hasComma = formatString.indexOf(comma) != -1;
                    splitFormat = formatString.replace(I18NFormatCleanRe, '').split(decimalSeparator);
                } else {
                    hasComma = formatString.indexOf(',') != -1;
                    splitFormat = formatString.replace(formatCleanRe, '').split('.');
                }
                extraChars = formatString.replace(formatPattern, '');

                if (splitFormat.length > 2) {
                    //<debug>
                    console.log("Invalid number format, should have no more than 1 decimal");
                    //</debug>
                } else if (splitFormat.length === 2) {
                    precision = splitFormat[1].length;

                    // Formatting ending in .##### means maximum 5 trailing significant digits
                    trimTrailingZeroes = allHashes.test(splitFormat[1]);
                }
                
                // The function we create is called immediately and returns a closure which has access to vars and some fixed values; RegExes and the format string.
                code = [
                    'var utilFormat=Eui.util.Format,extNumber=Eui.Number,neg,fnum,parts' +
                        (hasComma ? ',thousandSeparator,thousands=[],j,n,i' : '') +
                        (extraChars  ? ',formatString="' + formatString + '",formatPattern=/[\\d,\\.#]+/' : '') +
                        (trimTrailingZeroes ? ',trailingZeroes=/\\.?0+$/;' : ';') +
                    'return function(v){' +
                    'if(typeof v!=="number"&&isNaN(v=extNumber.from(v,NaN)))return"";' +
                    'neg=v<0;',
                    'fnum=Eui.Number.toFixed(Math.abs(v), ' + precision + ');'
                ];

                if (hasComma) {
                    // If we have to insert commas...
                    
                    // split the string up into whole and decimal parts if there are decimals
                    if (precision) {
                        code[code.length] = 'parts=fnum.split(".");';
                        code[code.length] = 'fnum=parts[0];';
                    }
                    code[code.length] =
                        'if(v>=1000) {';
                            code[code.length] = 'thousandSeparator=utilFormat.thousandSeparator;' +
                            'thousands.length=0;' +
                            'j=fnum.length;' +
                            'n=fnum.length%3||3;' +
                            'for(i=0;i<j;i+=n){' +
                                'if(i!==0){' +
                                    'n=3;' +
                                '}' +
                                'thousands[thousands.length]=fnum.substr(i,n);' +
                            '}' +
                            'fnum=thousands.join(thousandSeparator);' + 
                        '}';
                    if (precision) {
                        code[code.length] = 'fnum += utilFormat.decimalSeparator+parts[1];';
                    }
                    
                } else if (precision) {
                    // If they are using a weird decimal separator, split and concat using it
                    code[code.length] = 'if(utilFormat.decimalSeparator!=="."){' +
                        'parts=fnum.split(".");' +
                        'fnum=parts[0]+utilFormat.decimalSeparator+parts[1];' +
                    '}';
                }

                if (trimTrailingZeroes) {
                    code[code.length] = 'fnum=fnum.replace(trailingZeroes,"");';
                }

                /*
                 * Edge case. If we have a very small negative number it will get rounded to 0,
                 * however the initial check at the top will still report as negative. Replace
                 * everything but 1-9 and check if the string is empty to determine a 0 value.
                 */
                code[code.length] = 'if(neg&&fnum!=="' + (precision ? '0.' + Eui.String.repeat('0', precision) : '0') + '")fnum="-"+fnum;';

                code[code.length] = 'return ';

                // If there were extra characters around the formatting string, replace the format string part with the formatted number.
                if (extraChars) {
                    code[code.length] = 'formatString.replace(formatPattern, fnum);';
                } else {
                    code[code.length] = 'fnum;';
                }
                code[code.length] = '};';

                formatFn = formatFns[originalFormatString] = Eui.functionFactory('Eui', code.join(''))(Eui);
            }
            return formatFn(v);
        },

        /**
         * 返回一个数值渲染函数，它可以高效地，多次反复应用到数值格式上。
         *
         * @memberof Eui.util.Format
         * @param {String} format 对{@link Eui.util.Format.number}任何有效的数值格式字符串。
         * @return {Function} 数值格式化函数
         */
        numberRenderer : function(format) {
            return function(v) {
                return UtilFormat.number(v, format);
            };
        },

        /**
         * Formats an object of name value properties as HTML element attribute values suitable for using when creating textual markup.
         * @memberof Eui.util.Format
         * @param {Object} attributes An object containing the HTML attributes as properties eg: `{height:40, vAlign:'top'}`
         */
        attributes: function(attributes) {
            if (typeof attributes === 'object') {
                var result = [],
                    name;

                for (name in attributes) {
                    result.push(name, '="', name === 'style' ? Eui.DomHelper.generateStyles(attributes[name]) : Eui.htmlEncode(attributes[name]), '"');
                }
                attributes = result.join('');
            }
            return attributes||'';
        },

        /**
         * 根据一个数值，可对单词选用一个复数形式。
         * 例如，在模板中:
         * {commentCount:plural("Comment")} 如果commentCount为1 ，
         * 那么结果就是"1 Comment"， 如果值为0或者大于1就是"x Comments"。
         *
         * @memberof Eui.util.Format
         * @param {Number} value 需要用来对比的值
         * @param {String} singular 单词的单数格式
         * @param {String} [plural] (可选) 单词的复数形式(默认为单数格式加一个"s")
         */
        plural : function(v, s, p) {
            return v +' ' + (v == 1 ? s : (p ? p : s+'s'));
        },

        /**
         * 将换行字符串格式化成HTML标签 `<br/>`
         *
         * @memberof Eui.util.Format
         * @param {String} v 需要格式化的字符串值。
         * @return {String} 包含内嵌 `<br/>`标签的字符串，用来替代换行。
         */
        nl2br : function(v) {
            return Eui.isEmpty(v) ? '' : v.replace(nl2brRe, '<br/>');
        },

        /**
         * {@link Eui.String.capitalize} 方法别名.
         * @memberof Eui.util.Format
         * @method
         */
        capitalize: Eui.String.capitalize,

        /**
         * {@link Eui.String.ellipsis} 方法别名.
         * @method
         * @memberof Eui.util.Format
         */
        ellipsis: Eui.String.ellipsis,

        /**
         * {@link Eui.String.format} 方法别名.
         * @method
         * @memberof Eui.util.Format
         */
        format: Eui.String.format,

        /**
         * {@link Eui.String.htmlDecode} 方法别名.
         * @method
         * @memberof Eui.util.Format
         */
        htmlDecode: Eui.String.htmlDecode,

        /**
         * {@link Eui.String.htmlEncode} 方法别名.
         * @method
         * @memberof Eui.util.Format
         */
        htmlEncode: Eui.String.htmlEncode,

        /**
         * {@link Eui.String.leftPad} 方法别名.
         * @method
         * @memberof Eui.util.Format
         */
        leftPad: Eui.String.leftPad,

        /**
         * {@link Eui.String.trim} 方法别名.
         * @method
         * @memberof Eui.util.Format
         */
        trim : Eui.String.trim,

        /**
         * 解析一个数字或字符串，表示成一个对象的边距大小。
         * 支持CSS-style声明中设置的外边距属性
         * (例如 10, "10", "10 10", "10 10 10" 和 "10 10 10 10"
         * 均是有效的选项，并将返回相同的结果)
         *
         * @memberof Eui.util.Format
         * @param {Number/String} v 已编码的边距
         * @return {Object} 一个具有上，右，下，左边距宽度的对象。
         */
        parseBox : function(box) {
            box = box || 0;

            if (typeof box === 'number') {
                return {
                    top   : box,
                    right : box,
                    bottom: box,
                    left  : box
                };
             }

            var parts  = box.split(' '),
                ln = parts.length;

            if (ln == 1) {
                parts[1] = parts[2] = parts[3] = parts[0];
            }
            else if (ln == 2) {
                parts[2] = parts[0];
                parts[3] = parts[1];
            }
            else if (ln == 3) {
                parts[3] = parts[1];
            }

            return {
                top   :parseInt(parts[0], 10) || 0,
                right :parseInt(parts[1], 10) || 0,
                bottom:parseInt(parts[2], 10) || 0,
                left  :parseInt(parts[3], 10) || 0
            };
        },

        /**
         * 避免所传递的字符串用在一个正则表达式中。
         *
         * @memberof Eui.util.Format
         * @param {String} str
         * @return {String}
         */
        escapeRegex : function(s) {
            return s.replace(/([\-.*+?\^${}()|\[\]\/\\])/g, "\\$1");
        }
    });
}());

/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/number.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 一组处理数字的实用静态方法集合。
 * @namespace Eui.Number
 */
Eui.Number = new function() {

    var me = this,
        isToFixedBroken = (0.9).toFixed() !== '1',
        math = Math;

    Eui.apply(this, {

        /**
         * 检查给定的数值是否在约束的范围内。 如果在范围内就返回此数值。否则，如果大于最大值则返回最大值，如果小于最小值则返回最小值。
         * 注意本方法不改变给定的数值本身。
         *
         * @memberof Eui.Number
         * @param {number} number 要检查的数值
         * @param {number} min 范围的最小值
         * @param {number} max 范围的最大值
         * @return {number} 如果范围以外，则返回约束的值,否则返回当前值。
         */
        constrain: function(number, min, max) {
            var x = parseFloat(number);

            // Watch out for NaN in Chrome 18
            // V8bug: http://code.google.com/p/v8/issues/detail?id=2056

            // OpEuitors are faster than Math.min/max. See http://jsperf.com/number-constrain
            // ... and (x < Nan) || (x < undefined) == false
            // ... same for (x > NaN) || (x > undefined)
            // so if min or max are undefined or NaN, we never return them... sadly, this
            // is not true of null (but even Math.max(-1,null)==0 and isNaN(null)==false)
            return (x < min) ? min : ((x > max) ? max : x);
        },

        /**
         * Snaps the passed number between stopping points based upon a passed increment value.
         *
         * The difference between this and {@link snapInRange} is that {@link #snapInRange} uses the minValue
         * when calculating snap points:
         *
         *     r = Eui.Number.snap(56, 2, 55, 65);        // Returns 56 - snap points are zero based
         *
         *     r = Eui.Number.snapInRange(56, 2, 55, 65); // Returns 57 - snap points are based from minValue
         *
         * @memberof Eui.Number
         * @param {number} value The unsnapped value.
         * @param {number} increment The increment by which the value must move.
         * @param {number} minValue The minimum value to which the returned value must be constrained. Overrides the increment.
         * @param {number} maxValue The maximum value to which the returned value must be constrained. Overrides the increment.
         * @return {number} The value of the nearest snap target.
         */
        snap : function(value, increment, minValue, maxValue) {
            var m;

            // If no value passed, or minValue was passed and value is less than minValue (anything < undefined is false)
            // Then use the minValue (or zero if the value was undefined)
            if (value === undefined || value < minValue) {
                return minValue || 0;
            }

            if (increment) {
                m = value % increment;
                if (m !== 0) {
                    value -= m;
                    if (m * 2 >= increment) {
                        value += increment;
                    } else if (m * 2 < -increment) {
                        value -= increment;
                    }
                }
            }
            return me.constrain(value, minValue,  maxValue);
        },

        /**
         * Snaps the passed number between stopping points based upon a passed increment value.
         *
         * The difference between this and {@link #snap} is that {@link #snap} does not use the minValue
         * when calculating snap points:
         *
         *     r = Eui.Number.snap(56, 2, 55, 65);        // Returns 56 - snap points are zero based
         *
         *     r = Eui.Number.snapInRange(56, 2, 55, 65); // Returns 57 - snap points are based from minValue
         *
         * @memberof Eui.Number
         * @param {number} value The unsnapped value.
         * @param {number} increment The increment by which the value must move.
         * @param {number} [minValue=0] The minimum value to which the returned value must be constrained.
         * @param {number} [maxValue=Infinity] The maximum value to which the returned value must be constrained.
         * @return {number} The value of the nearest snap target.
         */
        snapInRange : function(value, increment, minValue, maxValue) {
            var tween;

            // default minValue to zero
            minValue = (minValue || 0);

            // If value is undefined, or less than minValue, use minValue
            if (value === undefined || value < minValue) {
                return minValue;
            }

            // Calculate how many snap points from the minValue the passed value is.
            if (increment && (tween = ((value - minValue) % increment))) {
                value -= tween;
                tween *= 2;
                if (tween >= increment) {
                    value += increment;
                }
            }

            // If constraining within a maximum, ensure the maximum is on a snap point
            if (maxValue !== undefined) {
                if (value > (maxValue = me.snapInRange(maxValue, increment, minValue))) {
                    value = maxValue;
                }
            }

            return value;
        },

        /**
         * Formats a number using fixed-point notation
         *
         * @memberof Eui.Number
         * @function
         * @param {number} value The number to format
         * @param {number} precision The number of digits to show after the decimal point
         */
        toFixed: isToFixedBroken ? function(value, precision) {
            precision = precision || 0;
            var pow = math.pow(10, precision);
            return (math.round(value * pow) / pow).toFixed(precision);
        } : function(value, precision) {
            return value.toFixed(precision);
        },

        /**
         * Validate that a value is numeric and convert it to a number if necessary. Returns the specified default value if
         * it is not.
         *
         *       Eui.Number.from('1.23', 1); // returns 1.23
         *       Eui.Number.from('abc', 1); // returns 1
         *
         * @memberof Eui.Number
         * @param {Object} value
         * @param {number} defaultValue The value to return if the original value is non-numeric
         * @return {number} value, if numeric, defaultValue otherwise
         */
        from: function(value, defaultValue) {
            if (isFinite(value)) {
                value = parseFloat(value);
            }

            return !isNaN(value) ? value : defaultValue;
        },

        /**
         * Returns a random integer between the specified range (inclusive)
         *
         * @memberof Eui.Number
         * @param {number} from Lowest value to return.
         * @param {number} to Highst value to return.
         * @return {number} A random integer within the specified range.
         */
        randomInt: function (from, to) {
           return math.floor(math.random() * (to - from + 1) + from);
        },
        
        /**
         * Corrects floating point numbers that overflow to a non-precise
         * value because of their floating nature, for example `0.1 + 0.2`
         *
         * @memberof Eui.Number
         * @param {number} The number
         * @return {number} The correctly rounded number
         */
        correctFloat: function(n) {
            // This is to correct the type of errors where 2 floats end with
            // a long string of decimals, eg 0.1 + 0.2. When they overflow in this
            // manner, they usually go to 15-16 decimals, so we cut it off at 14.
            return parseFloat(n.toPrecision(14));
        }
    });

    /**
     * Old alias to {@link Eui.Number.from|from}
     * @memberof $
     * @method num
     */
    Eui.num = function() {
        return me.from.apply(this, arguments);
    };
};
/**
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/array.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 一组处理数组的实用静态方法集合; 提供某些老版本浏览器缺少的方法.
 * @namespace Eui.Array
 */
(function() {

    var arrayPrototype = Array.prototype,
        slice = arrayPrototype.slice,
        supportsSplice = (function () {
            var array = [],
                lengthBefore,
                j = 20;

            if (!array.splice) {
                return false;
            }

            // This detects a bug in IE8 splice method:
            // see http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/6e946d03-e09f-4b22-a4dd-cd5e276bf05a/

            while (j--) {
                array.push("A");
            }

            array.splice(15, 0, "F", "F", "F", "F", "F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F");

            lengthBefore = array.length; //41
            array.splice(13, 0, "XXX"); // add one element

            if (lengthBefore+1 != array.length) {
                return false;
            }
            // end IE8 bug

            return true;
        }()),
        supportsForEach = 'forEach' in arrayPrototype,
        supportsMap = 'map' in arrayPrototype,
        supportsIndexOf = 'indexOf' in arrayPrototype,
        supportsEvery = 'every' in arrayPrototype,
        supportsSome = 'some' in arrayPrototype,
        supportsFilter = 'filter' in arrayPrototype,
        supportsSort = (function() {
            var a = [1,2,3,4,5].sort(function(){ return 0; });
            return a[0] === 1 && a[1] === 2 && a[2] === 3 && a[3] === 4 && a[4] === 5;
        }()),
        supportsSliceOnNodeList = true,
        ExtArray,
        erase,
        replace,
        splice;

    try {
        // IE 6 - 8 will throw an error when using Array.prototype.slice on NodeList
        if (typeof document !== 'undefined') {
            slice.call(document.getElementsByTagName('body'));
        }
    } catch (e) {
        supportsSliceOnNodeList = false;
    }

    function fixArrayIndex (array, index) {
        return (index < 0) ? Math.max(0, array.length + index)
                           : Math.min(array.length, index);
    }

    function replaceSim (array, index, removeCount, insert) {
        var add = insert ? insert.length : 0,
            length = array.length,
            pos = fixArrayIndex(array, index),
            remove,
            tailOldPos,
            tailNewPos,
            tailCount,
            lengthAfterRemove,
            i;

        // we try to use Array.push when we can for efficiency...
        if (pos === length) {
            if (add) {
                array.push.apply(array, insert);
            }
        } else {
            remove = Math.min(removeCount, length - pos);
            tailOldPos = pos + remove;
            tailNewPos = tailOldPos + add - remove;
            tailCount = length - tailOldPos;
            lengthAfterRemove = length - remove;

            if (tailNewPos < tailOldPos) { // case A
                for (i = 0; i < tailCount; ++i) {
                    array[tailNewPos+i] = array[tailOldPos+i];
                }
            } else if (tailNewPos > tailOldPos) { // case B
                for (i = tailCount; i--; ) {
                    array[tailNewPos+i] = array[tailOldPos+i];
                }
            } // else, add == remove (nothing to do)

            if (add && pos === lengthAfterRemove) {
                array.length = lengthAfterRemove; // truncate array
                array.push.apply(array, insert);
            } else {
                array.length = lengthAfterRemove + add; // reserves space
                for (i = 0; i < add; ++i) {
                    array[pos+i] = insert[i];
                }
            }
        }

        return array;
    }

    function replaceNative (array, index, removeCount, insert) {
        if (insert && insert.length) {
            // Inserting at index zero with no removing: use unshift
            if (index === 0 && !removeCount) {
                array.unshift.apply(array, insert);
            }
            // Inserting/replacing in middle of array
            else if (index < array.length) {
                array.splice.apply(array, [index, removeCount].concat(insert));
            }
            // Appending to array
            else {
                array.push.apply(array, insert);
            }
        } else {
            array.splice(index, removeCount);
        }
        return array;
    }

    function eraseSim (array, index, removeCount) {
        return replaceSim(array, index, removeCount);
    }

    function eraseNative (array, index, removeCount) {
        array.splice(index, removeCount);
        return array;
    }

    function spliceSim (array, index, removeCount) {
        var pos = fixArrayIndex(array, index),
            removed = array.slice(index, fixArrayIndex(array, pos+removeCount));

        if (arguments.length < 4) {
            replaceSim(array, pos, removeCount);
        } else {
            replaceSim(array, pos, removeCount, slice.call(arguments, 3));
        }

        return removed;
    }

    function spliceNative (array) {
        return array.splice.apply(array, slice.call(arguments, 1));
    }

    erase = supportsSplice ? eraseNative : eraseSim;
    replace = supportsSplice ? replaceNative : replaceSim;
    splice = supportsSplice ? spliceNative : spliceSim;

    // NOTE: from here on, use erase, replace or splice (not native methods)...

    ExtArray = Eui.Array = {
        /**
         * 迭代一个数组或是可迭代的值，在每个元素上调用给定的回调函数。
         *
         *     var countries = ['Vietnam', 'Singapore', 'United States', 'Russia'];
         *
         *     Eui.Array.each(countries, function(name, index, countriesItSelf) {
         *         console.log(name);
         *     });
         *
         *     var sum = function() {
         *         var sum = 0;
         *
         *         Eui.Array.each(arguments, function(value) {
         *             sum += value;
         *         });
         *
         *         return sum;
         *     };
         *
         *     sum(1, 2, 3); // returns 6
         *
         * 在回调函数中返回false，即可停止迭代过程。
         *
         *     Eui.Array.each(countries, function(name, index, countriesItSelf) {
         *         if (name === 'Singapore') {
         *             return false; // break here
         *         }
         *     });
         *
         * {@link Eui#each Eui.each} 是 {@link Eui.Array#each Eui.Array.each}的别名。
         * @memberof Eui.Array
         * @param {Array/NodeList/Object} array 将要迭代的值。
         * 如果这个参数不可迭代，回调函数将只调用一次。
         * @param {Function} fn 回调函数. 如果返回false, 迭代将停止， 方法返回当前的索引.
         * @param {Object} fn.item 数组当前的索引中的元素
         * @param {Number} fn.index 数组当前的索引
         * @param {Array} fn.allItems 作为方法第一个参数的数组本身
         * @param {Boolean} fn.return 返回false来停止迭代。
         * @param {Object} scope (Optional) 指定函数执行的(this 引用)作用域。
         * @param {Boolean} [reverse=false] 反转迭代的顺序（从尾到头循环）。
         * @return {Boolean} 参见 fn 参数的描述.
         */
        each: function(array, fn, scope, reverse) {
            array = ExtArray.from(array);

            var i,
                ln = array.length;

            if (reverse !== true) {
                for (i = 0; i < ln; i++) {
                    if (fn.call(scope || array[i], array[i], i, array) === false) {
                        return i;
                    }
                }
            }
            else {
                for (i = ln - 1; i > -1; i--) {
                    if (fn.call(scope || array[i], array[i], i, array) === false) {
                        return i;
                    }
                }
            }

            return true;
        },

        /**
         * 迭代一个数组，在每个元素上调用给定的回调函数。
         * 注意如果原生的Array.prototype.forEach被支持， 这个函数将委托到Array.prototype.forEach。
         * 它不支持像{@link Eui.Array.each}一样， 通过返回一个false来停止迭代。
         * 因此，其性能在现代的浏览器中会比{@link Eui.Array.each}更好。
         *
         * @memberof Eui.Array
         * @function
         * @param {Array} array 要迭代的数组
         * @param {Function} fn 回调函数
         * @param {Object} fn.item 数组当前的索引中的元素
         * @param {Number} fn.index 数组当前的索引
         * @param {Array}  fn.allItems 作为方法第一个参数的数组本身
         * @param {Object} scope (Optional) 指定函数执行的(this 引用)作用域。
         */
        forEach: supportsForEach ? function(array, fn, scope) {
            array.forEach(fn, scope);
        } : function(array, fn, scope) {
            var i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                fn.call(scope, array[i], i, array);
            }
        },

        /**
         * 查找指定元素在数组中的索引位置， 补充IE中缺少的arrayPrototype.indexOf原生方法。
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array 要检查的数组
         * @param {Object} item 要查找的元素
         * @param {Number} from (Optional) 搜索的起始位置
         * @return {Number} 元素在数组中的索引位置（找不到时为-1）
         */
        indexOf: supportsIndexOf ? function(array, item, from) {
            return arrayPrototype.indexOf.call(array, item, from);
         } : function(array, item, from) {
            var i, length = array.length;

            for (i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }

            return -1;
        },

        /**
         * 检查数组中是否包含给定元素。
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array 要检查的数组
         * @param {Object} item 要查找的元素
         * @return {Boolean} 数组包含元素则为true，否则为false。
         */
        contains: supportsIndexOf ? function(array, item) {
            return arrayPrototype.indexOf.call(array, item) !== -1;
        } : function(array, item) {
            var i, ln;

            for (i = 0, ln = array.length; i < ln; i++) {
                if (array[i] === item) {
                    return true;
                }
            }

            return false;
        },

        /**
         * 将一个可迭代元素(具有数字下标和length属性)转换为一个真正的数组。
         *
         *     function test() {
         *         var args = Eui.Array.toArray(arguments),
         *             fromSecondToLastArgs = Eui.Array.toArray(arguments, 1);
         *
         *         alert(args.join(' '));
         *         alert(fromSecondToLastArgs.join(' '));
         *     }
         *
         *     test('just', 'testing', 'here'); // 提示  'just testing here';
         *                                      // 提示  'testing here';
         *
         *     Eui.Array.toArray(document.getElementsByTagName('div')); // 将把 NodeList 转换成一个数组
         *     Eui.Array.toArray('splitted'); // returns ['s', 'p', 'l', 'i', 't', 't', 'e', 'd']
         *     Eui.Array.toArray('splitted', 0, 3); // returns ['s', 'p', 'l']
         *
         * {@link Eui#toArray Eui.toArray}是 {@link Eui.Array#toArray Eui.Array.toArray}的别名。
         *
         * @function
         * @memberof Eui.Array
         * @param {Object} itEuible 可迭代的对象。
         * @param {Number} start (Optional) 从0开始的索引，表示要转换的起始位置. 默认为 0。
         * @param {Number} end (Optional) 从1开始的索引，表示要转换的结束位置。 默认为要迭代元素的末尾位置。
         * @return {Array} array
         */
        toArray: function(itEuible, start, end){
            if (!itEuible || !itEuible.length) {
                return [];
            }

            if (typeof itEuible === 'string') {
                itEuible = itEuible.split('');
            }

            if (supportsSliceOnNodeList) {
                return slice.call(itEuible, start || 0, end || itEuible.length);
            }

            var array = [],
                i;

            start = start || 0;
            end = end ? ((end < 0) ? itEuible.length + end : end) : itEuible.length;

            for (i = start; i < end; i++) {
                array.push(itEuible[i]);
            }

            return array;
        },

        /**
         * 获取数组中每个元素的制定属性值. 示例:
         *
         *     Eui.Array.pluck(Eui.query("p"), "className"); // [el1.className, el2.className, ..., elN.className]
         *
         * @memberof Eui.Array
         * @param {Array/NodeList} array The Array of items to pluck the value from.
         * @param {String} propertyName 元素的属性名称。
         * @return {Array} 从数组中的每一项的值。
         */
        pluck: function(array, propertyName) {
            var ret = [],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                ret.push(item[propertyName]);
            }

            return ret;
        },

        /**
         * 通过在数组的每个元素中调用一个特定函数，用结果创建一个新数组。
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array
         * @param {Function} fn 每个元素上的回调函数。
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being itEuited.
         * @param {Object} [scope] 回调函数的作用域。
         * @return {Array} results
         */
        map: supportsMap ? function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.map must have a callback function passed as second argument.');
            }
            //</debug>
            return array.map(fn, scope);
        } : function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.map must have a callback function passed as second argument.');
            }
            //</debug>
            var results = [],
                i = 0,
                len = array.length;

            for (; i < len; i++) {
                results[i] = fn.call(scope, array[i], i, array);
            }

            return results;
        },

        /**
         * 在数组的每个元素上执行指定函数，
         * 直到函数返回一个false值 如果某个元素上返回了false值，
         * 本函数立即返回false 否则函数返回true
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array
         * @param {Function} fn 每个元素上的回调函数。
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being itEuited.
         * @param {Object} scope 回调函数的作用域
         * @return {Boolean} 如果回调函数没有返回false值则为true。
         */
        every: supportsEvery ? function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.every must have a callback function passed as second argument.');
            }
            //</debug>
            return array.every(fn, scope);
        } : function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.every must have a callback function passed as second argument.');
            }
            //</debug>
            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (!fn.call(scope, array[i], i, array)) {
                    return false;
                }
            }

            return true;
        },

        /**
         * 在数组的每个元素上执行指定函数，
         * 直到函数返回一个true值 如果某个元素上返回了true值，本函数立即返回true。
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array
         * @param {Function} fn 每个元素上的回调函数
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being itEuited.
         * @param {Object} scope 回调函数的作用域
         * @return {Boolean} 如果回调函数返回一个true值则为true。
         */
        some: supportsSome ? function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.some must have a callback function passed as second argument.');
            }
            //</debug>
            return array.some(fn, scope);
        } : function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.some must have a callback function passed as second argument.');
            }
            //</debug>
            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (fn.call(scope, array[i], i, array)) {
                    return true;
                }
            }

            return false;
        },
        
        /**
         * 比较两个数组是否绝对的相等。
         *
         * @memberof Eui.Array
         * @param {Array} array1
         * @param {Array} array2
         * @return {Boolean} 如果相等，则返回true。
         */
        equals: function(array1, array2) {
            var len1 = array1.length,
                len2 = array2.length,
                i;
                
            // Short circuit if the same array is passed twice
            if (array1 === array2) {
                return true;
            }
                
            if (len1 !== len2) {
                return false;
            }
            
            for (i = 0; i < len1; ++i) {
                if (array1[i] !== array2[i]) {
                    return false;
                }
            }
            
            return true;
        },

        /**
         * 过滤掉数组里的空值，空值的定义见 {@link Eui.isEmpty}
         *
         * 参见 {@link Eui.Array.filter}.
         *
         * @memberof Eui.Array
         * @param {Array} array
         * @return {Array} results
         */
        clean: function(array) {
            var results = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (!Eui.isEmpty(item)) {
                    results.push(item);
                }
            }

            return results;
        },

        /**
         * 返回一个去掉重复元素的新数组。
         *
         * @memberof Eui.Array
         * @param {Array} array
         * @return {Array} results
         */
        unique: function(array) {
            var clone = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (ExtArray.indexOf(clone, item) === -1) {
                    clone.push(item);
                }
            }

            return clone;
        },

        /**
         * Creates a new array with all of the elements of this array for which
         * the provided filtering function returns true.
         *
         * @function
         * @param {Array} array
         * @param {Function} fn Callback function for each item
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being itEuited.
         * @param {Object} scope Callback function scope
         * @return {Array} results
         */
        filter: supportsFilter ? function(array, fn, scope) {
            //<debug>
            if (!fn) {
                console.log('Eui.Array.filter must have a filter function passed as second argument.');
            }
            //</debug>
            return array.filter(fn, scope);
        } : function(array, fn, scope) {
            //<debug>
            if (!fn) {
                console.log('Eui.Array.filter must have a filter function passed as second argument.');
            }
            //</debug>
            var results = [],
                i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                if (fn.call(scope, array[i], i, array)) {
                    results.push(array[i]);
                }
            }

            return results;
        },

        /**
         * Returns the first item in the array which elicits a true return value from the
         * passed selection function.
         *
         * @memberof Eui.Array
         * @param {Array} array The array to search
         * @param {Function} fn The selection function to execute for each item.
         * @param {Mixed} fn.item The array item.
         * @param {String} fn.index The index of the array item.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the
         * function is executed. Defaults to the array
         * @return {Object} The first item in the array which returned true from the selection
         * function, or null if none was found.
         */
        findBy : function(array, fn, scope) {
            var i = 0,
                len = array.length;

            for (; i < len; i++) {
                if (fn.call(scope || array, array[i], i)) {
                    return array[i];
                }
            }
            return null;
        },

        /**
         * 将一个值转换为一个数组，函数返回:
         *
         * - 一个空数组，如果给定的值是 undefined 或 null
         * - 数组本身，如果已经是一个数组
         * - 一个数组的拷贝，如果给定的值是 {@link Eui#isItEuible itEuible} (arguments, NodeList 等等)
         * - 一个包含给定值作为唯一元素的数组 ,其他情况。
         *
         * @memberof Eui.Array
         * @param {Object} value 给定的值
         * @param {Boolean} newReference (Optional) 为true则如有必要克隆给定数组然后返回一个其新引用 默认为false。
         * @return {Array} array
         */
        from: function(value, newReference) {
            if (value === undefined || value === null) {
                return [];
            }

            if (Eui.isArray(value)) {
                return (newReference) ? slice.call(value) : value;
            }

            var type = typeof value;
            // Both strings and functions will have a length property. In phantomJS, NodeList
            // instances report typeof=='function' but don't have an apply method...
            if (value && value.length !== undefined && type !== 'string' && (type !== 'function' || !value.apply)) {
                return ExtArray.toArray(value);
            }

            return [value];
        },

        /**
         * 移除数组中的指定元素。
         *
         * @memberof Eui.Array
         * @param {Array} array 重复
         * @param {Object} item 要移除的元素
         * @return {Array} 数组本身
         */
        remove: function(array, item) {
            var index = ExtArray.indexOf(array, item);

            if (index !== -1) {
                erase(array, index, 1);
            }

            return array;
        },

        /**
         * 把一个元素插入到数组，如果它不存在于这个数组。
         *
         * @memberof Eui.Array
         * @param {Array} array 数组
         * @param {Object} item 待插入的元素
         */
        include: function(array, item) {
            if (!ExtArray.contains(array, item)) {
                array.push(item);
            }
        },

        /**
         * 克隆一个数组，而不引用原数组，注意着不同于Eui.clone，Eui.clone不递归克隆。
         * 它把Array.prototype.slice.call(array)方法简化 成一个方便的、容易记住的方法。
         *
         * @memberof Eui.Array
         * @param {Array} array 数组
         * @return {Array} 克隆的数组
         */
        clone: function(array) {
            return slice.call(array);
        },

        /**
         * 合并多个数组中的不重复元素到一个数组。
         *
         * {@link Eui.Array#union}是{@link Eui.Array#merge}的别名。
         *
         * @memberof Eui.Array
         * @param {Array} array1
         * @param {Array} array2
         * @param {Array} etc
         * @return {Array} 合并的数组
         */
        merge: function() {
            var args = slice.call(arguments),
                array = [],
                i, ln;

            for (i = 0, ln = args.length; i < ln; i++) {
                array = array.concat(args[i]);
            }

            return ExtArray.unique(array);
        },

        /**
         * 返回多个数组的公共交集。
         *
         * @memberof Eui.Array
         * @param {Array} array1
         * @param {Array} array2
         * @param {Array} etc
         * @return {Array} 交集
         */
        intersect: function() {
            var intersection = [],
                arrays = slice.call(arguments),
                arraysLength,
                array,
                arrayLength,
                minArray,
                minArrayIndex,
                minArrayCandidate,
                minArrayLength,
                element,
                elementCandidate,
                elementCount,
                i, j, k;

            if (!arrays.length) {
                return intersection;
            }

            // Find the smallest array
            arraysLength = arrays.length;
            for (i = minArrayIndex = 0; i < arraysLength; i++) {
                minArrayCandidate = arrays[i];
                if (!minArray || minArrayCandidate.length < minArray.length) {
                    minArray = minArrayCandidate;
                    minArrayIndex = i;
                }
            }

            minArray = ExtArray.unique(minArray);
            erase(arrays, minArrayIndex, 1);

            // Use the smallest unique'd array as the anchor loop. If the other array(s) do contain
            // an item in the small array, we're likely to find it before reaching the end
            // of the inner loop and can terminate the search early.
            minArrayLength = minArray.length;
            arraysLength = arrays.length;
            for (i = 0; i < minArrayLength; i++) {
                element = minArray[i];
                elementCount = 0;

                for (j = 0; j < arraysLength; j++) {
                    array = arrays[j];
                    arrayLength = array.length;
                    for (k = 0; k < arrayLength; k++) {
                        elementCandidate = array[k];
                        if (element === elementCandidate) {
                            elementCount++;
                            break;
                        }
                    }
                }

                if (elementCount === arraysLength) {
                    intersection.push(element);
                }
            }

            return intersection;
        },

        /**
         * 返回 A-B的差异集合，从A中减去所有B中存在的元素。
         *
         * @memberof Eui.Array
         * @param {Array} arrayA
         * @param {Array} arrayB
         * @return {Array} A中不同于B的元素
         */
        difference: function(arrayA, arrayB) {
            var clone = slice.call(arrayA),
                ln = clone.length,
                i, j, lnB;

            for (i = 0,lnB = arrayB.length; i < lnB; i++) {
                for (j = 0; j < ln; j++) {
                    if (clone[j] === arrayB[i]) {
                        erase(clone, j, 1);
                        j--;
                        ln--;
                    }
                }
            }

            return clone;
        },

        /**
         * 返回一个数组中一部分的浅表复制。
         * 等价于 原生方法 "Array.prototype.slice.call(array, begin, end)"。
         * 经常被使用于数组 作为arguments，arguments对象没有提供slice方法，
         * 但是可以作为上下文对象使用 Array.prototype.slice方法。
         *
         * @memberof Eui.Array
         * @param {Array} array 数组 (或 arguments 对象)
         * @param {Number} begin 起始索引。为负值则 从数组的末尾计算位移
         * @param {Number} end 结束索引。 复制元素不包括结尾处的元素。
         * 为负值则从数组的末尾计算位移，如果结尾被省略，
         * 数组中一直到结尾的所有元素将被复制。
         *
         * @return {Array} 数组的拷贝件.
         * @method slice
         */
        // Note: IE6 will return [] on slice.call(x, undefined).
        slice: ([1,2].slice(1, undefined).length ?
            function (array, begin, end) {
                return slice.call(array, begin, end);
            } :
            // at least IE6 uses arguments.length for variadic signature
            function (array, begin, end) {
                // After tested for IE 6, the one below is of the best performance
                // see http://jsperf.com/slice-fix
                if (typeof begin === 'undefined') {
                    return slice.call(array);
                }
                if (typeof end === 'undefined') {
                    return slice.call(array, begin);
                }
                return slice.call(array, begin, end);
            }
        ),

        /**
         * 排序数组中的元素 默认使用字母表，按升序排序。
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array 进行排序的数组。
         * @param {Function} sortFn (optional) 比较函数.
         * @param {Mixed} sortFn.a An item to compare.
         * @param {Mixed} sortFn.b Another item to compare.
         * @return {Array} 排序后的数组.
         */
        sort: supportsSort ? function(array, sortFn) {
            if (sortFn) {
                return array.sort(sortFn);
            } else {
                return array.sort();
            }
         } : function(array, sortFn) {
            var length = array.length,
                i = 0,
                comparison,
                j, min, tmp;

            for (; i < length; i++) {
                min = i;
                for (j = i + 1; j < length; j++) {
                    if (sortFn) {
                        comparison = sortFn(array[j], array[min]);
                        if (comparison < 0) {
                            min = j;
                        }
                    } else if (array[j] < array[min]) {
                        min = j;
                    }
                }
                if (min !== i) {
                    tmp = array[i];
                    array[i] = array[min];
                    array[min] = tmp;
                }
            }

            return array;
        },

        /**
         * 递归将数组和数组中的元素转换为一维数组。
         *
         * @memberof Eui.Array
         * @param {Array} array The array to flatten
         * @return {Array} 一维数组.
         */
        flatten: function(array) {
            var worker = [];

            function rFlatten(a) {
                var i, ln, v;

                for (i = 0, ln = a.length; i < ln; i++) {
                    v = a[i];

                    if (Eui.isArray(v)) {
                        rFlatten(v);
                    } else {
                        worker.push(v);
                    }
                }

                return worker;
            }

            return rFlatten(array);
        },

        /**
         * 返回数组中的最小值。
         *
         * @memberof Eui.Array
         * @param {Array/NodeList} array The Array from which to select the minimum value.
         * @param {Function} comparisonFn (optional) 比较函数 如果被忽略，
         * 则使用 "<" 操作符。 注意: gt = 1; eq = 0; lt = -1
         * @param {Mixed} comparisonFn.min Current minimum value.
         * @param {Mixed} comparisonFn.item The value to compare with the current minimum.
         * @return {Object} minValue 最小值
         */
        min: function(array, comparisonFn) {
            var min = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(min, item) === 1) {
                        min = item;
                    }
                }
                else {
                    if (item < min) {
                        min = item;
                    }
                }
            }

            return min;
        },

        /**
         * 返回数组中的最大值。
         *
         * @memberof Eui.Array
         * @param {Array/NodeList} array The Array from which to select the maximum value.
         * @param {Function} comparisonFn (optional) 比较函数 如果被忽略，则使用 ">" 操作符。
         * 注意: gt = 1; eq = 0; lt = -1
         * @param {Mixed} comparisonFn.max Current maximum value.
         * @param {Mixed} comparisonFn.item The value to compare with the current maximum.
         * @return {Object} maxValue 最大值
         */
        max: function(array, comparisonFn) {
            var max = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(max, item) === -1) {
                        max = item;
                    }
                }
                else {
                    if (item > max) {
                        max = item;
                    }
                }
            }

            return max;
        },

        /**
         * 计算数组中元素的平均值。
         *
         * @memberof Eui.Array
         * @param {Array} array 待计算平均值的数组.
         * @return {Number} 平均值.
         */
        mean: function(array) {
            return array.length > 0 ? ExtArray.sum(array) / array.length : undefined;
        },

        /**
         * 计算数组中元素的和。
         *
         * @memberof Eui.Array
         * @param {Array} array 待计算总和的数组.
         * @return {Number} 总和.
         */
        sum: function(array) {
            var sum = 0,
                i, ln, item;

            for (i = 0,ln = array.length; i < ln; i++) {
                item = array[i];

                sum += item;
            }

            return sum;
        },

        /**
         * 使用给定数组中的元素作为key，创建一个map对象，值是元素的索引+1。示例:
         * 
         *      var map = Eui.Array.toMap(['a','b','c']);
         *
         *      // map = { a: 1, b: 2, c: 3 };
         * 
         * 或者指定一个key属性:
         * 
         *      var map = Eui.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], 'name');
         *
         *      // map = { a: 1, b: 2, c: 3 };
         * 
         * 当然, 也可以指定一个key生成函数:
         * 
         *      var map = Eui.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], function (obj) { return obj.name.toUpperCase(); });
         *
         *      // map = { A: 1, B: 2, C: 3 };
         *
         * @memberof Eui.Array
         * @param {Array} array The Array to create the map from.
         * @param {String/Function} [getKey] Name of the object property to use
         * as a key or a function to extract the key.
         * @param {Object} [scope] Value of this inside callback.
         * @return {Object} The resulting map.
         */
        toMap: function(array, getKey, scope) {
            var map = {},
                i = array.length;

            if (!getKey) {
                while (i--) {
                    map[array[i]] = i+1;
                }
            } else if (typeof getKey == 'string') {
                while (i--) {
                    map[array[i][getKey]] = i+1;
                }
            } else {
                while (i--) {
                    map[getKey.call(scope, array[i])] = i+1;
                }
            }

            return map;
        },

        /**
         * Creates a map (object) keyed by a property of elements of the given array. The values in
         * the map are the array element. For example:
         * 
         *      var map = Eui.Array.toMap(['a','b','c']);
         *
         *      // map = { a: 'a', b: 'b', c: 'c' };
         * 
         * Or a key property can be specified:
         * 
         *      var map = Eui.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], 'name');
         *
         *      // map = { a: {name: 'a'}, b: {name: 'b'}, c: {name: 'c'} };
         * 
         * Lastly, a key extractor can be provided:
         * 
         *      var map = Eui.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], function (obj) { return obj.name.toUpperCase(); });
         *
         *      // map = { A: {name: 'a'}, B: {name: 'b'}, C: {name: 'c'} };
         *
         * @memberof Eui.Array
         * @param {Array} array The Array to create the map from.
         * @param {String/Function} [getKey] Name of the object property to use
         * as a key or a function to extract the key.
         * @param {Object} [scope] Value of this inside callback.
         * @return {Object} The resulting map.
         */
        toValueMap: function(array, getKey, scope) {
            var map = {},
                i = array.length;

            if (!getKey) {
                while (i--) {
                    map[array[i]] = array[i];
                }
            } else if (typeof getKey == 'string') {
                while (i--) {
                    map[array[i][getKey]] = array[i];
                }
            } else {
                while (i--) {
                    map[getKey.call(scope, array[i])] = array[i];
                }
            }

            return map;
        },

        //<debug>
        _replaceSim: replaceSim, // for unit testing
        _spliceSim: spliceSim,
        //</debug>

        /**
         * 移除数组中的多个元素。这个功能相当于Array的splice方法。
         * 但是避免了IE8的splice函数bug，不会复制移除的元素并按次序返回它们。（因为它们通常被忽略）
         *
         * @memberof Eui.Array
         * @param {Array} array 数组
         * @param {Number} index 要操作的索引位置
         * @param {Number} removeCount 要移除的元素数量
         * @return {Array} 处理后的数组。
         * @method
         */
        erase: erase,

        /**
         * 在数组中插入多个元素。
         *
         * @memberof Eui.Array
         * @param {Array} array 数组.
         * @param {Number} index 插入的位置索引
         * @param {Array} items 要插入的多个元素
         * @return {Array} 插入后的数组。
         */
        insert: function (array, index, items) {
            return replace(array, index, 0, items);
        },

        /**
         * 替换数组里的多个元素。这个功能相当于Array的splice方法。
         * 但是避免了IE8的splice函数bug，而且更便于使用，
         * 因为它插入一个元素的数组，而不是一个可变参数列表。
         *
         * @memberof Eui.Array
         * @param {Array} array 数组.
         * @param {Number} index要操作的索引位置.
         * @param {Number} removeCount 要移除的元素数量（可以为0）.
         * @param {Array} insert (optional) 要插入的数组.
         * @return {Array} 处理后的数组
         * @method
         */
        replace: replace,

        /**
         * 替换数组里的多个元素。这个功能相当于Array的splice方法。
         * 但是避免了IE8的splice函数bug，
         * 除了第一个argument参数以外， 与splice方法的签名相同。
         * removeCount后面的所有参数都将被插入到指定位置。
         *
         * @memberof Eui.Array
         * @param {Array} array 待替换的数组.
         * @param {Number} index 要操作的索引位置
         * @param {Number} removeCount 要移除的元素数量（可以为0）
         * @param {...Object} elements 要添加到数组的多个元素.
         * 如果没有指定任何元素，splice简化为从数组移除元素。
         * @return {Array} 处理后的数组。
         * @method
         */
        splice: splice,

        /**
         * 在数组的末尾添加新的元素。
         *
         * 参数可能是一个元素集合、也可能是多个元素集合的数组。
         * 如果参数列表中存在一个数组， 则它的所有元素都将被添加到给定数组的末尾。
         *
         * @memberof Eui.Array
         * @param {Array} target 目标数组
         * @param {...Object} elements 要添加的元素。
         * 每个元素可能也是一个数组。
         * 这种情形下，各数组的所有元素也将被添加到目标数组的末尾。
         * @return {Array} 处理后的数组。
         *
         */
        push: function(array) {
            var len = arguments.length,
                i = 1,
                newItem;

            if (array === undefined) {
                array = [];
            } else if (!Eui.isArray(array)) {
                array = [array];
            }
            for (; i < len; i++) {
                newItem = arguments[i];
                Array.prototype.push[Eui.isIterable(newItem) ? 'apply' : 'call'](array, newItem);
            }
            return array;
        }
    };

    /**
     * @method union
     * @memberof Eui.Array
     */
    ExtArray.union = ExtArray.merge;

    /**
     * Old alias to {@link Eui.Array.min|min}
     * @method min
     * @memberof $
     */
    Eui.min = ExtArray.min;

    /**
     * Old alias to {@link Eui.Array.max|max}
     * @method max
     * @memberof $
     */
    Eui.max = ExtArray.max;

    /**
     * Old alias to {@link Eui.Array.sum|sum}
     * @method sum
     * @memberof $
     */
    Eui.sum = ExtArray.sum;

    /**
     * Old alias to {@link Eui.Array.mean|mean}
     * @method mean
     * @memberof $
     */
    Eui.mean = ExtArray.mean;

    /**
     * Old alias to {@link Eui.Array.flatten|flatten}
     * @method flatten
     * @memberof $
     */
    Eui.flatten = ExtArray.flatten;

    /**
     * Old alias to {@link Eui.Array.clean|clean}
     * @method clean
     * @memberof $
     */
    Eui.clean = ExtArray.clean;

    /**
     * Old alias to {@link Eui.Array.unique|unique}
     * @method unique
     * @memberof $
     */
    Eui.unique = ExtArray.unique;

    /**
     * Old alias to {@link Eui.Array.pluck|pluck}
     * @method  pluck
     * @memberof $
     */
    Eui.pluck = ExtArray.pluck;

    /**
     * @method toArray
     * @memberof $
     */
    Eui.toArray = function() {
        return ExtArray.toArray.apply(ExtArray, arguments);
    };
}());

/**
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/function.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 处理回调函数的常用静态方法的集合.
 * @namespace Eui.Function
 */
Eui.Function = {

    /**
     * 整个框架的一个很常用的方法。 它作为另一种方法的包装，最初接受2个参数 name 和 value。
     * 被包装的函数可以"灵活"的对值进行设置为其他值:
     *
     * - `name` 和 `value` 作为2个参数
     * - 一个单一的对象参数与多个键-值对
     *
     * 示例:
     *
     *     var setValue = Eui.Function.flexSetter(function(name, value) {
     *         this[name] = value;
     *     });
     *
     *     // 之后，设置单个名称-值
     *     setValue('name1', 'value1');
     *
     *     // 设置多个名称-值对
     *     setValue({
     *         name1: 'value1',
     *         name2: 'value2',
     *         name3: 'value3'
     *     });
     *
     * @param {Function} setter
     * @returns {Function} flexSetter
     */
    flexSetter: function(fn) {
        return function(a, b) {
            var k, i;

            if (a === null) {
                return this;
            }

            if (typeof a !== 'string') {
                for (k in a) {
                    if (a.hasOwnProperty(k)) {
                        fn.call(this, k, a[k]);
                    }
                }

                if (Eui.enumerables) {
                    for (i = Eui.enumerables.length; i--;) {
                        k = Eui.enumerables[i];
                        if (a.hasOwnProperty(k)) {
                            fn.call(this, k, a[k]);
                        }
                    }
                }
            } else {
                fn.call(this, a, b);
            }

            return this;
        };
    },

    /**
     * 根据指定函数 fn 创建一个代理函数，更改 this 作用域为传入的作用域，
     * 可以选择重写调用的参数。(默认为该函数的参数列表)
     *
     * {@link Eui#bind Eui.bind}是{@link Eui.Function#bind Eui.Function.bind}的别名
     *
     * @param {Function} fn 需要被代理的原始函数.
     * @param {Object} scope (可选) 该函数执行的作用域(this引用)。
     *  如果省略，默认指向默认的全局环境对象(通常是window).
     * @param {Array} args (可选) 覆盖原函数的参数列表（默认为该函数的参数列表）
     * @param {Boolean/Number} appendArgs (可选) 如果该参数为true，将参数加载到该函数的后面，
     * 如果该参数为数字类型，则将参数将插入到所指定的位置。
     * @return {Function} 新的函数.
     */
    bind: function(fn, scope, args, appendArgs) {
        if (arguments.length === 2) {
            return function() {
                return fn.apply(scope, arguments);
            };
        }

        var method = fn,
            slice = Array.prototype.slice;

        return function() {
            var callArgs = args || arguments;

            if (appendArgs === true) {
                callArgs = slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }
            else if (typeof appendArgs == 'number') {
                callArgs = slice.call(arguments, 0); // copy arguments first
                Eui.Array.insert(callArgs, appendArgs, args);
            }

            return method.apply(scope || Eui.global, callArgs);
        };
    },

    /**
     * 从提供'fn'创建一个新的函数，其中的参数预先设置到 'args'。
     * 新的参数传递到新创建的回调函数中，调用时追加到预先设定的参数之后。
     * 创建的回调时，这是特别有用的。
     *
     * 示例:
     *
     *     var originalFunction = function(){
     *         alert(Eui.Array.from(arguments).join(' '));
     *     };
     *
     *     var callback = Eui.Function.pass(originalFunction, ['Hello', 'World']);
     *
     *     callback(); // 执行结果为 'Hello World'
     *     callback('by Me'); // // 执行结果为 'Hello World by Me'
     *
     * {@link Eui#pass Eui.pass} 是{@link Eui.Function#pass Eui.Function.pass}的别名.
     *
     * @param {Function} fn 原始函数.
     * @param {Array} args 要传递给新的回调函数的参数.
     * @param {Object} scope (可选) 该函数执行的作用域(this引用).
     * @return {Function} 新的回调函数
     */
    pass: function(fn, args, scope) {
        if (!Eui.isArray(args)) {
            if (Eui.isIterable(args)) {
                args = Eui.Array.clone(args);
            } else {
                args = args !== undefined ? [args] : [];
            }
        }

        return function() {
            var fnArgs = [].concat(args);
            fnArgs.push.apply(fnArgs, arguments);
            return fn.apply(scope || this, fnArgs);
        };
    },

    /**
     * 为object提供的方法属性名称为methodName的方法创建一个别名。
     * 注意,执行的作用域仍将被绑定到所提供的“对象”本身。
     *
     * @param {Object/Function} object
     * @param {String} methodName
     * @return {Function} aliasFn
     */
    alias: function(object, methodName) {
        return function() {
            return object[methodName].apply(object, arguments);
        };
    },

    /**
     * 为当前提供的方法创建一个"克隆"。
     * 返回的方法将调用传递所有的参数和"this"指针沿给定的方法，并返回其结果。
     *
     * @param {Function} method
     * @return {Function} cloneFn
     */
    clone: function(method) {
        return function() {
            return method.apply(this, arguments);
        };
    },

    /**
     * 创建一个拦截函数。传递的函数在原函数之前被调用。
     * 如果拦截函数返回false， 则原函数不会被调用。
     * 在返回函数中，将返回原函数的返回值。 拦截函数被调用时会被传入原函数的参数。
     *
     * 示例:
     *
     *     var sayHi = function(name){
     *         alert('Hi, ' + name);
     *     }
     *
     *     sayHi('Fred'); // 提示 "Hi, Fred"
     *
     *     // 不修改原函数的前提下,创建新的验证函数:
     *     var sayHiToFriend = Eui.Function.createInterceptor(sayHi, function(name){
     *         return name == 'Brian';
     *     });
     *
     *     sayHiToFriend('Fred');  // 没提示
     *     sayHiToFriend('Brian'); // 提示 "Hi, Brian"
     *
     * @param {Function} origFn 原始函数.
     * @param {Function} newFn 新的拦截函数
     * @param {Object} [scope] (可选) 传递的函数执行的作用域(this引用)。
     * 如果省略，默认指向被调用的原函数作用域或window。
     * @param {Object} [returnValue=null] (可选)返回的值，如果传递的函数返回false（默认为 null）。
     * @return {Function} The new function
     */
    createInterceptor: function(origFn, newFn, scope, returnValue) {
        var method = origFn;
        if (!Eui.isFunction(newFn)) {
            return origFn;
        } else {
            returnValue = Eui.isDefined(returnValue) ? returnValue : null;
            return function() {
                var me = this,
                    args = arguments;
                    
                newFn.target = me;
                newFn.method = origFn;
                return (newFn.apply(scope || me || Eui.global, args) !== false) ? origFn.apply(me || Eui.global, args) : returnValue;
            };
        }
    },

    /**
     * 创建一个委派对象（就是回调），调用时，在一个特定的延迟后执行。
     *
     * @param {Function} fn 当返回的函数调用时，该函数将在一个延迟后被调用。
     * 可选地,可以指定一个更换(或更多)的参数列表。
     * @param {Number} delay 每当调用时推迟执行的毫秒数。
     * @param {Object} scope (可选) 函数在执行时所使用的作用域(this引用)。
     * @param {Array} args (可选) 覆盖原函数的参数列表（默认为该函数的参数列表）。
     * @param {Boolean/Number} appendArgs (可选) 如果该参数为true，将参数加载到该函数的后面，
     * 如果该参数为数字类型，则将参数将插入到所指定的位置。
     * @return {Function} 一个函数，调用时，在指定的延迟之后执行原函数。
     */
    createDelayed: function(fn, delay, scope, args, appendArgs) {
        if (scope || args) {
            fn = Eui.Function.bind(fn, scope, args, appendArgs);
        }

        return function() {
            var me = this,
                args = Array.prototype.slice.call(arguments);

            setTimeout(function() {
                fn.apply(me, args);
            }, delay);
        };
    },

    /**
     * 延迟调用该函数。你可以加入一个作用域的参数，例如:
     *
     *     var sayHi = function(name){
     *         alert('Hi, ' + name);
     *     }
     *
     *     // 即刻执行:
     *     sayHi('Fred');
     *
     *     // 两秒过后执行：
     *     Eui.Function.defer(sayHi, 2000, this, ['Fred']);
     *
     *     // 有时候加上一个匿名，函数也是很方便的：
     *     Eui.Function.defer(function(){
     *         alert('Anonymous');
     *     }, 100);
     *
     * {@link Eui#defer Eui.defer} 是 {@link Eui.Function#defer Eui.Function.defer}的别名。
     *
     * @param {Function} fn 要延迟执行的函数。
     * @param {Number} millis 延迟时间，以毫秒为单位 (如果小于或等于 0 函数则立即执行)
     * @param {Object} scope (可选) 该函数执行的作用域(this引用)。
     * 如果省略，默认指向window。
     * @param {Array} args (可选) 覆盖原函数的参数列表 (默认为该函数的参数列表)
     * @param {Boolean/Number} appendArgs (可选) 如果该参数为true，将参数加载到该函数的后面，
     * 如果该参数为数字类型，则将参数将插入到所指定的位置。
     * @return {Number} 可被clearTimeout所使用的timeout id。
     */
    defer: function(fn, millis, scope, args, appendArgs) {
        fn = Eui.Function.bind(fn, scope, args, appendArgs);
        if (millis > 0) {
            return setTimeout(Eui.supports.TimeoutActualLateness ? function () {
                fn();
            } : fn, millis);
        }
        fn();
        return 0;
    },

    /**
     * 创建一个组合函数，调用次序为：原函数 + 参数中的函数。
     * 该函数返回了原函数执行的结果（也就是返回了原函数的返回值）。
     * 在参数中传递的函数，它的参数也是原函数的参数。 用法示例:
     *
     *     var sayHi = function(name){
     *         alert('Hi, ' + name);
     *     }
     *
     *     sayHi('Fred'); // 提示 "Hi, Fred"
     *
     *     var sayGoodbye = Eui.Function.createSequence(sayHi, function(name){
     *         alert('Bye, ' + name);
     *     });
     *
     *     sayGoodbye('Fred'); //  显示两个提示
     *
     * @param {Function} originalFn 原始函数。
     * @param {Function} newFn 新的组合函数。
     * @param {Object} scope (可选) 传递的函数执行的作用域(this引用)。
     * 如果省略，默认指向默认的全局环境对象(通常是window)。
     * @return {Function} 新的函数
     */
    createSequence: function(originalFn, newFn, scope) {
        if (!newFn) {
            return originalFn;
        }
        else {
            return function() {
                var result = originalFn.apply(this, arguments);
                newFn.apply(scope || this, arguments);
                return result;
            };
        }
    },

    /**
     * 创建一个缓冲函数，可选绑定范围，在调用时， 根据配置的毫秒数缓冲执行传递的函数。
     * 如果在此期间该函数被重复调用，则第一次调用将被取消， 重新开始计算缓冲时间。
     *
     * @param {Function} fn 需要被缓冲的原始函数。
     * @param {Number} buffer 缓冲函数调用执行的时间，单位是毫秒。
     * @param {Object} scope (可选) 该对象将作为代理函数执行的作用域(this引用)。
     * 如果省略，默认为调用者指定的作用域。
     * @param {Array} args (可选) 覆盖该次调用的参数列表。（默认为该函数的参数列表）。
     * @return {Function} 一个函数，在指定的时间缓冲之后调用传递的函数。
     */
    createBuffered: function(fn, buffer, scope, args) {
        var timerId;

        return function() {
            var callArgs = args || Array.prototype.slice.call(arguments, 0),
                me = scope || this;

            if (timerId) {
                clearTimeout(timerId);
            }

            timerId = setTimeout(function(){
                fn.apply(me, callArgs);
            }, buffer);
        };
    },

    /**
     * 创建一个指定函数的减速代理， 当减速函数被反复快速回调时，
     * 只有在上次调用完成的指定间间隔之后才会被调用。
     *
     * 对于包装可被反复调用的函数，如鼠标移动事件的情况下的处理程序时，
     * 处理是极其昂贵的，这是非常有用的。
     *
     * @param {Function} fn 要在一个固定的时间间隔执行的函数。
     * @param {Number} interval 减速函数执行的时间间隔毫秒为单位。
     * @param {Object} scope (可选) 传递的函数执行的作用域(this引用)。
     * 如果省略，默认为调用者指定的作用域。
     * @returns {Function} 一个函数，在指定的时间间隔调用传递函数。
     */
    createThrottled: function(fn, interval, scope) {
        var lastCallTime, elapsed, lastArgs, timer, execute = function() {
            fn.apply(scope || this, lastArgs);
            lastCallTime = Eui.Date.now();
        };

        return function() {
            elapsed = Eui.Date.now() - lastCallTime;
            lastArgs = arguments;

            clearTimeout(timer);
            if (!lastCallTime || (elapsed >= interval)) {
                execute();
            } else {
                timer = setTimeout(execute, interval - elapsed);
            }
        };
    },


    /**
     * 将行为添加到现有的方法是在该函数的原始行为之前执行。 例如:
     * 
     *     var soup = {
     *         contents: [],
     *         add: function(ingredient) {
     *             this.contents.push(ingredient);
     *         }
     *     };
     *     Eui.Function.interceptBefore(soup, "add", function(ingredient){
     *         if (!this.contents.length && ingredient !== "water") {
     *             // Always add water to start with
     *             this.contents.push("water");
     *         }
     *     });
     *     soup.add("onions");
     *     soup.add("salt");
     *     soup.contents; // will contain: water, onions, salt
     * 
     * @param {Object} object 目标对象
     * @param {String} methodName 要重写的方法名称
     * @param {Function} fn 新的行为函数。
     * 它将与原始方法相同的参数调用。
     * 此函数的返回值将成为新方法的返回值。

     * @param {Object} [scope] 要执行拦截器函数的作用域。默认为当前对象。
     * @return {Function} 刚创建的新函数。
     */
    interceptBefore: function(object, methodName, fn, scope) {
        var method = object[methodName] || Eui.emptyFn;

        return (object[methodName] = function() {
            var ret = fn.apply(scope || this, arguments);
            method.apply(this, arguments);

            return ret;
        });
    },

    /**
     * 将行为添加到现有的方法是在该函数的原始行为之后执行。 例如:
     * 
     *     var soup = {
     *         contents: [],
     *         add: function(ingredient) {
     *             this.contents.push(ingredient);
     *         }
     *     };
     *     Eui.Function.interceptAfter(soup, "add", function(ingredient){
     *         // Always add a bit of extra salt
     *         this.contents.push("salt");
     *     });
     *     soup.add("water");
     *     soup.add("onions");
     *     soup.contents; // will contain: water, salt, onions, salt
     * 
     * @param {Object} object 目标对象
     * @param {String} methodName 要重写的方法名称
     * @param {Function} fn 新的行为函数。
     * 它将与原始方法相同的参数调用。
     * 此函数的返回值将成为新方法的返回值。
     * @param {Object} [scope] 要执行拦截器函数的作用域。默认为当前对象。
     * @return {Function} 刚创建的新函数。
     */
    interceptAfter: function(object, methodName, fn, scope) {
        var method = object[methodName] || Eui.emptyFn;

        return (object[methodName] = function() {
            method.apply(this, arguments);
            return fn.apply(scope || this, arguments);
        });
    }
};

/**
 * alias to {@link Eui.Function.defer|defer}
 * @method defer
 * @memberof $
 */
Eui.defer = Eui.Function.alias(Eui.Function, 'defer');

/**
 * alias to {@link Eui.Function.pass|pass}
 * @method pass
 * @memberof $
 */
Eui.pass = Eui.Function.alias(Eui.Function, 'pass');

/**
 * alias to {@link Eui.Function.bind|bind}
 * @method bind
 * @memberof $
 */
Eui.bind = Eui.Function.alias(Eui.Function, 'bind');

/**
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/object.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 一组处理对象的实用静态方法集合。
 * @namespace Eui.Object
 */
(function() {

// The "constructor" for chain:
var TemplateClass = function(){},
    ExtObject = Eui.Object = {

    /**
     * 使用给定对象作为原生链返回一个新对象。
     * 
     * **注意** 这个方法不支持`Object.create`方法 属性定义功能，只支持第一个参数。
     * @function
     * @param {Object} object 创建新对象的原生链.
     */
    chain: Object.create || function (object) {
        TemplateClass.prototype = object;
        var result = new TemplateClass();
        TemplateClass.prototype = null;
        return result;
    },

    /**
     * 将一个name - value对转换为一个对象数组，支持内部结构的转换，对构造查询字符串非常有用。 示例:
     *
     *     var objects = Eui.Object.toQueryObjects('hobbies', ['reading', 'cooking', 'swimming']);
     *
     *     // objects此时等于:
     *     [
     *         { name: 'hobbies', value: 'reading' },
     *         { name: 'hobbies', value: 'cooking' },
     *         { name: 'hobbies', value: 'swimming' },
     *     ];
     *
     *     var objects = Eui.Object.toQueryObjects('dateOfBirth', {
     *         day: 3,
     *         month: 8,
     *         year: 1987,
     *         extra: {
     *             hour: 4
     *             minute: 30
     *         }
     *     }, true); // 递归
     *
     *     // objects此时等于:
     *     [
     *         { name: 'dateOfBirth[day]', value: 3 },
     *         { name: 'dateOfBirth[month]', value: 8 },
     *         { name: 'dateOfBirth[year]', value: 1987 },
     *         { name: 'dateOfBirth[extra][hour]', value: 4 },
     *         { name: 'dateOfBirth[extra][minute]', value: 30 },
     *     ];
     *
     * @param {String} name
     * @param {Object/Array} value
     * @param {Boolean} [recursive=false] 为true则递归遍历对象。
     * @return {Array}
     */
    toQueryObjects: function(name, value, recursive) {
        var self = ExtObject.toQueryObjects,
            objects = [],
            i, ln;

        if (Eui.isArray(value)) {
            for (i = 0, ln = value.length; i < ln; i++) {
                if (recursive) {
                    objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                }
                else {
                    objects.push({
                        name: name,
                        value: value[i]
                    });
                }
            }
        }
        else if (Eui.isObject(value)) {
            for (i in value) {
                if (value.hasOwnProperty(i)) {
                    if (recursive) {
                        objects = objects.concat(self(name + '[' + i + ']', value[i], true));
                    }
                    else {
                        objects.push({
                            name: name,
                            value: value[i]
                        });
                    }
                }
            }
        }
        else {
            objects.push({
                name: name,
                value: value
            });
        }

        return objects;
    },

    /**
     * 将一个对象转换成编码的查询字符串。
     *
     * 不递归:
     *
     *     Eui.Object.toQueryString({foo: 1, bar: 2}); // returns "foo=1&bar=2"
     *     Eui.Object.toQueryString({foo: null, bar: 2}); // returns "foo=&bar=2"
     *     Eui.Object.toQueryString({'some price': '$300'}); // returns "some%20price=%24300"
     *     Eui.Object.toQueryString({date: new Date(2011, 0, 1)}); // returns "date=%222011-01-01T00%3A00%3A00%22"
     *     Eui.Object.toQueryString({colors: ['red', 'green', 'blue']}); // returns "colors=red&colors=green&colors=blue"
     *
     * 递归:
     *
     *     Eui.Object.toQueryString({
     *         username: 'Jacky',
     *         dateOfBirth: {
     *             day: 1,
     *             month: 2,
     *             year: 1911
     *         },
     *         hobbies: ['coding', 'eating', 'sleeping', ['nested', 'stuff']]
     *     }, true); // 返回如下字符串(换行和url-decoded是为了便于阅读的目的):
     *     // username=Jacky
     *     //    &dateOfBirth[day]=1&dateOfBirth[month]=2&dateOfBirth[year]=1911
     *     //    &hobbies[0]=coding&hobbies[1]=eating&hobbies[2]=sleeping&hobbies[3][0]=nested&hobbies[3][1]=stuff
     *
     * @param {Object} object 要编码的对象
     * @param {Boolean} [recursive=false] 是否递归的翻译对象，
     * 这种格式在 PHP / Ruby on Rails服务器中被类似地支持.
     *
     * @return {String} queryString
     */
    toQueryString: function(object, recursive) {
        var paramObjects = [],
            params = [],
            i, j, ln, paramObject, value;

        for (i in object) {
            if (object.hasOwnProperty(i)) {
                paramObjects = paramObjects.concat(ExtObject.toQueryObjects(i, object[i], recursive));
            }
        }

        for (j = 0, ln = paramObjects.length; j < ln; j++) {
            paramObject = paramObjects[j];
            value = paramObject.value;

            if (Eui.isEmpty(value)) {
                value = '';
            } else if (Eui.isDate(value)) {
                value = Eui.Date.toString(value);
            }

            params.push(encodeURIComponent(paramObject.name) + '=' + encodeURIComponent(String(value)));
        }

        return params.join('&');
    },

    /**
     * 将查询字符串转换回对象。
     *
     * 不递归:
     *
     *     Eui.Object.fromQueryString("foo=1&bar=2"); // returns {foo: '1', bar: '2'}
     *     Eui.Object.fromQueryString("foo=&bar=2"); // returns {foo: null, bar: '2'}
     *     Eui.Object.fromQueryString("some%20price=%24300"); // returns {'some price': '$300'}
     *     Eui.Object.fromQueryString("colors=red&colors=green&colors=blue"); // returns {colors: ['red', 'green', 'blue']}
     *
     * 递归:
     *
     *     Eui.Object.fromQueryString(
     *         "username=Jacky&"+
     *         "dateOfBirth[day]=1&dateOfBirth[month]=2&dateOfBirth[year]=1911&"+
     *         "hobbies[0]=coding&hobbies[1]=eating&hobbies[2]=sleeping&"+
     *         "hobbies[3][0]=nested&hobbies[3][1]=stuff", true);
     *
     *     // returns
     *     {
     *         username: 'Jacky',
     *         dateOfBirth: {
     *             day: '1',
     *             month: '2',
     *             year: '1911'
     *         },
     *         hobbies: ['coding', 'eating', 'sleeping', ['nested', 'stuff']]
     *     }
     *
     * @param {String} queryString 要解码的查询字符串
     * @param {Boolean} [recursive=false] 是否递归的解码字符串，
     * 这种格式在 PHP / Ruby on Rails服务器中被类似地支持.
     *
     * @return {Object}
     */
    fromQueryString: function(queryString, recursive) {
        var parts = queryString.replace(/^\?/, '').split('&'),
            object = {},
            temp, components, name, value, i, ln,
            part, j, subLn, matchedKeys, matchedName,
            keys, key, nextKey;

        for (i = 0, ln = parts.length; i < ln; i++) {
            part = parts[i];

            if (part.length > 0) {
                components = part.split('=');
                name = decodeURIComponent(components[0]);
                value = (components[1] !== undefined) ? decodeURIComponent(components[1]) : '';

                if (!recursive) {
                    if (object.hasOwnProperty(name)) {
                        if (!Eui.isArray(object[name])) {
                            object[name] = [object[name]];
                        }

                        object[name].push(value);
                    }
                    else {
                        object[name] = value;
                    }
                }
                else {
                    matchedKeys = name.match(/(\[):?([^\]]*)\]/g);
                    matchedName = name.match(/^([^\[]+)/);

                    //<debug error>
                    if (!matchedName) {
                        throw new Error('[Eui.Object.fromQueryString] Malformed query string given, failed parsing name from "' + part + '"');
                    }
                    //</debug>

                    name = matchedName[0];
                    keys = [];

                    if (matchedKeys === null) {
                        object[name] = value;
                        continue;
                    }

                    for (j = 0, subLn = matchedKeys.length; j < subLn; j++) {
                        key = matchedKeys[j];
                        key = (key.length === 2) ? '' : key.substring(1, key.length - 1);
                        keys.push(key);
                    }

                    keys.unshift(name);

                    temp = object;

                    for (j = 0, subLn = keys.length; j < subLn; j++) {
                        key = keys[j];

                        if (j === subLn - 1) {
                            if (Eui.isArray(temp) && key === '') {
                                temp.push(value);
                            }
                            else {
                                temp[key] = value;
                            }
                        }
                        else {
                            if (temp[key] === undefined || typeof temp[key] === 'string') {
                                nextKey = keys[j+1];

                                temp[key] = (Eui.isNumeric(nextKey) || nextKey === '') ? [] : {};
                            }

                            temp = temp[key];
                        }
                    }
                }
            }
        }

        return object;
    },

    /**
     * 迭代一个对象，在每个迭代上调用给定的回调函数 在回调函数中返回 false 可以停止迭代. 示例:
     *
     *     var person = {
     *         name: 'Jacky'
     *         hairColor: 'black'
     *         loves: ['food', 'sleeping', 'wife']
     *     };
     *
     *     Eui.Object.each(person, function(key, value, myself) {
     *         console.log(key + ":" + value);
     *
     *         if (key === 'hairColor') {
     *             return false; // 停止迭代
     *         }
     *     });
     *
     * @param {Object} object 要迭代的对象
     * @param {Function} fn 回调函数
     * @param {String} fn.key
     * @param {Object} fn.value
     * @param {Object} fn.object 对象本身
     * @param {Object} [scope] 回调函数执行的 (this) 作用域.
     */
    each: function(object, fn, scope) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                if (fn.call(scope || object, property, object[property], object) === false) {
                    return;
                }
            }
        }
    },

    /**
     * 递归的合并任意数目的对象，但是不引用他们或他们的子对象。
     *
     *     var eui = {
     *         companyName: 'Eui',
     *         products: ['Eui Framework', 'Eui Ui', 'Eui Validator'],
     *         isSuperCool: true,
     *         office: {
     *             size: 2000,
     *             location: 'Palo Alto',
     *             isFun: true
     *         }
     *     };
     *
     *     var newStuff = {
     *         companyName: 'Sencha Inc.',
     *         products: ['Ext  JS', 'Ext  GWT', 'Ext  Designer', 'Sencha Touch', 'Sencha Animator'],
     *         office: {
     *             size: 40000,
     *             location: 'Redwood City'
     *         }
     *     };
     *
     *     var sencha = Eui.Object.merge(eui, newStuff);
     *
     *     // 此时eui和sencha等于
     *     {
     *         companyName: 'Sencha Inc.',
     *         products: ['Ext  JS', 'Ext  GWT', 'Ext  Designer', 'Sencha Touch', 'Sencha Animator'],
     *         isSuperCool: true,
     *         office: {
     *             size: 40000,
     *             location: 'Redwood City',
     *             isFun: true
     *         }
     *     }
     *
     * @param {Object} destination 所有的对象子序列将被合并到此目标对象。
     * @param {...Object} object 将要被合并的任意数目对象。
     * @return {Object} 合并所有给定的对象到目标对象。
     */
    merge: function(destination) {
        var i = 1,
            ln = arguments.length,
            mergeFn = ExtObject.merge,
            cloneFn = Eui.clone,
            object, key, value, sourceKey;

        for (; i < ln; i++) {
            object = arguments[i];

            for (key in object) {
                value = object[key];
                if (value && value.constructor === Object) {
                    sourceKey = destination[key];
                    if (sourceKey && sourceKey.constructor === Object) {
                        mergeFn(sourceKey, value);
                    }
                    else {
                        destination[key] = cloneFn(value);
                    }
                }
                else {
                    destination[key] = value;
                }
            }
        }

        return destination;
    },

    /**
     * @private
     * @param destination
     */
    mergeIf: function(destination) {
        var i = 1,
            ln = arguments.length,
            cloneFn = Eui.clone,
            object, key, value;

        for (; i < ln; i++) {
            object = arguments[i];

            for (key in object) {
                if (!(key in destination)) {
                    value = object[key];

                    if (value && value.constructor === Object) {
                        destination[key] = cloneFn(value);
                    }
                    else {
                        destination[key] = value;
                    }
                }
            }
        }

        return destination;
    },

    /**
     * 根据指定的值，返回第一个匹配的key. 如果没有匹配的值，将返回null.
     *
     *     var person = {
     *         name: 'Jacky',
     *         loves: 'food'
     *     };
     *
     *     alert(Eui.Object.getKey(person, 'food')); //  弹出 'loves'
     *
     * @param {Object} object
     * @param {Object} value 要查找的值。
     */
    getKey: function(object, value) {
        for (var property in object) {
            if (object.hasOwnProperty(property) && object[property] === value) {
                return property;
            }
        }

        return null;
    },

    /**
     * 获取给定对象所有的值组成的数组。
     *
     *     var values = Eui.Object.getValues({
     *         name: 'Jacky',
     *         loves: 'food'
     *     }); // ['Jacky', 'food']
     *
     * @param {Object} object
     * @return {Array} 对象的值组成的数组。
     */
    getValues: function(object) {
        var values = [],
            property;

        for (property in object) {
            if (object.hasOwnProperty(property)) {
                values.push(object[property]);
            }
        }

        return values;
    },

    /**
     * 获取所有对象的key组成的数组。
     *
     *     var values = Eui.Object.getKeys({
     *         name: 'Jacky',
     *         loves: 'food'
     *     }); // ['name', 'loves']
     *
     * @param {Object} object
     * @return {String[]} 对象的key组成的数组。
     * @method
     */
    getKeys: (typeof Object.keys == 'function')
        ? function(object){
            if (!object) {
                return [];
            }
            return Object.keys(object);
        }
        : function(object) {
            var keys = [],
                property;

            for (property in object) {
                if (object.hasOwnProperty(property)) {
                    keys.push(property);
                }
            }

            return keys;
        },

    /**
     * 获取此对象的所有自有属性的数目。
     *
     *     var size = Eui.Object.getSize({
     *         name: 'Jacky',
     *         loves: 'food'
     *     }); // size equals 2
     *
     * @param {Object} object
     * @return {Number} size
     */
    getSize: function(object) {
        var size = 0,
            property;

        for (property in object) {
            if (object.hasOwnProperty(property)) {
                size++;
            }
        }

        return size;
    },
    
    /**
     * 检查对象是否有属性。
     * @param {Object} object
     * @return {Boolean} 如果没有属性则返回'true'.
     */
    isEmpty: function(object){
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;    
    },
    
    /**
     * Shallow compares the contents of 2 objects using strict equality. Objects are
     * considered equal if they both have the same set of properties and the
     * value for those properties equals the other in the corresponding object.
     * 
     *     // Returns true
     *     Eui.Object.equals({
     *         foo: 1,
     *         bar: 2
     *     }, {
     *         foo: 1,
     *         bar: 2
     *     });
     *
     * @function
     * @param {Object} object1
     * @param {Object} object2
     * @return {Boolean} `true` if the objects are equal.
     */
    equals: (function() {
        var check = function(o1, o2) {
            var key;
        
            for (key in o1) {
                if (o1.hasOwnProperty(key)) {
                    if (o1[key] !== o2[key]) {
                        return false;
                    }    
                }
            }    
            return true;
        };
        
        return function(object1, object2) {
            
            // Short circuit if the same object is passed twice
            if (object1 === object2) {
                return true;
            } if (object1 && object2) {
                // Do the second check because we could have extra keys in
                // object2 that don't exist in object1.
                return check(object1, object2) && check(object2, object1);  
            } else if (!object1 && !object2) {
                return object1 === object2;
            } else {
                return false;
            }
        };
    })(),

    /**
     * @private
     */
    classify: function(object) {
        var prototype = object,
            objectProperties = [],
            propertyClassesMap = {},
            objectClass = function() {
                var i = 0,
                    ln = objectProperties.length,
                    property;

                for (; i < ln; i++) {
                    property = objectProperties[i];
                    this[property] = new propertyClassesMap[property]();
                }
            },
            key, value;

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                value = object[key];

                if (value && value.constructor === Object) {
                    objectProperties.push(key);
                    propertyClassesMap[key] = ExtObject.classify(value);
                }
            }
        }

        objectClass.prototype = prototype;

        return objectClass;
    }
};

/**
 * A convenient alias method for {@link Eui.Object.merge|merge}.
 *
 * @memberof $
 * @method merge
 */
Eui.merge = Eui.Object.merge;

/**
 * alias to {@link Eui.Object.mergeIf|mergeIf}
 *
 * @private
 * @memberof $
 * @method mergeIf
 */
Eui.mergeIf = Eui.Object.mergeIf;

/**
 * alias to {@link Eui.Object.toQueryString|toQueryString}
 *
 * @memberof $
 * @method urlEncode
 */
Eui.urlEncode = function() {
    var args = Eui.Array.from(arguments),
        prefix = '';

    // Support for the old `pre` argument
    if ((typeof args[1] === 'string')) {
        prefix = args[1] + '&';
        args[1] = false;
    }

    return prefix + ExtObject.toQueryString.apply(ExtObject, args);
};

/**
 * Alias for {@link Eui.Object.fromQueryString|fromQueryString}.
 *
 * @memberof $
 * @method urlDecode
 */
Eui.urlDecode = function() {
    return ExtObject.fromQueryString.apply(ExtObject, arguments);
};

}());

/*
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/date.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
**/
// @tag foundation,core
// @require Object.js
// @define Eui.Date

/**
 *
 * 提供了处理日期的常用的静态方法的集合。
 * 注意，如果Eui.Date需要加载，为方便起见， 它会复制到该对象所有的方法和属性。
 *
 * 日期的处理和格式化是 PHP's date() function的一个子集，
 * 提供的格式和转换后的结果将和 PHP 版本的一模一样。
 *
 * 下面列出的是目前所有支持的格式：:
 * <pre class="">
格式符      说明                                                     输出
------      ------------------------------------------------------  -----------------------
  d         月份中的天数，两位数字，不足位补“0”                         01 到 31
  D         当前星期的缩写                                             Mon 到 Sun
  j         月份中的天数，不补“0”                                      1 到 31
  l         当前星期的完整拼写                                         Sunday 到 Saturday
  N         ISO-8601 标准表示的一周之中的天数（1～7）                   1 (表示 Monday) 到 7 (表示 Sunday)
  S         英语中月份天数的序数词的后缀                                st, nd, rd 或 th。与格式符“j”连用
  w         一周之中的天数（0～6）                                     0 (表示 Sunday) 到 6 (表示 Saturday)
  z         一年之中的天数(从 0 开始)                                  0到364 (闰年含365)
  W         一年之中的ISO-8601周数，周从星期一开始                      01 到 53
  F         当前月份的完整拼写, 例如January或March                      January 到 December
  m         当前的月份，两位数字，不足位补“0”                           01 到 12
  M         当前月份的缩写                                             Jan 到 Dec
  n         当前的月份，不补“0”                                        1 到 12
  t         当前月份的总天数                                           28 到 31
  L         是否闰年                                                   “1”为闰年，“0”为平年
  o         ISO-8601 年数 (对于(Y)相同,但如果ISO星期数(W)               示例: 1998 或 2004
            属于到上一年或下一年, 那一年则被改用)
  Y         4位数字表示的当前年数                                      示例: 1999 或 2003
  y         2位数字表示的当前年数                                      示例: 99 或 03
  a         小写的“am”和“pm”                                           am 或 pm
  A         大写的“AM”和“PM”                                           AM 或 PM
  g         12小时制表示的当前小时数，不补“0”                           1 到 12
  G         24小时制表示的当前小时数，不补“0”                           0 到 23
  h         12小时制表示的当前小时数，不足位补“0”                       01 到 12
  H         24小时制表示的当前小时数，不足位补“0”                       00 到 23
  i         分钟数，不足位补“0”                                        00 到 59
  s         秒数，不足位补“0”                                          00 到 59
  u         秒数的小数形式                                             示例:
            (最低1位数,允许任意位数的数字)                              001 (即 0.001s) 或
                                                                       100 (即 0.100s) 或
                                                                       999 (即 0.999s) 或
                                                                       999876543210 (即 0.999876543210s)
  O         用小时数表示的与 GMT 差异数                                 示例: +1030
  P         以带冒号的小时和分钟表示与 GMT 差异数                        示例: -08:00
  T         当前系统设定的时区                                          示例: EST, MDT, PDT ...
  Z         用秒数表示的时区偏移量（西方为负数，东方为正数）                 -43200 to 50400
  c         ISO 8601 日期
            注意:                                                      示例:
            1) 如果未指定,则月/日默认为当前月/日,                          1991 或
                时间默认为午夜时间, 同时时区默认为                         1992-10 或
                浏览器设置的时区。如果指定时间                             1993-09-20 或
                则它必须包括小时和分钟。                                   1994-08-19T16:20+01:00 或
                "T" 分隔符、秒、毫秒和时区是可选的。.                      1995-07-18T17:21:28-02:00 或
            2) 一个秒数的小数部分,如果指定, 必须包含至少1位数字             1996-06-17T18:22:29.98765+03:00 或
                (在这里允许位数的最大数目没有限制),                        1997-05-16T19:23:30,12345-0400 或
                并可由一个 '.' 或一个 ',' 分隔。                           1998-04-15T20:24:31.2468Z 或
                参见右边的例子为所支持的各级日期时间粒度                    1999-03-14T20:24:32Z 或
                或参见http://www.w3.org/TR/NOTE-datetime
                查阅更多相关信息。                                         2000-02-13T21:25:33
  U         自 Unix 新纪元(January 1 1970 00:00:00 GMT) 以来的秒数         1193432466 或 -2138434463
  MS        Microsoft AJAX 序列化的日期                                    \/Date(1238606590509)\/
                                                                            (即 UTC milliseconds since epoch)
                                                                          或 \/Date(1238606590509+0800)\/
  time      一个javascript毫秒时间戳                                        1350024476440
  timestamp UNIX时间戳(same as U)                                           1350024866
</pre>
 *
 * 用法举例：（注意你必须在字母前使用转意字符“\”才能将其作为字母本身而不是格式符输出）:
 *
 *     // 样本数据:
 *     // 'Wed Jan 10 2007 15:05:01 GMT-0600 (Central Standard Time)'
 *     
 *     var dt = new Date('1/10/2007 03:05:01 PM GMT-0600');
 *     // 2007-01-10
 *     console.log(Eui.Date.format(dt, 'Y-m-d'));
 *     // January 10, 2007, 3:05 pm
 *     console.log(Eui.Date.format(dt, 'F j, Y, g:i a'));
 *     // Wednesday, the 10th of January 2007 03:05:01 PM
 *     console.log(Eui.Date.format(dt, 'l, \\t\\he jS \\of F Y h:i:s A'));
 *
 * 下面有一些标准的日期/时间模板可能会对你有用。 它们不是 Date.js 的一部分，
 * 但是你可以将下列代码拷出，并放在 Date.js 之后所引用的任何脚本内，
 * 都将成为一个全局变量，并对所有的 Date 对象起作用。
 * 你可以按照你的需要随意增加、删除此段代码。
 *
 *     Eui.Date.patterns = {
 *         ISO8601Long:"Y-m-d H:i:s",
 *         ISO8601Short:"Y-m-d",
 *         ShortDate: "n/j/Y",
 *         LongDate: "l, F d, Y",
 *         FullDateTime: "l, F d, Y g:i:s A",
 *         MonthDay: "F d",
 *         ShortTime: "g:i A",
 *         LongTime: "g:i:s A",
 *         SortableDateTime: "Y-m-d\\TH:i:s",
 *         UniversalSortableDateTime: "Y-m-d H:i:sO",
 *         YearMonth: "F, Y"
 *     };
 *
 * 用法示例::
 *
 *     var dt = new Date();
 *     console.log(Eui.Date.format(dt, Eui.Date.patterns.ShortDate));
 *
 * 开发者可以通过设置{@link Eui.Date.parseFunctions|parseFunctions} 和 {@link Eui.Date.formatFunctions|formatFunctions}实现自定义日期格式化与解释功能， 以满足特殊的需求。
 *
 * @namespace Eui.Date
 */
Eui.Date = new function() {
  var utilDate = this,
      stripEscapeRe = /(\\.)/g,
      hourInfoRe = /([gGhHisucUOPZ]|MS)/,
      dateInfoRe = /([djzmnYycU]|MS)/,
      slashRe = /\\/gi,
      numberTokenRe = /\{(\d+)\}/g,
      MSFormatRe = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/'),
      code = [
        // date calculations (note: the code below creates a dependency on Eui.Number.from())
        "var me = this, dt, y, m, d, h, i, s, ms, o, O, z, zz, u, v, W, year, jan4, week1monday, daysInMonth, dayMatched,",
            "def = me.defaults,",
            "from = Eui.Number.from,",
            "results = String(input).match(me.parseRegexes[{0}]);", // either null, or an array of matched strings

        "if(results){",
            "{1}",

            "if(u != null){", // i.e. unix time is defined
                "v = new Date(u * 1000);", // give top priority to UNIX time
            "}else{",
                // create Date object representing midnight of the current day;
                // this will provide us with our date defaults
                // (note: clearTime() handles Daylight Saving Time automatically)
                "dt = me.clearTime(new Date);",

                "y = from(y, from(def.y, dt.getFullYear()));",
                "m = from(m, from(def.m - 1, dt.getMonth()));",
                "dayMatched = d !== undefined;",
                "d = from(d, from(def.d, dt.getDate()));",
                
                // Attempt to validate the day. Since it defaults to today, it may go out
                // of range, for example parsing m/Y where the value is 02/2000 on the 31st of May.
                // It will attempt to parse 2000/02/31, which will overflow to March and end up
                // returning 03/2000. We only do this when we default the day. If an invalid day value
                // was set to be parsed by the user, continue on and either let it overflow or return null
                // depending on the strict value. This will be in line with the normal Date behaviour.
                
                "if (!dayMatched) {", 
                    "dt.setDate(1);",
                    "dt.setMonth(m);",
                    "dt.setFullYear(y);",
                
                    "daysInMonth = me.getDaysInMonth(dt);",
                    "if (d > daysInMonth) {",
                        "d = daysInMonth;",
                    "}",
                "}",

                "h  = from(h, from(def.h, dt.getHours()));",
                "i  = from(i, from(def.i, dt.getMinutes()));",
                "s  = from(s, from(def.s, dt.getSeconds()));",
                "ms = from(ms, from(def.ms, dt.getMilliseconds()));",

                "if(z >= 0 && y >= 0){",
                    // both the year and zero-based day of year are defined and >= 0.
                    // these 2 values alone provide sufficient info to create a full date object

                    // create Date object representing January 1st for the given year
                    // handle years < 100 appropriately
                    "v = me.add(new Date(y < 100 ? 100 : y, 0, 1, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",

                    // then add day of year, checking for Date "rollover" if necessary
                    "v = !strict? v : (strict === true && (z <= 364 || (me.isLeapYear(v) && z <= 365))? me.add(v, me.DAY, z) : null);",
                "}else if(strict === true && !me.isValid(y, m + 1, d, h, i, s, ms)){", // check for Date "rollover"
                    "v = null;", // invalid date, so return null
                "}else{",
                    "if (W) {", // support ISO-8601
                        // http://en.wikipedia.org/wiki/ISO_week_date
                        //
                        // Mutually equivalent definitions for week 01 are:
                        // a. the week starting with the Monday which is nearest in time to 1 January
                        // b. the week with 4 January in it
                        // ... there are many others ...
                        //
                        // We'll use letter b above to determine the first week of the year.
                        //
                        // So, first get a Date object for January 4th of whatever calendar year is desired.
                        //
                        // Then, the first Monday of the year can easily be determined by (opEuiting on this Date):
                        // 1. Getting the day of the week.
                        // 2. Subtracting that by one.
                        // 3. Multiplying that by 86400000 (one day in ms).
                        // 4. Subtracting this number of days (in ms) from the January 4 date (represented in ms).
                        // 
                        // Example #1 ...
                        //
                        //       January 2012
                        //   Su Mo Tu We Th Fr Sa
                        //    1  2  3  4  5  6  7
                        //    8  9 10 11 12 13 14
                        //   15 16 17 18 19 20 21
                        //   22 23 24 25 26 27 28
                        //   29 30 31
                        //
                        // 1. January 4th is a Wednesday.
                        // 2. Its day number is 3.
                        // 3. Simply substract 2 days from Wednesday.
                        // 4. The first week of the year begins on Monday, January 2. Simple!
                        //
                        // Example #2 ...
                        //       January 1992
                        //   Su Mo Tu We Th Fr Sa
                        //             1  2  3  4
                        //    5  6  7  8  9 10 11
                        //   12 13 14 15 16 17 18
                        //   19 20 21 22 23 24 25
                        //   26 27 28 29 30 31
                        // 
                        // 1. January 4th is a Saturday.
                        // 2. Its day number is 6.
                        // 3. Simply subtract 5 days from Saturday.
                        // 4. The first week of the year begins on Monday, December 30. Simple!
                        //
                        // v = Eui.Date.clearTime(new Date(week1monday.getTime() + ((W - 1) * 604800000)));
                        // (This is essentially doing the same thing as above but for the week rather than the day)
                        "year = y || (new Date()).getFullYear(),",
                        "jan4 = new Date(year, 0, 4, 0, 0, 0),",
                        "week1monday = new Date(jan4.getTime() - ((jan4.getDay() - 1) * 86400000));",
                        "v = Eui.Date.clearTime(new Date(week1monday.getTime() + ((W - 1) * 604800000)));",
                    "} else {",
                        // plain old Date object
                        // handle years < 100 properly
                        "v = me.add(new Date(y < 100 ? 100 : y, m, d, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",
                    "}",
                "}",
            "}",
        "}",

        "if(v){",
            // favor UTC offset over GMT offset
            "if(zz != null){",
                // reset to UTC, then add offset
                "v = me.add(v, me.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
                // reset to GMT, then add offset
                "v = me.add(v, me.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
        "}",

        "return v;"
      ].join('\n');

  // create private copy of Eui JS's `Eui.util.Format.format()` method
  // - to remove unnecessary dependency
  // - to resolve namespace conflict with MS-Ajax's implementation
  function xf(format) {
      var args = Array.prototype.slice.call(arguments, 1);
      return format.replace(numberTokenRe, function(m, i) {
          return args[i];
      });
  }

  Eui.apply(utilDate, {
    /**
     * 返回当前的时间戳.
     *
     * @memberof Eui.Date
     * @return {Number} 当前时间戳.
     */
    now: Date.now || function() {
        return +new Date();
    },

    /**
     * Private for now
     * @private
     * @memberof Eui.Date
     */
    toString: function(date) {
        var pad = Eui.String.leftPad;

        return date.getFullYear() + "-"
            + pad(date.getMonth() + 1, 2, '0') + "-"
            + pad(date.getDate(), 2, '0') + "T"
            + pad(date.getHours(), 2, '0') + ":"
            + pad(date.getMinutes(), 2, '0') + ":"
            + pad(date.getSeconds(), 2, '0');
    },

    /**
     * 返回两个日期之间的毫秒数.
     *
     * @memberof Eui.Date
     * @param {Date} 第一个日期类型参数.
     * @param {Date} [dateB=new Date()] （可选）第二个日期参数，默认为当前日期.
     * @return {Number} 以毫秒为单位的时间差.
     */
    getElapsed: function(dateA, dateB) {
        return Math.abs(dateA - (dateB || utilDate.now()));
    },

    /**
     * 全局标志，确定是否应使用严格的日期解析.
     * 严格的日期解析将不会转换无效的日期， 这是JavaScript日期对象的默认行为.
     * (更多的信息，请参见 {@link Eui.Date.parse|parse})
     *
     * @memberof Eui.Date
     * @type Boolean
    */
    useStrict: false,

    // private
    formatCodeToRegex: function(character, currentGroup) {
        // Note: currentGroup - position in regex result array (see notes for Eui.Date.parseCodes below)
        var p = utilDate.parseCodes[character];

        if (p) {
          p = typeof p == 'function'? p() : p;
          utilDate.parseCodes[character] = p; // reassign function result to prevent repeated execution
        }

        return p ? Eui.applyIf({
          c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
        }, p) : {
            g: 0,
            c: null,
            s: Eui.String.escapeRegex(character) // treat unrecognized characters as litEuils
        };
    },

    /**
     * 对象的每个属性是一个日期解析函数.
     * 属性名称是该函数解析的格式字符串。
     * 此对象会自动填充日期解析函数并满足 Eui 标准格式化字符串要求的日期格式.
     * 自定义解析函数可被插入到该对象中, 键入的名称由此可能被parse用作一个格式字符串 {@link Eui.Date.parse|parse}.
     *
     * 示例:
     *
     *     Eui.Date.parseFunctions['x-date-format'] = myDateParser;
     *
     * 解析函数应返回一个日期对象，并传递下列参数:<div class="mdetail-params"><ul>
     * <li><code>date</code> : String<div class="sub-desc">要解析的日期字符串.</div></li>
     * <li><code>strict</code> : Boolean<div class="sub-desc">
     *     如果为true，在解析时验证日期字符串 (即防止 javascript 日期转换) (默认值必须是 false)。 无效的日期字符串在解析时返回null.
     * .</div></li>
     * </ul></div>
     *
     * 若要使用日期对象，也是按照这种格式进行格式化， 相应的格式化函数必须被注入到 {@link Eui.Date.formatFunctions|formatFunctions}  属性中。
     *
     * @memberof Eui.Date
     * @property parseFunctions
     * @type Object
     */
    parseFunctions: {
        "MS": function(input, strict) {
            // note: the timezone offset is ignored since the MS Ajax server sends
            // a UTC milliseconds-since-Unix-epoch value (negative values are allowed)
            var r = (input || '').match(MSFormatRe);
            return r ? new Date(((r[1] || '') + r[2]) * 1) : null;
        },
        "time": function(input, strict) {
            var num = parseInt(input, 10);
            if (num || num === 0) {
                return new Date(num);
            }
            return null;
        },
        "timestamp": function(input, strict) {
            var num = parseInt(input, 10);
            if (num || num === 0) {
                return new Date(num * 1000);
            }
            return null;
        }
    },
    parseRegexes: [],

    /**
     * 在其中每个属性是一个日期格式函数对象哈希值。
     * 属性的名称作为格式字符串，与生成的格式化日期字符串相对应。
     *
     * 此对象会自动填充日期格式化函数并满足Eui标准格式化字符串要求的日期格式。
     * 自定义格式函数可被插入到该对象中， 键入的名称由此可能被{@link Eui.Date.format|format}用作一个格式字符串。
     *
     * 格式化函数应该返回一个字符串表示传递的日期对象，并传递以下参数:<div class="mdetail-params"><ul>
     * <li><code>date</code> : Date<div class="sub-desc">要进行格式化的日期对象.</div></li>
     * </ul></div>
     *
     * 若要使用日期字符串，也是按照这种格式进行解析， 相应的解析函数必须被注入到 {@link Eui.Date.parseFunctions|parseFunctions} 属性中。
     *
     * @memberof Eui.Date
     * @type Object
     * @example
     * Eui.Date.formatFunctions['x-date-format'] = myDateFormatter;
     */
    formatFunctions: {
        "MS": function() {
            // UTC milliseconds since Unix epoch (MS-AJAX serialized date format (MRSF))
            return '\\/Date(' + this.getTime() + ')\\/';
        },
        "time": function(){
            return this.getTime().toString();
        },
        "timestamp": function(){
            return utilDate.format(this, 'U');
        }
    },

    y2kYear : 50,

    /**
     * 日期间隔常量:毫秒
     * @memberof Eui.Date
     * @type String
     */
    MILLI : "ms",

    /**
     * 日期间隔常量：秒
     * @type String
     * @memberof Eui.Date
     */
    SECOND : "s",

    /**
     * 日期间隔常量：分钟
     * @type String
     * @memberof Eui.Date
     */
    MINUTE : "mi",

    /** 日期间隔常量：小时
     * @type String
     * @memberof Eui.Date
     */
    HOUR : "h",

    /**
     * 日期间隔常量：天
     * @type String
     * @memberof Eui.Date
     */
    DAY : "d",

    /**
     * 日期间隔常量：月
     * @type String
     * @memberof Eui.Date
     */
    MONTH : "mo",

    /**
     * 日期间隔常量：年
     * @type String
     * @memberof Eui.Date
     */
    YEAR : "y",

    /**
     * 将会在日期解析过程中使用的对象哈希值包含的默认日期值.
     *
     *     // 将默认天的值设置为该月的第一天.
     *      Eui.Date.defaults.d = 1;
     *
     *      // 解析一个只包含年份和月份值的2月份的日期字符串.
     *      // 当试图解析下面的日期字符串,例如, March 31st 2009，
     *      // 将一天的默认值设置为 1 可防止日期转换时的怪异问题.
     *
     *      Eui.Date.parse('2009-02', 'Y-m'); // 返回一个表示 February 1st 2009 的日期对象

     *
     * 重写这些属性,自定义{@link Eui.Date.parse|parse}方法中所使用的默认日期值.
     * 注意: 在一些国家遇到夏令时间(即 DST)，h, i, s 和 ms 属性可能会配合 DST 生效的确切时间.
     * 考虑此情况是开发人员的责任.
     *
     * 可用的属性如下:
     * @memberof Eui.Date
     * @type {Object}
     * @property {Number} [defaults.y=undefined] 默认年份值.
     * @property {Number} [defaults.m=undefined] 默认的从1开始的月份值.
     * @property {Number} [defaults.d=undefined] 默认的日期值.
     * @property {Number} [defaults.h=undefined] 默认的小时值.
     * @property {Number} [defaults.i=undefined] 默认的分钟值.
     * @property {Number} [defaults.s=undefined] 默认年份值.
     * @property {Number} [defaults.ms=undefined] 默认的秒值.
     */
    defaults: {},

    //<locale type="array">
    /**
     * 天的文本名称的数组.日期国际化需重写这些值。
     * @memberof Eui.Date
     * @type {String[]}
     * @example
     * Eui.Date.dayNames = [
     *     'SundayInYourLang',
     *     'MondayInYourLang'
     *     // ...
     * ];
     */
    dayNames : [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ],

    /**
     * 月份文本名称的数组.
     * 日期国际化需重写这些值.
     * @memberof Eui.Date
     * @type {String[]}
     * @example
     * Eui.Date.monthNames = [
     *    'JanInYourLang',
     *    'FebInYourLang'
     *    // ...
     * ];
     */
    monthNames : [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],

    /**
     * 一个对象关于从零开始的 javascript 月份数的哈希值(使用月份短名作为键。 注意:键值区分大小写).
     * 日期国际化需重写这些值.
     *
     * @memberof Eui.Date
     * @type {Object}
     * @example
     * Eui.Date.monthNumbers = {
     *    'LongJanNameInYourLang': 0,
     *    'ShortJanNameInYourLang':0,
     *    'LongFebNameInYourLang':1,
     *    'ShortFebNameInYourLang':1
     *    / ...
     * };
     */
    monthNumbers : {
        January: 0,
        Jan: 0,
        February: 1,
        Feb: 1,
        March: 2,
        Mar: 2,
        April: 3,
        Apr: 3,
        May: 4,
        June: 5,
        Jun: 5,
        July: 6,
        Jul: 6,
        August: 7,
        Aug: 7,
        September: 8,
        Sep: 8,
        October: 9,
        Oct: 9,
        November: 10,
        Nov: 10,
        December: 11,
        Dec: 11
    },

    /**
     * {@link Eui.util.Format.dateRenderer}和 {@link Eui.util.Format.date} 函数使用的日期格式的字符串.
     * 参见{@link Eui.Date}的详细信息.
     *
     * 这可能被覆盖在区域设置文件中.
     * @memberof Eui.Date
     * @type {String}
     */
    defaultFormat : "m/d/Y",
    //</locale>
    //<locale type="function">
    /**
     * @memberof Eui.Date
     * 根据月份数返回对应的月份短名。.
     * 国际日期需重写这个函数.
     * @param {Number} month 一个从零开始的月份数.
     * @return {String} 月份短名.
     */
    getShortMonthName : function(month) {
        return Eui.Date.monthNames[month].substring(0, 3);
    },
    //</locale>

    //<locale type="function">
    /**
     * @memberof Eui.Date
     * 根据星期数返回对应的星期短名.
     * 国际日期需重写这个函数.
     * @param {Number} day 一个从零开始的星期数.
     * @return {String} 星期短名.
     */
    getShortDayName : function(day) {
        return Eui.Date.dayNames[day].substring(0, 3);
    },
    //</locale>

    //<locale type="function">
    /**
     * @memberof Eui.Date
     * 根据月份的短名或全名返回从零开始的月份数值.
     * 国际日期需重写这个函数.
     * @param {String} name 短名/完整的月份名称.
     * @return {Number} 从零开始的月份数值.
     */
    getMonthNumber : function(name) {
        // handle camel casing for English month names (since the keys for the Eui.Date.monthNumbers hash are case sensitive)
        return Eui.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
    },
    //</locale>

    /**
     * @memberof Eui.Date
     * 检查格式字符串中是否包含小时信息.
     * @param {String} format 要检查的格式字符串.
     * @return {Boolean} True 如果格式字符串包含小时信息则返回true.
     * @method
     */
    formatContainsHourInfo : function(format){
        return hourInfoRe.test(format.replace(stripEscapeRe, ''));
    },

    /**
     * @memberof Eui.Date
     * 检查格式字符串中是否包含日期信息.
     * @param {String} format 要检查的格式字符串.
     * @return {Boolean} 如果格式字符串包含关于 date/day 的信息则返回true.
     * @method
     */
    formatContainsDateInfo : function(format){
        return dateInfoRe.test(format.replace(stripEscapeRe, ''));
    },
    
    /**
     * @memberof Eui.Date
     * 移除所有的转义的日期格式字符串,在日期格式中， 使用一个'\'可以用来转义特殊字符.
     * @param {String} format 要恢复原义的格式字符串.
     * @return {String} 非转义的格式字符串.
     * @method
     */
    unescapeFormat: function(format) {
        // Escape the format, since \ can be used to escape special
        // characters in a date format. For example, in a Spanish
        // locale the format may be: 'd \\de F \\de Y'
        return format.replace(slashRe, '');
    },

    /**
     * 通过format方法使用的格式化函数哈希映射的基本格式代码.
     *
     * 格式函数是字符串(或返回字符串的函数), 当{@link Eui.Date.format|format}方法被调用时，
     * 从日期对象的上下文中计算后返回相应的值.
     * 添加/重写这些映射为自定义的日期格式.
     *
     * 注意:如果不能找到适当的映射，Eui.Date.format() 会将字符视为文字.
     *
     * @example
     * Eui.Date.formatCodes.x = "Eui.util.Format.leftPad(this.getDate(), 2, '0')";
     * console.log(Eui.Date.format(new Date(), 'X'); //  返回当前月的第几天
     *
     * @memberof Eui.Date
     * @type Object
     */
    formatCodes : {
        d: "Eui.String.leftPad(this.getDate(), 2, '0')",
        D: "Eui.Date.getShortDayName(this.getDay())", // get localized short day name
        j: "this.getDate()",
        l: "Eui.Date.dayNames[this.getDay()]",
        N: "(this.getDay() ? this.getDay() : 7)",
        S: "Eui.Date.getSuffix(this)",
        w: "this.getDay()",
        z: "Eui.Date.getDayOfYear(this)",
        W: "Eui.String.leftPad(Eui.Date.getWeekOfYear(this), 2, '0')",
        F: "Eui.Date.monthNames[this.getMonth()]",
        m: "Eui.String.leftPad(this.getMonth() + 1, 2, '0')",
        M: "Eui.Date.getShortMonthName(this.getMonth())", // get localized short month name
        n: "(this.getMonth() + 1)",
        t: "Eui.Date.getDaysInMonth(this)",
        L: "(Eui.Date.isLeapYear(this) ? 1 : 0)",
        o: "(this.getFullYear() + (Eui.Date.getWeekOfYear(this) == 1 && this.getMonth() > 0 ? +1 : (Eui.Date.getWeekOfYear(this) >= 52 && this.getMonth() < 11 ? -1 : 0)))",
        Y: "Eui.String.leftPad(this.getFullYear(), 4, '0')",
        y: "('' + this.getFullYear()).substring(2, 4)",
        a: "(this.getHours() < 12 ? 'am' : 'pm')",
        A: "(this.getHours() < 12 ? 'AM' : 'PM')",
        g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
        G: "this.getHours()",
        h: "Eui.String.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
        H: "Eui.String.leftPad(this.getHours(), 2, '0')",
        i: "Eui.String.leftPad(this.getMinutes(), 2, '0')",
        s: "Eui.String.leftPad(this.getSeconds(), 2, '0')",
        u: "Eui.String.leftPad(this.getMilliseconds(), 3, '0')",
        O: "Eui.Date.getGMTOffset(this)",
        P: "Eui.Date.getGMTOffset(this, true)",
        T: "Eui.Date.getTimezone(this)",
        Z: "(this.getTimezoneOffset() * -60)",

        c: function() { // ISO-8601 -- GMT format
            var c, code, i, l, e;
            for (c = "Y-m-dTH:i:sP", code = [], i = 0, l = c.length; i < l; ++i) {
                e = c.charAt(i);
                code.push(e == "T" ? "'T'" : utilDate.getFormatCode(e)); // treat T as a character litEuil
            }
            return code.join(" + ");
        },
        /*
        c: function() { // ISO-8601 -- UTC format
            return [
              "this.getUTCFullYear()", "'-'",
              "Eui.util.Format.leftPad(this.getUTCMonth() + 1, 2, '0')", "'-'",
              "Eui.util.Format.leftPad(this.getUTCDate(), 2, '0')",
              "'T'",
              "Eui.util.Format.leftPad(this.getUTCHours(), 2, '0')", "':'",
              "Eui.util.Format.leftPad(this.getUTCMinutes(), 2, '0')", "':'",
              "Eui.util.Format.leftPad(this.getUTCSeconds(), 2, '0')",
              "'Z'"
            ].join(" + ");
        },
        */

        U: "Math.round(this.getTime() / 1000)"
    },

    /**
     * 检查传递的参数是否可以转换为一个有效的的javascript日期对象。
     *
     * @memberof Eui.Date
     * @param {Number} year 4位年份
     * @param {Number} month 从1开始的月份
     * @param {Number} day 月份中的天数
     * @param {Number} hour (可选) 小时
     * @param {Number} minute (可选) 分钟
     * @param {Number} second (可选) 秒
     * @param {Number} millisecond (可选) 毫秒
     * @return {Boolean} 如果传递的参数不能转换成日期，则返回false,否则返回true.
     */
    isValid : function(y, m, d, h, i, s, ms) {
        // setup defaults
        h = h || 0;
        i = i || 0;
        s = s || 0;
        ms = ms || 0;

        // Special handling for year < 100
        var dt = utilDate.add(new Date(y < 100 ? 100 : y, m - 1, d, h, i, s, ms), utilDate.YEAR, y < 100 ? y - 100 : 0);

        return y == dt.getFullYear() &&
            m == dt.getMonth() + 1 &&
            d == dt.getDate() &&
            h == dt.getHours() &&
            i == dt.getMinutes() &&
            s == dt.getSeconds() &&
            ms == dt.getMilliseconds();
    },

    /**
     * 使用指定的日期格式来解析传递的字符串.
     * 注意，该函数接受的是普通的日历格式，意味着月份从1开始 (即 1 = January).
     * {@link Eui.Date.defaults|defaults} 哈希值将用于传递的字符串不能找到任何日期值(即 year, month, day, hour, minute, second 或 millisecond)的情况中.
     * 如果一个相应的缺省日期值没有被指定在 {@link Eui.Date.defaults|defaults} 哈希值中， 当前日期的年、月、日或 DST 调整的零-小时时间值将用来替代。
     * 一定要注意,为了解析操作是成功的(解析失败将返回空值)， 输入日期字符串必须精确匹配指定的格式字符串.
     * 
     * 示例:
     *
     *     //dt = Fri May 25 2007 (current date)
     *     var dt = new Date();
     *     
     *     //dt = Thu May 25 2006 (today&#39;s month/day in 2006)
     *     dt = Eui.Date.parse("2006", "Y");
     *     
     *     //dt = Sun Jan 15 2006 (all date parts specified)
     *     dt = Eui.Date.parse("2006-01-15", "Y-m-d");
     *     
     *     //dt = Sun Jan 15 2006 15:20:01
     *     dt = Eui.Date.parse("2006-01-15 3:20:01 PM", "Y-m-d g:i:s A");
     *     
     *     // attempt to parse Sun Feb 29 2006 03:20:01 in strict mode
     *     dt = Eui.Date.parse("2006-02-29 03:20:01", "Y-m-d H:i:s", true); // returns null
     *
     * @memberof Eui.Date
     * @param {String} input 将被解析的日期字符串.
     * @param {String} format 预期的日期字符串格式.
     * @param {Boolean} [strict=false] (可选) true则在解析时（即防止JavaScript日期“反转”）校验日期格式字符串.
     * 无效的日期字符串解析时将返回null.
     * @return {Date} 解析的日期对象.
     */
    parse : function(input, format, strict) {
        var p = utilDate.parseFunctions;
        if (p[format] == null) {
            utilDate.createParser(format);
        }
        return p[format].call(utilDate, input, Eui.isDefined(strict) ? strict : utilDate.useStrict);
    },

    // Backwards compat
    parseDate: function(input, format, strict){
        return utilDate.parse(input, format, strict);
    },


    // private
    getFormatCode : function(character) {
        var f = utilDate.formatCodes[character];

        if (f) {
          f = typeof f == 'function'? f() : f;
          utilDate.formatCodes[character] = f; // reassign function result to prevent repeated execution
        }

        // note: unknown characters are treated as litEuils
        return f || ("'" + Eui.String.escape(character) + "'");
    },

    // private
    createFormat : function(format) {
        var code = [],
            special = false,
            ch = '',
            i;

        for (i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else if (special) {
                special = false;
                code.push("'" + Eui.String.escape(ch) + "'");
            } else {
                code.push(utilDate.getFormatCode(ch));
            }
        }
        utilDate.formatFunctions[format] = Eui.functionFactory("return " + code.join('+'));
    },

    // private
    createParser : function(format) {
        var regexNum = utilDate.parseRegexes.length,
            currentGroup = 1,
            calc = [],
            regex = [],
            special = false,
            ch = "",
            i = 0,
            len = format.length,
            atEnd = [],
            obj;

        for (; i < len; ++i) {
            ch = format.charAt(i);
            if (!special && ch == "\\") {
                special = true;
            } else if (special) {
                special = false;
                regex.push(Eui.String.escape(ch));
            } else {
                obj = utilDate.formatCodeToRegex(ch, currentGroup);
                currentGroup += obj.g;
                regex.push(obj.s);
                if (obj.g && obj.c) {
                    if (obj.calcAtEnd) {
                        atEnd.push(obj.c);
                    } else {
                        calc.push(obj.c);
                    }
                }
            }
        }

        calc = calc.concat(atEnd);

        utilDate.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$", 'i');
        utilDate.parseFunctions[format] = Eui.functionFactory("input", "strict", xf(code, regexNum, calc.join('')));
    },

    // private
    parseCodes : {
        /*
         * Notes:
         * g = {Number} calculation group (0 or 1. only group 1 contributes to date calculations.)
         * c = {String} calculation method (required for group 1. null for group 0. {0} = currentGroup - position in regex result array)
         * s = {String} regex pattern. all matches are stored in results[], and are accessible by the calculation mapped to 'c'
         */
        d: {
            g:1,
            c:"d = parseInt(results[{0}], 10);\n",
            s:"(3[0-1]|[1-2][0-9]|0[1-9])" // day of month with leading zeroes (01 - 31)
        },
        j: {
            g:1,
            c:"d = parseInt(results[{0}], 10);\n",
            s:"(3[0-1]|[1-2][0-9]|[1-9])" // day of month without leading zeroes (1 - 31)
        },
        D: function() {
            for (var a = [], i = 0; i < 7; a.push(utilDate.getShortDayName(i)), ++i); // get localised short day names
            return {
                g:0,
                c:null,
                s:"(?:" + a.join("|") +")"
            };
        },
        l: function() {
            return {
                g:0,
                c:null,
                s:"(?:" + utilDate.dayNames.join("|") + ")"
            };
        },
        N: {
            g:0,
            c:null,
            s:"[1-7]" // ISO-8601 day number (1 (monday) - 7 (sunday))
        },
        //<locale type="object" property="parseCodes">
        S: {
            g:0,
            c:null,
            s:"(?:st|nd|rd|th)"
        },
        //</locale>
        w: {
            g:0,
            c:null,
            s:"[0-6]" // JavaScript day number (0 (sunday) - 6 (saturday))
        },
        z: {
            g:1,
            c:"z = parseInt(results[{0}], 10);\n",
            s:"(\\d{1,3})" // day of the year (0 - 364 (365 in leap years))
        },
        W: {
            g:1,
            c:"W = parseInt(results[{0}], 10);\n",
            s:"(\\d{2})" // ISO-8601 week number (with leading zero)
        },
        F: function() {
            return {
                g:1,
                c:"m = parseInt(me.getMonthNumber(results[{0}]), 10);\n", // get localised month number
                s:"(" + utilDate.monthNames.join("|") + ")"
            };
        },
        M: function() {
            for (var a = [], i = 0; i < 12; a.push(utilDate.getShortMonthName(i)), ++i); // get localised short month names
            return Eui.applyIf({
                s:"(" + a.join("|") + ")"
            }, utilDate.formatCodeToRegex("F"));
        },
        m: {
            g:1,
            c:"m = parseInt(results[{0}], 10) - 1;\n",
            s:"(1[0-2]|0[1-9])" // month number with leading zeros (01 - 12)
        },
        n: {
            g:1,
            c:"m = parseInt(results[{0}], 10) - 1;\n",
            s:"(1[0-2]|[1-9])" // month number without leading zeros (1 - 12)
        },
        t: {
            g:0,
            c:null,
            s:"(?:\\d{2})" // no. of days in the month (28 - 31)
        },
        L: {
            g:0,
            c:null,
            s:"(?:1|0)"
        },
        o: { 
            g: 1,
            c: "y = parseInt(results[{0}], 10);\n",
            s: "(\\d{4})" // ISO-8601 year number (with leading zero)

        },
        Y: {
            g:1,
            c:"y = parseInt(results[{0}], 10);\n",
            s:"(\\d{4})" // 4-digit year
        },
        y: {
            g:1,
            c:"var ty = parseInt(results[{0}], 10);\n"
                + "y = ty > me.y2kYear ? 1900 + ty : 2000 + ty;\n", // 2-digit year
            s:"(\\d{1,2})"
        },
        /*
         * In the am/pm parsing routines, we allow both upper and lower case
         * even though it doesn't exactly match the spec. It gives much more flexibility
         * in being able to specify case insensitive regexes.
         */
        //<locale type="object" property="parseCodes">
        a: {
            g:1,
            c:"if (/(am)/i.test(results[{0}])) {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s:"(am|pm|AM|PM)",
            calcAtEnd: true
        },
        //</locale>
        //<locale type="object" property="parseCodes">
        A: {
            g:1,
            c:"if (/(am)/i.test(results[{0}])) {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s:"(AM|PM|am|pm)",
            calcAtEnd: true
        },
        //</locale>
        g: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(1[0-2]|[0-9])" //  12-hr format of an hour without leading zeroes (1 - 12)
        },
        G: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(2[0-3]|1[0-9]|[0-9])" // 24-hr format of an hour without leading zeroes (0 - 23)
        },
        h: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(1[0-2]|0[1-9])" //  12-hr format of an hour with leading zeroes (01 - 12)
        },
        H: {
            g:1,
            c:"h = parseInt(results[{0}], 10);\n",
            s:"(2[0-3]|[0-1][0-9])" //  24-hr format of an hour with leading zeroes (00 - 23)
        },
        i: {
            g:1,
            c:"i = parseInt(results[{0}], 10);\n",
            s:"([0-5][0-9])" // minutes with leading zeros (00 - 59)
        },
        s: {
            g:1,
            c:"s = parseInt(results[{0}], 10);\n",
            s:"([0-5][0-9])" // seconds with leading zeros (00 - 59)
        },
        u: {
            g:1,
            c:"ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
            s:"(\\d+)" // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
        },
        O: {
            g:1,
            c:[
                "o = results[{0}];",
                "var sn = o.substring(0,1),", // get + / - sign
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
                    "mn = o.substring(3,5) % 60;", // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Eui.String.leftPad(hr, 2, '0') + Eui.String.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
            ].join("\n"),
            s: "([+-]\\d{4})" // GMT offset in hrs and mins
        },
        P: {
            g:1,
            c:[
                "o = results[{0}];",
                "var sn = o.substring(0,1),", // get + / - sign
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
                    "mn = o.substring(4,6) % 60;", // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Eui.String.leftPad(hr, 2, '0') + Eui.String.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
            ].join("\n"),
            s: "([+-]\\d{2}:\\d{2})" // GMT offset in hrs and mins (with colon separator)
        },
        T: {
            g:0,
            c:null,
            s:"[A-Z]{1,5}" // timezone abbrev. may be between 1 - 5 chars
        },
        Z: {
            g:1,
            c:"zz = results[{0}] * 1;\n" // -43200 <= UTC offset <= 50400
                  + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
            s:"([+-]?\\d{1,5})" // leading '+' sign is optional for UTC offset
        },
        c: function() {
            var calc = [],
                arr = [
                    utilDate.formatCodeToRegex("Y", 1), // year
                    utilDate.formatCodeToRegex("m", 2), // month
                    utilDate.formatCodeToRegex("d", 3), // day
                    utilDate.formatCodeToRegex("H", 4), // hour
                    utilDate.formatCodeToRegex("i", 5), // minute
                    utilDate.formatCodeToRegex("s", 6), // second
                    {c:"ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"}, // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
                    {c:[ // allow either "Z" (i.e. UTC) or "-0530" or "+08:00" (i.e. UTC offset) timezone delimiters. assumes local timezone if no timezone is specified
                        "if(results[8]) {", // timezone specified
                            "if(results[8] == 'Z'){",
                                "zz = 0;", // UTC
                            "}else if (results[8].indexOf(':') > -1){",
                                utilDate.formatCodeToRegex("P", 8).c, // timezone offset with colon separator
                            "}else{",
                                utilDate.formatCodeToRegex("O", 8).c, // timezone offset without colon separator
                            "}",
                        "}"
                    ].join('\n')}
                ],
                i,
                l;

            for (i = 0, l = arr.length; i < l; ++i) {
                calc.push(arr[i].c);
            }

            return {
                g:1,
                c:calc.join(""),
                s:[
                    arr[0].s, // year (required)
                    "(?:", "-", arr[1].s, // month (optional)
                        "(?:", "-", arr[2].s, // day (optional)
                            "(?:",
                                "(?:T| )?", // time delimiter -- either a "T" or a single blank space
                                arr[3].s, ":", arr[4].s,  // hour AND minute, delimited by a single colon (optional). MUST be preceded by either a "T" or a single blank space
                                "(?::", arr[5].s, ")?", // seconds (optional)
                                "(?:(?:\\.|,)(\\d+))?", // decimal fraction of a second (e.g. ",12345" or ".98765") (optional)
                                "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?", // "Z" (UTC) or "-0530" (UTC offset without colon delimiter) or "+08:00" (UTC offset with colon delimiter) (optional)
                            ")?",
                        ")?",
                    ")?"
                ].join("")
            };
        },
        U: {
            g:1,
            c:"u = parseInt(results[{0}], 10);\n",
            s:"(-?\\d+)" // leading minus sign indicates seconds before UNIX epoch
        }
    },

    //Old Eui.Date prototype methods.
    // private
    dateFormat: function(date, format) {
        return utilDate.format(date, format);
    },

    /**
     * 通过比较两个日期对象的值来判断两个日期是否相等.
     *
     * @memberof Eui.Date
     * @param {Date} date1
     * @param {Date} date2
     * @return {Boolean} 如果日期值相等则返回true.
     */
    isEqual: function(date1, date2) {
        // check we have 2 date objects
        if (date1 && date2) {
            return (date1.getTime() === date2.getTime());
        }
        // one or both isn't a date, only equal if both are falsey
        return !(date1 || date2);
    },

    /**
     * 根据指定的格式将对象格式化.
     * @memberof Eui.Date
     * @param {Date} date 需要格式字符串格式化的日期对象.
     * @param {String} format 日期格式字符串.
     * @return {String} 格式化后的日期对象或''（如果日期参数不是一个 JavaScript 日期对象）.
     */
    format: function(date, format) {
        var formatFunctions = utilDate.formatFunctions;

        if (!Eui.isDate(date)) {
            return '';
        }

        if (formatFunctions[format] == null) {
            utilDate.createFormat(format);
        }

        return formatFunctions[format].call(date) + '';
    },

    /**
     * 返回当前日期的时区缩写(等同于指定输出格式“T”).
     *
     * 注意:
     * 对于不同的浏览器(例如 FF 与 IE)和系统区域设置(例如 IE 设置为亚洲与 IE 设置为美国),
     * 通过 javascript 对象的 tostring() 方法返回的日期字符串也会发生变化。
     * 对于一个给定的日期字符串，例如 "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)",
     * getTimezone() 方法首先尝试从一对括号之间获取时区缩写 (可能存在或不存在)，
     * 如果获取不成功它将从日期字符串的 GMT 偏移量部分获取时区缩写。
     *
     * @memberof Eui.Date
     * @param {Date} date 日期对象.
     * @return {String} 时区名称的缩写(e.g. 'CST', 'PDT', 'EDT', 'MPST' ...).
     */
    getTimezone : function(date) {
        // the following list shows the differences between date strings from different browsers on a WinXP SP2 machine from an Asian locale:
        //
        // OpEui  : "Thu, 25 Oct 2007 22:53:45 GMT+0800" -- shortest (weirdest) date string of the lot
        // Safari : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone (same as FF)
        // FF     : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone
        // IE     : "Thu Oct 25 22:54:35 UTC+0800 2007" -- (Asian system setting) look for 3-4 letter timezone abbrev
        // IE     : "Thu Oct 25 17:06:37 PDT 2007" -- (American system setting) look for 3-4 letter timezone abbrev
        //
        // this crazy regex attempts to guess the correct timezone abbreviation despite these differences.
        // step 1: (?:\((.*)\) -- find timezone in parentheses
        // step 2: ([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?) -- if nothing was found in step 1, find timezone from timezone offset portion of date string
        // step 3: remove all non uppercase characters found in step 1 and 2
        return date.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,5})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
    },

    /**
     * 返回 GMT 到当前日期的偏移 量(等同于指定输出格式“O”).
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @param {Boolean} [colon=false] (可选) 如果为 true，用冒号分隔小时数和分钟数(默认为 false).
     * @return {String} 以“+”或“-”加上4位字符表示的偏移量（例如：“-0600”）.
     */
    getGMTOffset : function(date, colon) {
        var offset = date.getTimezoneOffset();
        return (offset > 0 ? "-" : "+")
            + Eui.String.leftPad(Math.floor(Math.abs(offset) / 60), 2, "0")
            + (colon ? ":" : "")
            + Eui.String.leftPad(Math.abs(offset % 60), 2, "0");
    },

    /**
     * 返回当前年份中天数的数值，已经根据闰年调整过.
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @return {Number} 0 到 365（闰年时为 366）.
     */
    getDayOfYear: function(date) {
        var num = 0,
            d = Eui.Date.clone(date),
            m = date.getMonth(),
            i;

        for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
            num += utilDate.getDaysInMonth(d);
        }
        return num + date.getDate() - 1;
    },

    /**
     * 从年份中获取 ISO-8601 标准的星期数.
     * （等同于指定输出格式“W”，如果没有补0）.
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @return {Number} 返回范围从 1 到 53 中.
     * @method
     */
    getWeekOfYear : (function() {
        // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
        var ms1d = 864e5, // milliseconds in a day
            ms7d = 7 * ms1d; // milliseconds in a week

        return function(date) { // return a closure so constants get calculated only once
            var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d, // an Absolute Day Number
                AWN = Math.floor(DC3 / 7), // an Absolute Week Number
                Wyr = new Date(AWN * ms7d).getUTCFullYear();

            return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
        };
    }()),

    /**
     * 返回当前日期是否闰年.
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @return {Boolean} 如果当前日期属于闰年，则返回true，否则返回false.
     */
    isLeapYear : function(date) {
        var year = date.getFullYear();
        return !!((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
    },

    /**
     * 返回当前月份第一天的数值，已经根据闰年调整过.
     * 返回值为以数字表示的一周中的第几天（0～6）可以与数组 {@link Eui.Date.monthNames|monthNames}
     * 一起使用来表示当天的星期.
     *
     * 示例:
     *
     *     var dt = new Date('1/10/2007'),
     *         firstDay = Eui.Date.getFirstDayOfMonth(dt);
     *     console.log(Eui.Date.dayNames[firstDay]); // output: 'Monday'
     *
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @return {Number} 一周中的天数（0～6）.
     */
    getFirstDayOfMonth : function(date) {
        var day = (date.getDay() - (date.getDate() - 1)) % 7;
        return (day < 0) ? (day + 7) : day;
    },

    /**
     * 返回当前月份最后一天的数值，已经根据闰年调整过.
     * 返回值为以数字表示的一周中的第几天（0～6）可以与数组 {@link Eui.Date.monthNames|monthNames}
     * 一起使用来表示当天的星期.
     *
     *  示例:
     *
     *     var dt = new Date('1/10/2007'),
     *         lastDay = Eui.Date.getLastDayOfMonth(dt);
     *     console.log(Eui.Date.dayNames[lastDay]); // 输出: 'Wednesday'
     *
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @return {Number} 一周中的天数（0～6）.
     */
    getLastDayOfMonth : function(date) {
        return utilDate.getLastDateOfMonth(date).getDay();
    },


    /**
     * 返回当前月份中第一天的日期对象.
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @return {Date}
     */
    getFirstDateOfMonth : function(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    /**
     * 返回当前月份中最后一天的日期对象.
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @return {Date}
     */
    getLastDateOfMonth : function(date) {
        return new Date(date.getFullYear(), date.getMonth(), utilDate.getDaysInMonth(date));
    },

    /**
     * 返回当前月份中天数的数值，已经根据闰年调整过.
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @return {Number} 月份的天数.
     * @method
     */
    getDaysInMonth: (function() {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return function(date) { // return a closure for efficiency
            var m = date.getMonth();

            return m == 1 && utilDate.isLeapYear(date) ? 29 : daysInMonth[m];
        };
    }()),

    //<locale type="function">
    /**
     * 返回当天的英文单词的后缀（等同于指定输出格式“S”）.
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @return {String} 'st, 'nd', 'rd' or 'th'.
     */
    getSuffix : function(date) {
        switch (date.getDate()) {
            case 1:
            case 21:
            case 31:
                return "st";
            case 2:
            case 22:
                return "nd";
            case 3:
            case 23:
                return "rd";
            default:
                return "th";
        }
    },
    //</locale>

    /**
     * 创建并返回一个具有完全相同的日期值作为调用实例的新的日期实例。
     * 日期复制并按引用传递，所以如果复制的日期修改变量后， 原变量也将更改。
     * 当意图是要创建一个新的变量，并将不会修改原始实例时， 您应该创建一个克隆。
     *
     * 正确克隆一个日期的示例:
     *
     *     //wrong way:
     *     var orig = new Date('10/1/2006');
     *     var copy = orig;
     *     copy.setDate(5);
     *     console.log(orig);  // 返回 'Thu Oct 05 2006'!
     *
     *     //correct way:
     *     var orig = new Date('10/1/2006'),
     *         copy = Eui.Date.clone(orig);
     *     copy.setDate(5);
     *     console.log(orig);  // 返回 'Thu Oct 01 2006'
     *
     * @memberof Eui.Date
     * @param {Date} date 日期对象.
     * @return {Date} 新的日期实例.
     */
    clone : function(date) {
        return new Date(date.getTime());
    },

    /**
     * 检查指定日期是否受夏令时(DST)影响。
     *
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @return {Boolean} 如果当前日期受夏令时(DST)影响，则返回true.
     */
    isDST : function(date) {
        // adapted from http://sencha.com/forum/showthread.php?p=247172#post247172
        // courtesy of @geoffrey.mcgill
        return new Date(date.getFullYear(), 0, 1).getTimezoneOffset() != date.getTimezoneOffset();
    },

    /**
     * 尝试通过将时间设置为午夜的同一天，在适用的情况自动调整为夏令时 (DST) 清除此日期的所有时间信息。
     * (注意: 浏览器的主机操作系统的 DST 时区信息被假定为最新)
     *
     * @memberof Eui.Date
     * @param {Date} date 日期对象
     * @param {Boolean} [clone=false] 值为“true”时创建一个当前日期对象的克隆，清除克隆对象的时间信息后返回（默认为 false）.
     * @return {Date} 实例本身或实例的克隆.
     */
    clearTime : function(date, clone) {
        if (clone) {
            return Eui.Date.clearTime(Eui.Date.clone(date));
        }

        // get current date before clearing time
        var d = date.getDate(),
            hr,
            c;

        // clear time
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        if (date.getDate() != d) { // account for DST (i.e. day of month changed when setting hour = 0)
            // note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
            // refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule

            // increment hour until cloned date == current date
            for (hr = 1, c = utilDate.add(date, Eui.Date.HOUR, hr); c.getDate() != d; hr++, c = utilDate.add(date, Eui.Date.HOUR, hr));

            date.setDate(d);
            date.setHours(c.getHours());
        }

        return date;
    },

    /**
     * 提供执行基本日期运算的简便方法.
     * 此方法不修改被调用的日期实例 - 它将创建并返回包含生成的日期值的一个新的日期对象实例。
     *
     * 示例:
     *
     *     // 基本用法:
     *     var dt = Eui.Date.add(new Date('10/29/2006'), Eui.Date.DAY, 5);
     *     console.log(dt); // 返回 'Fri Nov 03 2006 00:00:00'
     *
     *     // 负数将按照减法运算:
     *     var dt2 = Eui.Date.add(new Date('10/1/2006'), Eui.Date.DAY, -5);
     *     console.log(dt2); // 返回 'Tue Sep 26 2006 00:00:00'
     *
     *      // 可以使用十进制值:
     *     var dt3 = Eui.Date.add(new Date('10/1/2006'), Eui.Date.DAY, 1.25);
     *     console.log(dt3); // 返回 'Mon Oct 02 2006 06:00:00'
     *
     * @memberof Eui.Date
     * @param {Date} date 被修改的日期对象
     * @param {String} 一个有效的日期间隔枚举值.
     * @param {Number} value 向当前日期上增加的总数.
     * @return {Date} 新的日期对象实例.
     */
    add : function(date, interval, value) {
        var d = Eui.Date.clone(date),
            Date = Eui.Date,
            day, decimalValue, base = 0;
        if (!interval || value === 0) {
            return d;
        }

        decimalValue = value - parseInt(value, 10);
        value = parseInt(value, 10);

        if (value) {
            switch(interval.toLowerCase()) {
                // See EXTJSIV-7418. We use setTime() here to deal with issues related to
                // the switchover that occurs when changing to daylight savings and vice
                // versa. setTime() handles this correctly where setHour/Minute/Second/Millisecond
                // do not. Let's assume the DST change occurs at 2am and we're incrementing using add
                // for 15 minutes at time. When entering DST, we should see:
                // 01:30am
                // 01:45am
                // 03:00am // skip 2am because the hour does not exist
                // ...
                // Similarly, leaving DST, we should see:
                // 01:30am
                // 01:45am
                // 01:00am // repeat 1am because that's the change over
                // 01:30am
                // 01:45am
                // 02:00am
                // ....
                // 
                case Eui.Date.MILLI:
                    d.setTime(d.getTime() + value);
                    break;
                case Eui.Date.SECOND:
                    d.setTime(d.getTime() + value * 1000);
                    break;
                case Eui.Date.MINUTE:
                    d.setTime(d.getTime() + value * 60 * 1000);
                    break;
                case Eui.Date.HOUR:
                    d.setTime(d.getTime() + value * 60 * 60 * 1000);
                    break;
                case Eui.Date.DAY:
                    d.setDate(d.getDate() + value);
                    break;
                case Eui.Date.MONTH:
                    day = date.getDate();
                    if (day > 28) {
                        day = Math.min(day, Eui.Date.getLastDateOfMonth(Eui.Date.add(Eui.Date.getFirstDateOfMonth(date), Eui.Date.MONTH, value)).getDate());
                    }
                    d.setDate(day);
                    d.setMonth(date.getMonth() + value);
                    break;
                case Eui.Date.YEAR:
                    day = date.getDate();
                    if (day > 28) {
                        day = Math.min(day, Eui.Date.getLastDateOfMonth(Eui.Date.add(Eui.Date.getFirstDateOfMonth(date), Eui.Date.YEAR, value)).getDate());
                    }
                    d.setDate(day);
                    d.setFullYear(date.getFullYear() + value);
                    break;
            }
        }

        if (decimalValue) {
            switch (interval.toLowerCase()) {
                case Eui.Date.MILLI:    base = 1;               break;
                case Eui.Date.SECOND:   base = 1000;            break;
                case Eui.Date.MINUTE:   base = 1000*60;         break;
                case Eui.Date.HOUR:     base = 1000*60*60;      break;
                case Eui.Date.DAY:      base = 1000*60*60*24;   break;

                case Eui.Date.MONTH:
                    day = utilDate.getDaysInMonth(d);
                    base = 1000*60*60*24*day;
                    break;

                case Eui.Date.YEAR:
                    day = (utilDate.isLeapYear(d) ? 366 : 365);
                    base = 1000*60*60*24*day;
                    break;
            }
            if (base) {
                d.setTime(d.getTime() + base * decimalValue); 
            }
        }

        return d;
    },
    
    /**
     * 提供方法用来执行日期的基本算法。
     * 该方法不会修改被调用的日期。它返回一个新的日期实例。
     * 
     * 示例:
     *
     *     // 基本用法:
     *     var dt = Eui.Date.subtract(new Date('10/29/2006'), Eui.Date.DAY, 5);
     *     console.log(dt); // 返回 'Tue Oct 24 2006 00:00:00'
     *
     *     // 负数将按照减法运算:
     *     var dt2 = Eui.Date.subtract(new Date('10/1/2006'), Eui.Date.DAY, -5);
     *     console.log(dt2); // 返回 'Fri Oct 6 2006 00:00:00'
     *
     *      // 十进制运算:
     *     var dt3 = Eui.Date.subtract(new Date('10/1/2006'), Eui.Date.DAY, 1.25);
     *     console.log(dt3); // 返回 'Fri Sep 29 2006 06:00:00'
     *
     * @memberof Eui.Date
     * @param {Date} date 被修改的日期
     * @param {String} interval 一个有效的日期间隔枚举值.
     * @param {Number} value 当前日期减去的数.
     * @return {Date} 新的日期实例.
     */
    subtract: function(date, interval, value){
        return utilDate.add(date, interval, -value);
    },

    /**
     * 检查一个日期是否处在给定的开始日期和结束日期之间，包含这两个日期.
     * @memberof Eui.Date
     * @param {Date} date 要检查的日期对象
     * @param {Date} start 开始日期对象
     * @param {Date} end 结束日期对象
     * @return {Boolean} 如果这个日期在给定的开始和结束日期之间（包含边界值）则返回true.
     */
    between : function(date, start, end) {
        var t = date.getTime();
        return start.getTime() <= t && t <= end.getTime();
    },

    //Maintains compatibility with old static and prototype window.Date methods.
    compat: function() {
        var nativeDate = window.Date,
            p,
            statics = ['useStrict', 'formatCodeToRegex', 'parseFunctions', 'parseRegexes', 'formatFunctions', 'y2kYear', 'MILLI', 'SECOND', 'MINUTE', 'HOUR', 'DAY', 'MONTH', 'YEAR', 'defaults', 'dayNames', 'monthNames', 'monthNumbers', 'getShortMonthName', 'getShortDayName', 'getMonthNumber', 'formatCodes', 'isValid', 'parseDate', 'getFormatCode', 'createFormat', 'createParser', 'parseCodes'],
            proto = ['dateFormat', 'format', 'getTimezone', 'getGMTOffset', 'getDayOfYear', 'getWeekOfYear', 'isLeapYear', 'getFirstDayOfMonth', 'getLastDayOfMonth', 'getDaysInMonth', 'getSuffix', 'clone', 'isDST', 'clearTime', 'add', 'between'],
            sLen    = statics.length,
            pLen    = proto.length,
            stat, prot, s;

        //Append statics
        for (s = 0; s < sLen; s++) {
            stat = statics[s];
            nativeDate[stat] = utilDate[stat];
        }

        //Append to prototype
        for (p = 0; p < pLen; p++) {
            prot = proto[p];
            nativeDate.prototype[prot] = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this);
                return utilDate[prot].apply(utilDate, args);
            };
        }
    }
  });
};

Eui.Date.patterns = {
    ISO8601Long:"Y-m-d H:i:s",
    ISO8601Short:"Y-m-d",
    ShortDate: "n/j/Y",
    LongDate: "l, F d, Y",
    FullDateTime: "l, F d, Y g:i:s A",
    MonthDay: "F d",
    ShortTime: "g:i A",
    LongTime: "g:i:s A",
    SortableDateTime: "Y-m-d\\TH:i:s",
    UniversalSortableDateTime: "Y-m-d H:i:sO",
    YearMonth: "F, Y"
};

/**
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/json.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * [Douglas Crockford's JSON.js][dc] 的修改版本，该版本没有“入侵”Object对象的prototype。
 *
 * [dc]: http://www.json.org/js.html
 *
 * @namespace Eui.JSON
 */
Eui.JSON = (new(function() {
    var me = this,
    encodingFunction,
    decodingFunction,
    useNative = null,
    useHasOwn = !! {}.hasOwnProperty,
    isNative = function() {
        if (useNative === null) {
            useNative = Eui.USE_NATIVE_JSON && window.JSON && JSON.toString() == '[object JSON]';
        }
        return useNative;
    },
    pad = function(n) {
        return n < 10 ? "0" + n : n;
    },
    doDecode = function(json) {
        return eval("(" + json + ')');
    },
    doEncode = function(o, newline) {
        // http://jsperf.com/is-undefined
        if (o === null || o === undefined) {
            return "null";
        } else if (Eui.isDate(o)) {
            return Eui.JSON.encodeDate(o);
        } else if (Eui.isString(o)) {
            return Eui.JSON.encodeString(o);
        } else if (typeof o == "number") {
            //don't use isNumber here, since finite checks happen inside isNumber
            return isFinite(o) ? String(o) : "null";
        } else if (Eui.isBoolean(o)) {
            return String(o);
        }
        // Allow custom zerialization by adding a toJSON method to any object type.
        // Date/String have a toJSON in some environments, so check these first.
        else if (o.toJSON) {
            return o.toJSON();
        } else if (Eui.isArray(o)) {
            return encodeArray(o, newline);
        } else if (Eui.isObject(o)) {
            return encodeObject(o, newline);
        } else if (typeof o === "function") {
            return "null";
        }
        return 'undefined';
    },
    m = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"': '\\"',
        "\\": '\\\\',
        '\x0b': '\\u000b' //ie doesn't handle \v
    },
    charToReplace = /[\\\"\x00-\x1f\x7f-\uffff]/g,
    encodeString = function(s) {
        return '"' + s.replace(charToReplace, function(a) {
            var c = m[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    },

    //<debug>
    encodeArrayPretty = function(o, newline) {
        var len = o.length,
            cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["[", cnewline], // Note newline in case there are no members
            i;

        for (i = 0; i < len; i += 1) {
            a.push(Eui.JSON.encodeValue(o[i], cnewline), sep);
        }

        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = newline + ']';

        return a.join('');
    },

    encodeObjectPretty = function(o, newline) {
        var cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["{", cnewline], // Note newline in case there are no members
            i, val;

        for (i in o) {
            val = o[i];
            if (!useHasOwn || o.hasOwnProperty(i)) {
                // To match JSON.stringify, we shouldn't encode functions or undefined
                if (typeof val === 'function' || val === undefined) {
                    continue;
                }
                a.push(Eui.JSON.encodeValue(i) + ': ' + Eui.JSON.encodeValue(val, cnewline), sep);
            }
        }

        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = newline + '}';

        return a.join('');
    },
    //</debug>

    encodeArray = function(o, newline) {
        //<debug>
        if (newline) {
            return encodeArrayPretty(o, newline);
        }
        //</debug>

        var a = ["[", ""], // Note empty string in case there are no serializable members.
            len = o.length,
            i;
        for (i = 0; i < len; i += 1) {
            a.push(Eui.JSON.encodeValue(o[i]), ',');
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = ']';
        return a.join("");
    },

    encodeObject = function(o, newline) {
        //<debug>
        if (newline) {
            return encodeObjectPretty(o, newline);
        }
        //</debug>

        var a = ["{", ""], // Note empty string in case there are no serializable members.
            i, val;
        for (i in o) {
            val = o[i];
            if (!useHasOwn || o.hasOwnProperty(i)) {
                // To match JSON.stringify, we shouldn't encode functions or undefined
                if (typeof val === 'function' || val === undefined) {
                    continue;
                }
                a.push(Eui.JSON.encodeValue(i), ":", Eui.JSON.encodeValue(val), ',');
                
            }
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = '}';
        return a.join("");
    };
    
    /**
     * Encodes a String. This returns the actual string which is inserted into the JSON string as the literal
     * expression. **The returned value includes enclosing double quotation marks.**
     *
     * To override this:
     *
     *     Eui.JSON.encodeString = function(s) {
     *         return 'Foo' + s;
     *     };
     *
     * @param {String} s The String to encode
     * @return {String} The string literal to use in a JSON string.
     * @method
     */
    me.encodeString = encodeString;

    /**
     * 当 {@link Eui.USE_NATIVE_JSON}为false时，
     * {@link Eui.JSON.encode|encode}用来编码所有的javascript值成他们的 JSON 表示形式的函数。
     *
     * 这是公开的，这样它可以被替换为一个自定义实现。
     *
     * @memberof Eui.JSON
     * @method encodeValue
     * @param {Object} o 任何 javascript 值转换为它的 JSON 表示形式.
     * @return {String} T传递的值的 JSON 表示形式.
     */
    me.encodeValue = doEncode;

    /**
     * 编码一个日期。将返回的实际字符串，插入到 JSON 字符串作为文本表达式。
     * **返回值包括封闭双引号**。
     *
     * 返回的默认格式是 "yyyy-mm-ddThh:mm:ss"。
     *
     * 要覆盖它:
     *
     *     Eui.JSON.encodeDate = function(d) {
     *         return Eui.Date.format(d, '"Y-m-d"');
     *     };
     *
     * @memberof Eui.JSON
     * @method encodeDate
     * @param {Date} d 要进行编码的日期.
     * @return {String} 以 JSON 字符串形式表示的字符串文字。
     */
    me.encodeDate = function(o) {
        return '"' + o.getFullYear() + "-"
        + pad(o.getMonth() + 1) + "-"
        + pad(o.getDate()) + "T"
        + pad(o.getHours()) + ":"
        + pad(o.getMinutes()) + ":"
        + pad(o.getSeconds()) + '"';
    };

    /**
     * 编码对象、 数组或其他值。
     *
     * 如果环境中的原生JSON编码没有被使用 ({@link Eui.USE_NATIVE_JSON} 没有设置，或环境不支持)，
     * 那么将使用Eui的编码。
     * 这里允许开发人员在需要序列化的类中添加 toJSON 方法， 返回有效的 JSON 表示形式的对象。
     *
     * @memberof Eui.JSON
     * @method encode
     * @param {Object} o 要进行编码的变量
     * @return {String} JSON 字符串。
     */
    me.encode = function(o) {
        if (!encodingFunction) {
            // setup encoding function on first access
            encodingFunction = isNative() ? JSON.stringify : me.encodeValue;
        }
        return encodingFunction(o);
    };

    /**
     * 解码（解析）JSON字符串对象。如果JSON是无效的，
     * 这个函数抛出一个SyntaxError，除非设置了安全选项
     *
     * @memberof Eui.JSON
     *  @method decode
     * @param {String} json JSON字符串.
     * @param {Boolean} [safe=false]  如果JSON是无效的，是否返回null或抛出一个异常。
     * @return {Object} 由此生成的对象.
     */
    me.decode = function(json, safe) {
        if (!decodingFunction) {
            // setup decoding function on first access
            decodingFunction = isNative() ? JSON.parse : doDecode;
        }
        try {
            return decodingFunction(json);
        } catch (e) {
            if (safe === true) {
                return null;
            }
            console.log("You're trying to decode an invalid JSON String: " + json);
        }
    };
})());
/**
 * Shorthand for {@link Eui.JSON.encode}
 * @memberof $
 * @method encode
 */
Eui.encode = Eui.JSON.encode;
/**
 * Shorthand for {@link Eui.JSON.decode}
 * @memberof $
 * @method decode
 */
Eui.decode = Eui.JSON.decode;
/**
 *  * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/hashmap.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 代表键值对的集合。HashMap中的每个键 必须唯一，同一个键不能出现两次。
 * 只能通过 键访问HashMap中的项。使用范例：
 *
 *     var map = new Eui.util.HashMap();
 *     map.add('key1', 1);
 *     map.add('key2', 2);
 *     map.add('key3', 3);
 *
 *     map.each(function(key, value, length){
 *         console.log(key, value, length);
 *     });
 *
 * HashMap是无序的， 无法保证遍历其中的项时，这些项是某种 特定的顺序。
 * @class Eui.util.HashMap
 */
(function(){

    Eui.util.HashMap = function(config){
        config = config || {};
        var me = this,
            keyFn = config.keyFn;

        me.initialConfig = config;

        me.clear(true);

        if (keyFn) {
            me.getKey = keyFn;
        }

    };

  Eui.util.HashMap.prototype = {
        generation: 0,
        map : {},
        length : 0,

        /**
         * 获取哈希表中项的条数。
         * @return {Number} 哈希表中项的条数。
         */
        getCount: function() {
            return this.length;
        },

        /**
         * Implementation for being able to extract the key from an object if only
         * a single argument is passed.
         * @private
         * @param {String} key The key
         * @param {Object} value The value
         * @return {Array} [key, value]
         */
        getData: function(key, value) {
            // if we have no value, it means we need to get the key from the object
            if (value === undefined) {
                value = key;
                key = this.getKey(value);
            }

            return [key, value];
        },

        /**
         * 从对象中提取键。它是一个默认的实现，它可以被覆盖。
         * @param {Object} o 待提取键的对象
         * @return {String} 对象的键
         */
        getKey: function(o) {
            return o.id;
        },

        /**
         * 向哈希表中添加项。
         *
         * @param {String/Object} key 项的键
         *
         * 如果为这个HashMap指定了{@link Eui.util.HashMap#getKey|getKey}实现，
         * 或者保存的项的键保存在id属性中， HashMap将能*取得*新项的键。
         * 这样只需要在参数中传新的项。
         *
         * @param {Object} [value] 待添加的项
         * @return {Object} 添加的项
         */
        add: function(key, value) {
            var me = this;

            // Need to check arguments length here, since we could have called:
            // map.add('foo', undefined);
            if (arguments.length === 1) {
                value = key;
                key = me.getKey(value);
            }

            if (me.containsKey(key)) {
                return me.replace(key, value);
            }

            me.map[key] = value;
            ++me.length;
            me.generation++;
            return value;
        },

        /**
         * 替换哈希表中的一个项。如果键不存在， 将使用{@link Eui.util.HashMap#add|add}。
         * @param {String} key 项的键
         * @param {Object} value 项的新值
         * @return {Object} 项的新值
         */
        replace: function(key, value) {
            var me = this,
                map = me.map,
                old;

            // Need to check arguments length here, since we could have called:
            // map.replace('foo', undefined);
            if (arguments.length === 1) {
                value = key;
                key = me.getKey(value);
            }

            if (!me.containsKey(key)) {
                me.add(key, value);
            }
            old = map[key];
            map[key] = value;
            me.generation++;
            return value;
        },

        /**
         * 移除哈希表中的一个项。
         * @param {Object} o 待移除项的值
         * @return {Boolean} 成功移除时返回true。
         */
        remove: function(o) {
            var key = this.findKey(o);
            if (key !== undefined) {
                return this.removeAtKey(key);
            }
            return false;
        },

        /**
         *移除哈希表中的一个项。
         * @param {String} key 待移除的键
         * @return {Boolean} 成功移除时返回true。
         */
        removeAtKey: function(key) {
            var me = this,
                value;

            if (me.containsKey(key)) {
                value = me.map[key];
                delete me.map[key];
                --me.length;
                me.generation++;
                return true;
            }
            return false;
        },

        /**
         * 使用特定的键检索项。
         * @param {String} key 检索的键
         * @return {Object} 键对应的值，如果不存在，返回undefined。
         */
        get: function(key) {
            var map = this.map;
            return map.hasOwnProperty(key) ? map[key] : undefined;
        },

        /**
         * 移除哈希表中的所有项。
         * @return {Eui.util.HashMap} this
         */
        clear: function(/* private */ initial) {
            var me = this;

            // Only clear if it has ever had any content
            if (initial || me.generation) {
                me.map = {};
                me.length = 0;
                me.generation = initial ? 0 : me.generation + 1;
            }
            return me;
        },

        /**
         * 检查哈希表中是否存在某个键。
         * @param {String} key 待检查的键.
         * @return {Boolean} 如果哈希中存在，则返回true.
         */
        containsKey: function(key) {
            var map = this.map;
            return map.hasOwnProperty(key) && map[key] !== undefined;
        },

        /**
         * 检查哈希表中是否存在某个值。
         * @param {Object} value 待检查的值
         * @return {Boolean} 如果值存在返回true。
         */
        contains: function(value) {
            return this.containsKey(this.findKey(value));
        },

        /**
         * 返回哈希表中的所有的键。
         * @return {Array} 键数组
         */
        getKeys: function() {
            return this.getArray(true);
        },

        /**
         * 返回哈希表中的所有的值。
         * @return {Array} 值数组
         */
        getValues: function() {
            return this.getArray(false);
        },

        /**
         * Gets either the keys/values in an array from the hash.
         * @private
         * @param {Boolean} isKey True to extract the keys, otherwise, the value
         * @return {Array} An array of either keys/values from the hash.
         */
        getArray: function(isKey) {
            var arr = [],
                key,
                map = this.map;
            for (key in map) {
                if (map.hasOwnProperty(key)) {
                    arr.push(isKey ? key: map[key]);
                }
            }
            return arr;
        },

        /**
         * 对哈希表中的每个项执行一次指定的函数。
         *  函数返回false将停止迭代。
         *
         * @param {Function} fn 待执行的函数。
         * @param {String} fn.key 每一项的键.
         * @param {Number} fn.value 每一项的值.
         * @param {Number} fn.length 哈希对象的长度.
         * @param {Object} [scope] 函数执行的作用域。默认为<tt>this</tt>.
         * @return {Eui.util.HashMap} this
         */
        each: function(fn, scope) {
            // copy items so they may be removed during iterration.
            var items = Eui.apply({}, this.map),
                key,
                length = this.length;

            scope = scope || this;
            for (key in items) {
                if (items.hasOwnProperty(key)) {
                    if (fn.call(scope, key, items[key], length) === false) {
                        break;
                    }
                }
            }
            return this;
        },

        /**
         * 浅拷贝哈希表。
         * @return {Eui.util.HashMap} 新的哈希对象
         */
        clone: function() {
            var hash = new this.self(this.initialConfig),
                map = this.map,
                key;

            hash.suspendEvents();
            for (key in map) {
                if (map.hasOwnProperty(key)) {
                    hash.add(key, map[key]);
                }
            }
            hash.resumeEvents();
            return hash;
        },

        /**
         * 获取指定值对应的键.
         * @param {Object} value 待查找的值.
         * @return {Object} 值对应的键. 如果未找到，则返回`undefined`.
         */
        findKey: function(value) {
            var key,
                map = this.map;

            for (key in map) {
                if (map.hasOwnProperty(key) && map[key] === value) {
                    return key;
                }
            }
            return undefined;
        }
    };
})();

/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath fixed/eui.fixed.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function(undefined) {
	if (String.prototype.trim === undefined) { // fix for iOS 3.2
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}
	Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
		obj['__proto__'] = proto;
		return obj;
	};

})();
/**
 * fixed CustomEvent
 */
(function() {
	if (typeof window.CustomEvent === 'undefined') {
		function CustomEvent(event, params) {
			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};
			var evt = document.createEvent('Events');
			var bubbles = true;
			for (var name in params) {
				(name === 'bubbles') ? (bubbles = !!params[name]) : (evt[name] = params[name]);
			}
			evt.initEvent(event, bubbles, true);
			return evt;
		};
		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent;
	}
})();
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath fixed/eui.fixed.classlist.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function(document) {
    if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {

        Object.defineProperty(HTMLElement.prototype, 'classList', {
            get: function() {
                var self = this;
                function update(fn) {
                    return function(value) {
                        var classes = self.className.split(/\s+/),
                                index = classes.indexOf(value);

                        fn(classes, index, value);
                        self.className = classes.join(" ");
                    };
                }

                var ret = {
                    add: update(function(classes, index, value) {
                        ~index || classes.push(value);
                    }),
                    remove: update(function(classes, index) {
                        ~index && classes.splice(index, 1);
                    }),
                    toggle: update(function(classes, index, value) {
                        ~index ? classes.splice(index, 1) : classes.push(value);
                    }),
                    contains: function(value) {
                        return !!~self.className.split(/\s+/).indexOf(value);
                    },
                    item: function(i) {
                        return self.className.split(/\s+/)[i] || null;
                    }
                };

                Object.defineProperty(ret, 'length', {
                    get: function() {
                        return self.className.split(/\s+/).length;
                    }
                });

                return ret;
            }
        });
    }
})(document);

/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath fixed/eui.fixed.animation.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function(window) {
	if (!window.requestAnimationFrame) {
		var lastTime = 0;
		window.requestAnimationFrame = window.webkitRequestAnimationFrame || function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
		window.cancelAnimationFrame = window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || function(id) {
			clearTimeout(id);
		};
	};
}(window));
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath fixed/eui.fixed.fastclick.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function($, window, name) {
	if (window.FastClick) {
		return;
	}

	var handle = function(event, target) {
		if (target.tagName === 'LABEL') {
			if (target.parentNode) {
				target = target.parentNode.querySelector('input');
			}
		}
		if (target && (target.type === 'radio' || target.type === 'checkbox')) {
			if (!target.disabled) { //disabled
				return target;
			}
		}
		return false;
	};

	$.registerTarget({
		name: name,
		index: 40,
		handle: handle,
		target: false
	});
	var dispatchEvent = function(event) {
		var targetElement = $.targets.click;
		if (targetElement) {
			var clickEvent, touch;
			// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect
			if (document.activeElement && document.activeElement !== targetElement) {
				document.activeElement.blur();
			}
			touch = event.detail.gesture.changedTouches[0];
			// Synthesise a click event, with an extra attribute so it can be tracked
			clickEvent = document.createEvent('MouseEvents');
			clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
			clickEvent.forwardedTouchEvent = true;
			targetElement.dispatchEvent(clickEvent);
			event.detail && event.detail.gesture.preventDefault();
		}
	};
	window.addEventListener('tap', dispatchEvent);
	window.addEventListener('doubletap', dispatchEvent);
	//捕获
	window.addEventListener('click', function(event) {
		if ($.targets.click) {
			if (!event.forwardedTouchEvent) { //stop click
				if (event.stopImmediatePropagation) {
					event.stopImmediatePropagation();
				} else {
					// Part of the hack for browsers that don't support Event#stopImmediatePropagation
					event.propagationStopped = true;
				}
				event.stopPropagation();
				event.preventDefault();
				return false;
			}
		}
	}, true);

})(Eui, window, 'click');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath fixed/eui.fixed.keyboard.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function($, document) {
	$(function() {
		if (!$.os.ios) {
			return;
		}
		var CLASS_FOCUSIN = 'mui-focusin';
		var CLASS_BAR_TAB = 'mui-bar-tab';
		var CLASS_BAR_FOOTER = 'mui-bar-footer';
		var CLASS_BAR_FOOTER_SECONDARY = 'mui-bar-footer-secondary';
		var CLASS_BAR_FOOTER_SECONDARY_TAB = 'mui-bar-footer-secondary-tab';
		// var content = document.querySelector('.' + CLASS_CONTENT);
		// if (content) {
		// 	document.body.insertBefore(content, document.body.firstElementChild);
		// }
		document.addEventListener('focusin', function(e) {
			if ($.os.plus) { //在父webview里边不fix
				if (window.plus) {
					if (plus.webview.currentWebview().children().length > 0) {
						return;
					}
				}
			}
			var target = e.target;
			if (target.tagName && target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search' || target.type === 'number')) {
				if (target.disabled || target.readOnly) {
					return;
				}
				document.body.classList.add(CLASS_FOCUSIN);
				var isFooter = false;
				for (; target && target !== document; target = target.parentNode) {
					var classList = target.classList;
					if (classList && classList.contains(CLASS_BAR_TAB) || classList.contains(CLASS_BAR_FOOTER) || classList.contains(CLASS_BAR_FOOTER_SECONDARY) || classList.contains(CLASS_BAR_FOOTER_SECONDARY_TAB)) {
						isFooter = true;
						break;
					}
				}
				if (isFooter) {
					var scrollTop = document.body.scrollHeight;
					var scrollLeft = document.body.scrollLeft;
					setTimeout(function() {
						window.scrollTo(scrollLeft, scrollTop);
					}, 20);
				}
			}
		});
		document.addEventListener('focusout', function(e) {
			var classList = document.body.classList;
			if (classList.contains(CLASS_FOCUSIN)) {
				classList.remove(CLASS_FOCUSIN);
				setTimeout(function() {
					window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
				}, 20);
			}
		});
	});
})(Eui, document);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath gesture/eui.gestures.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function($, window) {
	$.EVENT_START = 'touchstart';
	$.EVENT_MOVE = 'touchmove';
	$.EVENT_END = 'touchend';
	$.EVENT_CANCEL = 'touchcancel';
	$.EVENT_CLICK = 'click';
	$.gestures = {
		session: {}
	};

	//Gesture preventDefault
	$.preventDefault = function(e) {
		e.preventDefault();
	};

	//Gesture stopPropagation
	$.stopPropagation = function(e) {
		e.stopPropagation();
	};

	//register gesture
	$.addGesture = function(gesture) {
		return $.addAction('gestures', gesture);
	};

	var round = Math.round;
	var abs = Math.abs;
	var sqrt = Math.sqrt;
	var atan = Math.atan;
	var atan2 = Math.atan2;

	/**
	 * direction
	 * @param {Object} x
	 * @param {Object} y
	 */
	var getDistance = function(p1, p2, props) {
		if (!props) {
			props = ['x', 'y'];
		}
		var x = p2[props[0]] - p1[props[0]];
		var y = p2[props[1]] - p1[props[1]];
		return sqrt((x * x) + (y * y));
	};

	/**
	 * scale
	 * @param {Object} starts
	 * @param {Object} moves
	 */
	var getScale = function(starts, moves) {
		if (starts.length >= 2 && moves.length >= 2) {
			var props = ['pageX', 'pageY'];
			return getDistance(moves[1], moves[0], props) / getDistance(starts[1], starts[0], props);
		}
		return 1;
	};

	/**
	 * angle
	 * @param {type} p1
	 * @param {type} p2
	 * @returns {Number}
	 */
	var getAngle = function(p1, p2, props) {
		if (!props) {
			props = ['x', 'y'];
		}
		var x = p2[props[0]] - p1[props[0]];
		var y = p2[props[1]] - p1[props[1]];
		return atan2(y, x) * 180 / Math.PI;
	};

	/**
	 * direction
	 * @param {Object} x
	 * @param {Object} y
	 */
	var getDirection = function(x, y) {
		if (x === y) {
			return '';
		}
		if (abs(x) >= abs(y)) {
			return x > 0 ? 'left' : 'right';
		}
		return y > 0 ? 'up' : 'down';
	};

	/**
	 * rotation
	 * @param {Object} start
	 * @param {Object} end
	 */
	var getRotation = function(start, end) {
		var props = ['pageX', 'pageY'];
		return getAngle(end[1], end[0], props) - getAngle(start[1], start[0], props);
	};

	/**
	 * px per ms
	 * @param {Object} deltaTime
	 * @param {Object} x
	 * @param {Object} y
	 */
	var getVelocity = function(deltaTime, x, y) {
		return {
			x: x / deltaTime || 0,
			y: y / deltaTime || 0
		};
	};

	/**
	 * detect gestures
	 * @param {type} event
	 * @param {type} touch
	 * @returns {undefined}
	 */
	var detect = function(event, touch) {
		if ($.gestures.stoped) {
			return;
		}
		$.doAction('gestures', function(index, gesture) {
			if (!$.gestures.stoped) {
				if ($.options.gestureConfig[gesture.name] !== false) {
					gesture.handle(event, touch);
				}
			}
		});
	};

	/**
	 * 暂时无用
	 * @param {Object} node
	 * @param {Object} parent
	 */
	var hasParent = function(node, parent) {
		while (node) {
			if (node == parent) {
				return true;
			}
			node = node.parentNode;
		}
		return false;
	};

	var uniqueArray = function(src, key, sort) {
		var results = [];
		var values = [];
		var i = 0;

		while (i < src.length) {
			var val = key ? src[i][key] : src[i];
			if (values.indexOf(val) < 0) {
				results.push(src[i]);
			}
			values[i] = val;
			i++;
		}

		if (sort) {
			if (!key) {
				results = results.sort();
			} else {
				results = results.sort(function sortUniqueArray(a, b) {
					return a[key] > b[key];
				});
			}
		}

		return results;
	};

	var getMultiCenter = function(touches) {
		var touchesLength = touches.length;
		if (touchesLength === 1) {
			return {
				x: round(touches[0].pageX),
				y: round(touches[0].pageY)
			};
		}

		var x = 0;
		var y = 0;
		var i = 0;
		while (i < touchesLength) {
			x += touches[i].pageX;
			y += touches[i].pageY;
			i++;
		}

		return {
			x: round(x / touchesLength),
			y: round(y / touchesLength)
		};
	};

	var multiTouch = function() {
		return $.options.gestureConfig.pinch;
	};

	var copySimpleTouchData = function(touch) {
		var touches = [];
		var i = 0;
		while (i < touch.touches.length) {
			touches[i] = {
				pageX: round(touch.touches[i].pageX),
				pageY: round(touch.touches[i].pageY)
			};
			i++;
		}
		return {
			timestamp: $.now(),
			gesture: touch.gesture,
			touches: touches,
			center: getMultiCenter(touch.touches),
			deltaX: touch.deltaX,
			deltaY: touch.deltaY
		};
	};

	var calDelta = function(touch) {
		var session = $.gestures.session;
		var center = touch.center;
		var offset = session.offsetDelta || {};
		var prevDelta = session.prevDelta || {};
		var prevTouch = session.prevTouch || {};

		if (touch.gesture.type === $.EVENT_START || touch.gesture.type === $.EVENT_END) {
			prevDelta = session.prevDelta = {
				x: prevTouch.deltaX || 0,
				y: prevTouch.deltaY || 0
			};

			offset = session.offsetDelta = {
				x: center.x,
				y: center.y
			};
		}
		touch.deltaX = prevDelta.x + (center.x - offset.x);
		touch.deltaY = prevDelta.y + (center.y - offset.y);
	};

	var calTouchData = function(touch) {
		var session = $.gestures.session;
		var touches = touch.touches;
		var touchesLength = touches.length;

		if (!session.firstTouch) {
			session.firstTouch = copySimpleTouchData(touch);
		}

		if (multiTouch() && touchesLength > 1 && !session.firstMultiTouch) {
			session.firstMultiTouch = copySimpleTouchData(touch);
		} else if (touchesLength === 1) {
			session.firstMultiTouch = false;
		}

		var firstTouch = session.firstTouch;
		var firstMultiTouch = session.firstMultiTouch;
		var offsetCenter = firstMultiTouch ? firstMultiTouch.center : firstTouch.center;

		var center = touch.center = getMultiCenter(touches);
		touch.timestamp = $.now();
		touch.deltaTime = touch.timestamp - firstTouch.timestamp;

		touch.angle = getAngle(offsetCenter, center);
		touch.distance = getDistance(offsetCenter, center);

		calDelta(touch);

		touch.offsetDirection = getDirection(touch.deltaX, touch.deltaY);

		touch.scale = firstMultiTouch ? getScale(firstMultiTouch.touches, touches) : 1;
		touch.rotation = firstMultiTouch ? getRotation(firstMultiTouch.touches, touches) : 0;

		calIntervalTouchData(touch);

	};

	var CAL_INTERVAL = 25;
	var calIntervalTouchData = function(touch) {
		var session = $.gestures.session;
		var last = session.lastInterval || touch;
		var deltaTime = touch.timestamp - last.timestamp;
		var velocity;
		var velocityX;
		var velocityY;
		var direction;

		if (touch.gesture.type != $.EVENT_CANCEL && (deltaTime > CAL_INTERVAL || last.velocity === undefined)) {
			var deltaX = last.deltaX - touch.deltaX;
			var deltaY = last.deltaY - touch.deltaY;

			var v = getVelocity(deltaTime, deltaX, deltaY);
			velocityX = v.x;
			velocityY = v.y;
			velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
			direction = getDirection(deltaX, deltaY) || last.direction;

			session.lastInterval = touch;
		} else {
			velocity = last.velocity;
			velocityX = last.velocityX;
			velocityY = last.velocityY;
			direction = last.direction;
		}

		touch.velocity = velocity;
		touch.velocityX = velocityX;
		touch.velocityY = velocityY;
		touch.direction = direction;
	};

	var targetIds = {};
	var getTouches = function(event, touch) {
		var allTouches = $.slice.call(event.touches || event);

		var type = event.type;

		var targetTouches = [];
		var changedTargetTouches = [];

		//当touchstart或touchmove且touches长度为1，直接获得all和changed
		if ((type === $.EVENT_START || type === $.EVENT_MOVE) && allTouches.length === 1) {
			targetIds[allTouches[0].identifier] = true;
			targetTouches = allTouches;
			changedTargetTouches = allTouches;
			touch.target = event.target;
		} else {
			var i = 0;
			var targetTouches = [];
			var changedTargetTouches = [];
			var changedTouches = $.slice.call(event.changedTouches || event);

			touch.target = event.target;
			var sessionTarget = $.gestures.session.target || event.target;
			targetTouches = allTouches.filter(function(touch) {
				return hasParent(touch.target, sessionTarget);
			});

			if (type === $.EVENT_START) {
				i = 0;
				while (i < targetTouches.length) {
					targetIds[targetTouches[i].identifier] = true;
					i++;
				}
			}

			i = 0;
			while (i < changedTouches.length) {
				if (targetIds[changedTouches[i].identifier]) {
					changedTargetTouches.push(changedTouches[i]);
				}
				if (type === $.EVENT_END || type === $.EVENT_CANCEL) {
					delete targetIds[changedTouches[i].identifier];
				}
				i++;
			}

			if (!changedTargetTouches.length) {
				return false;
			}
		}
		targetTouches = uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true);
		var touchesLength = targetTouches.length;
		var changedTouchesLength = changedTargetTouches.length;

		if (type === $.EVENT_START && touchesLength - changedTouchesLength === 0) { //first
			touch.isFirst = true;
			$.gestures.touch = $.gestures.session = {
				target: event.target
			};
		}
		touch.isFinal = ((type === $.EVENT_END || type === $.EVENT_CANCEL) && (touchesLength - changedTouchesLength === 0));

		touch.touches = targetTouches;
		touch.changedTouches = changedTargetTouches;
		return true;

	};

	var handleTouchEvent = function(event) {
		var touch = {
			gesture: event
		};
		var touches = getTouches(event, touch);
		if (!touches) {
			return;
		}
		calTouchData(touch);
		detect(event, touch);
		$.gestures.session.prevTouch = touch;
	};
	window.addEventListener($.EVENT_START, handleTouchEvent);
	window.addEventListener($.EVENT_MOVE, handleTouchEvent);
	window.addEventListener($.EVENT_END, handleTouchEvent);
	window.addEventListener($.EVENT_CANCEL, handleTouchEvent);
	//fixed hashchange(android)
	window.addEventListener($.EVENT_CLICK, function(e) {
		//TODO 应该判断当前target是不是在targets.popover内部，而不是非要相等
		if (($.targets.popover && e.target === $.targets.popover) || ($.targets.tab) || $.targets.offcanvas || $.targets.modal) {
			e.preventDefault();
		}
	}, true);

	//增加原生滚动识别
	$.isScrolling = false;
	var scrollingTimeout = null;
	window.addEventListener('scroll', function() {
		$.isScrolling = true;
		scrollingTimeout && clearTimeout(scrollingTimeout);
		scrollingTimeout = setTimeout(function() {
			$.isScrolling = false;
		}, 250);
	});
})(Eui, window);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath gesture/eui.gestures.flick.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * flick[left|right|up|down]
 */
(function($, name) {
	var flickStartTime = 0;
	var handle = function(event, touch) {
		var session = $.gestures.session;
		var options = this.options;
		var now = $.now();
		switch (event.type) {
			case $.EVENT_MOVE:
				if (now - flickStartTime > 300) {
					flickStartTime = now;
					session.flickStart = touch.center;
				}
				break;
			case $.EVENT_END:
			case $.EVENT_CANCEL:
				if (session.flickStart && options.flickMaxTime > (now - flickStartTime) && touch.distance > options.flickMinDistince) {
					touch.flick = true;
					touch.flickTime = now - flickStartTime;
					touch.flickDistanceX = touch.center.x - session.flickStart.x;
					touch.flickDistanceY = touch.center.y - session.flickStart.y;
					$.trigger(session.target, name, touch);
					$.trigger(session.target, name + touch.direction, touch);
				}
				break;
		}

	};

	//mui gesture flick
	$.addGesture({
		name: name,
		index: 5,
		handle: handle,
		options: {
			flickMaxTime: 200,
			flickMinDistince: 10
		}
	});
})(Eui, 'flick');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath gesture/eui.gestures.swipe.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * gesture swipe[left|right|up|down]
 */
(function($, name) {
	var handle = function(event, touch) {
		var session = $.gestures.session;
		if (event.type === $.EVENT_END || event.type === $.EVENT_CANCEL) {
			var options = this.options;
			//TODO 后续根据velocity计算
			if (touch.direction && options.swipeMaxTime > touch.deltaTime && touch.distance > options.swipeMinDistince) {
				touch.swipe = true;
				$.trigger(session.target, name, touch);
				$.trigger(session.target, name + touch.direction, touch);
			}
		}
	};
	/**
	 * mui gesture swipe
	 */
	$.addGesture({
		name: name,
		index: 10,
		handle: handle,
		options: {
			swipeMaxTime: 300,
			swipeMinDistince: 18
		}
	});
})(Eui, 'swipe');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath gesture/eui.gestures.drag.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * drag[start|left|right|up|down|end]
 */
(function($, name) {
	var handle = function(event, touch) {
		var session = $.gestures.session;
		switch (event.type) {
			case $.EVENT_START:
				break;
			case $.EVENT_MOVE:
				if (!touch.direction) {
					return;
				}
				//修正direction,可在session期间自行锁定拖拽方向，方便开发scroll类不同方向拖拽插件嵌套
				if (session.lockDirection && session.startDirection) {
					if (session.startDirection && session.startDirection !== touch.direction) {
						if (session.startDirection === 'up' || session.startDirection === 'down') {
							touch.direction = touch.deltaY < 0 ? 'up' : 'down';
						} else {
							touch.direction = touch.deltaX < 0 ? 'left' : 'right';
						}
					}
				}

				if (!session.drag) {
					session.drag = true;
					$.trigger(session.target, name + 'start', touch);
				}
				$.trigger(session.target, name, touch);
				$.trigger(session.target, name + touch.direction, touch);
				break;
			case $.EVENT_END:
			case $.EVENT_CANCEL:
				if (session.drag && touch.isFinal) {
					$.trigger(session.target, name + 'end', touch);
				}
				break;
		}
	};

	// mui gesture drag
	$.addGesture({
		name: name,
		index: 20,
		handle: handle,
		options: {
			fingers: 1
		}
	});
})(Eui, 'drag');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath gesture/eui.gestures.tap.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * tap and doubleTap
 */
(function($, name) {
	var lastTarget;
	var lastTapTime;
	var handle = function(event, touch) {
		var session = $.gestures.session;
		var options = this.options;
		switch (event.type) {
			case $.EVENT_END:
				if (!touch.isFinal) {
					return;
				}
				var target = session.target;
				if (!target || (target.disabled || target.classList.contains('mui-disabled'))) {
					return;
				}
				if (touch.distance < options.tapMaxDistance && touch.deltaTime < options.tapMaxTime) {
					if ($.options.gestureConfig.doubletap && lastTarget && (lastTarget === target)) { //same target
						if (lastTapTime && (touch.timestamp - lastTapTime) < options.tapMaxInterval) {
							$.trigger(target, 'doubletap', touch);
							lastTapTime = $.now();
							lastTarget = target;
							return;
						}
					}
					$.trigger(target, name, touch);
					lastTapTime = $.now();
					lastTarget = target;
				}
				break;
		}
	};
	/**
	 * mui gesture tap
	 */
	$.addGesture({
		name: name,
		index: 30,
		handle: handle,
		options: {
			fingers: 1,
			tapMaxInterval: 300,
			tapMaxDistance: 5,
			tapMaxTime: 250
		}
	});
})(Eui, 'tap');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath gesture/eui.gestures.longtap.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function($, name) {
	var timer;
	var handle = function(event, touch) {
		var session = $.gestures.session;
		var options = this.options;
		switch (event.type) {
			case $.EVENT_START:
				clearTimeout(timer);
				timer = setTimeout(function() {
					$.trigger(session.target, name, touch);
				}, options.holdTimeout);
				break;
			case $.EVENT_MOVE:
				if (touch.distance > options.holdThreshold) {
					clearTimeout(timer);
				}
				break;
			case $.EVENT_END:
			case $.EVENT_CANCEL:
				clearTimeout(timer);
				break;
		}
	};

	// mui gesture longtap
	$.addGesture({
		name: name,
		index: 10,
		handle: handle,
		options: {
			fingers: 1,
			holdTimeout: 500,
			holdThreshold: 2
		}
	});
})(Eui, 'longtap');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath gesture/eui.gestures.hold.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function($, name) {
	var timer;
	var handle = function(event, touch) {
		var session = $.gestures.session;
		var options = this.options;
		switch (event.type) {
			case $.EVENT_START:
				if ($.options.gestureConfig.hold) {
					timer && clearTimeout(timer);
					timer = setTimeout(function() {
						touch.hold = true;
						$.trigger(session.target, name, touch);
					}, options.holdTimeout);
				}
				break;
			case $.EVENT_MOVE:
				break;
			case $.EVENT_END:
			case $.EVENT_CANCEL:
				if (timer) {
					clearTimeout(timer) && (timer = null);
					$.trigger(session.target, 'release', touch);
				}
				break;
		}
	};

	//mui gesture hold
	$.addGesture({
		name: name,
		index: 10,
		handle: handle,
		options: {
			fingers: 1,
			holdTimeout: 0
		}
	});
})(Eui, 'hold');
/**
 * (c)2015  Create at: 2015-08-06 10:27
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath gesture/eui.gestures.pinch.js
 *
 * Eui.js may be freely distributed under the MIT license.
 * mui gesture pinch.
 */
(function($, name) {
    var handle = function(event, touch) {
        var options = this.options;
        var session = $.gestures.session;
        switch (event.type) {
            case $.EVENT_START:
                break;
            case $.EVENT_MOVE:
                if ($.options.gestureConfig.pinch) {
                    if (touch.touches.length < 2) {
                        return;
                    }
                    if (!session.pinch) { //start
                        session.pinch = true;
                        $.trigger(session.target, name + 'start', touch);
                    }
                    $.trigger(session.target, name, touch);
                    var scale = touch.scale;
                    var rotation = touch.rotation;
                    var lastScale = typeof touch.lastScale === 'undefined' ? 1 : touch.lastScale;
                    var scaleDiff = 0.000000000001; //防止scale与lastScale相等，不触发事件的情况。
                    if (scale > lastScale) { //out
                        lastScale = scale - scaleDiff;
                        $.trigger(session.target, name + 'out', touch);
                    } //in
                    else if (scale < lastScale) {
                        lastScale = scale + scaleDiff;
                        $.trigger(session.target, name + 'in', touch);
                    }
                    if (Math.abs(rotation) > options.minRotationAngle) {
                        $.trigger(session.target, 'rotate', touch);
                    }
                }
                break;
            case $.EVENT_END:
            case $.EVENT_CANCEL:
                if ($.options.gestureConfig.pinch && session.pinch && touch.touches.length === 2) {
                    $.trigger(session.target, name + 'end', touch);
                }
                break;
        }
    };

    //eui gesture pinch
    $.addGesture({
        name: name,
        index: 10,
        handle: handle,
        options: {
            minRotationAngle: 0
        }
    });
})(Eui, 'pinch');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath init/eui.init.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($) {

	/**
	 * 全局默认配置项.
	 *
	 * @type {Object}
	 * @alias #global
	 * @memberof Eui
	 * @property {Object} gestureConfig 手势事件
	 * @property {Boolean} gestureConfig.tap=true 单击屏幕
	 * @property {Boolean} gestureConfig.doubletap=false 双击屏幕
	 * @property {Boolean} gestureConfig.longtap=false 长按屏幕
	 * @property {Boolean} gestureConfig.hold=false 按住屏幕
	 * @property {Boolean} gestureConfig.flick=true 快速单击屏幕
	 * @property {Boolean} gestureConfig.swipe=true 滑动
	 * @property {Boolean} gestureConfig.drag=true 拖动中
	 * @property {Boolean} gestureConfig.pinch=false 捏屏幕
	 */
	$.global = $.options = {
		gestureConfig: {
			tap: true,
			doubletap: false,
			longtap: false,
			hold: false,
			flick: true,
			swipe: true,
			drag: true,
			pinch: false
		}
	};

	/**
	 * 初始化全局配置。配置项可以是，比如：
	 *
	 * - `beforeback` : 后退之前执行的方法.
	 *
	 * @alias #initGlobal
	 * @memberof Eui
	 * @param {Object} options 配置项将会合并并覆盖默认[global]{@link Eui#global}配置.
	 * @returns {Eui}
	 */
	$.initGlobal = function(options) {
		$.options = $.extend(true, $.global, options);
		return this;
	};
	var inits = {};

	var isInitialized = false;

	/**
	 * eui框架将很多功能配置都集中在$.init方法中，要使用某项功能，只需要在$.init方法中完成对应参数配置即可，
	 * 目前支持在$.init方法中配置的功能包括：创建子页面、关闭页面、手势事件配置、预加载、下拉刷新、上拉加载。
	 *
	 * ### 创建子页面 ###
	 *
	 * 在mobile app开发过程中，经常遇到卡头卡尾的页面，此时若使用局部滚动，
	 * 在android手机上会出现滚动不流畅的问题； eui的解决思路是：将需要滚动的区域通过单独的webview实现，完全使用原生滚动。
	 * 具体做法则是：将目标页面分解为主页面和内容页面，主页面显示卡头卡尾区域，比如顶部导航、底部选项卡等；
	 * 内容页面显示具体需要滚动的内容，然后在主页面中调用$.init方法初始化内容页面。
	 *
	 * 	   $.init({
	 *		 subpages:[{
	 *		   url:your-subpage-url,//子页面HTML地址，支持本地地址和网络地址
	 *		   id:your-subpage-id,//子页面标志
	 *		   styles:{
	 *			  top:subpage-top-position,//子页面顶部位置
	 *			  bottom:subpage-bottom-position,//子页面底部位置
	 *			  width:subpage-width,//子页面宽度，默认为100%
	 *			  height:subpage-height,//子页面高度，默认为100%
	 *			  ......
	 *		   },
	 *		   extras:{}//额外扩展参数
	 *		  }]
	 *		});
	 *
	 * 参数说明：
	 *
	 * - `styles` : 表示窗口属性，参考[5+规范中的WebviewStyle](http://www.dcloud.io/docs/api/zh_cn/webview.shtml#plus.webview.WebviewStyle)；特别注意，height和width两个属性,即使不设置，也默认按100%计算；因此若设置了top值为非"0px"的情况，建议同时设置bottom值，否则5+ runtime根据高度100%计算，可能会造成页面真实底部位置超出屏幕范围的情况；left、right同理。
	 *
	 * 示例：Hello eui的首页其实就是index.html加list.html合并而成的;
	 * index.html的作用就是显示固定导航，list.html显示具体列表内容，列表项的滚动是在list.html所在webview中使用原生滚动，既保证了滚动条不会穿透顶部导航，符合app的体验，也保证了列表流畅滚动，解决了区域滚动卡顿的问题。 list.html就是index.html的子页面，创建代码比较简单，如下：
	 *
	 *     $.init({
	 *		 subpages:[{
	 *		    url:'list.html',
	 *		    id:'list.html',
	 *		    styles:{
	 *			  top:'45px',//eui标题栏默认高度为45px；
	 *			  bottom:'0px'//默认为0px，可不定义；
	 *		    }
	 *		}]
	 *	  });
	 *
	 * ### 关闭页面 ###
	 *
	 * eui框架将窗口关闭功能封装在$.back方法中，具体执行逻辑是：
     *
	 * - 若当前webview为预加载页面，则hide当前webview；
	 * - 否则，close当前webview；
	 *
	 * 在eui框架中，有三种操作会触发页面关闭（执行$.back方法）：
	 *
	 * - 点击包含`.mui-action-back`类的控件
	 * - 在屏幕内，向右快速滑动
	 * - Android手机按下back按键
	 *
	 * <h4>iOS平台原生支持从屏幕边缘右滑关闭</h4>
	 *
	 * iOS平台可通过popGesture参数实现从屏幕边缘右滑关闭webview，参考[5+规范](http://www.html5plus.org/doc/zh_cn/webview.html#plus.webview.WebviewStyle)，若想禁用该功能，可通过setStyle方法设置`popGesture`为none。
	 *
	 * hbuilder中敲`mheader`生成的代码块，会自动生成带有返回导航箭头的标题栏，点击返回箭头可关闭当前页面，原因就是因为该返回箭头包含`.mui-action-back`类，代码如下：
	 *
	 * 		<header class="mui-bar mui-bar-nav">
	 *		 <a class="mui-action-back mui-icon mui-icon-left-nav mui-pull-left"></a>
	 *		 <h1 class="mui-title">标题</h1>
	 *		</header>
	 *
	 * 若希望在顶部导航栏之外的其它区域添加关闭页面的控件，只需要在对应控件上添加`.mui-action-back`类即可，如下为一个关闭按钮示例：
	 *
	 * 		<button type="button" class='mui-btn mui-btn-danger mui-action-back'>关闭</button>
	 *
	 * eui框架封装的页面右滑关闭功能，默认未启用，若要使用右滑关闭功能，需要在`$.init()`;方法中设置`swipeBack`参数，如下：
	 *
	 * 	  $.init({
	 *		swipeBack:true //启用右滑关闭功能
	 *	  });
	 *
	 * eui框架默认会监听Android手机的`back`按键，然后执行页面关闭逻辑； 若不希望eui自动处理`back`按键，可通过如下方式关闭eui的`back`按键监听；
	 *
	 * 	  $.init({
	 *        keyEventBind: {
	 *			 backbutton: false  //关闭back按键监听
	 *		  }
	 *	  });
	 *
	 * 除了如上三种操作外，也可以直接调用`$.back()`方法，执行窗口关闭逻辑；
	 *
	 * `$.back()`仅处理窗口逻辑，若希望在窗口关闭之前再处理一些其它业务逻辑，则可将业务逻辑抽象成一个具体函数，然后注册为$.init方法的`beforeback`参数;beforeback的执行逻辑为：
	 *
	 * - 执行beforeback参数对应的函数若返回false，则不再执行$.back()方法；
	 * - 否则（返回true或无返回值），继续执行$.back()方法；
	 *
	 * 示例：从列表打开详情页面，从详情页面再返回后希望刷新列表界面，此时可注册beforeback参数，然后通过自定义事件通知列表页面刷新数据，示例代码如下：
	 *
	 *     $.init({
	 *		  beforeback: function(){
	 *			//获得列表界面的webview
	 *			var list = plus.webview.getWebviewById('list');
	 *			//触发列表界面的自定义事件（refresh）,从而进行数据刷新
	 *			$.fire(list,'refresh');
	 *			//返回true，继续页面关闭逻辑
	 *			return true;
	 *		  }
	 *	   });
	 *
	 * 注意：beforeback的执行返回必须是同步的（阻塞模式），若使用nativeUI这种异步js（非阻塞模式），则可能会出现意想不到的结果；
	 * 比如：通过`plus.nativeUI.confirm()`弹出确认框，可能用户尚未选择，页面已经返回了（beforeback同步执行完毕，无返回值，
	 * 继续执行`$.back()`方法，nativeUI不会阻塞js进程）：在这种情况下，若要自定义业务逻辑，就需要复写`$.back`方法了；
	 * 如下为一个自定义示例，每次都需要用户确认后，才会关闭当前页面
	 *
	 * 		//备份$.back，$.back已将窗口关闭逻辑封装的比较完善（预加载及父子窗口），因此最好复用$.back
	 *		 var old_back = $.back;
	 *		 $.back = function(){
	 *	  		var btn = ["确定","取消"];
	 *	  		$.confirm('确认关闭当前窗口？','Hello MUI',btn,function(e){
	 *				if(e.index==0){
	 *				//执行mui封装好的窗口关闭逻辑；
	 *				old_back();
	 *			}
	 *	 	  });
	 *		}
	 *
	 * <h3>为何设置了swipeBack: false，在iOS上依然可以右滑关闭？</h3>
	 * iOS平台原生支持从屏幕边缘右滑关闭，这个是通过popGesture参数控制的，参考[5+规范](http://www.html5plus.org/doc/zh_cn/webview.html#plus.webview.WebviewStyle)，若需禁用，可通过setStyle方法设置popGesture为none。
	 *
	 * <h3>能否通过addEventListener增加back按键监听实现自定义关闭逻辑？</h3>
	 * addEventListener只会增加新的执行逻辑，老的监听逻辑($.back)依然会执行，因此，若需实现自定义关闭逻辑，一定要重写`$.back`。
	 *
	 * ### 手势事件 ###
	 *
	 * 在开发移动端的应用时，会用到很多的手势操作，比如滑动、长按等，为了方便开放者快速集成这些手势，eui内置了常用的手势事件，目前支持的手势事件见如下列表：
	 *
	 *  <pre class="">
	 * 分类			参数				描述
	 * ------       ----------------    -----------------------
	 * 点击         tap                  单击屏幕
	 * 				doubletap			 双击屏幕
	 * 长按			longtap				 长按屏幕
	 *				hold				 按住屏幕
	 *				release				 离开屏幕
	 * 滑动			swipeleft			 向左滑动
	 * 				swiperight			 向右滑动
	 * 				swipeup				 向上滑动
	 * 				swipedown			 向下滑动
	 * 拖动			dragstart			 开始拖动
	 * 				drag				 拖动中
	 * 				dragend	             拖动结束
	 * </pre>
	 *
	 *
	 * <h3>手势事件配置</h3>
	 *
	 * 根据使用频率，eui默认会监听部分手势事件，如点击、滑动事件；为了开发出更高性能的moble App，
	 * eui支持用户根据实际业务需求，通过$.init方法中的gestureConfig参数，配置具体需要监听的手势事件。
	 *
	 * 	  $.init({
	 *		   gestureConfig:{
	 *		     tap: true, //默认为true
	 *		     doubletap: true, //默认为false
	 *		     longtap: true, //默认为false
	 *		     swipe: true, //默认为true
	 *		     drag: true, //默认为true
	 *		     hold:false,//默认为false，不监听
	 *		     release:false//默认为false，不监听
	 *		   }
	 *	  });
	 *
	 * 注意:dragstart、drag、dragend共用drag开关，swipeleft、swiperight、swipeup、swipedown共用swipe开关
	 *
	 * <h3>事件监听</h3>
	 *
	 * 单个元素上的事件监听，直接使用addEventListener即可，如下：
	 *
	 * 		elem.addEventListener("swipeleft",function(){
	 *			 console.log("你正在向左滑动");
	 *		});
	 *
	 * 若多个元素执行相同逻辑，则建议使用事件绑定{@link Event#on|on()}。
	 *
	 * <h3>自定义事件</h3>
	 *
	 * 通过自定义事件，用户可以轻松实现多webview间数据传递。
	 *
	 * <span style="color:red;">仅能在5+ App及流应用中使用?</span>
	 *
	 * 因为是多webview之间传值，故无法在手机浏览器、微信中使用；
	 *
	 * <h3>监听自定义事件</h3>
	 *
	 * 添加自定义事件监听操作和标准js事件监听类似，可直接通过window对象添加，如下：
	 *
	 *		window.addEventListener('customEvent',function(event){
	 *		  //通过event.detail可获得传递过来的参数内容
	 *		  ....
	 *		});
	 *
	 *<h3>触发自定义事件</h3>
	 *
	 * 通过{@link Eui#fire|$.fire()}方法可触发目标窗口的自定义事件.
	 *
	 * ### 预加载 ###
	 *
	 * 所谓的预加载技术就是在用户尚未触发页面跳转时，提前创建目标页面，这样当用户跳转时，就可以立即进行页面切换，节省创建新页面的时间，提升app使用体验。eui提供两种方式实现页面预加载。
	 *
	 * 通过$.init方法中的preloadPages参数进行配置.
	 *
	 * 		$.init({
	 *			  preloadPages:[
	 *				{
	 *				  url:prelaod-page-url,
	 *				  id:preload-page-id,
	 *				  styles:{},//窗口参数
	 *				  extras:{},//自定义扩展参数
	 *				  subpages:[{},{}]//预加载页面的子页面
	 *				}
	 *			  ]
	 *			});
     *
	 * 该种方案使用简单、可预加载多个页面，但不会返回预加载每个页面的引用，若要获得对应webview引用，还需要通过`plus.webview.getWebviewById`方式获得；另外，因为$.init是异步执行，执行完$.init方法后立即获得对应webview引用，可能会失败，例如如下代码：
	 *
	 * 	   $.init({
	 *		  preloadPages:[{
	 *			 url:'list.html',
	 *			 id:'list'
	 *		 }]
	 *	   });
	 *	   var list = plus.webview.getWebviewByid('list');//这里可能返回空；
	 *
	 * 也可以通过{@link Eui#preload|$.preload}方法预加载，可立即返回对应webview的引用。
	 *
	 * ### 下拉刷新 ###
	 *
	 * 为实现下拉刷新功能，大多H5框架都是通过DIV模拟下拉回弹动画，在低端android手机上，
	 * DIV动画经常出现卡顿现象（特别是图文列表的情况）； eui通过双webview解决这个DIV的拖动流畅度问题；
	 * 拖动时，拖动的不是div，而是一个完整的webview（子webview），回弹动画使用原生动画；
	 * 在iOS平台，H5的动画已经比较流畅，故依然使用H5方案。
	 * 两个平台实现虽有差异，但eui经过封装，可使用一套代码实现下拉刷新。
	 *
	 * 主页面内容比较简单，只需要创建子页面即可：
	 *
	 * 		$.init({
	 *			subpages:[{
	 *			  url:pullrefresh-subpage-url,//下拉刷新内容页面地址
	 *			  id:pullrefresh-subpage-id,//内容页面标志
	 *			  styles:{
	 *				top:subpage-top-position,//内容页面顶部位置,需根据实际页面布局计算，若使用标准eui导航，顶部默认为48px；
	 *				.....//其它参数定义
	 *			  }
	 *			}]
	 *		  });
	 *
	 * 内容页面需按照如下DOM结构构建：
	 *
	 * 		<!--下拉刷新容器-->
	 *		<div id="refreshContainer" class="mui-content mui-scroll-wrapper">
	 *		  <div class="mui-scroll">
	 *		   <!--数据列表-->
	 *		   <ul class="mui-table-view mui-table-view-chevron">
	 *
	 *		   </ul>
	 *		  </div>
	 *		 </div>
	 *
	 * 其次，通过$.init方法中pullRefresh参数配置下拉刷新各项参数，如下：
	 *
	 * 	   $.init({
	 *		  pullRefresh : {
	 *			container:"#refreshContainer",//下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
	 *			down : {
	 *			  contentdown : "下拉可以刷新",//可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
	 *			  contentover : "释放立即刷新",//可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
	 *			  contentrefresh : "正在刷新...",//可选，正在刷新状态时，下拉刷新控件上显示的标题内容
	 *			  callback :pullfresh-function //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
	 * 			}
	 *		  }
	 *		});
	 *
	 * 最后，根据具体业务编写刷新函数，需要注意的是，加载完新数据后，需要执行`endPulldownToRefresh()`方法；
	 *
	 * 		function pullfresh-function() {
	 *			 //业务逻辑代码，比如通过ajax从服务器获取新数据；
	 *			 ......
	 *			 //注意，加载完新数据后，必须执行如下代码，注意：若为ajax请求，则需将如下代码放置在处理完ajax响应数据之后
	 *			 $('#refreshContainer').pullRefresh().endPulldownToRefresh();
	 *		}
	 *
	 * ### 上拉加载 ###
	 * eui的上拉加载实现比较简单，检测5+ runtime提供的滚动条滚动到底事件（plusscrollbottom），
	 * <br/>显示“正在加载”提示`-->`开始加载业务数据`-->`隐藏"正在加载"提示。
	 * </br>
	 * 使用方式类似下拉刷新，首先、通过`$.init`方法中pullRefresh参数配置上拉加载各项参数，如下：
	 *
	 *	  $.init({
	 *	  	pullRefresh : {
	 *			container:refreshContainer,//待刷新区域标识，querySelector能定位的css选择器均可，比如：id、.class等
	 *			up : {
	 *		  		contentrefresh : "正在加载...",//可选，正在加载状态时，上拉加载控件上显示的标题内容
	 *		  		contentnomore:'没有更多数据了',//可选，请求完毕若没有更多数据时显示的提醒内容；
	 *		  		callback :pullfresh-function //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
	 *			}
	 *	  	}
	 *     });
	 *
	 * 其次，根据具体业务编写加载函数，需要注意的是，加载完新数据后，需要执行`endPullupToRefresh()`方法；
	 *
	 *		 function pullfresh-function() {
	 *		   //业务逻辑代码，比如通过ajax从服务器获取新数据；
	 *		   ......
	 *		   //注意，加载完新数据后，必须执行如下代码，true表示没有更多数据了，两个注意事项：
	 *		   //1、若为ajax请求，则需将如下代码放置在处理完ajax响应数据之后
	 *		   //2、注意this的作用域，若存在匿名函数，需将this复制后使用，参考hello mui中的代码示例；
	 *		   this.endPullupToRefresh(true|false);
	 *	    }
	 *
	 * 注意：
	 *
     * - 因为使用的是滚动到底事件，因此若当前页面内容过少，没有滚动条的话，就不会触发上拉加载
	 * - 多次上拉加载后，若已没有更多数据可加载时，调用`this.endPullupToRefresh(true)`;，之后滚动条滚动到底时，将不再显示“上拉显示更多”的提示语，而显示“没有更多数据了”的提示语；
	 * - 若实际业务中，有重新触发上拉加载的需求（比如当前类别已无更多数据，但切换到另外一个类别后，应支持继续上拉加载），此时调用上拉加载的重置函数即可，如下代码：
	 *
	 *
	 *     //pullup-container为在$.init方法中配置的pullRefresh节点中的container参数；
	 *     $('#pullup-container').pullRefresh().refresh(true);
     *
	 * @alias #init
	 * @memberof Eui
	 * @param {Object} [options]
	 */
	$.init = function(options) {
		isInitialized = true;
		$.options = $.extend(true, $.global, options || {});
		$.ready(function() {
			$.doAction('inits', function(index, init) {
				var isInit = !!(!inits[init.name] || init.repeat);
				if (isInit) {
					init.handle.call($);
					inits[init.name] = true;
				}
			});
		});
		return this;
	};

	// 增加初始化执行流程
	$.addInit = function(init) {
		return $.addAction('inits', init);
	};
	$(function() {
		var classList = document.body.classList;
		var os = [];
		if ($.os.ios) {
			os.push({
				os: 'ios',
				version: $.os.version
			});
			classList.add('mui-ios');
		} else if ($.os.android) {
			os.push({
				os: 'android',
				version: $.os.version
			});
			classList.add('mui-android');
		}
		if ($.os.wechat) {
			os.push({
				os: 'wechat',
				version: $.os.wechat.version
			});
			classList.add('mui-wechat');
		}
		if (os.length) {
			$.each(os, function(index, osObj) {
				var version = '';
				var classArray = [];
				if (osObj.version) {
					$.each(osObj.version.split('.'), function(i, v) {
						version = version + (version ? '-' : '') + v;
						classList.add($.className(osObj.os + '-' + version));
					});
				}
			});
		}
	});
})(Eui);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath init/eui.init.5+.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($) {
	var defaultOptions = {
		swipeBack: false,
		preloadPages: [], //5+ lazyLoad webview
		preloadLimit: 10, //预加载窗口的数量限制(一旦超出，先进先出)
		keyEventBind: {
			backbutton: true,
			menubutton: true
		}
	};

	//默认页面动画
	var defaultShow = {
		autoShow: true,
		duration: $.os.ios ? 200 : 100,
		aniShow: 'slide-in-right'
	};
	//若执行了显示动画初始化操作，则要覆盖默认配置
	if ($.options.show) {
		defaultShow = $.extend(true, defaultShow, $.options.show);
	}

	/**
	 * 获取当前页面{@link http://www.html5plus.org/doc/zh_cn/webview.html#plus.webview.WebviewObject|webview}对象.
	 * 备注：必须在`$.plusReady`中引用.
	 *
	 * @alias #currentWebview
	 * @memberof Eui
	 *  @type {WebviewObject}
	 */
	$.currentWebview = null;

	/**
	 * 判断是否是主页.
	 *
	 * @alias #isHomePage
	 * @memberof Eui
	 * @type {Boolean}
	 */
	$.isHomePage = false;

	$.extend(true, $.global, defaultOptions);
	$.extend(true, $.options, defaultOptions);

	/**
	 * 获取等待动画配置.
	 *
	 * @alias #waitingOptions
	 * @memberof Eui
	 *
	 * @param {Object} options
	 * @param {Boolean} options.autoShow=true 是否自动显示等待
	 * @param {String} options.title='' 等待描述文本
	 * @returns {Object}
	 */
	$.waitingOptions = function(options) {
		return $.extend({
			autoShow: true,
			title: ''
		}, options);
	};

	/**
	 * 获取窗口显示配置，合并默认配置项.
	 *
	 * - `autoShow` : true,
	 * - `duration` : $.os.ios ? 200 : 100,
	 * - `aniShow` : 'slide-in-right'
	 *
	 * @alias #showOptions
	 * @memberof Eui
	 * @param {Object} options 配置项.
	 * @returns {Object}
	 */
	$.showOptions = function(options) {
		return $.extend(defaultShow, options);
	};

	/**
	 * 窗口默认配置.
	 *
	 * @alias #windowOptions
	 * @memberof Eui
	 * @param {Object} options
	 * @returns {Object}
	 */
	$.windowOptions = function(options) {
		return $.extend({
			scalable: false,
			bounce: "" //vertical
		}, options);
	};

	/**
	 * 在app开发中，若要使用{@link http://www.html5plus.org/doc/h5p.html|HTML5+}扩展api，必须等`plusready`事件发生后才能正常使用.
	 *
	 * eui将该事件封装成了$.plusReady()方法，涉及到HTML5+的api，建议都写在`$.plusReady`方法中。如下为打印当前页面URL的示例：
	 *
	 *   	$.plusReady(function(){
	 *		    console.log("当前页面URL："+plus.webview.currentWebview().getURL());
	 *		});
	 *
	 * @alias #plusReady
	 * @memberof Eui
	 * @param {Function} callback 回调函数
	 * @returns {$}
	 */
	$.plusReady = function(callback) {
		if (window.plus) {
			setTimeout(function() { //解决callback与plusready事件的执行时机问题(典型案例:showWaiting,closeWaiting)
				callback();
			}, 0);
		} else {
			document.addEventListener("plusready", function() {
				callback();
			}, false);
		}
		return this;
	};

	/**
	 * 触发目标窗口的自定义事件.
	 *
	 * 示例：
	 * 假设如下场景：从新闻列表页面进入新闻详情页面，新闻详情页面为共用页面，通过传递新闻ID通知详情页面需要显示具体哪个新闻，
	 * 详情页面再动态向服务器请求数据，eui要实现类似需求可通过如下步骤实现：
	 *
	 * - 在列表页面中预加载详情页面（假设为detail.html）
	 * - 列表页面在点击新闻标题时，首先，获得该新闻id，触发详情页面的newsId事件，并将新闻id作为事件参数传递过去；然后再打开详情页面；
	 * - 详情页面监听newsId自定义事件
	 *
	 * 列表页面代码如下：
	 *
	 *		//初始化预加载详情页面
	 *		$.init({
	 *		   preloadPages:[{
	 *			 id:'detail.html',
	 *			 url:'detail.html'
	 *		   }]
	 *		});
     *
	 *	    var detailPage = null;
	 *		 //添加列表项的点击事件
	 *		 $('.mui-content').on('tap', 'a', function(e) {
	 *	        var id = this.getAttribute('id');
	 *	        //获得详情页面
	 *	        if(!detailPage){
	 *		       detailPage = plus.webview.getWebviewById('detail.html');
	 *	        }
	 *	        //触发详情页面的newsId事件
	 *	       $.fire(detailPage,'newsId',{
	 *		     id:id
	 *	       });
	 *	       //打开详情页面
	 *	      $.openWindow({
	 *		    id:'detail.html'
	 *	      });
	 *	   });
	 *
	 * 详情页面代码如下：
	 *
	 * 	  //添加newId自定义事件监听
	 *	  window.addEventListener('newsId',function(event){
	 *	  		//获得事件参数
	 *	  		var id = event.detail.id;
	 *	  		//根据id向服务器请求新闻详情
	 *	  		.....
	 *		});
	 *
	 * @alias #fire
	 * @memberof Eui
	 * @param {WebviewObject} webview 需传值的目标webview
	 * @param {String} eventType 自定义事件名称
	 * @param {JSON} data json格式的数据
	 *
	 *
	 */
	$.fire = function(webview, eventType, data) {
		if (webview) {
			if (data !== '') {
				data = data || {};
				if ($.isPlainObject(data)) {
					data = JSON.stringify(data || {}).replace(/\'/g, "\\u0027").replace(/\\/g, "\\u005c");
				}
			}
			webview.evalJS("typeof Eui!=='undefined'&&$.receive('" + eventType + "','" + data + "')");
		}
	};

	/**
	 * 触发页面指定事件.
	 *
	 * @alias #receive
	 * @memberof Eui
	 * @param {String} eventType 事件类型
	 * @param {Object} data 传递参数
	 */
	$.receive = function(eventType, data) {
		if (eventType) {
			try {
				if (data) {
					data = JSON.parse(data);
				}
			} catch (e) {}
			$.trigger(document, eventType, data);
		}
	};

	var triggerPreload = function(webview) {
		if (!webview.preloaded) {
			$.fire(webview, 'preload');
			var list = webview.children();
			for (var i = 0; i < list.length; i++) {
				$.fire(list[i], 'preload');
			}
			webview.preloaded = true;
		}
	};

	var trigger = function(webview, eventType, timeChecked) {
		if (timeChecked) {
			if (!webview[eventType + 'ed']) {
				$.fire(webview, eventType);
				var list = webview.children();
				for (var i = 0; i < list.length; i++) {
					$.fire(list[i], eventType);
				}
				webview[eventType + 'ed'] = true;
			}
		} else {
			$.fire(webview, eventType);
			var list = webview.children();
			for (var i = 0; i < list.length; i++) {
				$.fire(list[i], eventType);
			}
		}

	};

	/**
	 * 以webview打开新的窗口,单webview只承载单个页面的dom，减少dom层级及页面大小；页面切换使用原生动画，将最耗性能的部分交给原生实现.
	 *
	 * 		$.openWindow({
				url:new-page-url,
				id:new-page-id,
				styles:{
				  top:newpage-top-position,//新页面顶部位置
				  bottom:newage-bottom-position,//新页面底部位置
				  width:newpage-width,//新页面宽度，默认为100%
				  height:newpage-height,//新页面高度，默认为100%
				  ......
				},
				extras:{
				  .....//自定义扩展参数，可以用来处理页面间传值
				},
				createNew:false,//是否重复创建同样id的webview，默认为false:不重复创建，直接显示
				show:{
				  autoShow:true,//页面loaded事件发生后自动显示，默认为true
				  aniShow:animationType,//页面显示动画，默认为”slide-in-right“；
				  duration:animationTime//页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒；
				},
				waiting:{
				  autoShow:true,//自动显示等待框，默认为true
				  title:'正在加载...',//等待对话框上显示的提示内容
				  options:{
					width:waiting-dialog-widht,//等待框背景区域宽度，默认根据内容自动计算合适宽度
					height:waiting-dialog-height,//等待框背景区域高度，默认根据内容自动计算合适高度
					......
				  }
				}
			})
	 *
	 * @alias #openWindow
	 * @memberof Eui
	 * @param {string} url 要打开的页面地址
	 * @param {string} id 指定页面ID
	 * @param {Object} options 可选:参数,等待,窗口,显示配置{params:{},waiting:{},styles:{},show:{}}
	 * @param {Object} [options.styles] 表示窗口参数，参考5+规范中的{@link http://www.dcloud.io/docs/api/zh_cn/webview.shtml#plus.webview.WebviewStyle|WebviewStyle}；
	 * 特别注意，height和width两个属性,即使不设置，也默认按100%计算；
	 * 因此若设置了top值为非"0px"的情况，建议同时设置bottom值，否则5+ runtime根据高度100%计算，
	 * 可能会造成页面真实底部位置超出屏幕范围的情况；left、right同理.
	 *
	 * @param {Object} [options.extras] 新窗口的额外扩展参数，可用来处理页面间传值；例如：
	 *
	 * 		var webview = $.openWindow({url:'info.html',extras:{name:'eui'}});
	 * 		console.log(webview.name);，
	 *
	 * 会输出"eui"字符串；注意：扩展参数仅在打开新窗口时有效，若目标窗口为预加载页面，则通过$.openWindow方法打开时传递的extras参数无效。
	 *
	 * @param {Boolean} [options.createNew=false] 是否重复创建相同id的webview；为优化性能、避免app中重复创建webview，
	 * 默认为false；判断逻辑如下：若createNew为true，则不判断重复，每次都新建webview；若为fasle，
	 * 则先计算当前App中是否已存在同样id的webview，若存在则直接显示；否则新创建并根据show参数执行显示逻辑；该参数可能导致的影响：若业务写在plusReady事件中，而plusReady事件仅首次创建时会触发，则下次再次通过mui.openWindow方法打开同样webview时，
	 * 是不会再次触发plusReady事件的，此时可通过自定义事件触发；案例参考：http://ask.dcloud.net.cn/question/6514;
	 *
	 * @param {Object} [options.show] 表示窗口显示控制。autoShow：目标窗口loaded事件发生后，是否自动显示；
	 * 若目标页面为预加载页面，则该参数无效；aniShow表示页面显示动画，
	 * 比如从右侧划入、从下侧划入等，具体可参考5+规范中的{@link http://www.dcloud.io/docs/api/zh_cn/webview.shtml#plus.webview.AnimationTypeShow|AnimationTypeShow}
	 *
	 * @param {Object} [options.waiting] 表示系统等待框；eui框架在打开新页面时等待框的处理逻辑为：
	 * 显示等待框-->创建目标页面webview-->目标页面loaded事件发生-->关闭等待框；
	 * 因此，只有当新页面为新创建页面（webview）时，会显示等待框，否则若为预加载好的页面，则直接显示目标页面，不会显示等待框。
	 * waiting中的参数：autoShow表示自动显示等待框，默认为true，若为false，则不显示等待框；
	 * 注意：若显示了等待框，但目标页面不自动显示，则需在目标页面中通过如下代码关闭等待框plus.nativeUI.closeWaiting();。
	 * title表示等待框上的提示文字，options表示等待框显示参数，
	 * 比如宽高、背景色、提示文字颜色等，具体可参考5+规范中的{@link http://www.dcloud.io/docs/api/zh_cn/nativeUI.shtml#plus.nativeUI.WaitingOption|WaitingOption}。
	 *
	 * @example <caption>示例1：
	 * Hello eui中，点击首页右上角的图标，会打开关于页面，实现代码如下：</caption>
	 * //tap为mui封装的单击事件，可参考手势事件章节
	 * document.getElementById('info').addEventListener('tap', function() {
	 *   //打开关于页面
	 *   $.openWindow({
	 *	  url: 'examples/info.html',
	 *	  id:'info'
	 *	 });
	 * });
	 *
	 * @example <caption>因没有传入`styles`参数，故默认全屏显示；也没有传入`show`参数，故使用`slide-in-right`动画，新页面从右侧滑入。</br>
	 * </br>示例2：从A页面打开B页面，B页面为一个需要从服务端加载的列表页面，若在B页面loaded事件发生时就将其显示出来，
	 * 因服务器数据尚未加载完毕，列表页面为空，用户体验不好；
	 * 可通过如下方式改善用户体验（最好的用户体验应该是通过预加载的方式）：</br>
	 * </br>第一步，B页面loaded事件发生后，不自动显示；
	 * </caption>
	 *
	 * //A页面中打开B页面，设置show的autoShow为false，则B页面在其loaded事件发生后，不会自动显示；
	 *  $.openWindow({
	 *	  url: 'B.html',
	 *	  show:{
	 *	   autoShow:false
	 *	  }
	 * });
	 *
	 * @example <caption>第二步，在B页面获取列表数据后，再关闭等待框、显示B页面</caption>
	 * //B页面onload从服务器获取列表数据；
	 *	window.onload = function(){
	 *	//从服务器获取数据
	 *	....
	 *	//业务数据获取完毕，并已插入当前页面DOM；
	 *	//注意：若为ajax请求，则需将如下代码放在处理完ajax响应数据之后；
	 *	$.plusReady(function(){
	 *		//关闭等待框
	 *		plus.nativeUI.closeWaiting();
	 *		//显示当前页面
	 *		$.currentWebview.show();
	 *	});
	 * }
	 */
	$.openWindow = function(url, id, options) {

		if (!window.plus) {
			return;
		}
		if (typeof url === 'object') {
			options = url;
			url = options.url;
			id = options.id || url;
		} else {
			if (typeof id === 'object') {
				options = id;
				id = url;
			} else {
				id = id || url;
			}
		}
		options = options || {};
		var params = options.params || {};
		var webview, nShow, nWaiting;
		if ($.webviews[id]) { //已缓存
			var webviewCache = $.webviews[id];
			webview = webviewCache.webview;
			//需要处理用户手动关闭窗口的情况，此时webview应该是空的；
			if (!webview || !webview.getURL()) {
				//再次新建一个webview；
				options = $.extend(options, {
					id: id,
					url: url,
					preload: true
				}, true);
				webview = $.createWindow(options);
			}
			//每次show都需要传递动画参数；
			//预加载的动画参数优先级：openWindow配置>preloadPages配置>eui默认配置；
			nShow = webviewCache.show;
			nShow = options.show ? $.extend(nShow, options.show) : nShow;
			webview.show(nShow.aniShow, nShow.duration, function() {
				triggerPreload(webview);
				trigger(webview, 'pagebeforeshow', false);
			});

			webviewCache.afterShowMethodName && webview.evalJS(webviewCache.afterShowMethodName + '(\'' + JSON.stringify(params) + '\')');
			return webview;
		} else { //新窗口
			if (options.createNew !== true) {
				webview = plus.webview.getWebviewById(id);
				if (webview) {//如果已存在
					nShow = $.showOptions(options.show);
					webview.show(nShow.aniShow, nShow.duration, function() {
						triggerPreload(webview);
						trigger(webview, 'pagebeforeshow', false);
					});
					return webview;
				}
			}
			//显示waiting
			var waitingConfig = $.waitingOptions(options.waiting);
			if (waitingConfig.autoShow) {
				nWaiting = plus.nativeUI.showWaiting(waitingConfig.title, waitingConfig.options);
			}
			//创建页面
			options = $.extend(options, {
				id: id,
				url: url
			});

			webview = $.createWindow(options);
			//显示
			nShow = $.showOptions(options.show);
			if (nShow.autoShow) {
				webview.addEventListener("loaded", function() {
					//关闭等待框
					if (nWaiting) {
						nWaiting.close();
					}
					//显示页面
					webview.show(nShow.aniShow, nShow.duration, function() {
						triggerPreload(webview);
						trigger(webview, 'pagebeforeshow', false);
					});
					webview.showed = true;
					options.afterShowMethodName && webview.evalJS(options.afterShowMethodName + '(\'' + JSON.stringify(params) + '\')');
				}, false);
			}
		}
		return webview;
	};

	/**
	 * 根据配置信息创建一个webview.
	 *
	 * @alias #createWindow
	 * @memberof Eui
	 * @param {Object} options 配置项
	 * @param {Object} isCreate 是否直接创建非预加载窗口
	 * @returns {webview}
	 */
	$.createWindow = function(options, isCreate) {
		if (!window.plus) {
			return;
		}
		var id = options.id || options.url;
		var webview;
		if (options.preload) {
			if ($.webviews[id] && $.webviews[id].webview.getURL()) { //已经cache
				webview = $.webviews[id].webview;
			} else { //新增预加载窗口
				//preload
				//preload
				//判断是否携带createNew参数，默认为false
				if (options.createNew !== true) {
					webview = plus.webview.getWebviewById(id);
				}

				//之前没有，那就新创建
				if (!webview) {
					webview = plus.webview.create(options.url, id, $.windowOptions(options.styles), $.extend({
						preload: true
					}, options.extras));
					if (options.subpages) {
						$.each(options.subpages, function (index, subpage) {
							//TODO 子窗口也可能已经创建，比如公用模板的情况；
							var subWebview = plus.webview.create(subpage.url, subpage.id || subpage.url, $.windowOptions(subpage.styles), $.extend({
								preload: true
							}, subpage.extras));
							webview.append(subWebview);
						});
					}
				}
			}

			//TODO 理论上，子webview也应该计算到预加载队列中，但这样就麻烦了，要退必须退整体，否则可能出现问题；
			$.webviews[id] = {
				webview: webview, //目前仅preload的缓存webview
				preload: true,
				show: $.showOptions(options.show),
				afterShowMethodName: options.afterShowMethodName //就不应该用evalJS。应该是通过事件消息通讯
			};
			//索引该预加载窗口
			var preloads = $.data.preloads;
			var index = preloads.indexOf(id);
			if (~index) { //删除已存在的(变相调整插入位置)
				preloads.splice(index, 1);
			}
			preloads.push(id);
			if (preloads.length > $.options.preloadLimit) {
				//先进先出
				var first = $.data.preloads.shift();
				var webviewCache = $.webviews[first];
				if (webviewCache && webviewCache.webview) {
					//需要将自己打开的所有页面，全部close；
					//关闭该预加载webview	
					$.closeAll(webviewCache.webview);
				}
				//删除缓存
				delete $.webviews[first];
			}
		} else {
			if (isCreate !== false) { //直接创建非预加载窗口
				webview = plus.webview.create(options.url, id, $.windowOptions(options.styles), options.extras);
				if (options.subpages) {
					$.each(options.subpages, function(index, subpage) {
						var subWebview = plus.webview.create(subpage.url, subpage.id || subpage.url, $.windowOptions(subpage.styles), subpage.extras);
						webview.append(subWebview);
					});
				}
			}
		}
		return webview;
	};

	/**
	 * 预加载webview。
	 *
	 * 		var page = $.preload({
	 *			url:new-page-url,
	 *			id:new-page-id,//默认使用当前页面的url作为id
	 *			styles:{},//窗口参数
	 *			extras:{}//自定义扩展参数
	 *		});
	 *
	 * 备注：通过该方法预加载，可立即返回对应webview的引用，但一次仅能预加载一个页面；
	 * 若需加载多个webview，则需多次调用`$.preload()`方法.
	 *
	 * @alias #preload
	 * @memberof Eui
	 * @param {Object} options 配置项
	 * @param {Object} [options.id] 默认使用当前页面的url作为id
	 * @param {Object} options.url 路径地址
	 * @param {Object} [options.styles] 窗口样式,参考5+规范中的{@link http://www.dcloud.io/docs/api/zh_cn/webview.shtml#plus.webview.WebviewStyle|WebviewStyle}
	 * @param {Object} [options.extras] 自定义扩展参数
	 * @returns {WebviewObject} 更多方法可查看{@link http://www.dcloud.io/docs/api/zh_cn/webview.shtml#plus.webview.WebviewObject|WebviewObject}
	 */
	$.preload = function(options) {
		//调用预加载函数，不管是否传递preload参数，强制变为true
		if (!options.preload) {
			options.preload = true;
		}
		return $.createWindow(options);
	};

	/**
	 * 关闭当前webview打开的所有webview；
	 *
	 * @alias #closeOpened
	 * @memberof Eui
	 * @param {WebviewObject} webview
	 */
	$.closeOpened = function(webview) {
		var opened = webview.opened();
		if (opened) {
			for (var i = 0, len = opened.length; i < len; i++) {
				var openedWebview = opened[i];
				var open_open = openedWebview.opened();
				if (open_open && open_open.length > 0) {
					$.closeOpened(openedWebview);
				} else {
					//如果直接孩子节点，就不用关闭了，因为父关闭的时候，会自动关闭子；
					if (openedWebview.parent() !== webview) {
						openedWebview.close('none');
					}
				}
			}
		}
	};

	/**
	 * 关闭当前webview打开所有webview，并伴随动画.
	 *
	 * @alias #closeAll
	 * @memberof Eui
	 * @param {WebviewObject} webview
	 * @param {Boolean} aniShow 是否动画
	 */
	$.closeAll = function(webview, aniShow) {
		$.closeOpened(webview);
		if (aniShow) {
			webview.close(aniShow);
		} else {
			webview.close();
		}
	};

	/**
	 * 批量创建webview.
	 *
	 * @alias #createWindows
	 * @memberof Eui
	 * @param {Array} options
	 */
	$.createWindows = function(options) {
		$.each(options, function(index, option) {
			//初始化预加载窗口(创建)和非预加载窗口(仅配置，不创建)
			$.createWindow(option, false);
		});
	};

	/**
	 * 创建当前页面的子webview.
	 *
	 * @alias #appendWebview
	 * @memberof Eui
	 * @param {Object} options
	 * @returns {WebviewObject}
	 */
	$.appendWebview = function(options) {
		if (!window.plus) {
			return;
		}
		var id = options.id || options.url;
		var webview;
		if (!$.webviews[id]) { //保证执行一遍
			//TODO 这里也有隐患，比如某个webview不是作为subpage创建的，而是作为target webview的话；
			webview = plus.webview.create(options.url, id, options.styles, options.extras);
			//之前的实现方案：子窗口loaded之后再append到父窗口中；
			//问题：部分子窗口loaded事件发生较晚，此时执行父窗口的children方法会返回空，导致父子通讯失败；
			//     比如父页面执行完preload事件后，需触发子页面的preload事件，此时未append的话，就无法触发；
			//修改方式：不再监控loaded事件，直接append
			//by chb@20150521
			// webview.addEventListener('loaded', function() {
			plus.webview.currentWebview().append(webview);
			// });
			$.webviews[id] = options;
		}
		return webview;
	};

	//全局webviews
	$.webviews = {};
	//预加载窗口索引
	$.data.preloads = [];
	//$.currentWebview
	$.plusReady(function() {
		$.currentWebview = plus.webview.currentWebview();
	});
	$.addInit({
		name: '5+',
		index: 100,
		handle: function() {
			var options = $.options;
			var subpages = options.subpages || [];
			if ($.os.plus) {
				$.plusReady(function() {
					//TODO  这里需要判断一下，最好等子窗口加载完毕后，再调用主窗口的show方法；
					//或者：在openwindow方法中，监听实现；
					$.each(subpages, function(index, subpage) {
						$.appendWebview(subpage);
					});
					//判断是否首页
					if (plus.webview.currentWebview() === plus.webview.getWebviewById(plus.runtime.appid)) {
						$.isHomePage = true;
						//首页需要自己激活预加载；
						//timeout因为子页面loaded之后才append的，防止子页面尚未append、从而导致其preload未触发的问题；
						setTimeout(function() {
							triggerPreload(plus.webview.currentWebview());
						}, 300);
					}
					//设置ios顶部状态栏颜色；
					if ($.os.ios && $.options.statusBarBackground) {
						plus.navigator.setStatusBarBackground($.options.statusBarBackground);
					}
					if ($.os.android && parseFloat($.os.version) < 4.4) {
						//解决Android平台4.4版本以下，resume后，父窗体标题延迟渲染的问题；
						if (plus.webview.currentWebview().parent() == null) {
							document.addEventListener("resume", function() {
								var body = document.body;
								body.style.display = 'none';
								setTimeout(function() {
									body.style.display = '';
								}, 10);
							});
						}
					}
				});
			} else {
				if (subpages.length > 0) {
					var err = document.createElement('div');
					err.className = 'mui-error';
					//文字描述
					var span = document.createElement('span');
					span.innerHTML = '在该浏览器下，不支持创建子页面，具体参考';
					err.appendChild(span);
					var a = document.createElement('a');
					a.innerHTML = '"EUI框架适用场景"';
					a.href = 'http://ask.dcloud.net.cn/article/113';
					err.appendChild(a);
					document.body.appendChild(err);
					console.log('在该浏览器下，不支持创建子页面');
				}

			}

		}
	});
	window.addEventListener('preload', function() {
		//处理预加载部分
		var webviews = $.options.preloadPages || [];
		$.plusReady(function() {
			$.each(webviews, function(index, webview) {
				$.createWindow($.extend(webview, {
					preload: true
				}));
			});
		});
	});
})(Eui);


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
		if (action && action.classList.contains('mui-action-back')) {
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
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath init/eui.back.5+.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function($, window) {
	if ($.os.plus && $.os.android) {
		$.addBack({
			name: 'mui',
			index: 5,
			handle: function() {
				//popover
				if ($.targets._popover && $.targets._popover.classList.contains('mui-active')) {
					$($.targets._popover).popover('hide');
					return true;
				}
				//offcanvas
				var offCanvas = document.querySelector('.mui-off-canvas-wrap.mui-active');
				if (offCanvas) {
					$(offCanvas).offCanvas('close');
					return true;
				}
				var previewImage = $.isFunction($.getPreviewImage) && $.getPreviewImage();
				if (previewImage && previewImage.isShown()) {
					previewImage.close();
					return true;
				}
			}
		});
	}

	$.addBack({
		name: '5+',
		index: 10,
		handle: function() {
			if (!window.plus) {
				return false;
			}
			var wobj = plus.webview.currentWebview();
			var parent = wobj.parent();
			if (parent) {
				parent.evalJS('Eui&&$.back();');
			} else {
				wobj.canBack(function(e) {
					//by chb 暂时注释，在碰到类似popover之类的锚点的时候，需多次点击才能返回；
					if (e.canBack) { //webview history back
						window.history.back();
					} else { //webview close or hide
						//fixed by fxy 此处不应该用opener判断，因为用户有可能自己close掉当前窗口的opener。这样的话。opener就为空了，导致不能执行close
						if (wobj.id === plus.runtime.appid) { //首页
							//首页不存在opener的情况下，后退实际上应该是退出应用；
							//这个交给项目具体实现，框架暂不处理；
							//plus.runtime.quit();
						} else { //其他页面，
							if (wobj.preload) {
								wobj.hide("auto");
							} else {
								//关闭页面时，需要将其打开的所有子页面全部关闭；
								$.closeAll(wobj);
							}
						}
					}
				});
			}
			return true;
		}
	});

	/**
	 * 绑定menu按键事件(menubutton).
	 *
	 * 备注：样式为`.mui-action-menu`定义的按钮默认会触发该事件.
	 *
	 * @alias #menu
	 * @memberof Eui
	 */
	$.menu = function() {
		var menu = document.querySelector('.mui-action-menu');
		if (menu) {
			$.trigger(menu, 'touchstart'); //临时处理menu无touchstart的话，找不到当前targets的问题
			$.trigger(menu, 'tap');
		} else { //执行父窗口的menu
			if (window.plus) {
				var wobj = $.currentWebview;
				var parent = wobj.parent();
				if (parent) { //又得evalJS
					parent.evalJS('Eui&&$.menu();');
				}
			}
		}
	};
	var __back = function() {
		$.back();
	};
	var __menu = function() {
		$.menu();
	};
	//默认监听
	$.plusReady(function() {
		if ($.options.keyEventBind.backbutton) {
			plus.key.addEventListener('backbutton', __back, false);
		}
		if ($.options.keyEventBind.menubutton) {
			plus.key.addEventListener('menubutton', __menu, false);
		}
	});

	//处理按键监听事件
	$.addInit({
		name: 'keyEventBind',
		index: 1000,
		handle: function() {
			$.plusReady(function() {
				//如果不为true，则移除默认监听
				if (!$.options.keyEventBind.backbutton) {
					plus.key.removeEventListener('backbutton', __back);
				}
				if (!$.options.keyEventBind.menubutton) {
					plus.key.removeEventListener('menubutton', __menu);
				}
			});
		}
	});
})(Eui, window);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath init/eui.init.pullrefresh.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function($) {
	$.addInit({
		name: 'pullrefresh',
		index: 1000,
		handle: function() {
			var options = $.options;
			var pullRefreshOptions = options.pullRefresh || {};
			var hasPulldown = pullRefreshOptions.down && pullRefreshOptions.down.hasOwnProperty('callback');
			var hasPullup = pullRefreshOptions.up && pullRefreshOptions.up.hasOwnProperty('callback');
			if (hasPulldown || hasPullup) {
				var container = pullRefreshOptions.container;
				if (container) {
					var $container = $(container);
					if ($container.length === 1) {
						if ($.os.plus && $.os.android) { //android 5+
							$.plusReady(function() {
								var webview = plus.webview.currentWebview();
								if (hasPullup) {
									//当前页面初始化pullup
									var upOptions = {};
									upOptions.up = pullRefreshOptions.up;
									upOptions.webviewId = webview.id || webview.getURL();
									$container.pullRefresh(upOptions);
								}
								if (hasPulldown) {
									var parent = webview.parent();
									var id = webview.id || webview.getURL();
									if (parent) {
										if (!hasPullup) { //如果没有上拉加载，需要手动初始化一个默认的pullRefresh，以便当前页面容器可以调用endPulldownToRefresh等方法
											$container.pullRefresh({
												webviewId: id
											});
										}
										var downOptions = {
											webviewId: id
										};
										downOptions.down = $.extend({}, pullRefreshOptions.down);
										downOptions.down.callback = '_CALLBACK';
										//父页面初始化pulldown
										parent.evalJS("Eui&&$(document.querySelector('.mui-content')).pullRefresh('" + JSON.stringify(downOptions) + "')");
									}
								}
							});
						} else {
							$container.pullRefresh(pullRefreshOptions);
						}
					}
				}
			}
		}
	});
})(Eui);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath init/eui.ajax.5+.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 */
(function($) {
	var originAnchor = document.createElement('a');
	originAnchor.href = window.location.href;
	$.plusReady(function() {
		$.ajaxSettings = $.extend($.ajaxSettings, {
			xhr: function(settings) {
				if (settings.crossDomain) { //强制使用plus跨域
					return new plus.net.XMLHttpRequest();
				}
				//仅在webview的url为远程文件，且ajax请求的资源不同源下使用plus.net.XMLHttpRequest
				if (originAnchor.protocol !== 'file:') {
					var urlAnchor = document.createElement('a');
					urlAnchor.href = settings.url;
					urlAnchor.href = urlAnchor.href;
					settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host);
					if (settings.crossDomain) {
						return new plus.net.XMLHttpRequest();
					}
				}
				return new window.XMLHttpRequest();
			}
		});
	});
})(Eui);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/eui.layout.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, undefined) {

	$.offset = function(element) {
		var box = {
			top : 0,
			left : 0
		};
		if ( typeof element.getBoundingClientRect !== undefined) {
			box = element.getBoundingClientRect();
		}
		return {
			top : box.top + window.pageYOffset - element.clientTop,
			left : box.left + window.pageXOffset - element.clientLeft
		};
	};
})(Eui, window);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/eui.animation.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window) {

	/**
	 * 滚动窗口屏幕到指定位置，该方法是对window.scrollTo()方法在手机端的增强实现，
	 * 可设定滚动动画时间及滚动结束后的回调函数;鉴于手机屏幕大小，该方法仅可实现屏幕纵向滚动。
	 *
	 * 示例：
	 * 1秒钟之内滚动到页面顶部.
	 *
	 *		$.scrollTo(0,1000);
	 *
	 * @alias #scrollTo
	 * @memberof Eui
	 * @param {Number} scrollTop 要在窗口文档显示区左上角显示的文档的 y 坐标
	 * @param {Number} [duration=1000] 持续时间,单位：毫秒
	 * @param {Function} callback 滚动结束后执行的回调函数
	 */
	$.scrollTo = function(scrollTop, duration, callback) {
		duration = duration || 1000;
		var scroll = function(duration) {
			if (duration <= 0) {
				window.scrollTo(0, scrollTop);
				callback && callback();
				return;
			}
			var distaince = scrollTop - window.scrollY;
			setTimeout(function() {
				window.scrollTo(0, window.scrollY + distaince / duration * 10);
				scroll(duration - 10);
			}, 16.7);
		};
		scroll(duration);
	};

	$.animationFrame = function(cb) {
		var args, isQueued, context;
		return function() {
			args = arguments;
			context = this;
			if (!isQueued) {
				isQueued = true;
				requestAnimationFrame(function() {
					cb.apply(context, args);
					isQueued = false;
				});
			}
		};
	};

})(Eui, window);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/eui.class.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($) {
	var initializing = false,
		fnTest = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/;

	var Class = function() {};
	Class.extend = function(prop) {
		var _super = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;
		for (var name in prop) {
			prototype[name] = typeof prop[name] == "function" &&
				typeof _super[name] == "function" && fnTest.test(prop[name]) ?
				(function(name, fn) {
					return function() {
						var tmp = this._super;

						this._super = _super[name];

						var ret = fn.apply(this, arguments);
						this._super = tmp;

						return ret;
					};
				})(name, prop[name]) :
				prop[name];
		}
		function Class() {
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		}
		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.extend = arguments.callee;
		return Class;
	};
	$.Class = Class;
})(Eui);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/eui.pullrefresh.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, document, undefined) {
	var CLASS_PULL_TOP_POCKET = 'mui-pull-top-pocket';
	var CLASS_PULL_BOTTOM_POCKET = 'mui-pull-bottom-pocket';
	var CLASS_PULL = 'mui-pull';
	var CLASS_PULL_LOADING = 'mui-pull-loading';
	var CLASS_PULL_CAPTION = 'mui-pull-caption';
	var CLASS_PULL_CAPTION_DOWN = 'mui-pull-caption-down';
	var CLASS_PULL_CAPTION_REFRESH = 'mui-pull-caption-refresh';
	var CLASS_PULL_CAPTION_NOMORE = 'mui-pull-caption-nomore';

	var CLASS_ICON = 'mui-icon';
	var CLASS_SPINNER = 'mui-spinner';
	var CLASS_ICON_PULLDOWN = 'mui-icon-pulldown';

	var CLASS_BLOCK = 'mui-block';
	var CLASS_HIDDEN = 'mui-hidden';
	var CLASS_VISIBILITY = 'mui-visibility';

	var CLASS_LOADING_UP = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_PULLDOWN;
	var CLASS_LOADING_DOWN = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_ICON_PULLDOWN;
	var CLASS_LOADING = CLASS_PULL_LOADING + ' ' + CLASS_ICON + ' ' + CLASS_SPINNER;

	var pocketHtml = ['<div class="' + CLASS_PULL + '">', '<div class="{icon}"></div>', '<div class="' + CLASS_PULL_CAPTION + '">{contentrefresh}</div>', '</div>'].join('');

	var PullRefresh = {
		init: function(element, options) {
			this._super(element, $.extend(true, {
				scrollY: true,
				scrollX: false,
				indicators: true,
				deceleration:0.003,
				down: {
					height: 50,
					contentdown: '下拉可以刷新',
					contentover: '释放立即刷新',
					contentrefresh: '正在刷新...'
				},
				up: {
					height: 50,
					auto: false,
					contentdown: '上拉显示更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多数据了',
					duration: 300
				}
			}, options));
		},
		_init: function() {
			this._super();
			this._initPocket();
		},
		_initPulldownRefresh: function() {
			this.pulldown = true;
			this.pullPocket = this.topPocket;
			this.pullPocket.classList.add(CLASS_BLOCK);
			this.pullPocket.classList.add(CLASS_VISIBILITY);
			this.pullCaption = this.topCaption;
			this.pullLoading = this.topLoading;
		},
		_initPullupRefresh: function() {
			this.pulldown = false;
			this.pullPocket = this.bottomPocket;
			this.pullPocket.classList.add(CLASS_BLOCK);
			this.pullPocket.classList.add(CLASS_VISIBILITY);
			this.pullCaption = this.bottomCaption;
			this.pullLoading = this.bottomLoading;
		},
		_initPocket: function() {
			var options = this.options;
			if (options.down && options.down.hasOwnProperty('callback')) {
				this.topPocket = this.scroller.querySelector('.' + CLASS_PULL_TOP_POCKET);
				if (!this.topPocket) {
					this.topPocket = this._createPocket(CLASS_PULL_TOP_POCKET, options.down, CLASS_LOADING_DOWN);
					this.wrapper.insertBefore(this.topPocket, this.wrapper.firstChild);
				}
				this.topLoading = this.topPocket.querySelector('.' + CLASS_PULL_LOADING);
				this.topCaption = this.topPocket.querySelector('.' + CLASS_PULL_CAPTION);
			}
			if (options.up && options.up.hasOwnProperty('callback')) {
				this.bottomPocket = this.scroller.querySelector('.' + CLASS_PULL_BOTTOM_POCKET);
				if (!this.bottomPocket) {
					this.bottomPocket = this._createPocket(CLASS_PULL_BOTTOM_POCKET, options.up, CLASS_LOADING);
					this.scroller.appendChild(this.bottomPocket);
				}
				this.bottomLoading = this.bottomPocket.querySelector('.' + CLASS_PULL_LOADING);
				this.bottomCaption = this.bottomPocket.querySelector('.' + CLASS_PULL_CAPTION);
				//TODO only for h5
				this.wrapper.addEventListener('scrollbottom', this);
			}
		},
		_createPocket: function(clazz, options, iconClass) {
			var pocket = document.createElement('div');
			pocket.className = clazz;
			pocket.innerHTML = pocketHtml.replace('{contentrefresh}', options.contentrefresh).replace('{icon}', iconClass);
			return pocket;
		},
		_resetPullDownLoading: function() {
			var loading = this.pullLoading;
			if (loading) {
				this.pullCaption.innerHTML = this.options.down.contentdown;
				loading.style.webkitTransition = "";
				loading.style.webkitTransform = "";
				loading.style.webkitAnimation = "";
				loading.className = CLASS_LOADING_DOWN;
			}
		},
		_setCaptionClass: function(isPulldown, caption, title) {
			if (!isPulldown) {
				switch (title) {
					case this.options.up.contentdown:
						caption.className = CLASS_PULL_CAPTION + ' ' + CLASS_PULL_CAPTION_DOWN;
						break;
					case this.options.up.contentrefresh:
						caption.className = CLASS_PULL_CAPTION + ' ' + CLASS_PULL_CAPTION_REFRESH
						break;
					case this.options.up.contentnomore:
						caption.className = CLASS_PULL_CAPTION + ' ' + CLASS_PULL_CAPTION_NOMORE;
						break;
				}
			}
		},
		_setCaption: function(title, reset) {
			if (this.loading) {
				return;
			}
			var options = this.options;
			var pocket = this.pullPocket;
			var caption = this.pullCaption;
			var loading = this.pullLoading;
			var isPulldown = this.pulldown;
			var self = this;
			if (pocket) {
				if (reset) {
					var self = this;
					setTimeout(function() {
						caption.innerHTML = self.lastTitle = title;
						if (isPulldown) {
							loading.className = CLASS_LOADING_DOWN;
						} else {
							self._setCaptionClass(false, caption, title);
							loading.className = CLASS_LOADING;
						}
						loading.style.webkitAnimation = "";
						loading.style.webkitTransition = "";
						loading.style.webkitTransform = "";
					}, 100);
				} else {
					if (title !== this.lastTitle) {
						caption.innerHTML = title;
						if (isPulldown) {
							if (title === options.down.contentrefresh) {
								loading.className = CLASS_LOADING;
								loading.style.webkitAnimation = "spinner-spin 1s step-end infinite";
							} else if (title === options.down.contentover) {
								loading.className = CLASS_LOADING_UP;
								loading.style.webkitTransition = "-webkit-transform 0.3s ease-in";
								loading.style.webkitTransform = "rotate(180deg)";
							} else if (title === options.down.contentdown) {
								loading.className = CLASS_LOADING_DOWN;
								loading.style.webkitTransition = "-webkit-transform 0.3s ease-in";
								loading.style.webkitTransform = "rotate(0deg)";
							}
						} else {
							if (title === options.up.contentrefresh) {
								loading.className = CLASS_LOADING + ' ' + CLASS_VISIBILITY;
							} else {
								loading.className = CLASS_LOADING + ' ' + CLASS_HIDDEN;
							}
							self._setCaptionClass(false, caption, title);
						}
						this.lastTitle = title;
					}
				}

			}
		}
	};
	$.PullRefresh = PullRefresh;
})(Eui, document);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/eui.class.scroll.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, document, undefined) {
	var CLASS_SCROLLBAR = 'mui-scrollbar';
	var CLASS_INDICATOR = 'mui-scrollbar-indicator';
	var CLASS_SCROLLBAR_VERTICAL = CLASS_SCROLLBAR + '-vertical';
	var CLASS_SCROLLBAR_HORIZONTAL = CLASS_SCROLLBAR + '-horizontal';

	var CLASS_ACTIVE = 'mui-active';

	var ease = {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function(k) {
				return k * (2 - k);
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
			fn: function(k) {
				return Math.sqrt(1 - (--k * k));
			}
		}
	}

	/**
	 * @class Scroll
	 */
	var Scroll = $.Class.extend({
		init: function(element, options) {
			this.wrapper = this.element = element;
			this.scroller = this.wrapper.children[0];
			this.scrollerStyle = this.scroller && this.scroller.style;
			this.stopped = false;

			this.options = $.extend(true, {
				scrollY: true,//是否竖向滚动
				scrollX: false,//是否横向滚动
				startX: 0,//初始化时滚动至x
				startY: 0,//初始化时滚动至y
				indicators: true,//是否显示滚动条
				stopPropagation: false,
				hardwareAccelerated: true,
				fixedBadAndorid: false,
				preventDefaultException: {
					tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/
				},
				momentum: true,

				snap: false,//图片轮播，拖拽式选项卡

				bounce: true,//是否启用回弹
				bounceTime: 300,//回弹动画时间
				bounceEasing: ease.circular.style,//回弹动画曲线

				directionLockThreshold: 5,

				parallaxElement: false,//视差元素
				parallaxRatio: 0.5
			}, options);

			this.x = 0;
			this.y = 0;
			this.translateZ = this.options.hardwareAccelerated ? ' translateZ(0)' : '';

			this._init();
			if (this.scroller) {
				this.refresh();
				//				if (this.options.startX !== 0 || this.options.startY !== 0) { //需要判断吗？后续根据实际情况再看看
				this.scrollTo(this.options.startX, this.options.startY);
				//				}
			}
		},
		_init: function() {
			this._initParallax();
			this._initIndicators();
			this._initEvent();
		},
		_initParallax: function() {
			if (this.options.parallaxElement) {
				this.parallaxElement = document.querySelector(this.options.parallaxElement);
				this.parallaxStyle = this.parallaxElement.style;
				this.parallaxHeight = this.parallaxElement.offsetHeight;
				this.parallaxImgStyle = this.parallaxElement.querySelector('img').style;
			}
		},
		_initIndicators: function() {
			var self = this;
			self.indicators = [];
			if (!this.options.indicators) {
				return;
			}
			var indicators = [],
				indicator;

			// Vertical scrollbar
			if (self.options.scrollY) {
				indicator = {
					el: this._createScrollBar(CLASS_SCROLLBAR_VERTICAL),
					listenX: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}

			// Horizontal scrollbar
			if (this.options.scrollX) {
				indicator = {
					el: this._createScrollBar(CLASS_SCROLLBAR_HORIZONTAL),
					listenY: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}

			for (var i = indicators.length; i--;) {
				this.indicators.push(new Indicator(this, indicators[i]));
			}
		},
		_initSnap: function() {
			this.currentPage = {};
			this.pages = [];
			var snaps = this.snaps;
			var length = snaps.length;
			var m = 0;
			var n = -1;
			var x = 0;
			var cx = 0;
			for (var i = 0; i < length; i++) {
				var snap = snaps[i];
				var offsetLeft = snap.offsetLeft;
				var offsetWidth = snap.offsetWidth;
				if (i === 0 || offsetLeft <= snaps[i - 1].offsetLeft) {
					m = 0;
					n++;
				}
				if (!this.pages[m]) {
					this.pages[m] = [];
				}
				x = this._getSnapX(offsetLeft);
				cx = x - Math.round((offsetWidth) / 2);
				this.pages[m][n] = {
					x: x,
					cx: cx,
					pageX: m,
					element: snap
				}
				if (snap.classList.contains(CLASS_ACTIVE)) {
					this.currentPage = this.pages[m][0];
				}
				if (x >= this.maxScrollX) {
					m++;
				}
			}
			this.options.startX = this.currentPage.x || 0;
		},
		_getSnapX: function(offsetLeft) {
			return Math.max(Math.min(0, -offsetLeft + (this.wrapperWidth / 2)), this.maxScrollX);
		},
		_gotoPage: function(index) {
			this.currentPage = this.pages[Math.min(index, this.pages.length - 1)][0];
			for (var i = 0, len = this.snaps.length; i < len; i++) {
				if (i === index) {
					this.snaps[i].classList.add(CLASS_ACTIVE);
				} else {
					this.snaps[i].classList.remove(CLASS_ACTIVE);
				}
			}
			this.scrollTo(this.currentPage.x, 0, this.options.bounceTime);
		},
		_nearestSnap: function(x) {
			if (!this.pages.length) {
				return {
					x: 0,
					pageX: 0
				};
			}
			var i = 0;
			var length = this.pages.length;

			if (x > 0) {
				x = 0;
			} else if (x < this.maxScrollX) {
				x = this.maxScrollX;
			}

			for (; i < length; i++) {
				if (x >= this.pages[i][0].cx) {
					return this.pages[i][0];
				}
			}
			return {
				x: 0,
				pageX: 0
			};
		},
		_initEvent: function(detach) {
			var action = detach ? 'removeEventListener' : 'addEventListener';
			window[action]('orientationchange', this);
			window[action]('resize', this);

			this.scroller[action]('webkitTransitionEnd', this);

			this.wrapper[action]('touchstart', this);
			this.wrapper[action]('touchcancel', this);
			this.wrapper[action]('touchend', this);
			this.wrapper[action]('drag', this);
			this.wrapper[action]('dragend', this);
			this.wrapper[action]('flick', this);
			this.wrapper[action]('scrollend', this);
			if (this.options.scrollX) {
				this.wrapper[action]('swiperight', this);
			}
			var segmentedControl = this.wrapper.querySelector('.mui-segmented-control');
			if (segmentedControl) { //靠，这个bug排查了一下午，阻止hash跳转，一旦hash跳转会导致可拖拽选项卡的tab不见
				$(segmentedControl)[detach ? 'off' : 'on']('click', 'a', $.preventDefault);
			}

			this.wrapper[action]('scrollend', this._handleIndicatorScrollend.bind(this));

			this.wrapper[action]('scrollstart', this._handleIndicatorScrollstart.bind(this));

			this.wrapper[action]('refresh', this._handleIndicatorRefresh.bind(this));
		},
		_handleIndicatorScrollend: function() {
			this.indicators.map(function(indicator) {
				indicator.fade();
			});
		},
		_handleIndicatorScrollstart: function() {
			this.indicators.map(function(indicator) {
				indicator.fade(1);
			});
		},
		_handleIndicatorRefresh: function() {
			this.indicators.map(function(indicator) {
				indicator.refresh();
			});
		},
		handleEvent: function(e) {
			if (this.stopped) {
				this.resetPosition();
				return;
			}

			switch (e.type) {
				case 'touchstart':
					this._start(e);
					break;
				case 'drag':
					this.options.stopPropagation && e.stopPropagation();
					this._drag(e);
					break;
				case 'dragend':
				case 'flick':
					this.options.stopPropagation && e.stopPropagation();
					this._flick(e);
					break;
				case 'touchcancel':
				case 'touchend':
					this._end(e);
					break;
				case 'webkitTransitionEnd':
					this._transitionEnd(e);
					break;
				case 'scrollend':
					this._scrollend(e);
					e.stopPropagation();
					break;
				case 'orientationchange':
				case 'resize':
					this._resize();
					break;
				case 'swiperight':
					e.stopPropagation();
					break;

			}
		},
		_start: function(e) {
			this.moved = this.needReset = false;
			this._transitionTime();
			if (this.isInTransition && this.moved) {
				this.needReset = true;
				this.isInTransition = false;
				var pos = $.parseTranslateMatrix($.getStyles(this.scroller, 'webkitTransform'));
				this.setTranslate(Math.round(pos.x), Math.round(pos.y));
				this.resetPosition(); //reset
				$.trigger(this.scroller, 'scrollend', this);
				//				e.stopPropagation();
				e.preventDefault();
			}
			this.reLayout();
			$.trigger(this.scroller, 'beforescrollstart', this);
		},
		_getDirectionByAngle: function(angle) {
			if (angle < -80 && angle > -100) {
				return 'up';
			} else if (angle >= 80 && angle < 100) {
				return 'down';
			} else if (angle >= 170 || angle <= -170) {
				return 'left';
			} else if (angle >= -35 && angle <= 10) {
				return 'right';
			}
			return null;
		},
		_drag: function(e) {
			//			if (this.needReset) {
			//				e.stopPropagation(); //disable parent drag(nested scroller)
			//				return;
			//			}
			var detail = e.detail;
			if (this.options.scrollY || detail.direction === 'up' || detail.direction === 'down') { //如果是竖向滚动或手势方向是上或下
				//ios8 hack
				if ($.os.ios && parseFloat($.os.version) >= 8) { //多webview时，离开当前webview会导致后续touch事件不触发
					var clientY = detail.gesture.touches[0].clientY;
					//下拉刷新 or 上拉加载
					if ((clientY + 10) > window.innerHeight || clientY < 10) {
						this.resetPosition(this.options.bounceTime);
						return;
					}
				}
			}
			var isPreventDefault = isReturn = false;
			var direction = this._getDirectionByAngle(detail.angle);
			if (detail.direction === 'left' || detail.direction === 'right') {
				if (this.options.scrollX) {
					isPreventDefault = true;
					if (!this.moved) { //识别角度(该角度导致轮播不灵敏)
						//						if (direction !== 'left' && direction !== 'right') {
						//							isReturn = true;
						//						} else {
						$.gestures.session.lockDirection = true; //锁定方向
						$.gestures.session.startDirection = detail.direction;
						//						}
					}
				} else if (this.options.scrollY && !this.moved) {
					isReturn = true;
				}
			} else if (detail.direction === 'up' || detail.direction === 'down') {
				if (this.options.scrollY) {
					isPreventDefault = true;
					//					if (!this.moved) { //识别角度,竖向滚动似乎没必要进行小角度验证
					//						if (direction !== 'up' && direction !== 'down') {
					//							isReturn = true;
					//						}
					//					}
					if (!this.moved) {
						$.gestures.session.lockDirection = true; //锁定方向
						$.gestures.session.startDirection = detail.direction;
					}
				} else if (this.options.scrollX && !this.moved) {
					isReturn = true;
				}
			} else {
				isReturn = true;
			}
			if (this.moved || isPreventDefault) {
				e.stopPropagation(); //阻止冒泡(scroll类嵌套)
				detail.gesture && detail.gesture.preventDefault();
			}
			if (isReturn) { //禁止非法方向滚动
				return;
			}
			if (!this.moved) {
				$.trigger(this.scroller, 'scrollstart', this);
			} else {
				e.stopPropagation(); //move期间阻止冒泡(scroll嵌套)
			}
			var deltaX = 0;
			var deltaY = 0;
			if (!this.moved) { //start
				deltaX = detail.deltaX;
				deltaY = detail.deltaY;
			} else { //move
				deltaX = detail.deltaX - $.gestures.session.prevTouch.deltaX;
				deltaY = detail.deltaY - $.gestures.session.prevTouch.deltaY;
			}
			var absDeltaX = Math.abs(detail.deltaX);
			var absDeltaY = Math.abs(detail.deltaY);
			if (absDeltaX > absDeltaY + this.options.directionLockThreshold) {
				deltaY = 0;
			} else if (absDeltaY >= absDeltaX + this.options.directionLockThreshold) {
				deltaX = 0;
			}

			deltaX = this.hasHorizontalScroll ? deltaX : 0;
			deltaY = this.hasVerticalScroll ? deltaY : 0;
			var newX = this.x + deltaX;
			var newY = this.y + deltaY;
			// Slow down if outside of the boundaries
			if (newX > 0 || newX < this.maxScrollX) {
				newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
			}
			if (newY > 0 || newY < this.maxScrollY) {
				newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
			}

			if (!this.requestAnimationFrame) {
				this._updateTranslate();
			}

			this.moved = true;
			this.x = newX;
			this.y = newY;
			$.trigger(this.scroller, 'scroll', this);
		},
		_flick: function(e) {
			//			if (!this.moved || this.needReset) {
			//				return;
			//			}
			if (!this.moved) {
				return;
			}
			e.stopPropagation();
			var detail = e.detail;
			this._clearRequestAnimationFrame();
			if (e.type === 'dragend' && detail.flick) { //dragend
				return;
			}

			var newX = Math.round(this.x);
			var newY = Math.round(this.y);

			this.isInTransition = false;
			// reset if we are outside of the boundaries
			if (this.resetPosition(this.options.bounceTime)) {
				return;
			}

			this.scrollTo(newX, newY); // ensures that the last position is rounded

			if (e.type === 'dragend') { //dragend
				$.trigger(this.scroller, 'scrollend', this);
				return;
			}
			var time = 0;
			var easing = '';
			// start momentum animation if needed
			if (this.options.momentum && detail.flickTime < 300) {
				momentumX = this.hasHorizontalScroll ? this._momentum(this.x, detail.flickDistanceX, detail.flickTime, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : {
					destination: newX,
					duration: 0
				};
				momentumY = this.hasVerticalScroll ? this._momentum(this.y, detail.flickDistanceY, detail.flickTime, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : {
					destination: newY,
					duration: 0
				};
				newX = momentumX.destination;
				newY = momentumY.destination;
				time = Math.max(momentumX.duration, momentumY.duration);
				this.isInTransition = true;
			}

			if (newX != this.x || newY != this.y) {
				if (newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY) {
					easing = ease.quadratic;
				}
				this.scrollTo(newX, newY, time, easing);
				return;
			}

			$.trigger(this.scroller, 'scrollend', this);
			//			e.stopPropagation();
		},
		_end: function(e) {
			this.needReset = false;
			if ((!this.moved && this.needReset) || e.type === 'touchcancel') {
				this.resetPosition();
			}
		},
		_transitionEnd: function(e) {
			if (e.target != this.scroller || !this.isInTransition) {
				return;
			}
			this._transitionTime();
			if (!this.resetPosition(this.options.bounceTime)) {
				this.isInTransition = false;
				$.trigger(this.scroller, 'scrollend', this);
			}
		},
		_scrollend: function(e) {
			if (Math.abs(this.y) > 0 && this.y <= this.maxScrollY) {
				$.trigger(this.scroller, 'scrollbottom', this);
			}
		},
		_resize: function() {
			var that = this;
			clearTimeout(that.resizeTimeout);
			that.resizeTimeout = setTimeout(function() {
				that.refresh();
			}, that.options.resizePolling);
		},
		_transitionTime: function(time) {
			time = time || 0;
			this.scrollerStyle['webkitTransitionDuration'] = time + 'ms';
			if (this.parallaxElement && this.options.scrollY) { //目前仅支持竖向视差效果
				this.parallaxStyle['webkitTransitionDuration'] = time + 'ms';
			}
			if (this.options.fixedBadAndorid && !time && $.os.isBadAndroid) {
				this.scrollerStyle['webkitTransitionDuration'] = '0.001s';
				if (this.parallaxElement && this.options.scrollY) { //目前仅支持竖向视差效果
					this.parallaxStyle['webkitTransitionDuration'] = '0.001s';
				}
			}
			if (this.indicators) {
				for (var i = this.indicators.length; i--;) {
					this.indicators[i].transitionTime(time);
				}
			}
		},
		_transitionTimingFunction: function(easing) {
			this.scrollerStyle['webkitTransitionTimingFunction'] = easing;
			if (this.parallaxElement && this.options.scrollY) { //目前仅支持竖向视差效果
				this.parallaxStyle['webkitTransitionDuration'] = easing;
			}
			if (this.indicators) {
				for (var i = this.indicators.length; i--;) {
					this.indicators[i].transitionTimingFunction(easing);
				}
			}
		},
		_translate: function(x, y) {
			this.x = x;
			this.y = y;
		},
		_clearRequestAnimationFrame: function() {
			if (this.requestAnimationFrame) {
				cancelAnimationFrame(this.requestAnimationFrame);
				this.requestAnimationFrame = null;
			}
		},
		_updateTranslate: function() {
			var self = this;
			if (self.x !== self.lastX || self.y !== self.lastY) {
				self.setTranslate(self.x, self.y);
			}
			self.requestAnimationFrame = requestAnimationFrame(function() {
				self._updateTranslate();
			});
		},
		_createScrollBar: function(clazz) {
			var scrollbar = document.createElement('div');
			var indicator = document.createElement('div');
			scrollbar.className = CLASS_SCROLLBAR + ' ' + clazz;
			indicator.className = CLASS_INDICATOR;
			scrollbar.appendChild(indicator);
			if (clazz === CLASS_SCROLLBAR_VERTICAL) {
				this.scrollbarY = scrollbar;
				this.scrollbarIndicatorY = indicator;
			} else if (clazz === CLASS_SCROLLBAR_HORIZONTAL) {
				this.scrollbarX = scrollbar;
				this.scrollbarIndicatorX = indicator;
			}
			this.wrapper.appendChild(scrollbar);
			return scrollbar;
		},
		_preventDefaultException: function(el, exceptions) {
			for (var i in exceptions) {
				if (exceptions[i].test(el[i])) {
					return true;
				}
			}
			return false;
		},
		_reLayout: function() {
			if (!this.hasHorizontalScroll) {
				this.maxScrollX = 0;
				this.scrollerWidth = this.wrapperWidth;
			}

			if (!this.hasVerticalScroll) {
				this.maxScrollY = 0;
				this.scrollerHeight = this.wrapperHeight;
			}

			this.indicators.map(function(indicator) {
				indicator.refresh();
			});

			//以防slider类嵌套使用
			if (this.options.snap && typeof this.options.snap === 'string') {
				var items = this.scroller.querySelectorAll(this.options.snap);
				this.itemLength = 0;
				this.snaps = [];
				for (var i = 0, len = items.length; i < len; i++) {
					var item = items[i];
					if (item.parentNode === this.scroller) {
						this.itemLength++;
						this.snaps.push(item);
					}
				}
				this._initSnap(); //需要每次都_initSnap么。其实init的时候执行一次，后续resize的时候执行一次就行了吧.先这么做吧，如果影响性能，再调整
			}
		},
		_momentum: function(current, distance, time, lowerMargin, wrapperSize, deceleration) {
			var speed = parseFloat(Math.abs(distance) / time),
				destination,
				duration;

			deceleration = deceleration === undefined ? 0.0006 : deceleration;
			destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
			duration = speed / deceleration;
			if (destination < lowerMargin) {
				destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
				distance = Math.abs(destination - current);
				duration = distance / speed;
			} else if (destination > 0) {
				destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
				distance = Math.abs(current) + destination;
				duration = distance / speed;
			}

			return {
				destination: Math.round(destination),
				duration: duration
			};
		},
		_getTranslateStr: function(x, y) {
			if (this.options.hardwareAccelerated) {
				return 'translate3d(' + x + 'px,' + y + 'px,0px) ' + this.translateZ;
			}
			return 'translate(' + x + 'px,' + y + 'px) ';
		},
		//API
		setStopped: function(stopped) {
			this.stopped = !!stopped;
		},
		setTranslate: function(x, y) {
			this.x = x;
			this.y = y;
			this.scrollerStyle['webkitTransform'] = this._getTranslateStr(x, y);
			if (this.parallaxElement && this.options.scrollY) { //目前仅支持竖向视差效果
				var parallaxY = y * this.options.parallaxRatio;
				var scale = 1 + parallaxY / ((this.parallaxHeight - parallaxY) / 2);
				if (scale > 1) {
					this.parallaxImgStyle['opacity'] = 1 - parallaxY / 100 * this.options.parallaxRatio;
					this.parallaxStyle['webkitTransform'] = this._getTranslateStr(0, -parallaxY) + ' scale(' + scale + ',' + scale + ')';
				} else {
					this.parallaxImgStyle['opacity'] = 1;
					this.parallaxStyle['webkitTransform'] = this._getTranslateStr(0, -1) + ' scale(1,1)';
				}
			}
			if (this.indicators) {
				for (var i = this.indicators.length; i--;) {
					this.indicators[i].updatePosition();
				}
			}
			this.lastX = this.x;
			this.lastY = this.y;
			$.trigger(this.scroller, 'scroll', this);
		},
		reLayout: function() {
			this.wrapper.offsetHeight;

			var paddingLeft = parseFloat($.getStyles(this.wrapper, 'padding-left')) || 0;
			var paddingRight = parseFloat($.getStyles(this.wrapper, 'padding-right')) || 0;
			var paddingTop = parseFloat($.getStyles(this.wrapper, 'padding-top')) || 0;
			var paddingBottom = parseFloat($.getStyles(this.wrapper, 'padding-bottom')) || 0;

			var clientWidth = this.wrapper.clientWidth;
			var clientHeight = this.wrapper.clientHeight;

			this.scrollerWidth = this.scroller.offsetWidth;
			this.scrollerHeight = this.scroller.offsetHeight;

			this.wrapperWidth = clientWidth - paddingLeft - paddingRight;
			this.wrapperHeight = clientHeight - paddingTop - paddingBottom;

			this.maxScrollX = Math.min(this.wrapperWidth - this.scrollerWidth, 0);
			this.maxScrollY = Math.min(this.wrapperHeight - this.scrollerHeight, 0);
			this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0;
			this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0;
			this._reLayout();
		},
		resetPosition: function(time) {
			var x = this.x,
				y = this.y;

			time = time || 0;
			if (!this.hasHorizontalScroll || this.x > 0) {
				x = 0;
			} else if (this.x < this.maxScrollX) {
				x = this.maxScrollX;
			}

			if (!this.hasVerticalScroll || this.y > 0) {
				y = 0;
			} else if (this.y < this.maxScrollY) {
				y = this.maxScrollY;
			}

			if (x == this.x && y == this.y) {
				return false;
			}
			this.scrollTo(x, y, time, this.options.bounceEasing);

			return true;
		},
		refresh: function() {
			this.reLayout();
			$.trigger(this.scroller, 'refresh', this);
			this.resetPosition();
		},
		scrollTo: function(x, y, time, easing) {
			var easing = easing || ease.circular;
			this.isInTransition = time > 0 && (this.lastX != x || this.lastY != y);
			if (this.isInTransition) {
				this._clearRequestAnimationFrame();
				this._transitionTimingFunction(easing.style);
				this._transitionTime(time);
				this.setTranslate(x, y);
			} else {
				this.setTranslate(x, y);
			}

		},
		scrollToBottom: function(time, easing) {
			time = time || this.options.bounceTime;
			this.scrollTo(0, this.maxScrollY, time, easing);
		},
		gotoPage: function(index) {
			this._gotoPage(index);
		},
		destory: function() {
			this._initEvent(true); //detach
			delete $.data[this.wrapper.getAttribute('data-scroll')];
			this.wrapper.setAttribute('data-scroll', '');
		}
	});
	//Indicator
	var Indicator = function(scroller, options) {
		this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
		this.wrapperStyle = this.wrapper.style;
		this.indicator = this.wrapper.children[0];
		this.indicatorStyle = this.indicator.style;
		this.scroller = scroller;

		this.options = $.extend({
			listenX: true,
			listenY: true,
			fade: false,
			speedRatioX: 0,
			speedRatioY: 0
		}, options);


		this.sizeRatioX = 1;
		this.sizeRatioY = 1;
		this.maxPosX = 0;
		this.maxPosY = 0;

		if (this.options.fade) {
			this.wrapperStyle['webkitTransform'] = this.scroller.translateZ;
			this.wrapperStyle['webkitTransitionDuration'] = this.options.fixedBadAndorid && $.os.isBadAndroid ? '0.001s' : '0ms';
			this.wrapperStyle.opacity = '0';
		}
	}
	Indicator.prototype = {
		handleEvent: function(e) {

		},
		transitionTime: function(time) {
			time = time || 0;
			this.indicatorStyle['webkitTransitionDuration'] = time + 'ms';
			if (this.scroller.options.fixedBadAndorid && !time && $.os.isBadAndroid) {
				this.indicatorStyle['webkitTransitionDuration'] = '0.001s';
			}
		},
		transitionTimingFunction: function(easing) {
			this.indicatorStyle['webkitTransitionTimingFunction'] = easing;
		},
		refresh: function() {
			this.transitionTime();

			if (this.options.listenX && !this.options.listenY) {
				this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
			} else if (this.options.listenY && !this.options.listenX) {
				this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
			} else {
				this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
			}

			this.wrapper.offsetHeight; // force refresh

			if (this.options.listenX) {
				this.wrapperWidth = this.wrapper.clientWidth;
				this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
				this.indicatorStyle.width = this.indicatorWidth + 'px';

				this.maxPosX = this.wrapperWidth - this.indicatorWidth;

				this.minBoundaryX = 0;
				this.maxBoundaryX = this.maxPosX;

				this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));
			}

			if (this.options.listenY) {
				this.wrapperHeight = this.wrapper.clientHeight;
				this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
				this.indicatorStyle.height = this.indicatorHeight + 'px';

				this.maxPosY = this.wrapperHeight - this.indicatorHeight;

				this.minBoundaryY = 0;
				this.maxBoundaryY = this.maxPosY;

				this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
			}

			this.updatePosition();
		},

		updatePosition: function() {
			var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
				y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

			if (x < this.minBoundaryX) {
				this.width = Math.max(this.indicatorWidth + x, 8);
				this.indicatorStyle.width = this.width + 'px';
				x = this.minBoundaryX;
			} else if (x > this.maxBoundaryX) {
				this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
				this.indicatorStyle.width = this.width + 'px';
				x = this.maxPosX + this.indicatorWidth - this.width;
			} else if (this.width != this.indicatorWidth) {
				this.width = this.indicatorWidth;
				this.indicatorStyle.width = this.width + 'px';
			}

			if (y < this.minBoundaryY) {
				this.height = Math.max(this.indicatorHeight + y * 3, 8);
				this.indicatorStyle.height = this.height + 'px';
				y = this.minBoundaryY;
			} else if (y > this.maxBoundaryY) {
				this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
				this.indicatorStyle.height = this.height + 'px';
				y = this.maxPosY + this.indicatorHeight - this.height;
			} else if (this.height != this.indicatorHeight) {
				this.height = this.indicatorHeight;
				this.indicatorStyle.height = this.height + 'px';
			}

			this.x = x;
			this.y = y;

			this.indicatorStyle['webkitTransform'] = this.scroller._getTranslateStr(x, y);

		},
		fade: function(val, hold) {
			if (hold && !this.visible) {
				return;
			}

			clearTimeout(this.fadeTimeout);
			this.fadeTimeout = null;

			var time = val ? 250 : 500,
				delay = val ? 0 : 300;

			val = val ? '1' : '0';

			this.wrapperStyle['webkitTransitionDuration'] = time + 'ms';

			this.fadeTimeout = setTimeout((function(val) {
				this.wrapperStyle.opacity = val;
				this.visible = +val;
			}).bind(this, val), delay);
		}
	};

	$.Scroll = Scroll;

	$.fn.scroll = function(options) {
		var scrollApis = [];
		this.each(function() {
			var scrollApi = null;
			var self = this;
			var id = self.getAttribute('data-scroll');
			if (!id) {
				id = ++$.uuid;
				var _options = $.extend({}, options);
				if (self.classList.contains('mui-segmented-control')) {
					_options = $.extend(_options, {
						scrollY: false,
						scrollX: true,
						indicators: false,
						snap: '.mui-control-item'
					});
				}
				$.data[id] = scrollApi = new Scroll(self, _options);
				self.setAttribute('data-scroll', id);
			} else {
				scrollApi = $.data[id];
			}
			scrollApis.push(scrollApi);
		});
		return scrollApis.length === 1 ? scrollApis[0] : scrollApis;
	};
})(Eui, window, document);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/eui.class.scroll.pullrefresh.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, document, undefined) {

	var CLASS_VISIBILITY = 'mui-visibility';
	var CLASS_HIDDEN = 'mui-hidden';

	var PullRefresh = $.Scroll.extend($.extend({
		handleEvent: function(e) {
			this._super(e);
			if (e.type === 'scrollbottom') {
				if (e.target === this.scroller) {
					this._scrollbottom();
				}
			}
		},
		_scrollbottom: function() {
			if (!this.pulldown && !this.loading) {
				this.pulldown = false;
				this._initPullupRefresh();
				this.pullupLoading();
			}
		},
		_start: function(e) {
			if (!this.loading) {
				this.pulldown = this.pullPocket = this.pullCaption = this.pullLoading = false
			}
			this._super(e);
		},
		_drag: function(e) {
			this._super(e);
			if (!this.pulldown && !this.loading && this.topPocket && e.detail.direction === 'down' && this.y >= 0) {
				this._initPulldownRefresh();
			}
			if (this.pulldown) {
				this._setCaption(this.y > this.options.down.height ? this.options.down.contentover : this.options.down.contentdown);
			}
		},

		_reLayout: function() {
			this.hasVerticalScroll = true;
			this._super();
		},
		//API
		resetPosition: function(time) {
			if (this.pulldown) {
				if (this.y >= this.options.down.height) {
					this.pulldownLoading(undefined, time || 0);
					return true;
				} else {
					!this.loading && this.topPocket.classList.remove(CLASS_VISIBILITY);
				}
			}
			return this._super(time);
		},
		pulldownLoading: function(y, time) {
			typeof y === 'undefined' && (y = this.options.down.height); //默认高度
			this.scrollTo(0, y, time, this.options.bounceEasing);
			if (this.loading) {
				return;
			}
			//			if (!this.pulldown) {
			this._initPulldownRefresh();
			//			}
			this._setCaption(this.options.down.contentrefresh);
			this.loading = true;
			this.indicators.map(function(indicator) {
				indicator.fade(0);
			});
			var callback = this.options.down.callback;
			callback && callback.call(this);
		},
		endPulldownToRefresh: function() {
			var self = this;
			if (self.topPocket && self.loading && this.pulldown) {
				self.scrollTo(0, 0, self.options.bounceTime, self.options.bounceEasing);
				self.loading = false;
				self._setCaption(self.options.down.contentdown, true);
				setTimeout(function() {
					self.loading || self.topPocket.classList.remove(CLASS_VISIBILITY);
				}, 350);
			}
		},
		pullupLoading: function(callback, x, time) {
			x = x || 0;
			this.scrollTo(x, this.maxScrollY, time, this.options.bounceEasing);
			if (this.loading) {
				return;
			}
			this._initPullupRefresh();
			this._setCaption(this.options.up.contentrefresh);
			this.indicators.map(function(indicator) {
				indicator.fade(0);
			});
			this.loading = true;
			callback = callback || this.options.up.callback;
			callback && callback.call(this);
		},
		endPullupToRefresh: function(finished) {
			var self = this;
			if (self.bottomPocket) {
				self.loading = false;
				if (finished) {
					this.finished = true;
					self._setCaption(self.options.up.contentnomore);
					//					self.bottomPocket.classList.remove(CLASS_VISIBILITY);
					//					self.bottomPocket.classList.add(CLASS_HIDDEN);
					self.wrapper.removeEventListener('scrollbottom', self);
				} else {
					self._setCaption(self.options.up.contentdown);
					self.loading || self.bottomPocket.classList.remove(CLASS_VISIBILITY);
				}
			}
		},
		refresh: function(isReset) {
			if (isReset && this.finished) {
				this._initPullupRefresh();
				this.bottomPocket.classList.remove(CLASS_HIDDEN);
				this._setCaption(this.options.up.contentdown);
				this.wrapper.addEventListener('scrollbottom', this);
				this.finished = false;
			}
			this._super();
		}
	}, $.PullRefresh));
	$.fn.pullRefresh = function(options) {
		if (this.length === 1) {
			var self = this[0];
			var pullRefreshApi = null;
			options = options || {};
			var id = self.getAttribute('data-pullrefresh');
			if (!id) {
				id = ++$.uuid;
				$.data[id] = pullRefreshApi = new PullRefresh(self, options);
				self.setAttribute('data-pullrefresh', id);
			} else {
				pullRefreshApi = $.data[id];
			}
			if (options.down && options.down.auto) { //如果设置了auto，则自动下拉一次
				pullRefreshApi.pulldownLoading(options.down.autoY);
			} else if (options.up && options.up.auto) { //如果设置了auto，则自动上拉一次
				pullRefreshApi.pullupLoading();
			}
			//暂不提供这种调用方式吧			
			//			if (typeof options === 'string') {
			//				var methodValue = pullRefreshApi[options].apply(pullRefreshApi, $.slice.call(arguments, 1));
			//				if (methodValue !== undefined) {
			//					return methodValue;
			//				}
			//			}
			return pullRefreshApi;
		}
	};
})(Eui, window, document);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/eui.class.scroll.sliders.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * @desc 轮播组件是eui提供的一个核心组件，在该核心组件基础上，衍生出了图片轮播、可拖动式图文表格、可拖动式选项卡、
 * 左右滑动9宫格等组件，这些组件有较多共同点。首先，Dom构造基本相同，如下：
 *
 *	   <div class="mui-slider">
 *		 <div class="mui-slider-group">
 *		   <!--第一个内容区容器-->
 *		  <div class="mui-slider-item">
 *		   <!-- 具体内容 -->
 *		  </div>
 *		   <!--第二个内容区-->
 *		  <div class="mui-slider-item">
 *		   <!-- 具体内容 -->
 *		  </div>
 *		 </div>
 *		</div>
 *
 * 当拖动切换显示内容时，会触发slide事件，通过该事件的`detail.slideNumber`参数可以获得当前显示项的索引（第一项索引为0，第二项为1，以此类推），利用该事件，可在显示内容切换时，动态处理一些业务逻辑。
 *
 * 如下为一个可拖动式选项卡示例，为提高页面加载速度，页面加载时，仅显示第一个选项卡的内容，第二、第三选项卡内容为空。
 *
 * 当切换到第二、第三个选项卡时，再动态获取相应内容进行显示：
 *
 *	  var item2Show = false,item3Show = false;//子选项卡是否显示标志
      document.querySelector('.mui-slider').addEventListener('slide', function(event) {
		  if (event.detail.slideNumber === 1&&!item2Show) {
			//切换到第二个选项卡
			//根据具体业务，动态获得第二个选项卡内容；
			var content = ....
			//显示内容
			document.getElementById("item2").innerHTML = content;
			//改变标志位，下次直接显示
			item2Show = true;
		  } else if (event.detail.slideNumber === 2&&!item3Show) {
			//切换到第三个选项卡
			//根据具体业务，动态获得第三个选项卡内容；
			var content = ....
			//显示内容
			document.getElementById("item3").innerHTML = content;
			//改变标志位，下次直接显示
			item3Show = true;
		  }
		});
 *
 * 图片轮播、可拖动式图文表格等均可按照同样方式监听内容变化，比如我们可以在图片轮播界面显示当前正在看的是第几张图片：
 *
 * 	  document.querySelector('.mui-slider').addEventListener('slide', function(event) {
	        //注意slideNumber是从0开始的；
	        document.getElementById("info").innerText = "你正在看第"+(event.detail.slideNumber+1)+"张图片";
		  });
 *
 * @class Slider
 * @extends Scroll
 * @param {Object} options
 * @param {Number} [options.fingers=1]
 * @param {Number} [options.interval=0] 设置为0，则不定时轮播
 * @param {Boolean} [options.scrollY=false]
 * @param {Boolean} [options.scrollX=true]
 * @param {Boolean} [options.indicators=false]
 * @param {Number} [options.bounceTime=200]
 * @param {Boolean} [options.startX=false]
 * @param {String} [options.snap='mui-slider-item']
 */
(function($, window) {
	var CLASS_SLIDER = 'mui-slider';
	var CLASS_SLIDER_GROUP = 'mui-slider-group';
	var CLASS_SLIDER_LOOP = 'mui-slider-loop';
	var CLASS_SLIDER_INDICATOR = 'mui-slider-indicator';
	var CLASS_ACTION_PREVIOUS = 'mui-action-previous';
	var CLASS_ACTION_NEXT = 'mui-action-next';
	var CLASS_SLIDER_ITEM = 'mui-slider-item';

	var CLASS_ACTIVE = 'mui-active';

	var SELECTOR_SLIDER_ITEM = '.' + CLASS_SLIDER_ITEM;
	var SELECTOR_SLIDER_INDICATOR = '.' + CLASS_SLIDER_INDICATOR;
	var SELECTOR_SLIDER_PROGRESS_BAR = '.mui-slider-progress-bar';

	var Slider = $.Slider = $.Scroll.extend({
		init: function(element, options) {
			this._super(element, $.extend(true, {
				fingers: 1,
				interval: 0, //设置为0，则不定时轮播
				scrollY: false,
				scrollX: true,
				indicators: false,
				bounceTime: 200,
				startX: false,
				snap: SELECTOR_SLIDER_ITEM
			}, options));
			if (this.options.startX) {
				//				$.trigger(this.wrapper, 'scrollend', this);
			}
		},
		_init: function() {
			var groups = this.wrapper.querySelectorAll('.' + CLASS_SLIDER_GROUP);
			for (var i = 0, len = groups.length; i < len; i++) {
				if (groups[i].parentNode === this.wrapper) {
					this.scroller = groups[i];
					break;
				}
			}
			if (this.scroller) {
				this.scrollerStyle = this.scroller.style;
				this.progressBar = this.wrapper.querySelector(SELECTOR_SLIDER_PROGRESS_BAR);
				if (this.progressBar) {
					this.progressBarWidth = this.progressBar.offsetWidth;
					this.progressBarStyle = this.progressBar.style;
				}
				//忘记这个代码是干什么的了？
				//				this.x = this._getScroll();
				//				if (this.options.startX === false) {
				//					this.options.startX = this.x;
				//				}
				//根据active修正startX

				this._super();
				this._initTimer();
			}
		},
		_triggerSlide: function() {
			var self = this;
			self.isInTransition = false;
			var page = self.currentPage;
			self.slideNumber = self._fixedSlideNumber();
			if (self.loop) {
				if (self.slideNumber === 0) {
					self.setTranslate(self.pages[1][0].x, 0);
				} else if (self.slideNumber === self.itemLength - 3) {
					self.setTranslate(self.pages[self.itemLength - 2][0].x, 0);
				}
			}
			if (self.lastSlideNumber != self.slideNumber) {
				self.lastSlideNumber = self.slideNumber;
				self.lastPage = self.currentPage;
				$.trigger(self.wrapper, 'slide', {
					slideNumber: self.slideNumber
				});
			}
			self._initTimer();
		},
		_handleSlide: function(e) {
			var self = this;
			if (e.target !== self.wrapper) {
				return;
			}
			var detail = e.detail;
			detail.slideNumber = detail.slideNumber || 0;
			var items = self.scroller.querySelectorAll(SELECTOR_SLIDER_ITEM);
			var _slideNumber = detail.slideNumber;
			if (self.loop) {
				_slideNumber += 1;
			}
			if (!self.wrapper.classList.contains('mui-segmented-control')) {
				for (var i = 0, len = items.length; i < len; i++) {
					var item = items[i];
					if (item.parentNode === self.scroller) {
						if (i === _slideNumber) {
							item.classList.add(CLASS_ACTIVE);
						} else {
							item.classList.remove(CLASS_ACTIVE);
						}
					}
				}
			}
			var indicatorWrap = self.wrapper.querySelector('.mui-slider-indicator');
			if (indicatorWrap) {
				if (indicatorWrap.getAttribute('data-scroll')) { //scroll
					$(indicatorWrap).scroll().gotoPage(detail.slideNumber);
				}
				var indicators = indicatorWrap.querySelectorAll('.mui-indicator');
				if (indicators.length > 0) { //图片轮播
					for (var i = 0, len = indicators.length; i < len; i++) {
						indicators[i].classList[i === detail.slideNumber ? 'add' : 'remove'](CLASS_ACTIVE);
					}
				} else {
					var number = indicatorWrap.querySelector('.mui-number span');
					if (number) { //图文表格
						number.innerText = (detail.slideNumber + 1);
					} else { //segmented controls
						var controlItems = self.wrapper.querySelectorAll('.mui-control-item');
						for (var i = 0, len = controlItems.length; i < len; i++) {
							controlItems[i].classList[i === detail.slideNumber ? 'add' : 'remove'](CLASS_ACTIVE);
						}
					}
				}
			}
			e.stopPropagation();
		},
		_handleTabShow: function(e) {
			var self = this;
			self.gotoItem((e.detail.tabNumber || 0), self.options.bounceTime);
		},
		_handleIndicatorTap: function(event) {
			var self = this;
			var target = event.target;
			if (target.classList.contains(CLASS_ACTION_PREVIOUS) || target.classList.contains(CLASS_ACTION_NEXT)) {
				self[target.classList.contains(CLASS_ACTION_PREVIOUS) ? 'prevItem' : 'nextItem']();
				event.stopPropagation();
			}
		},
		_initEvent: function(detach) {
			var self = this;
			self._super(detach);
			var action = detach ? 'removeEventListener' : 'addEventListener';
			self.wrapper[action]('swiperight', $.stopPropagation);
			self.wrapper[action]('scrollend', self._triggerSlide.bind(this));

			self.wrapper[action]('slide', self._handleSlide.bind(this));

			self.wrapper[action]($.eventName('shown', 'tab'), self._handleTabShow.bind(this));
			//indicator
			var indicator = self.wrapper.querySelector(SELECTOR_SLIDER_INDICATOR);
			if (indicator) {
				indicator[action]('tap', self._handleIndicatorTap.bind(this));
			}
		},
		_drag: function(e) {
			this._super(e);
			var direction = e.detail.direction;
			if (direction === 'left' || direction === 'right') {
				//拖拽期间取消定时
				var slidershowTimer = this.wrapper.getAttribute('data-slidershowTimer');
				slidershowTimer && window.clearTimeout(slidershowTimer);

				e.stopPropagation();
			}
		},
		_initTimer: function() {
			var self = this;
			var slider = self.wrapper;
			var interval = self.options.interval;
			var slidershowTimer = slider.getAttribute('data-slidershowTimer');
			slidershowTimer && window.clearTimeout(slidershowTimer);
			if (interval) {
				slidershowTimer = window.setTimeout(function() {
					if (!slider) {
						return;
					}
					//仅slider显示状态进行自动轮播
					if (!!(slider.offsetWidth || slider.offsetHeight)) {
						self.nextItem(true);
						//下一个
					}
					self._initTimer();
				}, interval);
				slider.setAttribute('data-slidershowTimer', slidershowTimer);
			}
		},

		_fixedSlideNumber: function(page) {
			page = page || this.currentPage;
			var slideNumber = page.pageX;
			if (this.loop) {
				if (page.pageX === 0) {
					slideNumber = this.itemLength - 3;
				} else if (page.pageX === (this.itemLength - 1)) {
					slideNumber = 0;
				} else {
					slideNumber = page.pageX - 1;
				}
			}
			return slideNumber;
		},
		_reLayout: function() {
			this.hasHorizontalScroll = true;
			this.loop = this.scroller.classList.contains(CLASS_SLIDER_LOOP);
			this._super();
		},
		_getScroll: function() {
			var result = $.parseTranslateMatrix($.getStyles(this.scroller, 'webkitTransform'));
			return result ? result.x : 0;
		},
		_transitionEnd: function(e) {
			if (e.target !== this.scroller || !this.isInTransition) {
				return;
			}
			this._transitionTime();
			this.isInTransition = false;
			$.trigger(this.wrapper, 'scrollend', this);
		},
		_flick: function(e) {
			if (!this.moved) { //无moved
				return;
			}
			var detail = e.detail;
			var direction = detail.direction;
			this._clearRequestAnimationFrame();
			this.isInTransition = true;
			//			if (direction === 'up' || direction === 'down') {
			//				this.resetPosition(this.options.bounceTime);
			//				return;
			//			}
			if (e.type === 'flick') {
				if (detail.deltaTime < 200) { //flick，太容易触发，额外校验一下deltaTime
					this.x = this._getPage((this.slideNumber + (direction === 'right' ? -1 : 1)), true).x;
				}
				this.resetPosition(this.options.bounceTime);
			} else if (e.type === 'dragend' && !detail.flick) {
				this.resetPosition(this.options.bounceTime);
			}
			e.stopPropagation();
		},
		_initSnap: function() {
			this.scrollerWidth = this.itemLength * this.scrollerWidth;
			this.maxScrollX = Math.min(this.wrapperWidth - this.scrollerWidth, 0);
			this._super();
			if (!this.currentPage.x) {
				//当slider处于隐藏状态时，导致snap计算是错误的，临时先这么判断一下，后续要考虑解决所有scroll在隐藏状态下初始化属性不正确的问题
				var currentPage = this.pages[this.loop ? 1 : 0];
				currentPage = currentPage || this.pages[0];
				if (!currentPage) {
					return;
				}
				this.currentPage = currentPage[0];
				this.slideNumber = 0;
				this.lastSlideNumber = typeof this.lastSlideNumber === 'undefined' ? 0 : this.lastSlideNumber;
			} else {
				this.slideNumber = this._fixedSlideNumber();
				this.lastSlideNumber = typeof this.lastSlideNumber === 'undefined' ? this.slideNumber : this.lastSlideNumber;
			}
			this.options.startX = this.currentPage.x || 0;
		},
		_getSnapX: function(offsetLeft) {
			return Math.max(-offsetLeft, this.maxScrollX);
		},
		_getPage: function(slideNumber, isFlick) {
			if (this.loop) {
				if (slideNumber > (this.itemLength - (isFlick ? 2 : 3))) {
					slideNumber = 1;
					time = 0;
				} else if (slideNumber < (isFlick ? -1 : 0)) {
					slideNumber = this.itemLength - 2;
					time = 0;
				} else {
					slideNumber += 1;
				}
			} else {
				if (!isFlick) {
					if (slideNumber > (this.itemLength - 1)) {
						slideNumber = 0;
						time = 0;
					} else if (slideNumber < 0) {
						slideNumber = this.itemLength - 1;
						time = 0;
					}
				}
				slideNumber = Math.min(Math.max(0, slideNumber), this.itemLength - 1);
			}
			return this.pages[slideNumber][0];
		},
		_gotoItem: function(slideNumber, time) {
			this.currentPage = this._getPage(slideNumber, true); //此处传true。可保证程序切换时，动画与人手操作一致(第一张，最后一张的切换动画)
			this.scrollTo(this.currentPage.x, 0, time, this.options.bounceEasing);
			if (time === 0) {
				$.trigger(this.wrapper, 'scrollend', this);
			}
		},
		setTranslate: function(x, y) {
			this._super(x, y);
			var progressBar = this.progressBar;
			if (progressBar) {
				this.progressBarStyle.webkitTransform = this._getTranslateStr((-x * (this.progressBarWidth / this.wrapperWidth)), 0);
			}
		},
		resetPosition: function(time) {
			time = time || 0;
			if (this.x > 0) {
				this.x = 0;
			} else if (this.x < this.maxScrollX) {
				this.x = this.maxScrollX;
			}
			this.currentPage = this._nearestSnap(this.x);
			this.scrollTo(this.currentPage.x, 0, time);
			return true;
		},

		/**
		 * 跳转到指定项.
		 *
		 * @memberof Slider
		 * @param {Number} slideNumber 滑块索引，从`0`开始
		 * @param {Number} [time=200] 默认值与`bounceTime`相等
		 */
		gotoItem: function(slideNumber, time) {
			this._gotoItem(slideNumber, typeof time === 'undefined' ? this.options.bounceTime : time);
		},

		/**
		 * 跳转到下一个选项.
		 * @memberof Slider
		 */
		nextItem: function() {
			this._gotoItem(this.slideNumber + 1, this.options.bounceTime);
		},

		/**
		 * 跳转到上个选项.
		 * @memberof Slider
		 */
		prevItem: function() {
			this._gotoItem(this.slideNumber - 1, this.options.bounceTime);
		},

		/**
		 * 获取当前选项的索引.
		 * @memberof Slider
		 */
		getSlideNumber: function() {
			return this.slideNumber || 0;
		},

		/**
		 * 重新初始化组件.
		 * @memberof Slider
		 * @param {Object} [options] 具体配置项查看初始化参数.
		 */
		refresh: function(options) {
			if (options) {
				$.extend(this.options, options);
				this._super();
				this.nextItem();
			} else {
				this._super();
			}
		},

		/**
		 * 销毁组件.
		 * @memberof Slider
		 */
		destory: function() {
			this._initEvent(true); //detach
			delete $.data[this.wrapper.getAttribute('data-slider')];
			this.wrapper.setAttribute('data-slider', '');
		}
	});

	/**
	 *
	 * 图片轮播继承自slide插件，因此其DOM结构、事件均和slide插件相同；
	 *
	 * ### DOM结构 ###
	 *
	 * 默认不支持循环播放，DOM结构如下：
	 *
	 *	  <div class="mui-slider">
	 *		<div class="mui-slider-group">
	 *		 <div class="mui-slider-item"><a href="#"><img src="1.jpg" /></a></div>
	 *		 <div class="mui-slider-item"><a href="#"><img src="2.jpg" /></a></div>
	 *		 <div class="mui-slider-item"><a href="#"><img src="3.jpg" /></a></div>
	 *		 <div class="mui-slider-item"><a href="#"><img src="4.jpg" /></a></div>
	 *		</div>
	 *	  </div>
	 *
	 * 假设当前图片轮播中有1、2、3、4四张图片，从第1张图片起，依次向左滑动切换图片，当切换到第4张图片时，继续向左滑动，接下来会有两种效果：
	 *
	 * - `支持循环` : 左滑，直接切换到第1张图片；
	 * - `不支持循环` : 左滑，无反应，继续显示第4张图片，用户若要显示第1张图片，必须连续向右滑动切换到第1张图片；
	 *
	 * 当显示第1张图片时，继续右滑是否显示第4张图片，是同样问题；这个问题的实现需要通过`.mui-slider-loop`类及DOM节点来控制；
	 *
	 * 若要支持循环，则需要在`.mui-slider-group`节点上增加`.mui-slider-loop`类，同时需要重复增加2张图片，图片顺序变为：4、1、2、3、4、1，代码示例如下：
	 *
	 * 	   <div class="mui-slider">
	 *		 <div class="mui-slider-group mui-slider-loop">
	 *		  <!--支持循环，需要重复图片节点-->
	 *		  <div class="mui-slider-item mui-slider-item-duplicate"><a href="#"><img src="4.jpg" /></a></div>
	 *		  <div class="mui-slider-item"><a href="#"><img src="1.jpg" /></a></div>
	 *		  <div class="mui-slider-item"><a href="#"><img src="2.jpg" /></a></div>
	 *		  <div class="mui-slider-item"><a href="#"><img src="3.jpg" /></a></div>
	 *		  <div class="mui-slider-item"><a href="#"><img src="4.jpg" /></a></div>
	 *		  <!--支持循环，需要重复图片节点-->
	 *		 <div class="mui-slider-item mui-slider-item-duplicate"><a href="#"><img src="1.jpg" /></a></div>
	 *		 </div>
	 *	   </div>
	 *
	 * ### JS 方法 ###
	 *
	 * eui框架内置了图片轮播插件，通过该插件封装的JS API，用户可以设定是否自动轮播及轮播周期，如下为代码示例：
	 *
	 * 	  //获得slider插件对象
	 *	  var gallery = $('.mui-slider');
	 *	  gallery.slider({
	 *	  	interval:5000//自动轮播周期，若为0则不自动播放，默认为0；
	 *	  });
	 *
	 * 因此若希望图片轮播不要自动播放，而是用户手动滑动才切换，只需要通过如上方法，将`interval`参数设为0即可。
	 *
	 * 若要跳转到第x张图片，则可以使用图片轮播插件的`gotoItem`方法，例如：
	 *
	 *     //获得slider插件对象
	 *	   var gallery = $('.mui-slider');
	 *	   gallery.slider().gotoItem(index);//跳转到第index张图片，index从0开始；
	 *
	 * 注意：eui框架会默认初始化当前页面的图片轮播组件；若轮播组件内容为js动态生成时（比如通过ajax动态获取的营销信息），
	 * 则需要在动态DOM生成后，手动调用图片轮播的初始化方法；代码如下：
	 *
	 * 	   //获得slider插件对象
	 *     var gallery = $('.mui-slider');
	 *	   gallery.slider({
	 *	     interval:5000//自动轮播周期，若为0则不自动播放，默认为0；
	 *	   });
	 *
	 * @alias #slider
	 * @memberof $.fn
	 * @param {Object} options
	 * @param {Number} [options.fingers=1]
	 * @param {Number} [options.interval=0] 设置为0，则不定时轮播
	 * @param {Boolean} [options.scrollY=false]
	 * @param {Boolean} [options.scrollX=true]
	 * @param {Boolean} [options.indicators=false]
	 * @param {Number} [options.bounceTime=200]
	 * @param {Boolean} [options.startX=false]
	 * @param {String} [options.snap='mui-slider-item']
	 *
	 * @returns {Slider}
	 */
	$.fn.slider = function(options) {
		var slider = null;
		this.each(function() {
			var sliderElement = this;
			if (!this.classList.contains(CLASS_SLIDER)) {
				sliderElement = this.querySelector('.' + CLASS_SLIDER);
			}
			if (sliderElement && sliderElement.querySelector(SELECTOR_SLIDER_ITEM)) {
				var id = sliderElement.getAttribute('data-slider');
				if (!id) {
					id = ++$.uuid;
					$.data[id] = slider = new Slider(sliderElement, options);
					sliderElement.setAttribute('data-slider', id);
				} else {
					slider = $.data[id];
					if (slider && options) {
						slider.refresh(options);
					}
				}
			}
		});
		return slider;
	};

	$.ready(function() {
		//		setTimeout(function() {
		$('.mui-slider').slider();
		$('.mui-scroll-wrapper.mui-slider-indicator.mui-segmented-control').scroll({
			scrollY: false,
			scrollX: true,
			indicators: false,
			snap: '.mui-control-item'
		});
		//		}, 500); //临时处理slider宽度计算不正确的问题(初步确认是scrollbar导致的)

	});
})(Eui, window);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/pullrefresh.5+.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, document) {
	if (!($.os.plus && $.os.android)) { //仅在android的5+版本使用
		return;
	}
	var CLASS_PLUS_PULLREFRESH = 'mui-plus-pullrefresh';
	var CLASS_VISIBILITY = 'mui-visibility';
	var CLASS_HIDDEN = 'mui-hidden';
	var CLASS_BLOCK = 'mui-block';

	var CLASS_PULL_CAPTION = 'mui-pull-caption';
	var CLASS_PULL_CAPTION_DOWN = 'mui-pull-caption-down';
	var CLASS_PULL_CAPTION_REFRESH = 'mui-pull-caption-refresh';
	var CLASS_PULL_CAPTION_NOMORE = 'mui-pull-caption-nomore';

	var PlusPullRefresh = $.Class.extend({
		init: function(element, options) {
			this.element = element;
			this.options = options;
			this.wrapper = this.scroller = element;
			this._init();
			this._initPulldownRefreshEvent();
		},
		_init: function() {
			var self = this;
			//			document.addEventListener('plusscrollbottom', this);
			window.addEventListener('dragup', self);
			self.scrollInterval = window.setInterval(function() {
				if (self.isScroll && !self.loading) {
					if (window.pageYOffset + window.innerHeight + 10 >= document.documentElement.scrollHeight) {
						self.isScroll = false; //放在这里是因为快速滚动的话，有可能检测时，还没到底，所以只要有滚动，没到底之前一直检测高度变化
						if (self.bottomPocket) {
							self.pullupLoading();
						}
					}
				}
			}, 100);
		},
		_initPulldownRefreshEvent: function() {
			var self = this;
			if (self.topPocket && self.options.webviewId) {
				$.plusReady(function() {
					var webview = plus.webview.getWebviewById(self.options.webviewId);
					if (!webview) {
						return;
					}
					self.options.webview = webview;
					var downOptions = self.options.down;
					var height = downOptions.height;
					webview.addEventListener("dragBounce", function(e) {
						if (!self.pulldown) {
							self._initPulldownRefresh();
						} else {
							self.pullPocket.classList.add(CLASS_BLOCK);
						}
						switch (e.status) {
							case "beforeChangeOffset": //下拉可刷新状态
								self._setCaption(downOptions.contentdown);
								break;
							case "afterChangeOffset": //松开可刷新状态
								self._setCaption(downOptions.contentover);
								break;
							case "dragEndAfterChangeOffset": //正在刷新状态
								//执行下拉刷新所在webview的回调函数
								webview.evalJS("Eui&&$.options.pullRefresh.down.callback()");
								self._setCaption(downOptions.contentrefresh);
								break;
							default:
								break;
						}
					}, false);
					webview.setBounce({
						position: {
							top: height * 2 + 'px'
						},
						changeoffset: {
							top: height + 'px'
						}
					});
				});
			}
		},
		handleEvent: function(e) {
			var self = this;
			if (self.stopped) {
				return;
			}
			//5+的plusscrollbottom当页面内容较少时，不触发
			//			if (e.type === 'plusscrollbottom') {
			//				if (this.bottomPocket) {
			//					this.pullupLoading();
			//				}
			//			}
			self.isScroll = false;
			if (e.type === 'dragup') {
				self.isScroll = true;
				setTimeout(function() {
					self.isScroll = false;
				}, 1000);
			}
		}
	}).extend($.extend({
		setStopped: function(stopped) { //该方法是子页面调用的
			this.stopped = !!stopped;
			//TODO 此处需要设置当前webview的bounce为none,目前5+有BUG
			var webview = plus.webview.currentWebview();
			if (this.stopped) {
				webview.setStyle({
					bounce: 'none'
				});
				webview.setBounce({
					position: {
						top: 'none'
					}
				});
			} else {
				var height = this.options.down.height;
				webview.setStyle({
					bounce: 'vertical'
				});
				webview.setBounce({
					position: {
						top: height * 2 + 'px'
					},
					changeoffset: {
						top: height + 'px'
					}
				});
			}
		},
		pulldownLoading: function() { //该方法是子页面调用的
			var callback = $.options.pullRefresh.down.callback;
			callback && callback.call(this);
		},
		_pulldownLoading: function() { //该方法是子页面调用的
			var self = this;
			$.plusReady(function() {
				plus.webview.getWebviewById(self.options.webviewId).evalJS("Eui&&$.options.pullRefresh.down&&$.options.pullRefresh.down.callback()");
			});
		},
		endPulldownToRefresh: function() { //该方法是子页面调用的
			var webview = plus.webview.currentWebview();
			webview.parent().evalJS("Eui&&$(document.querySelector('.mui-content')).pullRefresh('" + JSON.stringify({
				webviewId: webview.id
			}) + "')._endPulldownToRefresh()");
		},
		_endPulldownToRefresh: function() { //该方法是父页面调用的
			var self = this;
			if (self.topPocket && self.options.webview) {
				self.options.webview.endPullToRefresh(); //下拉刷新所在webview回弹
				self.loading = false;
				self._setCaption(self.options.down.contentdown, true);
				setTimeout(function() {
					self.loading || self.topPocket.classList.remove(CLASS_BLOCK);
				}, 350);
			}
		},
		pullupLoading: function(callback) {
			var self = this;
			if (self.isLoading) return;
			self.isLoading = true;
			if (self.pulldown !== false) {
				self._initPullupRefresh();
			} else {
				this.pullPocket.classList.add(CLASS_BLOCK);
			}
			setTimeout(function() {
				self.pullLoading.classList.add(CLASS_VISIBILITY);
				self.pullLoading.classList.remove(CLASS_HIDDEN);
				self.pullCaption.innerHTML = ''; //修正5+里边第一次加载时，文字显示的bug(还会显示出来个“多”,猜测应该是渲染问题导致的)
				self.pullCaption.className = CLASS_PULL_CAPTION + ' ' + CLASS_PULL_CAPTION_REFRESH;
				self.pullCaption.innerHTML = self.options.up.contentrefresh;
				callback = callback || self.options.up.callback;
				callback && callback.call(self);
			}, 300);
		},
		endPullupToRefresh: function(finished) {
			var self = this;
			if (self.pullLoading) {
				self.pullLoading.classList.remove(CLASS_VISIBILITY);
				self.pullLoading.classList.add(CLASS_HIDDEN);
				self.isLoading = false;
				if (finished) {
					self.finished = true;
					self.pullCaption.className = CLASS_PULL_CAPTION + ' ' + CLASS_PULL_CAPTION_NOMORE;
					self.pullCaption.innerHTML = self.options.up.contentnomore;
					//					self.bottomPocket.classList.remove(CLASS_BLOCK);
					//					self.bottomPocket.classList.add(CLASS_HIDDEN);
					//					document.removeEventListener('plusscrollbottom', self);
					window.removeEventListener('dragup', self);
				} else { //初始化时隐藏，后续不再隐藏
					self.pullCaption.className = CLASS_PULL_CAPTION + ' ' + CLASS_PULL_CAPTION_DOWN;
					self.pullCaption.innerHTML = self.options.up.contentdown;
					//					setTimeout(function() {
					//						self.loading || self.bottomPocket.classList.remove(CLASS_BLOCK);
					//					}, 350);
				}
			}
		},
		disablePullupToRefresh: function() {
			this._initPullupRefresh();
			this.bottomPocket.className = 'mui-pull-bottom-pocket' + ' ' + CLASS_HIDDEN;
			window.removeEventListener('dragup', this);
		},
		enablePullupToRefresh: function() {
			this._initPullupRefresh();
			this.bottomPocket.classList.remove(CLASS_HIDDEN);
			this.pullCaption.className = CLASS_PULL_CAPTION + ' ' + CLASS_PULL_CAPTION_DOWN;
			this.pullCaption.innerHTML = this.options.up.contentdown;
			window.addEventListener('dragup', this);
		},
		scrollTo: function(x, y, time) {
			$.scrollTo(x, y, time);
		},
		refresh: function(isReset) {
			if (isReset && this.finished) {
				this.enablePullupToRefresh();
				this.finished = false;
			}
		}
	}, $.PullRefresh));

	//override h5 pullRefresh
	$.fn.pullRefresh = function(options) {
		var self;
		if (this.length === 0) {
			self = document.createElement('div');
			self.className = 'mui-content';
			document.body.appendChild(self);
		} else {
			self = this[0];
		}
		//一个父需要支持多个子下拉刷新
		options = options || {}
		if (typeof options === 'string') {
			options = $.parseJSON(options);
		};
		!options.webviewId && (options.webviewId = (plus.webview.currentWebview().id || plus.webview.currentWebview().getURL()));
		var pullRefreshApi = null;
		var attrWebviewId = options.webviewId && options.webviewId.replace(/\//g, "_"); //替换所有"/"
		var id = self.getAttribute('data-pullrefresh-plus-' + attrWebviewId);
		if (!id) { //避免重复初始化5+ pullrefresh
			id = ++$.uuid;
			self.setAttribute('data-pullrefresh-plus-' + attrWebviewId, id);
			document.body.classList.add(CLASS_PLUS_PULLREFRESH);
			$.data[id] = pullRefreshApi = new PlusPullRefresh(self, options);
		} else {
			pullRefreshApi = $.data[id];
		}
		if (options.down && options.down.auto) { //如果设置了auto，则自动下拉一次
			pullRefreshApi._pulldownLoading(); //parent webview
		} else if (options.up && options.up.auto) { //如果设置了auto，则自动上拉一次
			pullRefreshApi.pullupLoading();
		}
		return pullRefreshApi;
	};
})(Eui, document);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/eui.offcanvas.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, document, name) {
	var CLASS_OFF_CANVAS_LEFT = 'mui-off-canvas-left';
	var CLASS_OFF_CANVAS_RIGHT = 'mui-off-canvas-right';
	var CLASS_ACTION_BACKDROP = 'mui-off-canvas-backdrop';
	var CLASS_OFF_CANVAS_WRAP = 'mui-off-canvas-wrap';

	var CLASS_SLIDE_IN = 'mui-slide-in';
	var CLASS_ACTIVE = 'mui-active';


	var CLASS_TRANSITIONING = 'mui-transitioning';

	var SELECTOR_INNER_WRAP = '.mui-inner-wrap';


	var OffCanvas = $.Class.extend({
		init: function(element, options) {
			this.wrapper = this.element = element;
			this.scroller = this.wrapper.querySelector(SELECTOR_INNER_WRAP);
			this.classList = this.wrapper.classList;
			if (this.scroller) {
				this.options = $.extend(true, {
					dragThresholdX: 10,
					scale: 0.8,
					opacity: 0.1
				}, options);
				document.body.classList.add('mui-fullscreen'); //fullscreen
				this.refresh();
				this.initEvent();
			}
		},
		refresh: function(offCanvas) {
			//			offCanvas && !offCanvas.classList.contains(CLASS_ACTIVE) && this.classList.remove(CLASS_ACTIVE);
			this.slideIn = this.classList.contains(CLASS_SLIDE_IN);
			this.scalable = this.classList.contains('mui-scalable') && !this.slideIn;
			this.scroller = this.wrapper.querySelector(SELECTOR_INNER_WRAP);
			//			!offCanvas && this.scroller.classList.remove(CLASS_TRANSITIONING);
			//			!offCanvas && this.scroller.setAttribute('style', '');
			this.offCanvasLefts = this.wrapper.querySelectorAll('.' + CLASS_OFF_CANVAS_LEFT);
			this.offCanvasRights = this.wrapper.querySelectorAll('.' + CLASS_OFF_CANVAS_RIGHT);
			if (offCanvas) {
				if (offCanvas.classList.contains(CLASS_OFF_CANVAS_LEFT)) {
					this.offCanvasLeft = offCanvas;
				} else if (offCanvas.classList.contains(CLASS_OFF_CANVAS_RIGHT)) {
					this.offCanvasRight = offCanvas;
				}
			} else {
				this.offCanvasRight = this.wrapper.querySelector('.' + CLASS_OFF_CANVAS_RIGHT);
				this.offCanvasLeft = this.wrapper.querySelector('.' + CLASS_OFF_CANVAS_LEFT);
			}
			this.offCanvasRightWidth = this.offCanvasLeftWidth = 0;
			this.offCanvasLeftSlideIn = this.offCanvasRightSlideIn = false;
			if (this.offCanvasRight) {
				this.offCanvasRightWidth = this.offCanvasRight.offsetWidth;
				this.offCanvasRightSlideIn = this.slideIn && (this.offCanvasRight.parentNode === this.wrapper);
				//				this.offCanvasRight.classList.remove(CLASS_TRANSITIONING);
				//				this.offCanvasRight.classList.remove(CLASS_ACTIVE);
				//				this.offCanvasRight.setAttribute('style', '');
			}
			if (this.offCanvasLeft) {
				this.offCanvasLeftWidth = this.offCanvasLeft.offsetWidth;
				this.offCanvasLeftSlideIn = this.slideIn && (this.offCanvasLeft.parentNode === this.wrapper);
				//				this.offCanvasLeft.classList.remove(CLASS_TRANSITIONING);
				//				this.offCanvasLeft.classList.remove(CLASS_ACTIVE);
				//				this.offCanvasLeft.setAttribute('style', '');
			}
			this.backdrop = this.scroller.querySelector('.' + CLASS_ACTION_BACKDROP);

			this.options.dragThresholdX = this.options.dragThresholdX || 10;

			this.visible = false;
			this.startX = null;
			this.lastX = null;
			this.offsetX = null;
			this.lastTranslateX = null;
		},
		handleEvent: function(e) {
			switch (e.type) {
				case 'touchstart':
					var tagName = e.target && e.target.tagName;
					if (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'SELECT') {
						e.preventDefault();
					}
					break;
				case 'webkitTransitionEnd': //有个bug需要处理，需要考虑假设没有触发webkitTransitionEnd的情况
					if (e.target === this.scroller) {
						this._dispatchEvent();
					}
					break;
				case 'drag':
					var detail = e.detail;
					if (!this.startX) {
						this.startX = detail.center.x;
						this.lastX = this.startX;
					} else {
						this.lastX = detail.center.x;
					}
					if (!this.isDragging && Math.abs(this.lastX - this.startX) > this.options.dragThresholdX && (detail.direction === 'left' || (detail.direction === 'right'))) {
						if (this.slideIn) {
							if (this.classList.contains(CLASS_ACTIVE)) {
								if (this.offCanvasRight && this.offCanvasRight.classList.contains(CLASS_ACTIVE)) {
									this.offCanvas = this.offCanvasRight;
									this.offCanvasWidth = this.offCanvasRightWidth;
								} else {
									this.offCanvas = this.offCanvasLeft;
									this.offCanvasWidth = this.offCanvasLeftWidth;
								}
							} else {
								if (detail.direction === 'left' && this.offCanvasRight) {
									this.offCanvas = this.offCanvasRight;
									this.offCanvasWidth = this.offCanvasRightWidth;
								} else if (detail.direction === 'right' && this.offCanvasLeft) {
									this.offCanvas = this.offCanvasLeft;
									this.offCanvasWidth = this.offCanvasLeftWidth;
								} else {
									this.scroller = null;
								}
							}
						} else {
							if (this.classList.contains(CLASS_ACTIVE)) {
								if (detail.direction === 'left') {
									this.offCanvas = this.offCanvasLeft;
									this.offCanvasWidth = this.offCanvasLeftWidth;
								} else {
									this.offCanvas = this.offCanvasRight;
									this.offCanvasWidth = this.offCanvasRightWidth;
								}
							} else {
								if (detail.direction === 'right') {
									this.offCanvas = this.offCanvasLeft;
									this.offCanvasWidth = this.offCanvasLeftWidth;
								} else {
									this.offCanvas = this.offCanvasRight;
									this.offCanvasWidth = this.offCanvasRightWidth;
								}
							}
						}
						if (this.offCanvas) {
							this.startX = this.lastX;
							this.isDragging = true;

							$.gestures.session.lockDirection = true; //锁定方向
							$.gestures.session.startDirection = detail.direction;

							this.offCanvas.classList.remove(CLASS_TRANSITIONING);
							this.scroller.classList.remove(CLASS_TRANSITIONING);
							this.offsetX = this.getTranslateX();
							this._initOffCanvasVisible();
						}
					}
					if (this.isDragging) {
						this.updateTranslate(this.offsetX + (this.lastX - this.startX));
						detail.gesture.preventDefault();
						e.stopPropagation();
					}
					break;
				case 'dragend':
					if (this.isDragging) {
						var detail = e.detail;
						var direction = detail.direction;
						this.isDragging = false;
						this.offCanvas.classList.add(CLASS_TRANSITIONING);
						this.scroller.classList.add(CLASS_TRANSITIONING);
						var ratio = 0;
						var x = this.getTranslateX();

						if (!this.slideIn) {
							if (x >= 0) {
								ratio = (this.offCanvasLeftWidth && (x / this.offCanvasLeftWidth)) || 0;
							} else {
								ratio = (this.offCanvasRightWidth && (x / this.offCanvasRightWidth)) || 0;
							}
							if (ratio === 0) {
								this.openPercentage(0);
								this._dispatchEvent(); //此处不触发webkitTransitionEnd,所以手动dispatch
								return;
							}
							if (ratio > 0 && ratio < 0.5 && direction === 'right') {
								this.openPercentage(0);
							} else if (ratio > 0.5 && direction === 'left') {
								this.openPercentage(100);
							} else if (ratio < 0 && ratio > -0.5 && direction === 'left') {
								this.openPercentage(0);
							} else if (direction === 'right' && ratio < 0 && ratio > -0.5) {
								this.openPercentage(0);
							} else if (ratio < 0.5 && direction === 'right') {
								this.openPercentage(-100);
							} else if (direction === 'right' && ratio >= 0 && (ratio >= 0.5 || detail.flick)) {
								this.openPercentage(100);
							} else if (direction === 'left' && ratio <= 0 && (ratio <= -0.5 || detail.flick)) {
								this.openPercentage(-100);
							} else {
								this.openPercentage(0);
							}
							if (ratio === 1 || ratio === -1) { //此处不触发webkitTransitionEnd,所以手动dispatch
								this._dispatchEvent();
							}
						} else {
							if (x >= 0) {
								ratio = (this.offCanvasRightWidth && (x / this.offCanvasRightWidth)) || 0;
							} else {
								ratio = (this.offCanvasLeftWidth && (x / this.offCanvasLeftWidth)) || 0;
							}
							if (ratio >= 0.5 && direction === 'left') {
								this.openPercentage(0);
							} else if (ratio > 0 && ratio <= 0.5 && direction === 'left') {
								this.openPercentage(-100);
							} else if (ratio >= 0.5 && direction === 'right') {
								this.openPercentage(0);
							} else if (ratio >= -0.5 && ratio < 0 && direction === 'left') {
								this.openPercentage(100);
							} else if (ratio > 0 && ratio <= 0.5 && direction === 'right') {
								this.openPercentage(-100);
							} else if (ratio <= -0.5 && direction === 'right') {
								this.openPercentage(0);
							} else if (ratio >= -0.5 && direction === 'right') {
								this.openPercentage(100);
							} else if (ratio <= -0.5 && direction === 'left') {
								this.openPercentage(0);
							} else if (ratio >= -0.5 && direction === 'left') {
								this.openPercentage(-100);
							} else {
								this.openPercentage(0);
							}
							if (ratio === 1 || ratio === -1 || ratio === 0) {
								this._dispatchEvent();
								return;
							}

						}
					}
					break;
			}
		},
		_dispatchEvent: function() {
			if (this.classList.contains(CLASS_ACTIVE)) {
				$.trigger(this.wrapper, 'shown', this);
			} else {
				$.trigger(this.wrapper, 'hidden', this);
			}
		},
		_initOffCanvasVisible: function() {
			if (!this.visible) {
				this.visible = true;
				if (this.offCanvasLeft) {
					this.offCanvasLeft.style.visibility = 'visible';
				}
				if (this.offCanvasRight) {
					this.offCanvasRight.style.visibility = 'visible';
				}
			}
		},
		initEvent: function() {
			var self = this;
			if (self.backdrop) {
				self.backdrop.addEventListener('tap', function(e) {
					self.close();
					e.detail.gesture.preventDefault();
				});
			}
			if (this.classList.contains('mui-draggable')) {
				this.wrapper.addEventListener('touchstart', this); //临时处理
				this.wrapper.addEventListener('drag', this);
				this.wrapper.addEventListener('dragend', this);
			}
			this.wrapper.addEventListener('webkitTransitionEnd', this);
		},
		openPercentage: function(percentage) {
			var p = percentage / 100;
			if (!this.slideIn) {
				if (this.offCanvasLeft && percentage >= 0) {
					this.updateTranslate(this.offCanvasLeftWidth * p);
					this.offCanvasLeft.classList[p !== 0 ? 'add' : 'remove'](CLASS_ACTIVE);
				} else if (this.offCanvasRight && percentage <= 0) {
					this.updateTranslate(this.offCanvasRightWidth * p);
					this.offCanvasRight.classList[p !== 0 ? 'add' : 'remove'](CLASS_ACTIVE);
				}
				this.classList[p !== 0 ? 'add' : 'remove'](CLASS_ACTIVE);
			} else {
				if (this.offCanvasLeft && percentage >= 0) {
					p = p === 0 ? -1 : 0;
					this.updateTranslate(this.offCanvasLeftWidth * p);
					this.offCanvasLeft.classList[percentage !== 0 ? 'add' : 'remove'](CLASS_ACTIVE);
				} else if (this.offCanvasRight && percentage <= 0) {
					p = p === 0 ? 1 : 0;
					this.updateTranslate(this.offCanvasRightWidth * p);
					this.offCanvasRight.classList[percentage !== 0 ? 'add' : 'remove'](CLASS_ACTIVE);
				}
				this.classList[percentage !== 0 ? 'add' : 'remove'](CLASS_ACTIVE);
			}

		},
		updateTranslate: function(x) {
			if (x !== this.lastTranslateX) {
				if (!this.slideIn) {
					if ((!this.offCanvasLeft && x > 0) || (!this.offCanvasRight && x < 0)) {
						this.setTranslateX(0);
						return;
					}
					if (this.leftShowing && x > this.offCanvasLeftWidth) {
						this.setTranslateX(this.offCanvasLeftWidth);
						return;
					}
					if (this.rightShowing && x < -this.offCanvasRightWidth) {
						this.setTranslateX(-this.offCanvasRightWidth);
						return;
					}
					this.setTranslateX(x);
					if (x >= 0) {
						this.leftShowing = true;
						this.rightShowing = false;
						if (x > 0) {
							if (this.offCanvasLeft) {
								$.each(this.offCanvasLefts, function(index, offCanvas) {
									if (offCanvas === this.offCanvasLeft) {
										this.offCanvasLeft.style.zIndex = 0;
									} else {
										offCanvas.style.zIndex = -1;
									}
								}.bind(this));
							}
							if (this.offCanvasRight) {
								this.offCanvasRight.style.zIndex = -1;
							}
						}
					} else {
						this.rightShowing = true;
						this.leftShowing = false;
						if (this.offCanvasRight) {
							$.each(this.offCanvasRights, function(index, offCanvas) {
								if (offCanvas === this.offCanvasRight) {
									offCanvas.style.zIndex = 0;
								} else {
									offCanvas.style.zIndex = -1;
								}
							}.bind(this));
						}
						if (this.offCanvasLeft) {
							this.offCanvasLeft.style.zIndex = -1;
						}
					}
				} else {
					if (this.offCanvas.classList.contains(CLASS_OFF_CANVAS_RIGHT)) {
						if (x < 0) {
							this.setTranslateX(0);
							return;
						}
						if (x > this.offCanvasRightWidth) {
							this.setTranslateX(this.offCanvasRightWidth);
							return;
						}
					} else {
						if (x > 0) {
							this.setTranslateX(0);
							return;
						}
						if (x < -this.offCanvasLeftWidth) {
							this.setTranslateX(-this.offCanvasLeftWidth);
							return;
						}
					}
					this.setTranslateX(x);
				}
				this.lastTranslateX = x;
			}
		},
		setTranslateX: $.animationFrame(function(x) {
			if (this.scroller) {
				if (this.scalable && this.offCanvas.parentNode === this.wrapper) {
					var percent = Math.abs(x) / this.offCanvasWidth;
					var zoomOutScale = 1 - (1 - this.options.scale) * percent;
					var zoomInScale = this.options.scale + (1 - this.options.scale) * percent;
					var zoomOutOpacity = 1 - (1 - this.options.opacity) * percent;
					var zoomInOpacity = this.options.opacity + (1 - this.options.opacity) * percent;
					if (this.offCanvas.classList.contains(CLASS_OFF_CANVAS_LEFT)) {
						this.offCanvas.style.webkitTransformOrigin = '-100%';
						this.scroller.style.webkitTransformOrigin = 'left';
					} else {
						this.offCanvas.style.webkitTransformOrigin = '200%';
						this.scroller.style.webkitTransformOrigin = 'right';
					}
					this.offCanvas.style.opacity = zoomInOpacity;
					this.offCanvas.style.webkitTransform = 'translate3d(0,0,0) scale(' + zoomInScale + ')';
					this.scroller.style.webkitTransform = 'translate3d(' + x + 'px,0,0) scale(' + zoomOutScale + ')';
				} else {
					if (this.slideIn) {
						this.offCanvas.style.webkitTransform = 'translate3d(' + x + 'px,0,0)';
					} else {
						this.scroller.style.webkitTransform = 'translate3d(' + x + 'px,0,0)';
					}
				}
			}
		}),
		getTranslateX: function() {
			if (this.offCanvas) {
				var scroller = this.slideIn ? this.offCanvas : this.scroller;
				var result = $.parseTranslateMatrix($.getStyles(scroller, 'webkitTransform'));
				return (result && result.x) || 0;
			}
			return 0;
		},
		isShown: function(direction) {
			var shown = false;
			if (!this.slideIn) {
				var x = this.getTranslateX();
				if (direction === 'right') {
					shown = this.classList.contains(CLASS_ACTIVE) && x < 0;
				} else if (direction === 'left') {
					shown = this.classList.contains(CLASS_ACTIVE) && x > 0;
				} else {
					shown = this.classList.contains(CLASS_ACTIVE) && x !== 0;
				}
			} else {
				if (direction === 'left') {
					shown = this.classList.contains(CLASS_ACTIVE) && this.wrapper.querySelector('.' + CLASS_OFF_CANVAS_LEFT + '.' + CLASS_ACTIVE);
				} else if (direction === 'right') {
					shown = this.classList.contains(CLASS_ACTIVE) && this.wrapper.querySelector('.' + CLASS_OFF_CANVAS_RIGHT + '.' + CLASS_ACTIVE);
				} else {
					shown = this.classList.contains(CLASS_ACTIVE) && (this.wrapper.querySelector('.' + CLASS_OFF_CANVAS_LEFT + '.' + CLASS_ACTIVE) || this.wrapper.querySelector('.' + CLASS_OFF_CANVAS_RIGHT + '.' + CLASS_ACTIVE));
				}
			}
			return shown;
		},
		close: function() {
			this._initOffCanvasVisible();

			this.offCanvas = this.wrapper.querySelector('.' + CLASS_OFF_CANVAS_RIGHT + '.' + CLASS_ACTIVE) || this.wrapper.querySelector('.' + CLASS_OFF_CANVAS_LEFT + '.' + CLASS_ACTIVE);
			this.offCanvasWidth = this.offCanvas.offsetWidth;

			if (this.scroller) {
				this.offCanvas.offsetHeight;
				this.offCanvas.classList.add(CLASS_TRANSITIONING);
				this.scroller.classList.add(CLASS_TRANSITIONING);
				this.openPercentage(0);
			}
		},
		show: function(direction) {
			this._initOffCanvasVisible();
			if (this.isShown(direction)) {
				return false;
			}
			if (!direction) {
				direction = this.wrapper.querySelector('.' + CLASS_OFF_CANVAS_RIGHT) ? 'right' : 'left';
			}
			if (direction === 'right') {
				this.offCanvas = this.offCanvasRight;
				this.offCanvasWidth = this.offCanvasRightWidth;
			} else {
				this.offCanvas = this.offCanvasLeft;
				this.offCanvasWidth = this.offCanvasLeftWidth;
			}

			if (this.scroller) {
				this.offCanvas.offsetHeight;
				this.offCanvas.classList.add(CLASS_TRANSITIONING);
				this.scroller.classList.add(CLASS_TRANSITIONING);
				this.openPercentage(direction === 'left' ? 100 : -100);
			}
			return true;
		},
		toggle: function(directionOrOffCanvas) {
			var direction = directionOrOffCanvas;
			if (directionOrOffCanvas && directionOrOffCanvas.classList) {
				direction = directionOrOffCanvas.classList.contains(CLASS_OFF_CANVAS_LEFT) ? 'left' : 'right';
				this.refresh(directionOrOffCanvas);
			}
			if (!this.show(direction)) {
				this.close();
			}
		}
	});

	//hash to offcanvas
	var findOffCanvasContainer = function(target) {
		parentNode = target.parentNode;
		if (parentNode) {
			if (parentNode.classList.contains(CLASS_OFF_CANVAS_WRAP)) {
				return parentNode;
			} else {
				parentNode = parentNode.parentNode;
				if (parentNode.classList.contains(CLASS_OFF_CANVAS_WRAP)) {
					return parentNode;
				}
			}
		}
	};
	var handle = function(event, target) {
		if (target.tagName === 'A' && target.hash) {
			var offcanvas = document.getElementById(target.hash.replace('#', ''));
			if (offcanvas) {
				var container = findOffCanvasContainer(offcanvas);
				if (container) {
					$.targets._container = container;
					return offcanvas;
				}
			}
		}
		return false;
	};

	$.registerTarget({
		name: name,
		index: 60,
		handle: handle,
		target: false,
		isReset: false,
		isContinue: true
	});

	window.addEventListener('tap', function(e) {
		if (!$.targets.offcanvas) {
			return;
		}
		//TODO 此处类型的代码后续考虑统一优化(target机制)，现在的实现费力不讨好
		var target = e.target;
		for (; target && target !== document; target = target.parentNode) {
			if (target.tagName === 'A' && target.hash && target.hash === ('#' + $.targets.offcanvas.id)) {
				e.detail && e.detail.gesture && e.detail.gesture.preventDefault();//fixed hashchange
				$($.targets._container).offCanvas().toggle($.targets.offcanvas);
				$.targets.offcanvas = $.targets._container = null;
				break;
			}
		}
	});

	$.fn.offCanvas = function(options) {
		var offCanvasApis = [];
		this.each(function() {
			var offCanvasApi = null;
			var self = this;
			//hack old version
			if (!self.classList.contains(CLASS_OFF_CANVAS_WRAP)) {
				self = findOffCanvasContainer(self);
			}
			var id = self.getAttribute('data-offCanvas');
			if (!id) {
				id = ++$.uuid;
				$.data[id] = offCanvasApi = new OffCanvas(self, options);
				self.setAttribute('data-offCanvas', id);
			} else {
				offCanvasApi = $.data[id];
			}
			if (options === 'show' || options === 'close' || options === 'toggle') {
				offCanvasApi.toggle();
			}
			offCanvasApis.push(offCanvasApi);
		});
		return offCanvasApis.length === 1 ? offCanvasApis[0] : offCanvasApis;
	};
	$.ready(function() {
		$('.mui-off-canvas-wrap').offCanvas();
	});
})(Eui, window, document, 'offcanvas');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/js/actions.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, name) {
	var CLASS_ACTION = 'mui-action';

	var handle = function(event, target) {
		var className = target.className || '';
		if (typeof className !== 'string') { //svg className(SVGAnimatedString)
			className = '';
		}
		if (className && ~className.indexOf(CLASS_ACTION)) {
			if (target.classList.contains('mui-action-back')) {
				event.preventDefault();
			}
			return target;
		}
		return false;
	};

	$.registerTarget({
		name: name,
		index: 50,
		handle: handle,
		target: false,
		isContinue: true
	});

})(Eui, 'action');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/js/modals.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, document, name) {
	var CLASS_MODAL = 'mui-modal';

	var handle = function(event, target) {
		if (target.tagName === 'A' && target.hash) {
			var modal = document.getElementById(target.hash.replace('#', ''));
			if (modal && modal.classList.contains(CLASS_MODAL)) {
				return modal;
			}
		}
		return false;
	};

	$.registerTarget({
		name: name,
		index: 50,
		handle: handle,
		target: false,
		isReset: false,
		isContinue: true
	});

	window.addEventListener('tap', function(event) {
		if ($.targets.modal) {
			event.detail.gesture.preventDefault(); //fixed hashchange
			$.targets.modal.classList.toggle('mui-active');
		}
	});
})(Eui, window, document, 'modal');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/js/popovers.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, document, name) {

	var CLASS_POPOVER = 'mui-popover';
	var CLASS_POPOVER_ARROW = 'mui-popover-arrow';
	var CLASS_ACTION_POPOVER = 'mui-popover-action';
	var CLASS_BACKDROP = 'mui-backdrop';
	var CLASS_BAR_POPOVER = 'mui-bar-popover';
	var CLASS_BAR_BACKDROP = 'mui-bar-backdrop';
	var CLASS_ACTION_BACKDROP = 'mui-backdrop-action';
	var CLASS_ACTIVE = 'mui-active';
	var CLASS_BOTTOM = 'mui-bottom';

	var handle = function(event, target) {
		if (target.tagName === 'A' && target.hash) {
			$.targets._popover = document.getElementById(target.hash.replace('#', ''));
			if ($.targets._popover && $.targets._popover.classList.contains(CLASS_POPOVER)) {
				return target;
			} else {
				$.targets._popover = null;
			}
		}
		return false;
	};

	$.registerTarget({
		name: name,
		index: 60,
		handle: handle,
		target: false,
		isReset: false,
		isContinue: true
	});

	var fixedPopoverScroll = function(isPopoverScroll) {
		//		if (isPopoverScroll) {
		//			document.body.setAttribute('style', 'overflow:hidden;');
		//		} else {
		//			document.body.setAttribute('style', '');
		//		}
	};
	var onPopoverShown = function(e) {
		this.removeEventListener('webkitTransitionEnd', onPopoverShown);
		this.addEventListener('touchmove', $.preventDefault);
		$.trigger(this, 'shown', this);
	}
	var onPopoverHidden = function(e) {
		setStyle(this,'none');
		this.removeEventListener('webkitTransitionEnd', onPopoverHidden);
		this.removeEventListener('touchmove', $.preventDefault);
		fixedPopoverScroll(false);
		$.trigger(this, 'hidden', this);
	};

	var backdrop = (function() {
		var element = document.createElement('div');
		element.classList.add(CLASS_BACKDROP);
		element.addEventListener('touchmove', $.preventDefault);
		element.addEventListener('tap', function(e) {
			var popover = $.targets._popover;
			if (popover) {
				popover.addEventListener('webkitTransitionEnd', onPopoverHidden);
				popover.classList.remove(CLASS_ACTIVE);
				removeBackdrop(popover);
				document.body.setAttribute('style', ''); //webkitTransitionEnd有时候不触发？
			}
		});

		return element;
	}());
	var removeBackdrop = function(popover) {
		backdrop.setAttribute('style', 'opacity:0');
		$.targets.popover = $.targets._popover = null; //reset
		setTimeout(function() {
			if (!popover.classList.contains(CLASS_ACTIVE) && backdrop.parentNode && backdrop.parentNode === document.body) {
				document.body.removeChild(backdrop);
			}
		}, 350);
	};
	window.addEventListener('tap', function(e) {
		if (!$.targets.popover) {
			return;
		}
		var toggle = false;
		var target = e.target;
		for (; target && target !== document; target = target.parentNode) {
			if (target === $.targets.popover) {
				toggle = true;
			}
		}
		if (toggle) {
			e.detail.gesture.preventDefault(); //fixed hashchange
			togglePopover($.targets._popover, $.targets.popover);
		}

	});

	var togglePopover = function(popover, anchor) {
		//remove一遍，以免来回快速切换，导致webkitTransitionEnd不触发，无法remove
		popover.removeEventListener('webkitTransitionEnd', onPopoverShown);
		popover.removeEventListener('webkitTransitionEnd', onPopoverHidden);
		backdrop.classList.remove(CLASS_BAR_BACKDROP);
		backdrop.classList.remove(CLASS_ACTION_BACKDROP);
		var _popover = document.querySelector('.mui-popover.mui-active');
		if (_popover) {
			//			_popover.setAttribute('style', '');
			_popover.addEventListener('webkitTransitionEnd', onPopoverHidden);
			_popover.classList.remove(CLASS_ACTIVE);
			//			_popover.removeEventListener('webkitTransitionEnd', onPopoverHidden);
			//			fixedPopoverScroll(false);
			//同一个弹出则直接返回，解决同一个popover的toggle
			if (popover === _popover) {
				removeBackdrop(_popover);
				return;
			}
		}
		var isActionSheet = false;
		if (popover.classList.contains(CLASS_BAR_POPOVER) || popover.classList.contains(CLASS_ACTION_POPOVER)) { //navBar
			if (popover.classList.contains(CLASS_ACTION_POPOVER)) { //action sheet popover
				isActionSheet = true;
				backdrop.classList.add(CLASS_ACTION_BACKDROP);
			} else { //bar popover
				backdrop.classList.add(CLASS_BAR_BACKDROP);
				//				if (anchor) {
				//					if (anchor.parentNode) {
				//						var offsetWidth = anchor.offsetWidth;
				//						var offsetLeft = anchor.offsetLeft;
				//						var innerWidth = window.innerWidth;
				//						popover.style.left = (Math.min(Math.max(offsetLeft, defaultPadding), innerWidth - offsetWidth - defaultPadding)) + "px";
				//					} else {
				//						//TODO anchor is position:{left,top,bottom,right}
				//					}
				//				}
			}
		}
		setStyle(popover, 'block'); //actionsheet transform
		popover.offsetHeight;
		popover.classList.add(CLASS_ACTIVE);
		backdrop.setAttribute('style', '');
		document.body.appendChild(backdrop);
		fixedPopoverScroll(true);
		calPosition(popover, anchor, isActionSheet); //position
		backdrop.classList.add(CLASS_ACTIVE);
		popover.addEventListener('webkitTransitionEnd', onPopoverShown);
	};
	var setStyle = function(popover, display, top, left) {
		var style = popover.style;
		if (typeof display !== 'undefined')
			style.display = display;
		if (typeof top !== 'undefined')
			style.top = top + 'px';
		if (typeof left !== 'undefined')
			style.left = left + 'px';
	};
	var calPosition = function(popover, anchor, isActionSheet) {
		if (!popover || !anchor) {
			return;
		}

		if (isActionSheet) { //actionsheet
			setStyle(popover, 'block')
			return;
		}

		var wWidth = window.innerWidth;
		var wHeight = window.innerHeight;

		var pWidth = popover.offsetWidth;
		var pHeight = popover.offsetHeight;

		var aWidth = anchor.offsetWidth;
		var aHeight = anchor.offsetHeight;
		var offset = $.offset(anchor);

		var arrow = popover.querySelector('.' + CLASS_POPOVER_ARROW);
		if (!arrow) {
			arrow = document.createElement('div');
			arrow.className = CLASS_POPOVER_ARROW;
			popover.appendChild(arrow);
		}
		var arrowSize = arrow && arrow.offsetWidth / 2 || 0;



		var pTop = 0;
		var pLeft = 0;
		var diff = 0;
		var arrowLeft = 0;
		var defaultPadding = popover.classList.contains(CLASS_ACTION_POPOVER) ? 0 : 5;

		var position = 'top';
		if ((pHeight + arrowSize) < (offset.top - window.pageYOffset)) { //top
			pTop = offset.top - pHeight - arrowSize;
		} else if ((pHeight + arrowSize) < (wHeight - (offset.top - window.pageYOffset) - aHeight)) { //bottom
			position = 'bottom';
			pTop = offset.top + aHeight + arrowSize;
		} else { //middle
			position = 'middle';
			pTop = Math.max((wHeight - pHeight) / 2 + window.pageYOffset, 0);
			pLeft = Math.max((wWidth - pWidth) / 2 + window.pageXOffset, 0);
		}
		if (position === 'top' || position === 'bottom') {
			pLeft = aWidth / 2 + offset.left - pWidth / 2;
			diff = pLeft;
			if (pLeft < defaultPadding) pLeft = defaultPadding;
			if (pLeft + pWidth > wWidth) pLeft = wWidth - pWidth - defaultPadding;

			if (arrow) {
				if (position === 'top') {
					arrow.classList.add(CLASS_BOTTOM);
				} else {
					arrow.classList.remove(CLASS_BOTTOM);
				}
				diff = diff - pLeft;
				arrowLeft = (pWidth / 2 - arrowSize / 2 + diff);
				arrowLeft = Math.max(Math.min(arrowLeft, pWidth - arrowSize * 2 - 6), 6);
				arrow.setAttribute('style', 'left:' + arrowLeft + 'px');
			}
		} else if (position === 'middle') {
			arrow.setAttribute('style', 'display:none');
		}
		setStyle(popover, 'block', pTop, pLeft);
	};

	/**
	 * 在popover、侧滑菜单等界面，经常会用到蒙版遮罩；
	 * 比如popover弹出后，除popover控件外的其它区域都会遮罩一层蒙版，
	 * 用户点击蒙版不会触发蒙版下方的逻辑，而会关闭popover同时关闭蒙版；再比如侧滑菜单界面，
	 * 菜单划出后，除侧滑菜单之外的其它区域都会遮罩一层蒙版，用户点击蒙版会关闭侧滑菜单同时关闭蒙版。
	 *
	 * 遮罩蒙版常用的操作包括：创建、显示、关闭，如下代码:
	 *
	 *		var mask = $.createMask(callback);//callback为用户点击蒙版时自动执行的回调；
	 *		mask.show();//显示遮罩
	 *		mask.close();//关闭遮罩
	 *
	 * 注意：关闭遮罩仅会关闭，不会销毁；关闭之后可以再次调用mask.show();打开遮罩；
	 *
	 * eui默认的蒙版遮罩使用`.mui-backdrop`类定义（如下代码），若需自定义遮罩效果，
	 * 只需覆盖定义`.mui-backdrop`即可；
	 *
	 * 		.mui-backdrop {
	 *			position: fixed;
	 *			top: 0;
	 *			right: 0;
	 *			bottom: 0;
	 *			left: 0;
	 *			z-index: 998;
	 *			background-color: rgba(0,0,0,.3);
	 *		}
	 *
	 * @alias #createMask
	 * @memberof Eui
	 * @param {Function} callback 点击蒙版时自动执行的回调
	 */
	$.createMask = function(callback) {
		var element = document.createElement('div');
		element.classList.add(CLASS_BACKDROP);
		element.addEventListener('touchmove', $.preventDefault);
		element.addEventListener('tap', function() {
			mask.close();
		});
		var mask = [element];
		mask._show = false;
		mask.show = function() {
			mask._show = true;
			element.setAttribute('style', 'opacity:1');
			document.body.appendChild(element);
			return mask;
		};
		mask._remove = function() {
			if (mask._show) {
				mask._show = false;
				element.setAttribute('style', 'opacity:0');

				$.later(function() {
					var body = document.body;
					element.parentNode === body && body.removeChild(element);
				}, 350);
			}
			return mask;
		};
		mask.close = function() {
			if (callback) {
				if (callback() !== false) {
					mask._remove();
				}
			} else {
				mask._remove();
			}
		};
		return mask;
	};

	/**
	 * eui框架内置了弹出菜单插件，弹出菜单显示内容不限，但必须包裹在一个含.mui-popover类的div中，
	 * 如下即为一个弹出菜单内容：
	 *
	 * 		<div id="popover" class="mui-popover">
	 *		   <ul class="mui-table-view">
	 *		     <li class="mui-table-view-cell"><a href="#">Item1</a></li>
	 *		     <li class="mui-table-view-cell"><a href="#">Item2</a></li>
	 *		     <li class="mui-table-view-cell"><a href="#">Item3</a></li>
	 *		     <li class="mui-table-view-cell"><a href="#">Item4</a></li>
	 *		     <li class="mui-table-view-cell"><a href="#">Item5</a></li>
	 *		   </ul>
	 *		 </div>
	 *
	 *  要显示、隐藏如上菜单，eui推荐使用锚点方式，例如：
	 *
	 *  	<a href="#popover" class="mui-btn mui-btn-primary mui-btn-block">打开弹出菜单</a>
	 *
	 *
	 * 点击如上定义的按钮，即可显示弹出菜单，再次点击弹出菜单之外的其他区域，均可关闭弹出菜单；这种使用方式最为简洁。
     *
	 * 若希望通过js的方式控制弹出菜单，则通过如下一个方法即可：
	 *
	 *  	//传入toggle参数，用户也无需关心当前是显示还是隐藏状态，eui会自动识别处理；
	 *		$('.mui-popover').popover('toggle');
	 *
	 * @alias #popover
	 * @param {String} args 可以是`show`|`hide`|`toggle`
	 * @memberof $.fn
	 */
	$.fn.popover = function() {
		var args = arguments;
		this.each(function() {
			$.targets._popover = this;
			if (args[0] === 'show' || args[0] === 'hide' || args[0] === 'toggle') {
				togglePopover(this, args[1]);
			}
		});
	};

})(Eui, window, document, 'popover');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/segmented-controllers.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, document, name, undefined) {

	var CLASS_CONTROL_ITEM = 'mui-control-item';
	var CLASS_SEGMENTED_CONTROL = 'mui-segmented-control';
	var CLASS_CONTROL_CONTENT = 'mui-control-content';
	var CLASS_TAB_BAR = 'mui-bar-tab';
	var CLASS_TAB_ITEM = 'mui-tab-item';
	var CLASS_SLIDER_ITEM = 'mui-slider-item';

	var handle = function(event, target) {
		if (target.classList && (target.classList.contains(CLASS_CONTROL_ITEM) || target.classList.contains(CLASS_TAB_ITEM))) {
			event.preventDefault(); //stop hash change
			//			if (target.hash) {
			return target;
			//			}
		}
		return false;
	};

	$.registerTarget({
		name: name,
		index: 80,
		handle: handle,
		target: false
	});

	window.addEventListener('tap', function(e) {

		var targetTab = $.targets.tab;
		if (!targetTab) {
			return;
		}
		var activeTab;
		var activeBodies;
		var targetBody;
		var className = 'mui-active';
		var classSelector = '.' + className;
		var segmentedControl = targetTab.parentNode;

		for (; segmentedControl && segmentedControl !== document; segmentedControl = segmentedControl.parentNode) {
			if (segmentedControl.classList.contains(CLASS_SEGMENTED_CONTROL)) {
				activeTab = segmentedControl.querySelector(classSelector + '.' + CLASS_CONTROL_ITEM);
				break;
			} else if (segmentedControl.classList.contains(CLASS_TAB_BAR)) {
				activeTab = segmentedControl.querySelector(classSelector + '.' + CLASS_TAB_ITEM);
			}
		}


		if (activeTab) {
			activeTab.classList.remove(className);
		}

		var isLastActive = targetTab === activeTab;
		if (targetTab) {
			targetTab.classList.add(className);
		}

		if (!targetTab.hash) {
			return;
		}

		targetBody = document.getElementById(targetTab.hash.replace('#', ''));

		if (!targetBody) {
			return;
		}
		if (!targetBody.classList.contains(CLASS_CONTROL_CONTENT)) { //tab bar popover
			targetTab.classList[isLastActive ? 'remove' : 'add'](className);
			return;
		}
		if (isLastActive) { //same
			return;
		}
		var parentNode = targetBody.parentNode;
		activeBodies = parentNode.querySelectorAll('.' + CLASS_CONTROL_CONTENT + classSelector);
		for (var i = 0; i < activeBodies.length; i++) {
			var activeBody = activeBodies[i];
			activeBody.parentNode === parentNode && activeBody.classList.remove(className);
		}

		targetBody.classList.add(className);

		var contents = targetBody.parentNode.querySelectorAll('.' + CLASS_CONTROL_CONTENT);
		$.trigger(targetBody, $.eventName('shown', name), {
			tabNumber: Array.prototype.indexOf.call(contents, targetBody)
		});
		e.detail && e.detail.gesture.preventDefault(); //fixed hashchange
	});

})(Eui, window, document, 'tab');
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/switches.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, name) {

	var CLASS_SWITCH = 'mui-switch';
	var CLASS_SWITCH_HANDLE = 'mui-switch-handle';
	var CLASS_ACTIVE = 'mui-active';
	var CLASS_DRAGGING = 'mui-dragging';

	var CLASS_DISABLED = 'mui-disabled';

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
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath component/ui/tableviews.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($, window, document) {

	var CLASS_ACTIVE = 'mui-active';
	var CLASS_SELECTED = 'mui-selected';
	var CLASS_GRID_VIEW = 'mui-grid-view';
	var CLASS_RADIO_VIEW = 'mui-table-view-radio';
	var CLASS_TABLE_VIEW_CELL = 'mui-table-view-cell';
	var CLASS_COLLAPSE_CONTENT = 'mui-collapse-content';
	var CLASS_DISABLED = 'mui-disabled';
	var CLASS_TOGGLE = 'mui-switch';
	var CLASS_BTN = 'mui-btn';

	var CLASS_SLIDER_HANDLE = 'mui-slider-handle';
	var CLASS_SLIDER_LEFT = 'mui-slider-left';
	var CLASS_SLIDER_RIGHT = 'mui-slider-right';
	var CLASS_TRANSITIONING = 'mui-transitioning';


	var SELECTOR_SLIDER_HANDLE = '.' + CLASS_SLIDER_HANDLE;
	var SELECTOR_SLIDER_LEFT = '.' + CLASS_SLIDER_LEFT;
	var SELECTOR_SLIDER_RIGHT = '.' + CLASS_SLIDER_RIGHT;
	var SELECTOR_SELECTED = '.' + CLASS_SELECTED;
	var SELECTOR_BUTTON = '.' + CLASS_BTN;
	var overFactor = 0.8;
	var cell, a;

	var isMoved = isOpened = openedActions = progress = false;
	var sliderHandle = sliderActionLeft = sliderActionRight = buttonsLeft = buttonsRight = sliderDirection = sliderRequestAnimationFrame = false;
	var timer = translateX = lastTranslateX = sliderActionLeftWidth = sliderActionRightWidth = 0;



	var toggleActive = function(isActive) {
		if (isActive) {
			if (a) {
				a.classList.add(CLASS_ACTIVE);
			} else if (cell) {
				cell.classList.add(CLASS_ACTIVE);
			}
		} else {
			timer && timer.cancel();
			if (a) {
				a.classList.remove(CLASS_ACTIVE);
			} else if (cell) {
				cell.classList.remove(CLASS_ACTIVE);
			}
		}
	};

	var updateTranslate = function() {
		if (translateX !== lastTranslateX) {
			if (buttonsRight && buttonsRight.length > 0) {
				progress = translateX / sliderActionRightWidth;
				if (translateX < -sliderActionRightWidth) {
					translateX = -sliderActionRightWidth - Math.pow(-translateX - sliderActionRightWidth, overFactor);
				}
				for (var i = 0, len = buttonsRight.length; i < len; i++) {
					var buttonRight = buttonsRight[i];
					if (typeof buttonRight._buttonOffset === 'undefined') {
						buttonRight._buttonOffset = buttonRight.offsetLeft;
					}
					buttonOffset = buttonRight._buttonOffset;
					setTranslate(buttonRight, (translateX - buttonOffset * (1 + Math.max(progress, -1))));
				}
			}
			if (buttonsLeft && buttonsLeft.length > 0) {
				progress = translateX / sliderActionLeftWidth;
				if (translateX > sliderActionLeftWidth) {
					translateX = sliderActionLeftWidth + Math.pow(translateX - sliderActionLeftWidth, overFactor);
				}
				for (var i = 0, len = buttonsLeft.length; i < len; i++) {
					var buttonLeft = buttonsLeft[i];
					if (typeof buttonLeft._buttonOffset === 'undefined') {
						buttonLeft._buttonOffset = sliderActionLeftWidth - buttonLeft.offsetLeft - buttonLeft.offsetWidth;
					}
					buttonOffset = buttonLeft._buttonOffset;
					if (buttonsLeft.length > 1) {
						buttonLeft.style.zIndex = buttonsLeft.length - i;
					}
					setTranslate(buttonLeft, (translateX + buttonOffset * (1 - Math.min(progress, 1))));
				}
			}
			setTranslate(sliderHandle, translateX);
			lastTranslateX = translateX;
		}
		sliderRequestAnimationFrame = requestAnimationFrame(function() {
			updateTranslate();
		});
	};
	var setTranslate = function(element, x) {
		if (element) {
			element.style.webkitTransform = 'translate3d(' + x + 'px,0,0)';
		}
	};

	window.addEventListener('touchstart', function(event) {
		if (cell) {
			toggleActive(false);
		}
		cell = a = false;
		isMoved = isOpened = openedActions = false;
		var target = event.target;
		var isDisabled = false;
		for (; target && target !== document; target = target.parentNode) {
			if (target.classList) {
				var classList = target.classList;
				if ((target.tagName === 'INPUT' && target.type !== 'radio' && target.type !== 'checkbox') || target.tagName === 'BUTTON' || classList.contains(CLASS_TOGGLE) || classList.contains(CLASS_BTN) || classList.contains(CLASS_DISABLED)) {
					isDisabled = true;
				}
				if (classList.contains(CLASS_COLLAPSE_CONTENT)) { //collapse content
					break;
				}
				if (classList.contains(CLASS_TABLE_VIEW_CELL)) {
					cell = target;
					//TODO swipe to delete close
					var selected = cell.parentNode.querySelector(SELECTOR_SELECTED);
					if (!cell.parentNode.classList.contains(CLASS_RADIO_VIEW) && selected && selected !== cell) {
						$.swipeoutClose(selected);
						cell = isDisabled = false;
						return;
					}
					if (!cell.parentNode.classList.contains(CLASS_GRID_VIEW)) {
						var link = cell.querySelector('a');
						if (link && link.parentNode === cell) { //li>a
							a = link;
						}
					}
					var handle = cell.querySelector(SELECTOR_SLIDER_HANDLE);
					if (handle) {
						toggleEvents(cell);
						event.stopPropagation();
					}
					if (!isDisabled) {
						if (handle) {
							if (timer) {
								timer.cancel();
							}
							timer = $.later(function() {
								toggleActive(true);
							}, 100);
						} else{
							toggleActive(true);
						}
					}
					break;
				}
			}
		}
	});
	window.addEventListener('touchmove', function(event) {
		toggleActive(false);
	});

	var handleEvent = {
		handleEvent: function(event) {
			switch (event.type) {
				case 'drag':
					this.drag(event);
					break;
				case 'dragend':
					this.dragend(event);
					break;
				case 'flick':
					this.flick(event);
					break;
				case 'swiperight':
					this.swiperight(event);
					break;
				case 'swipeleft':
					this.swipeleft(event);
					break;
			}
		},
		drag: function(event) {
			if (!cell) {
				return;
			}
			if (!isMoved) { //init
				sliderHandle = sliderActionLeft = sliderActionRight = buttonsLeft = buttonsRight = sliderDirection = sliderRequestAnimationFrame = false;
				sliderHandle = cell.querySelector(SELECTOR_SLIDER_HANDLE);
				if (sliderHandle) {
					sliderActionLeft = cell.querySelector(SELECTOR_SLIDER_LEFT);
					sliderActionRight = cell.querySelector(SELECTOR_SLIDER_RIGHT);
					if (sliderActionLeft) {
						sliderActionLeftWidth = sliderActionLeft.offsetWidth;
						buttonsLeft = sliderActionLeft.querySelectorAll(SELECTOR_BUTTON);
					}
					if (sliderActionRight) {
						sliderActionRightWidth = sliderActionRight.offsetWidth;
						buttonsRight = sliderActionRight.querySelectorAll(SELECTOR_BUTTON);
					}
					cell.classList.remove(CLASS_TRANSITIONING);
					isOpened = cell.classList.contains(CLASS_SELECTED);
					if (isOpened) {
						openedActions = cell.querySelector(SELECTOR_SLIDER_LEFT + SELECTOR_SELECTED) ? 'left' : 'right';
					}
				}
			}
			var detail = event.detail;
			var direction = detail.direction;
			var angle = detail.angle;
			if (direction === 'left' && (angle > 150 || angle < -150)) {
				if (buttonsRight || (buttonsLeft && isOpened)) { //存在右侧按钮或存在左侧按钮且是已打开状态
					isMoved = true;
				}
			} else if (direction === 'right' && (angle > -30 && angle < 30)) {
				if (buttonsLeft || (buttonsRight && isOpened)) { //存在左侧按钮或存在右侧按钮且是已打开状态
					isMoved = true;
				}
			}
			if (isMoved) {
				event.stopPropagation();
				event.detail.gesture.preventDefault();
				var translate = event.detail.deltaX;
				if (isOpened) {
					if (openedActions === 'right') {
						translate = translate - sliderActionRightWidth;
					} else {
						translate = translate + sliderActionLeftWidth;
					}
				}
				if ((translate > 0 && !buttonsLeft) || (translate < 0 && !buttonsRight)) {
					if (!isOpened) {
						return;
					}
					translate = 0;
				}
				if (translate < 0) {
					sliderDirection = 'toLeft';
				} else if (translate > 0) {
					sliderDirection = 'toRight';
				} else {
					if (!sliderDirection) {
						sliderDirection = 'toLeft';
					}
				}
				if (!sliderRequestAnimationFrame) {
					updateTranslate();
				}
				translateX = translate;
			}
		},
		flick: function(event) {
			if (isMoved) {
				event.stopPropagation();
			}
		},
		swipeleft: function(event) {
			if (isMoved) {
				event.stopPropagation();
			}
		},
		swiperight: function(event) {
			if (isMoved) {
				event.stopPropagation();
			}
		},
		dragend: function(event) {
			if (!isMoved) {
				return;
			}
			event.stopPropagation();
			if (sliderRequestAnimationFrame) {
				cancelAnimationFrame(sliderRequestAnimationFrame);
				sliderRequestAnimationFrame = null;
			}
			var detail = event.detail;
			isMoved = false;
			var action = 'close';
			var actionsWidth = sliderDirection === 'toLeft' ? sliderActionRightWidth : sliderActionLeftWidth;
			var isToggle = detail.swipe || (Math.abs(translateX) > actionsWidth / 2);
			if (isToggle) {
				if (!isOpened) {
					action = 'open';
				} else if (detail.direction === 'left' && openedActions === 'right') {
					action = 'open';
				} else if (detail.direction === 'right' && openedActions === 'left') {
					action = 'open';
				}

			}
			cell.classList.add(CLASS_TRANSITIONING);
			var buttons;
			if (action === 'open') {
				var newTranslate = sliderDirection === 'toLeft' ? -actionsWidth : actionsWidth;
				setTranslate(sliderHandle, newTranslate);
				buttons = sliderDirection === 'toLeft' ? buttonsRight : buttonsLeft;
				if (typeof buttons !== 'undefined') {
					var button = null;
					for (var i = 0; i < buttons.length; i++) {
						button = buttons[i];
						setTranslate(button, newTranslate);
					}
					button.parentNode.classList.add(CLASS_SELECTED);
					cell.classList.add(CLASS_SELECTED);
					if (!isOpened) {
						$.trigger(cell, sliderDirection === 'toLeft' ? 'slideleft' : 'slideright');
					}
				}
			} else {
				setTranslate(sliderHandle, 0);
				sliderActionLeft && sliderActionLeft.classList.remove(CLASS_SELECTED);
				sliderActionRight && sliderActionRight.classList.remove(CLASS_SELECTED);
				cell.classList.remove(CLASS_SELECTED);
			}
			var buttonOffset;
			if (buttonsLeft && buttonsLeft.length > 0 && buttonsLeft !== buttons) {
				for (var i = 0, len = buttonsLeft.length; i < len; i++) {
					var buttonLeft = buttonsLeft[i];
					buttonOffset = buttonLeft._buttonOffset;
					if (typeof buttonOffset === 'undefined') {
						buttonLeft._buttonOffset = sliderActionLeftWidth - buttonLeft.offsetLeft - buttonLeft.offsetWidth;
					}
					setTranslate(buttonLeft, buttonOffset);
				}
			}
			if (buttonsRight && buttonsRight.length > 0 && buttonsRight !== buttons) {
				for (var i = 0, len = buttonsRight.length; i < len; i++) {
					var buttonRight = buttonsRight[i];
					buttonOffset = buttonRight._buttonOffset;
					if (typeof buttonOffset === 'undefined') {
						buttonRight._buttonOffset = buttonRight.offsetLeft;
					}
					setTranslate(buttonRight, -buttonOffset);
				}
			}
		}
	};

	function toggleEvents(element, isRemove) {
		var method = !!isRemove ? 'removeEventListener' : 'addEventListener';
		element[method]('drag', handleEvent);
		element[method]('dragend', handleEvent);
		element[method]('swiperight', handleEvent);
		element[method]('swipeleft', handleEvent);
		element[method]('flick', handleEvent);
	};
	/**
	 * 打开滑动菜单
	 * @param {Object} el
	 * @param {Object} direction
	 */
	$.swipeoutOpen = function(el, direction) {
		if (!el) return;
		var classList = el.classList;
		if (classList.contains(CLASS_SELECTED)) return;
		if (!direction) {
			if (el.querySelector(SELECTOR_SLIDER_RIGHT)) {
				direction = 'right';
			} else {
				direction = 'left';
			}
		}
		var swipeoutAction = el.querySelector($.classSelector(".slider-" + direction));
		if (!swipeoutAction) return;
		swipeoutAction.classList.add(CLASS_SELECTED);
		classList.add(CLASS_SELECTED);
		classList.remove(CLASS_TRANSITIONING);
		var buttons = swipeoutAction.querySelectorAll(SELECTOR_BUTTON);
		var swipeoutWidth = swipeoutAction.offsetWidth;
		var translate = (direction === 'right') ? -swipeoutWidth : swipeoutWidth;
		var length = buttons.length;
		var button;
		for (var i = 0; i < length; i++) {
			button = buttons[i];
			if (direction === 'right') {
				setTranslate(button, -button.offsetLeft);
			} else {
				setTranslate(button, (swipeoutWidth - button.offsetWidth - button.offsetLeft));
			}
		}
		classList.add(CLASS_TRANSITIONING);
		for (var i = 0; i < length; i++) {
			setTranslate(buttons[i], translate);
		}
		setTranslate(el.querySelector(SELECTOR_SLIDER_HANDLE), translate);
	};
	/**
	 * 关闭滑动菜单
	 * @param {Object} el
	 */
	$.swipeoutClose = function(el) {
		if (!el) return;
		var classList = el.classList;
		if (!classList.contains(CLASS_SELECTED)) return;
		var direction = el.querySelector(SELECTOR_SLIDER_RIGHT + SELECTOR_SELECTED) ? 'right' : 'left';
		var swipeoutAction = el.querySelector($.classSelector(".slider-" + direction));
		if (!swipeoutAction) return;
		swipeoutAction.classList.remove(CLASS_SELECTED);
		classList.remove(CLASS_SELECTED);
		classList.add(CLASS_TRANSITIONING);
		var buttons = swipeoutAction.querySelectorAll(SELECTOR_BUTTON);
		var swipeoutWidth = swipeoutAction.offsetWidth;
		var length = buttons.length;
		var button;
		setTranslate(el.querySelector(SELECTOR_SLIDER_HANDLE), 0);
		for (var i = 0; i < length; i++) {
			button = buttons[i];
			if (direction === 'right') {
				setTranslate(button, (-button.offsetLeft));
			} else {
				setTranslate(button, (swipeoutWidth - button.offsetWidth - button.offsetLeft));
			}
		}
	};

	window.addEventListener('touchend', function(event) { //使用touchend来取消高亮，避免一次点击既不触发tap，doubletap，longtap的事件
		if (!cell) {
			return;
		}
		toggleActive(false);
		sliderHandle && toggleEvents(cell, true);
	});
	window.addEventListener('touchcancel', function(event) { //使用touchcancel来取消高亮，避免一次点击既不触发tap，doubletap，longtap的事件
		if (!cell) {
			return;
		}
		toggleActive(false);
		sliderHandle && toggleEvents(cell, true);
	});
	var radioOrCheckboxClick = function(event) {
		var type = event.target && event.target.type || '';
		if (type === 'radio' || type === 'checkbox') {
			return;
		}
		var classList = cell.classList;
		if (classList.contains('mui-radio')) {
			var input = cell.querySelector('input[type=radio]');
			if (input) {
				//				input.click();
				input.checked = !input.checked;
				$.trigger(input, 'change');
			}
		} else if (classList.contains('mui-checkbox')) {
			var input = cell.querySelector('input[type=checkbox]');
			if (input) {
				//				input.click();
				input.checked = !input.checked;
				$.trigger(input, 'change');
			}
		}
	};
	//fixed hashchange(android)
	window.addEventListener($.EVENT_CLICK, function(e) {
		if (cell && cell.classList.contains('mui-collapse')) {
			e.preventDefault();
		}
	});
	window.addEventListener('doubletap', function(event) {
		if (cell) {
			radioOrCheckboxClick(event);
		}
	});
	var preventDefaultException = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;
	window.addEventListener('tap', function(event) {
		if (!cell) {
			return;
		}

		var isExpand = false;
		var classList = cell.classList;
		var ul = cell.parentNode;
		if (ul && ul.classList.contains(CLASS_RADIO_VIEW)) {
			if (classList.contains(CLASS_SELECTED)) {
				return;
			}
			var selected = ul.querySelector('li' + SELECTOR_SELECTED);
			if (selected) {
				selected.classList.remove(CLASS_SELECTED);
			}
			classList.add(CLASS_SELECTED);
			$.trigger(cell, 'selected', {
				el: cell
			});
			return;
		}
		if (classList.contains('mui-collapse') && !cell.parentNode.classList.contains('mui-unfold')) {
			if (!preventDefaultException.test(event.target.tagName)) {
				event.detail.gesture.preventDefault();
			}
			if (!classList.contains(CLASS_ACTIVE)) { //展开时,需要收缩其他同类
				var collapse = cell.parentNode.querySelector('.mui-collapse.mui-active');
				if (collapse) {
					collapse.classList.remove(CLASS_ACTIVE);
				}
				isExpand = true;
			}
			classList.toggle(CLASS_ACTIVE);
			if (isExpand) {
				//触发展开事件
				$.trigger(cell, 'expand');

				//scroll
				//暂不滚动
				// var offsetTop = $.offset(cell).top;
				// var scrollTop = document.body.scrollTop;
				// var height = window.innerHeight;
				// var offsetHeight = cell.offsetHeight;
				// var cellHeight = (offsetTop - scrollTop + offsetHeight);
				// if (offsetHeight > height) {
				// 	$.scrollTo(offsetTop, 300);
				// } else if (cellHeight > height) {
				// 	$.scrollTo(cellHeight - height + scrollTop, 300);
				// }
			}
		} else {
			radioOrCheckboxClick(event);
		}
	});
})(Eui, window, document);
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
	var holderClassName = 'mui-numbox';
	var plusClassName = 'mui-numbox-btn-plus';
	var minusClassName = 'mui-numbox-btn-minus';
	var inputClassName = 'mui-numbox-input';

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
	var CLASS_ICON = 'mui-icon';
	var CLASS_ICON_CLEAR = 'mui-icon-clear';
	var CLASS_ICON_SPEECH = 'mui-icon-speech';
	var CLASS_ICON_SEARCH = 'mui-icon-search';
	var CLASS_INPUT_ROW = 'mui-input-row';
	var CLASS_PLACEHOLDER = 'mui-placeholder';
	var CLASS_TOOLTIP = 'mui-tooltip';
	var CLASS_HIDDEN = 'mui-hidden';
	var CLASS_FOCUSIN = 'mui-focusin';
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
					row.classList.add('mui-active');
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
					element.parentNode.classList.add('mui-active');
				});
				element.addEventListener('blur', function() {
					if (!element.value.trim()) {
						element.parentNode.classList.remove('mui-active');
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
			if (this.type === 'range' && row.classList.contains('mui-input-range')) {
				actions.push('slider');
			} else {
				var classList = this.classList;
				if (classList.contains('mui-input-clear')) {
					actions.push('clear');
				}
				if (classList.contains('mui-input-speech')) {
					actions.push('speech');
				}
				if (this.type === 'search' && row.classList.contains('mui-search')) {
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
		$('.mui-input-row input').input();
	});
})(Eui, window, document);
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
			toast.classList.add('mui-toast-container');
			toast.innerHTML = '<div class="'+'mui-toast-message'+'">'+message+'</div>';
			document.body.appendChild(toast);
			setTimeout(function(){
		  		document.body.removeChild(toast);
			},2000);
		}
	};

})(Eui, window);
/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath extensions/extra.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 业务开发过程中，常见方法封装类.
 * @namespace Eui.Extra
 */
(function($){

    var Extra = Eui.Extra = {

        /**
         * 是否需要包装请求参数为 : reqJson : {} 的方式.
         * @type {Boolean}
         * @default true
         */
        warp : true,

        /**
         * 包装请求参数的默认KEY.
         * @type {String}
         * @default "reqJson"
         */
        warpKey : "reqJson",

        /**
         * 包装请求参数格式为{reqJson : {'id':'12','name':'metro'}}
         *
         * 备注：如果params参数为字符串，那么直接返回。
         *
         * @param {Object/Array} params
         * @param {Boolean} [warap] 是否需要包装请求参数,默认取{@link Eui.Extra.warp|warp}的值。
         * @param {String} [key] 参数的KEY，默认取默认取{@link Eui.Extra.warpKey|warpKey}的值
         * @returns {Object/String} 包装后的参数,格式：{reqJson : ''}
         */
        warpReqParams : function(params,warp,key){

            if($.isString(params)){
                return params;
            }

            var self = this,args = arguments,len = args.length,
                isWarp = self.warp,
                pkey = self.warpKey;

            if(len == 2){
                if($.isBoolean(warp)){
                    isWarp = warp;
                }else if($.isString(warp)){
                    key = warp;
                }else if($.isObject(warp)){
                    if(warp.hasOwnProperty("warp")){
                        isWarp = warp.warp;
                    }
                    if(warp.hasOwnProperty("warpKey")){
                        pkey = warp.warpKey;
                    }
                }
            }

            if(len == 3){
                isWarp = warp;
                pkey = key;
            }

            if(isWarp){
                var temp = {};
                temp[pkey] = $.encode(params);
                return temp;
            }

            return params;
        },

        /**
         *
         * 将对象的属性合并.
         *
         *      var objects = $.Extra.toDataObjects({"bizObj":{"memo":"进账摘要","name":"RecordedSummary"}});
         *
         *      var objects = $.Extra.toDataObjects([{"bizObj.memo":"进账摘要"},{"bizObj.name":"RecordedSummary"}]);
         *       // objects then equals:
         *       {
         *         "bizObj.memo" : "进账摘要",
         *         "bizObj.name" : "RecordedSummary"
         *       };
         *
         * @param {Object/Array} value 待处理对象或数组
         * @param {Boolean} [recursive=false] 为true时，递归对象
         * @returns {Object} 处理后的对象
         */
        toDataObjects : function(value,recursive,name){
            var self = Extra.toDataObjects,
                objects = {},i,ln;
            if ($.isArray(value)) {
                for (i = 0, ln = value.length; i < ln; i++) {
                    if (recursive) {
                        $.Object.merge(objects,self(value[i], true));
                    }
                    else {
                        objects[name] = value[i];
                    }
                }
            }else if($.isObject(value)){
                for(i in value){
                    if(value.hasOwnProperty(i)){
                        if(recursive){
                            $.Object.merge(objects,self(value[i], true,(name ? name + '.' : '') + i));
                        }else{
                            objects[name] = value[i];
                        }
                    }
                }
            }else{
                objects[name] = value;
            }
            return objects;
        },

        /**
         *
         * 批量替换键名称.
         *
         *      var opts = {
         *          dlgh : 500,
         *          dlgw : 400,
         *          winCfgs : {
         *              url : "test.html"
         *          },
         *          dlgtitle : "新增窗口"
         *      };
         *      //递归替换key值
         *      $.Extra.replaceKeys(opts,{
         *          "dlgh" : "height",
         *          "dlgw" : "width",
         *          "dlgtitle" : "title",
         *          "url" : "href"
         *      });
         *      //opts将会改为
         *      {
         *         height : 500,
         *         dlgw : 400,
         *         winCfgs : {
         *              href : "test.html"
         *          },
         *          title : "新增窗口"
         *      }
         *
         * @param {Object/Array} value 待替换的对象或数组
         * @param {Object} keyRefs 原始键/替换键的关系
         * @param {Boolean} [recursive=false] 是否递归替换
         * @param {Boolean} [remove=true] 是否保持原始key值.
         * @returns {Object} 处理后的对象
         */
        replaceKeys : function(value,keyRefs,recursive,remove){
            var self = this,
                recursive = (recursive != undefined ? recursive : false);
            remove = (remove != undefined ? remove : true);

            if($.isEmpty(value) || $.isEmpty(keyRefs)){return;}

            if($.isObject(value)){

                $.Object.each(value,function(key,val){
                    //判断是否包含待替换的key
                    if(keyRefs.hasOwnProperty(key)){
                        var targetKey = keyRefs[key];
                        if(!$.isEmpty(targetKey)){
                            value[targetKey] = val;
                            if(remove){
                                delete value[key];
                            }
                        }
                    }

                    //判断是否需要递归替换
                    if(recursive){
                        self.replaceKeys(val,keyRefs,recursive,remove);
                    }
                });

            }

            if($.isArray(value)){
                $.Array.each(value,function(item){
                    self.replaceKeys(item,keyRefs,recursive,remove);
                });
            }
        },

        /**
         *
         * 通过关键字过滤数据.
         *
         *       var opts = {
         *          dlgh : 500,
         *          dlgw : 400
         *       };
         *
         *      //最终opts值将会改为{dlgw:400}
         *      $.Extra.filterDataByKey(opts,["dlgh"]);
         *
         * @param {Object/Array} datas 待过滤的数据.
         * @param {Array} keys 待过滤的属性关键字.
         * @param {Boolean} [recursive=false] 是否递归
         *
         */
        filterDataByKey : function(datas,keys,recursive){
            var self = this;
            if($.isEmpty(keys)){return;}

            if($.isObject(datas)){
                $.Object.each(datas,function(key,value){
                    if($.Array.contains(keys,key)){
                        delete datas[key];
                    }else{
                        if(($.isObject(value) || $.isArray(value)) && recursive){
                            self.filterDataByKey(value,keys,recursive);
                        }
                    }
                });
            }

            if($.isArray(datas)){
                $.Array.each(datas,function(item){
                    self.filterDataByKey(item,keys,recursive);
                });
            }
        },

        /**
         *
         * 对象添加前缀.
         *
         * @param {Object} object 待处理对象.
         * @param {String} prefix 前缀
         * @returns {Object}
         */
        addPrefixForObject : function(object,prefix){
            if(!$.isEmpty(prefix) && $.isObject(object)){
                $.Object.each(object,function(key,value){
                    //如果参数包含‘.’，那么不做处理
                    if(key.indexOf('.') === -1){
                        object[prefix + '.' + key] = value;
                        delete object[key];
                    }
                });
            }
            return object;
        },

        /**
         * 获取对象指定层级的对象.
         * @param {Object} object 源对象.
         * @param {String} path 对象字符串路径,用`‘.’`分割.
         * @returns {Object} 结果对象
         */
        getFieldValue : function(object, path) {
            if (!object||!path){
                return object;
            }
            path = path.replace(/\[/g,".").replace(/\]/g,"");
            var fields = path.split(".");
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (typeof(object[field]) != "undefined") {
                    object = object[field];
                } else {
                    return ;
                }
            }
            return object;
        },

        /**
         * 获取本地文件数据.
         * @param {String} url 请求地址
         * @param {String} [dataType=json] 数据类型，比如：json,text,xml等.
         * @returns {Object} 数据对象
         */
        getLocalFileData : function(url,dataType){
            var dataType = dataType || "json",
                data = null;

            $.ajax({
                type: "GET",
                async : false, //同步
                dataType: dataType,
                url: url
            }).done(function(result) {
                data = result;
            });
            return data;
        },

        /**
         * 获取指定的webview对象.
         * @param {String} id
         * @returns {WebviewObject} webview
         */
        getWebviewById : function(id){
            return this.getPlusWebview().getWebviewById(id);
        },

        /**
         * 获取Webview模块管理应用窗口界面，实现多窗口的逻辑控制管理操作,前提必须plusReady.
         * @returns {Object} plus.webview应用界面管理对象
         */
        getPlusWebview : function(){
            return plus.webview;
        }
    };

    //表单相关操作.
    $.apply(Extra,{

        /**
         * 表单原始数据`data`名称标识.
         * @memberof Eui.Extra
         * @type {String}
         * @default "originalData"
         */
        formDataIdentify : "originalData",

        /**
         * 表单关键字.
         *
         * - `dataUrl` : 表单页面获取初始化数据的请求地址.
         * @memberof Eui.Extra
         * @type {Array}
         */
        formKeywords : ["dataUrl"],

        /**
         * 表单初始化时，是否绑定原始数据，以便提交时做合并.
         *
         * @memberof Eui.Extra
         * @type {Boolean}
         * @default true
         */
        isBindOriginalData : true,

        /**
         * 获取目标元素绑定的原始数据.
         *
         * @memberof Eui.Extra
         * @param {String} selector 目标选择器.
         * @returns {String/Object} 绑定的原始数据.
         */
        getBindDatas : function(selector){
            var self = this,
                target = $(selector);

            if(!target.length){
                $.toast($.String.format("未找到选择器{%}匹配的目标元素!",selector));
                return null;
            }

            return target.data(self.formDataIdentify);
        },

        /**
         * 目标元素绑定原始数据.
         *
         * @memberof Eui.Extra
         * @param {String/HtmlElement} selector 目标选择器或`dom`对象.
         * @param {String/Object} value 待绑定的数据.
         */
        setBindDatas : function(selector,value){
            var self = this,
                target = $(selector);

            if(!target.length){
                $.toast($.String.format("未找到选择器{%}匹配的目标元素!",selector));
                return;
            }

            target.data(self.formDataIdentify,value);
        },

        /**
         * 去掉字符串空格.
         *
         * @memberof Eui.Extra
         * @param {String} serialize 序列化的字符串
         * @returns {String} 格式化后的字符串
         */
        trimSerialize : function(serialize){
            return decodeURIComponent(serialize.replace(/\+/g," "))
        },

        /**
         * 获取表单序列化值（默认跟初始化数据作合并）.
         *
         * @memberof Eui.Extra
         * @param {String} selector jq选择器表达式
         * @param {String} [prefix] 默认数据添加前缀.
         * @param {Array} [keywords] 待过滤的key.
         *
         * @returns {Object}
         */
        getFormSerializeValues : function(selector,prefix,keywords){
            var self = this,target = selector,
                fKeywords = keywords && $.isArray(keywords) ? $.Array.union(self.formKeywords,keywords) : self.formKeywords;

            if($.isString(selector)){
                target = $(selector);
            }
            var formDatas = $.Object.fromQueryString(self.trimSerialize(target.serialize()));

            //过滤关键字属性值.
            self.filterDataByKey(formDatas,fKeywords,false);

            //获取表单绑定的原始数据.
            var originalData = self.getBindDatas(target);
            if(originalData){
                formDatas = $.merge(originalData,formDatas);
            }

            //是否需要添加前缀.
            if(prefix){
                self.addPrefixForObject(formDatas,prefix);
            }

            return formDatas;
        },

        /**
         * 加载表单数据,批量设置值,赋值操作调用{@link $.fn#setValues|setValues}方法.
         *
         * @memberof Eui.Extra
         * @param {String/HtmlElement} target 选择器表达式或者HtmlElement对象.
         * @param {String/Object} data 请求地址或者数据.
         * @param {Object} param 请求参数.
         * @param {Object} events 加载表单相关事件.
         * @param {Function} [events.onBeforeLoad] (Optional) 加载表单数据之前执行的事件.
         * @param {Function} [events.onBeforeLoad.param] 请求参数.
         * @param {Function} [events.onBeforeLoad.data] 数据或请求地址.
         * @param {Function} [events.onBeforeLoad.return] 返回false来阻止表单数据加载.
         * @param {Function} [events.onLoadSuccess] 远程获取表单数据成功时执行.
         * @param {Function} [events.onLoadSuccess.data] 数据.
         * @param {Function} [events.onAfterLoad] 表单加载数据批量赋值成功后执行，提供参数：data.
         * @param {Function} [events.onAfterLoad.data] 数据.
         * @param {Function} [events.onLoadError] 远程获取表单数据失败执行.
         * @param {String} [dataNode="data"] 指定初始化数据节点路径,如果没指定，那么获取默认`data`节点.
         * @param {Boolean} showWait 是否显示遮罩信息.
         *
         */
        loadFormData : function(target,data,param,events,dataNode,showWait){
            var me = this,
                param = param || {},
                events = events || {};

            var onBeforeLoad = events.onBeforeLoad || $.emptyFn,
                onLoadSuccess = events.onLoadSuccess || $.emptyFn,
                onLoadError = events.onLoadError || $.emptyFn,
                onAfterLoad = events.onAfterLoad || $.emptyFn;

            var form = $(target);
            if(!form.length){
                $.toast($.String.format("未找到匹配的form{0},请检查参数是否正确!",target));
                return;
            }

            if (onBeforeLoad.call(me, param,data) == false) return;

            //显示遮罩
            if(showWait){
                plus.nativeUI.showWaiting('加载数据中...', {padlock : true});
            }
            //data为请求地址？
            if (typeof data == 'string'){
                $.Comm.postToRemote({
                        url : data,
                        async : false
                    },param,
                    function(rslt){
                        //检测返回结果格式是否为对象.
                        if(!$.isObject(rslt)){
                            $.toast($.String.format("结果{%}不为javascript Object，请检查返回结果格式是否正确！",rslt));
                            return;
                        }
                        data = rslt;

                        if($.isSuccess(rslt)){
                            if(onLoadSuccess){onLoadSuccess(rslt);}
                        }
                    },onLoadError
                );
            }

            if(dataNode){
                data = me.getFieldValue(data,dataNode);
            }else{
                if(data.hasOwnProperty("data")){
                    data = data.data;
                }
            }

            if(data){
                //将data转化成对象
                data = me.toDataObjects(data,true);
            }

            form.setValues(data);

            if(showWait){
                plus.nativeUI.closeWaiting();
            }

            if(me.isBindOriginalData){
                me.setBindDatas(form,data);
            }
            if(onAfterLoad){onAfterLoad(data);}
        }
    });

    $.apply(Eui,{

        /**
         * 判断是否是移动终端.
         * @returns {Boolean}
         */
        isMobileTerminal : function(){
            return $.os.android || $.os.ios;
        },

        /**
         * 判断是否成功标识.备注：当后端返回的成功状态标识不为success=true/false时可通过该方法重写。
         *
         * @memberof $
         * @param {Object} response 后端响应的数据.
         */
        isSuccess : function(response){
            return response.success;
        }
    });
}(Eui));


/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath extensions/comm.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($){
    /**
     * 数据通信封装类，跟后端交互统一入口。
     * @namespace Eui.Comm
     */
    var Comm = Eui.Comm = {

        /**
         * 远程`Ajax`请求超时时间(毫秒).
         * @type {Number}
         * @default 120000
         */
        ajaxTimeout : 120000,

        /**
         * 基于业务Ajax默认配置项.
         *
         * - `type` : 'post'
         * - `cache` : false
         * - `async` : true
         * - `timeout` : 120000(默认与{@link Eui.Comm.ajaxTimeout|ajaxTimeout}一致)
         * - `traditional` : true
         * - `dataType` : 'json'
         * - `autoWait` : false(是否显示等待进度)
         *
         * @type {Object}
         *
         */
        defaultAjaxSettings : {
            type : 'post',
            cache : false,
            data : {},
            async : true,
            traditional : true,
            dataType : 'json',
            autoWait : false
        },

        /**
         * 是否使用原生通信,一般在发布时，设置为`true`.
         * @type {Boolean}
         * @default false
         */
        useNative : false,

        /**
         *
         * 调用远程http接口,支持的参数格式如下：
         *
         *      postToRemote(ajaxSetting)
         *      postToRemote(ajaxSetting,callbackSuccess,errorCallback)
         *      postToRemote(ajaxSetting,params,callbackSuccess,errorCallback)
         *      postToRemote(url,callbackSuccess,errorCallback)
         *      postToRemote(url,params,callbackSuccess,errorCallback)
         *
         * @param {String/Object} url 字符串类型的请求地址或者`ajax`配置项，详情可查看{@link $.ajaxSettings}.
         *
         * 备注：如果请求地址不是完整的路径，那么框架会自动从Storage中获取`remoteUrl`的值作为路径前缀.
         * @param {Object/String} [params] 参数格式可以是`对象`也可以是`序列化`后的字符串.
         * 如果该参数不为空，那么会调用{@link Eui.Extra.warpReqParams|warpReqParams}方法包装参数.
         *
         * 备注：如果是`字符串`类型必须是有效的序列化字符串.通过{@link $.param}方法可将对象序列化成字符串.
         * @param {Function} [callbackSuccess] 成功回调函数.
         * @param {Object} callbackSuccess.response 返回数据
         * @param {Boolean} callbackSuccess.response.success  成功状态
         * @param {string} [callbackSuccess.response.message] 返回信息
         * @param {Object} callbackSuccess.response.data 数据节点
         * @param  {Function} [errorCallback] 错误回调函数.
         * @param {boolean} errorCallback.textStatus  状态
         * @param {string} errorCallback.errorThrown 错误信息
         * @param {Boolean} [autoWait=false] 是否显示等待遮罩.
         *
         *
         */
        postToRemote : function(url,params,successCallback,errorCallback,autoWait){
            var self = this,args = arguments,len = args.length,
                defaultAjaxSettings = self.defaultAjaxSettings,
                fullUrl = url,
                isMobile = $.isMobileTerminal();

            var ajaxSetting = $.clone(defaultAjaxSettings);
            var autoWait = autoWait != undefined ? autoWait : ajaxSetting.autoWait; //显示等待

            if(!ajaxSetting.hasOwnProperty("timeout")){
                $.extend(ajaxSetting,{
                    timeout : self.ajaxTimeout
                });
            }

            if($.isObject(url)){
                $.extend(ajaxSetting,url);
                fullUrl = url.url;
            }

            //判断是否完整路径
            if(!self.testingURL(fullUrl)){
                var baseUrl = self.getBaseUrl(isMobile);
                if(baseUrl){
                    fullUrl = baseUrl + fullUrl;
                }
            }
            $.extend(ajaxSetting,{
                url : fullUrl
            });

            if(len > 1){
                var  successFunc = successCallback ? successCallback : $.emptyFn,
                    errorFunc = errorCallback ? errorCallback : $.emptyFn;

                //如果第二个参数是个成功回调函数
                if($.isFunction(params)){
                    successFunc = params;
                    if(successCallback){
                        errorFunc = successCallback;
                    }
                }else{
                    $.extend(ajaxSetting,{
                        data : $.Extra.warpReqParams(params)
                    });
                }

                $.extend(ajaxSetting,{
                    success : function(response) {
                        if(!$.isObject(response)){
                            response = $.decode(response);
                        }
                        self.recvSuccessDispatch(successFunc,response);
                    },
                    error : function(response){
                        self.recvErrorDispatch(errorFunc,response);
                    },
                    beforeSend : function(xhr, setting){
                        if ($.debug) {
                            console.log('beforeSend:::' + JSON.stringify(setting));
                        }
                        //显示等待
                        if(autoWait && isMobile){plus.nativeUI.showWaiting('请求中...', {padlock : true});}
                    },
                    complete : function(xhr, status) {
                        //关闭等待
                        if(autoWait && isMobile) plus.nativeUI.closeWaiting();
                    }
                });
            }

            if(self.useNative){
                self.realizeNativeAjax(ajaxSetting);
            }else
                $.ajax(ajaxSetting);
        },

        /**
         * 获取完整路径，如果是APP模式，那么获取缓存中的`remoteUrl`值否则获取`proxyUrl`(开发环境使用).
         * @param {Boolean} [isMobile]
         */
        getBaseUrl : function(isMobile){
            var is = isMobile != undefined ? isMobile : $.isMobileTerminal();
            var key = is ? "remoteUrl" : "proxyUrl";
            return $.Storage.getItem(key);
        },

        /**
         * 判断请求地址以http或https开头,.json结束.
         * @private
         * @param {String} url 请求地址
         * @returns {boolean}
         */
        testingURL : function(url){
            var rec = /^((https|http):\/\/)|(.json)$/i;
            return rec.test(url);
        },

        /**
         * 实现原生AJAX调用.
         * @param {Object} ajaxSettings
         * @param {String} ajaxSettings.url 编码过的url
         * @param {String} ajaxSettings.data 参数 若为get请求则传空字符串 ""
         * @param {String} ajaxSettings.type 请求方式 get 或者 post ："get","post"
         * @param {String} ajaxSettings.async 同步或者异步 :"1"为异步，"0"为同步
         * @param {String} ajaxSettings.timeout 超时时间
         * @param {Function} ajaxSettings.successCallback 异步请求成功的回调，同步传空字符串 ""
         * @param {Function} ajaxSettings.errorCallback 异步请求失败的回调，一般是请求超时之类的回调 同步传空字符串 ""
         */
        realizeNativeAjax : function(ajaxSettings){
            var self = this,
                url = ajaxSettings.url,
                data = ajaxSettings.data,
                type = ajaxSettings.type,
                async = ajaxSettings.async ? "1" : "0",
                timeout = ajaxSettings.timeout,
                successCallback = ajaxSettings.success,
                errorCallback = ajaxSettings.error;

            //如果不是空的对象，将参数转换成查询字符串格式.
            if($.isObject(data)){
                if(!$.isEmptyObject(data)){
                    data = $.param(data);
                }else{
                    data = "";
                }
            }
            timeout = timeout.toString();

            plus.httpEngine.httpReq(
                url,
                data,
                type,
                async,
                timeout,
                successCallback,
                errorCallback
            );
        },

        /**
         * 基于返回值分发成功回调,可重写来实现默认处理。
         *
         * @param {Function} callbackSuccess 成功回调函数
         * @param {Object} response 后端返回数据
         * @param {Boolean} response.success  成功状态
         * @param {string} [response.message] 返回信息
         * @param {Object} response.data 数据节点
         *
         */
        recvSuccessDispatch : function(callbackSuccess,json){
            if(json){
                if (json.success) {
                    if ($.debug) {
                        if (json.data) {
                            console.log(json.data);
                        }
                    }
                } else {
                    if ($.debug) {
                        var msg = json.message || "";
                        console.log('Failure:' + msg);
                    }
                }
            }

            callbackSuccess(json);
        },

        /**
         * textStatus, errorThrown
         * 基于返回值分发错误回调.
         * @param {Function} callbackError 错误回调函数
         * @param {boolean} textStatus  状态
         * @param {string} errorThrown 错误信息
         */
        recvErrorDispatch : function(callbackError,response){
            if($.isEmpty(response)){
                response = {};
            }
            if($.isString(response)){
                response = $.decode(response);
            }
            var textStatus = response.textStatus || "";
            var errorThrown = response.errorThrown || "网络异常.";
            if ($.debug) {
                console.log('error:' + errorThrown);
            }
            callbackError(textStatus,errorThrown);
        }
    };

}(Eui));
/**
 * (c)2015  Create at: 2015-06-12
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath extensions/extra.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($,alias){

    /**
     * Storage模块管理应用本地数据存储区，用于应用数据的保存和读取。应用本地数据与localStorage、sessionStorage的区别在于数据有效域不同，
     * 前者可在应用内跨域操作，数据存储期是持久化的，并且没有容量限制。通过Eui.Storage._getStorageObj可获取应用本地数据管理对象。
     *
     * @namespace Eui.Storage
     */
    var Storage = Eui.Storage = {

        /**
         * 存储的策略，可选值有：
         * - `localStorage`
         * - `storage` : H5+实现，调用方式必须放在$.plusReady内部，否则获取不到存储对象.
         *
         * @type {String}
         * @default "localStorage"
         */
        storageStrategy : 'localStorage',

        /**
         * 获取数据管理对象，如果是客户端是浏览器那么返回的是localStorage,如是手机，那么返回的是plus.storage。
         * @returns {localStorage/plus.storage}
         * @private
         */
        _getStorageObj : function(){
            var self = this,
                strategy = self.storageStrategy,
                storeObj;

            switch (strategy){
                case "localStorage":
                    storeObj = localStorage;
                    break;
                case "storage" :
                    if(window.plus){
                        storeObj = plus.storage;
                    }else{
                        console.error('plus object have not ready,please invoking Storage object from within the $.pluReady function.');
                    }
                    break;
            }
            return storeObj;
        },

        /**
         * 获取storage中保存的键值对的数量.
         * @returns {Number} 键值对数量
         */
        getLength : function(){
            var self = this,
                strategy = self.storageStrategy,
                storageObj = self._getStorageObj();

            return strategy == "storage" ? storageObj.getLength() : storageObj.length;
        },

        /**
         * 通过key值检索键值。
         * 备注：因为存储的只能是字符串,所以可以通过{@link Eui.JSON.decode}为true,将值转换成对象.
         * @param {String} key 键
         * @param {Boolean} [decode=false] 是否需要解码
         * @returns {String/Object} decode为true时，返回对象.
         */
        getItem : function(key,decode){
            var value = this._getStorageObj().getItem(key);
            return decode ? $.decode(value) :value;
        },

        /**
         * 存储key-value.
         *
         * 备注：存储的键和值没有容量限制，但过多的数据量会导致效率降低，建议单个键值数据不要超过`10Kb`。
         * @param {String} key 存储的键值
         * @param {String/Object} value 存储的内容,如果value是对象,自动会进行编码.
         */
        setItem : function(key,value){
            if($.isObject(value)){
                value = $.encode(value);
            }
            this._getStorageObj().setItem(key, value);
        },

        /**
         * 通过key值删除键值对.
         * @param {String} key 存储的键值
         */
        removeItem : function(key){
            this._getStorageObj().removeItem(key);
        },

        /**
         * 清除应用所有的键值对.
         */
        clear : function(){
            this._getStorageObj().clear();
        },

        /**
         * 获取键值对中指定索引值的key值.
         * @param {Number} index 存储键值的索引
         * @returns {String} 键值
         */
        key : function(index){
            return this._getStorageObj().key(index);
        },

        /**
         * 获取本地JSON文件数据.
         * @param {String} url 请求地址
         * @param {String} [dataType=json] 数据类型，比如：json,text,xml等.
         * @returns {Object} 数据对象
         */
        getLocalFileData : function(url,dataType){
            var dataType = dataType || "json",
                data = null;

            $.ajax({
                type: "GET",
                async : false, //同步
                dataType: dataType,
                url: url,
                success : function(result){
                    data = result;
                }
            });
            return data;
        },

        // 备注：`json`文件只支持对象格式.
        /**
         * 将对象按键值对方式存储到缓存(localStorage)。
         * @param {Object} obj 待存储对象.
         */
        initStorage : function(configPath){
            var self = this,
                configs = configPath;

            //如果是请求本地json文件.
            if($.isString(configPath) && /.*?\.json$/.test(configPath)){
                configs = self.getLocalFileData(configPath,"json");
            }

            if($.isObject(configs)){
                $.Object.each(configs,function(key,value){
                    if(!$.isString(value)){
                        value = $.encode(value);
                    }
                    $.Storage.setItem(key,value);
                });
            }
        }
    };

    $.apply($,{

        /**
         * Old alias to {@link Eui.Storage.initStorage|initStorage}
         * @method #initStorage
         * @memberof Eui
         */
        initStorage : alias(Storage,'initStorage')
    });

}(Eui,Eui.Function.alias));
/**
 * (c)2015  Create at: 2015-06-24
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath extensions/template.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */

/**
 * Template类是对腾讯的{@link http://aui.github.io/artTemplate/|artTemplate}的抽象封装。
 * 在项目中，我们一般采用{@link https://code.csdn.net/Tencent/tmodjs|tmodjs}预编译模板。
 *
 * `注意`：在调用tempalte方法之前，必须确保页面已经引入template.js文件.
 *
 * ###预编译模板优势
 *
 * - `利于维护`：基于文件进行管理，大量模板可以有序组织
 * - `模板复用`：模板自身支持include语句引入外部模板文件，自动提前加载
 * - `调试友好`：编译后的模板无evel与new Function，错误可以被浏览器捕获；亦可映射模板文件到本地进行开发
 * - `按需加载`：各取所需，最大化节省网络流量
 * - `按需合并`：可通过打包工具按需合并模板，以减少HTTP请求数
 * - `跨域部署`：模板不再受限页面以及页面所处的域，可部署至CDN
 *
 * ###友情链接:
 *
 * 1、[atc-前端模板预编译器](http://cdc.tencent.com/?p=7382)
 *
 * 2、[高性能JavaScript模板引擎](http://www.iteye.com/news/25340)
 *
 * @namespace Eui.Template
 */
(function($,alias){

    var Template = Eui.Template = {

        /**
         * 根据 id 渲染模板.
         *
         * 备注：如果没有 data 参数，那么将返回一渲染函数.
         *
         * @param {String} id 即模板文件路径
         * @param {Object/Array} [data] 数据
         * @returns {String/Function} 没有`data`参数时，返回渲染函数，否则返回渲染后的html代码.
         */
        template : function(id,data){
            data = data || {};
            return template(id,data);
        }
    };

    $.apply($,{

        /**
         * {@link Eui.Template.template} 方法的别名.
         * @method #template
         * @param {String} id 模板ID
         * @param {Object} [data] 数据对象
         * @memberof Eui
         */
        template : alias(Template,'template')
    });
}(Eui,Eui.Function.alias));