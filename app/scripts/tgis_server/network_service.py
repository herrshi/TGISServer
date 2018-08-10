import json
import osmnx as ox
from flask import url_for


data_path = url_for()
graph = ox.graph_from_file("map.osm")


def routes(params: dict) -> str:
    stops_string = params.get('stops')
    stops = json.loads(stops_string)

    for stop in stops:
        x = stop[0]
        y = stop[1]

    return ""
