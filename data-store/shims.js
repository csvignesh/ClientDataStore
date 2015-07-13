'use strict';
/* jshint freeze:false */
// The bind function is a recent addition to ECMA-262, 5th edition; as such it may not be present
// in all browsers. You can partially work around this by inserting the following code at the
// beginning of your scripts, allowing use of much of the functionality of bind() in
// implementations that do not natively support it. See
// [mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        var aArgs = Array.prototype.slice.call(arguments, 1);
        var _this = this;
        var FNop = function() {
            return;
        };
        var fBound = function() {
            return _this.apply(
                this instanceof FNop && oThis ? this : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments))
            );
        };
        FNop.prototype = this.prototype;
        fBound.prototype = new FNop();
        return fBound;
    };
}
// This poly-fill covers the main use case which is creating a new object for which the prototype has been chosen
// but doesn't take the second argument into account. See
// [mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
if (typeof Object.create !== 'function') {
    Object.create = (function() {
        //noinspection LocalVariableNamingConventionJS
        var Temp = function() {
        };
        return function(prototype) {
            if (arguments.length > 1) {
                throw new Error('Second argument not supported');
            }
            if (typeof prototype !== 'object') {
                throw new TypeError('Argument must be an object');
            }
            Temp.prototype = prototype;
            var result = new Temp();
            Temp.prototype = null;
            return result;
        };
    })();
}
/* jshint freeze:true */
