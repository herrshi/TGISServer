define(["require", "exports", "../map/map"], function (require, exports, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const map = new map_1.Map("mapViewDiv");
    map.createMap().then(() => {
        map.startDraw("polygon").then(vertices => {
            console.log(vertices);
        });
    });
});
//# sourceMappingURL=geometry_service_areas.js.map