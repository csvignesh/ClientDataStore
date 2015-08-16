'use strict';
var heap = require('../../lib/heap');
var expect = require('chai').expect;
var isSupported = false;
describe('data-store/heap/remove', function() {
    if (!heap.isSupported()) {
        return;
    }

    it('removes the value based on one key in an index', function() {
        var database = null;
        return heap.init('db1-remove', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function(db) {
            database = db;
        }).then(function() {
            return database.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                },
                {
                    attr1: 'A2',
                    attr2: 'B2'
                }
            ]);
        }).then(function() {
            return database.remove({name: 'table1'}, {
                index: 'attr1',
                data: ['A']
            });
        }).then(function() {
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {});
        }).then(function(data) {
            expect(data.length).to.eql(1);
            expect(data[0].attr1).to.eql('A2');
            expect(data[0].attr2).to.eql('B2');
            return heap.destroy('db1-remove');
        });
    });
    it('removes the value based on an array of keys in an index', function() {
        var database = null;
        return heap.init('db2-remove', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function(db) {
            database = db;
        }).then(function() {
            return database.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                },
                {
                    attr1: 'A2',
                    attr2: 'B2'
                }
            ]);
        }).then(function() {
            return database.remove({name: 'table1'}, {
                index: 'attr1',
                data: [
                    'A',
                    'A2'
                ]
            });
        }).then(function() {
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {});
        }).then(function(data) {
            expect(data.length).to.eql(0);
            return heap.destroy('db2-remove');
        });
    });

    it('removes all data if there is no filter', function() {
        var database = null;
        return heap.init('db3-remove', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function(db) {
            database = db;
        }).then(function() {
            return database.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                },
                {
                    attr1: 'A2',
                    attr2: 'B2'
                },
                {
                    attr1: 'A3',
                    attr2: 'B3'
                }
            ]);
        }).then(function() {
            return database.remove({name: 'table1'}, {});
        }).then(function() {
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {});
        }).then(function(data) {
            expect(data.length).to.eql(0);
            return heap.destroy('db3-remove');
        });
    });
    it('throws an error if an remove is attempted on a non existing table', function(done) {
        var database = null;
        //to be fixed
        return heap.init('db4-remove', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function(db) {
            database = db;
        }).then(function() {
            return database.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                },
                {
                    attr1: 'A2',
                    attr2: 'B2'
                }
            ]);
        }).then(function() {
            return database.remove({name: 'invalidtable'}, {}).fail(function() {
                return heap.destroy('db1-remove').then(function() {
                    done();
                });
            });
        });
    });
    it('doesn\'t remove anything if key search in index doesn\'t fetch any data', function() {
        var database = null;
        return heap.init('db5-remove', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function(db) {
            database = db;
        }).then(function() {
            return database.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                },
                {
                    attr1: 'A2',
                    attr2: 'B2'
                }
            ]);
        }).then(function() {
            return database.remove({name: 'table1'}, {
                index: 'attr1',
                data: ['C']
            });
        }).then(function() {
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {});
        }).then(function(data) {
            expect(data.length).to.eql(2);
            return heap.destroy('db5-remove');
        });
    });
});
