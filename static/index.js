function display_channels(channels) {
    console.log("displaying channels:")
    console.log(channels)
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

document.addEventListener('DOMContentLoaded', () => {
    // Set starting channels to contain only general channel
    // if (!localStorage.getItem('user'))
    //     localStorage.setItem('channels', JSON.stringify(['general']));

    // Display current value of channels
    // display_channels(JSON.parse(localStorage.getItem('channels')));

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {
        // upon connecting, get updated list of channels
        socket.emit('update channels');

        // When submit_channel button is clicked,
        // emit an update channels event with the
        // channel name
        document.querySelector('#channel_submit').onclick = function() {
            const new_channel = document.querySelector('#channel').value
            socket.emit('update channels', new_channel);
        };
    });

    // When channels are sent, update the channel display
    socket.on('send channels', data => {
        const channels = data["channels"] 
        // display list of channels
        display_channels(channels)
        // clear field where new channel name was entered
        document.getElementById('channel').value = ''
        console.log("after clearing input")
    });

});
