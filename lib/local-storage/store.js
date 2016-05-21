'use strict';
/* globals localStorage */
var $ = require('jquery');
var helper = require('./helper');
var CONSTANTS = require('./constants');
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
var LocalStorage = function(db) {
    this.db = db;
};

LocalStorage.prototype.getDb = function() {
    return JSON.parse(localStorage.getItem(this.db.dbName));
};

LocalStorage.prototype.writeDb = function(db) {
    localStorage.setItem(this.db.dbName, JSON.stringify(db));
    this.db = db;
};

LocalStorage.prototype.insert = function(meta, data) {
    var db = this.getDb();
    var insertIds = [];

    //check if table and index exists
    if (meta && meta.name && db[meta.name]) {
        //iterate over data and insert data in all indexes
        for (var i = 0; i < data.length; i = i + 1) {
            var j = 0;
            var indexes = db.metadata[meta.name];

            for (j = 0; indexes && j < indexes.length; j = j + 1) {
                var key;
                if (indexes[j].name !== CONSTANTS.AUTO_INCREMENT_INDEX) {
                    key = data[i][indexes[j].name];
                    if (!key) {
                        return $.when(true);
                    }
                } else {
                    //creating auto gen key if there is no unique key
                    data[i][CONSTANTS.AUTO_INCREMENT_INDEX] = db.autoId;
                    key = db.autoId;
                    db.autoId = db.autoId + 1;
                }

                //Creating index, if its not available
                if (!db[meta.name][indexes[j].name]) {
                    db[meta.name][indexes[j].name] = {};
                }
                //initializing value
                if (indexes[j].unique || !db[meta.name][indexes[j].name][key]) {
                    //handle insert violation if needed
                    //overriding if the data is unique and already index for the data is available
                    db[meta.name][indexes[j].name][key] = [];
                }
                //inserting value
                db[meta.name][indexes[j].name][key].push(data[i]);
                insertIds.push(key);
            }
        }

        this.writeDb(db);
        return $.when(insertIds);
    } else {
        var def = $.Deferred();
        def.reject('Meta not found');
        return def.promise();
    }
};

LocalStorage.prototype.select = function(meta, filters) {
    var db = this.getDb();
    var def = new $.Deferred();
    var i, j, data, resp = [];
    if (meta && meta.name && db[meta.name]) {
        //use filter index to select the particular index
        if (filters && filters.data && filters.data.length > 0) {
            data = filters.index ? db[meta.name][filters.index] : db[meta.name][CONSTANTS.AUTO_INCREMENT_INDEX];
            //use filters data to jump to the actual object
            if (data) {
                for (i = 0; i < filters.data.length; i = i + 1) {
                    if (data[filters.data[i]]) {
                        for (j = 0; j < data[filters.data[i]].length; j = j + 1) {
                            resp.push($.extend(true, {}, data[filters.data[i]][j]));
                        }
                    }
                }
            }
        } else {
            resp = helper.getAllData(db, meta);
        }
    } else {
        def.reject('Meta not found');
    }

    def.resolve(resp);
    return def.promise();
};

LocalStorage.prototype.update = function(meta, filters, data) {
    var db = this.getDb();
    var def = new $.Deferred();

    if (meta && meta.name && db[meta.name] && data) {
        if (filters && filters.data && filters.data.length > 0) {
            //use filter index to select the particular index
            var lsData = filters.index ? db[meta.name][filters.index] : db[meta.name][CONSTANTS.AUTO_INCREMENT_INDEX];
            for (var i = 0; i < filters.data.length; i = i + 1) {
                //use filters data to jump to the actual object
                for (var j = 0; lsData[filters.data[i]] && j < lsData[filters.data[i]].length; j = j + 1) {
                    for (var key in data) {
                        if (key && data[key]) {
                            lsData[filters.data[i]][j][key] = data[key];
                        } else {
                            delete lsData[filters.data[i]][j][key];
                        }
                    }
                }
            }
        }
        this.writeDb(db);
        def.resolve();
    } else {
        if (!data) {
            def.reject('data not found');
        } else {
            def.reject('Meta not found');
        }
    }

    return def.promise();
};

//take care of clearing data in all indexes
LocalStorage.prototype.remove = function(meta, filters) {
    //FIXME: this is timing out ( >10s)
    var db = this.getDb();
    var def = new $.Deferred();
    var i, j, data;
    if (meta && meta.name && db[meta.name]) {
        if (filters && filters.data && filters.data.length > 0) {
            data = filters.index ? db[meta.name][filters.index] : db[meta.name][CONSTANTS.AUTO_INCREMENT_INDEX];

            var recordsToDelete = [];
            //use filters data to jump to the actual object
            for (i = 0; i < filters.data.length; i = i + 1) {
                for (j = 0; data[filters.data[i]] && j < data[filters.data[i]].length; j = j + 1) {
                    recordsToDelete.push($.extend(true, {}, data[filters.data[i]][j]));
                }
            }

            for (i = 0; i < recordsToDelete.length; i = i + 1) {
                this.deleteRecord(meta, recordsToDelete[i], db);
            }
        } else {
            //delete all - in all indexes
            for (var index in db[meta.name]) {
                if (index) {
                    db[meta.name][index] = {};
                }
            }
        }
        this.writeDb(db);
        def.resolve();
    } else {
        def.reject('Meta not found');
    }
    return def.promise();
};

LocalStorage.prototype.deleteRecord = function deleteRecord(meta, record, db) {
    if (!record) {
        return;
    }
    var indexes = db.metadata[meta.name], key;
    //run through all indexes and delete the record in every one of them
    for (var i = 0; i < indexes.length; i = i + 1) {
        //if unique, we can directly delete the entry
        if (indexes[i].unique && db[meta.name][indexes[i].name]) {
            key = record[indexes[i].name];
            delete db[meta.name][indexes[i].name][key];
        } else {
            //if not unique, run through and find the index and clear it
            var indexedData = db[meta.name][indexes[i].name][record[indexes[i].name]];
            var recordToBeDeleted = helper.findIndexOfRecord(indexedData, record);
            indexedData.splice(recordToBeDeleted, 1);
        }
    }
};

//clearing out heap references
LocalStorage.prototype.destroy = function() {
    return $.when(localStorage.removeItem(this.db.dbName));
};

module.exports = LocalStorage;
