from geographiclib.geodesic import Geodesic
import json


def _get_length(point1: list, point2: list) -> float:
    geod = Geodesic.WGS84
    g = geod.Inverse(point1[1], point1[0], point2[1], point2[0])
    distance = g['s12']
    return distance


def lengths(params: str) -> str:
    lines_string = params.get('polylines')
    lines = json.loads(lines_string)
    lines_length = []
    for line in lines:
        paths = line.get('paths')
        for path in paths:
            i = 1
            path_length = 0
            while i < len(path):
                point1 = path[i - 1]
                point2 = path[i]
                segment_length = _get_length(point1, point2)
                path_length += segment_length
                i = i + 1
            lines_length.append(path_length)

    result = {'lengths': lines_length}
    return json.dumps(result)

