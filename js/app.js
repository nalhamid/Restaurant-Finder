     // ********************************* Global Variables ****************************
     //global map info
     var map;
     var infoWindow;
     var service;
     var pos = { lat: 24.7241504, lng: 46.2620616 };
     var currentDate = new Date();

     // ********************************* Initiate Map ****************************
     function initMap() {

         map = new google.maps.Map(document.getElementById('map'), {
             center: pos,
             zoom: 12
         });
         infoWindow = new google.maps.InfoWindow();
         ko.applyBindings(new AppViewModel());
     }


     // ********************************* Current Location ****************************
     //get current location function 
     function getCurrentLocation() {

         if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(function(position) {
                 pos = {
                     lat: position.coords.latitude,
                     lng: position.coords.longitude
                 };

                 map.setCenter(pos);
             }, function() {
                 handleLocationError(true, infoWindow, map.getCenter());
             });
         } else {
             // Browser doesn't support Geolocation
             handleLocationError(false, infoWindow, map.getCenter());
         }

     }


     // ********************************* Construct Restaurant ****************************

     function createRestaurant(place) {

         var self = this;

         self.name = place.name;
         self.address = place.formatted_address;
         self.place_id = place.place_id;
         self.rating = place.rating;
         self.phone = place.formatted_phone_number;
         self.photo = place.photos[0].getUrl({ 'maxWidth': 400, 'maxHeight': 400 });
         self.url = place.url;


     }

     // ********************************* View Model ****************************

     function AppViewModel() {

         var self = this;

         //create restaurant icon for map
         var image = {
             url: 'img/icon2.png',
             size: new google.maps.Size(32, 32),
             origin: new google.maps.Point(0, 0),
             anchor: new google.maps.Point(0, 32),
             scaledSize: new google.maps.Size(37, 37)
         };

         //array of restaurants list
         self.restaurants = ko.observableArray();

         //Foursquare variables
         var v = getV(currentDate);
         var client_id = "5TS1P3MIKMNB14UOVVQIFCIO2GKWMBA420M1T1N3LZ453TBZ";
         var client_secret = "PLTSUR3WFWTQLJWIERYRJHUE33YI0BWSCJHK5RW4N5T3G0IJ";
         var auths = "?client_id=" + client_id + "&client_secret=" + client_secret + "&v=" + v;
         var searchUrl = "https://api.foursquare.com/v2/venues/search" + auths;
         var venuesDetailsUrl = "https://api.foursquare.com/v2/venues/";

         //get user current location
         getCurrentLocation();

         //get near restaurants 
         getNearRestaurants();

         //************** Near Restaurants Function **************
         function getNearRestaurants() {

             service = new google.maps.places.PlacesService(map);

             //call text search of keyword "restaurant"
             service.textSearch({
                 location: pos,
                 radius: 1000,
                 query: 'restaurant'
             }, callback);
         }

         //************** callback function (list of restaurants) **************

         //results of the search query in getNearRestaurants() function
         function callback(results, status) {

             if (status === google.maps.places.PlacesServiceStatus.OK) {

                 service = new google.maps.places.PlacesService(map);

                 //empty observable array of resulted places
                 self.restaurants.removeAll();

                 // iterate restaurants in results
                 for (var i = 0; i < results.length; i++) {
                     // createMarker(results[i]);
                     // self.restaurants.push(new createRestaurant(results[i]));

                     //get restaurant details  
                     service.getDetails({ placeId: results[i].place_id }, getDetails);
                 }
             }
         }

         //************** Get Restaurant Details Function **************

         function getDetails(place, status) {

             //check status of the request
             if (status == google.maps.places.PlacesServiceStatus.OK) {
                 //call create market
                 createMarker(place);

                 //add resturant to observable array 
                 self.restaurants.push(new createRestaurant(place));
             }
         }

         //************** Create Marker Function **************

         function createMarker(place) {
             //get place location
             var placeLoc = place.geometry.location;

             //create marker variable
             var marker = new google.maps.Marker({
                 map: map,
                 position: place.geometry.location,
                 icon: image
             });

             //event listener of marker click
             google.maps.event.addListener(marker, 'click', function() {
                 //TODO info window
                 var venueID;
                 var venueDetail;
                 var urlID = searchUrl + "&ll=" + place.geometry.location.lat() + "," + place.geometry.location.lng() + "&query=" + place.name + "&limit=1";
                 var urlDetails; // = venuesDetailsUrl + venueID + auths;
                 var currentMarker = this;
                 var infoContents ;
                 var googleContents = '<div class="place-img row"> <div class="limit col-md-12"> <img class="img-responsive " src="%photo%" alt="%name%"> </div> </div> <nav class="navbar navbar-default"> <div class="container-fluid"> <div class="navbar-header"> <a class="navbar-brand" href="%url%">%name%</a> </div> <ul class="nav navbar-nav navbar-right"> <li> <a href="https://maps.google.com/"><img class="img-responsive inline-block" src="img/google.png" alt="google maps" height="30" width="30"></a> </li> </ul> </div> </nav> <div class="row"> <div class="text-info col-md-12"> <p>Rating: <span>%rating%</span></p> <p>phone: <span>%phone%</span></p> <p>Address: <span>%address%</span></p> </div> </div>';
                 var foursquareContents = '<div class="place-img row"> <div class="limit col-md-12"> <img class="img-responsive " src="%photo%" alt="%name%"> </div> </div> <nav class="navbar navbar-default"> <div class="container-fluid"> <div class="navbar-header"> <a class="navbar-brand" href="%url%">%name%</a> </div> <ul class="nav navbar-nav navbar-right"> <li> <a href="https://www.google.com.sa/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwj9t_KL4OjTAhULuhoKHQJ_CoAQFgglMAA&url=https%3A%2F%2Fmaps.google.com%2F&usg=AFQjCNFuPY2Aj2NOPEsGecppA7LUkWB7YA&sig2=-qVhAW0Q-fcu2VW5uGvRkA"><img class="img-responsive inline-block" src="img/google.png" alt="google maps" height="15" width="15"></a> </li> </ul> </div> </nav> <div class="row"> <div class="text-info col-md-12"> <p>Rating: <span>%rating%</span></p> <p>phone: <span>%phone%</span></p> <p>Address: <span>%address%</span></p> </div> </div>';

                 //***** Get Venue ID ***** 
                 $.ajax({
                     url: urlID,
                     // async: false
                     success: function(json) {
                         if (json.response.venues.length !== 0) {
                             //venue id
                             venueID = json.response.venues[0].id;

                             urlDetails = venuesDetailsUrl + venueID + auths;

                             //************** Foursqure details  **************
                             //request jason from foursquare
                             $.ajax({

                                 url: urlDetails,
                                 success: function(json2) {
                                     if (!$.isEmptyObject(json2.response.venue)) {
                                         //venue id
                                         venueDetail = json2.response.venue;
                                     } else {
                                         venueDetail = false;
                                     }
                                     console.log(venueDetail);
                                 },

                                 error: function() {
                                     venueDetail = false;
                                 },
                                 complete: function() {
                                     //check if there a match for place in foursquare 
                                     //if there a match get infowindow info from foursquare else from google places
                                     if (venueID === false || venueDetail === false || venueID === undefined || venueDetail === undefined) {
                                         //***** google infowindow *****
                                         infoContents = googleContents.replace(/%name%/g, place.name).replace("%address%", place.formatted_address).replace("%rating%", place.rating).replace("%phone%", place.formatted_phone_number).replace("%photo%", place.photos[0].getUrl({ 'maxWidth': 400, 'maxHeight': 400 })).replace("%url%", place.url);
                                         console.log("google");
                                     } else {
                                         //***** Foursqure infowindow *****
                                         var address = "";
                                 infoContents = foursquareContents.replace(/%name%/g, venueDetail.name).replace("%address%", venueDetail.location.formattedAddress.join(", ")).replace("%rating%", place.rating).replace("%phone%", place.formatted_phone_number).replace("%photo%", place.photos[0].getUrl({ 'maxWidth': 400, 'maxHeight': 400 })).replace("%url%", place.url);

                                         console.log("venueDetail");
                                     }

                                     infoWindow.setContent(infoContents);
                                     infoWindow.open(map, currentMarker);

                                 }
                             });
                             //***** /Foursqure details  *****

                         } else {
                             venueID = false;
                         }
                         console.log(venueID);

                     },
                     error: function() {
                         venueID = false;
                         console.log(venueID);
                     },

                 });
                 //***** /Get Venue ID *****

             });
         }


         //************** Handle Location Error Function **************

         function handleLocationError(browserHasGeolocation, infoWindow, pos) {
             infoWindow.setPosition(pos);
             infoWindow.setContent(browserHasGeolocation ?
                 'Error: The Geolocation service failed.' :
                 'Error: Your browser doesn\'t support geolocation.');
             infoWindow.open(map);
         }

         //event listener to map if bounds changed
         map.addListener('bounds_changed', function() {
             //get new map center
             pos = map.getCenter();

             //get new near restaurants
             getNearRestaurants();

         });

         //************** Get Formated YYYYMMDD **************

         function getV(currentDate) {
             var yyyy = currentDate.getFullYear().toString();
             var mm = currentDate.getMonth() + 1;
             var dd = currentDate.getDate();

             if (dd < 10) {
                 dd = '0' + dd;
             }
             if (mm < 10) {
                 mm = '0' + mm;
             }
             return yyyy + mm + dd;
         }
     }
