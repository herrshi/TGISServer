# -*- coding: UTF-8 -*-
from flask import render_template, request
from app import app


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/TGISServer')
def server_home():
    return render_template('ServerHome.html')


@app.route('/hello')
def hello():
    return render_template('hello.html')


@app.route('/TGISServer/GeometryServer/length')
def length():
    points_param = request.args.get('points')
