//var express = require('express');
var https = require('https');

//var app = express();

const API_KEY = 'ac22e38757948595929ae831aacadeb7';


function _composeGet(param_sets) {
  // compose GET parameters
  get = [];

  for (var k in param_sets) {
    var set = param_sets[k];
    for (var p in set) {
      get.push(encodeURIComponent(p) + '=' + encodeURIComponent(set[p]));
    }
  }

  return get.join('&');
}


function _homegateReq(path, callback) {
  var req_params = {
    protocol: "https:",
    host: "api-2445581357976.apicast.io",
    path: "/rs/real-estates" + path,
    port: 443,
    headers: {
      'Accept': 'application/json',
      'auth': API_KEY
    }
  };


  req = https.request(req_params, function (resp) {
    var str = '';

    resp.on('data', function (chunk) {
      str += chunk;
    });

    resp.on('end', function () {
      callback(JSON.parse(str));
    });

    resp.on('error', function () {
      console.log('ERR: homegate API query failed');
      callback(null);
    });
  });

  req.end();
}

function search(search_params, callback) {
  parameters = {
    'language': 'en',
    'chooseType': 'rentflat',
  };
  path = '?' + _composeGet([parameters, search_params]);

  _homegateReq(path, callback);
};			



function getFlat(address, distance){

}

	var response;

	search(  	{
  		'zip' 			: '8005',
  		'SORT' 			: 'ts', 
  		'WITHINDISTANCE' : '500'

  	}, function(res){
		/*for(var i = 0; i < res.length; i++){
			var obj = res[i];
			for(var key in obj){
				var attrName = key;
				var attrValue = obj[key];
				console.log(attrName);
			}
		}*/
		for(i in res.items){
			console.log(i);
			console.log(res.items[i].sellingPrice)
		}
		//console.log();

		//console.log(res);

	});

/*
app.get('/', function(req, res){

	var response = search(null, callback);

	var callback = function(){
		//res.send(response);

	};

	//res.send("Nice guy");
});

app.listen(process.env.PORT || 8080);
*/