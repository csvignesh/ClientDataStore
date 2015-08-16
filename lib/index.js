'use strict';
// return supported datastore
module.exports = {
    get: function(storeSelector) {
        // the sequence in which datastore compatibility will be checked.
        var dataStorePriority = [
            require('./indexed-db/index'),
            require('./heap/index')
        ];
        // the sequence in which datastore compatibility will be checked.
        var dataStoreMap = {
            idb: require('./indexed-db/index'),
            heap: require('./heap/index')
        };
        var store = storeSelector && storeSelector();
        if (dataStoreMap[store]) {
            return dataStoreMap[store];
        }
        for (var i = 0, j = dataStorePriority.length; i < j; i = i + 1) {
            if (dataStorePriority[i].isSupported()) {
                return dataStorePriority[i];
            }
        }
    }
};
