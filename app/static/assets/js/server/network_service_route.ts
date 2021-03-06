import { Map, PointJson, Overlay, OverlayParams } from "../map/map";

const map = new Map("mapViewDiv");

const btnAddStop = $("#btnAddStop");
const btnCalculate = $("#btnCalculate");
const btnClearData = $("#btnClearData");
const btnOpenLink = $("#btnOpenLink");
const txtStops = $("#txtStops");
const txtRequest = $("#txtRequestUrl");
const txtResponse = $("#txtResponse");

let stops: Array<Array<number>> = [];

map.createMap().then(() => {
  btnAddStop.removeClass("disabled");
});

btnAddStop.on("click", () => {
  map
    .startDraw("point", {
      type: "picture-marker",
      //按照点击顺序加入数字图标
      url:
        window.location.origin +
        "/static/assets/img/mapIcons/blue" +
        (stops.length + 1) +
        ".png",
      width: "24px",
      height: "35px",
      yoffset: "18px"
    })
    .then(point => {
      point = point as PointJson;
      stops.push([Number(point.x.toFixed(6)), Number(point.y.toFixed(6))]);
      txtStops.val(JSON.stringify(stops));

      btnClearData.removeClass("disabled");
      //大于两个点时可以计算路径
      if (stops.length >= 2) {
        btnCalculate.removeClass("disabled");
      }
    });
});

btnCalculate.on("click", () => {
  getRoute();
});

btnClearData.on("click", () => {
  map.clearDraw();
  map.deleteOverlays();
  stops = [];
  txtStops.val("");
  txtRequest.val("");
  txtResponse.val("");
  btnCalculate.addClass("disabled");
  btnClearData.addClass("disabled");
  btnOpenLink.addClass("disabled");
});

btnOpenLink.on("click", () => {
  window.open(txtRequest.val() as string);
});

function getRoute() {
  const stops: string = (<string>txtStops.val()).trim();
  if (stops != "") {
    const requestParam = $.param({
      stops: stops
    });
    const requestUrl =
      (<any>window).route.NETWORK_SERVICE_ROUTE + "?" + requestParam;

    fetch(requestUrl)
      .then(response => {
        //显示rest地址
        txtRequest.val(decodeURIComponent(response.url));
        btnOpenLink.removeClass("disabled");
        return response.json();
      })
      .then(data => {
        txtResponse.val(JSON.stringify(data));

        drawLines(data);
      });
  }
}

function drawLines(data: Array<Array<number>>) {
  const overlay: Overlay = {
    geometry: {
      type: "polyline",
      paths: [data]
    },
    symbol: map.defaultPolylineSymbol
  };
  const params: OverlayParams = {
    overlays: [overlay]
  };
  map.addOverlays(params).then(() => {});
}
