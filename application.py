import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import collections
from collections import deque

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Dict with channel names and lists to archive messages
messagesArchive = {
    "General": deque([], maxlen=100)
}

@app.route("/")
def index():
    return render_template("index.html")

# For returning current channels
@socketio.on("available channels")
def availableChannel():
    # Get keys from messagesArchive dict as a list
    channelList = list(messagesArchive)
    emit("receive channels", channelList)

# For adding a new channel to List
@socketio.on("submit channel")
def channel(data):
    channel = data.get('channelName')
    # Checks if submitted channel exists as a key in dict
    if channel in messagesArchive.keys():
        return jsonify({"success": False})
    # Creates a new key and initializes with a deque with max length 100
    # Saw on https://docs.quantifiedcode.com/python-anti-patterns/correctness/not_using_setdefault_to_initialize_a_dictionary.html
    messagesArchive.setdefault(channel, deque([], maxlen=100))
    # Get keys from dict as a list
    channelList = list(messagesArchive)
    emit("receive channels", channelList, broadcast=True)

# For joining a channel
@socketio.on("join channel")
def joinChannel(data):
    currentChannel = data.get('currentChannel')
    selectedChannel = data.get('selectedChannel')
    if selectedChannel == 'empty':
        print('joining a channel for the first time')
        join_room(currentChannel)
        emit('return message', {'messageField': 'has joined the room ' + currentChannel, 'currentChannel': currentChannel, 'currentTime': data.get('currentTime'), 'user': data.get('user')}, room=currentChannel)
    else:
        print('switching channels')
        leave_room(currentChannel)
        emit('return message', {'messageField': 'has left the room ' + currentChannel, 'currentChannel':currentChannel, 'currentTime': data.get('currentTime'), 'user': data.get('user')}, room=currentChannel)
        join_room(selectedChannel)
        if len(messagesArchive[selectedChannel]) == 0:
            print('messages are here')
        emit('return message', {'messageField': 'has joined the room ' + selectedChannel, 'currentChannel': currentChannel, 'currentTime': data.get('currentTime'), 'user': data.get('user')}, room=selectedChannel)

# For receiving messages from clients
@socketio.on("receive message")
def message(data):
    print('message received in server')
    room = data.get('currentChannel')
    message = data.get('messageField')
    time = data.get('currentTime')
    user = data.get('user')
    messagesArchive[room].append([message, room, time, user]);
    print(messagesArchive)
    emit("return message", {'messageField': message, 'currentChannel': room, 'currentTime': time, 'user': user}, room=room)
    print('server sent message to user in room ' + room)

@socketio.on("previous messages")
def previousMessages(data):
    channel = data.get('currentChannel')
    if message in messagesArchive[channel]:
        emit("receive previous messages", messagesArchive)



# Must add line below because of SocketIO bug: https://github.com/miguelgrinberg/Flask-SocketIO/issues/817
# Instead of "flask run", application is run using "python3 application.py"
if __name__ == "__main__":
    socketio.run(app, debug=True)
