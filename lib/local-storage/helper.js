'use strict';
/* globals localStorage */
var $ = require('jquery');
var CONSTANTS = require('./constants');

var createJsonWithMeta = function(dbName, metas) {
    var metadata = {};
    var datastore = {};

    for (var i = 0; i < metas.length; i = i + 1) {
        datastore[metas[i].name] = {};
        metadata[metas[i].name] = metas[i].indexes || [];
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
            metadata[metas[i].name].push({
                name: CONSTANTS.AUTO_INCREMENT_INDEX,
                unique: true
            });

            datastore.autoId = 0;
        }
    }

    datastore.dbName = dbName;
    datastore.metadata = metadata;

    return datastore;
};

module.exports = {
    createDB: function(id, metas) {
        var db = localStorage.getItem(id);
        if (!db) {
            // create new entry for db
            db = createJsonWithMeta(id, metas);
            localStorage.setItem(id, JSON.stringify(db));
        } else {
            db = JSON.parse(db);
        }

        return db;
    },

    //fetches all the data from the datastore
    getAllData: function(db, meta) {
        var resp = [];
        //find unique key
        var uniqueKey;
        if (db.metadata[meta.name] && db.metadata[meta.name].length > 0) {
            for (var i = 0; i < db.metadata[meta.name].length; i = i + 1) {
                if (db.metadata[meta.name][i].unique) {
                    uniqueKey = db.metadata[meta.name][i].name;
                }
            }
        }
        if (!uniqueKey) {
            uniqueKey = CONSTANTS.AUTO_INCREMENT_INDEX;
        }

        var data = db[meta.name][uniqueKey];
        //no filter data, so get all key's values
        for (var key in data) {
            if (key) {
                for (var j = 0; j < data[key].length; j = j + 1) {
                    resp.push($.extend(true, {}, data[key][j]));
                }
            }
        }
        return resp;
    },

    //find the matching record in the given array
    findIndexOfRecord: function(indexedData, record) {
        if (indexedData && indexedData.length > 0 && record) {
            for (var j = 0; j < indexedData.length; j = j + 1) {
                var matchForDelete = true;
                for (var key in record) {
                    if (record[key] !== indexedData[j][key]) {
                        return -1;
                    }
                }
                if (matchForDelete) {
                    return j;
                }
            }
        }
        return -1;
    }
};
