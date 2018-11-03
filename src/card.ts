export class Card {
  value: string;
  suit: string;

  constructor(value: string, suit: string) {
    this.value = value;
    this.suit = suit;
  }

  prettyPrint() {
    let suit: string = "Unknown";
    let value: string = "Unkown";

    switch (this.suit) {
      case "Club":
        suit = "♣";
        break;
      case "Spade":
        suit = "♠";
        break;
      case "Heart":
        suit = "♥";
        break;
      case "Diamond":
        suit = "♦";
        break;
    }

    switch (this.value) {
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
    return `${suit}${value}`
  }
}
