     // ********************************* Global Variables ****************************
     //global map info
     var map;
     var infoWindow;
     var service;
     var pos = { lat: 24.7241504, lng: 46.2620616 };

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
         self.photo = place.photos[0].getUrl({'maxWidth': 400, 'maxHeight': 400});
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
                 infoWindow.setContent(place.name);
                 infoWindow.open(map, this);
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



     }
