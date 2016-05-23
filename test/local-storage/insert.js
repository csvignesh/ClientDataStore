'use strict';
var lStorage = require('../../lib/local-storage');
var expect = require('chai').expect;
describe('data-store/local-storage/insert', function() {
    if (!lStorage.isSupported()) {
        return;
    }

    it('lets you insert valid values in the database', function() {
        var datastore = null;
        return lStorage.init('db1-insert', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function(db) {
            datastore = db;
        }).then(function() {
            return datastore.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                }
            ]);
        }).then(function() {
            return datastore.select({
                index: 'attr1',
                name: 'table1'
            }, {});
        }).then(function(data) {
            expect(data[0].attr1).to.eql('A');
            expect(data[0].attr2).to.eql('B');
            return lStorage.destroy('db1-insert');
        });
    });
    it('doesn\'t allow inserting in a non-existing table', function(done) {
        var datastore = null;
        return lStorage.init('db2-insert', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function(db) {
            datastore = db;
        }).then(function() {
            return datastore.insert({name: 'table_doesnt_exist'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                }
            ]);
        }).fail(function() {
            return lStorage.destroy('db2-insert').then(function() {
                done();
            });
        });
    });

    it('doesn\'t let you insert values with missing values for indexes', function() {
        var datastore = null;
        return lStorage.init('db3-insert', [
            {
                indexes: [
                    {
                        name: 'attr1'
                    }
                ],
                name: 'table1'
            }
        ]).then(function(db) {
            datastore = db;
        }).then(function() {
            return datastore.insert({name: 'table1'}, [{attr1: null}]);
        }).then(function() {
            return datastore.select({
                index: 'attr1',
                name: 'table1'
            }, {});
        }).then(function(data) {
            expect(data.length).to.eql(0);
            return lStorage.destroy('db3-insert')
        });
    });
});
