document.addEventListener('DOMContentLoaded', () => {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Variable for storing current channel
    let currentChannel = 'General';

    // Prevents Enter key to submit all form inputs
    let formList = document.querySelectorAll('.inputForm');
    formList.forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
        });
    })

    // When connected
    socket.on('connect', () => {

        console.log('connected');
        // List channels
        socket.emit('available channels');

        // Join channel General
        socket.emit('join channel', currentChannel);

    })

    // For messaging

    // Prevents sending empty messages
    validInput('#sendButton','#chatInput');

    // Listens for clicks and submits message to server
    document.getElementById('sendButton').onclick = () => {
        const messageField = document.getElementById('chatInput');
        socket.emit('receive message', {'messageField': messageField.value, 'currentChannel': currentChannel});
        messageField.value = '';
    }

    // Sends message through Enter key
    document.getElementById('chatInput').addEventListener('keyup', e => {
        if (e.keyCode === 13) {
            const messageField = document.getElementById('chatInput');
            socket.emit('receive message', {'messageField': messageField.value, 'currentChannel': currentChannel});
            messageField.value = '';
        }
    })

    // Display sent messages in page
    socket.on('return message', message => {
        console.log('received a message');
        const li = document.createElement('li');
        li.innerHTML = message;
        li.classList.add('list-group-item');
        document.getElementById('messagesList').append(li);
    })

    // Display messages from messagesArchive
    socket.on('receive previous messages', data => {
        data.forEach(message => {
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

        // Listens for clicks in each link in channel list and joins channel
        document.querySelectorAll('.channel-change').forEach( (link) => {
            link.onclick = () => {
                selectedChannel = link.getAttribute('data-channel');
                socket.emit('join channel', selectedChannel);
                currentChannel = selectedChannel;
                socket.emit('receive message', {'messageField': 'User entered chat'}, room=currentChannel);
            }
        })
    })



    // Listens for clicks on add channel button
    document.getElementById('addChannelButton').addEventListener('click', () => {
        $('#addChannelModal').modal();
        validInput('#submitChannel','#channelName');
    })

    // Listens for clicks on button
    document.getElementById('addDisplayName').onclick = login;
});

// For activating login modal
function login() {
    // Shows pop-up dialog for prompting display name
    $('#myModal').modal();

    validInput('#submitName','#displayName');

    // When form is submitted, creates request
    document.querySelector('#loginForm').onsubmit = () => {
        const username = document.querySelector('#displayName').value;
        const savedUser = localStorage.getItem('username');

        if (!savedUser) {
            localStorage.setItem('username', username);
        }
    };
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

    };
}
