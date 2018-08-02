define(["require", "exports", "../map/map"], function (require, exports, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const map = new map_1.Map("mapViewDiv");
    const btnAddStop = $("#btnAddStop");
    const btnCalculate = $("#btnCalculate");
    const btnClearData = $("#btnClearData");
    const txtStops = $("#txtStops");
    let stops = [];
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
            point = point;
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
});
//# sourceMappingURL=network_service_route.js.map