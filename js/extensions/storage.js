/**
 * (c)2015  Create at: 2015-06-12
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath extensions/extra.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */
(function($,alias){

    /**
     * Storage模块管理应用本地数据存储区，用于应用数据的保存和读取。应用本地数据与localStorage、sessionStorage的区别在于数据有效域不同，
     * 前者可在应用内跨域操作，数据存储期是持久化的，并且没有容量限制。通过Eui.Storage._getStorageObj可获取应用本地数据管理对象。
     *
     * @namespace Eui.Storage
     */
    var Storage = Eui.Storage = {

        /**
         * 存储的策略，可选值有：
         * - `localStorage`
         * - `storage` : H5+实现，调用方式必须放在$.plusReady内部，否则获取不到存储对象.
         *
         * @type {String}
         * @default "localStorage"
         */
        storageStrategy : 'localStorage',

        /**
         * 获取数据管理对象，如果是客户端是浏览器那么返回的是localStorage,如是手机，那么返回的是plus.storage。
         * @returns {localStorage/plus.storage}
         * @private
         */
        _getStorageObj : function(){
            var self = this,
                strategy = self.storageStrategy,
                storeObj;

            switch (strategy){
                case "localStorage":
                    storeObj = localStorage;
                    break;
                case "storage" :
                    if(window.plus){
                        storeObj = plus.storage;
                    }else{
                        console.error('plus object have not ready,please invoking Storage object from within the $.pluReady function.');
                    }
                    break;
            }
            return storeObj;
        },

        /**
         * 获取storage中保存的键值对的数量.
         * @returns {Number} 键值对数量
         */
        getLength : function(){
            var self = this,
                strategy = self.storageStrategy,
                storageObj = self._getStorageObj();

            return strategy == "storage" ? storageObj.getLength() : storageObj.length;
        },

        /**
         * 通过key值检索键值。
         * 备注：因为存储的只能是字符串,所以可以通过{@link Eui.JSON.decode}为true,将值转换成对象.
         * @param {String} key 键
         * @param {Boolean} [decode=false] 是否需要解码
         * @returns {String/Object} decode为true时，返回对象.
         */
        getItem : function(key,decode){
            var value = this._getStorageObj().getItem(key);
            return decode ? $.decode(value) :value;
        },

        /**
         * 存储key-value.
         *
         * 备注：存储的键和值没有容量限制，但过多的数据量会导致效率降低，建议单个键值数据不要超过`10Kb`。
         * @param {String} key 存储的键值
         * @param {String/Object} value 存储的内容,如果value是对象,自动会进行编码.
         */
        setItem : function(key,value){
            if($.isObject(value)){
                value = $.encode(value);
            }
            this._getStorageObj().setItem(key, value);
        },

        /**
         * 通过key值删除键值对.
         * @param {String} key 存储的键值
         */
        removeItem : function(key){
            this._getStorageObj().removeItem(key);
        },

        /**
         * 清除应用所有的键值对.
         */
        clear : function(){
            this._getStorageObj().clear();
        },

        /**
         * 获取键值对中指定索引值的key值.
         * @param {Number} index 存储键值的索引
         * @returns {String} 键值
         */
        key : function(index){
            return this._getStorageObj().key(index);
        },

        /**
         * 获取本地JSON文件数据.
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
                url: url,
                success : function(result){
                    data = result;
                }
            });
            return data;
        },

        // 备注：`json`文件只支持对象格式.
        /**
         * 将对象按键值对方式存储到缓存(localStorage)。
         * @param {Object} obj 待存储对象.
         */
        initStorage : function(configPath){
            var self = this,
                configs = configPath;

            //如果是请求本地json文件.
            if($.isString(configPath) && /.*?\.json$/.test(configPath)){
                configs = self.getLocalFileData(configPath,"json");
            }

            if($.isObject(configs)){
                $.Object.each(configs,function(key,value){
                    if(!$.isString(value)){
                        value = $.encode(value);
                    }
                    $.Storage.setItem(key,value);
                });
            }
        }
    };

    $.apply($,{

        /**
         * Old alias to {@link Eui.Storage.initStorage|initStorage}
         * @method #initStorage
         * @memberof Eui
         */
        initStorage : alias(Storage,'initStorage')
    });

}(Eui,Eui.Function.alias));