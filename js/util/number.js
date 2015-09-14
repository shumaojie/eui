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