import sys

if len(sys.argv) < 2:
    print("Usage: %s PORT" % sys.argv[0])
    sys.exit(1)
port = int(sys.argv[1])

sys.path.insert(0, '.')

from app import app as application
from app import socketio

socketio.run(application, port=port)
