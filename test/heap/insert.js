'use strict';
var heap = require('../../lib/heap');
var helper = require('../../lib/heap/helper');
var expect = require('chai').expect;
describe('data-store/heap/insert', function() {
    it('lets you insert valid values in the database', function() {
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
    it('doesn\'t allow inserting in a non-existing table', function(done) {
        //to be fixed

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
            return heap.insert({name: 'table_doesnt_exist'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                }
            ]).fail(function(resp) {
                expect(resp).to.eql('Meta not found');
                var data = helper.getAllData.call(heap, {
                    index: 'attr1',
                    name: 'table1'
                });
                expect(data.length).to.eql(0);
                done();
            });
        });
    });
});
