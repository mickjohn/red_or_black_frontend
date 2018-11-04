import { Guess } from './message';
import { Card } from './card';
import { HistoryItem } from './history_item';

/*
 * Messages:
 *   LoggedIn
 *   Error
 *   Players
 *   Turn
 *   GuessResult
 *   PlayerHasLeft
 *   CardsLeft
 *   GameHistory
 *   RequestHistory
 */

export class LoggedIn {
  kind: "logged_in";

  constructor() {
    this.kind = "logged_in";
  }
}

export class Error {
  error: string
  kind: "error";

  constructor(error: string) {
    this.error = error;
    this.kind = "error";
  }
}

export class  Players {
  usernames: string[];
  kind: "players";

  constructor(usernames: string[]) {
    this.usernames = usernames;
    this.kind = "players";
  }
}

export class Turn {
  username: string;
  kind: "turn";

  constructor(username: string) {
    this.username = username;
    this.kind = "turn";
  }
}

export class GuessResult {
  kind: "guess_result";
  correct: boolean;
  card: Card;
  penalty: number;
  username: string;
  guess: Guess;

  constructor(
    correct: boolean,
    card: Card,
    penalty: number,
    username: string,
    guess: Guess
  ) {
    this.correct = correct;
    this.card = card;
    this.penalty = penalty;
    this.username = username;
    this.guess = guess;
    this.kind = "guess_result";
  }
}

export class Penalty {
  kind: "penalty";
  penalty: number;

  constructor(penalty: number) {
    this.penalty = penalty;
    this.kind = "penalty";
  }
}

export class PlayerHasLeft {
  kind: "player_has_left";
  username: string;

  constructor(username: string) {
    this.username = username;
    this.kind = "player_has_left";
  }
}

export class CardsLeft {
  kind: "cards_left";
  cards_left: number;

  constructor(cards_left: number) {
    this.cards_left = cards_left;
    this.kind = "cards_left";
  }
}

export class GameHistory {
  kind: "game_history";
  history: HistoryItem[];

  constructor(history: HistoryItem[]) {
    this.history = history;
    this.kind = "game_history";
  }
}

export class RequestHistory {
  kind: "request_history";
  history: Card[];

  constructor(history: Card[]) {
    this.history = history;
    this.kind = "request_history";
  }
}

export type RecievableMessage = LoggedIn
  | Error
  | Players
  | Turn
  | GuessResult
  | PlayerHasLeft
  | Penalty
  | CardsLeft
  | GameHistory
  | RequestHistory;


