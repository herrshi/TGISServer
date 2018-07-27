/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/Map", "esri/views/MapView", "esri/Basemap", "esri/layers/TileLayer", "esri/layers/GraphicsLayer", "esri/widgets/Home", "esri/views/2d/draw/Draw", "esri/Graphic", "esri/geometry/support/webMercatorUtils", "esri/config", "../map/coordTransform"], function (require, exports, __extends, __decorate, EsriMap, MapView, Basemap, TileLayer, GraphicsLayer, HomeWidget, Draw, Graphic, webMercatorUtils, esriConfig, coordTransform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Map {
        constructor(divName) {
            this.drawLayer = new GraphicsLayer();
            this.rootDiv = divName;
            if (window.config.GIS_PROXY) {
                //允许跨域
                esriConfig.request.proxyUrl = window.config.GIS_PROXY;
            }
        }
        createMap() {
            return new Promise(resolve => {
                const basemap = new Basemap({
                    baseLayers: [
                        new TileLayer({
                            url: "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"
                        })
                    ]
                });
                const map = new EsriMap({
                    basemap: basemap,
                    layers: [this.drawLayer]
                });
                this.mapView = new MapView({
                    container: this.rootDiv,
                    map: map,
                    zoom: 16,
                    center: [121.414, 31.242677]
                });
                this.mapView.ui.remove("attribution");
                const homeWidget = new HomeWidget({
                    view: this.mapView
                });
                this.mapView.ui.add(homeWidget, "top-left");
                this.mapView.when(() => {
                    this.draw = new Draw({
                        view: this.mapView
                    });
                    resolve();
                });
            });
        }
        /**
         * @param {string} drawType - 绘制类型
         *   point
         *   polyline
         *   polygon
         *   circle
         * @return {Promise} - 返回绘制的Geometry
         * */
        startDraw(drawType) {
            return new Promise(resolve => {
                const action = this.draw.create(drawType, {
                    mode: "click"
                });
                action.on("vertex-add", event => {
                    createPolygonGraphic(event);
                });
                action.on("vertex-remove", event => {
                    createPolygonGraphic(event);
                });
                action.on("cursor-update", event => {
                    createPolygonGraphic(event);
                });
                action.on("draw-complete", event => {
                    createPolygonGraphic(event);
                });
                let createPolygonGraphic = (event) => {
                    const vertices = event.vertices;
                    //清除临时graphic
                    this.mapView.graphics.removeAll();
                    let geometry;
                    switch (drawType) {
                        case "polyline":
                            geometry = {
                                type: "polyline",
                                paths: vertices,
                                spatialReference: this.mapView.spatialReference
                            };
                            break;
                        case "polygon":
                            geometry = {
                                type: "polygon",
                                rings: vertices,
                                spatialReference: this.mapView.spatialReference
                            };
                            break;
                    }
                    const graphic = new Graphic({
                        geometry: geometry,
                        symbol: {
                            type: "simple-fill",
                            color: [178, 102, 234, 0.8],
                            style: "solid",
                            outline: {
                                type: "simple-line",
                                color: [4, 90, 141],
                                width: 4,
                                cap: "round",
                                join: "round"
                            }
                        }
                    });
                    if (event.type === "draw-complete") {
                        //绘制完成以后加入GraphicsLayer
                        //并通过promise返回geometry对象
                        this.drawLayer.add(graphic);
                        let resultGeometry = graphic.geometry;
                        //投影坐标=>地理坐标
                        if (this.mapView.spatialReference.isWebMercator) {
                            resultGeometry = webMercatorUtils.webMercatorToGeographic(graphic.geometry);
                        }
                        switch (drawType) {
                            case "polygon":
                                const polygon = resultGeometry.toJSON();
                                //纠偏, gcj02=>wgs84
                                const transformed = coordTransform_1.CoordTransform.transformPolygon("gcj02", "wgs84", polygon);
                                resolve(transformed);
                                break;
                        }
                    }
                    else {
                        this.mapView.graphics.add(graphic);
                    }
                };
            });
        }
        clearDraw() {
            this.drawLayer.removeAll();
        }
    }
    exports.Map = Map;
});
//# sourceMappingURL=map.js.map