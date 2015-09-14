/**
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/function.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 处理回调函数的常用静态方法的集合.
 * @namespace Eui.Function
 */
Eui.Function = {

    /**
     * 整个框架的一个很常用的方法。 它作为另一种方法的包装，最初接受2个参数 name 和 value。
     * 被包装的函数可以"灵活"的对值进行设置为其他值:
     *
     * - `name` 和 `value` 作为2个参数
     * - 一个单一的对象参数与多个键-值对
     *
     * 示例:
     *
     *     var setValue = Eui.Function.flexSetter(function(name, value) {
     *         this[name] = value;
     *     });
     *
     *     // 之后，设置单个名称-值
     *     setValue('name1', 'value1');
     *
     *     // 设置多个名称-值对
     *     setValue({
     *         name1: 'value1',
     *         name2: 'value2',
     *         name3: 'value3'
     *     });
     *
     * @param {Function} setter
     * @returns {Function} flexSetter
     */
    flexSetter: function(fn) {
        return function(a, b) {
            var k, i;

            if (a === null) {
                return this;
            }

            if (typeof a !== 'string') {
                for (k in a) {
                    if (a.hasOwnProperty(k)) {
                        fn.call(this, k, a[k]);
                    }
                }

                if (Eui.enumerables) {
                    for (i = Eui.enumerables.length; i--;) {
                        k = Eui.enumerables[i];
                        if (a.hasOwnProperty(k)) {
                            fn.call(this, k, a[k]);
                        }
                    }
                }
            } else {
                fn.call(this, a, b);
            }

            return this;
        };
    },

    /**
     * 根据指定函数 fn 创建一个代理函数，更改 this 作用域为传入的作用域，
     * 可以选择重写调用的参数。(默认为该函数的参数列表)
     *
     * {@link Eui#bind Eui.bind}是{@link Eui.Function#bind Eui.Function.bind}的别名
     *
     * @param {Function} fn 需要被代理的原始函数.
     * @param {Object} scope (可选) 该函数执行的作用域(this引用)。
     *  如果省略，默认指向默认的全局环境对象(通常是window).
     * @param {Array} args (可选) 覆盖原函数的参数列表（默认为该函数的参数列表）
     * @param {Boolean/Number} appendArgs (可选) 如果该参数为true，将参数加载到该函数的后面，
     * 如果该参数为数字类型，则将参数将插入到所指定的位置。
     * @return {Function} 新的函数.
     */
    bind: function(fn, scope, args, appendArgs) {
        if (arguments.length === 2) {
            return function() {
                return fn.apply(scope, arguments);
            };
        }

        var method = fn,
            slice = Array.prototype.slice;

        return function() {
            var callArgs = args || arguments;

            if (appendArgs === true) {
                callArgs = slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }
            else if (typeof appendArgs == 'number') {
                callArgs = slice.call(arguments, 0); // copy arguments first
                Eui.Array.insert(callArgs, appendArgs, args);
            }

            return method.apply(scope || Eui.global, callArgs);
        };
    },

    /**
     * 从提供'fn'创建一个新的函数，其中的参数预先设置到 'args'。
     * 新的参数传递到新创建的回调函数中，调用时追加到预先设定的参数之后。
     * 创建的回调时，这是特别有用的。
     *
     * 示例:
     *
     *     var originalFunction = function(){
     *         alert(Eui.Array.from(arguments).join(' '));
     *     };
     *
     *     var callback = Eui.Function.pass(originalFunction, ['Hello', 'World']);
     *
     *     callback(); // 执行结果为 'Hello World'
     *     callback('by Me'); // // 执行结果为 'Hello World by Me'
     *
     * {@link Eui#pass Eui.pass} 是{@link Eui.Function#pass Eui.Function.pass}的别名.
     *
     * @param {Function} fn 原始函数.
     * @param {Array} args 要传递给新的回调函数的参数.
     * @param {Object} scope (可选) 该函数执行的作用域(this引用).
     * @return {Function} 新的回调函数
     */
    pass: function(fn, args, scope) {
        if (!Eui.isArray(args)) {
            if (Eui.isIterable(args)) {
                args = Eui.Array.clone(args);
            } else {
                args = args !== undefined ? [args] : [];
            }
        }

        return function() {
            var fnArgs = [].concat(args);
            fnArgs.push.apply(fnArgs, arguments);
            return fn.apply(scope || this, fnArgs);
        };
    },

    /**
     * 为object提供的方法属性名称为methodName的方法创建一个别名。
     * 注意,执行的作用域仍将被绑定到所提供的“对象”本身。
     *
     * @param {Object/Function} object
     * @param {String} methodName
     * @return {Function} aliasFn
     */
    alias: function(object, methodName) {
        return function() {
            return object[methodName].apply(object, arguments);
        };
    },

    /**
     * 为当前提供的方法创建一个"克隆"。
     * 返回的方法将调用传递所有的参数和"this"指针沿给定的方法，并返回其结果。
     *
     * @param {Function} method
     * @return {Function} cloneFn
     */
    clone: function(method) {
        return function() {
            return method.apply(this, arguments);
        };
    },

    /**
     * 创建一个拦截函数。传递的函数在原函数之前被调用。
     * 如果拦截函数返回false， 则原函数不会被调用。
     * 在返回函数中，将返回原函数的返回值。 拦截函数被调用时会被传入原函数的参数。
     *
     * 示例:
     *
     *     var sayHi = function(name){
     *         alert('Hi, ' + name);
     *     }
     *
     *     sayHi('Fred'); // 提示 "Hi, Fred"
     *
     *     // 不修改原函数的前提下,创建新的验证函数:
     *     var sayHiToFriend = Eui.Function.createInterceptor(sayHi, function(name){
     *         return name == 'Brian';
     *     });
     *
     *     sayHiToFriend('Fred');  // 没提示
     *     sayHiToFriend('Brian'); // 提示 "Hi, Brian"
     *
     * @param {Function} origFn 原始函数.
     * @param {Function} newFn 新的拦截函数
     * @param {Object} [scope] (可选) 传递的函数执行的作用域(this引用)。
     * 如果省略，默认指向被调用的原函数作用域或window。
     * @param {Object} [returnValue=null] (可选)返回的值，如果传递的函数返回false（默认为 null）。
     * @return {Function} The new function
     */
    createInterceptor: function(origFn, newFn, scope, returnValue) {
        var method = origFn;
        if (!Eui.isFunction(newFn)) {
            return origFn;
        } else {
            returnValue = Eui.isDefined(returnValue) ? returnValue : null;
            return function() {
                var me = this,
                    args = arguments;
                    
                newFn.target = me;
                newFn.method = origFn;
                return (newFn.apply(scope || me || Eui.global, args) !== false) ? origFn.apply(me || Eui.global, args) : returnValue;
            };
        }
    },

    /**
     * 创建一个委派对象（就是回调），调用时，在一个特定的延迟后执行。
     *
     * @param {Function} fn 当返回的函数调用时，该函数将在一个延迟后被调用。
     * 可选地,可以指定一个更换(或更多)的参数列表。
     * @param {Number} delay 每当调用时推迟执行的毫秒数。
     * @param {Object} scope (可选) 函数在执行时所使用的作用域(this引用)。
     * @param {Array} args (可选) 覆盖原函数的参数列表（默认为该函数的参数列表）。
     * @param {Boolean/Number} appendArgs (可选) 如果该参数为true，将参数加载到该函数的后面，
     * 如果该参数为数字类型，则将参数将插入到所指定的位置。
     * @return {Function} 一个函数，调用时，在指定的延迟之后执行原函数。
     */
    createDelayed: function(fn, delay, scope, args, appendArgs) {
        if (scope || args) {
            fn = Eui.Function.bind(fn, scope, args, appendArgs);
        }

        return function() {
            var me = this,
                args = Array.prototype.slice.call(arguments);

            setTimeout(function() {
                fn.apply(me, args);
            }, delay);
        };
    },

    /**
     * 延迟调用该函数。你可以加入一个作用域的参数，例如:
     *
     *     var sayHi = function(name){
     *         alert('Hi, ' + name);
     *     }
     *
     *     // 即刻执行:
     *     sayHi('Fred');
     *
     *     // 两秒过后执行：
     *     Eui.Function.defer(sayHi, 2000, this, ['Fred']);
     *
     *     // 有时候加上一个匿名，函数也是很方便的：
     *     Eui.Function.defer(function(){
     *         alert('Anonymous');
     *     }, 100);
     *
     * {@link Eui#defer Eui.defer} 是 {@link Eui.Function#defer Eui.Function.defer}的别名。
     *
     * @param {Function} fn 要延迟执行的函数。
     * @param {Number} millis 延迟时间，以毫秒为单位 (如果小于或等于 0 函数则立即执行)
     * @param {Object} scope (可选) 该函数执行的作用域(this引用)。
     * 如果省略，默认指向window。
     * @param {Array} args (可选) 覆盖原函数的参数列表 (默认为该函数的参数列表)
     * @param {Boolean/Number} appendArgs (可选) 如果该参数为true，将参数加载到该函数的后面，
     * 如果该参数为数字类型，则将参数将插入到所指定的位置。
     * @return {Number} 可被clearTimeout所使用的timeout id。
     */
    defer: function(fn, millis, scope, args, appendArgs) {
        fn = Eui.Function.bind(fn, scope, args, appendArgs);
        if (millis > 0) {
            return setTimeout(Eui.supports.TimeoutActualLateness ? function () {
                fn();
            } : fn, millis);
        }
        fn();
        return 0;
    },

    /**
     * 创建一个组合函数，调用次序为：原函数 + 参数中的函数。
     * 该函数返回了原函数执行的结果（也就是返回了原函数的返回值）。
     * 在参数中传递的函数，它的参数也是原函数的参数。 用法示例:
     *
     *     var sayHi = function(name){
     *         alert('Hi, ' + name);
     *     }
     *
     *     sayHi('Fred'); // 提示 "Hi, Fred"
     *
     *     var sayGoodbye = Eui.Function.createSequence(sayHi, function(name){
     *         alert('Bye, ' + name);
     *     });
     *
     *     sayGoodbye('Fred'); //  显示两个提示
     *
     * @param {Function} originalFn 原始函数。
     * @param {Function} newFn 新的组合函数。
     * @param {Object} scope (可选) 传递的函数执行的作用域(this引用)。
     * 如果省略，默认指向默认的全局环境对象(通常是window)。
     * @return {Function} 新的函数
     */
    createSequence: function(originalFn, newFn, scope) {
        if (!newFn) {
            return originalFn;
        }
        else {
            return function() {
                var result = originalFn.apply(this, arguments);
                newFn.apply(scope || this, arguments);
                return result;
            };
        }
    },

    /**
     * 创建一个缓冲函数，可选绑定范围，在调用时， 根据配置的毫秒数缓冲执行传递的函数。
     * 如果在此期间该函数被重复调用，则第一次调用将被取消， 重新开始计算缓冲时间。
     *
     * @param {Function} fn 需要被缓冲的原始函数。
     * @param {Number} buffer 缓冲函数调用执行的时间，单位是毫秒。
     * @param {Object} scope (可选) 该对象将作为代理函数执行的作用域(this引用)。
     * 如果省略，默认为调用者指定的作用域。
     * @param {Array} args (可选) 覆盖该次调用的参数列表。（默认为该函数的参数列表）。
     * @return {Function} 一个函数，在指定的时间缓冲之后调用传递的函数。
     */
    createBuffered: function(fn, buffer, scope, args) {
        var timerId;

        return function() {
            var callArgs = args || Array.prototype.slice.call(arguments, 0),
                me = scope || this;

            if (timerId) {
                clearTimeout(timerId);
            }

            timerId = setTimeout(function(){
                fn.apply(me, callArgs);
            }, buffer);
        };
    },

    /**
     * 创建一个指定函数的减速代理， 当减速函数被反复快速回调时，
     * 只有在上次调用完成的指定间间隔之后才会被调用。
     *
     * 对于包装可被反复调用的函数，如鼠标移动事件的情况下的处理程序时，
     * 处理是极其昂贵的，这是非常有用的。
     *
     * @param {Function} fn 要在一个固定的时间间隔执行的函数。
     * @param {Number} interval 减速函数执行的时间间隔毫秒为单位。
     * @param {Object} scope (可选) 传递的函数执行的作用域(this引用)。
     * 如果省略，默认为调用者指定的作用域。
     * @returns {Function} 一个函数，在指定的时间间隔调用传递函数。
     */
    createThrottled: function(fn, interval, scope) {
        var lastCallTime, elapsed, lastArgs, timer, execute = function() {
            fn.apply(scope || this, lastArgs);
            lastCallTime = Eui.Date.now();
        };

        return function() {
            elapsed = Eui.Date.now() - lastCallTime;
            lastArgs = arguments;

            clearTimeout(timer);
            if (!lastCallTime || (elapsed >= interval)) {
                execute();
            } else {
                timer = setTimeout(execute, interval - elapsed);
            }
        };
    },


    /**
     * 将行为添加到现有的方法是在该函数的原始行为之前执行。 例如:
     * 
     *     var soup = {
     *         contents: [],
     *         add: function(ingredient) {
     *             this.contents.push(ingredient);
     *         }
     *     };
     *     Eui.Function.interceptBefore(soup, "add", function(ingredient){
     *         if (!this.contents.length && ingredient !== "water") {
     *             // Always add water to start with
     *             this.contents.push("water");
     *         }
     *     });
     *     soup.add("onions");
     *     soup.add("salt");
     *     soup.contents; // will contain: water, onions, salt
     * 
     * @param {Object} object 目标对象
     * @param {String} methodName 要重写的方法名称
     * @param {Function} fn 新的行为函数。
     * 它将与原始方法相同的参数调用。
     * 此函数的返回值将成为新方法的返回值。

     * @param {Object} [scope] 要执行拦截器函数的作用域。默认为当前对象。
     * @return {Function} 刚创建的新函数。
     */
    interceptBefore: function(object, methodName, fn, scope) {
        var method = object[methodName] || Eui.emptyFn;

        return (object[methodName] = function() {
            var ret = fn.apply(scope || this, arguments);
            method.apply(this, arguments);

            return ret;
        });
    },

    /**
     * 将行为添加到现有的方法是在该函数的原始行为之后执行。 例如:
     * 
     *     var soup = {
     *         contents: [],
     *         add: function(ingredient) {
     *             this.contents.push(ingredient);
     *         }
     *     };
     *     Eui.Function.interceptAfter(soup, "add", function(ingredient){
     *         // Always add a bit of extra salt
     *         this.contents.push("salt");
     *     });
     *     soup.add("water");
     *     soup.add("onions");
     *     soup.contents; // will contain: water, salt, onions, salt
     * 
     * @param {Object} object 目标对象
     * @param {String} methodName 要重写的方法名称
     * @param {Function} fn 新的行为函数。
     * 它将与原始方法相同的参数调用。
     * 此函数的返回值将成为新方法的返回值。
     * @param {Object} [scope] 要执行拦截器函数的作用域。默认为当前对象。
     * @return {Function} 刚创建的新函数。
     */
    interceptAfter: function(object, methodName, fn, scope) {
        var method = object[methodName] || Eui.emptyFn;

        return (object[methodName] = function() {
            method.apply(this, arguments);
            return fn.apply(scope || this, arguments);
        });
    }
};

/**
 * alias to {@link Eui.Function.defer|defer}
 * @method defer
 * @memberof $
 */
Eui.defer = Eui.Function.alias(Eui.Function, 'defer');

/**
 * alias to {@link Eui.Function.pass|pass}
 * @method pass
 * @memberof $
 */
Eui.pass = Eui.Function.alias(Eui.Function, 'pass');

/**
 * alias to {@link Eui.Function.bind|bind}
 * @method bind
 * @memberof $
 */
Eui.bind = Eui.Function.alias(Eui.Function, 'bind');
