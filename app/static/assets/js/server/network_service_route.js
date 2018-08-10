define(["require", "exports", "../map/map"], function (require, exports, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const map = new map_1.Map("mapViewDiv");
    const btnAddStop = $("#btnAddStop");
    const btnCalculate = $("#btnCalculate");
    const btnClearData = $("#btnClearData");
    const btnOpenLink = $("#btnOpenLink");
    const txtStops = $("#txtStops");
    const txtRequest = $("#txtRequestUrl");
    const txtResponse = $("#txtResponse");
    let stops = [];
    map.createMap().then(() => {
        btnAddStop.removeClass("disabled");
    });
    btnAddStop.on("click", () => {
        map
            .startDraw("point", {
            type: "picture-marker",
            //按照点击顺序加入数字图标
            url: window.location.origin +
                "/static/assets/img/mapIcons/blue" +
                (stops.length + 1) +
                ".png",
            width: "24px",
            height: "35px",
            yoffset: "18px"
        })
            .then(point => {
            point = point;
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
        stops = [];
        txtStops.val("");
        txtRequest.val("");
        txtResponse.val("");
        btnCalculate.addClass("disabled");
        btnClearData.addClass("disabled");
        btnOpenLink.addClass("disabled");
    });
    function getRoute() {
        const stops = txtStops.val().trim();
        if (stops != "") {
            const requestParam = $.param({
                stops: stops
            });
            const requestUrl = window.route.NETWORK_SERVICE_ROUTE + "?" + requestParam;
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
});
//# sourceMappingURL=network_service_route.js.map