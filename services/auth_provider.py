def authenticate(username, password):
    if username == 'admin' and password == 'admin':
        return {
            'username': 'admin',
            'views': '[]',
        }
    elif username == 'user' and password == 'user':
        return {
            'username': 'user',
            'views': '[]',
        }
    else:
        return False
