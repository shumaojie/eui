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

