import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
previousChannel = None

# Array with channel names
channelList = ["General", "Instagram", "Naniwa"]
messagesArchive = []

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
    channel = data["channelName"]
    if channel in channelList:
        return jsonify({"success": False})
    channelList.append(channel)
    emit("receive channels", channelList, broadcast=True)

# For joining a channel
@socketio.on("join channel")
def joinChannel(data):
    global previousChannel
    currentChannel = data['currentChannel']
    if previousChannel != None:
        leave_room(previousChannel)
        emit('return message', 'has left the room ' + previousChannel)

    join_room(data['currentChannel'])
    previousChannel = currentChannel
    emit('return join channel', currentChannel)
    emit('return message', 'has entered the room ' + currentChannel)

# For sending messages
@socketio.on("receive message")
def message(data):
    messagesArchive.append(data['messageField']);
    print(data['currentChannel'])
    emit("return message", data['messageField'], room=data['currentChannel'])

@socketio.on("previous messages")
def previousMessages():
    if message in messagesArchive:
        emit("receive previous messages", messagesArchive)

# Must add line below because of SocketIO bug: https://github.com/miguelgrinberg/Flask-SocketIO/issues/817
# Instead of "flask run", application is run using "python3 application.py"
if __name__ == "__main__":
    socketio.run(app, debug=True)
