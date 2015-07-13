'use strict';
require('../../../data-store/shims');
var heap = require('../../../data-store/heap');
var expect = require('chai').expect;
describe('data-store/heap/select', function() {
    it('lets you select all values based on an index', function() {
        return heap.init([
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function() {
            return heap.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                }
            ]).then(function() {
                return heap.select({
                    index: 'attr1',
                    name: 'table1'
                }, {}).then(function(data) {
                    expect(data[0].attr1).to.eql('A');
                    expect(data[0].attr2).to.eql('B');
                });
            });
        });
    });

    it('lets you select values based on one key in an index', function() {
        return heap.init([
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function() {
            return heap.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                },
                {
                    attr1: 'A2',
                    attr2: 'B2'
                }
            ]).then(function() {
                return heap.select({
                    index: 'attr1',
                    name: 'table1'
                }, {
                    index: 'attr1',
                    data: ['A']
                }).then(function(data) {
                    expect(data[0].attr1).to.eql('A');
                    expect(data[0].attr2).to.eql('B');

                });
            });
        });
    });

    it('lets you select values based on an array of keys in an index', function() {
        return heap.init([
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function() {
            return heap.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                },
                {
                    attr1: 'A2',
                    attr2: 'B2'
                }
            ]).then(function() {
                return heap.select({
                    index: 'attr1',
                    name: 'table1'
                }, {
                    index: 'attr1',
                    data: [
                        'A',
                        'A2'
                    ]
                }).then(function(data) {
                    expect(data[0].attr1).to.eql('A');
                    expect(data[0].attr2).to.eql('B');
                    expect(data[1].attr1).to.eql('A2');
                    expect(data[1].attr2).to.eql('B2');
                });
            });
        });
    });
    it('returns you an empty dataset if there is nothing to select', function() {
        return heap.init([
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function() {
            return heap.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                },
                {
                    attr1: 'A2',
                    attr2: 'B2'
                }
            ]).then(function() {
                return heap.select({
                    index: 'attr1',
                    name: 'table1'
                }, {
                    index: 'attr1',
                    data: ['C']
                }).then(function(data) {
                    expect(data.length).to.eql(0);
                });
            });
        });
    });

    it('throws an error if the table name is invalid', function(done) {
        return heap.init([
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function() {
            return heap.insert({name: 'table1'}, [
                {
                    attr1: 'A',
                    attr2: 'B'
                },
                {
                    attr1: 'A2',
                    attr2: 'B2'
                }
            ]).then(function() {
                return heap.select({
                    index: 'attr1',
                    name: 'invalidtable'
                }, {}).fail(function(resp) {
                    expect(resp).to.eql('Meta not found');
                    done();
                });
            });
        });
    });
});
