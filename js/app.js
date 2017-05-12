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

         // Create a searchbox in order to execute a places search
         var searchBox = new google.maps.places.SearchBox(
             document.getElementById('searchText'));
         // Bias the searchbox to within the bounds of the map.
         searchBox.setBounds(map.getBounds());


         ko.applyBindings(new AppViewModel());
     }


     // ********************************* Construct Restaurant ****************************

     function createRestaurant(place) {

         var self = this;

         self.name = place.name;
         self.address = place.formatted_address;
         self.place_id = place.place_id;
         self.rating = place.rating;
         self.phone = place.formatted_phone_number;
         self.url = place.url;

         if (!$.isEmptyObject(place.photos)) {
             self.photo = place.photos[0].getUrl({ 'maxWidth': 400, 'maxHeight': 400 });
         } else {
             //default image
             self.photo = "img/thumb_image_not_available.png";
         }

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
                 var infoContents;
                 var googleContents = '<div class="place-img row"> <div class="limit col-md-12"> <img class="img-responsive point-img" src="%photo%" alt="%name%"> </div> </div> <nav class="navbar navbar-default"> <div class="container-fluid"> <div class="navbar-header"> <a class="navbar-brand" href="%url%">%name%</a> </div> <ul class="nav navbar-nav navbar-right"> <li> <a href="https://maps.google.com/"><img class="img-responsive inline-block" src="img/google.png" alt="google maps" height="30" width="30"></a> </li> </ul> </div> </nav> <div class="row"> <div class="text-info col-md-12"> <p>Rating: <span>%rating%</span></p> <p>phone: <span>%phone%</span></p> <p>Address: <span>%address%</span></p> </div> </div>';
                 var foursquareContents = '<div class="place-img row"> <div class="limit col-md-12"> <img class="img-responsive point-img" src="%photo%" alt="%name%"> </div> </div> <nav class="navbar navbar-default"> <div class="container-fluid"> <div class="navbar-header"> <a class="navbar-brand" href="%url%">%name%</a> </div> <ul class="nav navbar-nav navbar-right"> <li> <a href="https://foursquare.com//"><img class="img-responsive inline-block" src="img/foursqare.png" alt="google maps" height="30" width="30"></a> </li> </ul> </div> </nav> <div class="row"> <div class="text-info col-md-12"> <p>Categories: <span>%categories%</span></p> <p>Price: <span>%price%</span></p> <p>Address: <span>%address%</span></p> </div> </div>';

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

                                 },

                                 error: function() {
                                     venueDetail = false;
                                 },
                                 complete: function() {


                                     //default image
                                     var image = "img/No_image_available.png";

                                     //review html template 
                                     var reviews = '<div class="row"> <h4 class="col-md-12">Reviews</h4>';
                                     var tipTemplate = '<div class="tips col-md-12"> <p>%tip%</p> </div>';

                                     //check if there a match for place in foursquare 
                                     //if there a match get infowindow info from foursquare else from google places
                                     if (venueID === false || venueDetail === false || venueID === undefined || venueDetail === undefined) {
                                         //***** google infowindow *****

                                         //get photo url
                                         if (place.photos.length !== 0) {
                                             image = place.photos[0].getUrl({ 'maxWidth': 400, 'maxHeight': 400 });
                                         }

                                         //get reviews
                                         if (place.reviews.length !== 0) {
                                             place.reviews.forEach(function(tip) {
                                                 reviews += tipTemplate.replace("%tip%", tip.text);
                                             });
                                         } else {
                                             reviews += tipTemplate.replace("%tip%", "No reviews available");
                                         }
                                         reviews += "</div>";


                                         //set complete infowindow html 
                                         infoContents = googleContents.replace(/%name%/g, place.name).replace("%address%", place.formatted_address).replace("%rating%", place.rating).replace("%phone%", place.formatted_phone_number).replace("%photo%", image).replace("%url%", place.url);
                                         infoContents += reviews;

                                     } else {
                                         //***** Foursqure infowindow *****

                                         //get categories
                                         var categories = "";
                                         venueDetail.categories.forEach(function(category) {
                                             categories += category.name + ", ";
                                         });

                                         //get photo url
                                         if (venueDetail.photos.count > 0) {
                                             image = venueDetail.bestPhoto.prefix + "width300" + venueDetail.bestPhoto.suffix;
                                         }

                                         //get price
                                         var price = "not available";
                                         if (!$.isEmptyObject(venueDetail.price)) {
                                             //venue id
                                             price = venueDetail.price.message;
                                         }


                                         //get reviews
                                         if (venueDetail.tips.count > 0) {
                                             venueDetail.tips.groups[0].items.forEach(function(tip) {
                                                 reviews += tipTemplate.replace("%tip%", tip.text);
                                             });
                                         } else {
                                             reviews += tipTemplate.replace("%tip%", "No reviews available");
                                         }
                                         reviews += "</div>";

                                         //set complete infowindow html 
                                         infoContents = foursquareContents.replace(/%name%/g, venueDetail.name).replace("%address%", venueDetail.location.formattedAddress.join(", ")).replace("%price%", venueDetail.price.message + " " + venueDetail.price.currency).replace("%categories%", categories).replace("%photo%", image).replace("%url%", venueDetail.canonicalUrl);
                                         infoContents += reviews;

                                     }

                                     infoWindow.setContent(infoContents);
                                     infoWindow.open(map, currentMarker);

                                 }
                             });
                             //***** /Foursqure details  *****

                         } else {
                             venueID = false;
                         }


                     },
                     error: function() {
                         venueID = false;

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
         //************** Search **************

         //search event listener
         document.getElementById('searchButton').addEventListener('click', function() {
             searchPlace();
         });

         //search function
         function searchPlace() {
             // Initialize the geocoder.
             var geocoder = new google.maps.Geocoder();
             // Get the address or place that the user entered.
             var address = document.getElementById('searchText').value;
             // Make sure the address isn't blank.
             if (address == '') {
                 window.alert('You must enter an area, or address.');
             } else {
                 // Geocode the address/area entered to get the center. Then, center the map
                 // on it and zoom in
                 geocoder.geocode({
                     address: address,

                 }, function(results, status) {
                     if (status == google.maps.GeocoderStatus.OK) {
                         pos = map.getCenter();
                         map.setCenter(results[0].geometry.location);
                         map.setZoom(15);
                     } else {
                         window.alert('We could not find that location - try entering a more' +
                             ' specific place.');
                     }
                 });
             }
         }
     }
