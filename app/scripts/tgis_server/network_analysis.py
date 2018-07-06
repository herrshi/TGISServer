import osmnx as ox
import matplotlib.pyplot as plt
import datetime

start_time = datetime.datetime.now()
print("Start to load graph")
graph = ox.graph_from_file("map.xml")
end_time = datetime.datetime.now()
print("Load graph: " + str((end_time - start_time).seconds) + "s")

graph_projected = ox.project_graph(graph)
ox.save_graph_shapefile(graph_projected, filename="network-shape-projected")
# ox.save_graphml(graph, filename="network.graphml")
print("success")

