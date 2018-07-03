/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import EsriMap = require("esri/Map");
import MapView = require("esri/views/MapView");
import Basemap = require("esri/Basemap");
import TileLayer = require("esri/layers/TileLayer");
import HomeWidget = require("esri/widgets/Home");
import Draw = require("esri/views/2d/draw/Draw");

export class Map {
  readonly view: MapView;
  private draw: Draw;

  constructor(divName: string) {
    const basemap = new Basemap({
      baseLayers: [
        new TileLayer({
          url:
            "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"
        })
      ]
    });

    const map = new EsriMap({
      basemap: basemap
    });

    this.view = new MapView({
      container: divName,
      map: map,
      zoom: 16,
      center: [121.414, 31.242677]
    });
    this.view.ui.remove("attribution");

    const homeWidget = new HomeWidget({
      view: this.view
    });
    this.view.ui.add(homeWidget, "top-left");

    this.view.when(() => {
      this.draw = new Draw({
        view: this.view
      });
    });
  }

  public startDraw(drawType: string) {
    const action = this.draw.create(drawType, {
      mode: "click"
    });
  }

  private _addGraphic() {

  }
}
