# Jaseci Project

A learning repository for Jac programming language examples and tutorials.

## Overview

This repository contains basic Jac programs demonstrating fundamental concepts of the Jac programming language, including entry blocks and basic execution patterns.

## Prerequisites

- Python 3.13+
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/rayklanderman/jaseci-proj.git
cd jaseci-proj
```

### 2. Activate the Virtual Environment

The repository includes a pre-configured virtual environment with all dependencies installed.

**Windows (PowerShell):**

```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**

```cmd
venv\Scripts\activate.bat
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

### 3. Verify Installation

Check that Jac is working correctly:

```bash
jac --version
```

You should see: `Jac version 0.8.7`

## Example Programs

### Hello World (`hello.jac`)

Basic Hello World program demonstrating the entry block syntax:

```jac
# hello.jac
with entry {
    print("Hello, Jac World!");
}
```

**Run it:**

```bash
jac run hello.jac
```

**Output:**

```
Hello, Jac World!
```

### Single Entry Block (`single_entry.jac`)

Demonstrates a single entry block - the Jac equivalent to Python's `if __name__ == "__main__"`:

```jac
# Entry block - program starts here
with entry {
    print("Hello single entry block!");
}
```

**Run it:**

```bash
jac run single_entry.jac
```

### Multiple Entry Blocks (`multiple_entry.jac`)

Shows how multiple entry blocks execute in sequence:

```jac
# First entry block
with entry {
    print("Hello first entry block!");
}

# Second entry block
with entry {
    print("Hello second entry block!");
}

# Third entry block
with entry {
    print("Hello third entry block!");
}
```

**Run it:**

```bash
jac run multiple_entry.jac
```

**Output:**

```
Hello first entry block!
Hello second entry block!
Hello third entry block!
```

## Key Concepts

### Entry Blocks

- **`with entry { }`** - Defines where program execution begins
- Equivalent to Python's `if __name__ == "__main__":`
- Multiple entry blocks execute in the order they appear
- Used to structure the main execution flow of Jac programs

## Project Structure

```
jaseci-proj/
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── hello.jac               # Basic Hello World
├── single_entry.jac        # Single entry block example
├── multiple_entry.jac      # Multiple entry blocks example
└── venv/                   # Virtual environment with jaclang installed
    ├── Scripts/            # Python executables and scripts
    ├── Lib/                # Installed packages
    └── pyvenv.cfg          # Virtual environment configuration
```

## Dependencies

The virtual environment includes:

- **jaclang** (0.8.7) - The Jac programming language
- **mypy** (1.18.2) - Static type checker
- **typing_extensions** - Extended typing support
- **pathspec** - Path specification utilities

## Development

To add new Jac programs:

1. Create a new `.jac` file
2. Write your Jac code with `with entry { }` blocks
3. Test with `jac run yourfile.jac`
4. Commit and push your changes

## Jac in a Flash Tutorial

This comprehensive tutorial evolves a simple "guess the number" game from Python to fully object-spatial Jac, introducing key language features step by step.

### Tutorial Steps

1. **[Step 0](guess_game.py)** - Python version (starting point)
2. **[Step 1](guess_game1.jac)** - Direct Jac translation with classes and methods
3. **[Step 2](guess_game2.jac)** - Using `has` for field declarations
4. **[Step 3](guess_game3.jac)** - Separating implementation with `impl`
5. **[Step 4](guess_game4.jac)** - Walker-based graph traversal
6. **[Step 5](guess_game5.jac)** - Scale-agnostic cloud deployment
7. **[Step 6](guess_game6.jac)** - AI-enhanced with byLLM integration

Each step maintains the same game behavior while demonstrating different Jac language features and paradigms.

### Running the Tutorial

Run any example with:

```bash
jac run guess_game1.jac  # Or any step number
```

For cloud deployment (Step 5+):

```bash
jac serve guess_game5.jac
```

## Learning Resources

- [Jac Documentation](https://docs.jac-lang.org/)
- [Jaseci Framework](https://github.com/Jaseci-Labs/jaseci)

## Contributing

Feel free to add more examples and learning materials to this repository!

## License

This project is for educational purposes.
