'use strict';
var idb = require('../../lib/indexed-db');
var expect = require('chai').expect;
describe('data-store/indexed-db/update', function() {
    if (!idb.isSupported()) {
        return;
    }

    it('updates the value based on one key in an index', function() {

        var database = null;
        return idb.init('db1-update', [
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
            return database.update({
                index: 'attr1',
                name: 'table1'
            }, {
                index: 'attr1',
                data: ['A']
            }, {
                attr1: 'Anew',
                attr2: 'Bnew'
            });
        }).then(function() {
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {
                index: 'attr1',
                data: ['Anew']
            });
        }).then(function(data) {
            expect(data[0].attr1).to.eql('Anew');
            expect(data[0].attr2).to.eql('Bnew');
            return idb.destroy('db1-update');
        });
    });

    it('updates the value based on an array of keys in an index', function() {

        var database = null;
        //to be fixed
        return idb.init('db2-update', [
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
            return database.update({
                    index: 'attr1',
                    name: 'table1'
                }, {
                    index: 'attr1',
                    data: [
                        'A',
                        'A2'
                    ]
                },
                {
                    attr1: 'Anew',
                    attr2: 'Bnew'
                });
        }).then(function() {
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {
                index: 'attr1',
                data: ['Anew']
            });
        }).then(function(data) {
            expect(data[0].attr1).to.eql('Anew');
            expect(data[0].attr2).to.eql('Bnew');
            return idb.destroy('db2-update');
        });
    });
    it('doesn\'t let you update to a value where indexed fields are null', function(done) {

        var database = null;
        //to be fixed
        return idb.init('db3-update', [
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
            return database.update({
                index: 'attr1',
                name: 'table1'
            }, {
                index: 'attr1',
                data: null
            }, {
                attr1: 'Anew',
                attr2: 'Bnew'
            }).fail(function() {
                return database.select({
                    index: 'attr1',
                    name: 'table1'
                }, {
                    index: 'attr1',
                    data: ['Anew']
                }).then(function(data) {
                    expect(data.length).to.eql(0);
                    return idb.destroy('db3-update').then(function() {
                        done();
                    });
                });
            });
        });
    });

    it('throws an error if an update is attempted on a non existing table', function(done) {
        var database = null;
        //to be fixed
        return idb.init('db4-update', [
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
            return database.update({
                index: 'attr1',
                name: 'invalid'
            }, {
                index: 'attr1',
                data: ['A']
            }, {
                attr1: 'Anew',
                attr2: 'Bnew'
            }).fail(function() {
                return idb.destroy('db4-update').then(function() {
                    done();
                });
            });
        });
    });
    it('doesn\'t update anything if key search in index doesn\'t fetch any data', function() {

        var database = null;
        //to be fixed
        return idb.init('db5-update', [
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
            return database.update({
                index: 'attr1',
                name: 'table1'
            }, {
                index: 'attr1',
                data: ['C']
            }, {
                attr1: 'Anew',
                attr2: 'Bnew'
            });
        }).then(function() {
            return database.select({
                index: 'attr1',
                name: 'table1'
            }, {
                index: 'attr1',
                data: ['Anew']
            });
        }).then(function(data) {
            expect(data.length).to.eql(0);
            return idb.destroy('db5-update');
        });
    });
});
