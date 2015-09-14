/**
 * (c)2015  Create at: 2015-06-24
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath extensions/template.js
 *
 * Eui.js may be freely distributed under the MIT license.
 */

/**
 * Template类是对腾讯的{@link http://aui.github.io/artTemplate/|artTemplate}的抽象封装。
 * 在项目中，我们一般采用{@link https://code.csdn.net/Tencent/tmodjs|tmodjs}预编译模板。
 *
 * `注意`：在调用tempalte方法之前，必须确保页面已经引入template.js文件.
 *
 * ###预编译模板优势
 *
 * - `利于维护`：基于文件进行管理，大量模板可以有序组织
 * - `模板复用`：模板自身支持include语句引入外部模板文件，自动提前加载
 * - `调试友好`：编译后的模板无evel与new Function，错误可以被浏览器捕获；亦可映射模板文件到本地进行开发
 * - `按需加载`：各取所需，最大化节省网络流量
 * - `按需合并`：可通过打包工具按需合并模板，以减少HTTP请求数
 * - `跨域部署`：模板不再受限页面以及页面所处的域，可部署至CDN
 *
 * ###友情链接:
 *
 * 1、[atc-前端模板预编译器](http://cdc.tencent.com/?p=7382)
 *
 * 2、[高性能JavaScript模板引擎](http://www.iteye.com/news/25340)
 *
 * @namespace Eui.Template
 */
(function($,alias){

    var Template = Eui.Template = {

        /**
         * 根据 id 渲染模板.
         *
         * 备注：如果没有 data 参数，那么将返回一渲染函数.
         *
         * @param {String} id 即模板文件路径
         * @param {Object/Array} [data] 数据
         * @returns {String/Function} 没有`data`参数时，返回渲染函数，否则返回渲染后的html代码.
         */
        template : function(id,data){
            data = data || {};
            return template(id,data);
        }
    };

    $.apply($,{

        /**
         * {@link Eui.Template.template} 方法的别名.
         * @method #template
         * @param {String} id 模板ID
         * @param {Object} [data] 数据对象
         * @memberof Eui
         */
        template : alias(Template,'template')
    });
}(Eui,Eui.Function.alias));