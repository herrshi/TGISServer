import json

from geographiclib.geodesic import Geodesic
from shapely.geometry import LineString


def _get_geodesic_length(point1: list, point2: list) -> float:
    geodesic = Geodesic.WGS84
    g = geodesic.Inverse(point1[1], point1[0], point2[1], point2[0])
    distance = g['s12']
    return distance


# 校验点的数据格式
def _validate_point(point) -> bool:
    if not isinstance(point, list):
        return False
    elif len(point) != 2:
        return False
    elif not isinstance(point[0], float) or not isinstance(point[1], float):
        return False

    return True


# 校验线的数据格式
def _validate_polyline(line) -> bool:
    if not isinstance(line, dict):
        return False

    paths = line.get('paths')
    if not isinstance(paths, list) or len(paths) < 1:
        return False

    for path in paths:
        if not isinstance(path, list) or len(path) < 2:
            return False
        for point in path:
            if not _validate_point(point):
                return False

    return True


# 校验线的参数格式
def _validate_lengths_param(params: dict) -> dict:
    calculation_type = params.get('calculationType') or 'geodesic'
    if calculation_type not in {'geodesic', 'planar'}:
        return {'error': {'code': 400, 'message': 'calculationType参数错误', 'details': '值为geodesic或planar'}}

    lines_string = params.get('polylines')
    try:
        lines = json.loads(lines_string)
    except json.JSONDecodeError:
        return {'error': {'code': 400, 'message': 'polylines参数错误', 'details': '非法json格式'}}

    if not isinstance(lines, list):
        return {'error': {'code': 400, 'message': 'polylines参数错误', 'details': 'polylines必须为list'}}
    elif len(lines) < 1:
        return {'error': {'code': 400, 'message': 'polylines参数错误', 'details': 'polylines至少有一个元素'}}

    for line in lines:
        if not _validate_polyline(line):
            return {'error': {'code': 400, 'message': 'polylines参数错误', 'details': 'polyline格式错误'}}

    return {'result': 'success'}


def lengths(params: dict) -> str:
    """
    计算折线长度
    :param
        params: 参数列表。包含参数
            polylines: 线, esri json格式
                参见https://developers.arcgis.com/documentation/common-data-types/geometry-objects.htm#POLYLINE
            calculationType: 计算方式。geodesic(测地线长度)/planar(欧几里得长度)
    :return
        解析成功时，包含折线长度的json字符串，单位为米
            '{'lengths': [1012.2, 884]}'
        解析失败时，错误信息
    """
    validate_result = _validate_lengths_param(params)
    if validate_result['result'] != 'success':
        return json.dumps(validate_result)

    lines_string = params.get('polylines')
    calculation_type = params.get('calculationType') or 'geodesic'

    lines = json.loads(lines_string)

    lines_length = []
    for line in lines:
        paths = line.get('paths')
        # 计算折线中每个线段的长度然后相加
        # 测地线长度
        if calculation_type == 'geodesic':
            for path in paths:
                i = 1
                path_length = 0
                while i < len(path):
                    # 取相邻的两个点计算距离
                    point1 = path[i - 1]
                    point2 = path[i]
                    segment_length = _get_geodesic_length(point1, point2)
                    path_length += segment_length
                    i = i + 1
                # 长度保留两位小数
                path_length = abs(round(path_length, 4))
                lines_length.append(path_length)
        # 欧几里得长度
        elif calculation_type == 'planar':
            for path in paths:
                # shapely中的线对象可直接获取到欧几里得长度
                line = LineString(path)
                path_length = line.length
                lines_length.append(abs(path_length))

    result = {'lengths': lines_length}
    return json.dumps(result)


# 计算周长和面积
def areas(params: dict) -> str:
    geodesic = Geodesic.WGS84
    polygons_string = params.get('polygons')
    calculation_type = params.get('calculationType') or 'geodesic'
    polygons = json.loads(polygons_string)

    polygons_area = []
    polygons_lengths = []
    for polygon in polygons:
        p = geodesic.Polygon()
        rings = polygon.get('rings')
        for ring in rings:
            for point in ring:
                p.AddPoint(point[1], point[0])
        num, length, area = p.Compute()
        length = abs(round(length, 4))
        area = abs(round(area, 4))
        polygons_lengths.append(length)
        polygons_area.append(area)
    result = {'areas': polygons_area, 'lengths': polygons_lengths}
    return json.dumps(result)
