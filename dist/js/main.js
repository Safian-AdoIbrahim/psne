var countryData = null, dataLayer = null, markerGroup = null,   
    country_layer = null, state_layer = null, lga_layer = null, ward_layer = null, bufferLayer = null, substance_layer = null,
    NGRAdmin2 = false,
    NGRLabels = [],
    osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),
    mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicy1jaGFuZCIsImEiOiJjaXdmcmtnc2QwMDBhMnltczBldmc1MHZuIn0.eIdXZvG0VOOcZhhoHpUQYA');

      

 // Add Leaflet map
  var map = L.map('map', {
      center: [10.7, 12],
      zoom: 6,
      zoomControl: true,
      minZoom: 7,
      maxZoom: 18
  });
  
 

  function sectorName() {
    // var customer_name = document.getElementById('customer_name').value;
     sector = $('#sector').val();
     console.log("Sector: ", sector);
 
     if(sector.length > 2)
         {
             triggerUiUpdate();
         }
 }




var osm=new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{ 
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);


var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});


var Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
maxZoom: 18      })


var Stamen_TopOSMFeatures = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toposm-features/{z}/{x}/{y}.{ext}', {
attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
subdomains: 'abcd',
minZoom: 0,
maxZoom: 18,
ext: 'png',
bounds: [[22, -132], [51, -56]],
opacity: 0.9
});

var OpenStreetMap_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
maxZoom: 18,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
//OpenStreetMap_BlackAndWhite.addTo(map);


var Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

      
  L.control.scale({
      position: 'bottomleft',
      maxWidth: 100,
      metric: true,
      updateWhenIdle: true
  }).addTo(map);

  
  //Admin boundries
  function addAdminLayersToMap(layers) {
      var layerStyles = {
              'admin0': {
                  "clickable": true,
                  "color": '#000080',
                  "fillColor": '#ffffff',
                  "weight": 2.0,
                  "opacity": 1,
                  "fillOpacity": 0.05
              },
              'admin2': {
                  "clickable": true,
                  "color": '#000080',
                  "fillColor": '#80FFFFFF',
                  "weight": 1.5,
                  "opacity": 0.5,
                  "fillOpacity": 0.05
              },
              'region': {
                  "clickable": true,
                  "color": "#5b92e5",
                  "fillColor": '#80FFFFFF',
                  "weight": 3.0,
                  "opacity": 0.7,
                  "fillOpacity": 0.05
              },
              // 'prefecture': {
              //     "clickable": true,
              //     "color": '#000080',
              //     "fillColor": '#80FFFFFF',
              //     "weight": 2.5,
              //     "opacity": 0.7,
              //     "fillOpacity": 0.05
              // }
        }
  
      var mapStyle = {
          "clickable":true,
          "color": "#5b92e5",
          "weight": 3,
          "fillColor": '#000',
          "weight": 2.5,
          "opacity":1,
          "fillOpacity": 0.9
      };
  
  
      
      stateSelect = $('#state_scope').val()
      lgaSelect = $('#lga_scope').val()
      sector_type = $('#type_scope').val(); 

      console.log("State_LGA: ", stateSelect+"  "+lgaSelect+" "+sector_type)

      nigeriaAdminLayer0 = L.geoJson(layers['nigeriaAdmin0'], {
          style: layerStyles['region']
      }).addTo(map)
      
  
      nigeriaAdminLayer2 = L.geoJson(layers['nigeriaAdmin2'], {
          style: layerStyles['region'],
          onEachFeature: function (feature, layer) {
              var labelIcon = L.divIcon({
                  className: 'labelLga-icon',
                  html: feature.properties.LGAName
              })
              NGRLabels.push(L.marker(layer.getBounds().getCenter(), {
                      icon: labelIcon
                  }))
  
          }
      })
  
    
  
  //Zoom In (State)
      if(state_layer != null)
               map.removeLayer(state_layer)
        state_layer = L.geoJson(layers['nigeriaAdmin1'], {
          filter: function(feature) {
            return feature.properties.StateName === stateSelect
        },
        style: layerStyles['mapStyle'],
        }).addTo(map)
       
      console.log(state_layer)
      map.fitBounds(state_layer.getBounds())
      
  //Zoom In (LGA)
  
      if(lga_layer != null)
        map.removeLayer(lga_layer)
  
        lga_layer = L.geoJson(layers['nigeriaAdmin2'], {
          filter: function(feature) {
            return feature.properties.LGAName === lgaSelect
        },
        style: layerStyles['mapStyle'],
        }).addTo(map)
  
       map.fitBounds(lga_layer.getBounds())
  
      console.log("Zoom Level",map.getZoom());
  }
  

  var url = 'points.json';  
  var blue = L.layerGroup([
        Esri_WorldGrayCanvas,
    Stamen_TopOSMFeatures
    ]); 
  
  // Set function for color ramp
  function getColor(sector_code){
    return sector_code == 'Protection' ? 'blue' :
         sector_code == 'Child Protection' ? 'red' :
                'green';
         }	
  
  // Set style function that sets fill color property
  function style(feature) {
    return {
      fillColor: setColor(feature.properties.sector),
      fillOpacity: 0.5,
      weight: 2,
      opacity: 1,
      color: '#ffffff',
      dashArray: '3'
    };
  }
  
  var myIcon = L.icon({
    iconUrl: 'icon_protection.svg',
    iconSize: [38, 38],
    popupAnchor: [13, 10],
    iconAnchor: [6, 6]
    })
  var geoJsonLayer;	
    
// Get GeoJSON data and create features.
  $.getJSON(url, (data)=> {
    var markers = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true
      });
        geoJsonLayer = L.geoJson(data, {
      
            pointToLayer: function(feature, latlng) {
    
        return L.circleMarker(latlng, {
        icon: myIcon,
        radius:6,
        opacity: 1,
        //color: "#000",
        color:getColor(feature.properties.sector),
        fillColor:  getColor(feature.properties.sector),
        fillOpacity: 1,

        }).bindPopup(`<h5><b>${feature.properties.name_of_organization}</b></h5>`);
            },
        onEachFeature: function (feature, layer) {
        
            layer.on('click', function (e) {
 
              // get coordinates from GeoJSON
              var coords = e.target.feature.geometry.coordinates
              //pass coords to function to create marker.(Yellow circle)
              onMapClick(coords);
              
              //place attributes in panel table.
                var fieldA=document.getElementById('pict');
                fieldA.innerHTML='<img src="' +e.target.feature.properties.image +'" style="width: auto; height: 110px">';
                var field1=document.getElementById('f1');
                field1.innerHTML=e.target.feature.properties.name_of_organization;
                var field2=document.getElementById('f2');
                field2.innerHTML=e.target.feature.properties.location;
                var field3=document.getElementById('f3');
                field3.innerHTML=e.target.feature.properties.services_offered;
                var field4=document.getElementById('f4');
                field4.innerHTML=e.target.feature.properties.days_and_hours_of_operation;
                var field5=document.getElementById('f5');
                field5.innerHTML=e.target.feature.properties.contact_phone_number;
            });

        }
         })//.addTo(map);
        markers.addLayer(geoJsonLayer);
        map.addLayer(markers);
        });
  
  

// click marker
  var clickmark;

  // When you click on a circle, it calls the onMapClick function and passes the layers coordinates.
  // I grab the coords which are X,Y, and I need to flip them to latLng for a marker,  
  function onMapClick(coords) {
    console.log(coords);
    var thecoords = coords.toString().split(',');
    var lat = thecoords[1];
    var lng = thecoords[0];
    //if prior marker exists, remove it.
    if (clickmark != undefined) {
      map.removeLayer(clickmark);
    };
  
     clickmark = L.circleMarker([lat,lng],{
      radius: 8,
      color: "yellow",
      fillColor:  "yellow",
      fillOpacity: 0.8}
     ).addTo(map);
  }
// end of code for click marker.



//Add layer control
var baseMaps = {
    "Open Street Map": osm,
    "Imagery":Esri_WorldImagery,
    "Gray":Esri_WorldGrayCanvas,
    "Blue Base":blue,
    "OSM B&W":OpenStreetMap_BlackAndWhite,
    "Stamen TonerLite" : Stamen_TonerLite
};

var overlayMaps = {};
L.control.layers(baseMaps, overlayMaps).addTo(map);

  
  function getAdminLayers() {
      var adminLayers = {} //admin layer-2-map
       $.get('resources/NGR_Admin0.json', function (nigeria_admin0) {
          adminLayers['nigeriaAdmin0'] = nigeria_admin0
          $.get('resources/NGR_Admin1.json', function (nigeria_admin1) {
              adminLayers['nigeriaAdmin1']= nigeria_admin1
                  $.get('resources/NGR_Admin2.json', function (nigeria_admin2) {
                      adminLayers['nigeriaAdmin2'] = nigeria_admin2
                      addAdminLayersToMap(adminLayers)
                  }).fail(function () {
                      logError(null)
                  })
          }).fail(function () {
              logError(null)
              })
       }).fail(function () {
              logError(null)
          })
  
  }
  
  function logError(error) {
      console.log("error!")
  }
  getAdminLayers()
  hideLoader()
//End of code

    
      
      
    

