import * as $ from 'jquery';

var username_field = $("username");

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

  $("#login").click( function() {
    var username: string = $("#username").val().toString();
    startWebsocketConnection(username);
  });
});

function startWebsocketConnection(username: string) {
  console.log("About to create websocket connection...");
  var connection: WebSocket = new WebSocket("ws://127.0.0.1:8080", "protocolOne");
  var username: string = "";

  connection.onopen = function(event) {
    console.log("Connection opened, sending username to server...");
    username = $("#username").val().toString();
    var request = { "Login": { "username": username}};
    connection.send(JSON.stringify(request)); 
    $("#login-div").hide();
  };

  connection.onmessage = function(event) {
    var received_msg: any = JSON.parse(event.data);
    switch(received_msg.msg_type) {
      case "LoggedIn":
        console.log("LoggedIn");
        writeToLogBox("Logged in");
        $("#game-div").show();
        break;
      case "Error":
        console.log("Error: " + received_msg.error);
        break;
      case "Players":
        $("#connected-players").empty();
        console.log("Received Players message");
        for (let player of received_msg.players) {
          console.log("Appending player " + player.username);
          $("#connected-players").append("<li>" + player.username + "</li>");
        }
        break;
      case "Turn":
        if ( received_msg.username === username ) {
          console.log("It's this players go!");
          writeToLogBox("It's YOUR go");
          $("#players-go").html("It's <b>your</b> go!");
        } else {
          console.log("It's " + received_msg.username + "'s go");
          writeToLogBox("It's " + received_msg.username + "'s go");
          $("#players-go").html("It's <b>" + received_msg.username +"'s</b> go!");
        }
        break;
      case "CorrectGuess":
        // alert("Correct!!")
        writeToLogBox("Correct guess for " + username + "!");
        break;
      case "WrongGuess":
        // alert("Incorrect!!!");
        writeToLogBox("Incorrect guess for " + username + ":-(");
        break;
      case "PlayerHasLeft":
        writeToLogBox(received_msg.username + " has left the game");
        break;
      default:
        console.log("Don't understand message...");
        console.log(received_msg);
        break;
    }
  };

  $("#red-button").click(function(){
    var request = { "Guess": { "card_colour": "Red" }};
    connection.send(JSON.stringify(request)); 
  });

  $("#black-button").click(function(){
    var request = { "Guess": { "card_colour": "Black" }};
    connection.send(JSON.stringify(request)); 
  });
}

function writeToLogBox(msg: string) {
  var logbox = $("#logbox");
  logbox.scrollTop(logbox[0].scrollHeight);
  logbox.val(logbox.val() + msg + "\n");
}
