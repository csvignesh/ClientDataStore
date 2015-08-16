'use strict';
var idb = require('../../lib/indexed-db');
var helper = require('../../lib/indexed-db/helper');
var expect = require('chai').expect;
var isSupported = false;
describe('data-store/indexed-db/helper', function() {
    if (!idb.isSupported()) {
        return;
    }

    it('creates db without any errors', function() {
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
