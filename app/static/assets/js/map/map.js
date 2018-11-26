/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/Map", "esri/views/MapView", "esri/Basemap", "esri/layers/TileLayer", "esri/layers/GraphicsLayer", "esri/widgets/Home", "esri/views/2d/draw/Draw", "esri/Graphic", "esri/geometry/support/webMercatorUtils", "esri/config", "../map/coordTransform"], function (require, exports, __extends, __decorate, EsriMap, MapView, Basemap, TileLayer, GraphicsLayer, HomeWidget, Draw, Graphic, webMercatorUtils, esriConfig, coordTransform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Map {
        constructor(divName) {
            this.drawLayer = new GraphicsLayer();
            this.overlayLayer = new GraphicsLayer();
            this.defaultPointSymbol = {
                type: "simple-marker",
                style: "square",
                color: "red",
                size: "16px",
                outline: {
                    color: [255, 255, 0],
                    width: 3
                }
            };
            this.defaultPolylineSymbol = {
                type: "simple-line",
                color: [4, 90, 141],
                width: 4,
                cap: "round",
                join: "round"
            };
            this.defaultPolygonSymbol = {
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
            };
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
                    layers: [this.drawLayer, this.overlayLayer]
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
         *   rectangle
         *   ellipse
         * @param {object} symbol - 绘制图标
         *   可选, 不传使用默认图标
         * @return {Promise} - 返回绘制的Geometry
         * */
        startDraw(drawType, symbol) {
            drawType = drawType.toLowerCase();
            return new Promise(resolve => {
                const action = this.draw.create(drawType, {
                    mode: "click"
                });
                //画线或面时需要对节点进行更新
                if (drawType == "polyline" || drawType == "polygon") {
                    action.on("vertex-add", event => {
                        createGraphic(event);
                    });
                    action.on("vertex-remove", event => {
                        createGraphic(event);
                    });
                }
                action.on("cursor-update", event => {
                    createGraphic(event);
                });
                action.on("draw-complete", event => {
                    createGraphic(event);
                });
                let createGraphic = (event) => {
                    //画点时有coordinates属性
                    const coordinates = event.coordinates;
                    //画线和面时有vertices属性
                    const vertices = event.vertices;
                    //清除临时graphic
                    this.mapView.graphics.removeAll();
                    let geometry;
                    let graphicSymbol;
                    switch (drawType) {
                        case "point":
                            geometry = {
                                type: "point",
                                x: coordinates[0],
                                y: coordinates[1],
                                spatialReference: this.mapView.spatialReference
                            };
                            graphicSymbol = symbol ? symbol : this.defaultPointSymbol;
                            break;
                        case "polyline":
                            geometry = {
                                type: "polyline",
                                paths: vertices,
                                spatialReference: this.mapView.spatialReference
                            };
                            graphicSymbol = symbol ? symbol : this.defaultPolylineSymbol;
                            break;
                        case "polygon":
                            geometry = {
                                type: "polygon",
                                rings: vertices,
                                spatialReference: this.mapView.spatialReference
                            };
                            graphicSymbol = symbol ? symbol : this.defaultPolygonSymbol;
                            break;
                    }
                    const graphic = new Graphic({
                        geometry: geometry,
                        symbol: graphicSymbol
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
                        let transformed;
                        switch (drawType) {
                            case "point":
                                // const point: PointJson = resultGeometry.toJSON();
                                transformed = coordTransform_1.CoordTransform.transformPoint("gcj02", "wgs84", resultGeometry.toJSON());
                                resolve(transformed);
                                break;
                            case "polygon":
                                // const polygon: PolygonJson = resultGeometry.toJSON();
                                //纠偏, gcj02=>wgs84
                                transformed = coordTransform_1.CoordTransform.transformPolygon("gcj02", "wgs84", resultGeometry.toJSON());
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
        addOverlays(params) {
            return new Promise(resolve => {
                const overlays = params.overlays;
                const defaultSymbol = params.defaultSymbol;
                overlays.forEach(overlay => {
                    let geometry = overlay.geometry;
                    const graphic = new Graphic({
                        geometry: coordTransform_1.CoordTransform.transformPolyline("wgs84", "gcj02", geometry),
                        symbol: overlay.symbol || defaultSymbol
                    });
                    this.overlayLayer.add(graphic);
                });
                resolve();
            });
        }
        deleteOverlays() {
            this.overlayLayer.removeAll();
        }
    }
    exports.Map = Map;
});
//# sourceMappingURL=map.js.map