// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

var port = 8000; 
var express = require('express');
var app = express();

const { Pool } = require('pg')
const pool = new Pool({
    user: 'webdbuser',
    host: 'localhost',
    database: 'webdb',
    password: 'password',
    port: 5432
});

const bodyParser = require('body-parser'); // we used this middleware to parse POST bodies

function isObject(o){ return typeof o === 'object' && o !== null; }
function isNaturalNumber(value) { return /^\d+$/.test(value); }

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(bodyParser.raw()); // support raw bodies

// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got here"}); 
});

/** 
 * This is middleware to restrict access to subroutes of /api/auth/ 
 * To get past this middleware, all requests should be sent with appropriate
 * credentials. Now this is not secure, but this is a first step.
 *
 * Authorization: Basic YXJub2xkOnNwaWRlcm1hbg==
 * Authorization: Basic " + btoa("arnold:spiderman"); in javascript
**/
app.use('/api/auth/login', function (req, res,next) {
	console.log("login");

	if (!req.headers.username || !req.headers.password) {
		return res.status(403).json({ error: 'Please enter both a username and password' });
  	}
	try {
		//Regex match the username and password to a valid username and password.
		//That is, usernames are only digits and alphabet letters. Passwords are special characters & letters. 
		var u = /(([\w]|[\W])*)$/.exec(req.headers.username);
		var uname = Buffer.from(u[1], 'base64').toString()
		u = /(([\w])*)$/.exec(uname) //Only A-Z, a-z, 0-9, and the underscore
		var p = /(([\w]|[\W])*)$/.exec(req.headers.password);
		var pword = Buffer.from(p[1], 'base64').toString()
		p = /(([\w]|[\W])*)$/.exec(pword) //Alphabet, digits, and any special character

		console.log(u)

		//m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this
		
		console.log(u)

		
		console.log(p)
		
		var username = u[1];
		var password = p[1];

		console.log(username+" "+password);

		let sql = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
        	pool.query(sql, [username, password], (err, pgRes) => {
  			if (err){
                		res.status(403).json({ error: 'Not authorized'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
                		res.status(403).json({ error: 'Not authorized'});
        		}
		});
	} catch(err) {
               	res.status(403).json({ error: 'Not authorized'});
	}
});

app.use('/api/register', function (req, res,next) {
	console.log("ahhh");

	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
  	}
	try {
		// var credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		var user_pass = Buffer.from(m[1], 'base64').toString()
		m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this

		var username = m[1];
		var password = m[2];

		console.log(username+" "+password);

		let sql_check = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
        	pool.query(sql_check, [username, password], (err, pgRes) => {
  			if (err){
                res.status(403).json({ error: 'Please enter a valid username and password'});
			} else if(pgRes.rowCount == 1){
				res.status(403).json({ error: 'User already exists!'});
			} else {
				let sql_insert = 'INSERT INTO ftduser (username, password) VALUES ($1, sha512($2))';
				pool.query(sql_insert, [username, password], (err));
				next(); 	
        	}
		});
	} catch(err) {
               	res.status(403).json({ error: 'Please enter a valid username and password'});
	}

});

// All routes below /api/auth require credentials 
app.post('/api/auth/login', function (req, res) {
	res.status(200); 
	res.json({"message":"authentication success"}); 
});

app.post('/api/register', function (req, res) {
	res.status(200);
	res.json({"message":"successfully registered user"});
});

app.post('/api/auth/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got to /api/auth/test"}); 
});

app.use('/',express.static('static_content')); 

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});

