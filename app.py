import os
import sys

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# when app is first started, define only general channel
channels = ['general']

@app.route("/")
def index():
    return render_template("index.html")

# @socketio.on("get channels")
# def send_channels():
#     emit("send channels", {"channels": channels}, broadcast=True)

@socketio.on("update channels")
def update_channels(new_channel = None):
    if new_channel:
        channels.append(new_channel) if new_channel not in channels else channels
    emit("send channels", {"channels": channels}, broadcast=True)

@socketio.on("add username")
def add_username(username):
    print(username, file=sys.stderr)
    emit("send username", {"username": username}, broadcast=True)
