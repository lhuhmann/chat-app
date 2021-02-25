# Online messaging service for CS50

This online messaging service was developed to meet the criteria for Project 2 of the Harvard class CS50's Web Programming with Python and JavaScript. The project criteria can be found at https://docs.cs50.net/ocw/web/projects/2/project2.html.

## Required Packages

Install from Pipfile.

## Running the app

Run the app with `python chat-app.py <portnumber>`.

## Code structure

### Python

* `chat-app.py` launches the app.
* `app.py` defines the routes and the socketio events to send the channels, messages, and username to the front-end.

### JavaScript

* `static/index.js` handles the front-end display of channels, messages, and username, validates and conveys user inputs to the server, and automatically scrolls the page as new messages appear.

### HTML

* `templates/index.html` sets up the basic html for the webpage.

### CSS

* `bootstrap.min.css` sets some generic (bootstrap) webpage styling.
* `static/style.css` imports bootstrap.min.css and sets custom webpage styling.
