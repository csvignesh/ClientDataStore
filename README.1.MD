[![Build Status](https://travis-ci.org/pranavjha/ClientDataStore.svg)](https://travis-ci.org/pranavjha/ClientDataStore)
[![Code Climate](https://codeclimate.com/github/pranavjha/ClientDataStore/badges/gpa.svg)](https://codeclimate.com/github/pranavjha/ClientDataStore)

[![Dependency Status](https://david-dm.org/pranavjha/ClientDataStore.svg)](https://david-dm.org/pranavjha/ClientDataStore)
[![devDependency Status](https://david-dm.org/pranavjha/ClientDataStore/dev-status.svg)](https://david-dm.org/pranavjha/ClientDataStore#info=devDependencies)
[![peerDependency Status](https://david-dm.org/pranavjha/ClientDataStore/peer-status.svg)](https://david-dm.org/pranavjha/ClientDataStore#info=peerDependencies)


# clientdatastore

> Unified implementation for saving data in browsers. Gracefully degrades from IndexedDB to WebSQL to Heap.

**clientdatastore** is a fast and simple storage library for JavaScript. It improves the offline experience of your web app by using asynchronous storage (IndexedDB or WebSQL) with a simple API.

clientdatastore uses LocalStorage/Heap in browsers with no IndexedDB or WebSQL support.

To use clientdatastore, just drop a single JavaScript file into your page:

install with npm:

``` shell
npm install clientdatastore
```

This module is compatible with browserify and lasso.

# Usage Details

``` javascript
var ds = require('clientdatastore');


var selectedDataStore = ds.get();


var resolvedDataStore = ds.get(function() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('msie') > -1) {
        return 'heap';
    } else if (ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1) {
        return 'heap';
    }
    return 'idb';
});


var resolvedDataStore = ds.get('heap');


var database1 = selectedDataStore.init('DB_NAME_1', meta);
database1.insert();

var database2 = selectedDataStore.init('DB_NAME_2', meta);
database2.insert();

selectedDataStore.destroy('DB_NAME_2');

```

## More samples 
## Assume we need marks of all students in a class

Each student has

* roll number (unique index)

* subject1 mark

* subject2 mark

* subject3 mark

* total

### Create DB, Object stores, indexes

> tableMeta

```json
{
     name: 'marksheet',
     indexes: [
         {
             name: 'rollnumber',
             unique: true
         }
     ]
}
```

#### Code Sample

``` javascript
var dataStore = require('clientdatastore');
dataStore.init('students', [tableMeta]);
```

### Insert data

> studentData

```json
[
    {
        'rollnumber': 1,
        'sub1': 90,
        'sub2': 99,
        'sub3': 89,
        'total': 278
    },
    {
        'rollnumber': 2,
        'sub1': 91,
        'sub2': 100,
        'sub3': 89,
        'total': 280
    }
]
```


#### Code sample

``` javascript
var meta = { name: 'marksheet' }
dataStore.insert(meta, studentData);
```


## Interfaces

#### init(dbName, metas)

Creates objectStores and indexes.

> dbName - name of the database you want to create.
>
> metas - Array that accepts list of ObjectStore(like table) and their indexes.
>
> output - promise
>
> promise resolution: empty


#### destory(dbName)

>
> dbName - name of the database you want to create.
>

Deletes the provided database.

#### getStore(dbName)



###### metas Sample

```json
[
    {
        name: "marksheet_jan",
        meta: [
    {name:'roll_numb', unique:true}
      ]
    },
    {
        name: "marksheet_feb",
        meta: [
            {name:'roll_numb', unique:true}
            ]
    }
]
```


#### insert(meta, data)

insert object(s) to the specified ObjectStore.

> meta - Object with ObjectStore name
>
> output - promise
>
> promise resolution: [ids] for inserted records


###### Sample

meta:

```json
{
    name: 'marksheet_jan'
}
```

data:

```json
[
    {
        'rollnumber': 1,
        'sub1': 90,
        'sub2': 99,
        'sub3': 89,
        'total': 278
    }
]
```
 
#### select(meta, [filters])

Returns object(s) from the specified ObjectStore, based on the filter(s).

> meta - Object with ObjectStore name and index name which will be used if its a non filter selectAll case
>
> filters - {index, [filterData]}
> 
> output - promise
>
> promise resolution: Array of objects matching the filters


###### Sample

meta:

```json
{
    name: 'marksheet_jan'
}
```

filterData:

```json
{
    index: rollnumber,
    data: [
        1,
        22
    ]
}
```

Returns records having rollnumber 1 or 22.


#### update(meta, filterData, data)

Updates object(s) in the specified ObjectStore, based on the filter(s) and provided data. If any property is set to undefined, those properties will be dropped when updating.

> meta - Object with ObjectStore name
>
> filter - {index, [filterData]}
>
> data - {}
> 
> output - promise
>
> promise resolution: empty


###### Sample

meta:

```json
{
    name: 'marksheet_jan'
}
```

filterData:

```json
{
    index: "rollnumber",
    data: [
        1
    ]
}
```

data:

```json
{
    'rollnumber': 1,
    'sub1': 100,
    'sub2': 100,
    'sub3': 100,
    'total': 300
}
```

updates record will rollnumber 1 with the provided data.


#### remove(meta, filterData)

Delete object(s) in the specified ObjectStore, based on the filter(s). Not providing any filter will delete all entries.

> meta - Object with ObjectStore name
>
> filter - {index, [filterData]}
> 
> output - promise
>
> promise resolution: empty


###### Sample

meta:

```json
{
    name: 'marksheet_jan'
}
```

filterData:

```json
{
    index: rollnumber,
    data: [
        1
    ]
}
```

Removes the record with rollnumber 1.