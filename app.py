import os
import sys

from flask import Flask, render_template, redirect, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# when app is first started, define only general channel
channels = {'general': []}

@app.route("/<string:channel_name>")
def channel(channel_name):
    return render_template("index.html", channel = channel_name)

@app.route("/")
def index():
    '''Redirect to general channel'''
    return redirect(url_for('channel', channel_name="general"))

@socketio.on("update channels")
def update_channels(new_channel = None):
    # if the user specified a channel that isn't already in the dictionary,
    # add a dictionary entry for that channel
    if new_channel:
        if not new_channel in channels:
            channels[new_channel] = []
    emit("send channels", {"channels": channels}, broadcast=True)

@socketio.on("update messages")
def update_messages(channel = None, username = None, message = None):
    if channel:
        # append submitted username-message pair to the relevant channel
        channels[channel].append({f"{username}": f"{message}"})
    emit("send messages", {"channels": channels}, broadcast=True)

@socketio.on("add username")
def add_username(username):
    print(username, file=sys.stderr)
    emit("send username", {"username": username}, broadcast=True)
