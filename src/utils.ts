import { Guess } from './message';
import { Card } from './card';
import { HistoryItem } from './history_item';
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

export function convertCardToHtml(card: Card) {
  if (card === null) {
    return "";
  }

  let card_text: string = card.prettyPrint();
  let span: string = "black-text";

  switch (card.suit) {
    case "Club":
      span = "black-text";
      break;
    case "Spade":
      span = "black-text";
      break;
    case "Heart":
      span = "red-text";
      break;
    case "Diamond":
      span = "red-text";
      break;
  }
  return `<span class="${span}">${card_text}</span>`
}

export function parseRecievableMessage(msg: any) {
  switch (msg.msg_type) {
    case "LoggedIn":
      return new LoggedIn();
      break;
    case "Error":
      return new Error(msg.error);
      break;
    case "Players":
      let usernames: string[] = [];
      for (var player of msg.players) {
        usernames.push(player.username);
      }
      return new Players(usernames);
      break;
    case "Turn":
      return new Turn(msg.username);
      break;
    case "GuessResult":
      return new GuessResult(
        msg.correct,
        new Card(msg.card.value, msg.card.suit),
        msg.penalty,
        msg.username,
        new Guess(msg.card_colour)
      );
      break;
    case "PlayerHasLeft":
      return new PlayerHasLeft(msg.username);
      break;
    case "Penalty":
      return new Penalty(msg.penalty);
      break;
    case "RequestHistory":
      let cards: Card[] = [];
      for(let card_msg of msg.history) {
        if (card_msg !== null ) {
          cards.push(new Card(card_msg.value, card_msg.suit));
        }
      }
      return new RequestHistory(cards);
      break;
    case "GameHistory":
      let history: HistoryItem[] = [];
      for(let history_msg of msg.history) {
        history.push(new HistoryItem (
          history_msg.username,
          new Guess(history_msg.card_colour),
          history_msg.outcome,
          new Card(history_msg.card.value, history_msg.card.suit),
          history_msg.penalty,
          history_msg.turn_number,
        ));
      }
      return new GameHistory(history);
      break;
    case "CardsLeft":
      return new CardsLeft(msg.cards_left);
      break;
    default:
      console.error("Could not deserialise object: " + msg);
      return new Error("Could not deserialise object: " + msg);
      break;
  }
}
