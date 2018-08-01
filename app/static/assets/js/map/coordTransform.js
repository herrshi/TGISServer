/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper"], function (require, exports, __extends, __decorate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * 坐标系转换
     * 火星坐标系(gcj02)--百度坐标系(bd02)--WGS84(wgs84)之间互转
     * 火星坐标系: 除百度以外的国内地图, 如高德, arcgis online, 国内谷歌等
     * 百度坐标系: 百度
     * WGS84: 天地图, 国外谷歌
     * */
    class CoordTransform {
        /**
         * 火星坐标系转百度坐标系
         * @param {number} lng - 火星坐标系经度
         * @param {number} lat - 火星坐标系纬度
         * @return {[number, number]} - 百度坐标系经纬度
         * */
        static gcj02ToBd09([lng, lat]) {
            lng = +lng;
            lat = +lat;
            const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * this.x_pi);
            const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * this.x_pi);
            const bd_lng = z * Math.cos(theta) + 0.0065;
            const bd_lat = z * Math.sin(theta) + 0.006;
            return [bd_lng, bd_lat];
        }
        /**
         * 百度坐标系转火星坐标系
         * @param {number} lng - 百度坐标系经度
         * @param {number} lat - 百度坐标系纬度
         * @return {[number, number]} - 火星坐标系经纬度
         * */
        static bd09ToGcj02([lng, lat]) {
            lng = +lng;
            lat = +lat;
            const x = lng - 0.0065;
            const y = lat - 0.006;
            const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
            const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
            const gcj_long = z * Math.cos(theta);
            const gcj_lat = z * Math.sin(theta);
            return [gcj_long, gcj_lat];
        }
        /**
         * 火星坐标系转WGS84坐标系
         * @param {number} lng - 火星坐标系经度
         * @param {number} lat - 火星坐标系纬度
         * @return {[number, number]} - WGS84坐标系经纬度
         * */
        static gcj02ToWgs84([lng, lat]) {
            lat = +lat;
            lng = +lng;
            if (this.outOfChina([lng, lat])) {
                return [lng, lat];
            }
            else {
                let dLat = this.transformLat([lng - 105.0, lat - 35.0]);
                let dLng = this.transformLong([lng - 105.0, lat - 35.0]);
                const radLat = (lat / 180.0) * Math.PI;
                let magic = Math.sin(radLat);
                magic = 1 - this.ee * magic * magic;
                const sqrtMagic = Math.sqrt(magic);
                dLat =
                    (dLat * 180.0) /
                        (((this.a * (1 - this.ee)) / (magic * sqrtMagic)) * Math.PI);
                dLng =
                    (dLng * 180.0) / ((this.a / sqrtMagic) * Math.cos(radLat) * Math.PI);
                let mgLat = lat + dLat;
                let mgLng = lng + dLng;
                return [lng * 2 - mgLng, lat * 2 - mgLat];
            }
        }
        /**
         * WGS84坐标系转火星坐标系
         * @param {number} lng - WGS84坐标系经度
         * @param {number} lat - WGS84坐标系纬度
         * @return {[number, number]} - 火星坐标系经纬度
         * */
        static wgs84ToGcj02([lng, lat]) {
            lng = +lng;
            lat = +lat;
            if (this.outOfChina([lng, lat])) {
                return [lng, lat];
            }
            else {
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
         * 转换esri json格式的point坐标
         * @param {string} from - 初始坐标系
         * @param {string} to - 目标坐标系
         * @param {PointJson} geometry - 要转换的point对象(esri json)
         * @return {PointJson} 坐标转换完成后的Point对象
         * */
        static transformPoint(from, to, geometry) {
            from = from.toLowerCase();
            to = to.toLowerCase();
            let newCoord;
            if (from == "gcj02" && to == "wgs84") {
                newCoord = this.gcj02ToWgs84([geometry.x, geometry.y]);
            }
            else if (from == "wgs84" && to == "gcj02") {
                newCoord = this.wgs84ToGcj02([geometry.x, geometry.y]);
            }
            return {
                spatialReference: geometry.spatialReference,
                x: newCoord[0],
                y: newCoord[1]
            };
        }
        /**
         * 转换Polygon坐标
         * @param {string} from - 初始坐标系
         * @param {string} to - 目标坐标系
         * @param {PolygonJson} polygon - 要转换坐标的polygon对象(esri json)
         * @return {PolygonJson} 坐标转换完成后的polygon对象
         * */
        static transformPolygon(from, to, polygon) {
            from = from.toLowerCase();
            to = to.toLowerCase();
            let transformed = {
                spatialReference: polygon.spatialReference,
                rings: []
            };
            let newRing = [];
            for (let ring of polygon.rings) {
                for (let point of ring) {
                    if (from == "gcj02" && to == "wgs84") {
                        newRing.push(this.gcj02ToWgs84([point[0], point[1]]));
                    }
                    else if (from == "wgs84" && to == "gcj02") {
                        newRing.push(this.wgs84ToGcj02([point[0], point[1]]));
                    }
                }
            }
            transformed.rings.push(newRing);
            return transformed;
        }
        static transformLong([lng, lat]) {
            lat = +lat;
            lng = +lng;
            let ret = 300.0 +
                lng +
                2.0 * lat +
                0.1 * lng * lng +
                0.1 * lng * lat +
                0.1 * Math.sqrt(Math.abs(lng));
            ret +=
                ((20.0 * Math.sin(6.0 * lng * Math.PI) +
                    20.0 * Math.sin(2.0 * lng * Math.PI)) *
                    2.0) /
                    3.0;
            ret +=
                ((20.0 * Math.sin(lng * Math.PI) +
                    40.0 * Math.sin((lng / 3.0) * Math.PI)) *
                    2.0) /
                    3.0;
            ret +=
                ((150.0 * Math.sin((lng / 12.0) * Math.PI) +
                    300.0 * Math.sin((lng / 30.0) * Math.PI)) *
                    2.0) /
                    3.0;
            return ret;
        }
        static transformLat([lng, lat]) {
            lat = +lat;
            lng = +lng;
            let ret = -100.0 +
                2.0 * lng +
                3.0 * lat +
                0.2 * lat * lat +
                0.1 * lng * lat +
                0.2 * Math.sqrt(Math.abs(lng));
            ret +=
                ((20.0 * Math.sin(6.0 * lng * Math.PI) +
                    20.0 * Math.sin(2.0 * lng * Math.PI)) *
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
        /**
         * 判断是否在国内，不在国内不做偏移
         * */
        static outOfChina([long, lat]) {
            return !(73.66 < long && long < 135.05 && 3.86 < lat && lat < 53.55);
        }
    }
    CoordTransform.x_pi = (Math.PI * 3000.0) / 180.0;
    CoordTransform.a = 6378245.0; //长半轴
    CoordTransform.ee = 0.00669342162296594323; //偏心率平方
    exports.CoordTransform = CoordTransform;
});
//# sourceMappingURL=coordTransform.js.map