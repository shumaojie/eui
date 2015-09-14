/**
 * 仅提供简单的on，off(仅支持事件委托，不支持当前元素绑定，当前元素绑定请直接使用addEventListener,removeEventListener)
 * @param {Object} $
 */
(function($) {

    /**
     * 委派`on`事件，主要用来绑定`手势`事件，比如:`tap`,`doubletap`,`longtap`,`hold`,`release`,`swipeleft`,`swiperight`等。
     *
     * @function
     * @name $.fn#on
     * @param {string} event
     * @param {string} selector
     * @param {Function} callback
     * @returns {self}
     */
    $.fn.on = function(event, selector, callback) {
        this.each(function() {
            var element = this;
            element.addEventListener(event, function(e) {
                var delegates = $(selector, element);
                var target = e.target;
                if (delegates && delegates.length > 0) {
                    for (; target && target !== document; target = target.parentNode) {
                        if (target === element) {
                            break;
                        }
                        if (target && ~delegates.indexOf(target)) {
                            if (!e.detail) {
                                e.detail = {
                                    currentTarget: target
                                };
                            } else {
                                e.detail.currentTarget = target;
                            }
                            callback.call(target, e);
                        }
                    }
                }
            });
            ////避免多次on的时候重复绑定
            element.removeEventListener($.EVENT_CLICK, preventDefault);
            //click event preventDefault
            element.addEventListener($.EVENT_CLICK, preventDefault);
        });
    };
    var preventDefault = function(e) {
        var tagName = e.target && e.target.tagName;
        if (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'SELECT') {
            e.preventDefault();
        }
    };
})(Eui);