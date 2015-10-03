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

function _transportReq(path, callback){
  var req_params = {
    protocol: "https:",
    host: "transport.opendata.ch",
    path: "/v1/connections" + path,
    port: 443,
    headers: {
      'Accept': 'application/json',
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
      console.log('ERR: public transport API query failed');
      callback(null);
    });
  });

  req.end();
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

function searchHomegate(search_params, callback) {
  parameters = {
    'language': 'en',
    'chooseType': 'rentflat',
  };
  path = '?' + _composeGet([parameters, search_params]);

  _homegateReq(path, callback);
};			


function searchTranspot(search_params, callback){
  path = '?' + _composeGet([search_params]);

  _transportReq(path, callback);
}



function getFlat(pricelevel, roomMin, roomMax, address, callback){

  var homegateResponse = new Array();
  var travelResponse = {};

  searchHomegate(  	{
  		'zip' 			: '8005',
  		'SORT' 			: 'ts', 
  		'WITHINDISTANCE' : '500'

  	}, function(resHome){

  	for(i in resHome.items){
      var tmp = {};
      tmp['advId'] = resHome.items[i].advId;
      tmp['sellingPrice'] = resHome.items[i].sellingPrice;
      tmp['street'] = resHome.items[i].street;
      tmp['zip'] = resHome.items[i].zip;
      tmp['city'] = resHome.items[i].city;
      tmp['numberRooms'] = resHome.items[i].numberRooms;
      tmp['picFilename1Medium'] = resHome.items[i].picFilename1Medium;

      homegateResponse.push(tmp);

  		// console.log(resHome.items[i].advId);
  		// console.log(resHome.items[i].sellingPrice);
    //   console.log(resHome.items[i].street);
    //   console.log(resHome.items[i].zip);
    //   console.log(resHome.items[i].city);
    //   console.log(resHome.items[i].numberRooms);
    //   console.log(resHome.items[i].picFilename1Medium);
  	}

    //console.log(homegateResponse);

    var responseCounter = homegateResponse.length;
    for(i in homegateResponse){
      var hr = homegateResponse[i];
      var from = hr.street + ' ' + hr.city;
      var to = address;


      searchTranspot({
          'from'      : from,
          'to'        : to,
          'date'      : '2015-10-05', 
          'time'      : '07:30' 

        }, function(resTrans){
          var localBestTime = 10000;
          for(u in resTrans.connections){
            var tmp = resTrans.connections[u].duration;
            var formatItems = tmp.split(":");
            var minutes = parseInt(formatItems[1]);
            var hours = parseInt(formatItems[0].slice(3,5));
            var duration = hours*60 + minutes;
            localBestTime = (duration < localBestTime) ? duration : localBestTime;
          }

          homegateResponse[i]['duration'] = localBestTime;

          if(--responseCounter <= 0)
            console.log("All items processed");
            //setTimeout(function(){console.log(homegateResponse)},500);

          //var tmpDuration = {};
          //tmpDuration['duration'] = localBestTime;
          //console.log(localBestTime);
        //console.log(resTrans);
      });
    }
    //console.log(responseCounter);
    //console.log(homegateResponse);
    setTimeout(function(){callback(homegateResponse)},10000);

  });
}


// getFlat('low', 1.5, 4.5, 'frohdoerlistr. 10 8152 Glattbrugg', function(res){
//   console.log(res);
// });