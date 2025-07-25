"use strict";

/**
 * TerminalInstance - Reusable terminal component for desktop windows
 * Refactored from the original TerminalApp to work within the desktop environment
 */
class TerminalInstance {
    constructor(windowId, appRegistry) {
        this.windowId = windowId;
        this.appRegistry = appRegistry;
        this.taskManager = null;
        this.elements = {};
        this.history = [];
        this.historyIndex = -1;
        this.commandBuffer = '';
        this.isInitialized = false;
    }

    /**
     * Initialize the terminal instance
     */
    async init() {
        try {
            console.log('Initializing TerminalInstance...');
            this.createTerminalElements();
            this.cacheElements();
            
            console.log('Creating TaskManager...');
            this.taskManager = new TaskManager();
            
            this.setupEvents();
            
            console.log('Loading tasks...');
            await this.taskManager.loadTasks();
            
            if (this.taskManager.getAllTasks().length === 0) {
                console.log('No tasks found, loading default tasks...');
                await this.loadTasksFromDefaultFile();
            }
            
            this.showWelcome();
            this.isInitialized = true;
            console.log('TerminalInstance initialized successfully');
        } catch (error) {
            console.error('Failed to initialize TerminalInstance:', error);
            if (this.elements.output) {
                this.out(`Initialization error: ${error.message}`, 'error');
            }
            throw error;
        }
    }

    /**
     * Create terminal DOM elements
     */
    createTerminalElements() {
        const window = document.getElementById(this.windowId);
        if (!window) {
            throw new Error(`Window ${this.windowId} not found`);
        }

        const content = window.querySelector('.window-content');
        if (!content) {
            throw new Error(`Window content area not found for ${this.windowId}`);
        }

        content.innerHTML = `
            <div class="terminal-content">
                <div class="output" id="output-${this.windowId}"></div>
                <div class="input-line">
                    <span class="prompt">$ </span>
                    <input type="text" id="input-${this.windowId}" autocomplete="off" spellcheck="false" autofocus>
                </div>
            </div>
        `;
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            output: document.getElementById(`output-${this.windowId}`),
            input: document.getElementById(`input-${this.windowId}`),
            fileInput: document.createElement('input')
        };
        
        // Setup hidden file input for importing tasks
        this.elements.fileInput.type = 'file';
        this.elements.fileInput.accept = '.json';
        this.elements.fileInput.style.display = 'none';
        document.body.appendChild(this.elements.fileInput);
        
        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importTasksFromFile(e.target.files[0]);
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEvents() {
        if (!this.elements.input) return;

        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.execute();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.historyUp();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.historyDown();
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                this.clear();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.tabComplete();
            } else if (e.key === 'c' && e.ctrlKey) {
                e.preventDefault();
                this.cancelCommand();
            } else if (e.key === 'k' && e.ctrlKey) {
                e.preventDefault();
                this.clearInput();
            } else if (e.key === 'h' && e.ctrlKey) {
                e.preventDefault();
                this.help();
            }
        });
    }

    /**
     * Show welcome message
     */
    showWelcome() {
        this.out('Terminal Task Manager', 'help-title');
        this.out('Type "help" or press Ctrl+H for commands', 'info');
        
        // Show task count for debugging
        if (this.taskManager) {
            const taskCount = this.taskManager.getAllTasks().length;
            this.out(`Loaded ${taskCount} tasks`, 'info');
        }
    }



    /**
     * Load tasks from default file
     */
    async loadTasksFromDefaultFile() {
        try {
            const response = await fetch('data/tasks.json');
            if (!response.ok) {
                throw new Error('Failed to load default tasks');
            }
            const data = await response.json();
            if (data && data.tasks && Array.isArray(data.tasks)) {
                const result = await this.taskManager.importTasks(JSON.stringify(data));
                if (result.success) {
                    this.out('Default tasks loaded', 'success');
                }
            }
        } catch (error) {
            console.warn('Could not load default tasks:', error);
        }
    }

    /**
     * Execute command
     */
    execute() {
        const input = this.elements.input.value.trim();
        if (!input) return;

        this.out(`$ ${input}`, 'command');
        this.addHistory(input);
        this.elements.input.value = '';
        
        // Check if TaskManager is initialized
        if (!this.taskManager) {
            this.out('Error: TaskManager not initialized', 'error');
            return;
        }
        
        const [cmd, ...args] = input.split(' ');
        
        switch (cmd.toLowerCase()) {
            case 'add':
            case 'a':
                this.add(args.join(' '));
                break;
            case 'list':
            case 'ls':
            case 'l':
                this.list(args[0]);
                break;
            case 'done':
            case 'complete':
            case 'd':
                this.done(args[0]);
                break;
            case 'del':
            case 'rm':
                this.del(args[0]);
                break;
            case 'clear':
            case 'c':
                if (args[0] === 'yes') {
                    this.clearAll();
                } else if (args.length === 0) {
                    this.clear(); // Clear screen, not tasks
                } else {
                    this.clearConfirm();
                }
                break;
            case 'help':
            case 'h':
            case '?':
                this.help();
                break;
            case 'stats':
            case 's':
                this.stats();
                break;
            case 'export':
            case 'save':
                this.exportTasks();
                break;
            case 'import':
            case 'load':
                this.importTasks();
                break;
            case 'reset':
                this.resetToDefault();
                break;
            default:
                this.out(`Unknown command: ${cmd}`, 'error');
        }
    }

    /**
     * Add task command
     */
    async add(text) {
        if (!text) {
            this.out('Usage: add <text>', 'error');
            return;
        }
        
        try {
            const result = await this.taskManager.createTask(text);
            if (result.success) {
                this.out(`Added task #${result.task.id}: ${result.task.description}`, 'success');
            } else {
                this.out(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.out(`Error adding task: ${error.message}`, 'error');
        }
    }

    /**
     * List tasks command
     */
    list(filter) {
        try {
            const tasks = this.taskManager.getAllTasks();
            
            if (tasks.length === 0) {
                this.out('No tasks found', 'info');
                return;
            }

            let filtered = tasks;
            if (filter === 'done') filtered = tasks.filter(t => t.isCompleted);
            if (filter === 'todo') filtered = tasks.filter(t => !t.isCompleted);

            if (filtered.length === 0) {
                this.out(`No ${filter || 'matching'} tasks`, 'info');
                return;
            }

            filtered.forEach(task => {
                const mark = task.isCompleted ? '✓' : '○';
                const cls = task.isCompleted ? 'task-done' : 'task';
                this.out(`${task.id}. ${mark} ${task.description}`, cls);
            });
        } catch (error) {
            this.out(`Error listing tasks: ${error.message}`, 'error');
        }
    }

    /**
     * Mark task as done
     */
    async done(id) {
        if (!id) {
            this.out('Usage: done <id>', 'error');
            return;
        }
        
        try {
            const result = await this.taskManager.completeTask(id);
            if (result.success) {
                this.out(`Completed task #${id}: ${result.task.description}`, 'success');
            } else {
                this.out(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.out(`Error completing task: ${error.message}`, 'error');
        }
    }

    /**
     * Delete task
     */
    async del(id) {
        if (!id) {
            this.out('Usage: del <id>', 'error');
            return;
        }
        
        try {
            const result = await this.taskManager.deleteTask(id);
            if (result.success) {
                this.out(`Deleted task #${id}: ${result.task.description}`, 'success');
            } else {
                this.out(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.out(`Error deleting task: ${error.message}`, 'error');
        }
    }

    /**
     * Clear confirmation
     */
    clearConfirm() {
        const count = this.taskManager.getAllTasks().length;
        if (count === 0) {
            this.out('No tasks', 'info');
            return;
        }
        this.out(`Delete all ${count} tasks? Type "clear yes" to confirm`, 'warning');
    }

    /**
     * Clear all tasks
     */
    async clearAll() {
        const result = await this.taskManager.clearAllTasks();
        this.out(result.success ? 'All tasks deleted' : result.error,
                result.success ? 'success' : 'error');
    }

    /**
     * Export tasks
     */
    async exportTasks() {
        const result = await this.taskManager.exportTasks();
        
        if (!result.success) {
            this.out(`Export failed: ${result.error}`, 'error');
            return;
        }
        
        const blob = new Blob([result.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        this.out('Tasks exported to file', 'success');
    }

    /**
     * Import tasks
     */
    importTasks() {
        this.elements.fileInput.value = '';
        this.elements.fileInput.click();
    }

    /**
     * Import tasks from file
     */
    importTasksFromFile(file) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const jsonData = e.target.result;
                const result = await this.taskManager.importTasks(jsonData);
                
                if (result.success) {
                    this.out('Tasks imported successfully', 'success');
                } else {
                    this.out(`Import failed: ${result.error}`, 'error');
                }
            } catch (error) {
                this.out(`Error reading file: ${error.message}`, 'error');
            }
        };
        
        reader.onerror = () => {
            this.out('Error reading file', 'error');
        };
        
        reader.readAsText(file);
    }

    /**
     * Reset to default tasks
     */
    async resetToDefault() {
        this.out('Resetting to default tasks...', 'info');
        await this.taskManager.clearAllTasks();
        await this.loadTasksFromDefaultFile();
    }

    /**
     * Show help
     */
    help() {
        this.out('Commands:', 'help-title');
        
        const commands = [
            ['add, a', '<text>', 'Add a new task'],
            ['list, ls, l', '', 'Show all tasks'],
            ['list done', '', 'Show completed tasks'],
            ['list todo', '', 'Show pending tasks'],
            ['done, d', '<id>', 'Mark task as completed'],
            ['del, rm', '<id>', 'Delete task'],
            ['clear, c', '', 'Delete all tasks'],
            ['stats, s', '', 'Show statistics'],
            ['export, save', '', 'Export tasks to file'],
            ['import, load', '', 'Import tasks from file'],
            ['reset', '', 'Reset to default tasks']
        ];
        
        commands.forEach(([cmd, args, desc]) => {
            const cmdText = cmd.padEnd(10);
            const argsText = args.padEnd(8);
            this.out(`${cmdText} ${argsText} ${desc}`, 'help-cmd');
        });
        
        this.out('Keyboard shortcuts:', 'help-title');
        const shortcuts = [
            ['↑/↓', 'Navigate command history'],
            ['Tab', 'Command completion'],
            ['Ctrl+L', 'Clear screen'],
            ['Ctrl+C', 'Cancel current command'],
            ['Ctrl+K', 'Clear input line'],
            ['Ctrl+H', 'Show help']
        ];
        
        shortcuts.forEach(([key, desc]) => {
            const keyText = key.padEnd(10);
            this.out(`${keyText} ${desc}`, 'help-key');
        });
    }

    /**
     * Show statistics
     */
    async stats() {
        const s = await this.taskManager.getTaskStats();
        this.out('Task Statistics:', 'help-title');
        this.out(`Total: ${s.total} | Done: ${s.completed} | Todo: ${s.pending}`, 'info');
        if (s.total > 0) this.out(`Progress: ${s.completionRate}% complete`, 'info');
    }

    /**
     * Clear screen
     */
    clear() {
        this.elements.output.innerHTML = '';
        this.showWelcome();
    }

    /**
     * Output text to terminal
     */
    out(text, cls = '') {
        if (!this.elements.output) {
            console.error('Terminal output element not found');
            return;
        }
        
        const line = document.createElement('div');
        line.className = `line ${cls}`;
        line.textContent = text;
        this.elements.output.appendChild(line);
        this.elements.output.scrollTop = this.elements.output.scrollHeight;
    }

    /**
     * Add command to history
     */
    addHistory(cmd) {
        if (this.history.length === 0 || this.history[this.history.length - 1] !== cmd) {
            this.history.push(cmd);
        }
        this.historyIndex = this.history.length;
        if (this.history.length > 50) this.history.shift();
    }

    /**
     * Navigate history up
     */
    historyUp() {
        if (this.history.length === 0) return;
        
        if (this.historyIndex === this.history.length) {
            this.commandBuffer = this.elements.input.value;
        }
        
        if (this.historyIndex > 0) this.historyIndex--;
        this.elements.input.value = this.history[this.historyIndex] || '';
        
        setTimeout(() => {
            this.elements.input.selectionStart = this.elements.input.value.length;
            this.elements.input.selectionEnd = this.elements.input.value.length;
        }, 0);
    }

    /**
     * Navigate history down
     */
    historyDown() {
        if (this.history.length === 0) return;
        
        this.historyIndex++;
        if (this.historyIndex >= this.history.length) {
            this.historyIndex = this.history.length;
            this.elements.input.value = this.commandBuffer;
        } else {
            this.elements.input.value = this.history[this.historyIndex];
        }
        
        setTimeout(() => {
            this.elements.input.selectionStart = this.elements.input.value.length;
            this.elements.input.selectionEnd = this.elements.input.value.length;
        }, 0);
    }

    /**
     * Tab completion
     */
    tabComplete() {
        const input = this.elements.input.value.trim();
        if (!input) return;
        
        const commands = [
            'add', 'a',
            'list', 'ls', 'l',
            'done', 'd',
            'del', 'rm',
            'clear', 'c',
            'help', 'h', '?',
            'stats', 's',
            'export', 'save',
            'import', 'load',
            'reset'
        ];
        
        const matches = commands.filter(cmd => cmd.startsWith(input.toLowerCase()));
        
        if (matches.length === 1) {
            this.elements.input.value = matches[0] + ' ';
        }
    }
    
    /**
     * Cancel command
     */
    cancelCommand() {
        this.elements.input.value = '';
        this.out('^C', 'error');
    }
    
    /**
     * Clear input
     */
    clearInput() {
        this.elements.input.value = '';
    }

    /**
     * Focus the terminal input
     */
    focus() {
        if (this.elements.input) {
            this.elements.input.focus();
        }
    }

    /**
     * Destroy the terminal instance
     */
    destroy() {
        if (this.elements.fileInput && this.elements.fileInput.parentNode) {
            this.elements.fileInput.parentNode.removeChild(this.elements.fileInput);
        }
        this.isInitialized = false;
    }
}