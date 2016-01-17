var Router = require("router");
var router = new Router();

router.get('/', function (req, res) {
    console.log(req.headers);

    res.setHeader('Content-type', 'text/html');
    return res.end('<h1>Hello from API!</h1>');
});

module.exports = router;