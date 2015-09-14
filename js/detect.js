/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath detect.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @namespace Detect
 * @desc 提供 $.os和 $.browser消息,该检测方法可以在不同的环境中微调你的站点或者应用程序，
 * 并帮助你识别手机和平板；以及不同的浏览器和操作系统。

     // The following boolean flags are set to true if they apply,
     // if not they're either set to `false` or `undefined`.
     // We recommend accessing them with `!!` prefixed to coerce to a boolean.

     // general device type

         $.os.phone
         $.os.tablet

         // specific OS
         $.os.ios
         $.os.android
         $.os.webos
         $.os.blackberry
         $.os.bb10
         $.os.rimtabletos

         // specific device type
         $.os.iphone
         $.os.ipad
         $.os.ipod // [v1.1]
         $.os.touchpad
         $.os.kindle

         // specific browser
         $.browser.chrome
         $.browser.firefox
         $.browser.safari // [v1.1]
         $.browser.webview // (iOS) [v1.1]
         $.browser.silk
         $.browser.playbook
         $.browser.ie // [v1.1]

         // 此外，版本信息是可用的。
         // 下面是运行​​iOS 6.1的iPhone所返回的。
         !!$.os.phone         // => true
         !!$.os.iphone        // => true
         !!$.os.ios           // => true
         $.os.version       // => "6.1"
         $.browser.version  // => "536.26"
 *
 */

(function($){
    function detect(ua, platform){
        var os = this.os = {}, browser = this.browser = {},
            webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
            plus = ua.match(/Html5Plus/i),
            streamApp = ua.match(/StreamApp/i),
            android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
            osx = !!ua.match(/\(Macintosh\; Intel /),
            ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
            ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
            iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
            wechat = ua.match(/(MicroMessenger)\/([\d\.]+)/i),
            webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
            win = /Win\d{2}|Windows/.test(platform),
            wp = ua.match(/Windows Phone ([\d.]+)/),
            touchpad = webos && ua.match(/TouchPad/),
            kindle = ua.match(/Kindle\/([\d.]+)/),
            silk = ua.match(/Silk\/([\d._]+)/),
            blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
            bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
            rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
            playbook = ua.match(/PlayBook/),
            chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
            firefox = ua.match(/Firefox\/([\d.]+)/),
            firefoxos = ua.match(/\((?:Mobile|Tablet); rv:([\d.]+)\).*Firefox\/[\d.]+/),
            ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
            webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
            safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

        // Todo: clean this up with a better OS/browser seperation:
        // - discern (more) between multiple browsers on android
        // - decide if kindle fire in silk mode is android or not
        // - Firefox on Android doesn't specify the Android version
        // - possibly devide in os, device and browser hashes

        if (browser.webkit = !!webkit) browser.version = webkit[1]
        if(plus){
            os.plus = true;
            $(function() {
                document.body.classList.add($.className('plus'))
            });
            if (streamApp) { //TODO 最好有流应用自己的标识
                os.stream = true;
                $(function() {
                    document.body.classList.add($.className('plus-stream'));
                });
            }
        }
        if (android) os.android = true, os.version = android[2],os.isBadAndroid = !(/Chrome\/\d/.test(window.navigator.appVersion))
        if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
        if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
        if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null
        if (wp) os.wp = true, os.version = wp[1]
        if(wechat)os.wechat = { version : wechat[2].replace(/_/g, '.')}
        if (webos) os.webos = true, os.version = webos[2]
        if (touchpad) os.touchpad = true
        if (blackberry) os.blackberry = true, os.version = blackberry[2]
        if (bb10) os.bb10 = true, os.version = bb10[2]
        if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
        if (playbook) browser.playbook = true
        if (kindle) os.kindle = true, os.version = kindle[1]
        if (silk) browser.silk = true, browser.version = silk[1]
        if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
        if (chrome) browser.chrome = true, browser.version = chrome[1]
        if (firefox) browser.firefox = true, browser.version = firefox[1]
        if (firefoxos) os.firefoxos = true, os.version = firefoxos[1]
        if (ie) browser.ie = true, browser.version = ie[1]
        if (safari && (osx || os.ios || win)) {
            browser.safari = true
            if (!os.ios) browser.version = safari[1]
        }
        if (webview) browser.webview = true

        os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
        (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
        os.phone  = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
        (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
        (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
    }

    detect.call($, navigator.userAgent, navigator.platform)
    // make available to unit tests
    $.__detect = detect

})(Eui);