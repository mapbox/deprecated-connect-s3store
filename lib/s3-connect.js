module.exports = function(connect) {

    var Store = connect.session.Store;

    function S3Store(options) {
        options = options || {};
        Store.call(this, options);
        S3 = require('./s3');
        this.db = new S3(options);
        this.setThrottle = options.setThrottle || 60000;
        return this;
    }

    S3Store.prototype.__proto__ = Store.prototype;

    S3Store.prototype.get = function (sid, fn) {
        sid = _uri_encode(sid);
        var now = +new Date;
        this.db.get(sid, function (err, sess) {
            if (err) {
                if (err == 404) err.code = "ENOENT";
                return fn && fn(err);
            } else if (sess.expires && now >= sess.expires) {
                return fn && fn(null, null);
            } else {
                return fn && fn(null, JSON.parse(sess));
            }
        }.bind(this));
    };

    S3Store.prototype.set = function(sid, sess, fn) {
        sid = _uri_encode(sid);
        fn = fn || function () {};
        this.db.get(sid, function (err, old) {
            var expires = typeof sess.cookie.maxAge === 'number'
                ? (+new Date()) + sess.cookie.maxAge
                : (+new Date()) + (24 * 60 * 60 * 1000);
            if (err) {
                sess.expires = expires;
                sess.lastAccess = new Date().getTime();
                sess = JSON.stringify(sess);
                this.db.put(sid, sess, fn);
            } else {
                old = JSON.parse(old);
                var accessGap = sess.lastAccess - old.lastAccess;
                // Temporarily remove properties for session comparison
                var _lastAccess = sess.lastAccess;
                var _originalMaxAge = sess.cookie.originalMaxAge;
                if (sess.cookie._expires) {
                    var _expires = sess.cookie._expires;
                    sess.cookie._expires = null;
                }
                if (old.cookie.expires) {
                    old.cookie.expires = null;
                }
                sess.lastAccess = null;
                sess.cookie.originalMaxAge = null;
                old.lastAccess = null;
                old.cookie.originalMaxAge = null;
                // Compare new session to current session, save if different
                // or setThrottle elapses
                if (JSON.stringify(old) !== JSON.stringify(sess)
                    || accessGap > this.setThrottle) {
                    sess.lastAccess = _lastAccess;
                    if (_expires) sess.cookie._expires = _expires;
                    sess.cookie.originalMaxAge = _originalMaxAge;
                    sess.expires = expires;
                    sess = JSON.stringify(sess);
                    this.db.put(sid, sess, fn);
                } else {
                    return fn();
                }
            }
        }.bind(this));
    }

    S3Store.prototype.destroy = function (sid, fn) {
        sid = _uri_encode(sid);
        this.db.get(sid, function (err, doc) {
            if (err) return fn && fn(err);
            this.db.del(doc, fn);
        }.bind(this));
    };

    return S3Store;

    function _uri_encode(id) {
        // We first decode it to escape any current URI encoding.
        // TODO spaces cause folder-like behavior in S3.  What other character
        // should be avoided in session id's in S3?
        return (encodeURIComponent(decodeURIComponent(id))).replace('%2F', '');
    }

};
