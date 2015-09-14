/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath extensions/comm.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($){
    /**
     * 数据通信封装类，跟后端交互统一入口。
     * @namespace Eui.Comm
     */
    var Comm = Eui.Comm = {

        /**
         * 远程`Ajax`请求超时时间(毫秒).
         * @type {Number}
         * @default 120000
         */
        ajaxTimeout : 120000,

        /**
         * 基于业务Ajax默认配置项.
         *
         * - `type` : 'post'
         * - `cache` : false
         * - `async` : true
         * - `timeout` : 120000(默认与{@link Eui.Comm.ajaxTimeout|ajaxTimeout}一致)
         * - `traditional` : true
         * - `dataType` : 'json'
         * - `autoWait` : false(是否显示等待进度)
         *
         * @type {Object}
         *
         */
        defaultAjaxSettings : {
            type : 'post',
            cache : false,
            data : {},
            async : true,
            traditional : true,
            dataType : 'json',
            autoWait : false
        },

        /**
         * 是否使用原生通信,一般在发布时，设置为`true`.
         * @type {Boolean}
         * @default false
         */
        useNative : false,

        /**
         *
         * 调用远程http接口,支持的参数格式如下：
         *
         *      postToRemote(ajaxSetting)
         *      postToRemote(ajaxSetting,callbackSuccess,errorCallback)
         *      postToRemote(ajaxSetting,params,callbackSuccess,errorCallback)
         *      postToRemote(url,callbackSuccess,errorCallback)
         *      postToRemote(url,params,callbackSuccess,errorCallback)
         *
         * @param {String/Object} url 字符串类型的请求地址或者`ajax`配置项，详情可查看{@link $.ajaxSettings}.
         *
         * 备注：如果请求地址不是完整的路径，那么框架会自动从Storage中获取`remoteUrl`的值作为路径前缀.
         * @param {Object/String} [params] 参数格式可以是`对象`也可以是`序列化`后的字符串.
         * 如果该参数不为空，那么会调用{@link Eui.Extra.warpReqParams|warpReqParams}方法包装参数.
         *
         * 备注：如果是`字符串`类型必须是有效的序列化字符串.通过{@link $.param}方法可将对象序列化成字符串.
         * @param {Function} [callbackSuccess] 成功回调函数.
         * @param {Object} callbackSuccess.response 返回数据
         * @param {Boolean} callbackSuccess.response.success  成功状态
         * @param {string} [callbackSuccess.response.message] 返回信息
         * @param {Object} callbackSuccess.response.data 数据节点
         * @param  {Function} [errorCallback] 错误回调函数.
         * @param {boolean} errorCallback.textStatus  状态
         * @param {string} errorCallback.errorThrown 错误信息
         * @param {Boolean} [autoWait=false] 是否显示等待遮罩.
         *
         *
         */
        postToRemote : function(url,params,successCallback,errorCallback,autoWait){
            var self = this,args = arguments,len = args.length,
                defaultAjaxSettings = self.defaultAjaxSettings,
                fullUrl = url,
                isMobile = $.isMobileTerminal();

            var ajaxSetting = $.clone(defaultAjaxSettings);
            var autoWait = autoWait != undefined ? autoWait : ajaxSetting.autoWait; //显示等待

            if(!ajaxSetting.hasOwnProperty("timeout")){
                $.extend(ajaxSetting,{
                    timeout : self.ajaxTimeout
                });
            }

            if($.isObject(url)){
                $.extend(ajaxSetting,url);
                fullUrl = url.url;
            }

            //判断是否完整路径
            if(!self.testingURL(fullUrl)){
                var baseUrl = self.getBaseUrl(isMobile);
                if(baseUrl){
                    fullUrl = baseUrl + fullUrl;
                }
            }
            $.extend(ajaxSetting,{
                url : fullUrl
            });

            if(len > 1){
                var  successFunc = successCallback ? successCallback : $.emptyFn,
                    errorFunc = errorCallback ? errorCallback : $.emptyFn;

                //如果第二个参数是个成功回调函数
                if($.isFunction(params)){
                    successFunc = params;
                    if(successCallback){
                        errorFunc = successCallback;
                    }
                }else{
                    $.extend(ajaxSetting,{
                        data : $.Extra.warpReqParams(params)
                    });
                }

                $.extend(ajaxSetting,{
                    success : function(response) {
                        if(!$.isObject(response)){
                            response = $.decode(response);
                        }
                        self.recvSuccessDispatch(successFunc,response);
                    },
                    error : function(response){
                        self.recvErrorDispatch(errorFunc,response);
                    },
                    beforeSend : function(xhr, setting){
                        if ($.debug) {
                            console.log('beforeSend:::' + JSON.stringify(setting));
                        }
                        //显示等待
                        if(autoWait && isMobile){plus.nativeUI.showWaiting('请求中...', {padlock : true});}
                    },
                    complete : function(xhr, status) {
                        //关闭等待
                        if(autoWait && isMobile) plus.nativeUI.closeWaiting();
                    }
                });
            }

            if(self.useNative){
                self.realizeNativeAjax(ajaxSetting);
            }else
                $.ajax(ajaxSetting);
        },

        /**
         * 获取完整路径，如果是APP模式，那么获取缓存中的`remoteUrl`值否则获取`proxyUrl`(开发环境使用).
         * @param {Boolean} [isMobile]
         */
        getBaseUrl : function(isMobile){
            var is = isMobile != undefined ? isMobile : $.isMobileTerminal();
            var key = is ? "remoteUrl" : "proxyUrl";
            return $.Storage.getItem(key);
        },

        /**
         * 判断请求地址以http或https开头,.json结束.
         * @private
         * @param {String} url 请求地址
         * @returns {boolean}
         */
        testingURL : function(url){
            var rec = /^((https|http):\/\/)|(.json)$/i;
            return rec.test(url);
        },

        /**
         * 实现原生AJAX调用.
         * @param {Object} ajaxSettings
         * @param {String} ajaxSettings.url 编码过的url
         * @param {String} ajaxSettings.data 参数 若为get请求则传空字符串 ""
         * @param {String} ajaxSettings.type 请求方式 get 或者 post ："get","post"
         * @param {String} ajaxSettings.async 同步或者异步 :"1"为异步，"0"为同步
         * @param {String} ajaxSettings.timeout 超时时间
         * @param {Function} ajaxSettings.successCallback 异步请求成功的回调，同步传空字符串 ""
         * @param {Function} ajaxSettings.errorCallback 异步请求失败的回调，一般是请求超时之类的回调 同步传空字符串 ""
         */
        realizeNativeAjax : function(ajaxSettings){
            var self = this,
                url = ajaxSettings.url,
                data = ajaxSettings.data,
                type = ajaxSettings.type,
                async = ajaxSettings.async ? "1" : "0",
                timeout = ajaxSettings.timeout,
                successCallback = ajaxSettings.success,
                errorCallback = ajaxSettings.error;

            //如果不是空的对象，将参数转换成查询字符串格式.
            if($.isObject(data)){
                if(!$.isEmptyObject(data)){
                    data = $.param(data);
                }else{
                    data = "";
                }
            }
            timeout = timeout.toString();

            plus.httpEngine.httpReq(
                url,
                data,
                type,
                async,
                timeout,
                successCallback,
                errorCallback
            );
        },

        /**
         * 基于返回值分发成功回调,可重写来实现默认处理。
         *
         * @param {Function} callbackSuccess 成功回调函数
         * @param {Object} response 后端返回数据
         * @param {Boolean} response.success  成功状态
         * @param {string} [response.message] 返回信息
         * @param {Object} response.data 数据节点
         *
         */
        recvSuccessDispatch : function(callbackSuccess,json){
            if(json){
                if (json.success) {
                    if ($.debug) {
                        if (json.data) {
                            console.log(json.data);
                        }
                    }
                } else {
                    if ($.debug) {
                        var msg = json.message || "";
                        console.log('Failure:' + msg);
                    }
                }
            }

            callbackSuccess(json);
        },

        /**
         * textStatus, errorThrown
         * 基于返回值分发错误回调.
         * @param {Function} callbackError 错误回调函数
         * @param {boolean} textStatus  状态
         * @param {string} errorThrown 错误信息
         */
        recvErrorDispatch : function(callbackError,response){
            if($.isEmpty(response)){
                response = {};
            }
            if($.isString(response)){
                response = $.decode(response);
            }
            var textStatus = response.textStatus || "";
            var errorThrown = response.errorThrown || "网络异常.";
            if ($.debug) {
                console.log('error:' + errorThrown);
            }
            callbackError(textStatus,errorThrown);
        }
    };

}(Eui));