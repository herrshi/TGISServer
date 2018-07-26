/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import Polygon = require("esri/geometry/Polygon");

/**
 * 坐标系转换
 * 火星坐标系(gcj02)--百度坐标系(bd02)--WGS84(wgs84)之间互转
 * 火星坐标系: 除百度以外的国内地图, 如高德, arcgis online, 国内谷歌等
 * 百度坐标系: 百度
 * WGS84: 天地图, 国外谷歌
 * */
export class CoordTransform {
  static readonly x_pi = (Math.PI * 3000.0) / 180.0;
  static readonly a = 6378245.0; //长半轴
  static readonly ee = 0.00669342162296594323; //偏心率平方

  /**
   * 火星坐标系转百度坐标系
   * @param {number} lng - 火星坐标系经度
   * @param {number} lat - 火星坐标系纬度
   * @return {[number, number]} - 百度坐标系经纬度
   * */
  public static gcj02ToBd09([lng, lat]: [number, number]) {
    lng = +lng;
    lat = +lat;
    const z: number =
      Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * this.x_pi);
    const theta: number =
      Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * this.x_pi);
    const bd_lng: number = z * Math.cos(theta) + 0.0065;
    const bd_lat: number = z * Math.sin(theta) + 0.006;
    return [bd_lng, bd_lat];
  }

  /**
   * 百度坐标系转火星坐标系
   * @param {number} lng - 百度坐标系经度
   * @param {number} lat - 百度坐标系纬度
   * @return {[number, number]} - 火星坐标系经纬度
   * */
  public static bd09ToGcj02([lng, lat]: [number, number]) {
    lng = +lng;
    lat = +lat;
    const x: number = lng - 0.0065;
    const y: number = lat - 0.006;
    const z: number =
      Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
    const theta: number = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
    const gcj_long: number = z * Math.cos(theta);
    const gcj_lat: number = z * Math.sin(theta);
    return [gcj_long, gcj_lat];
  }

  /**
   * 火星坐标系转WGS84坐标系
   * @param {number} lng - 火星坐标系经度
   * @param {number} lat - 火星坐标系纬度
   * @return {[number, number]} - WGS84坐标系经纬度
   * */
  public static gcj02ToWgs84([lng, lat]: [number, number]) {
    lat = +lat;
    lng = +lng;
    if (this.outOfChina([lng, lat])) {
      return [lng, lat]
    } else {
      let dLat = this.transformLat([lng - 105.0, lat - 35.0]);
      let dLng = this.transformLong([lng - 105.0, lat - 35.0]);
      const radLat = lat / 180.0 * Math.PI;
      let magic = Math.sin(radLat);
      magic = 1 - this.ee * magic * magic;
      const sqrtMagic = Math.sqrt(magic);
      dLat = (dLat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtMagic) * Math.PI);
      dLng = (dLng * 180.0) / (this.a / sqrtMagic * Math.cos(radLat) * Math.PI);
      let mgLat = lat + dLat;
      let mgLng = lng + dLng;
      return [lng * 2 - mgLng, lat * 2 - mgLat]
    }
  }

  /**
   * WGS84坐标系转火星坐标系
   * @param {number} lng - WGS84坐标系经度
   * @param {number} lat - WGS84坐标系纬度
   * @return {[number, number]} - 火星坐标系经纬度
   * */
  public static wgs84ToGcj02([lng, lat]: [number, number]) {
    lng = +lng;
    lat = +lat;
    if (this.outOfChina([lng, lat])) {
      return [lng, lat];
    } else {
      let dLat = this.transformLat([lng - 105.0, lat - 35.0]);
      let dLong = this.transformLong([lng - 105.0, lat - 35.0]);
      const radLat = (lat / 180.0) * Math.PI;
      let magic = Math.sin(radLat);
      magic = 1 - this.ee * magic * magic;
      const sqrtMagic = Math.sqrt(magic);
      dLat =
        (dLat * 180.0) /
        (((this.a * (1 - this.ee)) / (magic * sqrtMagic)) * Math.PI);
      dLong =
        (dLong * 180.0) / ((this.a / sqrtMagic) * Math.cos(radLat) * Math.PI);
      const mgLat = lat + dLat;
      const mgLong = lng + dLong;
      return [mgLong, mgLat];
    }
  }

  /**
   * 转换esri json格式的polyline坐标
   * @param {string} from - 初始坐标系
   * @param {string} to - 目标坐标系
   * @param {Object} geometry - 要转换的polyline对象
   * */
  public static transformLine(from: string, to: string, geometry: object) {}

  /**
   * 转换Polygon坐标
   * @param {string} from - 初始坐标系
   * @param {string} to - 目标坐标系
   * @param {Polygon} polygon - 要转换坐标的polygon对象(esri json)
   * @return {Polygon} 坐标转换完成后的polygon对象
   * */
  public static transformPolygon(from: string, to: string, polygon: Polygon) {
    let transformed: Polygon = new Polygon();
    transformed.spatialReference = polygon.spatialReference;
    transformed.rings = polygon.rings.map(ring => {
      return ring.map(point => {
        if (from.toLowerCase() == "gcj02" && to.toLowerCase() == "wgs84") {
          return this.gcj02ToWgs84([point[0], point[1]]);
        } else if ( from.toLowerCase() == "wgs84" && to.toLowerCase() == "gcj02" ) {
          return this.wgs84ToGcj02([point[0], point[1]]);
        }
      });
    });
    return transformed;
  }

  private static transformLong([lng, lat]: [number, number]) {
    lat = +lat;
    lng = +lng;
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret
  }

  private static transformLat([lng, lat]: [number, number]) {
    lat = +lat;
    lng = +lng;
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret
  }

  /**
   * 判断是否在国内，不在国内不做偏移
   * */
  private static outOfChina([long, lat]: [number, number]) {
    return !(73.66 < long && long < 135.05 && 3.86 < lat && lat < 53.55);
  }
}
