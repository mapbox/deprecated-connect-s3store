var url = require('url');
var path = require('path');
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
      //agent: this.agent,
      method: 'PUT',
      url: 'https://s3.amazonaws.com/' + this.aws.bucket + '/' + id,
      path: id,
      aws: this.aws,
      headers: {
        'content-length': typeof data === 'undefined' ? 0 : data.length,
        'content-type': 'application/json'
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
      //agent: this.agent,
      method: 'GET',
      url: 'https://s3.amazonaws.com/' + this.aws.bucket + '/' + id,
      aws: this.aws
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
      //agent: this.agent,
      method: 'DELETE',
      aws: this.aws,
      url: 'https://s3.amazonaws.com/' + this.aws.bucket + '/' + id,
    },
      function (err, res, body) {
          if (res.statusCode == 200) {
              cb(null);
          } else {
              cb(res.statusCode);
          }
    });
};
