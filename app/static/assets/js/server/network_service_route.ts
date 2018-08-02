import { Map, PointJson } from "../map/map";

const map = new Map("mapViewDiv");

const btnAddStop = $("#btnAddStop");
const btnCalculate = $("#btnCalculate");
const btnClearData = $("#btnClearData");
const txtStops = $("#txtStops");

let stops: Array<any> = [];

map.createMap().then(() => {
  btnAddStop.removeClass("disabled");
});

btnAddStop.on("click", () => {
  map
    .startDraw("point", {
      type: "picture-marker",
      url: window.location.origin + "/static/assets/img/mapIcons/blue" + (stops.length + 1) + ".png",
      width: "24px",
      height: "35px",
      yoffset: "18px"
    })
    .then(point => {
      point = point as PointJson;
      stops.push([Number(point.x.toFixed(6)), Number(point.y.toFixed(6))]);
      txtStops.val(JSON.stringify(stops));

      btnClearData.removeClass("disabled");
      if (stops.length >= 2) {
        btnCalculate.removeClass("disabled");
      }
    });
});

btnCalculate.on("click", () => {

});
