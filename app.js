const express = require('express');						// installed
const bodyParser = require('body-parser');				// installed
const path = require('path');							// default
const expressValidator = require('express-validator');	// installed
const mongojs = require('mongojs');						// installed
const session = require('express-session');				// installed
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
				title: 'User Home',
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
	
	if (errors) {
		res.render('index', { 
			title: 'User Home',
			errors: errors
		});
		console.log('some fields are missing...');
	} else {
		// create a new user object
		let user = {
			firstName: req.body.first_name,
			lastName: req.body.last_name,
			email: req.body.email
		};

		db.users.insert(user, (err, recs) => {
			if (err) {
				console.log(err);
			} else {
				console.log('user added successfully');
			}
			res.redirect('/');
		});
		
	}
	
});

// page '/email'
app.get('/email', (req, res) => {
	res.render('email', {
		title: 'Send Email'
	});
});

// page '/email'
app.get('/manage', (req, res) => {
	db.users.find((err, docs) =>{
		if (err) {
			console.log(err);
		} else {
			res.render('manage', {
				title: 'User Management',
				users: docs
			});
		}
	});

	// res.render('manage', {
	// 	title: 'User Management'
	// });
});

// page /users/add
app.post('/users/login', (req, res) => {
	// validate the fields from the submitted form
	req.checkBody('first_name', 'First Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();

	let errors = req.validationErrors();

	if (errors) {
		res.render('manage', { 
			title: 'User Management',
			errors: errors
		});
		console.log('some fields are missing...');
	} else {

		let userQuery = {
			firstName: req.body.first_name,
			email: req.body.email
		};

		db.users.find(userQuery, (err, recs) => {
			// console.log(recs);
			if (err) {
				console.log(err);
			} else {
				if (recs.length == 0) {
					console.log('user ' + userQuery.firstName + ' not found');
					res.redirect('/manage');
				} else {
					console.log('user ' + recs.firstName + ' found');

					
					
				}
			}
			
		});
	}
});

// start server
app.listen(port, () => {
	console.log('Server started on port ' + port + '...');
});