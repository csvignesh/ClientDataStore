'use strict';
require('../../../data-store/shims')
var idb = require('../../../data-store/indexed-db');
var expect = require('chai').expect;
var isSupported = false;

describe('data-store/indexed-db/destroy', function() {
    before(function(done) {
        return idb.isSupported().then(function(supported) {
            isSupported = supported;
            done();
        });
    });
    it('deletes an existing datastore', function() {
        if (!isSupported) {
            return;
        }
        return idb.init('db1', [
            {
                indexes: [{name: 'attr1'}],
                name: 'table1'
            }
        ]).then(function() {
            return idb.destroy('db1').then(function(data) {
                expect(data.type).to.eql('success');
            });
        });
    });
    it('silently fails if the datastore to delete doesn\'t exist', function() {
        if (!isSupported) {
            return;
        }
        return idb.init('db1', []).then(function() {
            return idb.destroy('db1').then(function() {
                return idb.destroy('db1').then(function(data) {
                    expect(data).to.eql(undefined);
                });
            });
        });
    });
});
