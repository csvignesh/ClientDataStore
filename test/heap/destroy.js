'use strict';
var heap = require('../../lib/heap');
var expect = require('chai').expect;

describe('data-store/heap/destroy', function() {
    if (!heap.isSupported()) {
        return;
    }
    it('deletes an existing datastore', function() {
        return heap.init('db1', [
            {
                indexes: [
                    {
                        name: 'attr1'
                    }
                ],
                name: 'table1'
            }
        ]).then(function() {
            return heap.destroy('db1').then(function(data) {
                expect(data.type).to.eql('success');
            });
        });
    });
    it('silently fails if the datastore to delete doesn\'t exist', function() {
        return heap.init('db1', []).then(function() {
            return heap.destroy('db1').then(function() {
                return heap.destroy('db1');
            });
        });
    });
});
