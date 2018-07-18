import json

import matplotlib.pyplot as plt
import networkx as nx
import osmnx as ox

G = ox.graph_from_file("map.osm")

# nodes, _ = ox.graph_to_gdfs(G)

library = (31.242, 121.433)
museum = (31.235, 121.45)

closest_node_to_lib = ox.get_nearest_node(G, library, method='haversine')
closest_node_to_museum = ox.get_nearest_node(G, museum, method='haversine')

route = nx.shortest_path(G, closest_node_to_lib,
                         closest_node_to_museum)
print(route)

total_line = []
for i in range(len(route) - 1):
    # 当前node
    node_id = route[i]
    # 下一node
    next_node_id = route[i + 1]
    segment = G[node_id][next_node_id][0]
    # 两个node之间为直线时, edge中不包含geometry, 用node的坐标连线即可
    # 两个node之间为折线时, edge会有geometry(LineString)
    if 'geometry' in segment:
        line = segment['geometry']
        if i == 0:
            # 第一段线时加入起始点
            total_line.extend(list(line.coords))
        else:
            # 第二段线开始要去掉LineString中的第一个点, 此点和上一段线的最后一个点重复
            total_line.extend(list(line.coords)[1:])
    else:
        node = G.node[node_id]
        next_node = G.node[next_node_id]
        if i == 0:
            # 第一段线时加入当前node坐标
            total_line.append((node['x'], node['y']))
        # 第二段线开始只需要下一node坐标, 当前node和上一段线的最后一个点重复
        total_line.append((next_node['x'], next_node['y']))
print(total_line)
print(json.dumps({"paths": [total_line]}))

fig, ax = ox.plot_graph_route(G, route, fig_height=30,
                              fig_width=30,
                              show=False, close=False,
                              edge_color='black')
ax.scatter(library[1], library[0], c='red', s=100)
ax.scatter(museum[1], museum[0], c='blue', s=100)

plt.show()
