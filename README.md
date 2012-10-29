connect-s3-store
================

Use S3 as a node.js Connect session store.

### Tests

Tests are written to work with `mocha`. They expect the following environment
variables to be set in order to make real requests against S3:

    S3STORE_KEY=xxxxxxxxxxxxxxxxxxxx
    S3STORE_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    S3STORE_BUCKET=xxxxxxxxxxxxxxx

You can run the tests in this fashion in order to avoid setting or exporting
these shell variables globally:

    S3STORE_KEY=xxxxxxxxxxxxxxxxxxxx S3STORE_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx S3STORE_BUCKET=xxxxxxxxxxxxxxx mocha

