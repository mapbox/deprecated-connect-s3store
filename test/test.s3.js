var assert = require('assert');
var S3 = require('../lib/s3.js');

if (!process.env['S3STORE_KEY'])
    throw new Error('S3STORE_KEY not set.');
if (!process.env['S3STORE_SECRET'])
    throw new Error('S3STORE_SECRET not set.');
if (!process.env['S3STORE_BUCKET'])
    throw new Error('S3STORE_BUCKET not set.');

var configs = {
    orig: new S3({
        bucket: process.env['S3STORE_BUCKET'],
        awsKey: process.env['S3STORE_KEY'],
        awsSecret: process.env['S3STORE_SECRET']
    }),
    prefixed: new S3({
        prefix: '/test/',
        bucket: process.env['S3STORE_BUCKET'],
        awsKey: process.env['S3STORE_KEY'],
        awsSecret: process.env['S3STORE_SECRET']
    })
};

for (var conf in configs) describe('s3 ' + conf, function() {
    var key = conf + '-' + (+new Date);
    var obj = { foo: 'bar' };
    it('should return 403/404 for missing object', function(done) {
        configs[conf].get(key, function(err, data) {
            assert.ok(err.code === 404 || err.code === 403);
            done();
        });
    });
    it('should succeed on PUT', function(done) {
        configs[conf].put(key, obj, function(err) {
            assert.ok(!err);
            done();
        });
    });
    it('should succeed on GET', function(done) {
        configs[conf].get(key, function(err, data) {
            assert.ok(!err);
            assert.deepEqual(data, obj);
            done();
        });
    });
    it('should succeed on DELETE', function(done) {
        configs[conf].del(key, function(err) {
            assert.ok(!err);
            done();
        });
    });
});

