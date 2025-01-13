from flask import Flask
from flask import Flask, send_from_directory

from routes import init as init_routes


app = Flask(__name__, static_folder='static')


@app.after_request
def set_headers(response):
    # Requred for WASM threads
    response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    return response


@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename)


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


init_routes(app)

if __name__ == '__main__':
    app.run(debug=True)
