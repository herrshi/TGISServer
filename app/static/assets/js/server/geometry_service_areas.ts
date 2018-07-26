import { Map } from "../map/map";
import Polygon = require("esri/geometry/Polygon");

const btnAddNewPolygon = $("#btnAddNewPolygon");
const btnClear = $("#btnClearData");
const txtPolygons = $("#txtPolygons");

let polygons: Array<any> = [];

const map = new Map("mapViewDiv");
map.createMap().then(() => {
  btnAddNewPolygon.removeClass("disabled");
});

btnAddNewPolygon.on("click", () => {
  map.startDraw("polygon").then(polygon => {
    //保留6位小数
    (polygon as Polygon).rings.forEach(ring => {
      ring.forEach(point => {
        point[0] = Number(Number(point[0]).toFixed(6));
        point[1] = Number(Number(point[1]).toFixed(6));
      });
    });
    let jsonPolygon: any = polygon.toJSON();
    delete jsonPolygon.spatialReference;
    polygons.push(jsonPolygon);
    txtPolygons.val(JSON.stringify(polygons));
    btnClear.removeClass("disabled");
  });
});

btnClear.on("click", () => {
  map.clearDraw();
  polygons = [];
  txtPolygons.val("");
  btnClear.addClass("disabled");
});
