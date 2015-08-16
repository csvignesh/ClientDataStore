'use strict';
var heap = require('../../lib/heap');
var helper = require('../../lib/heap/helper');
var expect = require('chai').expect;

describe('data-store/heap/helper', function() {
    it('fetches all data from data store', function() {
        return heap.init([
            {
                indexes: [
                    {
                        name: 'attr1',
                        unique: true
                    }
                ],
                name: 'table1'
            }
        ]).then(function() {
            return heap.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                }
            ]).then(function() {
                var data = helper.getAllData.call(heap, {
                    index: 'attr1',
                    name: 'table1'
                });
                expect(data.length).to.eql(1);
                expect(data[0].attr1).to.eql('A');
                expect(data[0].attr2).to.eql('B');
            });
        });
    });
    it('finds index of record', function() {
        return heap.init([
            {
                indexes: [
                    {
                        name: 'attr1',
                        unique: false
                    }
                ],
                name: 'table1'
            }
        ]).then(function() {
            return heap.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                }
            ]).then(function() {
                var record = {
                    attr1: 'A',
                    attr2: 'B'
                };
                var indexedData = heap.datastore.table1.attr1.A;
                var index = helper.findIndexOfRecord(indexedData, record);
                expect(index).to.eql(0);
            });
        });
    });
});
