### [Sample App - ClientDataStore-Usage](https://github.com/csvignesh/ClientDataStore-Usage)

## Datastore implementation

![Architecture](./datastore-impl.png)

* DataStore is no sql with indexes. The implementation depends on the browser capability. If there is indexedDB support, it uses idb. Else it falls back to localStorage/Heap.

* Every datastore instance will implement all the interface that the data-store exposes

* Currently we have support for indexedDB/LocalSotrage/heap. We can extend it websql or which ever local storage it can use / a completely service based impl.

* Promise based implementation. Every interface return a promise.

``` javascript
var ds = dataStore.get();
ds.init(dbName, metas).then(function(database){
    //insert data after initialization is done
    database.insert(meta, data).then(function(){
        //do something after insert
    });
}).fail(function(){
    //throw a error
});
```

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
> promise resolution: empty


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

