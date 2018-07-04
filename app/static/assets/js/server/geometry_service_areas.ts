import { Map } from "../map/map";

const map = new Map("mapViewDiv");
map.createMap().then(() => {
  map.startDraw("polygon").then(vertices => {
    console.log(vertices);
  });
});
