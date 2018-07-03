/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/Map", "esri/views/MapView", "esri/Basemap", "esri/layers/TileLayer", "esri/widgets/Home", "esri/views/2d/draw/Draw"], function (require, exports, __extends, __decorate, EsriMap, MapView, Basemap, TileLayer, HomeWidget, Draw) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Map = /** @class */ (function () {
        function Map(divName) {
            var _this = this;
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
            this.view = new MapView({
                container: divName,
                map: map,
                zoom: 16,
                center: [121.414, 31.242677]
            });
            this.view.ui.remove("attribution");
            var homeWidget = new HomeWidget({
                view: this.view
            });
            this.view.ui.add(homeWidget, "top-left");
            this.view.when(function () {
                _this.draw = new Draw({
                    view: _this.view
                });
            });
        }
        Map.prototype.startDraw = function (drawType) {
            var action = this.draw.create(drawType, {
                mode: "click"
            });
        };
        Map.prototype._addGraphic = function () {
        };
        return Map;
    }());
    exports.Map = Map;
});
//# sourceMappingURL=map.js.map