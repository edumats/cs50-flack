document.addEventListener('DOMContentLoaded', () => {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // Prevents Enter key to submit the input
    document.getElementById('channelForm').addEventListener('submit', (e) => {
        e.preventDefault();
    })

    // Prevents default submission and sends input data to server
    document.getElementById('chatForm').addEventListener('submit', e => {
        e.preventDefault();
        const messageField = document.getElementById('chatInput');
        socket.emit('receive message', {'messageField': messageField.value});
        messageField.value = '';
    })

    /*
    // Prevents Enter key to submit all form inputs
    let formList = document.querySelectorAll('.inputForm');
    formList.forEach(form => {
        console.log('deactivating');
        form.addEventListener('submit', e => {
            e.preventDefault();
        });
    })
    */
    // When connected
    socket.on('connect', () => {
        // List channels
        socket.emit('available channels');

        //Send message
        socket.emit('message', 'User has connected');

        // Listens for messages submissions to server

        document.getElementById('sendButton').onclick = () => {
            const messageField = document.getElementById('chatInput').value;
            socket.emit('receive message', {'messageField': messageField});
        }

        //document.getElementById('sendButton').onclick = sendChannel;

        // Listens for channel name submissions
        document.getElementById('submitChannel').onclick = () => {
            const channelName = document.getElementById('channelName').value;
            socket.emit('submit channel', {'channelName': channelName});
        }
        /*
        // Sends form content to server
        function sendChannel() {
            const channelName = document.getElementById('channelName').value;
            console.log("content is " + channelName);
            socket.emit('submit channel', {'channelName': channelName});
        }
        */
    })

    // Display sent messages in page
    socket.on('return message', message => {
        const li = document.createElement('li');
        li.innerHTML = message;
        document.getElementById('messagesList').append(li);
    })

    // Displays channel List on page
    socket.on('receive channels', data => {
        document.querySelector('#channelList').innerHTML = '';
        data.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = item;
            document.querySelector('#channelList').append(li);
        })
    })

    // Listens for clicks on add channel button
    document.getElementById('addChannelButton').addEventListener('click', () => {
        $('#addChannelModal').modal();
        validInput('#submitChannel','#channelName');
    })

    // Listens for clicks on button
    document.getElementById('addDisplayName').onclick= () => {
        login();
    };
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

        document.querySelector('#result').innerHTML = localStorage.getItem('username');


    };
}

// Prevents empty inputs being sent in prompts.
// Input = response from user, button = element that triggers submission
function validInput(button, input) {
    // Disables submit button by default
    document.querySelector(button).disabled = true;

    // Enables submit button only if user typed something on display name input field
    document.querySelector(input).onkeyup = () => {
        if (document.querySelector(input).value.length > 0)
            document.querySelector(button).disabled = false;
        else
            document.querySelector(button).disabled = true;
    };
}
