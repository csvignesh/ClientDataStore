'use strict';
var lStorage = require('../../lib/local-storage');
var expect = require('chai').expect;

describe('data-store/local-storage/destroy', function() {
    if (!lStorage.isSupported()) {
        return;
    }
    it('deletes an existing datastore', function() {
        return lStorage.init('db1', [
            {
                indexes: [
                    {
                        name: 'attr1'
                    }
                ],
                name: 'table1'
            }
        ]).then(function() {
            return lStorage.destroy('db1').then(function(data) {
                expect(data.type).to.eql('success');
            });
        });
    });
    it('silently fails if the datastore to delete doesn\'t exist', function() {
        return lStorage.init('db1', []).then(function() {
            return lStorage.destroy('db1').then(function() {
                return lStorage.destroy('db1');
            });
        });
    });
});
