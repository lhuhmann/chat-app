// The various events to occur once the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // get the channel from local storage or if none exists default to 'general' channel
    channel = get_channel()
    load_page(channel)
    // Save channel when page loads, so that if user closes page and goes back to 
    // app, this channel will be loaded (assuming user doesn't specify a different channel in url)
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
        // alert user if the channel they are trying to add already exists
        if (data["duplicate_channel_added"]) {
            alert("A channel with the specified name already exists")
        }
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

/**
 * If a channel is specified in localStorage, return that channel.
 * Otherwise, return the general channel.
 */
function get_channel() {
    if (localStorage.getItem('channel')) {
        channel = localStorage.getItem('channel')
    } else {
        channel = 'general'
    }
    return channel
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
        li.innerHTML += `<a href='' class='nav-link' onclick='load_page("${channel}"); return false;'>${channel}</a>`
        ul.appendChild(li);
    };
};

function load_page(channel, add_to_history = true) {
    const request  = new XMLHttpRequest();
    request.open('GET', `/channels/${channel}`);
    request.onload = () => {
        const channels = JSON.parse(request.responseText);
        // first update the current channel on the page
        document.querySelector('#current_channel').innerHTML = channel
        // then call display_messages function on the channels in the response
        display_messages(channels)
    
    if (add_to_history) {
        // Push state to URL.
        document.title = channel;
        history.pushState({'channel': channel}, channel, channel);
    }
    };
    request.send();
}

// When back button is clicked, go back to previous channel and
// pull the latest messages for that channel.
window.onpopstate = e => {
    const data = e.state;
    channel = data.channel;
    load_page(channel, add_to_history = false)
};

/**
 * Displays the passed-in username at the top of the webpage.
 * 
 * @param {string} username - The user's username
 */
function display_username(username) {
    // Important to use backticks and not apostrophes/single quotes here, 
    // otherwise template literals will not resovle.
    document.querySelector("#displayed_username").innerHTML = `User: ${username}`;
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
    // identify current channel
    current_channel = document.querySelector('#current_channel').innerHTML
    // show updated messages
    for (const [channel, message_list] of Object.entries(channels)) {
        // find the list of messages for the channel on display
        if (channel == current_channel) {
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

        // Scroll page so user can see latest messages
        // I adapted this from https://gist.github.com/hssm/1a8136059011e491d0d8.
        // This means if new new messages
        // appear in the messages list, the user is scrolled down to see them.
        var message_pane = document.getElementById('messages_list');

        // Additional padding/border to account for in calculations
        var offset = message_pane.scrollHeight - message_pane.offsetHeight;
        
        // Amount we have scrolled down
        var scrollPos = message_pane.scrollTop + offset;
        
        // Amount of scroll available, minus the visible portion (because scrollPos
        // is the *top* of the visible portion)
        var scrollBottom = (message_pane.scrollHeight - (message_pane.clientHeight + offset));
        
        //console.log("offset: " + offset);
        //console.log("scrollPos:" + scrollPos);
        //console.log("scrollBottom:" + scrollBottom);
        
        // If we are at the bottom, go to the bottom again.
        if (scrollPos >= scrollBottom) {
            window.scrollTo(0, message_pane.scrollHeight);
        }
    };
}
