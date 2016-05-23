'use strict';
var lStorage = require('../../lib/local-storage');
var expect = require('chai').expect;
describe('data-store/local-storage/init', function() {
    if (!lStorage.isSupported()) {
        return;
    }

    it('creates a database without errors', function() {
        var database = null;
        return lStorage.init('db-init-1', [
            {
                indexes: [
                    {
                        name: 'attr1'
                    }
                ],
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
            return lStorage.destroy('db-init-1');
        });
    });
});
