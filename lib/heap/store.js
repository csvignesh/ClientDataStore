'use strict';
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
var HeapStore = function(metas) {
    this.autoId = 0;
    this.metadata = {};
    this.datastore = {};
    for (var i = 0; i < metas.length; i = i + 1) {
        this.datastore[metas[i].name] = {};
        this.metadata[metas[i].name] = metas[i].indexes || [];
        var hasUniqueIndex = false;
        if (metas[i].indexes) {
            for (var j = 0; j < metas[i].indexes.length; j = j + 1) {
                if (metas[i].indexes[j].unique) {
                    hasUniqueIndex = true;
                }
            }
        }
        //if no unique index, create a auto generated key
        if (!hasUniqueIndex) {
            this.metadata[metas[i].name].push({
                name: CONSTANTS.AUTO_INCREMENT_INDEX,
                unique: true
            });
        }
    }
};

HeapStore.prototype.insert = function(meta, data) {
    //check if table and index exists
    if (meta && meta.name && this.datastore[meta.name]) {
        //iterate over data and insert data in all indexes
        for (var i = 0; i < data.length; i = i + 1) {
            var j = 0;
            var indexes = this.metadata[meta.name];

            for (j = 0; indexes && j < indexes.length; j = j + 1) {
                var key;
                if (indexes[j].name !== CONSTANTS.AUTO_INCREMENT_INDEX) {
                    key = data[i][indexes[j].name];
                    if (!key) {
                        return $.when(true);
                    }
                } else {
                    //creating auto gen key if there is no unique key
                    data[i][CONSTANTS.AUTO_INCREMENT_INDEX] = this.autoId;
                    key = this.autoId;
                    this.autoId = this.autoId + 1;
                }

                //Creating index, if its not available
                if (!this.datastore[meta.name][indexes[j].name]) {
                    this.datastore[meta.name][indexes[j].name] = {};
                }
                //initializing value
                if (indexes[j].unique || !this.datastore[meta.name][indexes[j].name][key]) {
                    //handle insert violation if needed
                    //overriding if the data is unique and already index for the data is available
                    this.datastore[meta.name][indexes[j].name][key] = [];
                }
                //inserting value
                this.datastore[meta.name][indexes[j].name][key].push(data[i]);
            }
        }
        return $.when(true);
    } else {
        var def = $.Deferred();
        def.reject('Meta not found');
        return def.promise();
    }
};

HeapStore.prototype.select = function(meta, filters) {
    var def = new $.Deferred();
    var i, j, data, resp = [];
    if (meta && meta.name && this.datastore[meta.name]) {
        //use filter index to select the particular index
        if (filters && filters.data && filters.data.length > 0) {
            data = filters.index ? this.datastore[meta.name][filters.index] : this.datastore[meta.name][CONSTANTS.AUTO_INCREMENT_INDEX];
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
            resp = helper.getAllData.call(this, meta);
        }
    } else {
        def.reject('Meta not found');
    }

    def.resolve(resp);
    return def.promise();
};

HeapStore.prototype.update = function(meta, filters, data) {
    var def = new $.Deferred();

    if (meta && meta.name && this.datastore[meta.name] && data) {
        if (filters && filters.data && filters.data.length > 0) {
            //use filter index to select the particular index
            var heapData = filters.index ? this.datastore[meta.name][filters.index] : this.datastore[meta.name][CONSTANTS.AUTO_INCREMENT_INDEX];
            for (var i = 0; i < filters.data.length; i = i + 1) {
                //use filters data to jump to the actual object
                for (var j = 0; heapData[filters.data[i]] && j < heapData[filters.data[i]].length; j = j + 1) {
                    for (var key in data) {
                        if (key && data[key]) {
                            heapData[filters.data[i]][j][key] = data[key];
                        } else {
                            delete heapData[filters.data[i]][j][key];
                        }
                    }
                }
            }
        }
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
HeapStore.prototype.remove = function(meta, filters) {
    //FIXME: this is timing out ( >10s)
    var def = new $.Deferred();
    var i, j, data;
    if (meta && meta.name && this.datastore[meta.name]) {
        if (filters && filters.data && filters.data.length > 0) {
            data = filters.index ? this.datastore[meta.name][filters.index] : this.datastore[meta.name][CONSTANTS.AUTO_INCREMENT_INDEX];

            var recordsToDelete = [];
            //use filters data to jump to the actual object
            for (i = 0; i < filters.data.length; i = i + 1) {
                for (j = 0; data[filters.data[i]] && j < data[filters.data[i]].length; j = j + 1) {
                    recordsToDelete.push($.extend(true, {}, data[filters.data[i]][j]));
                }
            }

            for (i = 0; i < recordsToDelete.length; i = i + 1) {
                this.deleteRecord(meta, recordsToDelete[i]);
            }
        } else {
            //delete all - in all indexes
            for (var index in this.datastore[meta.name]) {
                if (index) {
                    this.datastore[meta.name][index] = {};
                }
            }
        }
        def.resolve();
    } else {
        def.reject('Meta not found');
    }
    return def.promise();
};

HeapStore.prototype.deleteRecord = function deleteRecord(meta, record) {
    if (!record) {
        return;
    }
    var indexes = this.metadata[meta.name], key;
    //run through all indexes and delete the record in every one of them
    for (var i = 0; i < indexes.length; i = i + 1) {
        //if unique, we can directly delete the entry
        if (indexes[i].unique && this.datastore[meta.name][indexes[i].name]) {
            key = record[indexes[i].name];
            delete this.datastore[meta.name][indexes[i].name][key];
        } else {
            //if not unique, run through and find the index and clear it
            var indexedData = this.datastore[meta.name][indexes[i].name][record[indexes[i].name]];
            var recordToBeDeleted = helper.findIndexOfRecord(indexedData, record);
            indexedData.splice(recordToBeDeleted, 1);
        }
    }
};

//clearing out heap references
HeapStore.prototype.destroy = function() {
    this.metadata = null;
    this.datastore = null;
    return $.when('OK');
};

module.exports = HeapStore;
