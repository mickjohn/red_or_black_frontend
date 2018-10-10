import * as $ from 'jquery';
import { Guess, Login } from './message';
import { MessageHandler } from './handler';

var username_field = $("username");
var current_hostname: string = window.location.hostname;
var websocket_url: string = "ws://" + current_hostname + ":8000";
// var websocket_url: string = "ws://127.0.0.1:8000";

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


function showSnackbar() {
  var className: string = "show";
  console.log("About to bring up snackbar");

  // Get the snackbar DIV
  var snackbar: JQuery<HTMLElement> = $("#snackbar");
  snackbar.addClass(className);

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ snackbar.removeClass(className);}, 3000);
} 

$(document).ready(function(){
  $("username-submit").click(function() {
    validateAndConnect();
  });

  $("#snack-button").click(function(){
    showSnackbar();
  });

  $("#snackbar").click( function() {
    $(this).removeClass("show");
  });

  $("#game-div").hide();
  $("#outcome").hide();
  $("#your-go").hide();

  $("#login").click( function() {
    var username: string = $("#username").val().toString();
    startWebsocketConnection(username);
  });
});

function startWebsocketConnection(username: string) {
  console.log("About to create websocket connection...");
  var connection: WebSocket = new WebSocket(websocket_url);
  var username: string = "";
  var handler: MessageHandler;

  connection.onopen = function(event) {
    console.log("Connection opened, sending username to server...");
    username = $("#username").val().toString();

    //TODO messy... reassigning the handler after initialising it above :(
    handler = new MessageHandler(username, connection);
    connection.send(JSON.stringify(new Login(username))); 
    $("#login-div").hide();
  };

  connection.onmessage = function(event) {
    var received_msg: any = JSON.parse(event.data);
    handler.handle(received_msg);
  };

}

function writeToLogBox(msg: string) {
  var logbox = $("#logbox");
  logbox.scrollTop(logbox[0].scrollHeight);
  logbox.val(logbox.val() + msg + "\n");
}
