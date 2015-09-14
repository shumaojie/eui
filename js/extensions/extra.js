/**
 * (c)2015  Create at: 2015-09-02 16:45
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath extensions/extra.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 业务开发过程中，常见方法封装类.
 * @namespace Eui.Extra
 */
(function($){

    var Extra = Eui.Extra = {

        /**
         * 是否需要包装请求参数为 : reqJson : {} 的方式.
         * @type {Boolean}
         * @default true
         */
        warp : true,

        /**
         * 包装请求参数的默认KEY.
         * @type {String}
         * @default "reqJson"
         */
        warpKey : "reqJson",

        /**
         * 包装请求参数格式为{reqJson : {'id':'12','name':'metro'}}
         *
         * 备注：如果params参数为字符串，那么直接返回。
         *
         * @param {Object/Array} params
         * @param {Boolean} [warap] 是否需要包装请求参数,默认取{@link Eui.Extra.warp|warp}的值。
         * @param {String} [key] 参数的KEY，默认取默认取{@link Eui.Extra.warpKey|warpKey}的值
         * @returns {Object/String} 包装后的参数,格式：{reqJson : ''}
         */
        warpReqParams : function(params,warp,key){

            if($.isString(params)){
                return params;
            }

            var self = this,args = arguments,len = args.length,
                isWarp = self.warp,
                pkey = self.warpKey;

            if(len == 2){
                if($.isBoolean(warp)){
                    isWarp = warp;
                }else if($.isString(warp)){
                    key = warp;
                }else if($.isObject(warp)){
                    if(warp.hasOwnProperty("warp")){
                        isWarp = warp.warp;
                    }
                    if(warp.hasOwnProperty("warpKey")){
                        pkey = warp.warpKey;
                    }
                }
            }

            if(len == 3){
                isWarp = warp;
                pkey = key;
            }

            if(isWarp){
                var temp = {};
                temp[pkey] = $.encode(params);
                return temp;
            }

            return params;
        },

        /**
         *
         * 将对象的属性合并.
         *
         *      var objects = $.Extra.toDataObjects({"bizObj":{"memo":"进账摘要","name":"RecordedSummary"}});
         *
         *      var objects = $.Extra.toDataObjects([{"bizObj.memo":"进账摘要"},{"bizObj.name":"RecordedSummary"}]);
         *       // objects then equals:
         *       {
         *         "bizObj.memo" : "进账摘要",
         *         "bizObj.name" : "RecordedSummary"
         *       };
         *
         * @param {Object/Array} value 待处理对象或数组
         * @param {Boolean} [recursive=false] 为true时，递归对象
         * @returns {Object} 处理后的对象
         */
        toDataObjects : function(value,recursive,name){
            var self = Extra.toDataObjects,
                objects = {},i,ln;
            if ($.isArray(value)) {
                for (i = 0, ln = value.length; i < ln; i++) {
                    if (recursive) {
                        $.Object.merge(objects,self(value[i], true));
                    }
                    else {
                        objects[name] = value[i];
                    }
                }
            }else if($.isObject(value)){
                for(i in value){
                    if(value.hasOwnProperty(i)){
                        if(recursive){
                            $.Object.merge(objects,self(value[i], true,(name ? name + '.' : '') + i));
                        }else{
                            objects[name] = value[i];
                        }
                    }
                }
            }else{
                objects[name] = value;
            }
            return objects;
        },

        /**
         *
         * 批量替换键名称.
         *
         *      var opts = {
         *          dlgh : 500,
         *          dlgw : 400,
         *          winCfgs : {
         *              url : "test.html"
         *          },
         *          dlgtitle : "新增窗口"
         *      };
         *      //递归替换key值
         *      $.Extra.replaceKeys(opts,{
         *          "dlgh" : "height",
         *          "dlgw" : "width",
         *          "dlgtitle" : "title",
         *          "url" : "href"
         *      });
         *      //opts将会改为
         *      {
         *         height : 500,
         *         dlgw : 400,
         *         winCfgs : {
         *              href : "test.html"
         *          },
         *          title : "新增窗口"
         *      }
         *
         * @param {Object/Array} value 待替换的对象或数组
         * @param {Object} keyRefs 原始键/替换键的关系
         * @param {Boolean} [recursive=false] 是否递归替换
         * @param {Boolean} [remove=true] 是否保持原始key值.
         * @returns {Object} 处理后的对象
         */
        replaceKeys : function(value,keyRefs,recursive,remove){
            var self = this,
                recursive = (recursive != undefined ? recursive : false);
            remove = (remove != undefined ? remove : true);

            if($.isEmpty(value) || $.isEmpty(keyRefs)){return;}

            if($.isObject(value)){

                $.Object.each(value,function(key,val){
                    //判断是否包含待替换的key
                    if(keyRefs.hasOwnProperty(key)){
                        var targetKey = keyRefs[key];
                        if(!$.isEmpty(targetKey)){
                            value[targetKey] = val;
                            if(remove){
                                delete value[key];
                            }
                        }
                    }

                    //判断是否需要递归替换
                    if(recursive){
                        self.replaceKeys(val,keyRefs,recursive,remove);
                    }
                });

            }

            if($.isArray(value)){
                $.Array.each(value,function(item){
                    self.replaceKeys(item,keyRefs,recursive,remove);
                });
            }
        },

        /**
         *
         * 通过关键字过滤数据.
         *
         *       var opts = {
         *          dlgh : 500,
         *          dlgw : 400
         *       };
         *
         *      //最终opts值将会改为{dlgw:400}
         *      $.Extra.filterDataByKey(opts,["dlgh"]);
         *
         * @param {Object/Array} datas 待过滤的数据.
         * @param {Array} keys 待过滤的属性关键字.
         * @param {Boolean} [recursive=false] 是否递归
         *
         */
        filterDataByKey : function(datas,keys,recursive){
            var self = this;
            if($.isEmpty(keys)){return;}

            if($.isObject(datas)){
                $.Object.each(datas,function(key,value){
                    if($.Array.contains(keys,key)){
                        delete datas[key];
                    }else{
                        if(($.isObject(value) || $.isArray(value)) && recursive){
                            self.filterDataByKey(value,keys,recursive);
                        }
                    }
                });
            }

            if($.isArray(datas)){
                $.Array.each(datas,function(item){
                    self.filterDataByKey(item,keys,recursive);
                });
            }
        },

        /**
         *
         * 对象添加前缀.
         *
         * @param {Object} object 待处理对象.
         * @param {String} prefix 前缀
         * @returns {Object}
         */
        addPrefixForObject : function(object,prefix){
            if(!$.isEmpty(prefix) && $.isObject(object)){
                $.Object.each(object,function(key,value){
                    //如果参数包含‘.’，那么不做处理
                    if(key.indexOf('.') === -1){
                        object[prefix + '.' + key] = value;
                        delete object[key];
                    }
                });
            }
            return object;
        },

        /**
         * 获取对象指定层级的对象.
         * @param {Object} object 源对象.
         * @param {String} path 对象字符串路径,用`‘.’`分割.
         * @returns {Object} 结果对象
         */
        getFieldValue : function(object, path) {
            if (!object||!path){
                return object;
            }
            path = path.replace(/\[/g,".").replace(/\]/g,"");
            var fields = path.split(".");
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (typeof(object[field]) != "undefined") {
                    object = object[field];
                } else {
                    return ;
                }
            }
            return object;
        },

        /**
         * 获取本地文件数据.
         * @param {String} url 请求地址
         * @param {String} [dataType=json] 数据类型，比如：json,text,xml等.
         * @returns {Object} 数据对象
         */
        getLocalFileData : function(url,dataType){
            var dataType = dataType || "json",
                data = null;

            $.ajax({
                type: "GET",
                async : false, //同步
                dataType: dataType,
                url: url
            }).done(function(result) {
                data = result;
            });
            return data;
        },

        /**
         * 获取指定的webview对象.
         * @param {String} id
         * @returns {WebviewObject} webview
         */
        getWebviewById : function(id){
            return this.getPlusWebview().getWebviewById(id);
        },

        /**
         * 获取Webview模块管理应用窗口界面，实现多窗口的逻辑控制管理操作,前提必须plusReady.
         * @returns {Object} plus.webview应用界面管理对象
         */
        getPlusWebview : function(){
            return plus.webview;
        }
    };

    //表单相关操作.
    $.apply(Extra,{

        /**
         * 表单原始数据`data`名称标识.
         * @memberof Eui.Extra
         * @type {String}
         * @default "originalData"
         */
        formDataIdentify : "originalData",

        /**
         * 表单关键字.
         *
         * - `dataUrl` : 表单页面获取初始化数据的请求地址.
         * @memberof Eui.Extra
         * @type {Array}
         */
        formKeywords : ["dataUrl"],

        /**
         * 表单初始化时，是否绑定原始数据，以便提交时做合并.
         *
         * @memberof Eui.Extra
         * @type {Boolean}
         * @default true
         */
        isBindOriginalData : true,

        /**
         * 获取目标元素绑定的原始数据.
         *
         * @memberof Eui.Extra
         * @param {String} selector 目标选择器.
         * @returns {String/Object} 绑定的原始数据.
         */
        getBindDatas : function(selector){
            var self = this,
                target = $(selector);

            if(!target.length){
                $.toast($.String.format("未找到选择器{%}匹配的目标元素!",selector));
                return null;
            }

            return target.data(self.formDataIdentify);
        },

        /**
         * 目标元素绑定原始数据.
         *
         * @memberof Eui.Extra
         * @param {String/HtmlElement} selector 目标选择器或`dom`对象.
         * @param {String/Object} value 待绑定的数据.
         */
        setBindDatas : function(selector,value){
            var self = this,
                target = $(selector);

            if(!target.length){
                $.toast($.String.format("未找到选择器{%}匹配的目标元素!",selector));
                return;
            }

            target.data(self.formDataIdentify,value);
        },

        /**
         * 去掉字符串空格.
         *
         * @memberof Eui.Extra
         * @param {String} serialize 序列化的字符串
         * @returns {String} 格式化后的字符串
         */
        trimSerialize : function(serialize){
            return decodeURIComponent(serialize.replace(/\+/g," "))
        },

        /**
         * 获取表单序列化值（默认跟初始化数据作合并）.
         *
         * @memberof Eui.Extra
         * @param {String} selector jq选择器表达式
         * @param {String} [prefix] 默认数据添加前缀.
         * @param {Array} [keywords] 待过滤的key.
         *
         * @returns {Object}
         */
        getFormSerializeValues : function(selector,prefix,keywords){
            var self = this,target = selector,
                fKeywords = keywords && $.isArray(keywords) ? $.Array.union(self.formKeywords,keywords) : self.formKeywords;

            if($.isString(selector)){
                target = $(selector);
            }
            var formDatas = $.Object.fromQueryString(self.trimSerialize(target.serialize()));

            //过滤关键字属性值.
            self.filterDataByKey(formDatas,fKeywords,false);

            //获取表单绑定的原始数据.
            var originalData = self.getBindDatas(target);
            if(originalData){
                formDatas = $.merge(originalData,formDatas);
            }

            //是否需要添加前缀.
            if(prefix){
                self.addPrefixForObject(formDatas,prefix);
            }

            return formDatas;
        },

        /**
         * 加载表单数据,批量设置值,赋值操作调用{@link $.fn#setValues|setValues}方法.
         *
         * @memberof Eui.Extra
         * @param {String/HtmlElement} target 选择器表达式或者HtmlElement对象.
         * @param {String/Object} data 请求地址或者数据.
         * @param {Object} param 请求参数.
         * @param {Object} events 加载表单相关事件.
         * @param {Function} [events.onBeforeLoad] (Optional) 加载表单数据之前执行的事件.
         * @param {Function} [events.onBeforeLoad.param] 请求参数.
         * @param {Function} [events.onBeforeLoad.data] 数据或请求地址.
         * @param {Function} [events.onBeforeLoad.return] 返回false来阻止表单数据加载.
         * @param {Function} [events.onLoadSuccess] 远程获取表单数据成功时执行.
         * @param {Function} [events.onLoadSuccess.data] 数据.
         * @param {Function} [events.onAfterLoad] 表单加载数据批量赋值成功后执行，提供参数：data.
         * @param {Function} [events.onAfterLoad.data] 数据.
         * @param {Function} [events.onLoadError] 远程获取表单数据失败执行.
         * @param {String} [dataNode="data"] 指定初始化数据节点路径,如果没指定，那么获取默认`data`节点.
         * @param {Boolean} showWait 是否显示遮罩信息.
         *
         */
        loadFormData : function(target,data,param,events,dataNode,showWait){
            var me = this,
                param = param || {},
                events = events || {};

            var onBeforeLoad = events.onBeforeLoad || $.emptyFn,
                onLoadSuccess = events.onLoadSuccess || $.emptyFn,
                onLoadError = events.onLoadError || $.emptyFn,
                onAfterLoad = events.onAfterLoad || $.emptyFn;

            var form = $(target);
            if(!form.length){
                $.toast($.String.format("未找到匹配的form{0},请检查参数是否正确!",target));
                return;
            }

            if (onBeforeLoad.call(me, param,data) == false) return;

            //显示遮罩
            if(showWait){
                plus.nativeUI.showWaiting('加载数据中...', {padlock : true});
            }
            //data为请求地址？
            if (typeof data == 'string'){
                $.Comm.postToRemote({
                        url : data,
                        async : false
                    },param,
                    function(rslt){
                        //检测返回结果格式是否为对象.
                        if(!$.isObject(rslt)){
                            $.toast($.String.format("结果{%}不为javascript Object，请检查返回结果格式是否正确！",rslt));
                            return;
                        }
                        data = rslt;

                        if($.isSuccess(rslt)){
                            if(onLoadSuccess){onLoadSuccess(rslt);}
                        }
                    },onLoadError
                );
            }

            if(dataNode){
                data = me.getFieldValue(data,dataNode);
            }else{
                if(data.hasOwnProperty("data")){
                    data = data.data;
                }
            }

            if(data){
                //将data转化成对象
                data = me.toDataObjects(data,true);
            }

            form.setValues(data);

            if(showWait){
                plus.nativeUI.closeWaiting();
            }

            if(me.isBindOriginalData){
                me.setBindDatas(form,data);
            }
            if(onAfterLoad){onAfterLoad(data);}
        }
    });

    $.apply(Eui,{

        /**
         * 判断是否是移动终端.
         * @returns {Boolean}
         */
        isMobileTerminal : function(){
            return $.os.android || $.os.ios;
        },

        /**
         * 判断是否成功标识.备注：当后端返回的成功状态标识不为success=true/false时可通过该方法重写。
         *
         * @memberof $
         * @param {Object} response 后端响应的数据.
         */
        isSuccess : function(response){
            return response.success;
        }
    });
}(Eui));

