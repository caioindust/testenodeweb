var express = require('express');
var SignalRJS = require('signalrjs');

var baseAuth = require('./middleware/baseAuthentication');
var path = require('path');
 
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

server.use( express.static(path.join(__dirname, "download")));

server.get('/adm',baseAuth, function(req, res) {
	res.sendFile(path.join(__dirname , 'alerttriggers.html'));
});

// server.get('/logout',baseAuth, function(req, res) {
//     delete req.headers.authorization;
//     res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
// 	res.redirect('/');
// });

server.get('/cafe',baseAuth, function (req, res, next) {	
	signalR.broadcast({action:"notify", notify:{title:'Café', content: "O café chegou!!!", icon:"coffee" }});	
	res.json({error:false, msg: "O café chegou!!!", status:"OK"});	
});

server.get('/sol',baseAuth, function (req, res, next) {
	signalR.broadcast({action:"notify", notify:{title:'SOL', content: "O \"SOL\" chegou!!!", icon:"sun" }});		
	res.json({error:false, msg: "Olha o \"SOL\"", status:"OK"});	
});

server.get('/discoVoador',baseAuth, function (req, res, next) {
	signalR.broadcast({action:"notify", notify:{title:'Disco', content: "Já chegou o disco voador!!!", icon:"ufo" }});		
	res.json({error:false, msg: "Já chegou o disco voador!!!", status:"OK"});	
});

server.get('/notify',baseAuth, function (req, res, next) {		
	signalR.broadcast({action:"notify", notify:req.query});	
	res.json({error:false, msg: req.query.content, status:"OK"});	
});


//server.use();
server.use(signalR.createListener());
server.use(express.static(__dirname));
server.listen(8089);
  
signalR.on('CONNECTED',function(){
    console.log('connected');
    // setInterval(function () {
        // signalR.broadcast({time:new Date()});
    // },1000);
});

 process.on('uncaughtException', function(err) {
    console.log('process.on handler');	
    console.log(err);
});