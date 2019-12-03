document.addEventListener('DOMContentLoaded', () => {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {
        document.getElementById('submitChannel').onclick= () => {
            const channelName = document.getElementById('channelName').value;
            socket.emit('submit channel', {'channelName': channelName});
        }
    })

    socket.on('announce channel', data => {
        const li = document.createElement('li');
        li.innerHTML = '${data.channelName}'
        document.querySelector('#channelList').append(li);
    })

    document.getElementById('addChannelButton').addEventListener('click', () => {
        $('#addChannelModal').modal();
        validInput('#submitChannel','#channelName');
    })

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

// Prevents empty inputs being sent
function validInput(button, input) {
    console.log('validating');
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
