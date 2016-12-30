var path = require('path');
var FalastraoEventsDB = require('./../models/FalastraoEvents');
var Sugar = require('sugar');
var q = require('q');
Sugar.extend();

module.exports = function(app, express, signalR, passport, dirname) {

    app.use(express.static(dirname));
    app.use(express.static(path.join(dirname, "download")));
    app.use(express.static(path.join(dirname, "scripts")));
    app.use(express.static(path.join(dirname, "content")));

    app.get('/', function(req, res) {
        res.render('index.ejs', {
            models: {
                title: 'Home',
                user: req.user
            }
        });
    });
};