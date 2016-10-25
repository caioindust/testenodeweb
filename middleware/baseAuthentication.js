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
		if (user !== undefined && user['name'] === 'admin' && user['pass'] === '123456') {			
			req.user = user;			
			next();
		}			
	}
	
	if(req.user==undefined){
		res.header('WWW-Authenticate', 'Basic realm="Admin Area"');					
		res.status(401).send();
	}
}