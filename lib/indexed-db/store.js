'use strict';
/* globals IDBKeyRange */
var $ = require('jquery');
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
            (srcElem.objectStore && srcElem.objectStore.indexNames && srcElem.objectStore.indexNames.length > 0)) {
            delete cursor.value[CONSTANTS.AUTO_INCREMENT.keyPath];
        }
        _this.data.push(cursor.value);
        cursor.continue();
    } else {
        _this.resolve(_this.data);
    }
};
var IDBStore = function(db) {
    this.db = db;
};
IDBStore.prototype.insert = function(meta, data) {
    // FIXME: use consistent style. no new as it is not used elsewhere
    var def = new $.Deferred();
    var insertedKeys = [];
    try {
        var transaction = this.db.transaction([meta.name], 'readwrite');
        var store = transaction.objectStore(meta.name);
        for (var i = 0; i < data.length; i = i + 1) {
            var request = store.add(data[i]);
            request.onsuccess = function(event){
                var key = event.target.result;
                insertedKeys.push(key);
            };
        }

        transaction.onerror = def.reject;
        transaction.oncomplete = function() {
            def.resolve(insertedKeys);
        };
    } catch (e) {
        def.reject();
    }
    return def.promise();
};

IDBStore.prototype.select = function(meta, filters) {
    var def = new $.Deferred();
    try {
        var promises = [];
        var transaction = this.db.transaction([meta.name], 'readonly');
        var store = transaction.objectStore(meta.name);

        //case - filter provided
        if (filters && filters.data && filters.data.length > 0) {
            //use the index to fetch the data
            var index = filters.index ? store.index(filters.index) : undefined;

            for (var i = 0; i < filters.data.length; i = i + 1) {
                var request = index ? index.openCursor(filters.data[i]) : store.openCursor(filters.data[i]);

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
};

IDBStore.prototype.update = function(meta, filter, data) {
    // FIXME : update a set of records at once?
    var def = new $.Deferred();
    // FIXME - support multiple key update
    // FIXME - what if the search record is not there
    try {
        var transaction = this.db.transaction([meta.name], 'readwrite');
        var store = transaction.objectStore(meta.name);
        var index = filter.index ? store.index(filter.index) : undefined;
        var keyRange = IDBKeyRange.only(filter.data[0]);
        var request = index ? index.openCursor(keyRange) : store.openCursor(keyRange);

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
};

IDBStore.prototype.remove = function(meta, filters) {
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
            var index = filters.index ? store.index(filters.index) : undefined;

            for (var i = 0; i < filters.data.length; i = i + 1) {
                var keyRange = IDBKeyRange.only(filters.data[i]);
                request = index ? index.openCursor(keyRange) : store.openCursor(keyRange);
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
};

module.exports = IDBStore;
