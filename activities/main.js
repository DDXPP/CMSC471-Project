var map = d3.select('#map');
var mapWidth = +map.attr('width');
var mapHeight = +map.attr('height');

var activeMapType = 'nodes_only';

var nodeFeatures = [];
var nodesAffectingLandObjects = [];
var nodesAffectingLandObjectsDistinctNames = [];
var stormsAffectingLandObjects = [];

var atlLatLng = new L.LatLng(33.52076, -55.06337);
var myMap = L.map('map').setView(atlLatLng, 3.5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
         {
           maxZoom: 10,
           minZoom: 3,
           attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
             }).addTo(myMap);

var svgLayer = L.svg();
svgLayer.addTo(myMap);

var svg = d3.select('#map').select('svg');
var nodeLinkG = svg.select('g')
    .attr('class', 'leaflet-zoom-hide');

var nodesAffectingLandG = svg.select('g')
    .attr('class', 'leaflet-zoom-hide');


//-----------------------------------------------------------------------------
Promise.all([
    d3.csv('stormz.csv', function(row) {
        var node = {v_id: +row['v_id'], name: row['name'], LatLng: [+row['lat'], +row['long']], status: row['status'],
           wind: +row['wind'], pressure: +row['pressure'], category: +row['category'], NameYear: [row['name']+row['year']]};
       // vertices.set(node.v_id, node);
       node.linkCount = 0;
       nodeFeatures.push(turf.point([+row['long'], +row['lat']], node));
       return node;

    }),
    d3.json('poly_final.json')//geojson
]).then(function(data) {
    var nodes = data[0];
    var states = data[1];
    readyToDraw(nodes, states)
});

//-----------------------------------------------------------------------------
function readyToDraw(nodes, states) {
    var colorScale = d3.scaleLinear().domain([-1,5]).range(["#ed6925","#000004","#1b0c41","#4a0c6b","#781c6d","#a52c60","#cf4446"]);
    var radiusScale = d3.scaleLinear().range([3,5]).domain([-1,5]);

    var nodeCollection = turf.featureCollection(nodeFeatures);

    //-------------------------------------------------------------
    var poly0 = turf.polygon(states.features[0].geometry.coordinates)
    var poly1 = turf.polygon(states.features[1].geometry.coordinates)
    var poly2 = turf.polygon(states.features[2].geometry.coordinates)
    var poly3 = turf.polygon(states.features[3].geometry.coordinates)
    var poly4 = turf.polygon(states.features[4].geometry.coordinates)

    nodes.forEach(function (n) {
        var pointTemp = turf.point([n.LatLng[1],n.LatLng[0]])
        if (turf.inside(pointTemp,poly0) ||
            turf.inside(pointTemp,poly1) || 
            turf.inside(pointTemp,poly2) ||
            turf.inside(pointTemp,poly3) ||
            turf.inside(pointTemp,poly4)) {
                nodesAffectingLandObjects.push(n);
            }
    });

    //-------------------------------------------------------------
    //-------------------------------------------------------------
    // Using both name and year of the storm since there are storms with duplicated names
    for (var i = 0; i < nodesAffectingLandObjects.length; i++) {
        nameTemp = nodesAffectingLandObjects[i].NameYear[0];
        if (!nodesAffectingLandObjectsDistinctNames.includes(nameTemp)) {
            nodesAffectingLandObjectsDistinctNames.push(nameTemp);
        }
    };

    nodes.forEach(function (n) {
        if (nodesAffectingLandObjectsDistinctNames.includes(n.NameYear[0])) {
            stormsAffectingLandObjects.push(n);
        }
    });

    //-------------------------------------------------------------
    
    //-------------------------------------------------------------
    var bbox = turf.bbox(nodeCollection);
    var cellSize = 250;
    var options = {units: 'kilometers'};

    var triangleGrid = turf.triangleGrid(bbox, cellSize, options);
    var triangleBins = turf.collect(triangleGrid, nodeCollection, 'v_id', 'values');
    triangleBins.features = triangleBins.features.filter(function(d){
        return d.properties.values.length > 0;
    });

    // Triangle style
    triangleExtent = d3.extent(triangleBins.features, function(d){
        return d.properties.values.length;
    });
    var triangleScale = d3.scaleSequential(d3.interpolateMagma)
        .domain(triangleExtent.reverse());
    
    var triangleStyle = function(f) {
        return {
            weight: 0.5,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7,
            fillColor: triangleScale(f.properties.values.length)
        }
    };

    triangleLayer = L.geoJson(triangleBins, {style: triangleStyle});
    //-------------------------------------------------------------
    //-------------------------------------------------------------
    statesLayer = L.geoJson(states);
    statesLayer.addTo(myMap);
    //-------------------------------------------------------------
    //-------------------------------------------------------------
    nodesAffectingLandG.selectAll('.grid-node')
        .data(nodesAffectingLandObjects)
        .enter().append('circle')
        .attr('class', 'grid-node')
        .style('fill', function(d){
            return colorScale(d['category']);
        })
        .style('fill-opacity', 0.6)
        .attr('r', function(d) {
            return radiusScale(d.category);
        });
    
    //-------------------------------------------------------------
    //-------------------------------------------------------------
    nodeLinkG.selectAll('.grid-node')
        .data(nodes)
        .enter().append('circle')
        .attr('class', 'grid-node')
        .style('fill', function(d){
           return colorScale(d['category']);
        })
        .style('fill-opacity', 0.6)
        .attr('r', function(d) {
           return radiusScale(d.category);
        });

    //-------------------------------------------------------------
   
    myMap.on('zoomend', updateLayers);
    updateLayers();
}


//-----------------------------------------------------------------------------
function updateLayers() {
    nodeLinkG.selectAll('.grid-node')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
    nodesAffectingLandG.selectAll('.grid-node')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
};


//-----------------------------------------------------------------------------
d3.selectAll('.btn-group > .btn.btn-secondary')
    .on('click', function() {
        var newMapType = d3.select(this).attr('data-type');

        d3.selectAll('.btn.btn-secondary.active').classed('active', false);

        cleanUpMap(activeMapType);
        showOnMap(newMapType);

        activeMapType = newMapType;
    });
    
function cleanUpMap(type) {
    switch(type) {
        case 'cleared':
            break;
        case 'nodes_only':
            nodeLinkG.attr('visibility', 'hidden');
            break;
        case 'states':
            myMap.removeLayer(statesLayer);
            break;
        case 'triangle_bins':
            myMap.removeLayer(triangleLayer);
            break;
        case 'affecting_land_nodes':
            nodesAffectingLandG.attr('visibility', 'hidden');
            break;
        case 'affecting_land_storms':
            break;

    }
}

function showOnMap(type) {
    switch(type) {
        case 'cleared':
            break;
        case 'nodes_only':
            nodeLinkG.attr('visibility', 'visible');
            statesLayer.addTo(myMap);
            break;
        case 'triangle_bins':
            triangleLayer.addTo(myMap);
            break;
        case 'affecting_land_nodes':
            nodesAffectingLandG.attr('visibility', 'visible');
            break;
        case 'affecting_land_storms':
            break;


    }
}
