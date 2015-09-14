/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath ajax.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * XMLHttpRequest 和 JSONP 实用功能.
 */

(function ($) {
    var jsonpID = 0,
        document = window.document,
        key,
        name,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/,
        originAnchor = document.createElement('a')

    originAnchor.href = window.location.href

    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
        var event = $.Event(eventName)
        $(context).trigger(event, data)
        return !event.isDefaultPrevented()
    }

    // trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
        if (settings.global) return triggerAndReturn(context || document, eventName, data)
    }

    // Number of active Ajax requests
    $.active = 0

    function ajaxStart(settings) {
        if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
    }

    function ajaxStop(settings) {
        if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
    }

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend(xhr, settings) {
        var context = settings.context
        if (settings.beforeSend.call(context, xhr, settings) === false ||
            triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
            return false

        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }

    function ajaxSuccess(data, xhr, settings, deferred) {
        var context = settings.context, status = 'success'
        settings.success.call(context, data, status, xhr)
        if (deferred) deferred.resolveWith(context, [data, status, xhr])
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
        ajaxComplete(status, xhr, settings)
    }

    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings, deferred) {
        var context = settings.context
        settings.error.call(context, xhr, type, error)
        if (deferred) deferred.rejectWith(context, [xhr, type, error])
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
        ajaxComplete(type, xhr, settings)
    }

    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
        var context = settings.context
        settings.complete.call(context, xhr, status)
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
        ajaxStop(settings)
    }

    // Empty function, used as default callback
    function empty() {
    }

    /**
     * 执行JSONP跨域获取数据。此方法相对$.ajax 没有优势，建议不要使用。
     *
     * @deprecated use $.ajax instead.
     * @param {Object} options 配置项
     * @param {Boolean} deferred 延期
     * @returns {XMLHttpRequest} xhr
     *
     */
    $.ajaxJSONP = function (options, deferred) {
        if (!('type' in options)) return $.ajax(options)

        var _callbackName = options.jsonpCallback,
            callbackName = ($.isFunction(_callbackName) ?
                    _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
            script = document.createElement('script'),
            originalCallback = window[callbackName],
            responseData,
            abort = function (errorType) {
                $(script).triggerHandler('error', errorType || 'abort')
            },
            xhr = {abort: abort}, abortTimeout

        if (deferred) deferred.promise(xhr)

        $(script).on('load error', function (e, errorType) {
            clearTimeout(abortTimeout)
            $(script).off().remove()

            if (e.type == 'error' || !responseData) {
                ajaxError(null, errorType || 'error', xhr, options, deferred)
            } else {
                ajaxSuccess(responseData[0], xhr, options, deferred)
            }

            window[callbackName] = originalCallback
            if (responseData && $.isFunction(originalCallback))
                originalCallback(responseData[0])

            originalCallback = responseData = undefined
        })

        if (ajaxBeforeSend(xhr, options) === false) {
            abort('abort')
            return xhr
        }

        window[callbackName] = function () {
            responseData = arguments
        }

        script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
        document.head.appendChild(script)

        if (options.timeout > 0) abortTimeout = setTimeout(function () {
            abort('timeout')
        }, options.timeout)

        return xhr
    }

    /**
     * 一个包含Ajax请求的默认设置的对象。大部分的设置在  {@linkcode $|#ajax}中已经描述。以下设置为全局非常有用.
     * @namespace
     * @name $.ajaxSettings
     */
    $.ajaxSettings = {
        /**
         * 默认请求类型
         * @name $.ajaxSettings#type
         * @var {String}
         * @default GET
         */
        type: 'GET',
        /**
         * Callback that is executed before request
         * @name $.ajaxSettings#beforeSend
         * @var {Function}
         */
        beforeSend: empty,
        /**
         * Callback that is executed if the request succeeds
         * @name $.ajaxSettings#success
         * @var {Function}
         */
        success: empty,
        /**
         * Callback that is executed the the server drops error
         * @name $.ajaxSettings#error
         * @var {Function}
         */
        error: empty,
        /**
         * Callback that is executed on request complete (both: error and success)
         * @name $.ajaxSettings#complete
         * @var {Function}
         */
        complete: empty,
        /**
         * The context for the callbacks
         * @name $.ajaxSettings#context
         * @var {String}
         */
        context: null,
        /**
         * 设置为false,以防止触发Ajax事件.
         * @name $.ajaxSettings#global
         * @var {Boolean}
         * @default true
         */
        global: true,
        /**
         * 设置为一个函数，它返回XMLHttpRequest实例(或一个兼容的对象)
         * @name $.ajaxSettings#xhr
         * @var {Function}
         * @default XMLHttpRequest factory
         */
        xhr: function () {
            return new window.XMLHttpRequest()
        },
        /**
         * 从服务器请求的`MIME`类型，指定`dataType`值:
         *
         * - `script` : text/javascript, application/javascript, application/x-javascript
         * - `json` : application/json
         * - `xml` : application/xml, text/xml
         * - `html` : text/html
         * - `text` : text/plain
         *
         * @name $.ajaxSettings#accepts
         * @var {Object}
         */
        accepts: {
            script: 'text/javascript, application/javascript, application/x-javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        /**
         * Whether the request is to another domain
         * @name $.ajaxSettings#crossDomain
         * @var {Boolean}
         * @default false
         */
        crossDomain: false,
        /**
         * Default timeout
         * @name $.ajaxSettings#timeout
         * @var {Number}
         * @default 0
         */
        timeout: 0,
        /**
         * Whether data should be serialized to string
         * @name $.ajaxSettings#processData
         * @var {Boolean}
         * @default true
         */
        processData: true,
        /**
         * Whether the browser should be allowed to cache GET responses
         * @name $.ajaxSettings#cache
         * @var {Boolean}
         * @default true
         */
        cache: true
    }

    function mimeToDataType(mime) {
        if (mime) mime = mime.split(';', 2)[0]
        return mime && ( mime == htmlType ? 'html' :
                mime == jsonType ? 'json' :
                    scriptTypeRE.test(mime) ? 'script' :
                    xmlTypeRE.test(mime) && 'xml' ) || 'text'
    }

    function appendQuery(url, query) {
        if (query == '') return url
        return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

    // serialize payload and append it to the URL for GET requests
    function serializeData(options) {
        if (options.processData && options.data && $.type(options.data) != "string")
            options.data = $.param(options.data, options.traditional)
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
            options.url = appendQuery(options.url, options.data), options.data = undefined
    }

    /**
     * 执行Ajax请求。它可以是本地资源，或者通过支持HTTP access control的浏览器 或者通过JSONP来实现跨域。
     * 如果URL中含有 `=?`或者`dataType`是“jsonp”，这讲求将会通过注入一个 `<script>`标签来代替使用
     * XMLHttpRequest (查看 [JSONP][])。此时 `contentType`, `dataType`, `headers`有限制，`async` 不被支持。
     *
     * ### Ajax 回调函数
     *
     * 你可以指定以下的回调函数，他们将按给定的顺序执行：
     *    1. `beforeSend(xhr, settings)`: 请求发出前调用，它接收xhr对象和settings作为参数对象。
     *    如果它返回 `false` ，请求将被取消。
     *    2. `success(data, status, xhr)`: 请求成功之后调用。传入返回后的数据，以及包含成功代码的字符串。
     *    3. `error(xhr, errorType, error)`: 请求出错时调用。 (超时，解析错误，或者状态码不在HTTP 2xx)。
     *    4. `complete(xhr, status)`: 请求完成时调用，无论请求失败或成功。
     *
     *
     * ### Promise 回调接口
     *
     *    如果可选的“callbacks” 和 “deferred” 模块被加载，从`$.ajax()`返回的XHR对象实现了promise接口链式的回调：
     *
     *      xhr.done(function(data, status, xhr){ ... })
     *      xhr.fail(function(xhr, errorType, error){ ... })
     *      xhr.always(function(){ ... })
     *      xhr.then(function(){ ... })
     *
     *  这些方法取代了 `success`, `error`, 和 `complete` 回调选项.

     * #### Ajax 事件
     *
     * 当`global: true`时,在Ajax请求生命周期内，以下这些事件将被触发:
     *
     *  1. `ajaxStart` <i>(global)</i>: 如果没有其他Ajax请求当前活跃将会被触发
     *  2. `ajaxBeforeSend` (xhr, options): 再发送请求前，可以被取消
     *  3. `ajaxSend` (xhr, options): 像 `ajaxBeforeSend`，但不能取消
     *  5. `ajaxSuccess` (xhr, options, data): 当返回成功时
     *  4. `ajaxError` (xhr, options, error): 当有错误时
     *  6. `ajaxComplete` (xhr, options): 请求已经完成后，无论请求是成功或者失败。
     *  7. `ajaxStop` <i>(global)</i>: fired if this was the last active Ajax request
     *
     *
     *  默认情况下，Ajax事件在document对象上触发。然而，如果请求的 `context` 是一个DOM节点，
     *  该事件会在此节点上触发然后再DOM中冒泡。唯一的例外是 `ajaxStart` & `ajaxStop`这两个全局事件。
     *
     $(document).on('ajaxBeforeSend', function(e, xhr, options){
              // This gets fired for every Ajax request performed on the page.
              // The xhr object and $.ajax() options are available for editing.
              // Return false to cancel this request.
            })

     $.ajax({
              type: 'GET',
              url: '/projects',
              // data to be added to query string:
              data: { name: 'Zepto.js' },
              // type of data we are expecting in return:
              dataType: 'json',
              timeout: 300,
              context: $('body'),
              success: function(data){
                // Supposing this JSON payload was received:
                //   {"project": {"id": 42, "html": "<div>..." }}
                // append the HTML to context object.
                this.append(data.project.html)
              },
              error: function(xhr, type){
                alert('Ajax error!')
              }
            })

     // post a JSON payload:
     $.ajax({
              type: 'POST',
              url: '/projects',
              // post payload:
              data: JSON.stringify({ name: 'Zepto.js' }),
              contentType: 'application/json'
            })
     *
     * @param {Object} options
     * @param {string} [options.type=GET] 请求方法 (“GET”, “POST”,或者其他)
     * @param {string} [options.url=当前地址] 发送请求的地址
     * @param {string|Object} [options.data=none] 发送到服务器的数据；如果是GET请求，它会自动被作为参数拼接到url上。 非String对象将通过 $.param得到序列化字符串
     * @param {boolean} [options.processData=true] 对于非Get请求。是否自动将 data 转换为字符串。
     * @param {string} [options.contentType=application/x-www-form-urlencoded] 发送信息至服务器时内容编码类型 (这也可以通过设置 headers)。通过设置 false 跳过设置默认值
     * @param {string} [options.mimeType = none] 覆盖响应的MIME类型
     * @param {string} [options.dataType = none] 预期服务器返回的数据类型(json, jsonp, xml, html, or text)
     * @param {string} [options.jsonp = callback] JSONP回调查询参数的名称
     * @param {string} [options.jsonpCallback = jsonp{N}] 全局JSONP回调函数的 字符串（或返回的一个函数）名。 设置该项能启用浏览器的缓存.
     * @param {number} [options.timeout  = 0] 以毫秒为单位的请求超时时间, 0 表示不超时。
     * @param {string} [options.headers] Ajax请求中额外的HTTP信息头对象
     * @param {boolean} [options.async = true] 默认设置下，所有请求均为异步。如果需发送同步请求，请将此设置为 false。
     * @param {boolean} [options.global = true] 请求将触发全局Ajax事件处理程序，设置为 false 将不会触发全局 Ajax 事件。
     * @param {window} [options.context = window] 这个对象用于设置Ajax相关回调函数的上下文(this指向)。
     * @param {boolean} [options.traditional = false] 激活传统的方式通过$.param来得到序列化的 data。
     * @param {boolean} [options.cache  = true] 浏览器是否应该被允许缓存GET响应。 从v1.1.4开始，当dataType选项为 “script” 或 jsonp时，默认为false。 dataType: "script" or jsonp.
     * @param {string} [options.dataType] "script"` or `jsonp`.
     * @param {string} [options.xhrFields=none] 一个对象包含的属性被逐字复制到XMLHttpRequest的实例
     * @param {string} [options.username = none] HTTP基本身份验证凭据
     * @param {string} [options.password = none] HTTP基本身份验证凭据
     *
     * @return {XMLHttpRequest} xhr
     *
     */
    $.ajax = function (options) {
        var settings = $.extend({}, options || {}),
            deferred = $.Deferred && $.Deferred(),
            urlAnchor, hashIndex
        for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

        ajaxStart(settings)

        if (!settings.crossDomain) {
            urlAnchor = document.createElement('a')
            urlAnchor.href = settings.url
            // cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
            urlAnchor.href = urlAnchor.href
            settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
        }

        if (!settings.url) settings.url = window.location.toString()
        if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
        serializeData(settings)

        var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
        if (hasPlaceholder) dataType = 'jsonp'

        if (settings.cache === false || (
            (!options || options.cache !== true) &&
            ('script' == dataType || 'jsonp' == dataType)
            ))
            settings.url = appendQuery(settings.url, '_=' + Date.now())

        if ('jsonp' == dataType) {
            if (!hasPlaceholder)
                settings.url = appendQuery(settings.url,
                    settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
            return $.ajaxJSONP(settings, deferred)
        }

        var mime = settings.accepts[dataType],
            headers = {},
            setHeader = function (name, value) {
                headers[name.toLowerCase()] = [name, value]
            },
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = settings.xhr(),
            nativeSetHeader = xhr.setRequestHeader,
            abortTimeout

        if (deferred) deferred.promise(xhr)

        if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
        setHeader('Accept', mime || '*/*')
        if (mime = settings.mimeType || mime) {
            if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
            xhr.overrideMimeType && xhr.overrideMimeType(mime)
        }
        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
            setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

        if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
        xhr.setRequestHeader = setHeader

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty
                clearTimeout(abortTimeout)
                var result, error = false
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
                    result = xhr.responseText

                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType == 'script')    (1, eval)(result)
                        else if (dataType == 'xml')  result = xhr.responseXML
                        else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
                    } catch (e) {
                        error = e
                    }

                    if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
                    else ajaxSuccess(result, xhr, settings, deferred)
                } else {
                    ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
                }
            }
        }

        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort()
            ajaxError(null, 'abort', xhr, settings, deferred)
            return xhr
        }

        if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

        var async = 'async' in settings ? settings.async : true
        xhr.open(settings.type, settings.url, async, settings.username, settings.password)

        for (name in headers) nativeSetHeader.apply(xhr, headers[name])

        if (settings.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.onreadystatechange = empty
            xhr.abort()
            ajaxError(null, 'timeout', xhr, settings, deferred)
        }, settings.timeout)

        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null)
        return xhr
    };

    // handle optional data/success arguments
    function parseArguments(url, data, success, dataType) {
        if ($.isFunction(data)) dataType = success, success = data, data = undefined
        if (!$.isFunction(success)) dataType = success, success = undefined
        return {
            url: url
            , data: data
            , success: success
            , dataType: dataType
        }
    }

    /**
     * 执行一个Ajax GET请求。这是一个 $.ajax的简写方式。
     *
     *      $.get(url, function(data, status, xhr){ ... }) ⇒ XMLHttpRequest
     *      $.get(url, [data], [function(data, status, xhr){ ... }], [dataType]) ⇒ XMLHttpRequest
     *
     * @returns {XMLHttpRequest} xhr
     *
     * @example
     * $.get('/whatevs.html', function(response){
     *     $(document.body).append(response)
     * });
     */
    $.get = function (/* url, data, success, dataType */) {
        return $.ajax(parseArguments.apply(null, arguments))
    }

    /**
     * 执行Ajax POST请求。这是一个 $.ajax 的简写方式。
     *
     *      $.post(url, [data], function(data, status, xhr){ ... }, [dataType]) ⇒ XMLHttpRequest
     *
     *
     * @returns {XMLHttpRequest}
     * @example
     * $.post('/create', { sample: 'payload' }, function(response){
     *      // process response
     * })
     *
     * @example <caption>`data` can also be a string:</caption>
     * $.post('/create', $('#some_form').serialize(), function(response){
     *     // ...
     * })
     */
    $.post = function (/* url, data, success, dataType */) {
        var options = parseArguments.apply(null, arguments)
        options.type = 'POST'
        return $.ajax(options)
    }

    /**
     * 通过 Ajax GET请求获取JSON数据。这是一个 $.ajax的简写方式。
     *
     *      $.getJSON(url, function(data, status, xhr){ ... }) ⇒ XMLHttpRequest
     *      $.getJSON(url, [data], function(data, status, xhr){ ... }) ⇒ XMLHttpRequest
     *
     * @returns {XMLHttpRequest} xhr
     */
    $.getJSON = function (/* url, data, success */) {
        var options = parseArguments.apply(null, arguments)
        options.dataType = 'json'
        return $.ajax(options)
    }

    /**
     * 通过GET Ajax载入远程 HTML 内容代码并插入至 当前的集合 中。另外，一个css选择器可以在url中指定， 像这样，可以使用匹配selector选择器的HTML内容来更新集合。
     *
     *      load(url, function(data, status, xhr){ ... }) ⇒ self
     *
     * @function
     * @name $.fn#load
     * @param {String} url 远程请求地址.
     * @param {String|Object} data 请求参数
     * @param {Function} success 成功回调函数
     * @returns {$.fn}
     * @example <caption>如果没有给定CSS选择器，将使用完整的返回文本。
     *          请注意，在没有选择器的情况下，任何javascript块都会执行。如果带上选择器，匹配选择器内的script将会被删除.
     * </caption>
     * $('#some_element').load('/foo.html #bar')
     */
    $.fn.load = function (url, data, success) {
        if (!this.length) return this
        var self = this, parts = url.split(/\s/), selector,
            options = parseArguments(url, data, success),
            callback = options.success
        if (parts.length > 1) options.url = parts[0], selector = parts[1]
        options.success = function (response) {
            self.html(selector ?
                $('<div>').html(response.replace(rscript, "")).find(selector)
                : response)
            callback && callback.apply(self, arguments)
        }
        $.ajax(options)
        return this
    }

    var escape = encodeURIComponent

    function serialize(params, obj, traditional, scope) {
        var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
        $.each(obj, function (key, value) {
            type = $.type(value)
            if (scope) key = traditional ? scope :
            scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
            // handle data in serializeArray() format
            if (!scope && array) params.add(value.name, value.value)
            // recurse into nested objects
            else if (type == "array" || (!traditional && type == "object"))
                serialize(params, value, traditional, key)
            else params.add(key, value)
        })
    }

    /**
     * 序列化一个对象，在Ajax请求中提交的数据使用URL编码的查询字符串表示形式。 如果`shallow`设置为true。嵌套对象不会被序列化，嵌套数组的值不会使用放括号在他们的key上。
     * 如果任何对象的某个属性值是一个函数，而不是一个字符串，该函数将被调用并且返回值后才会被序列化。
     * 此外，还接受 `serializeArray` 格式的数组，其中每个项都有 “name” 和 “value”属性。
     *
     *      $.param(object, [shallow]) ⇒ string
     *      $.param(array) ⇒ string

     * @param {Object} obj 待序列号对象
     * @param {Boolean} traditional 浅序列号
     * @returns {String} 序列化后的字符串
     *
     * @example
     * $.param({ foo: { one: 1, two: 2 }})
     * //=> "foo[one]=1&foo[two]=2)"
     *
     * $.param({ ids: [1,2,3] })
     * //=> "ids[]=1&ids[]=2&ids[]=3"
     *
     * $.param({ ids: [1,2,3] }, true)
     * //=> "ids=1&ids=2&ids=3"
     *
     * $.param({ foo: 'bar', nested: { will: 'not be ignored' }})
     * //=> "foo=bar&nested[will]=not+be+ignored"
     *
     * $.param({ foo: 'bar', nested: { will: 'be ignored' }}, true)
     * //=> "foo=bar&nested=[object+Object]"
     *
     * $.param({ id: function(){ return 1 + 2 } })
     * //=> "id=3"
     */
    $.param = function (obj, traditional) {
        var params = []
        params.add = function (key, value) {
            if ($.isFunction(value)) value = value()
            if (value == null) value = ""
            this.push(escape(key) + '=' + escape(value))
        }
        serialize(params, obj, traditional)
        return params.join('&').replace(/%20/g, '+')
    }
})(Eui);
