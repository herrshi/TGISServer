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
   * @param {number} long - 火星坐标系经度
   * @param {number} lat - 火星坐标系纬度
   * @return {[number, number]} - 百度坐标系经纬度
   * */
  public static gcj02ToBd09([long, lat]: [number, number]) {
    long = +long;
    lat = +lat;
    const z: number =
      Math.sqrt(long * long + lat * lat) + 0.00002 * Math.sin(lat * this.x_pi);
    const theta: number =
      Math.atan2(lat, long) + 0.000003 * Math.cos(long * this.x_pi);
    const bd_lng: number = z * Math.cos(theta) + 0.0065;
    const bd_lat: number = z * Math.sin(theta) + 0.006;
    return [bd_lng, bd_lat];
  }

  /**
   * 百度坐标系转火星坐标系
   * @param {number} long - 百度坐标系经度
   * @param {number} lat - 百度坐标系纬度
   * @return {[number, number]} - 火星坐标系经纬度
   * */
  public static bd09ToGcj02([long, lat]: [number, number]) {
    long = +long;
    lat = +lat;
    const x: number = long - 0.0065;
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
   * @param {number} long - 火星坐标系经度
   * @param {number} lat - 火星坐标系纬度
   * @return {[number, number]} - WGS84坐标系经纬度
   * */
  public static gcj02ToWgs84([long, lat]: [number, number]) {
    long = +long;
    lat = +lat;
    if (this.outOfChina([long, lat])) {
      return [long, lat];
    } else {
      let dLat: number = this.transformLat([long - 105.0, lat - 35.0]);
      let dLong: number = this.transformLong([long - 105.0, lat - 35.0]);
      const radLat: number = (lat / 180.0) * Math.PI;
      let magic: number = Math.sin(radLat);
      magic = 1 - this.ee * magic * magic;
      const sqrtMagic: number = Math.sqrt(magic);
      dLat =
        (dLat * 180.0) /
        (((this.a * (1 - this.ee)) / (magic * sqrtMagic)) * Math.PI);
      dLong =
        (dLong * 180.0) / ((this.a / sqrtMagic) * Math.cos(radLat) * Math.PI);
      const mgLat: number = lat + dLat;
      const mgLng: number = long + dLong;
      return [long * 2 - mgLng, lat * 2 - mgLat];
    }
  }

  /**
   * WGS84坐标系转火星坐标系
   * @param {number} long - WGS84坐标系经度
   * @param {number} lat - WGS84坐标系纬度
   * @return {[number, number]} - 火星坐标系经纬度
   * */
  public static wgs84ToGcj02([long, lat]: [number, number]) {
    long = +long;
    lat = +lat;
    if (this.outOfChina([long, lat])) {
      return [long, lat];
    } else {
      let dLat = this.transformLat([long - 105.0, lat - 35.0]);
      let dLong = this.transformLong([long - 105.0, lat - 35.0]);
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
      const mgLong = long + dLong;
      return [mgLong, mgLat];
    }
  }

  /**
   * 将
   * */
  public static transformLine(from: string, to: string, geometry: object) {

  }

  private static transformLong([long, lat]: [number, number]) {
    long = +long;
    lat = +lat;
    let ret: number =
      -100.0 +
      2.0 * long +
      3.0 * lat +
      0.2 * lat * lat +
      0.1 * long * lat +
      0.2 * Math.sqrt(Math.abs(long));
    ret +=
      ((20.0 * Math.sin(6.0 * long * Math.PI) +
        20.0 * Math.sin(2.0 * long * Math.PI)) *
        2.0) /
      3.0;
    ret +=
      ((20.0 * Math.sin(lat * Math.PI) +
        40.0 * Math.sin((lat / 3.0) * Math.PI)) *
        2.0) /
      3.0;
    ret +=
      ((160.0 * Math.sin((lat / 12.0) * Math.PI) +
        320 * Math.sin((lat * Math.PI) / 30.0)) *
        2.0) /
      3.0;
    return ret;
  }

  private static transformLat([long, lat]: [number, number]) {
    long = +long;
    lat = +lat;
    let ret: number =
      300.0 +
      long +
      2.0 * lat +
      0.1 * long * long +
      0.1 * long * lat +
      0.1 * Math.sqrt(Math.abs(long));
    ret +=
      ((20.0 * Math.sin(6.0 * long * Math.PI) +
        20.0 * Math.sin(2.0 * long * Math.PI)) *
        2.0) /
      3.0;
    ret +=
      ((20.0 * Math.sin(long * Math.PI) +
        40.0 * Math.sin((long / 3.0) * Math.PI)) *
        2.0) /
      3.0;
    ret +=
      ((150.0 * Math.sin((long / 12.0) * Math.PI) +
        300.0 * Math.sin((long / 30.0) * Math.PI)) *
        2.0) /
      3.0;
    return ret;
  }

  /**
   * 判断是否在国内，不在国内不做偏移
   * */
  private static outOfChina([long, lat]: [number, number]) {
    return !(73.66 < long && long < 135.05 && 3.86 < lat && lat < 53.55);
  }
}
