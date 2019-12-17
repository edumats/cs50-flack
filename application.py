import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import collections
from collections import deque

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
currentChannel = deque([], maxlen=1)

# Array with channel names
channelList = ["General", "Instagram", "Naniwa"]
messagesArchive = {
    "General": deque([], maxlen=100)
}


@app.route("/")
def index():
    return render_template("index.html")

# For transmitting current Channels
@socketio.on("available channels")
def availableChannel():
    emit("receive channels", channelList)

# For adding a new channel to List
@socketio.on("submit channel")
def channel(data):
    channel = data.get('channelName')
    if channel in channelList:
        return jsonify({"success": False})
    channelList.append(channel)
    emit("receive channels", channelList, broadcast=True)

# For joining a channel
@socketio.on("join channel")
def joinChannel(data):
    global currentChannel
    print(currentChannel)
    channel = data.get('currentChannel')
    currentChannel.append(channel)
    join_room(channel)
    emit('return message', {'messageField': 'has joined the room ' + channel})
    #if previousChannel != None:
        #leave_room(previousChannel)
        #emit('return message', {'messageField': 'has left the room ' + previousChannel})

    #if previousChannel != currentChannel:
        #join_room(data['currentChannel'])
        #previousChannel = currentChannel
        #emit('return join channel', currentChannel)
        #emit('return message', {'messageField': 'has joined the room ' + currentChannel})


# For receiving messages from clients
@socketio.on("receive message")
def message(data):
    print('message received in server')
    room = data.get('currentChannel')
    message = data.get('messageField')
    time = data.get('currentTime')
    messagesArchive[room].append([message, room, time]);
    print(messagesArchive)
    emit("return message", {'messageField': message, 'currentChannel': room, 'currentTime': time})
    print('server sent message to user in room ' + data['currentChannel'])

@socketio.on("previous messages")
def previousMessages():
    if message in messagesArchive:
        emit("receive previous messages", messagesArchive)

# Must add line below because of SocketIO bug: https://github.com/miguelgrinberg/Flask-SocketIO/issues/817
# Instead of "flask run", application is run using "python3 application.py"
if __name__ == "__main__":
    socketio.run(app, debug=True)
