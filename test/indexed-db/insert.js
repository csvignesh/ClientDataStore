'use strict';
var idb = require('../../lib/indexed-db');
var expect = require('chai').expect;
describe('data-store/indexed-db/insert', function() {
    if (!idb.isSupported()) {
        return;
    }

    it('lets you insert valid values in the database', function() {
        return idb.init('db1-insert', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function() {
            return idb.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                }
            ]).then(function() {
                return idb.select({
                    index: 'attr1',
                    name: 'table1'
                }, {}).then(function(data) {
                    expect(data[0].attr1).to.eql('A');
                    expect(data[0].attr2).to.eql('B');
                    return idb.destroy('db1-insert');
                });
            });
        });
    });
    it('doesn\'t allow inserting in a non-existing table', function(done) {
        return idb.init('db2-insert', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function() {
            return idb.insert({name: 'table_doesnt_exist'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                }
            ]).fail(function() {
                return idb.destroy('db2-insert').then(function() {
                    done();
                });
            });
        });
    });
    it('doesnt let you insert values with missing values for indexes', function() {
        return idb.init('db3-insert', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function() {
            return idb.insert({name: 'table1'}, [{attr1: null}]).then(function() {
                return idb.select({
                    index: 'attr1',
                    name: 'table1'
                }, {}).then(function(data) {
                    expect(data.length).to.eql(0);
                    return idb.destroy('db3-insert')
                });
            });
        });
    });
});
