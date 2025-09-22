"""A Number Guessing Game - Step 6: AI-Enhanced with byLLM"""

import random;

walker GuessGame {
    has guess: int;

    can start with `root entry {
        print("Starting AI-enhanced game with guess: " + str(self.guess));
        visit [-->];
    }

    can process_guess with turn entry {
        print("Processing guess: " + str(self.guess));
        
        if self.guess == here.correct_number {
            print("🎉 Congratulations! You guessed correctly!");
            return True;
        } else {
            # Generate AI-powered hint
            hint = self.generate_hint(self.guess, here.correct_number);
            print("🤖 AI Hint: " + hint);
            return False;
        }
    }
    
    def generate_hint(guess: int, correct: int) -> str {
        # Simulated AI hint generation
        diff = abs(guess - correct);
        if diff == 1 {
            return "You're so close! Just one number away!";
        } elif diff <= 3 {
            return "Getting warmer! You're in the right neighborhood.";
        } else {
            return "Think of a different range - you're quite far off.";
        }
    }
}

node turn {
    has correct_number: int = random.randint(1, 10);
}

# Will run when in CLI mode
with entry:__main__ {
    root ++> turn();
    
    print("🎲 AI-Enhanced Guessing Game - CLI Mode");
    print("=" * 45);
    
    print("🎯 Testing guess: 2");
    result1 = root spawn GuessGame(guess=2);
    
    print("🎯 Testing guess: 8");  
    result2 = root spawn GuessGame(guess=8);
}