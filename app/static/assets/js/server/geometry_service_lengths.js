require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/Basemap",
  "esri/Graphic",
  "esri/layers/TileLayer",
  "esri/layers/GraphicsLayer",
  "esri/widgets/CoordinateConversion",
  "esri/widgets/Sketch/SketchViewModel",
  "esri/widgets/Home",
  "esri/geometry/support/webMercatorUtils",
  "dojo/domReady!"
], function(
  esriConfig,
  Map,
  MapView,
  Basemap,
  Graphic,
  TileLayer,
  GraphicsLayer,
  CoordinateConversion,
  SketchViewModel,
  Home,
  webMercatorUtils
) {
  //允许跨域
  esriConfig.request.proxyUrl = "http://localhost:8090/proxy/proxy.jsp";

  let drawLayer = new GraphicsLayer();

  const basemap = new Basemap({
    baseLayers: [
      new TileLayer(
        "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"
      )
    ]
  });
  const map = new Map({
    basemap: basemap,
    layers: [drawLayer]
  });

  let view = new MapView({
    container: "mapViewDiv",
    map: map,
    zoom: 16,
    center: [121.414, 31.242677]
  });

  //隐藏地图服务信息
  view.ui.remove("attribution");

  //增加Home按钮
  const homeWidget = new Home({
    view: view
  });
  view.ui.add(homeWidget, "top-left");

  // const ccWidget = new CoordinateConversion({
  //   view: view
  // });
  //
  // view.ui.add(ccWidget, "bottom-left");

  const pointSymbol = {
    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    style: "circle",
    color: "#8A2BE2",
    size: "16px",
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 2 // points
    }
  };
  const polylineSymbol = {
    type: "simple-line", // autocasts as new SimpleLineSymbol()
    color: "#8A2BE2",
    width: "2",
    style: "solid"
  };
  const polygonSymbol = {
    type: "simple-fill", // autocasts as new SimpleFillSymbol()
    color: "rgba(138,43,226, 0.8)",
    style: "solid",
    outline: {
      color: "white",
      width: 1
    }
  };

  let sketchViewModel;
  view.when(function() {
    // create a new sketch view model
    sketchViewModel = new SketchViewModel({
      view: view,
      layer: drawLayer,
      pointSymbol: pointSymbol,
      polylineSymbol: polylineSymbol,
      polygonSymbol: polygonSymbol
    });

    sketchViewModel.on("draw-complete", addGraphic);
    // sketchViewModel.on("update-complete", addGraphic);
    // sketchViewModel.on("update-cancel", addGraphic);

    sketchViewModel.create("polyline");
  });

  function addGraphic(evt) {
    const geometry = evt.geometry;
    let symbol;

    // Choose a valid symbol based on return geometry
    switch (geometry.type) {
      case "point":
        symbol = pointSymbol;
        break;
      case "polyline":
        symbol = polylineSymbol;
        break;
      default:
        symbol = polygonSymbol;
        break;
    }
    // Create a new graphic; add it to the GraphicsLayer
    const graphic = new Graphic({
      geometry: geometry,
      symbol: symbol
    });
    drawLayer.add(graphic);

    //将当前显示的graphic转换为polylines参数格式
    //[<polyline1>, <polyline2>, ..., <polylineN>]
    let polylines = drawLayer.graphics.map(graphic => {
      let polyline = graphic.geometry;
      if (view.spatialReference.isWebMercator) {
        polyline = webMercatorUtils.webMercatorToGeographic(polyline);
      }
      let jsonObj = polyline.toJSON();
      delete jsonObj.spatialReference;
      //坐标保留6位小数，更美观
      jsonObj.paths.forEach(path => {
        path.forEach(point => {
          point[0] = Number(point[0]).toFixed(6);
          point[1] = Number(point[1]).toFixed(6);
        });
      });
      return jsonObj;
    });

    $("#text-polylines").val(JSON.stringify(polylines));
  }
});
