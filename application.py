import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Array with channel names
channelList = ["General", "Instagram", "Naniwa"];

@app.route("/")
def index():
    return render_template("index.html")

# For transmitting current Channels
@socketio.on("available channels")
def availableChannel():
    emit("receive channels", channelList)

# For adding a new channel
@socketio.on("submit channel")
def channel(data):
    channel = data["channelName"]
    if channel in channelList:
        return jsonify({"success": False})
    channelList.append(channel)
    emit("receive channels", channelList, broadcast=True)

# For sending messages
@socketio.on("receive message")
def message(message):
    print(message['messageField'])
    emit("return message", message['messageField'], broadcast=True)

# For joining a room
# Not working yet
@socketio.on("join")
def onJoin(data):
    username = data['username']
    room = data['room']
    join_room(room)
    send(username + ' has entered the room.', room=room)

# For leaving a room
# Not working yet
@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    send(username + ' has left the room.', room=room)

# Must add line below because of SocketIO bug: https://github.com/miguelgrinberg/Flask-SocketIO/issues/817
# Instead of "flask run", application is run using "python3 application.py"
if __name__ == "__main__":
    socketio.run(app, debug=True)
