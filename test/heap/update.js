'use strict';
var heap = require('../../lib/heap');
var expect = require('chai').expect;
describe('data-store/heap/update', function() {
    it('updates the value based on one key in an index', function() {
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
                return heap.update({
                        name: 'table1',
                        index: 'attr1'
                    }, {
                        index: 'attr1',
                        data: ['A']
                    },
                    {
                        attr1: 'Anew',
                        attr2: 'Bnew'
                    }).then(function() {
                        return heap.select({
                            name: 'table1',
                            index: 'attr1'
                        }, {
                            index: 'attr1',
                            data: [
                                'A',
                                'Anew'
                            ]
                        }).then(function(data) {
                            expect(data[0].attr1).to.eql('Anew');
                            expect(data[0].attr2).to.eql('Bnew');
                        });
                    });
            });
        });
    });

    it('updates the value based on an array of keys in an index', function() {
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
                return heap.update({
                    name: 'table1',
                    index: 'attr1'
                }, {
                    index: 'attr1',
                    data: [
                        'A',
                        'A2'
                    ]
                }, {
                    attr1: 'Anew',
                    attr2: 'Bnew'
                }).then(function() {
                    return heap.select({
                        name: 'table1',
                        index: 'attr1'
                    }, {
                        index: 'attr1',
                        data: [
                            'A',
                            'A2',
                            'Anew'
                        ]
                    }).then(function(data) {
                        expect(data[0].attr1).to.eql('Anew');
                        expect(data[0].attr2).to.eql('Bnew');
                    });
                });
            });
        });
    });
    it('doesn\'t let you update to a value where indexed fields are null', function() {
        //to be fixed
        var meta = {};
        meta.name = 'table1';
        var data = [];
        var dat = {};
        dat.attr1 = 'A';
        dat.attr2 = 'B';
        data.push(dat);
        var d = {};
        d.attr1 = 'A2';
        d.attr2 = 'B2';
        data.push(d);
        var filters = {};
        filters.index = 'attr1';
        var fdata = [];
        fdata.push(null);
        filters.data = fdata;
        var metas = [];
        var metasObj = {};
        var indexes = [];
        var map = {};
        map.name = 'attr1';
        map.unique = false;
        indexes.push(map);
        metasObj.indexes = indexes;
        metasObj.name = 'table1';
        metas.push(metasObj);
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
                return heap.update({
                    name: 'table1',
                    index: 'attr1'
                }, {
                    index: 'attr1',
                    data: [null]
                }, {
                    attr1: 'Anew',
                    attr2: 'Bnew'
                }).then(function() {
                    return heap.select({
                        name: 'table1',
                        index: 'attr1'
                    }, {
                        index: 'attr1',
                        data: [
                            null,
                            'A'
                        ]
                    }).then(function(data) {
                        expect(data.length).to.eql(1);
                        expect(data[0].attr1).to.eql('A');
                        expect(data[0].attr2).to.eql('B');
                    });
                });
            });
        });
    });
    it('throws an error if an update is attempted on a non existing table', function(done) {
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
                return heap.update({
                    name: 'invalidtable',
                    index: 'attr1'
                }, {
                    index: 'attr1',
                    data: [null]
                }, {
                    attr1: 'Anew',
                    attr2: 'Bnew'
                }).fail(function(resp) {
                    expect(resp).to.eql('Meta not found');
                    done();
                });
            });
        });
    });
    it('doesn\'t update anything if key search in index doesn\'t fetch any data', function() {
        //to be fixed
        var meta = {};
        meta.name = 'table1';
        var data = [];
        var dat = {};
        dat.attr1 = 'A';
        dat.attr2 = 'B';
        data.push(dat);
        var d = {};
        d.attr1 = 'A2';
        d.attr2 = 'B2';
        data.push(d);
        var filters = {};
        filters.index = 'attr1';
        var fdata = [];
        fdata.push('C');
        filters.data = fdata;
        var metas = [];
        var metasObj = {};
        var indexes = [];
        var map = {};
        map.name = 'attr1';
        map.unique = false;
        indexes.push(map);
        metasObj.indexes = indexes;
        metasObj.name = 'table1';
        metas.push(metasObj);
        return heap.init(metas).then(function() {
            return heap.insert(meta, data).then(function() {
                var metadata = {};
                metadata.index = 'attr1';
                metadata.name = 'table1';
                var newdata = {};
                newdata.attr1 = 'Anew';
                newdata.attr2 = 'Bnew';
                return heap.update(metadata, filters, newdata).then(function() {
                    metadata.index = 'attr1';
                    metadata.name = 'table1';
                    fdata.push('Anew');
                    return heap.select(metadata, filters).then(function(data) {
                        expect(data.length).to.eql(0);
                    });
                });
            });
        });
    });
});
