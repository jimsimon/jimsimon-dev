"use strict";

var finalhandler = require('finalhandler');
var fs = require('fs');
var http2 = require('http2');
var Router = require('router');
var serveStatic = require('serve-static');
var api = require("./routes/api");

var router = new Router();
var staticHandler = serveStatic('public', {'index': ['index.html']});

router.use(staticHandler);
router.use('/api', api);

var options = {
    key: fs.readFileSync('./certificate/localhost.key'),
    cert: fs.readFileSync('./certificate/localhost.crt')
};
var port = process.env.VCAP_APP_PORT || 8080;
http2.createServer(options, app).listen(port);

function app(req, res) {
    var done = finalhandler(req, res);
    router(req, res, done);
}