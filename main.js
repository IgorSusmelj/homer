var express = require('express');
var app = express();

app.get('/', function(req, res){
	res.send("Hello world");
});


app.get('/init', function(req, res){
	res.send("init");
});


app.listen(process.env.PORT || 8080);