import { Card } from './card';
import { Guess } from './message';

export class HistoryItem {
  username: string;
  guess: Guess;
  outcome: boolean;
  card: Card;
  penalty: number;
  turn_number: number;

  constructor(
    username: string,
    guess: Guess,
    outcome: boolean,
    card: Card,
    penalty: number,
    turn_number: number
  ) {
    this.username = username;
    this.guess = guess;
    this.outcome = outcome;
    this.card = card;
    this.penalty = penalty;
    this.turn_number = turn_number;
  }
}
