[![Build Status](https://travis-ci.org/pranavjha/ClientDataStore.svg)](https://travis-ci.org/pranavjha/ClientDataStore)
[![Code Climate](https://codeclimate.com/github/pranavjha/ClientDataStore/badges/gpa.svg)](https://codeclimate.com/github/pranavjha/ClientDataStore)

[![Dependency Status](https://david-dm.org/pranavjha/ClientDataStore.svg)](https://david-dm.org/pranavjha/ClientDataStore)
[![devDependency Status](https://david-dm.org/pranavjha/ClientDataStore/dev-status.svg)](https://david-dm.org/pranavjha/ClientDataStore#info=devDependencies)
[![peerDependency Status](https://david-dm.org/pranavjha/ClientDataStore/peer-status.svg)](https://david-dm.org/pranavjha/ClientDataStore#info=peerDependencies)


# localdatastore

> Unified implementation for saving data in browsers. Gracefully degrades from IndexedDB to WebSQL to Heap.

**localdatastore** is a fast and simple storage library for JavaScript. It improves the offline experience of your web app by using asynchronous storage (IndexedDB or WebSQL) with a simple API.

localdatastore uses Heap in browsers with no IndexedDB or WebSQL support.

To use localdatastore, just drop a single JavaScript file into your page:

``` html
<TBD>
<script src="localdatastore.js"></script>
```

or install with npm:

``` shell
npm install localdatastore
```

This module is compatible with browserify and lasso.

# Usage Details

``` javascript
var ds = require('localdatastore');
var selectedDataStore = ds.get();
var database1 = selectedDataStore.init('DB_NAME_1', meta);
database1.insert();
var database2 = selectedDataStore.init('DB_NAME_2', meta);
database2.insert();

selectedDataStore.destroy('DB_NAME_2');

```