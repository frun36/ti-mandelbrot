def authenticate(username, password):
    if username == 'admin' and password == 'admin':
        return {
            'username': 'admin',
            'snapshots': '[]',
        }
    elif username == 'user' and password == 'user':
        return {
            'username': 'user',
            'snapshots': '[]',
        }
    else:
        return False
