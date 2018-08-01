import { Map, PointJson } from "../map/map";

const map = new Map("mapViewDiv");
map.createMap().then(() => {
  map.startDraw("point").then(point => {
    console.log(point as PointJson);
  })
});