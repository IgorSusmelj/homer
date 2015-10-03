module.exports = {
   init : init,
   another : another,
   cheaper : cheaper,
   closer : closer,
   dummylist : getDummyList()
}

/* maps from session id (string) to Refinement instances */
sessions = {
   "0" : getDummyFlatsCache()
   };

function init(flats, res) {
   // TODO
   // don't forget about the case where flats is empty!

   cache = getDummyFlatsCache();
   cache["sessionid"] = "0";
   res.send(cache);
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

   res.send(getDummyFlatsCache());
}

function cheaper(req, res) {
   if (null == (refinement = fetchSession(req, res)))
      return;

   res.send(getDummyFlatsCache());
}

function closer(req, res) {
   if (null == (refinement = fetchSession(req, res)))
      return;

   res.send(getDummyFlatsCache());
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

function getDummyFlatsCache() {
   return {
   current : {
      id : 1,
      price : 1200,
      img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F4%2F4%2F8%2F9%2F448922%2F448922_r_601772.jpg/9hil%2FhW3wIAlTZpshhnbaw%3D%3D/256,204/6/Aviva_Apartment-Hotel-Gross-Zimmern-Restaurant_Frhstcksraum-1-448922.jpg',
      address : 'address of flat 1',
      traveltime : 20,
      rooms : 4
      },
   another : {
      current : {
         id : 2,
         price : 1500,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F4%2F3%2F9%2F5%2F439565%2F439565_ap_580791.jpg/9qrQUuMWa4Vgg%2B%2BPzMyI3Q%3D%3D/256,251/6/Marsil_Apartment_Hotel-Koeln-Appartement-6-439565.jpg',
         address : 'address of flat 1',
         traveltime : 15,
         rooms : 3.5
         },
      another : {
         id : 3,
         price : 1100,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F0%2F5%2F1%2F4%2F051497%2F051497_ap_125501.jpg/LbWY7WDaQzeyDZkItH1THQ%3D%3D/256,256/6/Birkebeineren_Hotel_Apartments-Lillehammer-Appartement-51497.jpg',
         address : 'address of flat 1',
         traveltime : 30,
         rooms : 3.5
         },
      cheaper : {
         id : 4,
         price : 1250,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F4%2F1%2F2%2F7%2F412705%2F412705_ap_3037972.jpg/GwXxbYpGqcsiOLLbif5CyQ%3D%3D/256,192/6/Arinza_Apartment_Kingsley_Court-Liverpool-Appartement-7-412705.jpg',
         address : 'address of flat 1',
         traveltime : 23,
         rooms : 4
         },
      closer : {
         id : 5,
         price : 1250,
         img : 'some_image_url',
         address : 'address of flat 1',
         traveltime : 23,
         rooms : 4
         }
      },
   cheapaer : {
      current : {
         id : 2,
         price : 1500,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F4%2F3%2F9%2F5%2F439565%2F439565_ap_580791.jpg/9qrQUuMWa4Vgg%2B%2BPzMyI3Q%3D%3D/256,251/6/Marsil_Apartment_Hotel-Koeln-Appartement-6-439565.jpg',
         address : 'address of flat 1',
         traveltime : 15,
         rooms : 3.5
         },
      another : {
         id : 3,
         price : 1100,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F0%2F5%2F1%2F4%2F051497%2F051497_ap_125501.jpg/LbWY7WDaQzeyDZkItH1THQ%3D%3D/256,256/6/Birkebeineren_Hotel_Apartments-Lillehammer-Appartement-51497.jpg',
         address : 'address of flat 1',
         traveltime : 30,
         rooms : 3.5
         },
      cheaper : {
         id : 4,
         price : 1250,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F4%2F1%2F2%2F7%2F412705%2F412705_ap_3037972.jpg/GwXxbYpGqcsiOLLbif5CyQ%3D%3D/256,192/6/Arinza_Apartment_Kingsley_Court-Liverpool-Appartement-7-412705.jpg',
         address : 'address of flat 1',
         traveltime : 23,
         rooms : 4
         },
      closer : {
         id : 5,
         price : 1250,
         img : 'some_image_url',
         address : 'address of flat 1',
         traveltime : 23,
         rooms : 4
         }

      },
   closer : {
      current : {
         id : 2,
         price : 1500,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F4%2F3%2F9%2F5%2F439565%2F439565_ap_580791.jpg/9qrQUuMWa4Vgg%2B%2BPzMyI3Q%3D%3D/256,251/6/Marsil_Apartment_Hotel-Koeln-Appartement-6-439565.jpg',
         address : 'address of flat 1',
         traveltime : 15,
         rooms : 3.5
         },
      another : {
         id : 3,
         price : 1100,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F0%2F5%2F1%2F4%2F051497%2F051497_ap_125501.jpg/LbWY7WDaQzeyDZkItH1THQ%3D%3D/256,256/6/Birkebeineren_Hotel_Apartments-Lillehammer-Appartement-51497.jpg',
         address : 'address of flat 1',
         traveltime : 30,
         rooms : 3.5
         },
      cheaper : {
         id : 4,
         price : 1250,
         img : 'http://foto.hrsstatic.com/fotos/0/3/256/256/80/000000/http%3A%2F%2Ffoto-origin.hrsstatic.com%2Ffoto%2F4%2F1%2F2%2F7%2F412705%2F412705_ap_3037972.jpg/GwXxbYpGqcsiOLLbif5CyQ%3D%3D/256,192/6/Arinza_Apartment_Kingsley_Court-Liverpool-Appartement-7-412705.jpg',
         address : 'address of flat 1',
         traveltime : 23,
         rooms : 4
         },
      closer : {
         id : 5,
         price : 1250,
         img : 'some_image_url',
         address : 'address of flat 1',
         traveltime : 23,
         rooms : 4
         }

      }
   };
}
