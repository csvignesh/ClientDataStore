'use strict';
var $ = require('jquery');
var CONSTANTS = require('./constants');

module.exports = {
    //fetches all the data from the datastore
    getAllData: function(meta) {
        var resp = [];
        //find unique key
        var uniqueKey;
        if (this.metadata[meta.name] && this.metadata[meta.name].length > 0) {
            for (var i = 0; i < this.metadata[meta.name].length; i = i + 1) {
                if (this.metadata[meta.name][i].unique) {
                    uniqueKey = this.metadata[meta.name][i].name;
                }
            }
        }
        if (!uniqueKey) {
            uniqueKey = CONSTANTS.AUTO_INCREMENT_INDEX;
        }

        var data = this.datastore[meta.name][uniqueKey];
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
