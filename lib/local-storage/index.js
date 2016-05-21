'use strict';
/* globals window */
var $ = require('jquery');
var helper = require('./helper');
var LocalDataStore = require('./store');
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
        return 'local-storage';
    },

    isSupported: function() {
        return !!window.localStorage;
    },
    init: function(dbName, metas) {
        openDbs[dbName] = helper.createDB(dbName, metas);
        return new LocalDataStore(openDbs[dbName]);
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
