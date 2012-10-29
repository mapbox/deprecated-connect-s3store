connect-s3store
===============

Use S3 as a node.js Connect session store.

### Usage

Use like any other Connect session store.

    var connect = require('connect');
    var S3Store = require('connect-s3store')(connect);
    var store = new S3Store({
        // Bucket to be used for sessions.
        bucket: 'myappsessions',
        // AWS key.
        awsKey: 'xxxxxxxxxxxxxxxxxxxx',
        // AWS secret.
        awsSecret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        // Optional. Prefix to apply to all session objects.
        prefix: '/sessions/',
        // Optional. Throttle trivial session writes in ms. Defaults to 60000ms.
        throttle: 20000
    });
    var server = connect.createServer();
    server.use(connect.session({secret: 'YourSecretKey', store: store });

### Object expiration

You may want to set a lifecycle configuration on your bucket to [expire session objects](http://docs.amazonwebservices.com/AmazonS3/latest/dev/ObjectExpiration.html) to clean up expired sessions from your store.

### Tests

Tests are written to work with `mocha`. They expect the following environment variables to be set in order to make real requests against S3:

    S3STORE_KEY=xxxxxxxxxxxxxxxxxxxx
    S3STORE_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    S3STORE_BUCKET=xxxxxxxxxxxxxxx

You can run the tests in this fashion in order to avoid setting or exporting these shell variables globally:

    S3STORE_KEY=xxxxxxxxxxxxxxxxxxxx S3STORE_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx S3STORE_BUCKET=xxxxxxxxxxxxxxx mocha

