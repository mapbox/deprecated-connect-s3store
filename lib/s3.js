var knox = require('knox');

// Helper function to create Error objects from response statusCode.
var error = function(code) {
    var err = new Error(code);
    err.code = code;
    return err;
};

S3 = module.exports = function(options) {
    this.prefix = options.prefix || '';
    this.client = knox.createClient({
        key: options.awsKey,
        secret: options.awsSecret,
        bucket: options.bucket
    });
    return this;
};

S3.prototype.put = function(id, object, cb) {
    try { object = JSON.stringify(object); }
    catch (err) { return cb(err); }
    var req = this.client.put(this.prefix + id, {
        'Content-Length': object.length,
        'Content-Type': 'application/json'
    });
    req.on('error', cb);
    req.on('response', function(res) {
        if (res.statusCode == 200) {
            cb(null);
        } else {
            cb(error(res.statusCode));
        }
    });
    req.end(object);
};

S3.prototype.get = function(id, cb) {
    var req = this.client.get(this.prefix + id)
    req.on('error', cb);
    req.on('response', function(res) {
        var string = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            string += chunk;
        });
        res.on('end', function() {
            if (res.statusCode == 200) {
                try { cb(null, JSON.parse(string), res.headers); }
                catch (err) { cb(err); }
            } else {
                cb(error(res.statusCode));
            }
        });
    })
    req.end();
};

S3.prototype.del = function(id, cb) {
    var req = this.client.del(this.prefix + id);
    req.on('error', cb);
    req.on('response', function(res) {
        if (res.statusCode < 400) {
            cb();
        } else {
            cb(error(res.statusCode));
        }
    })
    req.end();
};
