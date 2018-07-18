import datetime

import networkx as nx
import osmnx as ox
import utm
from shapely.geometry import box

start_time = datetime.datetime.now()
graph = ox.graph_from_file("map.osm", network_type="drive")
# graph = ox.graph_from_place("Kamppi, Helsinki, Finland", network_type="drive")
end_time = datetime.datetime.now()
print("Load graph: " + str((end_time - start_time).seconds) + "s")

edges = ox.graph_to_gdfs(graph, nodes=False, edges=True)

start_time = datetime.datetime.now()
graph_proj = ox.project_graph(graph)
end_time = datetime.datetime.now()
print("Project graph:" + str((end_time - start_time).seconds) + "s")
# fig, ax = ox.plot_graph(graph_proj)
# plt.tight_layout()

nodes_proj, edges_proj = ox.graph_to_gdfs(graph_proj, nodes=True, edges=True)
print("Coordinate system:", edges_proj.crs)

bbox = box(*edges_proj.unary_union.bounds)
print(bbox)

orig_point = bbox.centroid
print(orig_point)
orig_point_utm = utm.from_latlon(longitude=121.43741, latitude=31.239888)
print(orig_point_utm)

nodes_proj["x"] = nodes_proj.x.astype(float)
maxx = nodes_proj["x"].max()

target_loc = nodes_proj.loc[nodes_proj["x"] == maxx, :]
target_point = target_loc.geometry.values[0]
target_point_utm = utm.from_latlon(longitude=121.465391, latitude=31.235118)
print(target_point)

# orig_xy = (orig_point.y, orig_point.x)
# target_xy = (target_point.y, target_point.x)
orig_xy = (orig_point_utm[1], orig_point_utm[0])
target_xy = (target_point_utm[1], target_point_utm[0])
orig_node = ox.get_nearest_node(graph_proj, orig_xy, method="euclidean")
target_node = ox.get_nearest_node(graph_proj, target_xy, method="euclidean")
# o_closest = nodes_proj.loc[orig_node]
# t_closest = nodes_proj.loc[target_node]
# od_nodes = gpd.GeoDataFrame([o_closest, t_closest], geometry="geometry", crs=nodes_proj.crs)
route = nx.shortest_path(G=graph_proj, source=orig_node, target=target_node, weight="length")
print(route)

# m = ox.plot_route_folium(graph_proj, )

# fig, ax = ox.plot_graph_route(graph_proj, route, origin_point=orig_xy, destination_point=target_xy)
# plt.tight_layout()
