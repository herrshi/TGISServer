# -*- coding: UTF-8 -*-
from flask import render_template, request
from app import app

from app.tgis_server.geometry_service import lengths


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/TGISServer')
def server_home():
    return render_template('server/server_home.html')


@app.route('/TGISServer/GeometryService/')
def geometry_service():
    return render_template('server/geometry_service.html')


@app.route('/TGISServer/GeometryService/lengths')
def geometry_service_lengths():
    # 没有输入参数则打开页面
    if not request.args:
        return render_template('server/geometry_service_lengths.html')
    # 有输入参数就进行计算
    else:
        return lengths(request.args)
