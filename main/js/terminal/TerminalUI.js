/**
 * Terminal UI
 * Handles terminal display and user interaction
 */
class TerminalUI {
    constructor() {
        this.elements = {};
        this.commandHistory = [];
        this.historyIndex = -1;
        this.commandBuffer = '';
        this.shortcuts = {
            'Ctrl+L': 'Clear screen',
            'Ctrl+C': 'Cancel command',
            'Ctrl+K': 'Clear input line',
            'Ctrl+H': 'Show help',
            'Tab': 'Command completion',
            '↑/↓': 'History navigation'
        };
    }

    /**
     * Initialize UI
     */
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.loadCommandHistory();
        this.showWelcome();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            terminal: document.getElementById('terminal'),
            output: document.getElementById('output'),
            input: document.getElementById('input')
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.elements.input) return;

        this.elements.input.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Always keep focus on input for keyboard-only usage
        document.addEventListener('click', () => {
            if (this.elements.input) {
                this.elements.input.focus();
            }
        });
        
        // Focus input on page load
        window.addEventListener('load', () => {
            if (this.elements.input) {
                this.elements.input.focus();
            }
        });
    }

    /**
     * Show welcome message
     */
    showWelcome() {
        this.displayOutput('Terminal Task Manager', 'help-title');
        this.displayOutput('Type "help" or press Ctrl+H for commands', 'info');
    }

    /**
     * Handle keyboard input
     */
    handleKeydown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.executeCommand();
                break;
            
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
            
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
            
            case 'Tab':
                e.preventDefault();
                this.handleTabCompletion();
                break;
            
            case 'l':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.clearScreen();
                }
                break;
                
            case 'c':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.cancelCommand();
                }
                break;
                
            case 'k':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.clearInput();
                }
                break;
                
            case 'h':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.showHelp();
                }
                break;
        }
    }

    /**
     * Execute command
     */
    executeCommand() {
        const input = this.elements.input.value.trim();
        
        if (!input) return;

        // Add to history
        this.addToHistory(input);
        
        // Show command in output
        this.displayOutput(`$ ${input}`, 'command');
        
        // Clear input
        this.elements.input.value = '';
        
        // Trigger command execution (handled by main app)
        if (this.onCommandExecute) {
            this.onCommandExecute(input);
        }
    }

    /**
     * Display output line
     */
    displayOutput(text, className = '') {
        if (!this.elements.output) return;

        const line = document.createElement('div');
        line.className = `line ${className}`;
        line.textContent = text;
        this.elements.output.appendChild(line);
        this.scrollToBottom();
    }

    /**
     * Display task list
     */
    displayTaskList(tasks, title = 'Tasks') {
        if (tasks.length === 0) {
            this.displayOutput('No tasks found', 'info');
            return;
        }

        if (title) {
            this.displayOutput(title + ':', 'help-title');
        }

        tasks.forEach(task => {
            const status = task.isCompleted() ? '✓' : '○';
            const className = task.isCompleted() ? 'task-done' : 'task';
            this.displayOutput(`${task.id}. ${status} ${task.description}`, className);
        });
    }

    /**
     * Display statistics
     */
    displayStats(stats) {
        this.displayOutput('Task Statistics:', 'help-title');
        this.displayOutput(`Total: ${stats.total} | Done: ${stats.completed} | Todo: ${stats.pending}`, 'info');
        if (stats.total > 0) {
            this.displayOutput(`Progress: ${stats.completionRate}% complete`, 'info');
        }
    }

    /**
     * Add to command history
     */
    addToHistory(command) {
        // Don't add duplicates consecutively
        if (this.commandHistory.length === 0 || this.commandHistory[this.commandHistory.length - 1] !== command) {
            this.commandHistory.push(command);
        }
        this.historyIndex = this.commandHistory.length;
        
        // Limit history size
        if (this.commandHistory.length > 100) {
            this.commandHistory.shift();
        }

        this.saveCommandHistory();
    }

    /**
     * Navigate command history
     */
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        // Save current input if at the end of history
        if (this.historyIndex === this.commandHistory.length) {
            this.commandBuffer = this.elements.input.value;
        }
        
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.elements.input.value = this.commandBuffer;
            return;
        }

        this.elements.input.value = this.commandHistory[this.historyIndex];
        
        // Place cursor at the end
        setTimeout(() => {
            this.elements.input.selectionStart = this.elements.input.value.length;
            this.elements.input.selectionEnd = this.elements.input.value.length;
        }, 0);
    }

    /**
     * Handle tab completion
     */
    handleTabCompletion() {
        const input = this.elements.input.value.trim();
        if (!input) return;
        
        const commands = [
            'add', 'a',
            'list', 'ls', 'l',
            'done', 'd',
            'del', 'rm',
            'clear', 'c',
            'help', 'h',
            'stats', 's'
        ];
        
        const matches = commands.filter(cmd => cmd.startsWith(input.toLowerCase()));
        
        if (matches.length === 1) {
            this.elements.input.value = matches[0] + ' ';
        } else if (matches.length > 1 && matches.length < 10) {
            this.displayOutput('Available commands:', 'info');
            matches.forEach(cmd => this.displayOutput(cmd, 'help-cmd'));
        }
    }

    /**
     * Cancel current command
     */
    cancelCommand() {
        this.elements.input.value = '';
        this.displayOutput('^C', 'error');
    }
    
    /**
     * Clear input line
     */
    clearInput() {
        this.elements.input.value = '';
    }

    /**
     * Show help
     */
    showHelp() {
        this.displayOutput('Commands:', 'help-title');
        
        const commands = [
            ['add, a', '<text>', 'Add a new task'],
            ['list, ls, l', '', 'Show all tasks'],
            ['list done', '', 'Show completed tasks'],
            ['list todo', '', 'Show pending tasks'],
            ['done, d', '<id>', 'Mark task as completed'],
            ['del, rm', '<id>', 'Delete task'],
            ['clear, c', '', 'Delete all tasks'],
            ['stats, s', '', 'Show statistics']
        ];
        
        commands.forEach(([cmd, args, desc]) => {
            const cmdText = cmd.padEnd(10);
            const argsText = args.padEnd(8);
            this.displayOutput(`${cmdText} ${argsText} ${desc}`, 'help-cmd');
        });
        
        this.displayOutput('Keyboard shortcuts:', 'help-title');
        Object.entries(this.shortcuts).forEach(([key, desc]) => {
            const keyText = key.padEnd(10);
            this.displayOutput(`${keyText} ${desc}`, 'help-key');
        });
    }

    /**
     * Clear screen
     */
    clearScreen() {
        if (this.elements.output) {
            this.elements.output.innerHTML = '';
            this.showWelcome();
        }
    }

    /**
     * Scroll to bottom
     */
    scrollToBottom() {
        if (this.elements.output) {
            this.elements.output.scrollTop = this.elements.output.scrollHeight;
        }
    }

    /**
     * Get command history
     */
    getCommandHistory() {
        return [...this.commandHistory];
    }

    /**
     * Clear command history
     */
    clearCommandHistory() {
        this.commandHistory = [];
        this.historyIndex = -1;
        this.saveCommandHistory();
        this.displayOutput('Command history cleared', 'info');
    }

    /**
     * Save command history
     */
    saveCommandHistory() {
        try {
            localStorage.setItem('terminal-history', JSON.stringify(this.commandHistory));
        } catch (error) {
            console.warn('Failed to save command history:', error);
        }
    }

    /**
     * Load command history
     */
    loadCommandHistory() {
        try {
            const saved = localStorage.getItem('terminal-history');
            if (saved) {
                this.commandHistory = JSON.parse(saved);
                this.historyIndex = this.commandHistory.length;
            }
        } catch (error) {
            console.warn('Failed to load command history:', error);
            this.commandHistory = [];
        }
    }
}