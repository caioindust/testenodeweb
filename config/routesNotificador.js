var path = require('path');
var FalastraoEventsDB = require('./../models/FalastraoEvents');
var Sugar = require('sugar');
var q = require('q');
Sugar.extend();

module.exports = function(app, express, signalR, passport, dirname) {

    /*Metodos notify */

    app.get('/notificador', function(req, res) {
        res.render('notificador/index.ejs', {
            models: {
                title: 'Home',
                user: req.user
            }
        });
    });

    app.get('/notificador/adm', isLoggedIn, function(req, res) {
        res.render('notificador/adm.ejs', {
            models: {
                title: 'Administração',
                user: req.user
            }
        });
    });

    app.get('/notificador/cafe', isLoggedIn, function(req, res, next) {
        signalR.broadcast({ "action": "notify", "notify": { "title": "Café", "content": "O café chegou!!!", "icon": "coffee" } });
        res.json({ error: false, msg: "O café chegou!!!", status: "OK" });
    });

    app.get('/notificador/sol', isLoggedIn, function(req, res, next) {
        signalR.broadcast({ "action": "notify", "notify": { "title": "SOL", "content": "O 'SOL' chegou!!!", "icon": "sun" } });
        res.json({ error: false, msg: "Olha o \"SOL\"", status: "OK" });
    });

    app.get('/notificador/discoVoador', isLoggedIn, function(req, res, next) {
        signalR.broadcast({ "action": "notify", "notify": { "title": "Disco", "content": "Já chegou o disco voador!!!", "icon": "ufo" } });
        res.json({ error: false, msg: "Já chegou o disco voador!!!", status: "OK" });
    });

    app.get('/notificador/notify', isLoggedIn, function(req, res, next) {
        signalR.broadcast({ "action": "notify", notify: req.query });
        res.json({ error: false, msg: req.query.content, status: "OK" });
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================
    ///https://github.com/scotch-io/easy-node-authentication/blob/master/app/routes.js
    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/notificador/login', function(req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage'),
            path: "/notificador",
            models: {
                title: 'Login',
                user: req.user
            }
        });
    });

    // process the login form
    app.post('/notificador/login', passport.authenticate('local-login', {
        successRedirect: '/notificador/adm', // redirect to the secure profile section
        failureRedirect: '/notificador/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/notificador/logout', isLoggedIn, function(req, res) {
        req.logout();
        res.redirect('/notificador');
    });
    /*Fim - Metodos notify */

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.apps.indexOf(1) >= 0) {
            return next();
        } else {
            req.logout();
            req.flash('loginMessage', 'Access denied!');
        }

    }

    res.redirect('/notificador/Login');
}