# -*- coding: UTF-8 -*-
from flask import render_template, request
from app import app


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/TGISServer')
def server_home():
    return render_template('server/server_home.html')


@app.route('/TGISServer/GeometryServer/')
def geometry_server():
    return render_template('server/geometry_server.html')
