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