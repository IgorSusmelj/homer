var express = require('express');
var app = express();
var refinement = require('./refinement');

app.get('/', function(req, res){
	res.send("Hello world");
});


app.get('/init', function(req, res){
	res.send("init");
});

// TODO: call refinement.init with flats (JSON array) and res
app.get('/another', refinement.another);
app.get('/cheaper', refinement.cheaper);
app.get('/closer', refinement.closer);

app.listen(process.env.PORT || 8080);
