from datetime import timedelta
from flask import Flask
from flask_jwt_extended import JWTManager

from routes import init as init_routes

app = Flask(__name__, static_folder='static')

app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIES_SECURE'] = False
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
app.config["JWT_SECRET_KEY"] = "random-secret-key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)

init_routes(app)

if __name__ == '__main__':
    app.run(debug=True)
