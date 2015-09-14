/**
 * (c)2015  Create at: 2015-06-04
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath util/array.js
 *
 * Eui.js may be freely distributed under the MIT license.
 *
 * 一组处理数组的实用静态方法集合; 提供某些老版本浏览器缺少的方法.
 * @namespace Eui.Array
 */
(function() {

    var arrayPrototype = Array.prototype,
        slice = arrayPrototype.slice,
        supportsSplice = (function () {
            var array = [],
                lengthBefore,
                j = 20;

            if (!array.splice) {
                return false;
            }

            // This detects a bug in IE8 splice method:
            // see http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/6e946d03-e09f-4b22-a4dd-cd5e276bf05a/

            while (j--) {
                array.push("A");
            }

            array.splice(15, 0, "F", "F", "F", "F", "F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F");

            lengthBefore = array.length; //41
            array.splice(13, 0, "XXX"); // add one element

            if (lengthBefore+1 != array.length) {
                return false;
            }
            // end IE8 bug

            return true;
        }()),
        supportsForEach = 'forEach' in arrayPrototype,
        supportsMap = 'map' in arrayPrototype,
        supportsIndexOf = 'indexOf' in arrayPrototype,
        supportsEvery = 'every' in arrayPrototype,
        supportsSome = 'some' in arrayPrototype,
        supportsFilter = 'filter' in arrayPrototype,
        supportsSort = (function() {
            var a = [1,2,3,4,5].sort(function(){ return 0; });
            return a[0] === 1 && a[1] === 2 && a[2] === 3 && a[3] === 4 && a[4] === 5;
        }()),
        supportsSliceOnNodeList = true,
        ExtArray,
        erase,
        replace,
        splice;

    try {
        // IE 6 - 8 will throw an error when using Array.prototype.slice on NodeList
        if (typeof document !== 'undefined') {
            slice.call(document.getElementsByTagName('body'));
        }
    } catch (e) {
        supportsSliceOnNodeList = false;
    }

    function fixArrayIndex (array, index) {
        return (index < 0) ? Math.max(0, array.length + index)
                           : Math.min(array.length, index);
    }

    function replaceSim (array, index, removeCount, insert) {
        var add = insert ? insert.length : 0,
            length = array.length,
            pos = fixArrayIndex(array, index),
            remove,
            tailOldPos,
            tailNewPos,
            tailCount,
            lengthAfterRemove,
            i;

        // we try to use Array.push when we can for efficiency...
        if (pos === length) {
            if (add) {
                array.push.apply(array, insert);
            }
        } else {
            remove = Math.min(removeCount, length - pos);
            tailOldPos = pos + remove;
            tailNewPos = tailOldPos + add - remove;
            tailCount = length - tailOldPos;
            lengthAfterRemove = length - remove;

            if (tailNewPos < tailOldPos) { // case A
                for (i = 0; i < tailCount; ++i) {
                    array[tailNewPos+i] = array[tailOldPos+i];
                }
            } else if (tailNewPos > tailOldPos) { // case B
                for (i = tailCount; i--; ) {
                    array[tailNewPos+i] = array[tailOldPos+i];
                }
            } // else, add == remove (nothing to do)

            if (add && pos === lengthAfterRemove) {
                array.length = lengthAfterRemove; // truncate array
                array.push.apply(array, insert);
            } else {
                array.length = lengthAfterRemove + add; // reserves space
                for (i = 0; i < add; ++i) {
                    array[pos+i] = insert[i];
                }
            }
        }

        return array;
    }

    function replaceNative (array, index, removeCount, insert) {
        if (insert && insert.length) {
            // Inserting at index zero with no removing: use unshift
            if (index === 0 && !removeCount) {
                array.unshift.apply(array, insert);
            }
            // Inserting/replacing in middle of array
            else if (index < array.length) {
                array.splice.apply(array, [index, removeCount].concat(insert));
            }
            // Appending to array
            else {
                array.push.apply(array, insert);
            }
        } else {
            array.splice(index, removeCount);
        }
        return array;
    }

    function eraseSim (array, index, removeCount) {
        return replaceSim(array, index, removeCount);
    }

    function eraseNative (array, index, removeCount) {
        array.splice(index, removeCount);
        return array;
    }

    function spliceSim (array, index, removeCount) {
        var pos = fixArrayIndex(array, index),
            removed = array.slice(index, fixArrayIndex(array, pos+removeCount));

        if (arguments.length < 4) {
            replaceSim(array, pos, removeCount);
        } else {
            replaceSim(array, pos, removeCount, slice.call(arguments, 3));
        }

        return removed;
    }

    function spliceNative (array) {
        return array.splice.apply(array, slice.call(arguments, 1));
    }

    erase = supportsSplice ? eraseNative : eraseSim;
    replace = supportsSplice ? replaceNative : replaceSim;
    splice = supportsSplice ? spliceNative : spliceSim;

    // NOTE: from here on, use erase, replace or splice (not native methods)...

    ExtArray = Eui.Array = {
        /**
         * 迭代一个数组或是可迭代的值，在每个元素上调用给定的回调函数。
         *
         *     var countries = ['Vietnam', 'Singapore', 'United States', 'Russia'];
         *
         *     Eui.Array.each(countries, function(name, index, countriesItSelf) {
         *         console.log(name);
         *     });
         *
         *     var sum = function() {
         *         var sum = 0;
         *
         *         Eui.Array.each(arguments, function(value) {
         *             sum += value;
         *         });
         *
         *         return sum;
         *     };
         *
         *     sum(1, 2, 3); // returns 6
         *
         * 在回调函数中返回false，即可停止迭代过程。
         *
         *     Eui.Array.each(countries, function(name, index, countriesItSelf) {
         *         if (name === 'Singapore') {
         *             return false; // break here
         *         }
         *     });
         *
         * {@link Eui#each Eui.each} 是 {@link Eui.Array#each Eui.Array.each}的别名。
         * @memberof Eui.Array
         * @param {Array/NodeList/Object} array 将要迭代的值。
         * 如果这个参数不可迭代，回调函数将只调用一次。
         * @param {Function} fn 回调函数. 如果返回false, 迭代将停止， 方法返回当前的索引.
         * @param {Object} fn.item 数组当前的索引中的元素
         * @param {Number} fn.index 数组当前的索引
         * @param {Array} fn.allItems 作为方法第一个参数的数组本身
         * @param {Boolean} fn.return 返回false来停止迭代。
         * @param {Object} scope (Optional) 指定函数执行的(this 引用)作用域。
         * @param {Boolean} [reverse=false] 反转迭代的顺序（从尾到头循环）。
         * @return {Boolean} 参见 fn 参数的描述.
         */
        each: function(array, fn, scope, reverse) {
            array = ExtArray.from(array);

            var i,
                ln = array.length;

            if (reverse !== true) {
                for (i = 0; i < ln; i++) {
                    if (fn.call(scope || array[i], array[i], i, array) === false) {
                        return i;
                    }
                }
            }
            else {
                for (i = ln - 1; i > -1; i--) {
                    if (fn.call(scope || array[i], array[i], i, array) === false) {
                        return i;
                    }
                }
            }

            return true;
        },

        /**
         * 迭代一个数组，在每个元素上调用给定的回调函数。
         * 注意如果原生的Array.prototype.forEach被支持， 这个函数将委托到Array.prototype.forEach。
         * 它不支持像{@link Eui.Array.each}一样， 通过返回一个false来停止迭代。
         * 因此，其性能在现代的浏览器中会比{@link Eui.Array.each}更好。
         *
         * @memberof Eui.Array
         * @function
         * @param {Array} array 要迭代的数组
         * @param {Function} fn 回调函数
         * @param {Object} fn.item 数组当前的索引中的元素
         * @param {Number} fn.index 数组当前的索引
         * @param {Array}  fn.allItems 作为方法第一个参数的数组本身
         * @param {Object} scope (Optional) 指定函数执行的(this 引用)作用域。
         */
        forEach: supportsForEach ? function(array, fn, scope) {
            array.forEach(fn, scope);
        } : function(array, fn, scope) {
            var i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                fn.call(scope, array[i], i, array);
            }
        },

        /**
         * 查找指定元素在数组中的索引位置， 补充IE中缺少的arrayPrototype.indexOf原生方法。
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array 要检查的数组
         * @param {Object} item 要查找的元素
         * @param {Number} from (Optional) 搜索的起始位置
         * @return {Number} 元素在数组中的索引位置（找不到时为-1）
         */
        indexOf: supportsIndexOf ? function(array, item, from) {
            return arrayPrototype.indexOf.call(array, item, from);
         } : function(array, item, from) {
            var i, length = array.length;

            for (i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }

            return -1;
        },

        /**
         * 检查数组中是否包含给定元素。
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array 要检查的数组
         * @param {Object} item 要查找的元素
         * @return {Boolean} 数组包含元素则为true，否则为false。
         */
        contains: supportsIndexOf ? function(array, item) {
            return arrayPrototype.indexOf.call(array, item) !== -1;
        } : function(array, item) {
            var i, ln;

            for (i = 0, ln = array.length; i < ln; i++) {
                if (array[i] === item) {
                    return true;
                }
            }

            return false;
        },

        /**
         * 将一个可迭代元素(具有数字下标和length属性)转换为一个真正的数组。
         *
         *     function test() {
         *         var args = Eui.Array.toArray(arguments),
         *             fromSecondToLastArgs = Eui.Array.toArray(arguments, 1);
         *
         *         alert(args.join(' '));
         *         alert(fromSecondToLastArgs.join(' '));
         *     }
         *
         *     test('just', 'testing', 'here'); // 提示  'just testing here';
         *                                      // 提示  'testing here';
         *
         *     Eui.Array.toArray(document.getElementsByTagName('div')); // 将把 NodeList 转换成一个数组
         *     Eui.Array.toArray('splitted'); // returns ['s', 'p', 'l', 'i', 't', 't', 'e', 'd']
         *     Eui.Array.toArray('splitted', 0, 3); // returns ['s', 'p', 'l']
         *
         * {@link Eui#toArray Eui.toArray}是 {@link Eui.Array#toArray Eui.Array.toArray}的别名。
         *
         * @function
         * @memberof Eui.Array
         * @param {Object} itEuible 可迭代的对象。
         * @param {Number} start (Optional) 从0开始的索引，表示要转换的起始位置. 默认为 0。
         * @param {Number} end (Optional) 从1开始的索引，表示要转换的结束位置。 默认为要迭代元素的末尾位置。
         * @return {Array} array
         */
        toArray: function(itEuible, start, end){
            if (!itEuible || !itEuible.length) {
                return [];
            }

            if (typeof itEuible === 'string') {
                itEuible = itEuible.split('');
            }

            if (supportsSliceOnNodeList) {
                return slice.call(itEuible, start || 0, end || itEuible.length);
            }

            var array = [],
                i;

            start = start || 0;
            end = end ? ((end < 0) ? itEuible.length + end : end) : itEuible.length;

            for (i = start; i < end; i++) {
                array.push(itEuible[i]);
            }

            return array;
        },

        /**
         * 获取数组中每个元素的制定属性值. 示例:
         *
         *     Eui.Array.pluck(Eui.query("p"), "className"); // [el1.className, el2.className, ..., elN.className]
         *
         * @memberof Eui.Array
         * @param {Array/NodeList} array The Array of items to pluck the value from.
         * @param {String} propertyName 元素的属性名称。
         * @return {Array} 从数组中的每一项的值。
         */
        pluck: function(array, propertyName) {
            var ret = [],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                ret.push(item[propertyName]);
            }

            return ret;
        },

        /**
         * 通过在数组的每个元素中调用一个特定函数，用结果创建一个新数组。
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array
         * @param {Function} fn 每个元素上的回调函数。
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being itEuited.
         * @param {Object} [scope] 回调函数的作用域。
         * @return {Array} results
         */
        map: supportsMap ? function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.map must have a callback function passed as second argument.');
            }
            //</debug>
            return array.map(fn, scope);
        } : function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.map must have a callback function passed as second argument.');
            }
            //</debug>
            var results = [],
                i = 0,
                len = array.length;

            for (; i < len; i++) {
                results[i] = fn.call(scope, array[i], i, array);
            }

            return results;
        },

        /**
         * 在数组的每个元素上执行指定函数，
         * 直到函数返回一个false值 如果某个元素上返回了false值，
         * 本函数立即返回false 否则函数返回true
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array
         * @param {Function} fn 每个元素上的回调函数。
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being itEuited.
         * @param {Object} scope 回调函数的作用域
         * @return {Boolean} 如果回调函数没有返回false值则为true。
         */
        every: supportsEvery ? function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.every must have a callback function passed as second argument.');
            }
            //</debug>
            return array.every(fn, scope);
        } : function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.every must have a callback function passed as second argument.');
            }
            //</debug>
            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (!fn.call(scope, array[i], i, array)) {
                    return false;
                }
            }

            return true;
        },

        /**
         * 在数组的每个元素上执行指定函数，
         * 直到函数返回一个true值 如果某个元素上返回了true值，本函数立即返回true。
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array
         * @param {Function} fn 每个元素上的回调函数
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being itEuited.
         * @param {Object} scope 回调函数的作用域
         * @return {Boolean} 如果回调函数返回一个true值则为true。
         */
        some: supportsSome ? function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.some must have a callback function passed as second argument.');
            }
            //</debug>
            return array.some(fn, scope);
        } : function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Eui.Error.raise('Eui.Array.some must have a callback function passed as second argument.');
            }
            //</debug>
            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (fn.call(scope, array[i], i, array)) {
                    return true;
                }
            }

            return false;
        },
        
        /**
         * 比较两个数组是否绝对的相等。
         *
         * @memberof Eui.Array
         * @param {Array} array1
         * @param {Array} array2
         * @return {Boolean} 如果相等，则返回true。
         */
        equals: function(array1, array2) {
            var len1 = array1.length,
                len2 = array2.length,
                i;
                
            // Short circuit if the same array is passed twice
            if (array1 === array2) {
                return true;
            }
                
            if (len1 !== len2) {
                return false;
            }
            
            for (i = 0; i < len1; ++i) {
                if (array1[i] !== array2[i]) {
                    return false;
                }
            }
            
            return true;
        },

        /**
         * 过滤掉数组里的空值，空值的定义见 {@link Eui.isEmpty}
         *
         * 参见 {@link Eui.Array.filter}.
         *
         * @memberof Eui.Array
         * @param {Array} array
         * @return {Array} results
         */
        clean: function(array) {
            var results = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (!Eui.isEmpty(item)) {
                    results.push(item);
                }
            }

            return results;
        },

        /**
         * 返回一个去掉重复元素的新数组。
         *
         * @memberof Eui.Array
         * @param {Array} array
         * @return {Array} results
         */
        unique: function(array) {
            var clone = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (ExtArray.indexOf(clone, item) === -1) {
                    clone.push(item);
                }
            }

            return clone;
        },

        /**
         * Creates a new array with all of the elements of this array for which
         * the provided filtering function returns true.
         *
         * @function
         * @param {Array} array
         * @param {Function} fn Callback function for each item
         * @param {Mixed} fn.item Current item.
         * @param {Number} fn.index Index of the item.
         * @param {Array} fn.array The whole array that's being itEuited.
         * @param {Object} scope Callback function scope
         * @return {Array} results
         */
        filter: supportsFilter ? function(array, fn, scope) {
            //<debug>
            if (!fn) {
                console.log('Eui.Array.filter must have a filter function passed as second argument.');
            }
            //</debug>
            return array.filter(fn, scope);
        } : function(array, fn, scope) {
            //<debug>
            if (!fn) {
                console.log('Eui.Array.filter must have a filter function passed as second argument.');
            }
            //</debug>
            var results = [],
                i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                if (fn.call(scope, array[i], i, array)) {
                    results.push(array[i]);
                }
            }

            return results;
        },

        /**
         * Returns the first item in the array which elicits a true return value from the
         * passed selection function.
         *
         * @memberof Eui.Array
         * @param {Array} array The array to search
         * @param {Function} fn The selection function to execute for each item.
         * @param {Mixed} fn.item The array item.
         * @param {String} fn.index The index of the array item.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the
         * function is executed. Defaults to the array
         * @return {Object} The first item in the array which returned true from the selection
         * function, or null if none was found.
         */
        findBy : function(array, fn, scope) {
            var i = 0,
                len = array.length;

            for (; i < len; i++) {
                if (fn.call(scope || array, array[i], i)) {
                    return array[i];
                }
            }
            return null;
        },

        /**
         * 将一个值转换为一个数组，函数返回:
         *
         * - 一个空数组，如果给定的值是 undefined 或 null
         * - 数组本身，如果已经是一个数组
         * - 一个数组的拷贝，如果给定的值是 {@link Eui#isItEuible itEuible} (arguments, NodeList 等等)
         * - 一个包含给定值作为唯一元素的数组 ,其他情况。
         *
         * @memberof Eui.Array
         * @param {Object} value 给定的值
         * @param {Boolean} newReference (Optional) 为true则如有必要克隆给定数组然后返回一个其新引用 默认为false。
         * @return {Array} array
         */
        from: function(value, newReference) {
            if (value === undefined || value === null) {
                return [];
            }

            if (Eui.isArray(value)) {
                return (newReference) ? slice.call(value) : value;
            }

            var type = typeof value;
            // Both strings and functions will have a length property. In phantomJS, NodeList
            // instances report typeof=='function' but don't have an apply method...
            if (value && value.length !== undefined && type !== 'string' && (type !== 'function' || !value.apply)) {
                return ExtArray.toArray(value);
            }

            return [value];
        },

        /**
         * 移除数组中的指定元素。
         *
         * @memberof Eui.Array
         * @param {Array} array 重复
         * @param {Object} item 要移除的元素
         * @return {Array} 数组本身
         */
        remove: function(array, item) {
            var index = ExtArray.indexOf(array, item);

            if (index !== -1) {
                erase(array, index, 1);
            }

            return array;
        },

        /**
         * 把一个元素插入到数组，如果它不存在于这个数组。
         *
         * @memberof Eui.Array
         * @param {Array} array 数组
         * @param {Object} item 待插入的元素
         */
        include: function(array, item) {
            if (!ExtArray.contains(array, item)) {
                array.push(item);
            }
        },

        /**
         * 克隆一个数组，而不引用原数组，注意着不同于Eui.clone，Eui.clone不递归克隆。
         * 它把Array.prototype.slice.call(array)方法简化 成一个方便的、容易记住的方法。
         *
         * @memberof Eui.Array
         * @param {Array} array 数组
         * @return {Array} 克隆的数组
         */
        clone: function(array) {
            return slice.call(array);
        },

        /**
         * 合并多个数组中的不重复元素到一个数组。
         *
         * {@link Eui.Array#union}是{@link Eui.Array#merge}的别名。
         *
         * @memberof Eui.Array
         * @param {Array} array1
         * @param {Array} array2
         * @param {Array} etc
         * @return {Array} 合并的数组
         */
        merge: function() {
            var args = slice.call(arguments),
                array = [],
                i, ln;

            for (i = 0, ln = args.length; i < ln; i++) {
                array = array.concat(args[i]);
            }

            return ExtArray.unique(array);
        },

        /**
         * 返回多个数组的公共交集。
         *
         * @memberof Eui.Array
         * @param {Array} array1
         * @param {Array} array2
         * @param {Array} etc
         * @return {Array} 交集
         */
        intersect: function() {
            var intersection = [],
                arrays = slice.call(arguments),
                arraysLength,
                array,
                arrayLength,
                minArray,
                minArrayIndex,
                minArrayCandidate,
                minArrayLength,
                element,
                elementCandidate,
                elementCount,
                i, j, k;

            if (!arrays.length) {
                return intersection;
            }

            // Find the smallest array
            arraysLength = arrays.length;
            for (i = minArrayIndex = 0; i < arraysLength; i++) {
                minArrayCandidate = arrays[i];
                if (!minArray || minArrayCandidate.length < minArray.length) {
                    minArray = minArrayCandidate;
                    minArrayIndex = i;
                }
            }

            minArray = ExtArray.unique(minArray);
            erase(arrays, minArrayIndex, 1);

            // Use the smallest unique'd array as the anchor loop. If the other array(s) do contain
            // an item in the small array, we're likely to find it before reaching the end
            // of the inner loop and can terminate the search early.
            minArrayLength = minArray.length;
            arraysLength = arrays.length;
            for (i = 0; i < minArrayLength; i++) {
                element = minArray[i];
                elementCount = 0;

                for (j = 0; j < arraysLength; j++) {
                    array = arrays[j];
                    arrayLength = array.length;
                    for (k = 0; k < arrayLength; k++) {
                        elementCandidate = array[k];
                        if (element === elementCandidate) {
                            elementCount++;
                            break;
                        }
                    }
                }

                if (elementCount === arraysLength) {
                    intersection.push(element);
                }
            }

            return intersection;
        },

        /**
         * 返回 A-B的差异集合，从A中减去所有B中存在的元素。
         *
         * @memberof Eui.Array
         * @param {Array} arrayA
         * @param {Array} arrayB
         * @return {Array} A中不同于B的元素
         */
        difference: function(arrayA, arrayB) {
            var clone = slice.call(arrayA),
                ln = clone.length,
                i, j, lnB;

            for (i = 0,lnB = arrayB.length; i < lnB; i++) {
                for (j = 0; j < ln; j++) {
                    if (clone[j] === arrayB[i]) {
                        erase(clone, j, 1);
                        j--;
                        ln--;
                    }
                }
            }

            return clone;
        },

        /**
         * 返回一个数组中一部分的浅表复制。
         * 等价于 原生方法 "Array.prototype.slice.call(array, begin, end)"。
         * 经常被使用于数组 作为arguments，arguments对象没有提供slice方法，
         * 但是可以作为上下文对象使用 Array.prototype.slice方法。
         *
         * @memberof Eui.Array
         * @param {Array} array 数组 (或 arguments 对象)
         * @param {Number} begin 起始索引。为负值则 从数组的末尾计算位移
         * @param {Number} end 结束索引。 复制元素不包括结尾处的元素。
         * 为负值则从数组的末尾计算位移，如果结尾被省略，
         * 数组中一直到结尾的所有元素将被复制。
         *
         * @return {Array} 数组的拷贝件.
         * @method slice
         */
        // Note: IE6 will return [] on slice.call(x, undefined).
        slice: ([1,2].slice(1, undefined).length ?
            function (array, begin, end) {
                return slice.call(array, begin, end);
            } :
            // at least IE6 uses arguments.length for variadic signature
            function (array, begin, end) {
                // After tested for IE 6, the one below is of the best performance
                // see http://jsperf.com/slice-fix
                if (typeof begin === 'undefined') {
                    return slice.call(array);
                }
                if (typeof end === 'undefined') {
                    return slice.call(array, begin);
                }
                return slice.call(array, begin, end);
            }
        ),

        /**
         * 排序数组中的元素 默认使用字母表，按升序排序。
         *
         * @function
         * @memberof Eui.Array
         * @param {Array} array 进行排序的数组。
         * @param {Function} sortFn (optional) 比较函数.
         * @param {Mixed} sortFn.a An item to compare.
         * @param {Mixed} sortFn.b Another item to compare.
         * @return {Array} 排序后的数组.
         */
        sort: supportsSort ? function(array, sortFn) {
            if (sortFn) {
                return array.sort(sortFn);
            } else {
                return array.sort();
            }
         } : function(array, sortFn) {
            var length = array.length,
                i = 0,
                comparison,
                j, min, tmp;

            for (; i < length; i++) {
                min = i;
                for (j = i + 1; j < length; j++) {
                    if (sortFn) {
                        comparison = sortFn(array[j], array[min]);
                        if (comparison < 0) {
                            min = j;
                        }
                    } else if (array[j] < array[min]) {
                        min = j;
                    }
                }
                if (min !== i) {
                    tmp = array[i];
                    array[i] = array[min];
                    array[min] = tmp;
                }
            }

            return array;
        },

        /**
         * 递归将数组和数组中的元素转换为一维数组。
         *
         * @memberof Eui.Array
         * @param {Array} array The array to flatten
         * @return {Array} 一维数组.
         */
        flatten: function(array) {
            var worker = [];

            function rFlatten(a) {
                var i, ln, v;

                for (i = 0, ln = a.length; i < ln; i++) {
                    v = a[i];

                    if (Eui.isArray(v)) {
                        rFlatten(v);
                    } else {
                        worker.push(v);
                    }
                }

                return worker;
            }

            return rFlatten(array);
        },

        /**
         * 返回数组中的最小值。
         *
         * @memberof Eui.Array
         * @param {Array/NodeList} array The Array from which to select the minimum value.
         * @param {Function} comparisonFn (optional) 比较函数 如果被忽略，
         * 则使用 "<" 操作符。 注意: gt = 1; eq = 0; lt = -1
         * @param {Mixed} comparisonFn.min Current minimum value.
         * @param {Mixed} comparisonFn.item The value to compare with the current minimum.
         * @return {Object} minValue 最小值
         */
        min: function(array, comparisonFn) {
            var min = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(min, item) === 1) {
                        min = item;
                    }
                }
                else {
                    if (item < min) {
                        min = item;
                    }
                }
            }

            return min;
        },

        /**
         * 返回数组中的最大值。
         *
         * @memberof Eui.Array
         * @param {Array/NodeList} array The Array from which to select the maximum value.
         * @param {Function} comparisonFn (optional) 比较函数 如果被忽略，则使用 ">" 操作符。
         * 注意: gt = 1; eq = 0; lt = -1
         * @param {Mixed} comparisonFn.max Current maximum value.
         * @param {Mixed} comparisonFn.item The value to compare with the current maximum.
         * @return {Object} maxValue 最大值
         */
        max: function(array, comparisonFn) {
            var max = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(max, item) === -1) {
                        max = item;
                    }
                }
                else {
                    if (item > max) {
                        max = item;
                    }
                }
            }

            return max;
        },

        /**
         * 计算数组中元素的平均值。
         *
         * @memberof Eui.Array
         * @param {Array} array 待计算平均值的数组.
         * @return {Number} 平均值.
         */
        mean: function(array) {
            return array.length > 0 ? ExtArray.sum(array) / array.length : undefined;
        },

        /**
         * 计算数组中元素的和。
         *
         * @memberof Eui.Array
         * @param {Array} array 待计算总和的数组.
         * @return {Number} 总和.
         */
        sum: function(array) {
            var sum = 0,
                i, ln, item;

            for (i = 0,ln = array.length; i < ln; i++) {
                item = array[i];

                sum += item;
            }

            return sum;
        },

        /**
         * 使用给定数组中的元素作为key，创建一个map对象，值是元素的索引+1。示例:
         * 
         *      var map = Eui.Array.toMap(['a','b','c']);
         *
         *      // map = { a: 1, b: 2, c: 3 };
         * 
         * 或者指定一个key属性:
         * 
         *      var map = Eui.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], 'name');
         *
         *      // map = { a: 1, b: 2, c: 3 };
         * 
         * 当然, 也可以指定一个key生成函数:
         * 
         *      var map = Eui.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], function (obj) { return obj.name.toUpperCase(); });
         *
         *      // map = { A: 1, B: 2, C: 3 };
         *
         * @memberof Eui.Array
         * @param {Array} array The Array to create the map from.
         * @param {String/Function} [getKey] Name of the object property to use
         * as a key or a function to extract the key.
         * @param {Object} [scope] Value of this inside callback.
         * @return {Object} The resulting map.
         */
        toMap: function(array, getKey, scope) {
            var map = {},
                i = array.length;

            if (!getKey) {
                while (i--) {
                    map[array[i]] = i+1;
                }
            } else if (typeof getKey == 'string') {
                while (i--) {
                    map[array[i][getKey]] = i+1;
                }
            } else {
                while (i--) {
                    map[getKey.call(scope, array[i])] = i+1;
                }
            }

            return map;
        },

        /**
         * Creates a map (object) keyed by a property of elements of the given array. The values in
         * the map are the array element. For example:
         * 
         *      var map = Eui.Array.toMap(['a','b','c']);
         *
         *      // map = { a: 'a', b: 'b', c: 'c' };
         * 
         * Or a key property can be specified:
         * 
         *      var map = Eui.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], 'name');
         *
         *      // map = { a: {name: 'a'}, b: {name: 'b'}, c: {name: 'c'} };
         * 
         * Lastly, a key extractor can be provided:
         * 
         *      var map = Eui.Array.toMap([
         *              { name: 'a' },
         *              { name: 'b' },
         *              { name: 'c' }
         *          ], function (obj) { return obj.name.toUpperCase(); });
         *
         *      // map = { A: {name: 'a'}, B: {name: 'b'}, C: {name: 'c'} };
         *
         * @memberof Eui.Array
         * @param {Array} array The Array to create the map from.
         * @param {String/Function} [getKey] Name of the object property to use
         * as a key or a function to extract the key.
         * @param {Object} [scope] Value of this inside callback.
         * @return {Object} The resulting map.
         */
        toValueMap: function(array, getKey, scope) {
            var map = {},
                i = array.length;

            if (!getKey) {
                while (i--) {
                    map[array[i]] = array[i];
                }
            } else if (typeof getKey == 'string') {
                while (i--) {
                    map[array[i][getKey]] = array[i];
                }
            } else {
                while (i--) {
                    map[getKey.call(scope, array[i])] = array[i];
                }
            }

            return map;
        },

        //<debug>
        _replaceSim: replaceSim, // for unit testing
        _spliceSim: spliceSim,
        //</debug>

        /**
         * 移除数组中的多个元素。这个功能相当于Array的splice方法。
         * 但是避免了IE8的splice函数bug，不会复制移除的元素并按次序返回它们。（因为它们通常被忽略）
         *
         * @memberof Eui.Array
         * @param {Array} array 数组
         * @param {Number} index 要操作的索引位置
         * @param {Number} removeCount 要移除的元素数量
         * @return {Array} 处理后的数组。
         * @method
         */
        erase: erase,

        /**
         * 在数组中插入多个元素。
         *
         * @memberof Eui.Array
         * @param {Array} array 数组.
         * @param {Number} index 插入的位置索引
         * @param {Array} items 要插入的多个元素
         * @return {Array} 插入后的数组。
         */
        insert: function (array, index, items) {
            return replace(array, index, 0, items);
        },

        /**
         * 替换数组里的多个元素。这个功能相当于Array的splice方法。
         * 但是避免了IE8的splice函数bug，而且更便于使用，
         * 因为它插入一个元素的数组，而不是一个可变参数列表。
         *
         * @memberof Eui.Array
         * @param {Array} array 数组.
         * @param {Number} index要操作的索引位置.
         * @param {Number} removeCount 要移除的元素数量（可以为0）.
         * @param {Array} insert (optional) 要插入的数组.
         * @return {Array} 处理后的数组
         * @method
         */
        replace: replace,

        /**
         * 替换数组里的多个元素。这个功能相当于Array的splice方法。
         * 但是避免了IE8的splice函数bug，
         * 除了第一个argument参数以外， 与splice方法的签名相同。
         * removeCount后面的所有参数都将被插入到指定位置。
         *
         * @memberof Eui.Array
         * @param {Array} array 待替换的数组.
         * @param {Number} index 要操作的索引位置
         * @param {Number} removeCount 要移除的元素数量（可以为0）
         * @param {...Object} elements 要添加到数组的多个元素.
         * 如果没有指定任何元素，splice简化为从数组移除元素。
         * @return {Array} 处理后的数组。
         * @method
         */
        splice: splice,

        /**
         * 在数组的末尾添加新的元素。
         *
         * 参数可能是一个元素集合、也可能是多个元素集合的数组。
         * 如果参数列表中存在一个数组， 则它的所有元素都将被添加到给定数组的末尾。
         *
         * @memberof Eui.Array
         * @param {Array} target 目标数组
         * @param {...Object} elements 要添加的元素。
         * 每个元素可能也是一个数组。
         * 这种情形下，各数组的所有元素也将被添加到目标数组的末尾。
         * @return {Array} 处理后的数组。
         *
         */
        push: function(array) {
            var len = arguments.length,
                i = 1,
                newItem;

            if (array === undefined) {
                array = [];
            } else if (!Eui.isArray(array)) {
                array = [array];
            }
            for (; i < len; i++) {
                newItem = arguments[i];
                Array.prototype.push[Eui.isIterable(newItem) ? 'apply' : 'call'](array, newItem);
            }
            return array;
        }
    };

    /**
     * @method union
     * @memberof Eui.Array
     */
    ExtArray.union = ExtArray.merge;

    /**
     * Old alias to {@link Eui.Array.min|min}
     * @method min
     * @memberof $
     */
    Eui.min = ExtArray.min;

    /**
     * Old alias to {@link Eui.Array.max|max}
     * @method max
     * @memberof $
     */
    Eui.max = ExtArray.max;

    /**
     * Old alias to {@link Eui.Array.sum|sum}
     * @method sum
     * @memberof $
     */
    Eui.sum = ExtArray.sum;

    /**
     * Old alias to {@link Eui.Array.mean|mean}
     * @method mean
     * @memberof $
     */
    Eui.mean = ExtArray.mean;

    /**
     * Old alias to {@link Eui.Array.flatten|flatten}
     * @method flatten
     * @memberof $
     */
    Eui.flatten = ExtArray.flatten;

    /**
     * Old alias to {@link Eui.Array.clean|clean}
     * @method clean
     * @memberof $
     */
    Eui.clean = ExtArray.clean;

    /**
     * Old alias to {@link Eui.Array.unique|unique}
     * @method unique
     * @memberof $
     */
    Eui.unique = ExtArray.unique;

    /**
     * Old alias to {@link Eui.Array.pluck|pluck}
     * @method  pluck
     * @memberof $
     */
    Eui.pluck = ExtArray.pluck;

    /**
     * @method toArray
     * @memberof $
     */
    Eui.toArray = function() {
        return ExtArray.toArray.apply(ExtArray, arguments);
    };
}());
