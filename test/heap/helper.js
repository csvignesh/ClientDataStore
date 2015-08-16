'use strict';
module.exports = {
    datastore: null,
    metadata: null,
    autoId: 0,

    name: function() {
        return 'heap';
    },

    isSupported: function() {
        return true;
    },
    getDataStore: function(meta) {
        return this.datastore[meta.name];
    }
};
