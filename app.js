const express = require('express');						// installed
const bodyParser = require('body-parser');				// installed
const path = require('path');							// default
const expressValidator = require('express-validator');	// installed
const mongojs = require('mongojs');						// installed
const db = mongojs('simpleapp', ['users']);
const app = express();					

// in app constants
const port = 3000;

// define the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ------ DECLARE MIDDLEWARE ------

// declare body parser for request/response
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));

// set validator middleware
app.use(expressValidator({
	errorFormatter: (param, msg, value) => {
		let namespace = param.split('.'),
			root = namespace.shift(),
			formParam = root;

		while (namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}	
		return {
			param: formParam,
			msg: msg,
			value: value
		}
	}
}));

// define the public folder
app.use(express.static(path.join(__dirname, 'public')));

// global variables
app.use((req, res, next) => {
	res.locals.errors = null;
	res.locals.users = null;
	next();
});


// ------ ENTRY POINT TO PAGES ------
// page '/'
app.get('/', (req, res) => {
	db.users.find((err, docs) =>{
		if (err) {
			console.log(err);
		} else {
			res.render('index', { 
				title: 'My First Page',
				users: docs
			});
		}
	});
});

// page /users/add
app.post('/users/add', (req, res) => {
	// validate the fields from the submitted form
	req.checkBody('first_name', 'First Name is required').notEmpty();
	req.checkBody('last_name', 'Last Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();

	let errors = req.validationErrors();
	
	Object.keys(errors).forEach((err) => {
  		console.log(err);
	});

	// errors.forEach((err, index, arr) => {
	// 	console.log(err.msg);
	// });

	if (errors) {
		res.render('index', { 
			title: 'My First Page',
			errors: errors
		});
		console.log('error happened');
	} else {
		console.log('user added');
		res.redirect('/');
	}
	
});

// start server
app.listen(port, () => {
	console.log('Server started on port ' + port + '...');
});