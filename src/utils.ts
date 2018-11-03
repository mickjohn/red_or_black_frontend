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

export function convertCardToHtml(card: any) {
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

export function deserializeMessage(msg: any) {
  switch (msg.msg_type) {
    case "Turn":
      return new Turn(msg.username);
      break;
    default:
      return new Turn("");
  }
}

export function ParseRecievableMessage(msg: any) {
  switch (msg.msg_type) {
    case "LoggedIn":
      return new LoggedIn();
      break;
    case "Error":
      return new Error(msg.error);
      break;
    case "Players":
      return new Players(msg.players);
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
      let cards: [Card];
      for(let card_msg of msg.history) {
        cards.push(new Card(card_msg.value, card_msg.suit));
      }
      return new RequestHistory(cards);
      break;
    case "GameHistory":
      let history: [HistoryItem];
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
  }
}
