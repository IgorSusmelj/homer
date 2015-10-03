var express = require('express');
var app = express();
var refinement = require('./refinement');

app.get('/', function(req, res){
	res.send("Hello world");
});


app.get('/init', function(req, res){
   pricelevel = req.query.pricelevel;
   address = req.query.address;
   roomslower = req.query.roomslower;
   roomsupper = req.query.roomsupper;
   zip = req.query.zip;

   if (pricelevel != "low" &&
      pricelevel != "med" &&
      pricelevel != "high") {
      res.send("Invalid pricelevel (" + pricelevel + ")!");
      return;
   }

   if (address == undefined) {
      res.send("Invalid address (undefined)!");
      return;
   }

   if (roomslower == undefined) {
      res.send("Invalid roomslower (undefined)!");
      return;
   }

   roomslower = parseFloat(roomslower);

   if (isNaN(roomslower)) {
      res.send("Invalid roomslower (NaN)!");
      return;
   }

   if (roomsupper == undefined) {
      res.send("Invalid roomsupper (undefined)!");
      return;
   }

   if (isNaN(roomsupper)) {
      res.send("Invalid roomsupper (NaN)!");
      return;
   }

   if (zip == undefined) {
      res.send("Invalid zip (undefined)!");
      return;
   }

   // fetch list matching given parameters
   // TODO
   // flats = f(add, address, roomslower, roomsupper, zip);

   flats = refinement.dummmylist;

   refinement.init(flats, res);
});

app.get('/another', refinement.another);
app.get('/cheaper', refinement.cheaper);
app.get('/closer', refinement.closer);

app.listen(process.env.PORT || 8080);
