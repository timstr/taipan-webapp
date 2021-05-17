import { strictEqual } from "assert";
import { CardStack, isBomb } from "../src/interfaces/cards";

describe("Is bomb", () => {
    it("should be able to identify non-bombs", () => {
        {
            let s: CardStack = {
                cards: [],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: ["Dog"],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: ["Dog", "Dog", "Dog", "Dog"],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: ["Dog", "Mah Jong", "Dragon", "Phoenix"],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "2" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Blue", value: "2" },
                    { suite: "Green", value: "2" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Blue", value: "2" },
                    { suite: "Green", value: "2" },
                    "Phoenix",
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "3" },
                    { suite: "Black", value: "4" },
                    { suite: "Black", value: "5" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    "Mah Jong",
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "3" },
                    { suite: "Black", value: "4" },
                    { suite: "Black", value: "5" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "3" },
                    { suite: "Black", value: "4" },
                    { suite: "Black", value: "5" },
                    { suite: "Black", value: "7" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "3" },
                    "Phoenix",
                    { suite: "Black", value: "5" },
                    { suite: "Black", value: "6" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "3" },
                    { suite: "Black", value: "4" },
                    { suite: "Black", value: "5" },
                    { suite: "Blue", value: "2" },
                    { suite: "Blue", value: "3" },
                    { suite: "Blue", value: "4" },
                    { suite: "Blue", value: "5" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Red", value: "9" },
                    { suite: "Green", value: "10" },
                    { suite: "Red", value: "Jack" },
                    { suite: "Red", value: "Queen" },
                    { suite: "Red", value: "King" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "Jack" },
                    { suite: "Black", value: "Queen" },
                    { suite: "Black", value: "King" },
                    { suite: "Black", value: "Ace" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    "Phoenix",
                    { suite: "Black", value: "Jack" },
                    { suite: "Black", value: "Queen" },
                    { suite: "Black", value: "King" },
                    { suite: "Black", value: "Ace" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Blue", value: "10" },
                    { suite: "Black", value: "Jack" },
                    { suite: "Black", value: "Queen" },
                    { suite: "Black", value: "King" },
                    { suite: "Black", value: "Ace" },
                ],
            };
            strictEqual(isBomb(s), false);
        }
    });

    it("should be able to identify bombs", () => {
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Blue", value: "2" },
                    { suite: "Green", value: "2" },
                    { suite: "Red", value: "2" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "3" },
                    { suite: "Blue", value: "3" },
                    { suite: "Green", value: "3" },
                    { suite: "Red", value: "3" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "4" },
                    { suite: "Blue", value: "4" },
                    { suite: "Green", value: "4" },
                    { suite: "Red", value: "4" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "Jack" },
                    { suite: "Blue", value: "Jack" },
                    { suite: "Green", value: "Jack" },
                    { suite: "Red", value: "Jack" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "Ace" },
                    { suite: "Blue", value: "Ace" },
                    { suite: "Green", value: "Ace" },
                    { suite: "Red", value: "Ace" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "3" },
                    { suite: "Black", value: "4" },
                    { suite: "Black", value: "5" },
                    { suite: "Black", value: "6" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "3" },
                    { suite: "Black", value: "4" },
                    { suite: "Black", value: "5" },
                    { suite: "Black", value: "6" },
                    { suite: "Black", value: "7" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "7" },
                    { suite: "Black", value: "6" },
                    { suite: "Black", value: "5" },
                    { suite: "Black", value: "4" },
                    { suite: "Black", value: "3" },
                    { suite: "Black", value: "2" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "3" },
                    { suite: "Black", value: "4" },
                    { suite: "Black", value: "5" },
                    { suite: "Black", value: "6" },
                    { suite: "Black", value: "7" },
                    { suite: "Black", value: "8" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Black", value: "2" },
                    { suite: "Black", value: "3" },
                    { suite: "Black", value: "4" },
                    { suite: "Black", value: "5" },
                    { suite: "Black", value: "6" },
                    { suite: "Black", value: "7" },
                    { suite: "Black", value: "8" },
                    { suite: "Black", value: "9" },
                    { suite: "Black", value: "10" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Blue", value: "6" },
                    { suite: "Blue", value: "7" },
                    { suite: "Blue", value: "8" },
                    { suite: "Blue", value: "9" },
                    { suite: "Blue", value: "10" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Green", value: "8" },
                    { suite: "Green", value: "9" },
                    { suite: "Green", value: "10" },
                    { suite: "Green", value: "Jack" },
                    { suite: "Green", value: "Queen" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Red", value: "10" },
                    { suite: "Red", value: "Jack" },
                    { suite: "Red", value: "Queen" },
                    { suite: "Red", value: "King" },
                    { suite: "Red", value: "Ace" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
        {
            let s: CardStack = {
                cards: [
                    { suite: "Red", value: "Queen" },
                    { suite: "Red", value: "Jack" },
                    { suite: "Red", value: "Ace" },
                    { suite: "Red", value: "King" },
                    { suite: "Red", value: "10" },
                ],
            };
            strictEqual(isBomb(s), true);
        }
    });
});
