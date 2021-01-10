function display_channels(channels) {
    // clear list of channels
    document.getElementById("channels_list").innerHTML = "";
    // show list of channels
    channels.forEach(function (item) {
        var ul = document.getElementById('channels_list');
        var li = document.createElement("li");
        li.innerHTML += item;
        ul.appendChild(li);
    });
};

function display_username(username) {
    // Add to the document
    const name = document.createElement("name")
    // Important to use backticks and not apostrophes/single quotes here, 
    // otherwise template literals will not resovle.
    name.innerHTML = `Username: ${username}`;
    document.querySelector("#displayed_username").append(name);
}

document.addEventListener('DOMContentLoaded', () => {
    // if user exists, display username and channel form but not
    // username form
    if (localStorage.getItem('username')) {
        console.log('user exists')
        display_username(localStorage.getItem('username'));
        document.querySelector("#username_form").style.visibility = 'hidden'
        document.querySelector("#channel_form").style.visibility = 'visible'
    // If user doesn't exist, don't display channel form and
    // only display username creation form.
    } else {
        console.log('user does not exist')
        document.querySelector("#username_form").style.visibility = 'visible'
        document.querySelector("#channel_form").style.visibility = 'hidden'
    }

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {
        // upon connecting, get updated list of channels
        socket.emit('update channels');

        // When channel_submit button is clicked,
        // emit an update channels event with the
        // channel name
        document.querySelector('#channel_submit').onclick = function() {
            const new_channel = document.querySelector('#channel').value
            socket.emit('update channels', new_channel);
        };

        // When username_submit button is clicked,
        // emit an add username event with the
        // username
        document.querySelector('#username_submit').onclick = function() {
            const username = document.querySelector('#username').value
            socket.emit('add username', username);
        };
    });

    // When channels are sent, update the channel display
    socket.on('send channels', data => {
        const channels = data["channels"] 
        // display list of channels
        display_channels(channels)
        // clear field where new channel name was entered
        document.getElementById('channel').value = ''
    });

    socket.on('send username', data => {
        const username = data["username"] 
        console.log("username is")
        console.log(username)
        // add username to local storage
        localStorage.setItem('username', username);
        // display username
        display_username(username)
        // hide username form and show channel form
        document.querySelector("#username_form").style.visibility = 'hidden'
        document.querySelector("#channel_form").style.visibility = 'visible'
    });
});
