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


new ol.Map({
  keyboardEventTarget: document,
  layers: [
    new ol.layer.Tile({
      source: new ol.source.TileWMS({
        projection: 'EPSG:4326',
        url: 'http://demo.boundlessgeo.com/geoserver/wms',
        params: {
          'LAYERS': 'ne:NE1_HR_LC_SR_W_DR'
        }
      })
    })
  ],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    resolutions: [65536, 32768, 16384, 8192, 4096, 2048],
    zoom: 0
  })
});
