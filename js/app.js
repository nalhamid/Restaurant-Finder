     //global map var
     var map;
     var infoWindow;
     var pos = { lat: 24.7241504, lng: 46.2620616 };
     var locations;
     // var pos = { lat: 25.276987, lng: 55.296249 };

     function initMap() {

         map = new google.maps.Map(document.getElementById('map'), {
             center: pos,
             zoom: 12
         });
         infoWindow = new google.maps.InfoWindow();
         ko.applyBindings(new AppViewModel());
     }

     //get current location function 
     function getCurrentLocation() {

         if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(function(position) {
                 pos = {
                     lat: position.coords.latitude,
                     lng: position.coords.longitude
                 };

                 // infoWindow.setPosition(pos);
                 // infoWindow.setContent('Location found.');
                 // infoWindow.open(map);
                 map.setCenter(pos);
             }, function() {
                 handleLocationError(true, infoWindow, map.getCenter());
             });
         } else {
             // Browser doesn't support Geolocation
             handleLocationError(false, infoWindow, map.getCenter());
         }

     }

     function createRestaurant(place) {
         var self = this;

         self.name = place.name;
         self.htmlA = place.html_attributions;
     }


     // viewmodel
     var AppViewModel = function() {

         var self = this;

         var image = {
             url: 'img/icon2.png',
             size: new google.maps.Size(32, 32),
             origin: new google.maps.Point(0, 0),
             anchor: new google.maps.Point(0, 32),
             scaledSize: new google.maps.Size(37, 37)
         };

         self.restaurants = ko.observableArray();
         getCurrentLocation();
         getNearRestaurants();

         function getNearRestaurants() {
             var service = new google.maps.places.PlacesService(map);
             service.textSearch({
                 location: pos,
                 radius: 1000,
                 query: 'restaurant'
             }, callback);
         }



         function callback(results, status) {

             if (status === google.maps.places.PlacesServiceStatus.OK) {
                 //observable array of resulted places
                 self.restaurants.removeAll();

                 for (var i = 0; i < results.length; i++) {
                     createMarker(results[i]);
                     self.restaurants.push(new createRestaurant(results[i]));

                 }
             }
         }



         function createMarker(place) {
             var placeLoc = place.geometry.location;
             var marker = new google.maps.Marker({
                 map: map,
                 position: place.geometry.location,
                 icon: image
             });

             google.maps.event.addListener(marker, 'click', function() {
                 infoWindow.setContent(place.name);
                 infoWindow.open(map, this);
             });
         }

         function handleLocationError(browserHasGeolocation, infoWindow, pos) {
             infoWindow.setPosition(pos);
             infoWindow.setContent(browserHasGeolocation ?
                 'Error: The Geolocation service failed.' :
                 'Error: Your browser doesn\'t support geolocation.');
             infoWindow.open(map);
         }

         map.addListener('bounds_changed', function() {
             pos = map.getCenter();
             getNearRestaurants();

         });



     };
