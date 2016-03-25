"use strict";

var finalhandler = require('finalhandler');
var fs = require('fs');
var http = require('http');
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
    cert: fs.readFileSync('./certificate/concatenated.crt')
};
var httpsPort = process.env.HTTPS_PORT || 8443;
https.createServer(options, app).listen(httpsPort);

function app(req, res) {
    var done = finalhandler(req, res);
    router(req, res, done);
}

var httpPort = process.env.HTTP_PORT || 8080;
http.createServer(function(req, res){
    res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
    res.end();
}).listen(httpPort);