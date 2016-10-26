var path = require('path');

module.exports = function(app, express, signalR, passport, dirname) {

	app.use(express.static(dirname));
	app.use( express.static(path.join(dirname, "download")));
	
	app.get('/', function(req, res) {
        res.render('index.ejs', {
			models: {
				title: 'Home',
				user : req.user
			}
        });
    });
		
	app.get('/adm',isLoggedIn, function(req, res) {
		res.render('adm.ejs', {
			models: {
				title: 'Administração',
				user : req.user
			}
        });
	});

	app.get('/cafe',isLoggedIn, function (req, res, next) {	
		signalR.broadcast({"action":"notify", "notify":{"title":"Café", "content": "O café chegou!!!", "icon":"coffee" }});	
		res.json({error:false, msg: "O café chegou!!!", status:"OK"});	
	});

	app.get('/sol',isLoggedIn, function (req, res, next) {
		signalR.broadcast({"action":"notify", "notify":{"title":"SOL", "content": "O 'SOL' chegou!!!", "icon":"sun" }});		
		res.json({error:false, msg: "Olha o \"SOL\"", status:"OK"});	
	});

	app.get('/discoVoador',isLoggedIn, function (req, res, next) {
		signalR.broadcast({"action":"notify", "notify":{"title":"Disco", "content": "Já chegou o disco voador!!!", "icon":"ufo" }});		
		res.json({error:false, msg: "Já chegou o disco voador!!!", status:"OK"});	
	});

	app.get('/notify',isLoggedIn, function (req, res, next) {		
		signalR.broadcast({"action":"notify", notify:req.query});	
		res.json({error:false, msg: req.query.content, status:"OK"});	
	});
	
    // LOGOUT ==============================
    app.get('/logout',isLoggedIn, function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================
	///https://github.com/scotch-io/easy-node-authentication/blob/master/app/routes.js
    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { 
				message: req.flash('loginMessage'),
					models: {
					title: 'Login',
					user : req.user
				}
			});
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/adm', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        /*// SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));*/
   
// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

   
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {	
    if (req.isAuthenticated())
        return next();

    res.redirect('/Login');
}
