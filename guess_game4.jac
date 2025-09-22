"""A Number Guessing Game - Step 4: Walker and Graph Traversal"""

import random;

walker GuessGame {
    has correct_number: int = random.randint(1, 10);
    has attempts: int = 10;

    can start_game with `root entry {
        print(f"I'm thinking of a number between 1 and 10. You have {self.attempts} attempts!");
        visit [-->];
    }

    can process_guess with turn entry {
        while self.attempts > 0 {
            guess = input("Guess a number between 1 and 10: ");
            if guess.isdigit() {
                if self.check_guess(int(guess)) {
                    print("Congratulations! You guessed correctly.");
                    disengage;
                }
            } else {
                print("That's not a valid number! Try again.");
            }
        }
        print("Sorry, you didn't guess the number. Better luck next time!");
        disengage;
    }

    def check_guess(guess: int) -> bool {
        if guess > self.correct_number {
            print("Too high!");
        } elif guess < self.correct_number {
            print("Too low!");
        } else {
            return True;
        }
        self.attempts -= 1;
        if self.attempts > 0 {
            print(f"You have {self.attempts} attempts left.");
        }
        return False;
    }
}

node turn {
    # Game turn node
}

# Run the game
with entry {
    root ++> turn();
    GuessGame() spawn root;
}