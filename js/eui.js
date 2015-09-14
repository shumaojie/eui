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