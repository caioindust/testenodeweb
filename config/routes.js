var path = require('path');
var FalastraoEventsDB = require('./../models/FalastraoEvents');
var Sugar = require('sugar');
var q = require('q');
Sugar.extend();

module.exports = function(app, express, signalR, passport, dirname) {

    app.use(express.static(dirname));
    app.use(express.static(path.join(dirname, "download")));
    app.use(express.static(path.join(dirname, "scripts")));

    app.get('/', function(req, res) {
        res.render('index.ejs', {
            models: {
                title: 'Home',
                user: req.user
            }
        });
    });

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

    /*Metodos Falastrão */

    app.get('/falastrao', isLoggedInFalastrao, function(req, res) {
        res.render('falastrao/index.ejs', {
            models: {
                title: 'Home - Falastrão',
                user: req.user
            }
        });
    });

    app.get('/falastrao/addevent/:event/:start', isLoggedInFalastrao, function(req, res) {

        var start = req.params.start == "true" || req.params.start == "1";

        var falastraoEvent = new FalastraoEventsDB({
            event: req.params.event,
            start: start,
            _user: req.user,
            date: new Date(),
            timezoneOffset: new Date().getTimezoneOffset() * 60 * 1000
        });

        process.nextTick(function() {
            FalastraoEventsDB.findOne({ 'event': falastraoEvent.event }, null, { sort: '-date' }, function(err, last) {

                if (last != null && falastraoEvent.start == last.start) {
                    var autoFalastraoEvent = new FalastraoEventsDB({
                        event: falastraoEvent.event,
                        start: !start,
                        date: falastraoEvent.start ? falastraoEvent.date.getTime() - 1000 : last.date.getTime() + 1000,
                        timezoneOffset: new Date().getTimezoneOffset() * 60 * 1000,
                        _user: req.user
                    });
                    autoFalastraoEvent.save();
                } else if (last == null && falastraoEvent.start == false) {
                    var autoFalastraoEvent = new FalastraoEventsDB({
                        event: falastraoEvent.event,
                        start: true,
                        date: falastraoEvent.date.getTime() - 60000,
                        _user: req.user
                    });
                    autoFalastraoEvent.save();
                }

                falastraoEvent.save(function(err1) {
                    if (err1) {
                        res.json({ error: true, err: err1, obj: { event: req.params.event, start: req.params.start } });
                    }

                    falastraoEvent.getLastStatusEvents(
                        function(err, result) {
                            if (err) {

                            } else {
                                signalR.broadcast({ "action": "falastrao", "events": result });
                            }
                        }
                    );

                    res.json({ error: false, obj: { event: req.params.event, start: req.params.start } });
                });
            });
        });
    });

    app.get('/falastrao/chart/database', isLoggedInFalastrao, function(req, res) {
        FalastraoEventsDB.getChartData(function(err, result) {
            if (err) {
                process.nextTick(function() {
                    res.json({
                        error: true
                    });
                });
            } else {
                if (result.length > 0) {
                    result = result.map(function(obj) {
                        return {
                            "event": obj._id.event,
                            //"year": obj._id.year,
                            //"month": obj._id.month,
                            //"day": obj._id.day,
                            "hour": obj._id.hour,
                            "count": obj.count
                        };
                    });
                    var min = result.min("hour").hour;
                    var max = result.max("hour").hour;
                    var data = result.groupBy('event');
                    process.nextTick(function() {
                        res.json({
                            error: false,
                            data: data,
                            others: {
                                hours: {
                                    min: min,
                                    max: max,
                                    range: Number.range(min, max).toArray()
                                }
                            }
                        });
                    });
                } else {
                    process.nextTick(function() {
                        res.json({
                            error: false,
                            data: [],
                            others: {
                                hours: {
                                    min: 0,
                                    max: 0,
                                    range: Number.range(0, 0).toArray()
                                }
                            }
                        });
                    });
                }
            }
        });
    });

    app.get('/falastrao/login', function(req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage'),
            path: "/falastrao",
            models: {
                title: 'Login',
                user: req.user
            }
        });
    });

    app.post('/falastrao/login', passport.authenticate('local-login', {
        successRedirect: '/falastrao', // redirect to the secure profile section
        failureRedirect: '/falastrao/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/falastrao/logout', isLoggedInFalastrao, function(req, res) {
        req.logout();
        res.redirect('/falastrao');
    });
    /*Fim - Metodos Falastrão */

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.apps.indexOf(1) >= 0) {
            return next();
        }
    }

    res.redirect('/notificador/Login');
}

// route middleware to ensure user is logged in
function isLoggedInFalastrao(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.apps.indexOf(2) >= 0) {
            return next();
        }
    }

    res.redirect('/falastrao/Login');
}