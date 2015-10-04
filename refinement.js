module.exports = {
   init : init,
   another : handleAnother,
   cheaper : handleCheaper,
   closer : handleCloser,
}

var reductionFactor = 0.8;

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

   var cache = refinement.anotherCache();
   cache["sessionid"] = refinement.sessionid;
   console.log(cache["current"]);
   res.send(cache);
}

function handleCheaper(req, res) {
   var refinement = fetchSession(req, res);
   if (refinement == null)
      return;

   var cache = refinement.cheaperCache();
   cache["sessionid"] = refinement.sessionid;
   console.log(cache["current"]);
   res.send(cache);
}

function handleCloser(req, res) {
   var refinement = fetchSession(req, res);
   if (refinement == null)
      return;

   var cache = refinement.closerCache();
   cache["sessionid"] = refinement.sessionid;
   console.log(cache["current"]);
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

      var index = Math.round(Math.random()*(flats.length - 1));
      return flats[index];
   }

   function findAnother(ref) {
      if (ref == nullFlat)
         return ref;

      var indices = shuffleArray(createIndices(flats.length));
      for (var i = 0; i < flats.length; ++i) {
         if (ref != flats[indices[i]])
            return flats[indices[i]];
      }
      return nullFlat;
   }

   function findCheaper(ref) {
      if (ref == nullFlat)
         return ref;

      flats.sort(function(a, b) {
         return a.price - b.price;
      });

      var index = flats.indexOf(ref);

      if (index == -1)
         console.log("ASSERTION ERROR (cheaper)!");

      index = Math.round(reductionFactor*index);

      for (var i = index; i >= 0; --i) {
         if (ref != flats[i])
            return flats[i];
      }
      return nullFlat;
   }

   function findCloser(ref) {
      if (ref == nullFlat)
         return ref;

      flats.sort(function(a, b) {
         return a.traveltime - b.traveltime;
      });

      var index = flats.indexOf(ref);

      if (index == -1)
         console.log("ASSERTION ERROR (closer)!");

      index = Math.round(reductionFactor*index);

      for (var i = index; i >= 0; --i) {
         if (ref != flats[i])
            return flats[i];
      }
      return nullFlat;
   }

   function generateLeaf(leaf, ref) {
      leaf["another"] = findAnother(ref);
      leaf["cheaper"] = findCheaper(ref);
      leaf["closer"] = findCloser(ref);
   }

   function generateLeafs() {
      var another = currentCache["another"];
      var cheaper = currentCache["cheaper"];
      var closer = currentCache["closer"];

      currentCache["another"] = { current : another };
      currentCache["cheaper"] = { current : cheaper };
      currentCache["closer"] = { current : closer };

      generateLeaf(currentCache["another"], another);
      generateLeaf(currentCache["cheaper"], cheaper);
      generateLeaf(currentCache["closer"], closer);
   }

   this.initialCache = function() {

      var cache = {};
      var first = initial();

      cache["current"] = first;

      cache["another"] = {};
      cache["cheaper"] = {};
      cache["closer"] = {};

      var another = cache["another"]["current"] = findAnother(first);
      var cheaper = cache["cheaper"]["current"] = findCheaper(first);
      var closer = cache["closer"]["current"] = findCloser(first);

      remove(flats, first);

      generateLeaf(cache["another"], another);
      generateLeaf(cache["cheaper"], cheaper);
      generateLeaf(cache["closer"], closer);

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
