module.exports = {
   initial : init,
   another : another,
   cheaper : cheaper,
   closer : closer
}

function init(flats, res) {
   console.log("init");
   res.send("init");
}

function another(req, res) {
   console.log("another");
   res.send("another");
}

function cheaper(req, res) {
   console.log("cheaper");
   res.send("cheaper");
}

function closer(req, res) {
   console.log("closer");
   res.send("closer");
}

/* maps from session id (string) to Refinement instances */
session = {}

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

   /* all flats remaining (avoids outputing duplicates) */
   this.flats = flats;
   /* the last selected flat (used as reference for cheaper & closer) */
   this.current = null;

   /**
    * Chooses an initial flat out of the set of flats that satisfy the initial
    * requirements
    */
   this.initial = function() {
   }

   /**
   * Finds another similar flat
   */
   this.another = function() {
   }

   /**
   * Finds cheaper similar flat
   */
   this.cheaper = function() {
   }

   /**
   * Finds closer similar flat
   */
   this.closer = function() {
   }
}
