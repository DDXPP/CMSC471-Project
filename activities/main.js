var map = d3.select('#map');
var mapWidth = +map.attr('width');
var mapHeight = +map.attr('height');

var vertices = d3.map();
var activeMapType = 'nodes_links';

var atlLatLng = new L.LatLng(33.7771, -84.3900);
var myMap = L.map('map').setView(atlLatLng, 5);

var nodeFeatures = [];
var choroScale = d3.scaleThreshold()
	.domain([10,20,50,100,200,500,1000])
	.range(d3.schemeYlOrRd[8]);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	     {
	       maxZoom: 10,
	       minZoom: 3,
	       attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
             }).addTo(myMap);

