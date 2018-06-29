/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import EsriMap = require("esri/Map");
import EsriConfig = require("esri/config");
import MapView = require("esri/views/MapView");
import Basemap = require("esri/Basemap");
import TileLayer = require("esri/layers/TileLayer");
import HomeWidget = require("esri/widgets/Home");
import Draw = require("esri/views/2d/draw/Draw");


if (window["config"].GIS_PROXY) {
  EsriConfig.request.proxyUrl = window["config"].GIS_PROXY;
}

const basemap = new Basemap({
  baseLayers: [
    new TileLayer({
      url:
        "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"
    })
  ]
});
const map = new EsriMap({
  basemap: basemap
});

const view = new MapView({
  container: "mapViewDiv",
    map: map,
    zoom: 16,
    center: [121.414, 31.242677]
});
view.ui.remove("attribution");

const homeWidget = new HomeWidget({
  view: view
});
view.ui.add(homeWidget, "top-left");

let draw;
view.when(() => {
  draw = new Draw({
    view: view
  });
});


