/*global ol*/

var map1 = new ol.Map({
  target: 'map1',
  view: new ol.View({
    center: [0, 0],
    zoom: 1,
  }),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.TileWMS({
        projection: 'EPSG:4326',
        url: 'https://ahocevar.com/geoserver/wms',
        params: {
          'LAYERS': 'ne:NE1_HR_LC_SR_W_DR'
        }
      })
    })
  ]
});

new ol.Graticule({
  map: map1
});

//create ellipse polygon
var circle = new ol.geom.Circle([8e6,8e6], 3e6);
var circlePoly = ol.geom.Polygon.fromCircle(circle, 15);

var squarePoly = new ol.geom.Polygon();
squarePoly.appendLinearRing(new ol.geom.LinearRing([[5e6, 5e6], [5e6, -5e6], [-5e6, -5e6], [-5e6, 5e6]]));

var squareLinearRing = squarePoly.getLinearRing(0);
squareLinearRing.scale(.5,.25);
squarePoly.appendLinearRing(squareLinearRing);


var vectorSource = new ol.source.Vector({
features: [
    new ol.Feature(circlePoly),
    new ol.Feature(squarePoly),
  ]
});

var vectorLayer = new ol.layer.Vector({
  source: vectorSource
});

map1.addLayer(vectorLayer);



var countrySource = new ol.source.Vector({
  url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries-110m.geojson',
  format: new ol.format.GeoJSON()
});

var countryLayer =  new ol.layer.Vector({
  source: countrySource,
  style: function(feature) {
      return new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'lightgray'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(256,0,0,.7)'
        })
      });
    }
});

proj4.defs('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 ' +
  '+b=6371000 +units=m +no_defs');
var sphereMollweideProjection = new ol.proj.Projection({
code: 'ESRI:53009',
extent: [-18000000, -9100000,
  18000000, 9200000],
worldExtent: [-179, -89.99, 179, 89.99]
});

var map2 = new ol.Map({
  keyboardEventTarget: document,
  layers: [countryLayer],
  target: 'map2',
  view: new ol.View({
    center: [0, 0],
    projection: sphereMollweideProjection,
    zoom: 1
  })
});

map2.addInteraction(new ol.interaction.Modify({
  source: countrySource
}));

map2.addInteraction(new ol.interaction.Draw({
  type: 'Polygon',
  source: countrySource
}));

map2.addInteraction(new ol.interaction.Snap({
  source: countrySource
}));
