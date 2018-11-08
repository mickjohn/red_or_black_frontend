import * as $ from 'jquery';
import { Guess, Login } from './message';
import { MessageHandler } from './handler';

var username_field = $("username");
var current_hostname: string = window.location.hostname;
var websocket_url: string;
if ( current_hostname === "games.mickjohn.com" ) {
  websocket_url = `wss://${current_hostname}:8010`;
} else {
  websocket_url = `ws://${current_hostname}:9000`;
}

function validate(username: string) : boolean {
  if ( username.length > 39 ) {
    return false;
  }
  return true;
}

$(document).ready(function(){
  $("#game-div").hide();
  $("#outcome").hide();
  $("#your-go").hide();

  $("#login").click( function() {
    $(this).prop('disabled', true);
    var username: string = $('#username').val().toString();
    startWebsocketConnection(username);
  });
});

// Reset back to the starting state
// i.e. game is hidden and login box is
// showing
function resetGameUi() {
  $('#game-div').hide();
  $('#login-div').show();
  $('#login').prop('disabled', false);
}

function startWebsocketConnection(username: string) {
  console.log("About to create websocket connection...");
  $('#login-messages').text("Connecting...");
  var connection: WebSocket = new WebSocket(websocket_url);
  var username: string;
  var handler: MessageHandler;

  connection.onopen = function(event) {
    console.log("Connection opened, sending username to server...");
    username = $("#username").val().toString();

    handler = new MessageHandler(username, connection);
    connection.send(JSON.stringify(new Login(username))); 
    $("#login-div").hide();
    $('#login-messages').text("");
  };

  connection.onmessage = function(event) {
    var received_msg: any = JSON.parse(event.data);
    handler.handle(received_msg);
  };

  connection.onclose = function(event) {
    console.log("Websocket connection closed");
    resetGameUi();
  }

  connection.onerror = function(event) {
    console.log("websocket error!");
    resetGameUi();
  }
}
