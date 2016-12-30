var path = require('path');
var FalastraoEventsDB = require('./../models/FalastraoEvents');
var Sugar = require('sugar');
var q = require('q');
Sugar.extend();

module.exports = function(app, express, signalR, passport, dirname) {

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
function isLoggedInFalastrao(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.apps.indexOf(2) >= 0) {
            return next();
        } else {
            req.logout();
            req.flash('loginMessage', 'Access denied!');
        }
    }
    res.redirect('/falastrao/Login');
}