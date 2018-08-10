define(["require", "exports", "../map/map"], function (require, exports, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const btnAddNewPolygon = $("#btnAddNewPolygon");
    const btnCalculate = $("#btnCalculate");
    const btnClearData = $("#btnClearData");
    const btnOpenLink = $("#btnOpenLink");
    const txtPolygons = $("#txtPolygons");
    const txtRequest = $("#txtRequestUrl");
    const txtResponse = $("#txtResponse");
    //存放polygon的json对象的array
    let polygons = [];
    const map = new map_1.Map("mapViewDiv");
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
            btnClearData.removeClass("disabled");
        });
    });
    btnCalculate.on("click", () => {
        getAreas();
    });
    btnClearData.on("click", () => {
        map.clearDraw();
        polygons = [];
        txtPolygons.val("");
        txtRequest.val("");
        txtResponse.val("");
        btnCalculate.addClass("disabled");
        btnClearData.addClass("disabled");
        btnOpenLink.addClass("disabled");
    });
    btnOpenLink.on("click", () => {
        window.open(txtRequest.val());
    });
    function getAreas() {
        const polygons = txtPolygons.val().trim();
        if (polygons != "") {
            const requestParam = $.param({
                polygons: polygons,
                calculationType: $("#selCalculationType").val()
            });
            const requestUrl = window.route.GEOMETRY_SERVICE_AREAS + "?" + requestParam;
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
//# sourceMappingURL=geometry_service_areas.js.map