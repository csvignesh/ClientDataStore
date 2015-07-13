'use strict';
require('../../../data-store/shims')
var idb = require('../../../data-store/indexed-db');
var expect = require('chai').expect;
var isSupported = false;
describe('data-store/indexed-db/init', function() {
    before(function(done) {
        return idb.isSupported().then(function(supported) {
            isSupported = supported;
            done();
        });
    });
    it('creates a database without errors', function() {
        if (!isSupported) {
            return;
        }
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
