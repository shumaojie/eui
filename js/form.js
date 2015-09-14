/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath form.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @namespace Form
 * @desc 序列化表单提交参数及赋值等相关封装.
 */
(function($){

    /**
     * 将用作提交的表单元素的值编译成拥有`name`和`value`对象组成的数组。
     * 不能使用的表单元素，buttons，未选中的radio buttons/checkboxs 将会被跳过。 结果不包含file inputs的数据。
     *
     *      serializeArray()   ⇒ array
     *
     * @function
     * @name #serializeArray
     * @memberof Form
     * @returns {Array}
     * @example
     *  $('form').serializeArray()
     * //=> [{ name: 'size', value: 'micro' },
     * //    { name: 'name', value: 'Eui' }]
     */
    $.fn.serializeArray = function() {
        var name, type, result = [],
            add = function(value) {
                if (value.forEach) return value.forEach(add)
                result.push({ name: name, value: value })
            }
        if (this[0]) $.each(this[0].elements, function(_, field){
            type = field.type, name = field.name
            if (name && field.nodeName.toLowerCase() != 'fieldset' &&
                !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
                ((type != 'radio' && type != 'checkbox') || field.checked))
                add($(field).val())
        })
        return result
    }

    /**
     * 在Ajax post请求中将用作提交的表单元素的值编译成 URL编码的 字符串。
     *
     *      serialize()   ⇒ string
     *
     * @function
     * @name #serialize
     * @memberof Form
     * @return {String} 编码后的字符串，用`&`连接
     */
    $.fn.serialize = function(){
        var result = []
        this.serializeArray().forEach(function(elm){
            result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
        })
        return result.join('&')
    }

    /**
     * 表单批量赋值，根据`name`属性匹配.
     *
     * 备注：如果是`span`标签，那么是通过`initname`属性识别.
     *
     * @function
     * @name #setValues
     * @memberof Form
     * @param {Object} data 表单的初始数据
     */
    $.fn.setValues = function(data){
        var form = this;
        for(var name in data){
            var val = data[name];
            if (!_checkField(name, val)){
                form.find('input[name="'+name+'"]').val(val);
                form.find('textarea[name="'+name+'"]').val(val);
                form.find('select[name="'+name+'"]').val(val);
                $('span[initname="'+name + '"]',form).text(val);
            }
        }

         // check the checkbox and radio fields
        function _checkField(name, val){
            var cc = form.find('input[name="'+name+'"][type=radio], input[name="'+name+'"][type=checkbox]');
            if (cc.length){
                cc.prop('checked', false);
                cc.each(function(){
                    var f = $(this);
                    if (f.val() == String(val) || $.inArray(f.val(), $.isArray(val)?val:[val]) >= 0){
                        f.prop('checked', true);
                    }
                });
                return true;
            }
            return false;
        }
    }

    /**
     * 为 “submit” 事件绑定一个处理函数，或者触发元素上的 “submit” 事件。
     * 当没有给定function参数时，触发当前表单“submit”事件， 并且执行默认的提交表单行为，除非调用了 `preventDefault()`。
     *
     * 当给定function参数时，在当前元素上它简单得为其在“submit”事件绑定一个处理函数。
     *
     *      submit() ⇒ self
     *      submit(function(e){ ... }) ⇒ self
     *
     * @function
     * @name #submit
     * @memberof Form
     * @param {Function} callback 成功回调函数.
     * @returns {$}
     */
    $.fn.submit = function(callback) {
        if (0 in arguments) this.bind('submit', callback)
        else if (this.length) {
            var event = $.Event('submit')
            this.eq(0).trigger(event)
            if (!event.isDefaultPrevented()) this.get(0).submit()
        }
        return this
    }

})(Eui);