import * as $ from 'jquery';
import { Guess, Login } from './message';
import { convertCardToHtml, parseRecievableMessage } from './utils';
import { Card } from './card';
import {
  LoggedIn,
  Error,
  Players,
  Penalty,
  Turn,
  GuessResult,
  PlayerHasLeft,
  CardsLeft,
  GameHistory,
  RequestHistory,
  RecievableMessage
} from './recievable_message';

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
  game_history: JQuery<HTMLElement>;
  cards_left: JQuery<HTMLElement>;

  allow_guess: boolean;
  turn_number: number;

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
    this.game_history = $("#history-list");
    this.cards_left = $("#cards-left");

    this.allow_guess = true;
    this.turn_number = 0;

    // Setup red/black click handlers
    this.red_button.click(() => {
      if (this.allow_guess) {
        this.allow_guess = false;
        this.red_button.removeClass("red-button");
        this.red_button.addClass("red-button-clicked");
        this.black_button.fadeOut( "slow", function() {
          connection.send(JSON.stringify(Guess.red())); 
        });
      }
    });

    this.black_button.click(() => {
      if (this.allow_guess) {
        this.allow_guess = false;
        this.black_button.removeClass("black-button");
        this.black_button.addClass("black-button-clicked");
        this.red_button.fadeOut( "slow", function() {
          connection.send(JSON.stringify(Guess.black())); 
        });
      }
    });
  }

  handle(msg: any) {
    let message: RecievableMessage = parseRecievableMessage(msg);
    switch (message.kind) {
      case "logged_in":
        console.log("message is logged in");
        this.loggedIn(message);
        break;
      case "error":
        this.error(message);
        break;
      case "players":
        this.players(message);
        break;
      case "turn":
        this.turn(message);
        break;
      case "guess_result":
        this.handleGuessResult(message);
        break;
      case "player_has_left":
        this.playerLeft(message);
        break;
      case "penalty":
        this.drinking_seconds.html(message.penalty.toString());
        break;
      case "request_history":
        this.updateLastThreeCards(message);
        break;
      case "game_history":
        this.setGameHistory(message);
        break;
      case "cards_left":
        this.updateCardsLeft(message);
        break;
      default:
        console.log("Don't understand message...");
        console.log(message);
        break;
    }
  }

  loggedIn(msg: LoggedIn) {
    console.log("Showing game");
    this.game.show();
  }

  error(msg: Error) {
    console.log("Error: " + msg.error);
  }

  players(msg: Players) {
    this.player_list.empty();
    for (let player of msg.usernames) {
      this.player_list.append(`<li>${player}</li>`);
    }
  }

  // We don't want to show the guess buttons if the user is still being shown
  // the outcome of their guess (which takes 3 seconds). Imagine this:
  // PLAYER 1                                       | PLAYER 2
  // 1) Player 1 guesses -> It's not player 2's go  |
  // 2) The guess & answer is shown                 | Player two guesses It's now player 1's go
  // 2.5) The answer buttons are shown, because it's Player 1's go again, but the buttons are about to be hidden the the next step
  // 3) The answer & buttons are hidden             | ...
  // 4) Now player 1 has no buttons :(
  //
  // So this needs to wait till the buttons have finished being hidden before showing them.
  //
  waitForButtonsToShow() {
    if ( $("#outcome").is(':animated') || $("your-go").is(':animated')
      || $("#outcome").is(':visible') || $("#your-go").is(':visible')) {

      window.setTimeout( ()=> {
        this.waitForButtonsToShow()
      }, 500);

      return;
    }

    this.reset_buttons();
    $("#your-go").slideDown("slow", "swing");
    // Vibrate the device once the player can guess again
    window.navigator.vibrate([100, 50, 100]);
    this.allow_guess = true;
  }

  reset_buttons() {
    $("#red-button").removeClass("red-button-clicked");
    $("#black-button").removeClass("black-button-clicked");
    $("#red-button").addClass("red-button");
    $("#black-button").addClass("black-button");
    $("#red-button").show();
    $("#black-button").show();
  }

  turn(msg: Turn) {
    if ( msg.username === this.username ) {
      this.players_go.html("<b>your</b>");
      this.waitForButtonsToShow();
    } else {
      this.players_go.html(msg.username + "'s");
    }
  }

  handleGuessResult(msg: GuessResult) {
    let card_html: string = convertCardToHtml(msg.card);
    this.turn_number += 1;

    // Push onto the last cards list
    this.pushNewCard(msg.card);

    // Show the card
    this.the_card.html(card_html);

    if ( msg.username === this.username ) {
      if ( msg.correct ) {
        this.guess_result.html("👏 Correct 👏");
      } else {
        this.guess_result.html(`&#x1f62c; Wrong!! Drink for ${msg.penalty} seconds`)
      }
    }

    // Update the drinking seconds
    this.drinking_seconds.html(msg.correct ? msg.penalty.toString() : "5");

    // Show the outcome, and then hide it after 3 seconds
    if ( msg.username == this.username ) {
      this.outcome_box.slideDown("fast", "swing", function() {
        setTimeout(function(){ 
          $("#outcome").slideUp("slow", "swing", function() {
            // Hide the buttons after hiding the outcome
            $("#your-go").slideUp("slow", "swing");
          });
        }, 3000);

      });
    }

    // Update the history
    this.updateGameHistory(msg);
  }

  // This might be a good place to use the snackbar?
  playerLeft(msg: PlayerHasLeft) {}

  /*
   * push last card onto the list of last cards
   * fade out the oldest, and fade in the new one
   */
  pushNewCard(card: Card) {
    $("#new-card").hide();
    $("#new-card").html(convertCardToHtml(card));

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

  updateLastThreeCards(msg: RequestHistory) {
    let ids: string[] = [ "last-card", "second-last-card", "third-last-card",];
    ids.forEach((id, index) => {
      if (msg.history[index] !== undefined && msg.history[index] !== null) {
        $(`#${id}`).html(convertCardToHtml(msg.history[index]));
      }
    });
  }

  setGameHistory(msg: GameHistory) {
    let historyItems = msg.history;

    let guess: string;
    for (let item of historyItems) {
      this.turn_number = item.turn_number;
      let msg = new GuessResult(
        item.outcome,
        item.card,
        item.penalty,
        item.username,
        item.guess,
      );
      this.updateGameHistory(msg);
    }
  }

  updateGameHistory(guess_result: GuessResult) {
    let outcome = guess_result.correct ? "&#x1F389;&#x1F389;" : "&#x1F44E;";
    let card = convertCardToHtml(guess_result.card);
    let guess: string;
    if (guess_result.guess.card_colour === "Red") {
      guess = '<b><span class="red-text"> red </span></b>';
    } else {
      guess = '<b><span class="black-text"> black </span></b>';
    }

    let penalty: string;
    if ( guess_result.correct ) {
      penalty = `penalty gone up to ${guess_result.penalty}s <span class="green-text">&#x2191;&#x2191;</span>`;
    } else {
      penalty =  `drink for ${guess_result.penalty}s &#x1F37A;`;
    }

    let listItem = `<li> <b>${this.turn_number}</b> ${guess_result.username} guessed ${guess} and got a ${card} ${outcome} ${penalty} </li>`;
    this.game_history.prepend(listItem);
  }

  updateCardsLeft(msg: CardsLeft) {
    this.cards_left.html(`${msg.cards_left}/52`);
  }
}
