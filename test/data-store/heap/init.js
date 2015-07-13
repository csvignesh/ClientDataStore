'use strict';
require('../../../data-store/shims');
var heap = require('../../../data-store/heap');
var helpclass = require('./helper');
var expect = require('chai').expect;
describe('data-store/heap/init', function() {
    it('creates a database without errors', function() {
        return heap.init([
            {
                indexes: [{name: 'label1'}],
                name: 'table1'
            }
        ]).then(function() {
            expect(helpclass.getDataStore.call(heap, {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            })).to.eql({});
        });
    });
});
