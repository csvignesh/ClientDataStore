'use strict';
/* globals indexedDB, IDBKeyRange, window */
var $ = require('jquery');
var helper = require('./helper');
var CONSTANTS = require('./constants');
//cursor iterates through the data and adds the records to the promise.data array
//and resolves the promise with the data array when the cursor hits the end
var cursorReader = function cursorReader(result) {
    var cursor = result.target.result;
    var _this = this;
    if (cursor) {
        /*
        removing autoGenID from response objects - so that update key doesnt conflict if it has a autogen ID
        And we remove the autoGenID only when there is another user specified index
         */
        var srcElem = result.target.source;
        if ((srcElem.indexNames && srcElem.indexNames.length > 0) ||
            (srcElem.objectStore.indexNames && srcElem.objectStore.indexNames.length > 0)) {
            delete cursor.value[CONSTANTS.AUTO_INCREMENT.keyPath];
        }
        _this.data.push(cursor.value);
        cursor.continue();
    } else {
        _this.resolve(_this.data);
    }
};
//exclude IE till 10 and safari
function shouldExcludeBrowser() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('msie') > -1) {
        return true;
    } else if (ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1) {
        return true;
    }

    return false;
}

//FIX me - chk for specified table availability
module.exports = {
    db: null,
    id: null,

    name: function() {
        return 'indexed-db';
    },

    isSupported: function() {
        //check if we have indexedDB support or not
        // FIXME: can use !! (double not)
        var isSupported = (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB);
        return $.when(isSupported && !shouldExcludeBrowser());
    },

    //create DB and initialize with object stores
    init: function(dbName, metas) {
        var promises = [];
        // FIXME: might not always be unique.
        this.id = dbName;

        promises.push(helper.createDB(dbName, metas));

        return $.when.apply($, promises).then(function(db) {
            this.db = db;
        }.bind(this));
    },

    insert: function(meta, data) {
        // FIXME: use consistent style. no new as it is not used elsewhere
        var def = new $.Deferred();
        try {
            var transaction = this.db.transaction([meta.name], 'readwrite');
            var store = transaction.objectStore(meta.name);
            for (var i = 0; i < data.length; i = i + 1) {
                store.add(data[i]);
            }

            transaction.onerror = def.reject;
            transaction.oncomplete = def.resolve;
        } catch (e) {
            def.reject();
        }
        return def.promise();
    },

    select: function(meta, filters) {
        var def = new $.Deferred();
        try {
            var promises = [];
            var transaction = this.db.transaction([meta.name], 'readonly');
            var store = transaction.objectStore(meta.name);

            //case - filter provided
            if (filters && filters.data && filters.data.length > 0) {
                //use the index to fetch the data
                var index = store.index(filters.index);

                for (var i = 0; i < filters.data.length; i = i + 1) {
                    var request = index.openCursor(filters.data[i]);

                    //for each filter query we associate a cursor reader, which appends the data
                    //to the promise data array and returns the same on the promise resolution
                    var deferred = new $.Deferred();
                    deferred.data = [];

                    request.onsuccess = cursorReader.bind(deferred);
                    request.onerror = deferred.reject;

                    promises.push(deferred.promise());
                }
            } else {
                //case - select - no filter
                var allDataReq;
                //if index is provided iterate over the index
                if (meta.index) {
                    allDataReq = store.index(meta.index).openCursor();
                } else {
                    allDataReq = store.openCursor();
                }

                //cursor reads, and which appends the data
                //to the promise data array and returns the same on the promise resolution
                var deferredForReq = new $.Deferred();
                deferredForReq.data = [];

                allDataReq.onsuccess = cursorReader.bind(deferredForReq);
                allDataReq.onerror = deferredForReq.reject;
                promises.push(deferredForReq.promise());
            }

            //grouping all data read by different filter cursors
            $.when.apply($, promises).then(function() {
                var data = [];
                for (var i = 0; i < arguments.length; i = i + 1) {
                    data = data.concat(arguments[i]);
                }
                def.resolve(data);
            }).fail(function(error) {
                def.reject(error);
            });
        } catch (e) {
            def.reject(e);
        }
        return def.promise();
    },

    update: function(meta, filter, data) {
        // FIXME : update a set of records at once?
        var def = new $.Deferred();
        // FIXME - support multiple key update
        // FIXME - what if the search record is not there
        try {
            var transaction = this.db.transaction([meta.name], 'readwrite');
            var store = transaction.objectStore(meta.name);
            var index = store.index(filter.index);
            var request = index.openCursor(IDBKeyRange.only(filter.data[0]));

            request.onsuccess = function(result) {
                if (result.target.result) {
                    var record = result.target.result.value;
                    //copy data to record
                    //delete the once which are marked as undefined
                    for (var key in data) {
                        if (key) {
                            if (data[key]) {
                                record[key] = data[key];
                            } else {
                                delete record[key];
                            }
                        }
                    }

                    var req = store.put(record);

                    req.onsuccess = def.resolve;
                    req.onerror = def.reject;
                } else {
                    //no data to update
                    def.resolve();
                }
            };

            request.onerror = def.reject;
        } catch (e) {
            def.reject();
        }
        return def.promise();
    },

    remove: function(meta, filters) {
        var def = new $.Deferred();
        try {
            var transaction = this.db.transaction([meta.name], 'readwrite');
            var store = transaction.objectStore(meta.name);
            var request;
            var deleteKeyCursor = function() {
                var cursor = this.result;
                if (cursor) { //noinspection BadExpressionStatementJS
                    store.delete(cursor.primaryKey);
                    /* jshint ignore:start */
                    cursor.continue();
                    /* jshint ignore:end */
                }
            };

            //case - filter provided
            if (filters && filters.data && filters.data.length > 0) {
                var index = store.index(filters.index);

                for (var i = 0; i < filters.data.length; i = i + 1) {
                    request = index.openCursor(IDBKeyRange.only(filters.data[i]));
                    request.onsuccess = deleteKeyCursor.bind(request);
                    request.onerror = def.reject;

                }
            } else {
                //case - delete everything under the objectStore
                request = store.openCursor();
                request.onsuccess = deleteKeyCursor.bind(request);
            }

            transaction.onerror = def.reject;
            transaction.oncomplete = def.resolve;
        } catch (e) {
            def.reject(e);
        }
        return def.promise();
    },

    //delete the created db
    destroy: function(id) {
        var deferred = new $.Deferred();
        if (this.id !== id) {
            return $.when(undefined);
        }

        this.db.close();

        this.db = null;
        this.id = null;

        var deleteRequest = indexedDB.deleteDatabase(id);
        deleteRequest.onerror = deferred.reject;
        deleteRequest.onsuccess = deferred.resolve;

        return deferred.promise();
    }

};
