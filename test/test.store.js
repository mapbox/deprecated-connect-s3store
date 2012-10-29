// Mock the connect require as the prototype's functionality is not tested here.
var assert = require('assert');
var S3Store = require('../lib/s3-connect.js')({session:{Store:Object}});

if (!process.env['S3STORE_KEY'])
    throw new Error('S3STORE_KEY not set.');
if (!process.env['S3STORE_SECRET'])
    throw new Error('S3STORE_SECRET not set.');
if (!process.env['S3STORE_BUCKET'])
    throw new Error('S3STORE_BUCKET not set.');

describe('sessions', function() {
    var store = new S3Store({
        bucket: process.env['S3STORE_BUCKET'],
        awsKey: process.env['S3STORE_KEY'],
        awsSecret: process.env['S3STORE_SECRET']
    });
    var key = 'sessions-' + (+new Date);
    var obj = { cookie: { maxAge: 2000 }, name: 'dummy' };
    it('should err ENOENT for missing session', function(done) {
        store.get(key, function(err, data) {
            assert.equal(err.code, 'ENOENT');
            done();
        });
    });
    it('should set session', function(done) {
        store.set(key, obj, function(err) {
            assert.ok(!err);
            done();
        });
    });
    it('should get session', function(done) {
        store.get(key, function(err, data) {
            assert.deepEqual(obj, data);
            done();
        });
    });
    it('should destroy session', function(done) {
        store.destroy(key, function(err) {
            assert.ok(!err);
            done();
        });
    });
    it('should err ENOENT for destroyed session', function(done) {
        store.get(key, function(err, data) {
            assert.equal(err.code, 'ENOENT');
            done();
        });
    });
});

describe('throttle', function () {
    var store = new S3Store({
        setThrottle: 5000,
        bucket: process.env['S3STORE_BUCKET'],
        awsKey: process.env['S3STORE_KEY'],
        awsSecret: process.env['S3STORE_SECRET']
    });
    var key = 'throttle-' + (+new Date);
    var last;
    it('should set session', function(done) {
        store.set(key, {
            cookie: { maxAge:20000, originalMaxAge:20000 },
            name: 'john'
        }, function(err) {
            assert.ok(!err);
            done();
        });
    });
    it('should throttle set', function(done) {
        store.get(key, function(err, sess) {
            assert.ok(!err);
            sess.cookie.originalMaxAge = 19999;
            store.set(key, sess, function(err) {
                assert.ok(!err);
                store.get(key, function(err, sess) {
                    assert.ok(!err);
                    assert.equal(sess.cookie.originalMaxAge, 20000);
                    done();
                });
            });
        });
    });
    it('should bypass throttle by time', function(done) {
        setTimeout(function() {
        store.get(key, function(err, sess) {
            assert.ok(!err);
            sess.cookie.originalMaxAge = 19999;
            store.set(key, sess, function(err) {
                assert.ok(!err);
                store.get(key, function(err, sess) {
                    assert.ok(!err);
                    assert.equal(sess.cookie.originalMaxAge, 19999);
                    done();
                });
            });
        });
        }, 5000);
    });
    it('should bypass throttle on difference', function(done) {
        store.get(key, function(err, sess) {
            assert.ok(!err);
            sess.name = 'jane';
            store.set(key, sess, function(err) {
                assert.ok(!err);
                store.get(key, function(err, sess) {
                    assert.ok(!err);
                    assert.equal(sess.name, 'jane');
                    done();
                });
            });
        });
    });
    it('should destroy session', function(done) {
        store.destroy(key, function(err) {
            assert.ok(!err);
            done();
        });
    });
});

