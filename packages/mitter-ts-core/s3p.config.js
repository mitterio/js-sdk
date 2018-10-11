module.exports = {
    "profile": "default",
    "region": "ap-south-1",
    "origin": "./docs",
    "destination": "s3://mitter-sourcedocs/tsdocs/",
    "ignore": /^\.|\/\./,
    "concurrency": 2,
    "delete": true
};

module.exports.schemaVersion = 1;

