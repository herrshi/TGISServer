from geographiclib.geodesic import Geodesic


def length(params):
    pt1 = [121.411243, 31.244787]
    pt2 = [121.414912, 31.243429]
    geod = Geodesic.WGS84
    g = geod.Inverse(pt1[1], pt1[0], pt2[1], pt2[0])
    distance = g['s12']
    return distance
