var mongoose = require('mongoose');
//SET MONGOLAB_URI="mongodb://<user>:<password>@ds063536.mlab.com:63536/triggerpanelnotify"

var UserSchema = new mongoose.Schema({
  id: Number,  
  username: String,
  password: String,
  active: Boolean
});
// Create a model based on the schema
var UserDB = mongoose.model('User', UserSchema);

// Connect to MongoDB and create/use database called todoAppTest
mongoose.connect(process.env.MONGOLAB_URI,{ server: { auto_reconnect: true }});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connection succesful');	
});

module.exports = function(req, res, next) {
	var baseAuth = req.get("Authorization");
	if(baseAuth!=undefined)
	{
		var user;
		var arrayBaseAuth = baseAuth.split(" ");
		if(arrayBaseAuth[0] == 'Basic'){				 
			var userAndPass = new Buffer(arrayBaseAuth[1], 'base64').toString('ascii').split(":");
			
			user = {
				name: userAndPass[0],
				pass: userAndPass[1]
			};
		}
		
		req.session = null;	
		if (user !== undefined ){		
			UserDB.findOne({ 'username': user['name'] }, 'username occupation', function (err, _user) {
			  if (err) {
				  res.header('WWW-Authenticate', 'Basic realm="Admin Area"');					
				res.status(401).send();
			};
			  if(_user.password == user['pass']){
				req.user = user;			
				next();
			  }else{
				res.header('WWW-Authenticate', 'Basic realm="Admin Area"');					
				res.status(401).send();
			  }
			});
		}
		
		/*if (user !== undefined && user['name'] === 'admin' && user['pass'] === '123456') {			
			req.user = user;			
			next();
		}*/				
	}
	
	if(req.user==undefined){
		res.header('WWW-Authenticate', 'Basic realm="Admin Area"');					
		res.status(401).send();
	}
}