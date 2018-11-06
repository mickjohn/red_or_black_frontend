import * as $ from 'jquery';
import { Guess, Login } from './message';
import { MessageHandler } from './handler';

var username_field = $("username");
var current_hostname: string = window.location.hostname;
var websocket_url: string = "ws://" + current_hostname + ":8000";
if ( current_hostname === "games.mickjohn.com" ) {
  websocket_url = "wss://" + current_hostname + ":8010";
} else {
  websocket_url = "ws://" + current_hostname + ":9000";
}

function validate(username: string) : boolean {
  if ( username.length > 39 ) {
    return false;
  }
  return true;
}

function validateAndConnect() {
  var username: string = username_field.val().toString();
  validate(username);
}

$(document).ready(function(){
  $("username-submit").click(function() {
    validateAndConnect();
  });

  $("#game-div").hide();
  $("#outcome").hide();
  $("#your-go").hide();

  $("#login").click( function() {
    var username: string = $("#username").val().toString();
    startWebsocketConnection(username);
  });

  $("#show-history").click( function() {
    $("#myModal").show();
  });

  // Get the modal
  var modal = document.getElementById('myModal');
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  } 

});

function startWebsocketConnection(username: string) {
  console.log("About to create websocket connection...");
  var connection: WebSocket = new WebSocket(websocket_url);
  var username: string;
  var handler: MessageHandler;

  connection.onopen = function(event) {
    console.log("Connection opened, sending username to server...");
    username = $("#username").val().toString();

    handler = new MessageHandler(username, connection);
    connection.send(JSON.stringify(new Login(username))); 
    $("#login-div").hide();
  };

  connection.onmessage = function(event) {
    var received_msg: any = JSON.parse(event.data);
    handler.handle(received_msg);
  };

  connection.onclose = function(event) {
    console.log("Lost websocket connection");
    $('#game-div').hide();
    $('#login-div').show();
  }

  connection.onerror = function(event) {
    console.log("websocket error!");
    $('#game-div').hide();
    $('#login-div').show();
  }
}
