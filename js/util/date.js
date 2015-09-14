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
