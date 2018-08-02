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
import Geometry = require("esri/geometry/Geometry");
import esriConfig = require("esri/config");

import { CoordTransform } from "../map/coordTransform";

interface DrawEvent {
  vertices: number[][];
  coordinates: number[];
  type: string;
}

export interface SpatialReferenceJson {
  wkid: number;
}

export interface PointJson {
  x: number;
  y: number;
  spatialReference: SpatialReferenceJson;
}

export interface PolylineJson {
  paths: Array<Array<Array<number>>>;
  spatialReference: SpatialReferenceJson;
}

export interface PolygonJson {
  rings: Array<Array<Array<number>>>;
  spatialReference: SpatialReferenceJson;
}

export class Map {
  readonly rootDiv: string;
  readonly drawLayer: GraphicsLayer = new GraphicsLayer();
  private mapView: MapView;
  private draw: Draw;

  readonly defaultPointSymbol: object = {
    type: "simple-marker",
    style: "square",
    color: "red",
    size: "16px",
    outline: {
      color: [255, 255, 0],
      width: 3
    }
  };

  readonly defaultPolylineSymbol: object = {
    type: "simple-line",
    color: [4, 90, 141],
    width: 4,
    cap: "round",
    join: "round"
  };

  readonly defaultPolygonSymbol: object = {
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

  constructor(divName: string) {
    this.rootDiv = divName;

    if ((<any>window).config.GIS_PROXY) {
      //允许跨域
      esriConfig.request.proxyUrl = (<any>window).config.GIS_PROXY;
    }
  }

  public createMap(): Promise<void> {
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
  public startDraw(drawType: string, symbol?: object): Promise<any> {
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

      let createGraphic = (event: DrawEvent) => {
        //画点时有coordinates属性
        const coordinates: number[] = event.coordinates;
        //画线和面时有vertices属性
        const vertices: number[][] = event.vertices;
        //清除临时graphic
        this.mapView.graphics.removeAll();

        let geometry: {};
        let graphicSymbol: {};
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

          let resultGeometry: Geometry = graphic.geometry;
          //投影坐标=>地理坐标
          if (this.mapView.spatialReference.isWebMercator) {
            resultGeometry = webMercatorUtils.webMercatorToGeographic(
              graphic.geometry
            );
          }

          let transformed;
          switch (drawType) {
            case "point":
              // const point: PointJson = resultGeometry.toJSON();
              transformed = CoordTransform.transformPoint(
                "gcj02",
                "wgs84",
                resultGeometry.toJSON()
              );
              resolve(transformed as PointJson);
              break;

            case "polygon":
              // const polygon: PolygonJson = resultGeometry.toJSON();
              //纠偏, gcj02=>wgs84
              transformed = CoordTransform.transformPolygon(
                "gcj02",
                "wgs84",
                resultGeometry.toJSON()
              );
              resolve(transformed as PolygonJson);
              break;
          }
        } else {
          this.mapView.graphics.add(graphic);
        }
      };
    });
  }

  public clearDraw() {
    this.drawLayer.removeAll();
  }
}
