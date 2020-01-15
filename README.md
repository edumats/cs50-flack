# Project 2

## Web Programming with Python and JavaScript

This is a basic chat using Flask-SocketIO and a single page design.

### Installation

Run the below command to install all packages:
```
pip3 install -r requirements.txt
```

### Running

Please run application.py by using `python3 application.py` instead of `flask run`. Running `flask run` will get a `ValueError: signal only works in main thread` as by [Flask-SocketIO issue](https://github.com/miguelgrinberg/Flask-SocketIO/issues/817)

### Compatibility

Please use an updated Firefox or Chrome browser for best results.

Microsoft Edge and Safari will not display the chat's messages due to incompatibility with `CSS.escape()`

### Contents

You will find all client side code in static/script.js and all server side code in application.py. A favicon and styles file were added in /static.

### Personal Touch

- Website uses a single page design, all functions are handled by Flask-SocketIO
- Added logout function at the navbar
- Alert message is displayed when submitting a channel name that already exists and auto closes after 3 seconds
- Welcome message with user name is displayed in navbar
- Channel list highlights with blue color the current active channel
- Messages are displayed in chat when user enters/leaves channel and when users logs off
- When a new message is displayed at the page, the page automaticaly scrolls down
