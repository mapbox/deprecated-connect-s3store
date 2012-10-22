module.exports = function(connect) {

    var Store = connect.session.Store;

    function S3Store(options) {
        options = options || {};
        Store.call(this, options);
        S3 = require('./s3');
        this.db = new S3(options);
        return this;
    }

    S3Store.prototype.__proto__ = Store.prototype;

    // TODO: use S3 object expiration to handle session expiry
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

    // TODO do not write session every request.  reuse code
    // from connect-couchdb
    S3Store.prototype.set = function(sid, sess, fn) {
	sid = _uri_encode(sid);
        var maxAge = sess.cookie.maxAge;
        var now = new Date().getTime();
        var expired = maxAge ? now + maxAge : now + oneDay;
        sess = JSON.stringify(sess);
        this.db.put(sid, sess, function(err, res) {
            fn(err);
        });
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
