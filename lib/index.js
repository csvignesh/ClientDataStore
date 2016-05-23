'use strict';
// return supported datastore
module.exports = {
    get: function(storeSelector) {
        // the sequence in which datastore compatibility will be checked.
        var dataStorePriority = [
            require('./indexed-db/index'),
            require('./local-storage/index'),
            require('./heap/index')
        ];
        // the sequence in which datastore compatibility will be checked.
        var dataStoreMap = {
            idb: require('./indexed-db/index'),
            lStorage: require('./local-storage/index'),
            heap: require('./heap/index')
        };
        if (typeof storeSelector === 'string') {
            return dataStorePriority[storeSelector];
        }
        if (typeof storeSelector === 'function') {
            var store = storeSelector();
            return dataStoreMap[store];
        }
        for (var i = 0, j = dataStorePriority.length; i < j; i = i + 1) {
            if (dataStorePriority[i].isSupported()) {
                return dataStorePriority[i];
            }
        }
    }
};
