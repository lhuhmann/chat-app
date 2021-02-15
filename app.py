import os
import sys

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# when app is first started, define only general channel
channels = {'general': []}

@app.route("/channel/<string:channel_name>")
def channel(channel_name):
    return render_template("index.html", channel = channel_name)

@app.route("/")
def index():
    '''Send user to a blank html page that will run the javascript
    to identify and load the correct page.'''
    return render_template('go_to_channel.html')

@socketio.on("update channels")
def update_channels(new_channel = None):
    # if the user specified a channel that isn't already in the dictionary,
    # add a dictionary entry for that channel
    duplicate_channel_added = False
    if new_channel:
        if not new_channel in channels:
            channels[new_channel] = []
        else:
            duplicate_channel_added = True
    emit("send channels", {"channels": channels, "duplicate_channel_added": duplicate_channel_added}, broadcast=True)

@socketio.on("update messages")
def update_messages(channel = None, username = None, message = None):
    if channel:
        # append submitted username-message pair to the relevant channel
        channels[channel].append({f"{username}": f"{message}"})
        # if there are too many messages, truncate to 100 messages
        if len(channels[channel]) > 100:
            channels[channel] = channels[channel][-100:]
    emit("send messages", {"channels": channels}, broadcast=True)

@socketio.on("add username")
def add_username(username):
    emit("send username", {"username": username})
