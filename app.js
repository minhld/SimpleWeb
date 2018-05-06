const express = require('express');		// installed
const path = require('path');			// default
const app = express();

// in app constants
const port = 3000;

// define the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
	res.render('index', { 
		title: 'My First Page',
	});
});

app.listen(port, () => {
	console.log('Server started on port ' + port + '...');
});