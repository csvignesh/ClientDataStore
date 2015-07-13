'use strict';
require('../../../data-store/shims')
var idb = require('../../../data-store/indexed-db');
var helper = require('../../../data-store/indexed-db/helper');
var expect = require('chai').expect;
var isSupported = false;
describe('data-store/indexed-db/helper', function() {
    before(function(done) {
        return idb.isSupported().then(function(supported) {
            isSupported = supported;
            done();
        });
    });
    it('creates db without any errors', function() {
        if (!isSupported) {
            return;
        }
        return helper.createDB('db1', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function(data) {
            expect(data.objectStoreNames[0]).to.eql('table1');
            expect(data.name).to.eql('db1');
        });
    });
});
