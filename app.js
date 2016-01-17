"use strict";

var finalhandler = require('finalhandler');
var fs = require('fs');
var https = require('https');
var Router = require('router');
var serveStatic = require('serve-static');
var api = require("./routes/api");
var compression = require('compression');

var router = new Router({});
var staticHandler = serveStatic('public', {'index': ['index.html']});

router.use(compression({}));
router.use(staticHandler);
router.use('/api', api);

var options = {
    key: fs.readFileSync('./certificate/localhost.key'),
    cert: fs.readFileSync('./certificate/localhost.crt')
};
var port = process.env.VCAP_APP_PORT || 8080;
https.createServer(options, app).listen(port);

function app(req, res) {
    var done = finalhandler(req, res);
    router(req, res, done);
}