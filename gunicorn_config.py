bind = '0.0.0.0:8000'

daemon = True
pidfile = 'basic-flask.pid'

workers = 1
worker_cass = 'gevent'

errorlog = 'error.log'
loglevel = 'info'
accesslog = 'access.log'
