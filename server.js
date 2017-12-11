const http         = require('http')
const fs           = require('fs')
const path         = require('path')
const url          = require('url')
const express      = require('express')
const bodyParser   = require('body-parser')
const MongoDB      = require('mongodb')
const MongoClient  = require('mongodb').MongoClient
const passwordHash = require('password-hash')

const { validate, ValidationError } = require('express-json-validator')

const identification_schema = {
  properties: {
    login:    { type: 'string', "minLength": 5, "maxLength": 20},
    password: { type: 'string', "minLength": 5, "maxLength": 40}
  },
  required: [ 'login', 'password' ]
};

const session_schema = {
  properties: {
    sid:    { type: 'string' }
  },
  required: [ 'sid' ]
};

const save_build_schema = {
  properties: {
    sid:          { type: 'string' },
    name:         { type: 'string', "minLength": 1, "maxLength": 254},
    build_data:   { type: 'string' }
  },
  required: [ 'sid', 'name', 'build_data' ]
};

const build_schema = {
  properties: {
    sid:          { type: 'string' },
    name:         { type: 'string' },
  },
  required: [ 'sid', 'name' ]
};

const urlStatus =
{
	Bad_Request:  400, 
	Unauthorized: 401,
	Forbidden:    403,
	Not_Found:    404,
	Internal_Server_Error: 500
};

const dburl = "mongodb://admin:lada7204@ds133496.mlab.com:33496/allods_base" 

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

function random_sid() 
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 50; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var OPEN_SESSIONS = {};

MongoClient.connect(dburl, function(err, db) {
  if (err) return console.log(err)
  user_database = db.collection('users');

  app.post('/registration', validate(identification_schema), function(req, res){

    const usr = { 
    				login: req.body.login, 
    				password: passwordHash.generate(req.body.password)
    			};

    user_database.insert(usr, function(err, result) {
      if (err) 
      { 
      	answer = { 'state': 'fail', 'error': err.message };
        res.status(urlStatus.Internal_Server_Error).send(answer); 
      } else 
      {
     	answer = { state: 'success'};
     	fs.mkdirSync(__dirname+'/users/'+ usr.login);
      fs.writeFileSync((__dirname+'/users/nodata', 'User created.');
      res.send(answer);
      }
       console.log({event:'registration', result:answer, data:usr})
    });
 });

app.post('/auth', validate(identification_schema), function(req, res) {

    const usr = { 
    				login: req.body.login, 
    				password: req.body.password 
    			};
    const details = { 'login': usr.login };

    user_database.findOne(details, function(err, realUser) {
      if (err) 
      { 
      	answer = { 'state': 'fail', 'error': err.message };
        res.status(urlStatus.Not_Found).send(answer); 
      } 
      else 
      {
        if(!realUser) 
        {
          answer = { 'state': 'fail', 'error': 'Invalid login or password' };
          res.status(urlStatus.Not_Found).send(answer); 
          return;
        }
      	if(passwordHash.verify(usr.password,realUser.password))
      	{
      	   usr_sid = random_sid();
      	   new_session = { login: realUser.login, sid: usr_sid};

      	   OPEN_SESSIONS[usr_sid] = realUser.login;

     	   answer = {state: 'success', sid: usr_sid};
           res.send(answer);
        }
        else
        {
           answer = {state: 'fail', 'error':'Invalid login or password'};
           res.status(urlStatus.Not_Found).send(answer);
        }
      }
       console.log({event:'authorisation', result:answer, data:usr})
    });

app.delete('/auth', validate(session_schema), function(req, res) {

    	if(OPEN_SESSIONS[req.body.sid])
    	{
    		delete OPEN_SESSIONS[req.body.sid];	

    		answer = {state: 'success'};	
    		res.send(answer);
    		console.log( {event: 'delete-auth', result: answer} )
    	}
    	else
    	{
    		answer = {state: 'fail', 'error':'Invalid session id'};
    		res.status(urlStatus.Not_Found).send(answer);
    		console.log( {event: 'delete-auth', result: answer} )
    	}
    });

app.post('/build', validate(save_build_schema), function(req, res) {

    	if(OPEN_SESSIONS[req.body.sid])
    	{
    		fpath = __dirname+'/users/'+OPEN_SESSIONS[req.body.sid]+'/'+req.body.name+'.ao';
    		try
    		{
    			fs.writeFileSync(fpath, req.body.build_data);
				answer = {state: 'success'};
			}catch(err)
			{
				answer = {state: 'fail', error: 'Can`t save build'};
				res.status(urlStatus.Internal_Server_Error);
			}
			res.send(answer);
			console.log( {event: 'save-build', result: answer, data: {login:OPEN_SESSIONS[req.body.sid], name:req.body.name} } )
    	}
    	else
    	{
    		answer = {state: 'fail', 'error':'Invalid session id'};
    		res.status(urlStatus.Unauthorized).send(answer);
    		console.log( {event: 'save-build', result: answer} )
    	}

    });

app.propfind('/build', validate(session_schema), function(req, res) {

    	if(OPEN_SESSIONS[req.body.sid])
    	{
    		dirpath = __dirname+'/users/'+OPEN_SESSIONS[req.body.sid]
    		try
    		{
    			blist = fs.readdirSync(dirpath);
    			answer = {state: 'success', builds: blist};
    		}
    		catch(err)
    		{
    			answer = {state: 'fail', error: 'Can`t list builds'};
    			res.status(urlStatus.Internal_Server_Error);
    		}

			res.send(answer);
			console.log( {event: 'list-build', result: answer, data: {login:OPEN_SESSIONS[req.body.sid]} } )
    	}
    	else
    	{
    		answer = {state: 'fail', 'error':'Invalid session id'};
    		res.status(urlStatus.Unauthorized).send(answer);
    		console.log( {event: 'list-build', result: answer} )
    	}

    });

app.get('/build', function(req, res) {

      if(!req.query.sid || !req.query.name)
      {
        answer = { 'state': 'fail', 'error': 'API bad argument'};
        res.status(urlStatus.Bad_Request).send(answer);
        console.log( {event: 'load-build', result: answer, request: req} )
      }

    	if(OPEN_SESSIONS[req.query.sid])
    	{
    		fpath = __dirname+'/users/'+OPEN_SESSIONS[req.query.sid]+'/'+req.query.name+'.ao';

    		if(!fs.existsSync(fpath))
  			{
  				answer = { 'state': 'fail', 'error': 'File not exist' };
  				res.status(urlStatus.Not_Found).send(answer);

  				console.log( {event: 'load-build', result: answer} )
  				return;
  			}

    		try
    		{
    			buildData = fs.readFileSync(fpath, 'utf-8');
				  answer = {state: 'success', build: buildData};
			}catch(err)
			{
				answer = {state: 'fail', error: 'Can`t read build'};
				res.status(urlStatus.Internal_Server_Error);
			}
			res.send(answer);
			console.log( {event: 'load-build', result: answer, data: {login:OPEN_SESSIONS[req.query.sid], name:req.query.name} } )
    	}
    	else
    	{
    		answer = {state: 'fail', 'error':'Invalid session id'};
    		res.status(urlStatus.Unauthorized).send(answer);
    		console.log( {event: 'load-build', result: answer} )
    	}

    });

app.delete('/build',  validate(build_schema), function(req, res) {

  		if(!/^[^\\^\/^\.]*$/.test(req.body.name))
  		{
  			answer = { 'state': 'fail', 'error': 'API bad param' };
  			res.status(urlStatus.Forbidden).send(answer);
  			console.log( {event: 'delete-build', result: answer} )
  			return;
  		}

    	if(OPEN_SESSIONS[req.body.sid])
    	{
    		fpath = __dirname+'/users/'+OPEN_SESSIONS[req.body.sid]+'/'+req.body.name+'.ao';
  			if(!fs.existsSync(fpath))
  			{
  				answer = { 'state': 'fail', 'error': 'File not exist' };
  				res.status(urlStatus.Not_Found).send(answer);

  				console.log( {event: 'delete-build', result: answer} )
  				return;
  			}

    		try
    		{
    			buildData = fs.unlinkSync(fpath);
				answer = {state: 'success'};
			}catch(err)
			{
				answer = {state: 'fail', error: 'Can`t read build'};
				res.status(urlStatus.Internal_Server_Error);
			}
			res.send(answer);
			console.log( {event: 'delete-build', result: answer, data: {login:OPEN_SESSIONS[req.body.sid], name:req.body.name} } )
    	}
    	else
    	{
    		answer = {state: 'fail', 'error':'Invalid session id'};
    		res.status(urlStatus.Unauthorized).send(answer);
    		console.log( {event: 'delete-build', result: answer} )
    	}
    });

	app.use(function(err, req, res, next) {

  		if (err instanceof ValidationError) 
  		{
    		answer = { 'state': 'fail', 'error': 'API bad argument', 'reference': err.message};
  			res.status(urlStatus.Bad_Request).send(answer);
  			console.log( {event: 'ERROR-HANDLER', result: answer, request: req} )
  			return;
  		} 
  		else 
  		{
    		next();
  		}
	});
});

  var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
  var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

  app.listen(server_port);
  console.log('Server running on port ' + server_port);
 })