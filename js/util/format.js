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
