import { Map } from "../map/map";

const btnAddNewPolygon = $("#btnAddNewPolygon");
const btnCalculate = $("#btnCalculate");
const btnClear = $("#btnClearData");
const btnOpenLink = $("#btnOpenLink");
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

    //计算按钮可用
    btnCalculate.removeClass("disabled");
    //清除按钮可用
    btnClear.removeClass("disabled");
  });
});

btnCalculate.on("click", () => {
  getAreas();
});

btnClear.on("click", () => {
  map.clearDraw();
  polygons = [];
  txtPolygons.val("");
  txtRequest.val("");
  txtResponse.val("");
  btnCalculate.addClass("disabled");
  btnClear.addClass("disabled");
  btnOpenLink.addClass("disabled");
});

btnOpenLink.on("click", () => {
  window.open(txtRequest.val() as string);
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
      //显示rest地址
      txtRequest.val(decodeURIComponent(response.url));
      btnOpenLink.removeClass("disabled");
      return response.json();
    }).then(data => {
      txtResponse.val(JSON.stringify(data));
    });
  }
}
