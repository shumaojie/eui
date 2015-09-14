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