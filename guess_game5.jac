"""A Number Guessing Game - Step 5: Scale-Agnostic Cloud Deployment"""

import random;

"""A Number Guessing Game - Step 5: Scale-Agnostic Cloud Deployment"""

import random;

walker GuessGame {
    has guess: int;

    can start with `root entry {
        print(f"🎲 Starting new game with guess: {self.guess}");
        if not [root --> (`?turn)] {
            next = root ++> turn(correct_number=random.randint(1, 10));
        } else {
            next = [root --> (`?turn)];
        }
        visit next;
    }

    can process_guess with turn entry {
        print(f"🎯 Processing guess: {self.guess}");
        
        if [-->] {
            visit [-->];
        } else {
            if self.guess < here.correct_number {
                print("Too low!");
                here ++> turn(correct_number=here.correct_number);
            } elif self.guess > here.correct_number {
                print("Too high!");
                here ++> turn(correct_number=here.correct_number);
            } else {
                print("🎉 Congratulations! You guessed correctly!");
                disengage;
            }
        }
    }
}

node turn {
    has correct_number: int;
}

# Will run when in CLI mode (not in cloud)  
with entry:__main__ {
    print("🎲 Scale-Agnostic Cloud Deployment Demo");
    print("=" * 40);
    print("💡 This same code can run as cloud service with 'jac serve'");
    print("");
    
    root spawn GuessGame(guess=3);
    root spawn GuessGame(guess=4);
    root spawn GuessGame(guess=5);
    root spawn GuessGame(guess=6);
}