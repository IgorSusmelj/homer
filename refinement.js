module.exports = {
   init : init,
   another : handleAnother,
   cheaper : handleCheaper,
   closer : handleCloser,
   getDummyList : getDummyList
}

/* maps from session id (string) to Refinement instances */
var sessions = {};

function init(flats, res) {
   var refinement = new Refinement(flats);

   do {
      var sessionid = generateSessionId();
   } while (sessions[sessionid] != undefined);

   sessions[sessionid] = refinement;

   var cache = refinement.initialCache();
   cache["sessionid"] = sessionid;
   res.send(cache);
}

function generateSessionId() {
   return "" + Date.now();
}

function fetchSession(req, res) {
   var sessionid = req.query.sessionid;
   if (sessionid == undefined) {
      res.send("Invalid sessionid (undefined)!");
      return null;
   }

   var refinement = sessions[sessionid];

   if (refinement == undefined) {
      res.send("Invalid sessionid (non-existent)!");
      return null;
   }

   return refinement;
}

function handleAnother(req, res) {
   var refinement = fetchSession(req, res);
   if (refinement == null)
      return;

   res.send(refinement.anotherCache());
}

function handleCheaper(req, res) {
   var refinement = fetchSession(req, res);
   if (refinement == null)
      return;

   res.send(refinement.cheaperCache());
}

function handleCloser(req, res) {
   var refinement = fetchSession(req, res);
   if (refinement == null)
      return;

   res.send(refinement.closerCache());
}

/**
 * Class to handle refinement events of the front end
 *
 * Expects a set of flats which satisfy the initial requirements.
 * Chooses an initial flat out of this set.
 *
 * Handles the following requests by the user:
 *  - Find another similar flat
 *  - Find a cheaper similar flat
 *  - Find a closer similar flat
 * 
 * Never outputs a flat that was output previously
 */
function Refinement(flats) {

   function pruneTree(cache) {
      tree = {};
      tree["currend.id"] = cache["current"].id;
      tree["another.id"] = cache["another"]["current"].id;
      tree["another"] = {};
      tree["another"]["another.id"] = cache["another"]["another"].id;
      tree["another"]["cheaper.id"] = cache["another"]["cheaper"].id;
      tree["another"]["closer.id"] = cache["another"]["closer"].id;
      tree["closer.id"] = cache["closer"]["current"].id;
      tree["closer"] = {};
      tree["closer"]["another.id"] = cache["closer"]["another"].id;
      tree["closer"]["cheaper.id"] = cache["closer"]["cheaper"].id;
      tree["closer"]["closer.id"] = cache["closer"]["closer"].id;
      tree["cheaper.id"] = cache["cheaper"]["current"].id;
      tree["cheaper"] = {};
      tree["cheaper"]["another.id"] = cache["cheaper"]["another"].id;
      tree["cheaper"]["cheaper.id"] = cache["cheaper"]["cheaper"].id;
      tree["cheaper"]["closer.id"] = cache["cheaper"]["closer"].id;
      return tree;
   }

   var currentCache = {};

   var nullFlat = {
      id : -1,
      price : 0,
      img : "",
      address : "",
      traveltime : 0,
      rooms : 0.0,
      title : "!!!ERROR!!!"
   };

   function remove(array, element) {
      if (element == nullFlat)
         return;

      var index = array.indexOf(element);
      if (index != -1)
         array.splice(index, 1);
      else
         console.log("Tried to remove non-existent array element!");
   }


   var nullLeafCache = {
      current  : nullFlat,
      another  : nullFlat,
      cheaper  : nullFlat,
      closer  : nullFlat,
   };

   var nullCache = {
      current : nullFlat,
      another : nullLeafCache,
      cheaper : nullLeafCache,
      closer : nullLeafCache,
   };

   function initial() {
      if (flats.length == 0)
         return nullFlat;

      return flats[0];
   }

   function findAnother(ignore) {
      for (var i = 0; i < flats.length; ++i) {
         if (ignore.indexOf(flats[i]) == -1)
            return flats[i];
      }
      return nullFlat;
   }

   function findCheaper(ignore) {
      for (var i = 0; i < flats.length; ++i) {
         if (ignore.indexOf(flats[i]) == -1)
            return flats[i];
      }
      return nullFlat;
   }

   function findCloser(ignore) {
      for (var i = 0; i < flats.length; ++i) {
         if (ignore.indexOf(flats[i]) == -1)
            return flats[i];
      }
      return nullFlat;
   }

   function generateLeaf(leaf, ignore, f) {
      ignore.push(leaf["current"] = f(ignore));
      leaf["another"] = findAnother(ignore);
      leaf["cheaper"] = findCheaper(ignore);
      leaf["closer"] = findCloser(ignore);
   }

   function generateLeafs() {
      var another = currentCache["another"];
      var cheaper = currentCache["cheaper"];
      var closer = currentCache["closer"];

      currentCache["another"] = { current : another };
      currentCache["cheaper"] = { current : cheaper };
      currentCache["closer"] = { current : closer };

      generateLeaf(currentCache["another"], [another],
         function(ignore) { return another; });
      generateLeaf(currentCache["cheaper"], [cheaper],
         function(ignore) { return cheaper; });
      generateLeaf(currentCache["closer"], [closer],
         function(ignore) { return closer; });
   }

   this.initialCache = function() {

      var cache = {};
      var current = initial();

      var next;
      cache["current"] = current;

      cache["another"] = {};
      cache["cheaper"] = {};
      cache["closer"] = {};
      generateLeaf(cache["another"], [current], findAnother);
      generateLeaf(cache["cheaper"], [current], findCheaper);
      generateLeaf(cache["closer"], [current], findCloser);

      remove(flats, current);

      return currentCache = cache;
   }

   this.anotherCache = function() {
      currentCache = currentCache["another"];
      remove(flats, currentCache["current"]);
      generateLeafs();
      return currentCache;
   }

   this.cheaperCache = function() {
      currentCache = currentCache["cheaper"];
      remove(flats, currentCache["current"]);
      generateLeafs();
      return currentCache;
   }

   this.closerCache = function() {
      currentCache = currentCache["closer"];
      remove(flats, currentCache["current"]);
      generateLeafs();
      return currentCache;
   }
}

function getDummyList() {
   return [
      {
         id : 1,
         title : "room 1",
         price : 1200,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F4%2F4%2F8%2F9%2F448922%2F448922_r_601772.jpg/9hil%2FhW3wIAlTZpshhnbaw%3D%3D/256,204/6/Aviva_Apartment-Hotel-Gross-Zimmern-Restaurant_Frhstcksraum-1-448922.jpg',
         address : 'some address',
         traveltime : 20,
         rooms : 4
      },
      {
         id : 2,
         title : "room 2",
         price : 1500,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F4%2F3%2F9%2F5%2F439565%2F439565_ap_580791.jpg/9qrQUuMWa4Vgg%2B%2BPzMyI3Q%3D%3D/256,251/6/Marsil_Apartment_Hotel-Koeln-Appartement-6-439565.jpg',
         address : 'some address',
         traveltime : 15,
         rooms : 3.5
      },
      {
         id : 3,
         title : "room 3",
         price : 1100,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F0%2F5%2F1%2F4%2F051497%2F051497_ap_125501.jpg/LbWY7WDaQzeyDZkItH1THQ%3D%3D/256,256/6/Birkebeineren_Hotel_Apartments-Lillehammer-Appartement-51497.jpg',
         address : 'some address',
         traveltime : 30,
         rooms : 3.5
      },
      {
         id : 4,
         price : 1250,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F4%2F1%2F2%2F7%2F412705%2F412705_ap_3037972.jpg/GwXxbYpGqcsiOLLbif5CyQ%3D%3D/256,192/6/Arinza_Apartment_Kingsley_Court-Liverpool-Appartement-7-412705.jpg',
         address : 'some address',
         traveltime : 23,
         rooms : 4
      }
   ];
}
