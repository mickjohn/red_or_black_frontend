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
  last_cards: JQuery<HTMLElement>;

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
    this.last_cards = $("#last-three-cards");

    // Setup red/black click handlers
    $("#red-button").click(function(){
      $(this).removeClass("red-button");
      $(this).addClass("red-button-clicked");
      $("#black-button").fadeOut( "slow", function() {
        connection.send(JSON.stringify(Guess.red())); 
      });
    });

    $("#black-button").click(function(){
      $(this).removeClass("black-button");
      $(this).addClass("black-button-clicked");
      $("#red-button").fadeOut( "slow", function() {
        connection.send(JSON.stringify(Guess.black())); 
      });
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
      case "RequestHistory":
        this.updateLastThreeCards(msg);
        break;
      default:
        console.log("Don't understand message...");
        console.log(msg);
        break;
    }
  }

  loggedIn(msg: any) {
    console.log("USERNAME = " + this.username);
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
    this.reset_buttons();
    $("#your-go").slideDown("slow", "swing");
    // Vibrate the device once the player can guess again
    window.navigator.vibrate([100, 50, 100]);
  }

  reset_buttons() {
    $("#red-button").removeClass("red-button-clicked");
    $("#black-button").removeClass("black-button-clicked");
    $("#red-button").addClass("red-button");
    $("#black-button").addClass("black-button");
    $("#red-button").show();
    $("#black-button").show();
  }

  turn(msg: any) {
    console.log(msg);
    if ( msg.username === this.username ) {
      console.log("It's this players go!");
      this.players_go.html("<b>your</b>!");
      this.waitForButtonsToShow();
    } else {
      console.log("It's " + msg.username + "'s go");
      this.players_go.html(msg.username);
    }
  }

  handleGuessResult(msg: any) {
    let card_html: string = this.convertCardToHtml(msg.card);

    // Push onto the last cards list
    this.pushNewCard(msg.card);

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

    // Show the outcome, and then hide it after 3 seconds
    if ( msg.username == this.username ) {
      this.outcome_box.slideDown("fast", "swing", function() {
        setTimeout(function(){ 
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

  // This might be a good place to use the snackbar?
  playerLeft(msg: any) {}

  /*
   * push last card onto the list of last cards
   * fade out the oldest, and fade in the new one
   */
  pushNewCard(card: any) {
    $("#new-card").hide();
    $("#new-card").html(this.convertCardToHtml(card));

    $("#third-last-card").fadeOut("slow", function() {
      $("#new-card").fadeIn("slow", function() {
        $("#third-last-card").html($("#second-last-card").html());
        $("#second-last-card").html($("#last-card").html());
        $("#last-card").html($("#new-card").html());
        $("#third-last-card").show();
        $("#new-card").hide();
      });
    });
  }

  updateLastThreeCards(msg: any) {
    $("#last-card").html(this.convertCardToHtml(msg.history[0]));
    $("#second-last-card").html(this.convertCardToHtml(msg.history[1]));
    $("#third-last-card").html(this.convertCardToHtml(msg.history[2]));
  }

  convertCardToHtml(card: any) {
    if (card === null) {
      return "";
    }

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
