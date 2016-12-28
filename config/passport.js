///https://github.com/scotch-io/easy-node-authentication/blob/master/app/routes.js
// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('./../models/Users');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findOne({ 'id': id }, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            //usernameField : 'username',
            //passwordField : 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, username, password, done) {
            //if (username)
            //    username = username.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching            
            // asynchronous
            process.nextTick(function() {
                User.findOne({ 'username': username }, function(err, user) {
                    // if there are any errors, return the error
                    if (err) {
                        return done(err);
                    }

                    if (user == null || user.validPassword(password) == false) {
                        return done(null, false, req.flash('loginMessage', 'User or password is invalid!'));
                    }

                    // all is well, return user
                    else {
                        return done(null, user);
                    }
                });
            });

        }));
};