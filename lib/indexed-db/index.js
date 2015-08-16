'use strict';
/* globals window */
var $ = require('jquery');
var helper = require('./helper');
var IDBStore = require('./store');
// we normalize the indexedDB implementations here
if (!window.indexedDB) {
    window.indexedDB = (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB);
}
var openDbs = {};
module.exports = {

    name: function() {
        return 'idb';
    },

    isSupported: function() {
        //check if we have indexedDB support or not
        return !!window.indexedDB;
    },

    //create DB and initialize with object stores
    init: function(dbName, metas) {
        return helper.createDB(dbName, metas).then(function(db) {
            openDbs[dbName] = db;
            return new IDBStore(db);
        });
    },

    //delete the created db
    destroy: function(dbName) {
        var deferred = new $.Deferred();
        if (openDbs[dbName]) {
            openDbs[dbName].close();
            delete openDbs[dbName];
        }
        var deleteRequest = window.indexedDB.deleteDatabase(dbName);
        deleteRequest.onerror = deferred.reject;
        deleteRequest.onsuccess = deferred.resolve;
        return deferred.promise();
    },

    // get the datastore
    getStore: function(dbName) {
        return this.init(dbName, {});
    }
};
