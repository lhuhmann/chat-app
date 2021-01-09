document.addEventListener('DOMContentLoaded', () => {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {
        // When submit_channel button is clicked,
        // emit a submit channel event with the
        // channel name
        document.querySelector('#channel_submit').onclick = function() {
            const channel_name = document.querySelector('#channel').value;
            console.log(channel_name);
            socket.emit('submit channel', channel_name);
        };
    });

    // When a new channel name is announced, add it to the list
    socket.on('announce', data => {
        // console.log(data["channels"])
        // clear list of channels
        document.getElementById("channels_list").innerHTML = "";
        // show list of channels
        data["channels"].forEach(function (item) {
            var ul = document.getElementById('channels_list');
            var li = document.createElement("li");
            li.innerHTML += item;
            ul.appendChild(li);
        });
        document.getElementById('channel').value = ''
        console.log("after clearing input")
    });
});
