/*global ol proj4*/

//create and configure Sphere Mollweide projection
proj4.defs('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 ' +
  '+b=6371000 +units=m +no_defs');
var sphereMollweideProjection = new ol.proj.Projection({
code: 'ESRI:53009',
extent: [-18000000, -9100000,
  18000000, 9200000],
worldExtent: [-179, -89.99, 179, 89.99]
});

var map = new ol.Map({
  keyboardEventTarget: document,
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
  ],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    projection: sphereMollweideProjection,
    resolutions: [65536, 32768, 16384, 8192, 4096, 2048],
    zoom: 0
  })
});

//add country outlines
var countryOutlineSource = new ol.source.Vector({
  url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries-110m.geojson',
  format: new ol.format.GeoJSON()
});
var countryOutlineVector =  new ol.layer.Vector({
    source: countryOutlineSource,
    style: function(feature) {
      return new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0,0,0,0)'
        }),
        stroke: new ol.style.Stroke({
          color: '#3399CC',
          width: 1.5
        })
      });
    }
  });
map.addLayer(countryOutlineVector);

//create ellipse polygon
var circle = new ol.geom.Circle([0,0], 9e6);
var circlePoly = ol.geom.Polygon.fromCircle(circle, 360);
var circleLinearRing = circlePoly.getLinearRing(0);
circleLinearRing.scale(2,1);

var maskPolygon = new ol.geom.Polygon();
maskPolygon.appendLinearRing(new ol.geom.LinearRing([[-20e6, -10e6], [-20e6, 10e6], [20e6, 10e6], [20e6, -10e6]]));
maskPolygon.appendLinearRing(circleLinearRing);

var maskVectorSource = new ol.source.Vector({
features: [
    new ol.Feature(maskPolygon)
  ]
});

var maskVectorLayer = new ol.layer.Vector({
  source: maskVectorSource,
  style: function(feature) {
      return new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'white'
        }),
        stroke: new ol.style.Stroke({
          color: 'white'
        })
      });
    }
});

map.addLayer(maskVectorLayer);

const source = new ol.source.Vector();
        
const layer = new ol.layer.Vector({
  source: source
});
map.addLayer(layer);

map.addInteraction(new ol.interaction.Modify({
  source: source
}));

map.addInteraction(new ol.interaction.Draw({
  type: 'Polygon',
  source: source
}));

map.addInteraction(new ol.interaction.Snap({
  source: source
}));

map.addInteraction(new ol.interaction.Snap({
  source: countryOutlineSource
}));

new ol.Graticule({
  map: map
});