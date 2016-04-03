from flask import Flask, request, jsonify, Response
from gevent.wsgi import WSGIServer
from playlist_downloader import download_songs_in_first_playlist_seen

app = Flask(__name__)

@app.route('/static/', methods=['GET'])
def index():
    return app.send_static_file('index.html')

@app.route('/crossdomain.xml', methods=['GET'])
def cross_domain():
    return app.send_static_file('crossdomain.xml')

@app.route('/songs_by_tag', methods=['POST'])
def songs_by_tag():
    if request.form.get('tag'):
        tag = request.form.get('tag')
        directory_and_files = download_songs_in_first_playlist_seen([tag])
        if directory_and_files is None:
            return jsonify({'message': 'No playlist found'}), 400
        else:
            return jsonify(directory_and_files)
    return jsonify({'message': 'Could not retrieve tag'}), 400

if __name__ == '__main__':
    print 'RedbirdHacks 2016'
    http_server = WSGIServer(('', 8000), app)
    http_server.serve_forever()
