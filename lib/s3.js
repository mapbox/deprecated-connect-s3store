var request = require('request');

S3 = module.exports = function(options) {
        this.aws = {
            key: options.awsKey,
            secret: options.awsSecret,
            bucket: options.bucket
        };
        this.agent = options.agent || null;
        return this;
}

S3.prototype.put = function(id, data, cb) {
    request({
      method: 'PUT',
      url: id,
      aws: this.aws,
      agent: this.agent,
      headers: {
        'Content-Length': typeof data === 'undefined' ? 0 : data.length,
        'Content-Type': 'application/json'
      },
      body: data
    },
      function (err, res, body) {
          if (res.statusCode == 200) {
              cb(null);
          } else {
              cb(res.statusCode);
          }
    });
};

S3.prototype.get = function(id, cb) {
    request({
      method: 'GET',
      url: id,
      aws: this.aws,
      agent: this.agent
    },
      function (err, res, body) {
          if (res.statusCode == 200) {
              cb(null, body);
          } else {
              cb(res.statusCode);
          }
    });
};

S3.prototype.del = function(id, cb) {
    request({
      method: 'DELETE',
      aws: this.aws,
      agent: this.agent,
      url: id
    },
      function (err, res, body) {
          if (res.statusCode == 200) {
              cb(null);
          } else {
              cb(res.statusCode);
          }
    });
};
