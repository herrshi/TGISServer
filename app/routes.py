# -*- coding: UTF-8 -*-
from flask import render_template, request
from app import app


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
    return render_template('server/geometry_service_lengths.html')
