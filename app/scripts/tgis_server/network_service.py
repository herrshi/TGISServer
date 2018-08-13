import json
import osmnx as ox
import networkx as nx


graph = ox.graph_from_file("app/static/data/map.osm")


# networkx.shortest_path返回的是节点列表, 需要将节点间的路径查询出来
def _get_route_from_path(path: list) -> list:
    route = []
    for i in range(len(path) - 1):
        node_id = path[i]
        next_node_id = path[i + 1]
        segment = graph[node_id][next_node_id][0]

        if "geometry" in segment:
            # 两个node之间为折线时, edge会有geometry(LineString)
            line = segment["geometry"]
            if i == 0:
                # 第一段线时加入起始点
                route.extend(list(line.coords))
            else:
                # 第二段线开始要去掉LineString中的第一个点, 此点和上一段线的最后一个点重复
                route.extend(list(line.coords)[1:])
        else:
            # 两个node之间为直线时, edge中不包含geometry, 用node的坐标连线即可
            node = graph.node[node_id]
            next_node = graph.node[next_node_id]
            if i == 0:
                # 第一段线时加入当前node坐标
                route.append((node["x"], node["y"]))
            # 第二段线开始只需要下一node坐标, 当前node和上一段线的最后一个点重复
            route.append((next_node["x"], next_node["y"]))
    return route


def shortest_route(params: dict) -> str:
    stops_string = params.get("stops")
    stops = json.loads(stops_string)
    routes = []

    for index in range(len(stops) - 1):
        stop = stops[index]
        next_stop = stops[index + 1]
        point1 = (stop[1], stop[0])
        point2 = (next_stop[1], next_stop[0])
        closest_node1 = ox.get_nearest_node(graph, point1, method="haversine")
        closest_node2 = ox.get_nearest_node(graph, point2, method="haversine")
        path = nx.shortest_path(graph, closest_node1, closest_node2)
        route = _get_route_from_path(path)
        print(route)
        if index == 0:
            routes.extend(route)
        else:
            routes.extend(route[1:])
    return json.dumps(routes)



