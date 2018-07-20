/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Basemap = require("esri/Basemap");
import TileLayer = require("esri/layers/TileLayer");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import HomeWidget = require("esri/widgets/Home");
import Draw = require("esri/views/2d/draw/Draw");
import Graphic = require("esri/Graphic");
import webMercatorUtils = require("esri/geometry/support/webMercatorUtils");
import Polygon = require("esri/geometry/Polygon");


import {CoordTransform} from "../map/coordTransform"

interface DrawEvent {
  vertices: number[][];
  type: string;
}

export class Map {
  readonly rootDiv: string;
  readonly drawLayer: GraphicsLayer = new GraphicsLayer();
  private mapView: MapView;
  private draw: Draw;

  constructor(divName: string) {
    this.rootDiv = divName;
  }

  public createMap() {
    return new Promise(resolve => {
      const basemap = new Basemap({
        baseLayers: [
          new TileLayer({
            url:
              "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"
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

  public startDraw(drawType: string) {
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

      let createPolygonGraphic = (event: DrawEvent) => {
        const vertices: number[][] = event.vertices;
        //清除临时graphic
        this.mapView.graphics.removeAll();

        let geometry: object;
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
              type: "polygon", // autocasts as Polygon
              rings: vertices,
              spatialReference: this.mapView.spatialReference
            };
            break;
        }

        const graphic = new Graphic({
          geometry: geometry,
          symbol: {
            type: "simple-fill", // autocasts as SimpleFillSymbol
            color: [178, 102, 234, 0.8],
            style: "solid",
            outline: {
              type: "simple-line", // autocasts as new SimpleFillSymbol
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
          //先把墨卡托转到wgs
          if (this.mapView.spatialReference.isWebMercator) {
            resultGeometry = webMercatorUtils.webMercatorToGeographic(graphic.geometry);
          }
          console.log(resultGeometry.toJSON());
          //纠偏
          resultGeometry = CoordTransform.transformPolygon("gcj02", "wgs84", <Polygon>resultGeometry);
          resolve(resultGeometry.toJSON());
        } else {
          this.mapView.graphics.add(graphic);
        }
      };
    });
  }
}
