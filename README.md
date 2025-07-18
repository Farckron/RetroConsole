# Terminal Task Manager

A clean, keyboard-focused terminal-style task manager. No distractions, just productivity.

## Quick Start

Open `main/index.html` in your browser. That's it.

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `add <text>` | `a <text>` | Add a new task |
| `list` | `ls`, `l` | Show all tasks |
| `list done` | | Show completed tasks |
| `list todo` | | Show pending tasks |
| `done <id>` | `d <id>` | Mark task as completed |
| `del <id>` | `rm <id>` | Delete task |
| `clear` | `c` | Delete all tasks (requires confirmation) |
| `stats` | `s` | Show statistics |
| `export` | `save` | Export tasks to JSON file |
| `import` | `load` | Import tasks from JSON file |
| `reset` | | Reset to default tasks from tasks.json |
| `help` | `h`, `?` | Show commands |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑/↓` | Navigate command history |
| `Tab` | Command completion |
| `Ctrl+L` | Clear screen |
| `Ctrl+C` | Cancel current command |
| `Ctrl+K` | Clear input line |
| `Ctrl+H` | Show help |

## Features

- Fully keyboard-driven interface (no mouse required)
- Compact, distraction-free design
- Command shortcuts for faster workflow
- File-based task storage with import/export
- Default tasks loaded from tasks.json
- Command history with navigation
- Tab completion for commands
- Clean, minimal terminal aesthetic

## Project Structure

```
main/
├── index.html                # Main application page
├── css/
│   └── styles.css            # Minimal terminal styling
├── data/
│   └── tasks.json            # Default tasks data
└── js/
    ├── models/
    │   └── Task.js           # Task data model
    ├── storage/
    │   └── TaskStorage.js    # Data persistence layer
    ├── managers/
    │   └── TaskManager.js    # Task operations logic
    ├── terminal/
    │   └── TerminalUI.js     # Terminal interface components
    └── app.js                # Main application controller
```

## Data Storage

Tasks are stored in the browser's localStorage by default, but can be:
- Exported to a JSON file for backup
- Imported from a JSON file to restore tasks
- Reset to default tasks from the tasks.json file

## Development

Run tests: Open `tests/test-runner.html`

Modern browser required (ES6+ support).