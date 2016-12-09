var express = require('express');
var SignalRJS = require('signalrjs');
var path = require('path');
var mongoose = require('mongoose');
var userDB = require('./models/Users');
var falastraoEventsDB = require('./models/FalastraoEvents');

var bodyParser = require("body-parser"); //https://www.npmjs.com/package/body-parser
var cookieParser = require('cookie-parser'); //https://www.npmjs.com/package/cookie-parser
var cookieSession = require('cookie-session'); //https://www.npmjs.com/package/cookie-session
var passport = require('passport');
var flash = require('connect-flash');

var db = mongoose.connection;
db.on('error', function(err) { console.log(err) });
db.once('open', function() {
    console.log('connection mongodb succesful');

    /*userDB.findOne({ 'id': 1 }, function(err, user) {
        var xxx = new falastraoEventsDB({
            event: "Teste",
            _user: user
        });

        console.log(xxx);    
    });*/
});

mongoose.connect(process.env.MONGOLAB_URI, { server: { auto_reconnect: true } });
//mongoose.connect('mongodb://localhost/test',{ server: { auto_reconnect: true }});

require('./config/passport')(passport); // pass passport for configuration

var signalR = SignalRJS();
var server = express();

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
server.use(allowCrossDomain);

server.use(signalR.createListener());

server.use(cookieSession({
    name: 'session',
    keys: [
        'HhO0VGUuWAKqvwlMWryK',
        '74WXlMvCV9mFoo9agQUc',
        'n4dwdiWwkpt4XMFgcB0I',
        'X6sp0rcn7HmoGFCePY3R',
        'yWdGy0eItai967eoNI51'
    ]
}));

server.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse application/x-www-form-urlencoded
server.use(bodyParser.json()); // parse application/json
server.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

server.use(cookieParser('XPTO1'));
server.use(passport.initialize());
server.use(passport.session()); // persistent login sessions
server.use(flash()); // use connect-flash for flash messages stored in session
server.set('view engine', 'ejs'); // set up ejs for templating

require('./config/routes.js')(server, express, signalR, passport, __dirname);

var listen = server.listen(process.env.PORT || 18889, function() {
    var port = listen.address().port;
    console.log("App now running on port", port);
});

signalR.on('CONNECTED', function() {
    console.log('connected');
});

process.on('uncaughtException', function(err) {
    console.log('process.on handler');
    console.log(err);
});