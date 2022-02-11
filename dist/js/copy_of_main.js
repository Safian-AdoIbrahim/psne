var geoData = null, dataLayer = null, markerGroup = null,   
    country_layer = null, state_layer = null, lga_layer = null, ward_layer = null, bufferLayer = null, substance_layer = null,
    NGRAdmin2 = false,
    NGRLabels = [],
    googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']}),
    googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']}),
    osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20}),
    mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicy1jaGFuZCIsImEiOiJjaXdmcmtnc2QwMDBhMnltczBldmc1MHZuIn0.eIdXZvG0VOOcZhhoHpUQYA');

//Initiating and declaring leaflet map object
var map = L.map('map', {
    center: [9, 12],
    zoom: 6,
//    animation: true,
    zoomControl: false,
    layers: [osm],
    minZoom: 6.3,
    maxZoom: 22

});

 
//map.options.minZoom = 5;

// var baseMaps = {
//     "Google Satelite": googleSat,
//     "OSM": osm,
    // "Google Street": googleStreets,
//     "Map Box": mapbox
// };

map.on('zoomend', function () {
//    adjustLayerbyZoom(map.getZoom())

})


    new L.Control.Zoom({
    position: 'bottomleft'
}).addTo(map);

L.control.layers(baseMaps).addTo(map);

L.control.scale({
    position: 'bottomleft',
    maxWidth: 100,
    metric: true,
    updateWhenIdle: true
}).addTo(map);


function facilityName() {
   // var customer_name = document.getElementById('customer_name').value;
    facility_name = $('#facility_name').val();
    console.log("Facility Name: ", facility_name);

    if(facility_name.length > 2)
        {
            triggerUiUpdate();
        }
}

//This drives all the operation that will be rendering on the map
function triggerUiUpdate() {
    state = $('#state_scope').val()
    lga = $('#lga_scope').val();
    facility_type = $('#facility_type').val(); 
    facility_name = $('#facility_name').val();
    status = $('#status_scope').val();
    
    console.log("All Seleceted: ", state+"  "+lga+"  "+facility_type+"  "+facility_name+"  "+status)
    
    var query = buildQuery(state, lga, facility_type, facility_name, status)
    download_query = (query.replace("http:", "https:").replace("format=GeoJSON&", ""))+"&format=CSV";
    document.getElementById("query").setAttribute("href",download_query);
    getData(query)
    console.log("QUERY:  ", query)
}


//Read data from carto and filter via selection from the interface
function buildQuery(state, lga, facility_type, facility_name, status) {
  var needsAnd = false;
    query = 'https://femtope.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM herams_data';
   if (state.length > 0 || lga.length > 0 || facility_type.length > 0 || facility_name.length > 2 || status.length > 0 ){
       query = query.concat(' WHERE')
       if (state.length > 0){
      query = query.concat(" state = '".concat(state.concat("'")))
      needsAnd = true
    }
       
   if(lga.length > 0) {
      query = needsAnd  ? query.concat(" AND lga = '".concat(lga.concat("'"))) :  query.concat(" lga = '".concat(lga.concat("'")))
      needsAnd = true
    }
       
   if (facility_type.length > 0){
        query = needsAnd  ? query.concat(" AND facility_type = '".concat(facility_type.concat("'"))) :  query.concat(" facility_type = '".concat(facility_type.concat("'")))
      needsAnd = true
    }

    if(facility_name.length > 2) {
      query = needsAnd  ? query.concat(" AND facility_name LIKE '%25".concat(facility_name.concat("%25'"))).concat(" OR facility_name LIKE '%25".concat(facility_name.charAt(0).toUpperCase()+facility_name.slice(1).concat("%25'"))) :  query.concat(" facility_name LIKE '%25".concat(facility_name.concat("%25'"))).concat(" OR facility_name LIKE '%25".concat(facility_name.charAt(0).toUpperCase()+facility_name.slice(1).concat("%25'")))
      needsAnd = true
    }


    if (status.length > 0){
      query = needsAnd  ? query.concat(" AND status = '".concat(status.concat("'"))) :  query.concat(" status = '".concat(status.concat("'")))
      needsAnd = true
    }

}
     else query = 'https://femtope.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM herams_data';
  return query

}


//Helps add data to the marker cluster and cluster to the map with icons
function addDataToMap(geoData) {
    // adjustLayerbyZoom(map.getZoom())
    //remove all layers first

    if (dataLayer != null)
        map.removeLayer(dataLayer)

    if (markerGroup != null)
        map.removeLayer(markerGroup)

    var _radius = 8
    var _outColor = "#fff"
    var _weight = 2
    var _opacity = 2
    var _fillOpacity = 2.0

    var allFacility = {
        'Fully functioning': L.icon({
            iconUrl: "image/hf_logo.png",
            iconSize: [20, 20],
            iconAnchor: [25, 25]
            }),
        'Partially functioning': L.icon({
            iconUrl: "image/hf_logo.png",
            iconSize: [20, 20],
            iconAnchor: [25, 25]
            }),
        'Non-functioning': L.icon({
            iconUrl: "image/hf_logo_d.png",
            iconSize: [20, 20],
            iconAnchor: [25, 25]
            }),
        }
    
//    var customer = L.icon({
//        iconUrl: "image/hf_logo.png",
//        iconSize: [20, 20],
//        iconAnchor: [25, 25]
//    });



    $('#projectCount').text(geoData.features.length)

    markerGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            removeOutsideVisibleBounds: true
        })
        dataLayer = L.geoJson(geoData, {
        pointToLayer: function (feature, latlng) {
//            var marker = L.marker(latlng, {icon: customer})
            var marker = L.marker(latlng, {icon: allFacility[feature.properties.status]})
            return marker
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.cartodb_id) {
                layer.on('click', function () {
                    displayInfo(feature)
                })
            }

        }

    })

    markerGroup.addLayer(dataLayer);
    map.fitBounds(dataLayer);
    map.addLayer(markerGroup);
}


//Add administrative boundaries to the map and symbolizes them
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
                "color": '#000080',
                "fillColor": '#80FFFFFF',
                "weight": 2.0,
                "opacity": 0.7,
                "fillOpacity": 0.05
            },
            'prefecture': {
                "clickable": true,
                "color": '#000080',
                "fillColor": '#80FFFFFF',
                "weight": 2.5,
                "opacity": 0.7,
                "fillOpacity": 0.05
            }
      }

    stateSelect = $('#state_scope').val()
    lgaSelect = $('#lga_scope').val()
    console.log("State_LGA: ", stateSelect+"  "+lgaSelect)
    nigeriaAdminLayer0 = L.geoJson(layers['nigeriaAdmin'], {
        style: layerStyles['admin0']
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

    //Zoom In to state level on selection
    if(state_layer != null)
             map.removeLayer(state_layer)

      state_layer = L.geoJson(layers['nigeriaAdmin1'], {
        filter: function(feature) {
          return feature.properties.StateName === stateSelect
      },
      style: layerStyles['region'],
      }).addTo(map)

//    state_layer.on('ready', function(e) {
//         map.fitBounds(state_layer.getBounds())
//    })
    console.log(state_layer)
    map.fitBounds(state_layer.getBounds())

    //Zoom In to LGA Level on selection

    if(lga_layer != null)
      map.removeLayer(lga_layer)

      lga_layer = L.geoJson(layers['nigeriaAdmin2'], {
        filter: function(feature) {
          return feature.properties.LGAName === lgaSelect
      },
      style: layerStyles['region'],
      }).addTo(map)

     map.fitBounds(lga_layer.getBounds())

    console.log("Zoom Level ",map.getZoom());
}

//Help attached counts of verious multiselection via query to the interface
function displayInfo(feature) {
    var infoContent = buildPopupContent(feature)
    $('#infoContent').html(infoContent)
}


//Normalizaes the data pull from carto by removing unwanted spaces and charater
function normalizeName(source) {
    source = source.replace("_", " ").replace('of_', ' of ')
    source = source.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    return source
}

//Help with popup information
function buildPopupContent(feature) {
    var subcontent = ''
    var propertyNames = ['state', 'lga', 'ward', 'officer_in_charge', 'phone_number', 'facility_name', 'facility_type', 'building_damage', 'status']
    for (var i = 0; i < propertyNames.length; i++) {
        subcontent = subcontent.concat('<p><strong>' + normalizeName(propertyNames[i]) + ': </strong>' + feature.properties[propertyNames[i]] + '</p>')

    }
    return subcontent;
}

function showLoader() {
    $('.fa-spinner').addClass('fa-spin')
    $('.fa-spinner').show()
}

function hideLoader() {
    $('.fa-spinner').removeClass('fa-spin')
    $('.fa-spinner').hide()
}


function getData(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addDataToMap(data)
        console.log('Data-Geo::  ', data);
    }).fail(function () {
        console.log("error!")
    });
}

function getAdminLayers() {
//    showLoader()
    var adminLayers = {}
    //Add Admin Layers to Map
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
/*triggerUiUpdate()*/



// copy of the latest main.js






var geoData = null, dataLayer = null, markerGroup = null,   
    country_layer = null, state_layer = null, lga_layer = null, ward_layer = null, bufferLayer = null, substance_layer = null,
    NGRAdmin2 = false,
    NGRLabels = [],
    googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']}),
    googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']}),
    osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20}),
    mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicy1jaGFuZCIsImEiOiJjaXdmcmtnc2QwMDBhMnltczBldmc1MHZuIn0.eIdXZvG0VOOcZhhoHpUQYA');

//Initiating and declaring leaflet map object
var map = L.map('map', {
    center: [9, 12],
    zoom: 6,
//    animation: true,
    zoomControl: false,
    layers: [osm],
    minZoom: 6.4,
    maxZoom: 22

});

// var marker = L.marker ([11.8311, 13.1510]).addTo(map);
// marker.bindPopup ("Hello Maiduguri");
// map.options.minZoom = 5;

var baseMaps = {
    "OSM": osm,
    "Google Satelite": googleSat,
    "Google Street": googleStreets,
    "Map Box": mapbox
};

map.on('zoomend', function () {
//    adjustLayerbyZoom(map.getZoom())

})


    new L.Control.Zoom({
    position: 'bottomleft'
}).addTo(map);

// L.control.layers(baseMaps).addTo(map);

// L.control.scale({
//     position: 'bottomleft',
//     maxWidth: 100,
//     metric: true,
//     updateWhenIdle: true
// }).addTo(map);



var teardrop = new L.Icon ({iconUrl: '/images/protection_icon.png'});

function refugee (features, layer){

    layer.bindPopup("<h1>Hello, UNHCR!</h1>" +features.properties.location+ "</h1>");
    layer.setIcon(teardrop);
};


L.geoJson(data,{
     onEachFeature: refugee,

}).addTo(map);

function facilityName() {
   // var customer_name = document.getElementById('customer_name').value;
    facility_name = $('#facility_name').val();
    console.log("Facility Name: ", facility_name);

    if(facility_name.length > 2)
        {
            triggerUiUpdate();
        }
}

//This drives all the operation that will be rendering on the map
function triggerUiUpdate() {
    state = $('#state_scope').val()
    lga = $('#lga_scope').val();
    facility_type = $('#facility_type').val(); 
    facility_name = $('#facility_name').val();
    status = $('#status_scope').val();
    
    console.log("All Seleceted: ", state+"  "+lga+"  "+facility_type+"  "+facility_name+"  "+status)
    
    var query = buildQuery(state, lga, facility_type, facility_name, status)
    download_query = (query.replace("http:", "https:").replace("format=GeoJSON&", ""))+"&format=CSV";
    document.getElementById("query").setAttribute("href",download_query);
    getData(query)
    console.log("QUERY:  ", query)
}


//Read data from carto and filter via selection from the interface
function buildQuery(state, lga, facility_type, facility_name, status) {
    var needsAnd = false;
      query = 'https://femtope.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM herams_data';
     if (state.length > 0 || lga.length > 0 || facility_type.length > 0 || facility_name.length > 2 || status.length > 0 ){
         query = query.concat(' WHERE')
         if (state.length > 0){
        query = query.concat(" state = '".concat(state.concat("'")))
        needsAnd = true
      }
         
     if(lga.length > 0) {
        query = needsAnd  ? query.concat(" AND lga = '".concat(lga.concat("'"))) :  query.concat(" lga = '".concat(lga.concat("'")))
        needsAnd = true
      }
         
     if (facility_type.length > 0){
          query = needsAnd  ? query.concat(" AND facility_type = '".concat(facility_type.concat("'"))) :  query.concat(" facility_type = '".concat(facility_type.concat("'")))
        needsAnd = true
      }
  
      if(facility_name.length > 2) {
        query = needsAnd  ? query.concat(" AND facility_name LIKE '%25".concat(facility_name.concat("%25'"))).concat(" OR facility_name LIKE '%25".concat(facility_name.charAt(0).toUpperCase()+facility_name.slice(1).concat("%25'"))) :  query.concat(" facility_name LIKE '%25".concat(facility_name.concat("%25'"))).concat(" OR facility_name LIKE '%25".concat(facility_name.charAt(0).toUpperCase()+facility_name.slice(1).concat("%25'")))
        needsAnd = true
      }
  
      if (status.length > 0){
        query = needsAnd  ? query.concat(" AND status = '".concat(status.concat("'"))) :  query.concat(" status = '".concat(status.concat("'")))
        needsAnd = true
      }
  
  }
       else query = 'https://femtope.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM herams_data';
    return query
  
  }
  

//Helps add data to the marker cluster and cluster to the map with icons
function addDataToMap(geoData) {
    // adjustLayerbyZoom(map.getZoom())
    //remove all layers first

    if (dataLayer != null)
        map.removeLayer(dataLayer)

    if (markerGroup != null)
        map.removeLayer(markerGroup)

    var _radius = 8
    var _outColor = "#fff"
    var _weight = 2
    var _opacity = 2
    var _fillOpacity = 2.0

    var allFacility = {
        'Fully functioning': L.icon({
            iconUrl: "image/hf_logo.png",
            iconSize: [20, 20],
            iconAnchor: [25, 25]
            }),
        'Partially functioning': L.icon({
            iconUrl: "image/hf_logo.png",
            iconSize: [20, 20],
            iconAnchor: [25, 25]
            }),
        'Non-functioning': L.icon({
            iconUrl: "image/hf_logo_d.png",
            iconSize: [20, 20],
            iconAnchor: [25, 25]
            }),
        }
    
//    var customer = L.icon({
//        iconUrl: "image/hf_logo.png",
//        iconSize: [20, 20],
//        iconAnchor: [25, 25]
//    });



    $('#projectCount').text(geoData.features.length)

    markerGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            removeOutsideVisibleBounds: true
        })
        dataLayer = L.geoJson(geoData, {
        pointToLayer: function (feature, latlng) {
//            var marker = L.marker(latlng, {icon: customer})
            var marker = L.marker(latlng, {icon: allFacility[feature.properties.status]})
            return marker
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.cartodb_id) {
                layer.on('click', function () {
                    displayInfo(feature)
                })
            }

        }

    })

    markerGroup.addLayer(dataLayer);
    map.fitBounds(dataLayer);
    map.addLayer(markerGroup);
}


//Add administrative boundaries to the map and symbolizes them
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
                "color": '#000080',
                "fillColor": '#80FFFFFF',
                "weight": 2.0,
                "opacity": 0.7,
                "fillOpacity": 0.05
            },
            'prefecture': {
                "clickable": true,
                "color": '#000080',
                "fillColor": '#80FFFFFF',
                "weight": 2.5,
                "opacity": 0.7,
                "fillOpacity": 0.05
            }
      }

    stateSelect = $('#state_scope').val()
    lgaSelect = $('#lga_scope').val()
    console.log("State_LGA: ", stateSelect+"  "+lgaSelect)
    nigeriaAdminLayer0 = L.geoJson(layers['nigeriaAdmin'], {
        style: layerStyles['admin0']
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

    //Zoom In to state level on selection
    if(state_layer != null)
             map.removeLayer(state_layer)

      state_layer = L.geoJson(layers['nigeriaAdmin1'], {
        filter: function(feature) {
          return feature.properties.StateName === stateSelect
      },
      style: layerStyles['region'],
      }).addTo(map)

//    state_layer.on('ready', function(e) {
//         map.fitBounds(state_layer.getBounds())
//    })
    console.log(state_layer)
    map.fitBounds(state_layer.getBounds())

    //Zoom In to LGA Level on selection

    if(lga_layer != null)
      map.removeLayer(lga_layer)

      lga_layer = L.geoJson(layers['nigeriaAdmin2'], {
        filter: function(feature) {
          return feature.properties.LGAName === lgaSelect
      },
      style: layerStyles['region'],
      }).addTo(map)

     map.fitBounds(lga_layer.getBounds())

    console.log("Zoom Level ",map.getZoom());
}

//Help attached counts of verious multiselection via query to the interface
function displayInfo(feature) {
    var infoContent = buildPopupContent(feature)
    $('#infoContent').html(infoContent)
}


//Normalizaes the data pull from carto by removing unwanted spaces and charater
function normalizeName(source) {
    source = source.replace("_", " ").replace('of_', ' of ')
    source = source.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    return source
}

//Help with popup information
function buildPopupContent(feature) {
    var subcontent = ''
    var propertyNames = ['state', 'lga', 'ward', 'officer_in_charge', 'phone_number', 'facility_name', 'facility_type', 'building_damage', 'status']
    for (var i = 0; i < propertyNames.length; i++) {
        subcontent = subcontent.concat('<p><strong>' + normalizeName(propertyNames[i]) + ': </strong>' + feature.properties[propertyNames[i]] + '</p>')

    }
    return subcontent;
}

function showLoader() {
    $('.fa-spinner').addClass('fa-spin')
    $('.fa-spinner').show()
}

function hideLoader() {
    $('.fa-spinner').removeClass('fa-spin')
    $('.fa-spinner').hide()
}


function getData(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addDataToMap(data)
        console.log('Data-Geo::  ', data);
    }).fail(function () {
        console.log("error!")
    });
}

function getAdminLayers() {
//    showLoader()
    var adminLayers = {}
    //Add Admin Layers to Map
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
/*triggerUiUpdate()*/













// another copy
var geoData = null, dataLayer = null, markerGroup = null,   
    country_layer = null, state_layer = null, lga_layer = null, ward_layer = null, bufferLayer = null, substance_layer = null,
    NGRAdmin2 = false,
    NGRLabels = [],
    googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']}),
    googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']}),
    osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),
    mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicy1jaGFuZCIsImEiOiJjaXdmcmtnc2QwMDBhMnltczBldmc1MHZuIn0.eIdXZvG0VOOcZhhoHpUQYA');

//Initiating and declaring leaflet map object
var map = L.map('map', {
    center: [9, 12],
    zoom: 6,
//    animation: true,
    zoomControl: false,
    layers: [osm],
    minZoom: 6.4,
    maxZoom: 22

});


// var baseMaps = {
//     "OSM": osm,
//     "Google Satelite": googleSat,
//     "Google Street": googleStreets,
//     "Map Box": mapbox
// };

 map.on('zoomend', function () {
// //   adjustLayerbyZoom(map.getZoom())

 })


new L.Control.Zoom({
position: 'bottomleft'
}).addTo(map);

// L.control.layers(baseMaps).addTo(map);

// L.control.scale({
//     position: 'bottomleft',
//     maxWidth: 100,
//     metric: true,
//     updateWhenIdle: true
// }).addTo(map);



// fetch('https://cdn.glitch.com/cfd5ad1b-e51e-4361-98e1-a5c6bc7852ba%2Fdata.geojson?v=1620565526825')
//     .then(function (response) {
//         return response.json();
//     })
//     .then(function (data) {
//         L.geoJson(data).bindPopup({data},).addTo(map);
//     });

//     map.fitBounds(dataLayer)



    // var markers = L.markerClusterGroup();
    // markers.addLayer(L.marker(feature.properties.location));
  
    // map.addLayer(markers);





    
//Add administrative boundaries to the map and symbolizes them
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
                "color": '#000080',
                "fillColor": '#80FFFFFF',
                "weight": 2.0,
                "opacity": 0.7,
                "fillOpacity": 0.05
            },
            'prefecture': {
                "clickable": true,
                "color": '#000080',
                "fillColor": '#80FFFFFF',
                "weight": 2.5,
                "opacity": 0.7,
                "fillOpacity": 0.05
            }
      }

    stateSelect = $('#state_scope').val()
    lgaSelect = $('#lga_scope').val()
    console.log("State_LGA: ", stateSelect+"  "+lgaSelect)
    nigeriaAdminLayer0 = L.geoJson(layers['nigeriaAdmin'], {
        style: layerStyles['admin0']
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


//Zoom In to state level on selection
    if(state_layer != null)
             map.removeLayer(state_layer)

      state_layer = L.geoJson(layers['nigeriaAdmin1'], {
        filter: function(feature) {
          return feature.properties.StateName === stateSelect
      },
      style: layerStyles['region'],
      }).addTo(map)

//    state_layer.on('ready', function(e) {
//         map.fitBounds(state_layer.getBounds())
//    })
    console.log(state_layer)
    map.fitBounds(state_layer.getBounds())

    //Zoom In to LGA Level on selection

    if(lga_layer != null)
      map.removeLayer(lga_layer)

      lga_layer = L.geoJson(layers['nigeriaAdmin2'], {
        filter: function(feature) {
          return feature.properties.LGAName === lgaSelect
      },
      style: layerStyles['region'],
      }).addTo(map)

     map.fitBounds(lga_layer.getBounds())

    console.log("Zoom Level ",map.getZoom());
}


let markersArray = {}; // create the associative array
// let magsArray = {}; // here hold the ids that correspond to the mags
// load GeoJSON from an external file
$.getJSON("https://cdn.glitch.com/cfd5ad1b-e51e-4361-98e1-a5c6bc7852ba%2Fdata.geojson?v=1620565526825", data => {

  L.geoJson(data, {

    // add GeoJSON layer to the map once the file is loaded
    pointToLayer: function(feature, latlng) {
      var mag = feature.properties.coordinates;
    //   var geojsonMarkerOptions = {
    //     opacity: 0.8,
    //     fillOpacity: 0.6,
    //     // here define the style using ternary operators for circles
    //     color: mag >= 4.0 ? 'red' : mag >= 3.0 ? 'orange' : mag >= 2.0 ? 'yellow' : 'black'
    //   };

      var myIcon = L.icon({
        iconUrl: 'location.svg',
        iconSize: [12, 24],
        iconAnchor: [6, 6],
      
    });

      markersArray[feature.id] = L.marker(latlng, {icon: myIcon})
          .addTo(map)
        .bindPopup(`
            <b>Organization:</b> ${feature.properties.name_of_organization} <br>
            <b>Location:</b> ${feature.properties.location} <br>
            <b>Services offered:</b> ${feature.properties.services_offered} <br>
            <b>Hours:</b> ${feature.properties.days_and_hours_of_operation} <br>
            <b>Contact:</b> ${feature.properties.contact_phone_number}`, {
        closeButton: true,
        offset: L.point(0, -2)
      });
     
      // here record the mags
    //   magsArray[feature.id] = feature.properties.name_of_organization;
      
      return L.marker(latlng, {icon: myIcon});
    },
  });

//   let markup = '';
//   for (let i in markersArray) {
//   console.log(markersArray[i]);
//     markup += `<a href="#" onclick="markersArray['${i}'].openPopup()"><b>${magsArray[i]} Mag</b></a><br/>`
//   }
//   document.getElementById('anchors').innerHTML = markup;
});
// End of geojson Data

function getAdminLayers() {
//    showLoader()
    var adminLayers = {}
    //Add Admin Layers to Map
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
/*triggerUiUpdate()*/
