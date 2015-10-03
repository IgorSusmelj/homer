/*var http = require('http')
var port = process.env.PORT || 1337;
http.createServer(function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
}).listen(port);

*/

var express = require('express');
var app = express();

app.get('/init', function(req, res){
	res.send("Nice guy");
});

app.listen(process.env.PORT || 8080);