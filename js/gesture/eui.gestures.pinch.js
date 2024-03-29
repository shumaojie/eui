/**
 * (c)2015  Create at: 2015-08-06 10:27
 * @author Scm <ejbscm@hotmail.com>
 * @docauthor Scm <ejbscm@hotmail.com>
 * @filepath gesture/eui.gestures.pinch.js
 *
 * Eui.js may be freely distributed under the MIT license.
 * mui gesture pinch.
 */
(function($, name) {
    var handle = function(event, touch) {
        var options = this.options;
        var session = $.gestures.session;
        switch (event.type) {
            case $.EVENT_START:
                break;
            case $.EVENT_MOVE:
                if ($.options.gestureConfig.pinch) {
                    if (touch.touches.length < 2) {
                        return;
                    }
                    if (!session.pinch) { //start
                        session.pinch = true;
                        $.trigger(session.target, name + 'start', touch);
                    }
                    $.trigger(session.target, name, touch);
                    var scale = touch.scale;
                    var rotation = touch.rotation;
                    var lastScale = typeof touch.lastScale === 'undefined' ? 1 : touch.lastScale;
                    var scaleDiff = 0.000000000001; //防止scale与lastScale相等，不触发事件的情况。
                    if (scale > lastScale) { //out
                        lastScale = scale - scaleDiff;
                        $.trigger(session.target, name + 'out', touch);
                    } //in
                    else if (scale < lastScale) {
                        lastScale = scale + scaleDiff;
                        $.trigger(session.target, name + 'in', touch);
                    }
                    if (Math.abs(rotation) > options.minRotationAngle) {
                        $.trigger(session.target, 'rotate', touch);
                    }
                }
                break;
            case $.EVENT_END:
            case $.EVENT_CANCEL:
                if ($.options.gestureConfig.pinch && session.pinch && touch.touches.length === 2) {
                    $.trigger(session.target, name + 'end', touch);
                }
                break;
        }
    };

    //eui gesture pinch
    $.addGesture({
        name: name,
        index: 10,
        handle: handle,
        options: {
            minRotationAngle: 0
        }
    });
})(Eui, 'pinch');