/**
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath supports.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * Determines information about features are supported in the current environment
 */
(function(){

    Eui.supports = {

        /**
         * PointerEvents True if document environment supports the CSS3 pointer-events style.
         * @type {Boolean}
         */
        PointerEvents: 'pointerEvents' in document.documentElement.style,

        // IE10/Win8 throws "Access Denied" accessing window.localStorage, so this test
        // needs to have a try/catch
        /**
         * LocalStorage True if localStorage is supported
         * @type {Boolean}
         */
        LocalStorage: (function() {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        })(),

        /**
         * CSS3BoxShadow True if document environment supports the CSS3 box-shadow style.
         * @type {Boolean}
         */
        CSS3BoxShadow: 'boxShadow' in document.documentElement.style || 'WebkitBoxShadow' in document.documentElement.style || 'MozBoxShadow' in document.documentElement.style,

        /**
         * ClassList True if document environment supports the HTML5 classList API.
         * @type {Boolean}
         */
        ClassList: !!document.documentElement.classList,

        /**
         * OrientationChange True if the device supports orientation change
         * @type {Boolean}
         */
        OrientationChange: ((typeof window.orientation != 'undefined') && ('onorientationchange' in window)),

        /**
         * DeviceMotion True if the device supports device motion (acceleration and rotation rate)
         * @type {Boolean}
         */
        DeviceMotion: ('ondevicemotion' in window),

        /**
         * TimeoutActualLateness True if the browser passes the "actualLateness" parameter to
         * setTimeout.
         * @see {@link https://developer.mozilla.org/en/DOM/window.setTimeout}
         * @type {Boolean}
         */
        TimeoutActualLateness: (function(){
            setTimeout(function(){
                Eui.supports.TimeoutActualLateness = arguments.length !== 0;
            }, 0);
        }())
    };
}());