'use strict';
var idb = require('../../lib/indexed-db');
var expect = require('chai').expect;
describe('data-store/indexed-db/init', function() {
    if (!idb.isSupported()) {
        return;
    }

    it('creates a database without errors', function() {
        return idb.init('db-init-1', [
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
                    return idb.destroy('db-init-1');
                });
            });
        });
    });
});
