module.exports = {
   init : init,
   another : handleAnother,
   cheaper : handleCheaper,
   closer : handleCloser,
}

var priceReductionFactor = 0.95;
var traveltimeReductionFactor = 0.90;

/* maps from session id (string) to Refinement instances */
var sessions = {};

function init(flats, res) {
   var refinement = new Refinement(flats);

   do {
      var sessionid = generateSessionId();
   } while (sessions[sessionid] != undefined);

   sessions[sessionid] = refinement;
   refinement.sessionid = sessionid;

   var cache = refinement.initialCache();
   cache.sessionid = sessionid;
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

   var cache = refinement.anotherCache();
   cache.sessionid = refinement.sessionid;
   res.send(cache);
}

function handleCheaper(req, res) {
   var refinement = fetchSession(req, res);
   if (refinement == null)
      return;

   var cache = refinement.cheaperCache();
   cache.sessionid = refinement.sessionid;
   res.send(cache);
}

function handleCloser(req, res) {
   var refinement = fetchSession(req, res);
   if (refinement == null)
      return;

   var cache = refinement.closerCache();
   cache.sessionid = refinement.sessionid;
   res.send(cache);
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

   this.sessionid = "session_id_incorrectly_initialized";

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

   /**
    * Randomize array element order in-place.
    * Using Durstenfeld shuffle algorithm.
    */
   function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
         var j = Math.floor(Math.random() * (i + 1));
         var temp = array[i];
         array[i] = array[j];
         array[j] = temp;
      }
      return array;
   }

   function createIndices(num) {
      var arr = [];
      for (var i = 0; i < num; ++i)
         arr.push(i);
      return arr;
   }

   function initial() {
      if (flats.length == 0)
         return nullFlat;

      var index = Math.round(Math.random()*(flats.length - 1));
      return flats[index];
   }

   function findAnother() {
      var ref = currentCache.current;
      if (ref == nullFlat)
         return ref;

      var indices = shuffleArray(createIndices(flats.length));
      for (var i = 0; i < flats.length; ++i) {
         if (ref != flats[indices[i]])
            return flats[indices[i]];
      }
      return nullFlat;
   }

   function findCheaper() {
      var ref = currentCache.current;
      if (ref == nullFlat)
         return ref;

      flats.sort(function(a, b) {
         if (typeof(a.price) != "number" || typeof(b.price) != "number")
            console.log("ASSERTION ERROR 2 (cheaper)");
         return a.price - b.price;
      });

      var index = flats.indexOf(ref);

      if (index == -1)
         console.log("ASSERTION ERROR (cheaper)!");

      var price = priceReductionFactor*ref.price;

      for (var i = index; i >= 0; --i) {
         if (ref != flats[i] && flats[i].price <= price)
            return flats[i];
      }
      return nullFlat;
   }

   function findCloser() {
      var ref = currentCache.current;
      if (ref == nullFlat)
         return ref;

      flats.sort(function(a, b) {
         if (typeof(a.traveltime) != "number" || typeof(b.traveltime) != "number")
            console.log("ASSERTION ERROR 2 (closer)");
         return a.traveltime - b.traveltime;
      });

      var index = flats.indexOf(ref);

      if (index == -1)
         console.log("ASSERTION ERROR (closer)!");

      var traveltime = traveltimeReductionFactor*ref.traveltime;

      for (var i = index; i >= 0; --i) {
         if (ref != flats[i] && flats[i].traveltime <= traveltime)
            return flats[i];
      }
      return nullFlat;
   }

   function generateLeaf() {
      currentCache.another = findAnother();
      currentCache.cheaper = findCheaper();
      currentCache.closer = findCloser();
   }

   this.initialCache = function() {

      currentCache = {};
      var first = initial();

      currentCache.current = first;
      generateLeaf();

      return currentCache;
   }

   this.anotherCache = function() {
      var old = currentCache.current;
      currentCache = { current : currentCache.another };
      generateLeaf();
      remove(flats, old);
      return currentCache;
   }

   this.cheaperCache = function() {
      var old = currentCache.current;
      currentCache = { current : currentCache.cheaper };
      generateLeaf();
      remove(flats, old);
      return currentCache;
   }

   this.closerCache = function() {
      var old = currentCache.current;
      currentCache = { current : currentCache.closer };
      generateLeaf();
      remove(flats, old);
      return currentCache;
   }
}
