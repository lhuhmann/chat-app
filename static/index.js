/**
 * If a channel is specified in localStorage, go to that channel.
 * Otherwise, go to the general channel.
 */
function go_to_channel() {
    if (localStorage.getItem('channel')) {
        channel = localStorage.getItem('channel')
        console.log(`retrieving channel: ${channel}`)
    } else {
        channel = 'general'
    }
    window.location = `channel/${channel}`
}

function input_is_valid(input) {
    if (input == "") {
        alert("Error: Input is empty");
        return false;
    } else if (/\s/g.test(input)) {
        alert("Error: Input must not contain whitespace");
        return false;
    } else if (input.length > 30) {
        alert("Error: Input must not be longer than 30 characters");
        return false;
    } else {
        return true;
    }
}

/**
 * Display the full list of channels with a link from each channel name
 * to the webpage for that channel.
 * 
 * @param {object} channels - A JavaScript object containing each channel
 * name (a string) and that channel's list of messages.
 */
function display_channels(channels) {
    // clear list of channels
    document.getElementById("channels_list").innerHTML = "";
    // show list of channels
    for (const [channel, message_list] of Object.entries(channels)) {
        var ul = document.getElementById('channels_list');
        var li = document.createElement("li");
        li.innerHTML += `<a href='/channel/${channel}'>${channel}</a>`
        ul.appendChild(li);
    };
};

/**
 * Displays the passed-in username at the top of the webpage.
 * 
 * @param {string} username - The user's username
 */
function display_username(username) {
    // Add to the document
    const name = document.createElement("name")
    // Important to use backticks and not apostrophes/single quotes here, 
    // otherwise template literals will not resovle.
    name.innerHTML = `User: ${username}`;
    document.querySelector("#displayed_username").append(name);
}

/**
 * Display the up-to-date list of messages for the current channel.
 * 
 * Looks in the passed-in channels list for the current channel. Displays the contents
 * of each message in that channel along with the username associated with the message.
 * 
 * @param {object} channels - A JavaScript object containing each channel name (a string)
 * and that channel's list of messages. The messages consistent of a username, text
 * pair of strings.
 */
function display_messages(channels) {
    // clear old displayed messages
    document.getElementById("messages_list").innerHTML = "";
    // show updated messages
    for (const [channel, message_list] of Object.entries(channels)) {
        // find the list of messages for the channel on display
        if (channel == document.querySelector('#current_channel').innerHTML) {
            // show all the messages by looping over
            message_list.forEach(function (message) {
                // there is only one username and message in the dictionary
                // so a for loop feels a bit silly here
                for (const [username, text] of Object.entries(message)) {
                    var ul = document.getElementById('messages_list');
                    var li = document.createElement("li");
                    li.innerHTML += `${username}: ${text}`;
                    ul.appendChild(li);
                }
            })
        }
    };
}

// The various events to occur once the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Save channel when page loads, so that if user closes page and goes back to 
    // app, this channel will be loaded (assuming user doesn't specify a different channel in url)
    channel = document.querySelector('#current_channel').innerHTML
    console.log(`saving channel: ${channel}`)
    localStorage.setItem('channel', channel);

    // if user exists, display username, channel form,
    //and message form but not username form
    if (localStorage.getItem('username')) {
        display_username(localStorage.getItem('username'));
        document.querySelector("#username_form").style.visibility = 'hidden'
        document.querySelector("#channel_form").style.visibility = 'visible'
        document.querySelector("#message_form").style.visibility = 'visible'
    // If user doesn't exist, don't display channel form or message form and
    // only display username creation form.
    } else {
        document.querySelector("#username_form").style.visibility = 'visible'
        document.querySelector("#channel_form").style.visibility = 'hidden'
        document.querySelector("#message_form").style.visibility = 'hidden'
    }

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {
        // upon connecting, get updated list of channels
        socket.emit('update channels');
        socket.emit('update messages');

        // When channel_submit button is clicked,
        // emit an update channels event with the
        // channel name
        document.querySelector('#channel_submit').onclick = function() {
            const new_channel = document.querySelector('#channel').value
            // I've decided not to clear the channel name if the user input is invalid,
            // although I'm not sure what is preferable.
            if (input_is_valid(new_channel)) {
                // clear field where channel name was entered
                document.getElementById('channel').value = ''
                socket.emit('update channels', new_channel);
            }
        };

        // When message_submit button is clicked,
        // emit an update messages event with the
        // message contents
        document.querySelector('#message_submit').onclick = function() {
            const username = localStorage.getItem('username')
            const message = document.querySelector('#message').value
            const channel = document.querySelector('#current_channel').innerHTML
            // clear field where message was entered
            document.getElementById('message').value = ''
            socket.emit('update messages', channel, username, message);
        };

        // When username_submit button is clicked,
        // emit an add username event with the
        // username
        document.querySelector('#username_submit').onclick = function() {
            const username = document.querySelector('#username').value
            if (input_is_valid(username)) {
                socket.emit('add username', username);
            }
        };
    });

    // When channels are sent, update the channel display
    socket.on('send channels', data => {
        const channels = data["channels"] 
        // display list of channels
        display_channels(channels)
    });

    // When messages are sent, update the message display
    socket.on('send messages', data => {
        const channels = data["channels"] 
        // display list of messages
        display_messages(channels)
    });

    socket.on('send username', data => {
        const username = data["username"] 
        // add username to local storage
        localStorage.setItem('username', username);
        // display username
        display_username(username)
        // hide username form and show channel and message form
        document.querySelector("#username_form").style.visibility = 'hidden'
        document.querySelector("#channel_form").style.visibility = 'visible'
        document.querySelector("#message_form").style.visibility = 'visible'
    });
});
