'use strict';
// the sequence in which datastore compatibility will be checked.
var dsPriority = [
  require('./indexed-db'),
  require('./heap')
];
// return supported datastore
module.exports = (function getSupportedDataStore() {
  for (var i = 0, j = dsPriority.length; i < j; i = i + 1) {
    if (dsPriority[i].isSupported()) {
      return dsPriority[i];
    }
  }
}());
