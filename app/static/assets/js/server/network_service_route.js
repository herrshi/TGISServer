define(["require", "exports", "../map/map"], function (require, exports, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const map = new map_1.Map("mapViewDiv");
    map.createMap().then(() => {
        map.startDraw("point").then(point => {
            console.log(point);
        });
    });
});
//# sourceMappingURL=network_service_route.js.map