require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Basemap",
  "esri/layers/TileLayer",
  "esri/config",
  "esri/widgets/CoordinateConversion",
  "esri/widgets/Home",
  "dojo/domReady!"
], function(
  Map,
  MapView,
  Basemap,
  TileLayer,
  esriConfig,
  CoordinateConversion,
  Home
) {
  //允许跨域
  esriConfig.request.proxyUrl = "http://localhost:8090/proxy/proxy.jsp";

  const basemap = new Basemap({
    baseLayers: [
      new TileLayer(
        "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"
      )
    ]
  });
  const map = new Map({
    basemap: basemap
  });

  let view = new MapView({
    container: "mapViewDiv", // Reference to the DOM node that will contain the view
    map: map, // References the map object created in step 3
    zoom: 16, // Sets zoom level based on level of detail (LOD)
    center: [121.414, 31.242677] // Sets center point of view using longitude,latitude
  });

  view.ui.remove("attribution");

  const homeWidget = new Home({
    view: view
  });
  view.ui.add(homeWidget, "top-left");

  // const ccWidget = new CoordinateConversion({
  //   view: view
  // });
  //
  // view.ui.add(ccWidget, "bottom-left");
});
