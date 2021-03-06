module.exports = {
   getFlats : getFlats
}

var https = require('https');

//Key to access homegate api
const API_KEY = 'ac22e38757948595929ae831aacadeb7';


//function to compose multiple parameters set
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

//Request for transports
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

  //https request for transports
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

//request for homegate flats
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

  //https request for homegate
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

//Search funtion which return all flats matching the parameters
function searchHomegate(search_params, callback) {
  parameters = {
    'language': 'en',
    'chooseType': 'rentflat',
  };
  path = '?' + _composeGet([parameters, search_params]);

  _homegateReq(path, callback);
};			


//Search function which returns all transport connections
function searchTransport(search_params, callback){
  path = '?' + _composeGet([search_params]);

  _transportReq(path, callback);
}


function checkResponse(data){
  var tmpData = Array();
  for(i in data)
    if(data[i].traveltime < 10000)
      tmpData.push(data[i]);

  data.length = 0;
  data = tmpData;
  return data;
}


//function for querying all flats
//returns best public transport travel time from flat to workplace
function getFlats(pricelevel, roomMin, roomMax, address, zip, callback){

  var homegateResponse = new Array();
  var travelResponse = {};


  /*
  searchHomegate({
    'zip'       : zip,
    'SORT'      : 'ts', 
    'WITHINDISTANCE' : '500',
    'Page' : '2',
    'numberResults' : '0'
  }, function(resHomeCount){
    console.log(resHomeCount);
  });*/


  searchHomegate(  	{
  		'zip' 			: zip,
  		'SORT' 			: 'ts', 
  		'withinDistance' : '100',
      'numberResults' : '200',
      'roomsFrom' : roomMin,
      'roomsTo' : roomMax

  	}, function(resHome){

    //list of all flat prices for price level computations
    var priceList = Array();
    var lowpriceBorder, highpriceBorder;

    console.log("found flats: " + resHome.items.length);

  	for(i in resHome.items){

      if(resHome.items[i].numberRooms >= roomMin && resHome.items[i].numberRooms <= roomMax){
        var tmp = {};
        tmp['id'] = resHome.items[i].advId;
        tmp['price'] = resHome.items[i].sellingPrice;
        tmp['address'] = resHome.items[i].street + ' ' + resHome.items[i].city;
        //tmp['zip'] = resHome.items[i].zip;
        tmp['rooms'] = resHome.items[i].numberRooms;
        tmp['img'] = resHome.items[i].picFilename1Medium;
        tmp['title'] = resHome.items[i].title;

        priceList.push(parseInt(resHome.items[i].sellingPrice));
        homegateResponse.push(tmp);
      }

  	}

    console.log("flats after room number constraint: " + homegateResponse.length);

    priceList.sort();

    lowpriceBorder = priceList[parseInt(priceList.length/3)];
    highpriceBorder = priceList[parseInt(2*priceList.length/3)];


    //remove items not in price range
    var tmpHomegateResponse = Array();
    for(i in homegateResponse){
      if(pricelevel == 'low'){
        if(parseInt(homegateResponse[i].price) < lowpriceBorder)
          tmpHomegateResponse.push(homegateResponse[i]);
      }else if(pricelevel == 'med'){
        if(parseInt(homegateResponse[i].price) < highpriceBorder && parseInt(homegateResponse[i].price) > lowpriceBorder)
          tmpHomegateResponse.push(homegateResponse[i]);
      }else if(pricelevel == 'high'){
        if(parseInt(homegateResponse[i].price) > highpriceBorder)
          tmpHomegateResponse.push(homegateResponse[i]);
      }
    }
    homegateResponse.length = 0;
    homegateResponse = tmpHomegateResponse;


    console.log("flats after price level constraint: " + homegateResponse.length);

    var responseCounter = homegateResponse.length;
    var durationList = Array();

    for(i in homegateResponse){
      var hr = homegateResponse[i];
      var from = hr.address;
      var to = address;


      searchTransport({
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
          durationList.push(localBestTime);


          if(--responseCounter <= 0){
              for(z in homegateResponse){
                homegateResponse[z]['traveltime'] = durationList[z];
              }
              console.log("flats after filtering bad stuff: " + homegateResponse.length);
              callback(checkResponse(homegateResponse));
          }

      });
    }

  });
}


//getFlats('low', 1.5, 4, 'frohdoerlistr. 10 8152 Glattbrugg', 8152, function(out){
      //console.log(out);
//})

