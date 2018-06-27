require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/views/2d/draw/Draw",
  "esri/Basemap",
  "esri/Graphic",
  "esri/geometry/Polyline",
  "esri/layers/TileLayer",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Home",
  "esri/geometry/support/webMercatorUtils",
  "dojo/domReady!"
], function(
  esriConfig,
  Map,
  MapView,
  Draw,
  Basemap,
  Graphic,
  Polyline,
  TileLayer,
  GraphicsLayer,
  Home,
  webMercatorUtils
) {
  //允许跨域
  esriConfig.request.proxyUrl = window.config.GIS_PROXY;

  let drawLayer = new GraphicsLayer();

  const basemap = new Basemap({
    baseLayers: [
      new TileLayer(
        "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"
      )
    ]
  });
  let map = new Map({
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

  let draw;
  view.when(function() {
    draw = new Draw({
      view: view
    });
    enableCreatePolyline();
  });

  const lineSymbol = {
    type: "simple-line", // autocasts as new SimpleFillSymbol
    color: [4, 90, 141],
    width: 4,
    cap: "round",
    join: "round"
  };

  function enableCreatePolyline() {
    const action = draw.create("polyline", {
      mode: "click"
    });
    action.on("vertex-add", addGraphic);
    action.on("vertex-remove", addGraphic);
    action.on("cursor-update", addGraphic);
    action.on("draw-complete", addGraphic);
  }

  function addGraphic(evt) {
    const vertices = evt.vertices;
    view.graphics.removeAll();

    const graphic = new Graphic({
      geometry: new Polyline({
        paths: vertices,
        spatialReference: view.spatialReference
      }),
      symbol: lineSymbol
    });

    if (evt.type === "draw-complete") {
      //绘制完成时的graphic放在drawLayer中
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
            point[0] = Number(Number(point[0]).toFixed(6));
            point[1] = Number(Number(point[1]).toFixed(6));
          });
        });
        return jsonObj;
      });

      const $txtPolylines = $("#txtPolylines");
      $txtPolylines.val(JSON.stringify(polylines));
      //.val()不会触发change/input事件，手动触发
      $txtPolylines.trigger("input");

      //调用长度计算接口
      getLength();

      //继续画下一条线
      enableCreatePolyline();
    } else {
      //临时graphic放在view.graphics里，方便清除
      view.graphics.add(graphic);
    }
  }

  function getLength() {
    const polylineParams = $("#txtPolylines")
      .val()
      .trim();
    if (polylineParams !== "") {
      const param = {
        polylines: polylineParams,
        calculationType: $("#selCalculationType").val()
      };
      const requestUrl = generateUrlWithParams(
        window.route.GEOMETRY_SERVICE_LENGTHS,
        param
      );
      fetch(requestUrl)
        .then(response => {
          const $txtRequestUrl = $("#txtRequestUrl");
          $txtRequestUrl.val(decodeURI(response.url));
          $txtRequestUrl.trigger("input");
          return response.json();
        })
        .then(data => {
          $("#txtResults").val(JSON.stringify(data));
        });
    }
  }

  $("#btnOpenLink").click(function() {
    window.open($("#txtRequestUrl").val());
  });

  $("#btnClearData").click(function() {
    drawLayer.removeAll();

    const $txtPolylines = $("#txtPolylines");
    $txtPolylines.val("");
    $txtPolylines.trigger("input");

    const $txtRequestUrl = $("#txtRequestUrl");
    $txtRequestUrl.val("");
    $txtRequestUrl.trigger("input");

    $("#txtResults").val("");
  });

  $("#selCalculationType").change(function() {
    getLength();
  });

  //polyline参数有内容时才能点"清除"
  $("#txtPolylines").on("input", function() {
    $("#btnClearData").prop("disabled", this.value.length === 0);
  });

  //请求地址有内容时才能点"打开请求地址"
  $("#txtRequestUrl").on("input", function() {
    $("#btnOpenLink").prop("disabled", this.value.length === 0);
  });
});
