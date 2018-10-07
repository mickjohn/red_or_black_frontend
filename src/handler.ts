import * as $ from 'jquery';

export class MessageHandler {
  username: string;
  message_box: JQuery<HTMLElement>;
  red_button: JQuery<HTMLElement>;
  black_button: JQuery<HTMLElement>;
  player_list: JQuery<HTMLElement>;
  drinking_seconds: JQuery<HTMLElement>;
  game: JQuery<HTMLElement>;
  players_go: JQuery<HTMLElement>;

  constructor(username: string) {
    this.username = username;

    this.player_list = $("#connected-players");
    this.message_box = $("#logbox");
    this.red_button = $("#red-button");
    this.black_button = $("#black-button");
    this.drinking_seconds = $("#drinking-seconds");
    this.game = $("#game-div");
    this.players_go = $("#players-go");
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
      case "CorrectGuess":
        this.correct(msg);
        break;
      case "WrongGuess":
        this.wrong(msg);
        break;
      case "PlayerHasLeft":
        this.playerLeft(msg);
        break;
      default:
        console.log("Don't understand message...");
        console.log(msg);
        break;
    }
  }

  loggedIn(msg: any) {
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

  turn(msg: any) {
    console.log(msg);
    if ( msg.username === this.username ) {
      console.log("It's this players go!");
      this.log("It's YOUR go");
      this.players_go.html("It's <b>your</b> go!");
    } else {
      console.log("It's " + msg.username + "'s go");
      this.log("It's " + msg.username + "'s go");
      this.players_go.html("It's <b>" + msg.username +"'s</b> go!");
    }
  }

  correct(msg: any) {
    this.log("Correct guess for " + msg.username + "!");
    this.log("Drinking seconds: " + msg.drinking_seconds);
    this.drinking_seconds.html(msg.drinking_seconds);
  }

  wrong(msg: any) {
    if ( msg.username === this.username ) {
      this.log("YOU must drink for " + msg.drinking_seconds + " seconds");
    } else {
      this.log("Incorrect guess for " + msg.username + ":-(, they must drink for " + msg.drinking_seconds + " seconds!!");
    }
    // Reset the drinking seconds.
    this.drinking_seconds.html("5");
  }

  playerLeft(msg: any) {
    this.log(msg.username + " has left");
  }

  log(msg: string) {
    this.message_box.scrollTop(this.message_box[0].scrollHeight);
    this.message_box.val(this.message_box.val() + msg + "\n");
  }

}
