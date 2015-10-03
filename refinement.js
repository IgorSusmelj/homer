module.exports = {
   init : init,
   another : another,
   cheaper : cheaper,
   closer : closer,
   dummylist : getDummyList()
}

/* maps from session id (string) to Refinement instances */
sessions = {};

function init(flats, res) {
   // TODO
   // don't forget about the case where flats is empty!
   res.send("OK init");
}

function fetchSession(req, res) {
   sessionid = req.query.sessionid;
   if (sessionid == undefined) {
      res.send("Invalid sessionid (undefined)!");
      return null;
   }

   refinement = sessions[sessionid];

   if (refinement == undefined) {
      res.send("Invalid sessionid (non-existent)!");
      return null;
   }

   return refinement;
}

function another(req, res) {
   if (null == (refinement = fetchSession(req, res)))
      return;

   res.send("OK another");
}

function cheaper(req, res) {
   if (null == (refinement = fetchSession(req, res)))
      return;

   res.send("OK cheaper");
}

function closer(req, res) {
   if (null == (refinement = fetchSession(req, res)))
      return;

   res.send("OK closer");
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

   /** all flats remaining (avoids outputing duplicates) */
   this.flats = flats;

   /**
    * Picks an initial suggestion, removes it from flats and returns it
    */
   function initial(flats) {
      // TODO: improve
      return flats.pop();
   }

   /**
    * the last selected flat (used as reference for cheaper & closer)
    */
   this.current = initial(this.flats);

   /**
   * Finds another similar flat
   */
   this.another = function() {
      return this.current = this.flats.pop();
   }

   /**
   * Finds cheaper similar flat
   */
   this.cheaper = function() {
      // TODO
      return this.current = this.flats.pop();
   }

   /**
   * Finds closer similar flat
   */
   this.closer = function() {
      // TODO
      return this.current = this.flats.pop();
   }
}

function arrayRemove(array, element) {
}

function getDummyList() {
   return [
      {
         id : 1,
         price : 1200,
         img : 'some_image_url',
         address : 'some address',
         traveltime : 20,
         rooms : 4
      },
      {
         id : 2,
         price : 1500,
         img : 'some_image_url',
         address : 'some address',
         traveltime : 15,
         rooms : 3.5
      },
      {
         id : 3,
         price : 1100,
         img : 'some_image_url',
         address : 'some address',
         traveltime : 30,
         rooms : 3.5
      },
      {
         id : 4,
         price : 1250,
         img : 'some_image_url',
         address : 'some address',
         traveltime : 23,
         rooms : 4
      }
   ];
}
