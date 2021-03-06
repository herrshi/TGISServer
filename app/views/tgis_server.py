from flask import Blueprint, render_template, request
from app.scripts.tgis_server import lengths, areas, shortest_route

tgis_server = Blueprint('tgis_server', __name__,
                        template_folder='templates',
                        static_folder='static')


@tgis_server.route('/TGISServer')
def server_home():
    return render_template('server/server_home.html')


@tgis_server.route('/TGISServer/GeometryService/')
def geometry_service():
    return render_template('server/geometry_service.html')


@tgis_server.route('/TGISServer/GeometryService/lengths')
def geometry_service_lengths():
    # 没有输入参数则打开页面
    if not request.args:
        return render_template('server/geometry_service_lengths.html')
    # 有输入参数就进行计算
    else:
        return lengths(request.args)


@tgis_server.route('/TGISServer/GeometryService/areasAndLengths')
def geometry_service_areas():
    if not request.args:
        return render_template('server/geometry_service_areas.html')
    else:
        return areas(request.args)


@tgis_server.route('/TGISServer/NetworkService/')
def network_service():
    return render_template('server/network_service.html')


@tgis_server.route('/TGISServer/NetworkService/route')
def network_service_route():
    if not request.args:
        return render_template('server/network_service_route.html')
    else:
        return shortest_route(request.args)
