var map = d3.select('#map');
var mapWidth = +map.attr('width');
var mapHeight = +map.attr('height');

var activeMapType = 'nodes_only';
var activeDecade = 'all-time'

var nodeFeatures = [];
var nodesAffectingLandObjects = [];
var nodesAffectingLandObjectsDistinctNames = [];
var stormsAffectingLandObjects = [];

var nodes_before_1979 = []
var nodes_1980_1989 = []
var nodes_1990_1999 = []
var nodes_2000_2009 = []
var nodes_after_2010 = []

var storms_before_1979 = []
var storms_1980_1989 = []
var storms_1990_1999 = []
var storms_2000_2009 = []
var storms_after_2010 = []



var atlLatLng = new L.LatLng(33.52076, -55.06337);
var myMap = L.map('map').setView(atlLatLng, 3.5);


L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            minZoom:3,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(myMap);



var svgLayer = L.svg();
svgLayer.addTo(myMap);

var svg = d3.select('#map').select('svg');
var nodeLinkG = svg.select('g')
    .attr('class', 'leaflet-zoom-hide');

//-----------------------------------------------------------------------------
Promise.all([
    d3.csv('stormz.csv', function(row) {
        var node = {v_id: +row['v_id'], name: row['name'], LatLng: [+row['lat'], +row['long']], status: row['status'],
           wind: +row['wind'], pressure: +row['pressure'], category: +row['category'], year: +row['year'], NameYear: [row['name']+row['year']]};
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
    var radiusScale = d3.scaleLinear().domain([-1,5]).range([3,5]);
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
    nodes.forEach(function (n) {
        if (n.year <=1979) {
            nodes_before_1979.push(n);
        }
    
    });

    nodes.forEach(function (n) {
        if (n.year >= 1980 && n.year <=1989) {
            nodes_1980_1989.push(n);
        }
    
    });

    nodes.forEach(function (n) {
        if (n.year >= 1990 && n.year <=1999) {
            nodes_1990_1999.push(n);
        }
    
    });

    nodes.forEach(function (n) {
        if (n.year >= 2000 && n.year <=2009) {
            nodes_2000_2009.push(n);
        }
    
    });

    nodes.forEach(function (n) {
        if (n.year >= 2010) {
            nodes_after_2010.push(n);
        }
    
    });

    //------------------------------------------------------

    stormsAffectingLandObjects.forEach(function (n) {
        if (n.year <=1979) {
            storms_before_1979.push(n);
        }
    
    });

    stormsAffectingLandObjects.forEach(function (n) {
        if (n.year >= 1980 && n.year <=1989) {
            storms_1980_1989.push(n);
        }
    
    });

    stormsAffectingLandObjects.forEach(function (n) {
        if (n.year >= 1990 && n.year <=1999) {
            storms_1990_1999.push(n);
        }
    
    });

    stormsAffectingLandObjects.forEach(function (n) {
        if (n.year >= 2000 && n.year <=2009) {
            storms_2000_2009.push(n);
        }
    
    });

    stormsAffectingLandObjects.forEach(function (n) {
        if (n.year >= 2010) {
            storms_after_2010.push(n);
        }
    
    });


    //-------------------------------------------------------------
    //-------------------------------------------------------------

    


    
    //-------------------------------------------------------------
    //-------------------------------------------------------------
    //-------------------------------------------------------------
    //-------------------------------------------------------------
    //------------------------------------------------------------- 
    //-------------------------------------------------------------
    //-------------------------------------------------------------    



    nodeLinkG.selectAll('.node-normal')
    .data(nodes)
    .enter().append('circle')
    .attr('class', 'node-normal')
    .style('fill', function(d){
       return colorScale(d['category']);
    })
    .style('fill-opacity', 0.7)
    .attr('r', function(d) {
       return radiusScale(d.category);
    });
    // nodeLinkG.selectAll('.node-normal').attr('visibility', 'visible');
    


    nodeLinkG.selectAll('.node-land')
        .data(nodesAffectingLandObjects)
        .enter().append('circle')
        .attr('class', 'node-land')
        .style('fill', function(d){
           return colorScale(d['category']);
        })
        .style('fill-opacity', 0.7)
        .attr('r', function(d) {
           return radiusScale(d.category);
        });
    nodeLinkG.selectAll('.node-land').attr('visibility', 'hidden');



    nodeLinkG.selectAll('.storm-land')
        .data(stormsAffectingLandObjects)
        .enter().append('circle')
        .attr('class', 'storm-land')
        .style('fill', function(d){
           return colorScale(d['category']);
        })
        .style('fill-opacity', 0.7)
        .attr('r', function(d) {
           return radiusScale(d.category);
        });
    nodeLinkG.selectAll('.storm-land').attr('visibility', 'hidden');

    //--------------------------------------------------------------
    nodeLinkG.selectAll('.node-1979')
        .data(nodes_before_1979)
        .enter().append('circle')
        .attr('class', 'node-1979')
        .style('fill', function(d){
        return colorScale(d['category']);
        })
        .style('fill-opacity', 0.7)
        .attr('r', function(d) {
        return radiusScale(d.category);
        });
    nodeLinkG.selectAll('.node-1979').attr('visibility', 'hidden');


    nodeLinkG.selectAll('.node-1980-1989')
        .data(nodes_1980_1989)
        .enter().append('circle')
        .attr('class', 'node-1980-1989')
        .style('fill', function(d){
        return colorScale(d['category']);
        })
        .style('fill-opacity', 0.7)
        .attr('r', function(d) {
        return radiusScale(d.category);
        });
    nodeLinkG.selectAll('.node-1980-1989').attr('visibility', 'hidden');


    nodeLinkG.selectAll('.node-1990-1999')
        .data(nodes_1990_1999)
        .enter().append('circle')
        .attr('class', 'node-1990-1999')
        .style('fill', function(d){
        return colorScale(d['category']);
        })
        .style('fill-opacity', 0.7)
        .attr('r', function(d) {
        return radiusScale(d.category);
        });
    nodeLinkG.selectAll('.node-1990-1999').attr('visibility', 'hidden');

    nodeLinkG.selectAll('.node-2000-2009')
        .data(nodes_2000_2009)
        .enter().append('circle')
        .attr('class', 'node-2000-2009')
        .style('fill', function(d){
        return colorScale(d['category']);
        })
        .style('fill-opacity', 0.7)
        .attr('r', function(d) {
        return radiusScale(d.category);
        });
    nodeLinkG.selectAll('.node-2000-2009').attr('visibility', 'hidden');

    nodeLinkG.selectAll('.node-2010')
        .data(nodes_after_2010)
        .enter().append('circle')
        .attr('class', 'node-2010')
        .style('fill', function(d){
        return colorScale(d['category']);
        })
        .style('fill-opacity', 0.7)
        .attr('r', function(d) {
        return radiusScale(d.category);
        });
    nodeLinkG.selectAll('.node-2010').attr('visibility', 'hidden');

    //--------------------------------------------------------------
    nodeLinkG.selectAll('.node-1979-land-storm')
    .data(storms_before_1979)
    .enter().append('circle')
    .attr('class', 'node-1979-land-storm')
    .style('fill', function(d){
    return colorScale(d['category']);
    })
    .style('fill-opacity', 0.7)
    .attr('r', function(d) {
    return radiusScale(d.category);
    });
    nodeLinkG.selectAll('.node-1979-land-storm').attr('visibility', 'hidden');


    nodeLinkG.selectAll('.node-1980-1989-land-storm')
    .data(storms_1980_1989)
    .enter().append('circle')
    .attr('class', 'node-1980-1989-land-storm')
    .style('fill', function(d){
    return colorScale(d['category']);
    })
    .style('fill-opacity', 0.7)
    .attr('r', function(d) {
    return radiusScale(d.category);
    });
    nodeLinkG.selectAll('.node-1980-1989-land-storm').attr('visibility', 'hidden');


    nodeLinkG.selectAll('.node-1990-1999-land-storm')
    .data(storms_1990_1999)
    .enter().append('circle')
    .attr('class', 'node-1990-1999-land-storm')
    .style('fill', function(d){
    return colorScale(d['category']);
    })
    .style('fill-opacity', 0.7)
    .attr('r', function(d) {
    return radiusScale(d.category);
    });
    nodeLinkG.selectAll('.node-1990-1999-land-storm').attr('visibility', 'hidden');

    nodeLinkG.selectAll('.node-2000-2009-land-storm')
    .data(storms_2000_2009)
    .enter().append('circle')
    .attr('class', 'node-2000-2009-land-storm')
    .style('fill', function(d){
    return colorScale(d['category']);
    })
    .style('fill-opacity', 0.7)
    .attr('r', function(d) {
    return radiusScale(d.category);
    });
    nodeLinkG.selectAll('.node-2000-2009-land-storm').attr('visibility', 'hidden');

    nodeLinkG.selectAll('.node-2010-land-storm')
    .data(storms_after_2010)
    .enter().append('circle')
    .attr('class', 'node-2010-land-storm')
    .style('fill', function(d){
    return colorScale(d['category']);
    })
    .style('fill-opacity', 0.7)
    .attr('r', function(d) {
    return radiusScale(d.category);
    });
    nodeLinkG.selectAll('.node-2010-land-storm').attr('visibility', 'hidden');
    //-------------------------------------------------------------
    //-------------------------------------------------------------
    statesLayer = L.geoJson(states);
    statesLayer.addTo(myMap);
    //-------------------------------------------------------------
    myMap.on('zoomend', updateLayers);
    updateLayers();
}


//-----------------------------------------------------------------------------
function updateLayers() {
    nodeLinkG.selectAll('.node-normal')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
    nodeLinkG.selectAll('.node-land')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
    nodeLinkG.selectAll('.storm-land')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})


       nodeLinkG.selectAll('.node-1979')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
       nodeLinkG.selectAll('.node-1980-1989')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
       nodeLinkG.selectAll('.node-1990-1999')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
       nodeLinkG.selectAll('.node-2000-2009')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
       nodeLinkG.selectAll('.node-2010')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})

       nodeLinkG.selectAll('.node-1979-land-storm')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
       nodeLinkG.selectAll('.node-1980-1989-land-storm')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
       nodeLinkG.selectAll('.node-1990-1999-land-storm')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
       nodeLinkG.selectAll('.node-2000-2009-land-storm')
       .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
       .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
       nodeLinkG.selectAll('.node-2010-land-storm')
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
        console.log(activeDecade)
        console.log(activeMapType)
    });
    
function cleanUpMap(type) {
    // switch(type) {
    //     case 'nodes_only':
    //         nodeLinkG.selectAll('.node-normal').attr('visibility', 'hidden');
    //         break;
    //     case 'affecting_land_storms':
    //         nodeLinkG.selectAll('.storm-land').attr('visibility', 'hidden');
    //         break;
    // }
    nodeLinkG.selectAll('.node-normal').attr('visibility', 'hidden');
    nodeLinkG.selectAll('.storm-land').attr('visibility', 'hidden');
    nodeLinkG.selectAll('.node-1979').attr('visibility', 'hidden');
    nodeLinkG.selectAll('.node-1980-1989').attr('visibility', 'hidden');
    nodeLinkG.selectAll('.node-1990-1999').attr('visibility', 'hidden');
    nodeLinkG.selectAll('.node-2000-2009').attr('visibility', 'hidden');
    nodeLinkG.selectAll('.node-2010').attr('visibility', 'hidden');

    nodeLinkG.selectAll('.node-1979-land-storm').attr('visibility', 'hidden');
    nodeLinkG.selectAll('.node-1980-1989-land-storm').attr('visibility', 'hidden');
    nodeLinkG.selectAll('.node-1990-1999-land-storm').attr('visibility', 'hidden');
    nodeLinkG.selectAll('.node-2000-2009-land-storm').attr('visibility', 'hidden');
    nodeLinkG.selectAll('.node-2010-land-storm').attr('visibility', 'hidden');
}

function showOnMap(type) {

    switch(type) {
        case 'nodes_only':
            if (activeDecade == 'all-time') {
                statesLayer.addTo(myMap);
                nodeLinkG.selectAll('.node-normal').attr('visibility', 'visible');
            } else if (activeDecade == 'before-1979') {
                nodeLinkG.selectAll('.node-1979').attr('visibility', 'visible');
            } else if (activeDecade == '1980-1989') {
                nodeLinkG.selectAll('.node-1980-1989').attr('visibility', 'visible');
            } else if (activeDecade == '1990-1999') {
                nodeLinkG.selectAll('.node-1990-1999').attr('visibility', 'visible');
            } else if (activeDecade == '2000-2009') {
                nodeLinkG.selectAll('.node-2000-2009').attr('visibility', 'visible');
            } else {
                nodeLinkG.selectAll('.node-2010').attr('visibility', 'visible');
            }
            break;
        case 'affecting_land_storms':
            if (activeDecade == 'all-time') {
                statesLayer.addTo(myMap);
                nodeLinkG.selectAll('.storm-land').attr('visibility', 'visible');
            } else if (activeDecade == 'before-1979') {
                nodeLinkG.selectAll('.node-1979-land-storm').attr('visibility', 'visible');
            } else if (activeDecade == '1980-1989') {
                nodeLinkG.selectAll('.node-1980-1989-land-storm').attr('visibility', 'visible');
            } else if (activeDecade == '1990-1999') {
                nodeLinkG.selectAll('.node-1990-1999-land-storm').attr('visibility', 'visible');

            } else if (activeDecade == '2000-2009') {
                nodeLinkG.selectAll('.node-2000-2009-land-storm').attr('visibility', 'visible');
            } else {
                nodeLinkG.selectAll('.node-2010-land-storm').attr('visibility', 'visible');
            }
            break;
    }
    
}


// filter by year and category 

function onDecadeChanged() {
    var select = d3.select('#decadeSelect').node();
    // Get current value of select element
    var newDecade = select.options[select.selectedIndex].value;

    d3.selectAll('.btn.btn-secondary.active').classed('active', false);


    cleanUpMap(activeDecade);
    if (activeMapType = 'nodes_only') {
        showOnMapAllNodes(newDecade);
    }
    else {
        showOnMapAffected(newDecade);
    }

    activeDecade = newDecade
    console.log(activeDecade)
    console.log(activeMapType)
}

function showOnMapAllNodes(activeDecade) {
    switch(activeDecade) {
        case 'all-time':
            statesLayer.addTo(myMap);
            nodeLinkG.selectAll('.node-normal').attr('visibility', 'visible');
            break;

        case 'before-1979':
            nodeLinkG.selectAll('.node-1979').attr('visibility', 'visible');
            break;
        case '1980-1989':
            nodeLinkG.selectAll('.node-1980-1989').attr('visibility', 'visible');
            break;
        case '1990-1999':
            nodeLinkG.selectAll('.node-1990-1999').attr('visibility', 'visible');
            break;
        case '2000-2009':
            nodeLinkG.selectAll('.node-2000-2009').attr('visibility', 'visible');
            break;
        case 'after-2010':
            nodeLinkG.selectAll('.node-2010').attr('visibility', 'visible');
            break;

    }
}

function showOnMapAffected(activeDecade) {
    switch(activeDecade) {
        case 'all-time':
            nodeLinkG.selectAll('.storm-land').attr('visibility', 'visible');
            break;

        case 'before-1979':
            nodeLinkG.selectAll('.node-1979-land-storm').attr('visibility', 'visible');
            break;
        case '1980-1989':
            nodeLinkG.selectAll('.node-1980-1989-land-storm').attr('visibility', 'visible');
            break;
        case '1990-1999':
            nodeLinkG.selectAll('.node-1990-1999-land-storm').attr('visibility', 'visible');
            break;
        case '2000-2009':
            nodeLinkG.selectAll('.node-2000-2009-land-storm').attr('visibility', 'visible');
            break;
        case 'after-2010':
            nodeLinkG.selectAll('.node-2010-land-storm').attr('visibility', 'visible');
            break;
    }
}