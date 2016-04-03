from flask import Flask
from gevent.wsgi import WSGIServer

app = Flask(__name__)

@app.route('/static/', methods=['GET'])
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    print 'RedbirdHacks 2015'
    http_server = WSGIServer(('', 8000), app)
    http_server.serve_forever()
