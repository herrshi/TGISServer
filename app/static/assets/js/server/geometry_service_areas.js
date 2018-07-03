/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/Map", "esri/config", "esri/views/MapView", "esri/Basemap", "esri/layers/TileLayer", "esri/widgets/Home", "esri/views/2d/draw/Draw"], function (require, exports, __extends, __decorate, EsriMap, EsriConfig, MapView, Basemap, TileLayer, HomeWidget, Draw) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (window["config"].GIS_PROXY) {
        EsriConfig.request.proxyUrl = window["config"].GIS_PROXY;
    }
    var basemap = new Basemap({
        baseLayers: [
            new TileLayer({
                url: "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"
            })
        ]
    });
    var map = new EsriMap({
        basemap: basemap
    });
    var view = new MapView({
        container: "mapViewDiv",
        map: map,
        zoom: 16,
        center: [121.414, 31.242677]
    });
    view.ui.remove("attribution");
    var homeWidget = new HomeWidget({
        view: view
    });
    view.ui.add(homeWidget, "top-left");
    var draw;
    view.when(function () {
        draw = new Draw({
            view: view
        });
    });
});
//# sourceMappingURL=geometry_service_areas.js.map