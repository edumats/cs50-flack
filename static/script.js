document.addEventListener('DOMContentLoaded', () => {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Prevents Enter key to submit all form inputs
    const formList = document.querySelectorAll('.inputForm');
    formList.forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
        });
    })

    // When connected, do:
    socket.on('connect', () => {
        // Logs in
        login();

        // List channels
        socket.emit('available channels');

        // If no channel is stored locally, create one
        if (!localStorage.getItem('channel'))
            localStorage.setItem('channel', 'General')
    })

    socket.on('log in', (data) => {
        // Join current channel and sends current date/time
        console.log('Logging in');
        const currentChannel = localStorage.getItem('channel');
        const currentTime = new Date();
        socket.emit('join channel', {'currentChannel': currentChannel, 'currentTime': currentTime, 'selectedChannel': 'empty'});
    })
    /*


    For messaging related


    */

    // Prevents sending empty messages
    validInput('#sendButton','#chatInput');

    // Listens for clicks and submits message to server
    document.getElementById('sendButton').onclick = () => {
        const channel = localStorage.getItem('channel');
        const message = document.getElementById('chatInput');
        sendMessage(message, channel);
    }

    // Sends message through Enter key if not empty
    document.getElementById('chatInput').addEventListener('keyup', e => {
        if (e.keyCode === 13) {
            const channel = localStorage.getItem('channel');
            const message = document.getElementById('chatInput');
            if (message.value.length > 0) {
                sendMessage(message, channel)
            }
        }
    })

    // Display sent messages in page
    socket.on('return message', data => {
        // currentChannel not being used
        console.log('receiving message from server');
        const currentChannel = data['currentChannel'];
        console.log('Receiving message in room ' + currentChannel);

        const user = data['user'];
        const message = data['messageField'];
        const time = data['currentTime'];
        const p = document.createElement('p');
        p.innerHTML = '<strong>' + user + '</strong>' + ' ' + '@' + time + ' ' + message;
        document.getElementById('messagesList').append(p);
    })

    // Display messages from messagesArchive
    socket.on('receive previous messages', data => {
        data.forEach(message => {
            console.log('receiving message from server');
            const li = document.createElement('li');
            li.innerHTML = message;
            li.classList.add('list-group-item', 'message-item');
            document.getElementById('messagesList').append(li);
        })
    })

    /*


    For channel related



    */

    // Receiving channel as list and displaying on page
    socket.on('receive channels', data => {
        document.querySelector('#channelList').innerHTML = '';
        // Gets array of channels and create html for each one
        data.forEach(item => {
            const a = document.createElement('a');
            a.classList.add('singleChannel', 'list-group-item', 'list-group-item-action');
            a.setAttribute('data-channel', item);
            a.innerHTML = item;
            document.querySelector('#channelList').append(a);
            // Listens for clicks in each channel in channel list and sends a join signal to server if clicked
            document.querySelectorAll('.singleChannel').forEach((channel) => {
                channel.onclick = () => {
                    let currentTime = new Date();
                    const selectedChannel = channel.getAttribute('data-channel');
                    const currentChannel = localStorage.getItem('channel');
                    socket.emit('join channel', {'selectedChannel': selectedChannel, 'currentTime': currentTime, 'currentChannel': currentChannel});
                    localStorage.setItem('channel', selectedChannel);
                }
            })
        })
    })

    // Listens for channel name submissions
    document.getElementById('submitChannel').onclick = () => {
        const channelName = document.getElementById('channelName');
        socket.emit('submit channel', {'channelName': channelName.value});
        channelName.value = '';
    }

    document.getElementById('channelName').addEventListener('keyup', e => {
        if (e.keyCode === 13) {
            const channelName = document.getElementById('channelName');
            if (channelName.value.length > 0) {
                socket.emit('submit channel', {'channelName': channelName.value});
                channelName.value = '';
            }
        }
    })

    // Prevents default behavior of Enter key and sends input to server
    document.getElementById('channelForm').addEventListener('submit', e => {
        e.preventDefault();
        const channelName = document.getElementById('channelName').value;
        socket.emit('submit channel', {'channelName': channelName});
        document.getElementById('channelName').value = '';
        $('#addChannelModal').modal('hide');
    })

    // Listens for clicks on login button
    document.getElementById('addDisplayName').onclick = login;

    // Listens for clicks on logout button
    document.getElementById('logoutLink').onclick = logout;

    // Sends to server message, channel and time data
    function sendMessage(message, channel) {
        let time = new Date();
        let user = localStorage.getItem('username');
        socket.emit('receive message', {'messageField': message.value, 'currentChannel': channel, 'currentTime': time, 'user': user});
        console.log('Sent message in room ' + channel);
        message.value = '';
    }

    // For activating login modal
    function login() {
        // Get user name
        let userExists = localStorage.getItem('username');
        if (!userExists) {
            // Shows pop-up dialog for prompting display name
            $('#userModal').modal();

            // Do no let empty inputs being posted
            validInput('#submitName','#displayName');

            // When form is submitted, creates request
            document.querySelector('#submitName').onclick = () => {
                const username = document.querySelector('#displayName');
                localStorage.setItem('username', username.value);
                username.value = "";
                socket.emit('log in', {'user': username});
                $('#userModal').modal('hide');
            }

            document.querySelector('#displayName').addEventListener('keyup', e => {
                if (e.keyCode === 13) {
                    if (displayName.value.length > 0) {
                        const username = document.querySelector('#displayName');
                        localStorage.setItem('username', username.value);
                        username.value = "";
                        socket.emit('log in', {'user': username});
                        $('#userModal').modal('hide');
                    }
                }
            })
        }
    }

    // Deletes username data in local storage
    function logout() {
        console.log('Deleting user  data');
        localStorage.clear();
    }

    // Prevents empty inputs being sent in prompts.
    // Input = response from user, button = element that triggers submission
    function validInput(button, input) {
        // Disables submit button by default
        document.querySelector(button).disabled = true;

        // Enables submit button only if user typed something on display name input field
        document.querySelector(input).onkeyup = () => {
            if (document.querySelector(input).value.length > 0) {
                document.querySelector(button).disabled = false;
            } else {
                document.querySelector(button).disabled = true;
            }

        }
    }
})
