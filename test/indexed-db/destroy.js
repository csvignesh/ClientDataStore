'use strict';
var idb = require('../../lib/indexed-db');
var expect = require('chai').expect;

describe('data-store/indexed-db/destroy', function() {
    if (!idb.isSupported()) {
        return;
    }
    it('deletes an existing datastore', function() {
        return idb.init('db1', [
            {
                indexes: [
                    {
                        name: 'attr1'
                    }
                ],
                name: 'table1'
            }
        ]).then(function() {
            return idb.destroy('db1').then(function(data) {
                expect(data.type).to.eql('success');
            });
        });
    });
    it('silently fails if the datastore to delete doesn\'t exist', function() {
        return idb.init('db1', []).then(function() {
            return idb.destroy('db1').then(function() {
                return idb.destroy('db1');
            });
        });
    });
});
