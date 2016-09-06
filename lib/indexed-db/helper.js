'use strict';
/* globals indexedDB */
var $ = require('jquery');
var CONSTANTS = require('./constants');

module.exports = {
    //sync test
    testSupportSync: function() {
        try {
            indexedDB.open('temp_test');
            return true;
        } catch (err) {
            return false;
        }
    },
    //runs basic api s to check if indexedDB is supported
    testSupport: function() {
        var tempTableName = 'temp_test';
        var openReq;
        var def = $.Deferred();

        try {
            //create temp db and see if the IBDFactory object are returned
            openReq = indexedDB.open(tempTableName);
            if (openReq) {
                openReq.onsuccess = function() {
                    indexedDB.deleteDatabase(tempTableName);
                    def.resolve(true);
                };
                openReq.onerror = function() {
                    def.resolve(false);
                };
                //in case of safari - dom exp 18/11 occurs but never resolve the req
                setTimeout(function() {
                    if (openReq.readyState !== 'done' || openReq.error) {
                        def.resolve(false);
                    }
                }, 1000);
            } else {
                def.resolve(false);
            }
        } catch (err) {
            def.resolve(false);
        }

        return def.promise();
    },
    //creates the DB and ObjectStores with specified indexes
    //id - current timestamp
    //meta - object stores name and their indexes
    createDB: function(id, meta) {
        var def = new $.Deferred();
        var openRequest = indexedDB.open(id);

        openRequest.onupgradeneeded = function(e) {
            this.checkAndCreateObjStores(e.target.result, meta);
        }.bind(this);

        openRequest.onsuccess = function(e) {
            def.resolve(e.target.result);
        }.bind(this);

        openRequest.onerror = function(e) {
            def.reject(e);
        }.bind(this);

        return def.promise();
    },

    //checks if the object store is present and creates it with indexes
    checkAndCreateObjStores: function(database, metas) {
        for (var i = 0; i < metas.length; i = i + 1) {
            if (!database.objectStoreNames.contains(metas[i].name)) {
                var objectStore = database.createObjectStore(metas[i].name, CONSTANTS.AUTO_INCREMENT);
                if (metas[i].indexes) {
                    for (var j = 0; j < metas[i].indexes.length; j = j + 1) {
                        var indexName = metas[i].indexes[j].name;
                        var unique = metas[i].indexes[j].unique;
                        objectStore.createIndex(indexName, indexName, {unique: unique});
                    }
                }
            }
        }
    }
};
