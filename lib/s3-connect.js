module.exports = function(connect) {

    var Store = connect.session.Store;

    function Session(sess) {
        this.access = +new Date;
        this.sess = sess;
        return;
    }

    function S3Store(options) {
        options = options || {};
        Store.call(this, options);
        var S3 = require('./s3');
        this.db = new S3(options);
        this.cache = {};
        this.cacheage = options.cacheage || 60000;
        this.throttle = options.throttle || 60000;
        return this;
    }

    S3Store.prototype.__proto__ = Store.prototype;

    S3Store.prototype.get = function (sid, fn) {
        fn = fn || function () {};

        // Add cache timeout if not present.
        this._timeout = this._timeout || _cacheTimeout(this.cache, this);

        // Session has a cache entry.
        if (this.cache[sid]) return fn(null, this.cache[sid].sess);

        var now = +new Date;
        this.db.get(sid, function (err, sess) {
            if (err) {
                // 403 errors should also be considered ENOENT errors as
                // GET requests to s3 buckets without LIST priveleges return
                // 403 in place of 404.
                if (err.code == 404 || err.code == 403) err.code = "ENOENT";
                return fn(err);
            } else if (sess.expires && now >= sess.expires) {
                return this.destroy(sid, fn);
            } else {
                this.cache[sid] = new Session(sess);
                return fn(null, sess);
            }
        }.bind(this));
    };

    S3Store.prototype.set = function(sid, sess, fn) {
        fn = fn || function () {};
        this.db.get(sid, function (err, old, headers) {
            var expires = typeof sess.cookie.maxAge === 'number'
                ? (+new Date()) + sess.cookie.maxAge
                : (+new Date()) + (24 * 60 * 60 * 1000);
            if (err) {
                sess.expires = expires;
                this.cache[sid] = new Session(sess);
                this.db.put(sid, sess, fn);
            } else {
                // Compare new session to current session.
                // Save if different or past throttle time.
                var delta = (+new Date) - (+new Date(headers['last-modified']));
                if (delta > this.throttle || !_sessEqual(sess, old)) {
                    this.cache[sid] = new Session(sess);
                    this.db.put(sid, sess, fn);
                } else {
                    return fn();
                }
            }
        }.bind(this));
    };

    S3Store.prototype.destroy = function (sid, fn) {
        fn = fn || function () {};
        this.db.get(sid, function (err, doc) {
            if (err) return fn(err);
            delete this.cache[sid];
            this.db.del(sid, fn);
        }.bind(this));
    };

    return S3Store;

    function _cacheTimeout(cache, store) {
        return setTimeout(function() {
            var now = +new Date;
            Object.keys(cache).forEach(function(key) {
                if ((now - cache[key].access) < source.cacheage) return;
                delete cache[key];
            });
            delete store._timeout;
        }, store.cacheage);
    };

    function _sessEqual(a, b) {
        var a_expires =         a.cookie._expires;
        var b_expires =         b.cookie._expires;
        var a_lastAccess =      a.cookie.lastAccess;
        var b_lastAccess =      b.cookie.lastAccess;
        var a_originalMaxAge =  a.cookie.originalMaxAge;
        var b_originalMaxAge =  b.cookie.originalMaxAge;
        delete a.cookie._expires;
        delete b.cookie._expires;
        delete a.lastAccess;
        delete b.lastAccess;
        delete a.cookie.originalMaxAge;
        delete b.cookie.originalMaxAge;
        var equal = JSON.stringify(a) === JSON.stringify(b);
        if (a_expires) a.cookie._expires = a_expires;
        if (b_expires) b.cookie._expires = b_expires;
        if (a_lastAccess) a.lastAccess = a_lastAccess;
        if (b_lastAccess) b.lastAccess = b_lastAccess;
        if (a.cookie.originalMaxAge) a.cookie.originalMaxAge = a_originalMaxAge;
        if (b.cookie.originalMaxAge) b.cookie.originalMaxAge = b_originalMaxAge;
        return equal;
    };

};
