var express = require('express');
var request = require('request');

var app = express();

	


var getHomegate = function(){

request('https://api-2445581357976.apicast.io:443/rs/real-estates/105240000?auth=ac22e38757948595929ae831aacadeb7', function (error, response, body) {
    //Check for error
    if(error){
        return console.log('Error:', error);
    }

    //Check for right status code
    if(response.statusCode !== 200){
        return console.log('Invalid Status Code Returned:', response.statusCode);
    }

    //All is good. Print the body
    console.log(body); // Show the HTML for the Modulus homepage.
    return body;
});
}


app.get('/init', function(req, res){


	res.send(getHomegate());


	//res.send("Nice guy");
});

app.listen(process.env.PORT || 8080);