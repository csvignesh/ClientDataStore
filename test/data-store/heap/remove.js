'use strict';
require('../../../data-store/shims');
var heap = require('../../../data-store/heap');
var expect = require('chai').expect;
describe('data-store/heap/remove', function() {
    it('removes the value based on one key in an index', function() {
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
                return heap.remove({name: 'table1'}, {
                    index: 'attr1',
                    data: ['A']
                }).then(function() {
                    return heap.select({
                        index: 'attr1',
                        name: 'table1'
                    }, {}).then(function(data) {
                        expect(data.length).to.eql(1);
                        expect(data[0].attr1).to.eql('A2');
                        expect(data[0].attr2).to.eql('B2');
                    });
                });
            });
        });
    });
    it('removes the value based on an array of keys in an index', function() {
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
                return heap.remove({name: 'table1'}, {
                    index: 'attr1',
                    data: [
                        'A',
                        'A2'
                    ]
                }).then(function() {
                    return heap.select({
                        index: 'attr1',
                        name: 'table1'
                    }, {}).then(function(data) {
                        expect(data.length).to.eql(0);
                    });
                });
            });
        });
    });
    it('removes all data if there is no filter', function() {
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
                return heap.remove({name: 'table1'}, {}).then(function() {
                    var metadata = {};
                    metadata.index = 'attr1';
                    metadata.name = 'table1';
                    return heap.select({
                        index: 'attr1',
                        name: 'table1'
                    }, {}).then(function(data) {
                        expect(data.length).to.eql(0);
                    });
                });
            });
        });
    });
    it('throws an error if an remove is attempted on a non existing table', function(done) {
        //to be fixed
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
                return heap.remove({name: 'invalidtable'}, {}).fail(function(resp) {
                    expect(resp).to.eql('Meta not found');
                    done();
                });
            });
        });
    });
    it('doesn\'t remove anything if key search in index doesn\'t fetch any data', function() {
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
                return heap.remove({name: 'table1'}, {
                    index: 'attr1',
                    data: ['C']
                }).then(function() {
                    return heap.select({
                        index: 'attr1',
                        name: 'table1'
                    }, {}).then(function(data) {
                        expect(data.length).to.eql(2);
                    });
                });
            });
        });
    });
});
