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
