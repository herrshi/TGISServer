from shapely.geometry import LineString
from shapely.ops import transform
from functools import partial
import pyproj


def length(params):
    line = LineString([(121.411243, 31.244787), (121.414912, 31.243429)])
    geod = pyproj.Geod(ellps='WGS84')
    angle1, angle2, distance = geod.inv(121.411243, 31.244787, 121.414912, 31.243429)
    return distance
