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
