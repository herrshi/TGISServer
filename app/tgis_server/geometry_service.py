from shapely.geometry import LineString
from shapely.ops import transform
from functools import partial


def length(params):
    line = LineString([(121.411243, 31.244787), (121.414912, 31.243429)])
    return line.length
