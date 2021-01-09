import os
import sys

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# initialize channel list and
# start with a general channel
channels = ['general']

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("submit channel")
def list_channels(data):
    channels.append(data) if data not in channels else channels
    print(channels, file=sys.stderr)
    emit("announce", {"channels": channels}, broadcast=True)
