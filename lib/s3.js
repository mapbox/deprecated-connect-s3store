var knox = require('knox');

S3 = module.exports = function(options) {
        this.client = knox.createClient({
            key: options.awsKey,
            secret: options.awsSecret,
            bucket: options.bucket
        });
        return this;
}

    S3.prototype.put = function(id, object, cb) {
        var length = typeof object === 'undefined' ? 0 : object.length;
        var req = this.client.put(id, {
            'Content-Length': length,
            'Content-Type': 'application/json'
        });
        req.on('response', function(res) {
            if (res.statusCode == 200) {
                cb(null);
            } else {
                cb(res.statusCode);
            }
        });
        req.end(object);
    }

    S3.prototype.get = function(object, cb) {
        this.client.get(object).on('response', function(res) {
            var string = '';
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                string += chunk;
            });
            res.on('end', function() {
                if (res.statusCode != 200) {
                    cb(res.statusCode);
                } else {
                    cb(null, string);
                }
            });
        }).end();
    }

    S3.prototype.del = function(object, cb) {
        this.client.del(object).on('response', function(res) {
            cb();
        }).end();
    }
