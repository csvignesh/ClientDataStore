'use strict';
var $ = require('jquery');
var HeapStore = require('./store');
/**
 init():
 meta:
 {
     objectStore1: [{name:index1, unique:false},..],
     .
 }

 datastore:
 {
     objectStore1: {
         index1:{},
         index2:{},
         index3:{},
         index4:{}
     }
 }
 **/

var openDbs = {};
module.exports = {
    name: function() {
        return 'heap';
    },

    isSupported: function() {
        return true;
    },
    init: function(dbName, metas) {
        openDbs[dbName] = new HeapStore(metas);
        return $.when(openDbs[dbName]);
    },

    //clearing out heap references
    destroy: function(dbName) {
        var retVal = $.when(openDbs[dbName] && openDbs[dbName].destroy());
        openDbs[dbName] = null;
        return retVal.then(function() {
            return {
                type: 'success'
            };
        });
    },

    // get the datastore
    getStore: function(dbName) {
        return $.when(openDbs[dbName]);
    }
};
