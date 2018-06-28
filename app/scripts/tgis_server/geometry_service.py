from geographiclib.geodesic import Geodesic
from shapely.geometry import LineString
import json


def _get_geodesic_length(point1: list, point2: list) -> float:
    geodesic = Geodesic.WGS84
    g = geodesic.Inverse(point1[1], point1[0], point2[1], point2[0])
    distance = g['s12']
    return distance


def lengths(params: dict) -> str:
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
                    point1 = path[i - 1]
                    point2 = path[i]
                    segment_length = _get_geodesic_length(point1, point2)
                    path_length += segment_length
                    i = i + 1
                # 长度保留两位小数
                path_length = round(path_length, 4)
                lines_length.append(path_length)
        # 欧几里得长度
        elif calculation_type == 'planar':
            for path in paths:
                line = LineString(path)
                path_length = line.length
                lines_length.append(path_length)

    result = {'lengths': lines_length}
    return json.dumps(result)

