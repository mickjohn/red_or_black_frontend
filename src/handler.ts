import * as $ from 'jquery';
import { Guess, Login } from './message';

export class MessageHandler {
  username: string;
  connection: WebSocket;

  message_box: JQuery<HTMLElement>;
  red_button: JQuery<HTMLElement>;
  black_button: JQuery<HTMLElement>;
  player_list: JQuery<HTMLElement>;
  drinking_seconds: JQuery<HTMLElement>;
  game: JQuery<HTMLElement>;
  players_go: JQuery<HTMLElement>;
  your_go: JQuery<HTMLElement>;
  outcome_box: JQuery<HTMLElement>;
  the_card: JQuery<HTMLElement>;
  guess_result: JQuery<HTMLElement>;

  constructor(username: string, connection: WebSocket) {
    this.username = username;
    this.connection = connection;

    // All of the various html elements that 
    // can be updated.
    this.black_button = $("#black-button");
    this.drinking_seconds = $("#penalty-seconds");
    this.game = $("#game-div");
    this.guess_result = $("#guess-result");
    this.message_box = $("#logbox");
    this.outcome_box = $("#outcome");
    this.player_list = $("#players-list");
    this.players_go = $("#players-go");
    this.red_button = $("#red-button");
    this.the_card = $("#the-card");
    this.your_go = $("#your-go");

    // Setup red/black click handlers
    $("#red-button").click(function(){
      $("#black-button").fadeOut( "slow", function() {
        connection.send(JSON.stringify(Guess.red())); 
      });
      $(this).addClass("red-button-clicked");
    });

    $("#black-button").click(function(){
      $("#red-button").fadeOut( "slow", function() {
        connection.send(JSON.stringify(Guess.black())); 
      });
      $(this).addClass("black-button-clicked");
    });
  }

  handle(msg: any) {
    switch(msg.msg_type) {
      case "LoggedIn":
        this.loggedIn(msg);
        break;
      case "Error": 
        this.error(msg);
        break;
      case "Players":
        this.players(msg);
        break;
      case "Turn":
        this.turn(msg);
        break;
      case "GuessResult":
        console.log(msg);
        this.handleGuessResult(msg);
        break;
      case "PlayerHasLeft":
        this.playerLeft(msg);
        break;
      case "Penalty":
        this.drinking_seconds.html(msg.penalty.toString());
        break;
      default:
        console.log("Don't understand message...");
        console.log(msg);
        break;
    }
  }

  loggedIn(msg: any) {
    console.log("USERNAME = " + this.username);
    this.log("Logged in");
    this.game.show();
  }

  error(msg: any) {
    console.log("Error: " + msg.error);
  }

  players(msg: any) {
    console.log("received players msg");
    this.player_list.empty();
    for (let player of msg.players) {
      this.player_list.append("<li>" + player.username + "</li>");
    }
  }

  // We don't want to show the guess buttons if the user is still being shown
  // the outcome of their guess (which takes 3 seconds). Imagine this:
  // PLAYER 1                                       | PLAYER 2
  // 1) Player 1 guesses -> It's not player 2's go  |
  // 2) The guess & answer is shown                 | Player to guesses It's no player 1's go
  // 2.5) The answer buttons are shown, because it's Player 1's go again, but the buttons are about to be hidden the the next step
  // 3) The answer & buttons are hidden             | ...
  // 4) Now player 1 has no buttons :(
  //
  // So this needs to wait till the buttons have finished being hidden before showing them.
  //
  waitForButtonsToShow() {
    if ( $("#outcome").is(':animated') || $("your-go").is(':animated')
      || $("#outcome").is(':visible') || $("#your-go").is(':visible')) {
      console.log("your-go or outcome is still animating/showing, waiting 500ms");

      window.setTimeout( ()=> {
        this.waitForButtonsToShow()
      }, 500);

      return;
    }

    console.log("Showing guess buttons");
    $("#red-button").removeClass("red-button-clicked");
    $("#black-button").removeClass("black-button-clicked");
    $("#red-button").show();
    $("#black-button").show();
    $("#your-go").slideDown("slow", "swing");
  }

  turn(msg: any) {
    console.log(msg);
    if ( msg.username === this.username ) {
      console.log("It's this players go!");
      this.log("It's YOUR go");
      this.players_go.html("It's <b>your</b> go!");

      this.waitForButtonsToShow();
    } else {
      console.log("It's " + msg.username + "'s go");
      this.log("It's " + msg.username + "'s go");
      this.players_go.html("It's <b>" + msg.username +"'s</b> go!");
    }
  }

  handleGuessResult(msg: any) {
    let card_html: string = this.convertCardToHtml(msg.card);

    // Show the card
    this.the_card.html(card_html);

    if ( msg.username === this.username ) {
      if ( msg.correct ) {
        this.guess_result.html("👏 Correct 👏");
      } else {
        this.guess_result.html("&#x1f62c; Wrong!! Drink for " + msg.penalty + " seconds")
      }
    }

    // Update the drinking seconds
    this.drinking_seconds.html(msg.correct ? msg.penalty.toString() : "5");

    // Hide the outcome and the buttons
    if ( msg.username == this.username ) {
      this.outcome_box.slideDown("fast", "swing", function() {
        window.setTimeout(function() {}, 2000, 'That was really slow!');
        setTimeout(function(){ 
          // Hide the outcome after 3 seconds
          console.log("hiding outcome");
          $("#outcome").slideUp("slow", "swing", function() {
            // Hide the buttons after hiding the outcome
            console.log("hiding guess boxes");
            $("#your-go").slideUp("slow", "swing");
          });
        }, 3000);

      });
    }
  }

  playerLeft(msg: any) {
    this.log(msg.username + " has left");
  }

  log(msg: string) {
    console.log(msg);
    this.message_box.scrollTop(this.message_box[0].scrollHeight);
    this.message_box.val(this.message_box.val() + msg + "\n");
  }

  convertCardToHtml(card: any) {
    let suit: string = "Unknown";
    let value: string = "Unkown";
    let span: string = "";


    switch (card.suit) {
      case "Club":
        suit = "♣";
        span = "black-text";
        break;
      case "Spade":
        suit = "♠";
        span = "black-text";
        break;
      case "Heart":
        suit = "♥";
        span = "red-text";
        break;
      case "Diamond":
        span = "red-text";
        suit = "♦";
        break;
    }

    switch (card.value) {
      case "Ace":
        value = "A";
        break;
      case "Two":
        value = "2";
        break;
      case "Three":
        value = "3";
        break;
      case "Four":
        value = "4";
        break;
      case "Five":
        value = "5";
        break;
      case "Six":
        value = "6";
        break;
      case "Seven":
        value = "7";
        break;
      case "Eight":
        value = "8";
        break;
      case "Nine":
        value = "9";
        break;
      case "Ten":
        value = "10";
        break;
      case "Jack":
        value = "J";
        break;
      case "Queen":
        value = "Q";
        break;
      case "King":
        value = "K";
        break;
    }

    return "<span class=\"" + span + "\">" + suit + value + "</span>"
  }
}
