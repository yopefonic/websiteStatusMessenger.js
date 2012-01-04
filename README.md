# Goal
the website status messenger is a javaScript library that allows you to easily show messages to your user about the actions that have been taking place. It's goal is not so much to deliver a finished plugin but a framework to build your own styling upon.

As a framework library it provides two basic ideas. It provides a progressive enhancement approach by adding base elements that show the message to the DOM. It also provides a que with messages that is self looping. The animation and event handling is up to you.

The library does not have any hard dependencies but for animation it is advised to use a library like jQuery, Prototype or Dojo.

# Use (basic)
Include the `websiteStatusMessenger.js` file into your page and also include one of the library files with the library extention of your choice. example: `websiteStatusMessenger.jquery.js`.

```javascript
var statusMessenger = new WebsiteStatusMessenger();
statusMessenger.addMessage("This is a message", "stateCssClass");
```

This creates a messenger object that can then be called with `addMessage()` to add a message to the que. It will automatically start the loop to open and close messages

# Use (with options)
The website status messenger comes with a set of build in options. Below you will find the options that can be given to the new object with an associative array. The example below also contains the default values.

```javascript
{
    id: 'system_messages',
    animationSpeed: 200,
    messageDelay: 3500,
    messageBaseClass: 'message',
    messageCloseText: 'close'
}
```