"""A Number Guessing Game - Step 5: Scale-Agnostic Cloud Deployment"""

import random;

walker GuessGame {
    has guess: int;
    has attempts: int = 10;

    can start with `root entry {
        print(f"Starting new game with guess: {self.guess}");
        visit [-->];
    }

    can process_guess with turn entry {
        print(f"Processing guess: {self.guess}");
        if self.guess == here.correct_number {
            print("Congratulations! You guessed correctly.");
            return {"result": "win", "guess": self.guess, "correct": here.correct_number};
        } elif self.guess > here.correct_number {
            print("Too high!");
            return {"result": "too_high", "guess": self.guess, "correct": here.correct_number};
        } else {
            print("Too low!");
            return {"result": "too_low", "guess": self.guess, "correct": here.correct_number};
        }
    }
}

node turn {
    has correct_number: int = random.randint(1, 10);
}

# Will run when in CLI mode (not in cloud)
with entry:__main__ {
    root ++> turn();
    
    print("CLI Mode - Testing multiple guesses:");
    result1 = root spawn GuessGame(guess=3);
    print(f"Result for guess 3: {result1}");
    
    result2 = root spawn GuessGame(guess=7);
    print(f"Result for guess 7: {result2}");
    
    result3 = root spawn GuessGame(guess=5);
    print(f"Result for guess 5: {result3}");
}