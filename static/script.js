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

        const currentChannel = localStorage.getItem('channel');
        let currentTime = new Date();
        // Join current channel and sends current date/time
        socket.emit('join channel', {'currentChannel': currentChannel, 'currentTime': currentTime});
    })

    // For messaging

    // Prevents sending empty messages
    validInput('#sendButton','#chatInput');

    // Listens for clicks and submits message to server
    document.getElementById('sendButton').onclick = () => {
        const channel = localStorage.getItem('channel');
        const message = document.getElementById('chatInput');
        sendMessage(message, channel);
    }

    // Sends message through Enter key
    document.getElementById('chatInput').addEventListener('keyup', e => {
        if (e.keyCode === 13) {
            const channel = localStorage.getItem('channel');
            const message = document.getElementById('chatInput');
            if (messageField.value.length > 0) {
                sendMessage(message, channel)
            }
        }
    })

    // Display sent messages in page
    socket.on('return message', data => {
        const currentChannel = localStorage.getItem('channel');
        console.log('Receiving message in room ' + currentChannel);
        const p = document.createElement('p');
        user = localStorage.getItem('username');
        p.innerHTML = '<strong>' + '@' + user + '</strong>' + ' ' + '@' + data['currentTime'] + ' ' + data['messageField']
        document.getElementById('messagesList').append(p);
    })

    // Display messages from messagesArchive
    socket.on('receive previous messages', data => {
        data.forEach(message => {
            console.log('receiving message from server');
            const li = document.createElement('li');
            li.innerHTML = message;
            li.classList.add('list-group-item');
            document.getElementById('messagesList').append(li);
        })
    })

    // For channel

    // Listens for channel name submissions
    document.getElementById('submitChannel').onclick = () => {
        const channelName = document.getElementById('channelName').value;
        socket.emit('submit channel', {'channelName': channelName});
        channelName.value = '';
    }

    // Prevents default behavior of Enter key and sends input to server
    document.getElementById('channelForm').addEventListener('submit', e => {
        e.preventDefault();
        const channelName = document.getElementById('channelName').value;
        socket.emit('submit channel', {'channelName': channelName});
        document.getElementById('channelName').value = '';
        $('#addChannelModal').modal('hide');
    })

    // Displays channel List on page
    socket.on('receive channels', data => {
        document.querySelector('#channelList').innerHTML = '';
        data.forEach(item => {
            const a = document.createElement('a');
            a.classList.add('list-group-item', 'list-group-item-action', 'channel-change');
            a.setAttribute('data-channel', item);
            a.innerHTML = item;
            document.querySelector('#channelList').append(a);
        })
    })

    socket.on('return join channel', data => {

        localStorage.setItem('channel', data);
        console.log('Returning channel ' + data);
    })

        // Listens for clicks in each link in channel list and joins channel
    document.querySelectorAll('.channel-change').forEach( (link) => {
        link.onclick = () => {
            console.log('Clicked on link');
            const currentChannel = localStorage.getItem('channel');
            const selectedChannel = link.getAttribute('data-channel');
            socket.emit('join channel', {'currentChannel': selectedChannel});
            console.log("Channel sent to server");
            localStorage.setItem('channel', selectedChannel);
        }
    })

    // Listens for clicks on add channel button
    document.getElementById('addChannelButton').addEventListener('click', () => {
        $('#addChannelModal').modal();
        validInput('#submitChannel','#channelName');
    })

    // Listens for clicks on login button
    document.getElementById('addDisplayName').onclick = login;

    // Listens for clicks on logout button
    document.getElementById('logoutLink').onclick = logout;

    // Sends to server message, channel and time data
    function sendMessage(message, channel) {
        let time = new Date();
        socket.emit('receive message', {'messageField': message.value, 'currentChannel': channel, 'currentTime': time});
        console.log('Sent message in room ' + channel);
        message.value = '';
    }

    // For activating login modal
    function login() {
        // Get user name
        let userExists = localStorage.getItem('username');
        if (!userExists) {
            // Shows pop-up dialog for prompting display name
            $('#myModal').modal();

            // Do no let empty inputs being posted
            validInput('#submitName','#displayName');

            // When form is submitted, creates request
            document.querySelector('#submitName').onclick = () => {
                const username = document.querySelector('#displayName');
                localStorage.setItem('username', username.value);
                username.value = "";
                $('#myModal').modal('hide');
            }
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
