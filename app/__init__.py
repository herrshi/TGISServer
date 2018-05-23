from flask import Flask
from flask_bootstrap import Bootstrap

import logging
from logging.handlers import TimedRotatingFileHandler

app = Flask(__name__)
bootstrap = Bootstrap(app)
app.config['BOOTSTRAP_SERVE_LOCAL'] = True

all_log_handler = TimedRotatingFileHandler('log/all.log', when='midnight', interval=1)
all_log_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))
all_log_handler.setLevel(logging.INFO)
app.logger.addHandler(all_log_handler)

error_log_handler = TimedRotatingFileHandler('log/error.log', when='midnight', interval=1)
error_log_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
error_log_handler.setLevel(logging.ERROR)
app.logger.addHandler(error_log_handler)
app.logger.setLevel(logging.INFO)

app.logger.info('TGISServer startup')

from app import routes

