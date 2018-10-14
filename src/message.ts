
export class Guess {
  card_colour: string;

  constructor(card_colour: string) {
    this.card_colour = card_colour;
  }

  static red() {
    return new Guess("Red");
  }

  static black() {
    return new Guess("Black");
  }

  toJSON() {
    return { "Guess":  { "card_colour": this.card_colour }};
  }
}


export class Login {
  username: string;

  constructor(username: string) {
    this.username = username;
  }

  toJSON() {
    return { "Login": { "username": this.username }};
  }
}
