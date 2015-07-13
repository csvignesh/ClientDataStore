'use strict';
var $ = require('jquery');
// the sequence in which datastore compatibility will be checked.
var dsPriority = [
    require('./indexed-db'),
    require('./heap')
];
// return supported datastore
module.exports = (function getSupportedDataStore() {
    var promises = [];
    for (var i = 0, j = dsPriority.length; i < j; i = i + 1) {
        promises.push(dsPriority[i].isSupported());
    }
    return $.when.apply($, promises).then(function() {
        for (var i = 0; i < arguments.length; i = i + 1) {
            if (arguments[i]) {
                return dsPriority[i];
            }
        }
    });
}());
