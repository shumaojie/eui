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