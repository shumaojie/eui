/**
 * (c)2015  Create at: 2015-05-29
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath stack.js
 *
 * eui.js may be freely distributed under the MIT license.
 *
 * @desc 提供 andSelf& end()链式调用方法
 *
 * @todo 理解链式调用的场景
 *
 */

(function($){
    $.fn.end = function(){
        return this.prevObject || $()
    }

    $.fn.andSelf = function(){
        return this.add(this.prevObject || $())
    }

    'filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings'.split(',').forEach(function(property){
        var fn = $.fn[property]
        $.fn[property] = function(){
            var ret = fn.apply(this, arguments)
            ret.prevObject = this
            return ret
        }
    })
})(Eui);