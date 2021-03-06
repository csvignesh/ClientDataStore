'use strict';
var idb = require('../../lib/indexed-db');
var expect = require('chai').expect;
describe('data-store/indexed-db/select', function() {
    if (!idb.isSupported()) {
        return;
    }

    it('lets you select all values based on an index', function() {
        var database = null;
        return idb.init('db1-select', [
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
                }
            ]);
        }).then(function() {
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {});
        }).then(function(data) {
            expect(data[0].attr1).to.eql('A');
            expect(data[0].attr2).to.eql('B');
            return idb.destroy('db1-select');
        });
    });

    it('lets you select values based on one key in an index', function() {
        var database = null;
        return idb.init('db2-select', [
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
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {
                index: 'attr1',
                data: ['A']
            });
        }).then(function(data) {
            expect(data[0].attr1).to.eql('A');
            expect(data[0].attr2).to.eql('B');
            return idb.destroy('db2-select');
        });
    });

    it('lets you select values based on an array of keys in an index', function() {
        var database = null;
        return idb.init('db3-select', [
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
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {
                index: 'attr1',
                data: [
                    'A',
                    'A2'
                ]
            });
        }).then(function(data) {
            expect(data[0].attr1).to.eql('A');
            expect(data[0].attr2).to.eql('B');
            expect(data[1].attr1).to.eql('A2');
            expect(data[1].attr2).to.eql('B2');
            return idb.destroy('db3-select');
        });
    });
    it('returns you an empty dataset if there is nothing to select', function() {
        var database = null;
        return idb.init('db4-select', [
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
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {
                index: 'attr1',
                data: ['C']
            });
        }).then(function(data) {
            expect(data.length).to.eql(0);
            return idb.destroy('db4-select');
        });
    });
    it('throws an error if the table name is invalid', function(done) {
        var database = null;
        return idb.init('db5-select', [
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
            return database.select({
                index: 'attr1',
                name: 'invalidtable'
            }, {}).fail(function() {
                return idb.destroy('db5-select').then(function() {
                    done();
                });
            });
        });
    });
});
