import { Map } from "../map/map";

const btnAddNewPolygon = $("#btnAddNewPolygon");
const btnClear = $("#btnClearData");
const txtPolygons = $("#txtPolygons");
const txtRequest = $("#txtRequestUrl");
const txtResponse = $("#txtResponse");

//存放polygon的json对象的array
let polygons: Array<any> = [];

const map = new Map("mapViewDiv");
map.createMap().then(() => {
  btnAddNewPolygon.removeClass("disabled");
});

btnAddNewPolygon.on("click", () => {
  map.startDraw("polygon").then(polygon => {
    //保留6位小数
    polygon.rings.forEach(ring => {
      ring.forEach(point => {
        point[0] = Number(Number(point[0]).toFixed(6));
        point[1] = Number(Number(point[1]).toFixed(6));
      });
    });
    //去掉spatialReference属性后在textArea中显示
    delete polygon.spatialReference;
    polygons.push(polygon);
    txtPolygons.val(JSON.stringify(polygons));

    //清除按钮可用
    btnClear.removeClass("disabled");

    getAreas();
  });
});

btnClear.on("click", () => {
  map.clearDraw();
  polygons = [];
  txtPolygons.val("");
  btnClear.addClass("disabled");
});

function getAreas():void {
  const polygons: string = (<string>txtPolygons.val()).trim();
  if (polygons != "") {
    const requestParam: string = $.param({
      polygons: polygons,
      calculationType: $("#selCalculationType").val()
    });
    const requestUrl:string = (<any>window).route.GEOMETRY_SERVICE_AREAS + "?" + requestParam;

    fetch(requestUrl).then(response => {
      txtRequest.val(decodeURIComponent(response.url));
      return response.json();
    }).then(data => {
      txtResponse.val(JSON.stringify(data));
    });
  }
}
