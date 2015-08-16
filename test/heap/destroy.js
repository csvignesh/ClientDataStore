'use strict';
var heap = require('../../lib/heap');
var expect = require('chai').expect;
describe('data-store/heap/destroy', function() {
    it('deletes an existing object stores from heap', function() {
        return heap.init([
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function() {
            return heap.destroy().then(function(resp) {
                expect(resp).to.eql('success');
            });
        });
    });
});
