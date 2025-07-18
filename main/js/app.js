class TerminalApp {
    constructor() {
        this.taskManager = null;
        this.elements = {};
        this.history = [];
        this.historyIndex = -1;
        this.commandBuffer = '';
    }

    async init() {
        this.cacheElements();
        this.taskManager = new TaskManager();
        this.setupEvents();
        await this.loadDefaultTasks();
        this.showWelcome();
    }

    cacheElements() {
        this.elements = {
            terminal: document.getElementById('terminal'),
            output: document.getElementById('output'),
            input: document.getElementById('input'),
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

    setupEvents() {
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
        
        // Always focus input when clicking anywhere
        document.addEventListener('click', () => this.elements.input.focus());
        
        // Focus input on page load
        window.addEventListener('load', () => this.elements.input.focus());
    }

    showWelcome() {
        this.out('Terminal Task Manager', 'help-title');
        this.out('Type "help" or press Ctrl+H for commands', 'info');
    }

    async loadDefaultTasks() {
        // Wait for initial load, then check if we need default tasks
        await this.taskManager.loadTasks();
        if (this.taskManager.getAllTasks().length === 0) {
            await this.loadTasksFromDefaultFile();
        }
    }

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

    execute() {
        const input = this.elements.input.value.trim();
        if (!input) return;

        // Show command in output
        this.out(`$ ${input}`, 'command');
        
        this.addHistory(input);
        this.elements.input.value = '';
        
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
            case 'd':
                this.done(parseInt(args[0]));
                break;
            case 'del':
            case 'rm':
                this.del(parseInt(args[0]));
                break;
            case 'clear':
            case 'c':
                args[0] === 'yes' ? this.clearAll() : this.clearConfirm();
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

    async add(text) {
        if (!text) {
            this.out('Usage: add <text>', 'error');
            return;
        }
        
        const result = await this.taskManager.createTask(text);
        this.out(result.success ? `Added task #${result.task.id}` : result.error, 
                result.success ? 'success' : 'error');
    }

    list(filter) {
        const tasks = this.taskManager.getAllTasks();
        
        if (tasks.length === 0) {
            this.out('No tasks', 'info');
            return;
        }

        let filtered = tasks;
        if (filter === 'done') filtered = tasks.filter(t => t.isCompleted());
        if (filter === 'todo') filtered = tasks.filter(t => !t.isCompleted());

        if (filtered.length === 0) {
            this.out(`No ${filter} tasks`, 'info');
            return;
        }

        filtered.forEach(task => {
            const mark = task.isCompleted() ? '✓' : '○';
            const cls = task.isCompleted() ? 'task-done' : 'task';
            this.out(`${task.id}. ${mark} ${task.description}`, cls);
        });
    }

    async done(id) {
        if (isNaN(id)) {
            this.out('Usage: done <id>', 'error');
            return;
        }
        
        const result = await this.taskManager.completeTask(id);
        this.out(result.success ? `Completed task #${id}` : result.error, 
                result.success ? 'success' : 'error');
    }

    async del(id) {
        if (isNaN(id)) {
            this.out('Usage: del <id>', 'error');
            return;
        }
        
        const result = await this.taskManager.deleteTask(id);
        this.out(result.success ? `Deleted task #${id}` : result.error,
                result.success ? 'success' : 'error');
    }

    clearConfirm() {
        const count = this.taskManager.getAllTasks().length;
        if (count === 0) {
            this.out('No tasks', 'info');
            return;
        }
        this.out(`Delete all ${count} tasks? Type "clear yes" to confirm`, 'warning');
    }

    async clearAll() {
        const result = await this.taskManager.clearAllTasks();
        this.out(result.success ? 'All tasks deleted' : result.error,
                result.success ? 'success' : 'error');
    }

    async exportTasks() {
        const result = await this.taskManager.exportTasks();
        
        if (!result.success) {
            this.out(`Export failed: ${result.error}`, 'error');
            return;
        }
        
        // Create a downloadable file
        const blob = new Blob([result.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        this.out('Tasks exported to file', 'success');
    }
    
    importTasks() {
        this.elements.fileInput.value = '';
        this.elements.fileInput.click();
    }
    
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
    
    async resetToDefault() {
        this.out('Resetting to default tasks...', 'info');
        await this.taskManager.clearAllTasks();
        await this.loadTasksFromDefaultFile();
    }

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

    async stats() {
        const s = await this.taskManager.getTaskStats();
        this.out('Task Statistics:', 'help-title');
        this.out(`Total: ${s.total} | Done: ${s.completed} | Todo: ${s.pending}`, 'info');
        if (s.total > 0) this.out(`Progress: ${s.completionRate}% complete`, 'info');
    }

    clear() {
        this.elements.output.innerHTML = '';
        this.showWelcome();
    }

    out(text, cls = '') {
        const line = document.createElement('div');
        line.className = `line ${cls}`;
        line.textContent = text;
        this.elements.output.appendChild(line);
        this.elements.output.scrollTop = this.elements.output.scrollHeight;
    }

    addHistory(cmd) {
        // Don't add duplicates consecutively
        if (this.history.length === 0 || this.history[this.history.length - 1] !== cmd) {
            this.history.push(cmd);
        }
        this.historyIndex = this.history.length;
        if (this.history.length > 50) this.history.shift();
    }

    historyUp() {
        if (this.history.length === 0) return;
        
        // Save current input if at the end of history
        if (this.historyIndex === this.history.length) {
            this.commandBuffer = this.elements.input.value;
        }
        
        if (this.historyIndex > 0) this.historyIndex--;
        this.elements.input.value = this.history[this.historyIndex] || '';
        
        // Place cursor at the end
        setTimeout(() => {
            this.elements.input.selectionStart = this.elements.input.value.length;
            this.elements.input.selectionEnd = this.elements.input.value.length;
        }, 0);
    }

    historyDown() {
        if (this.history.length === 0) return;
        
        this.historyIndex++;
        if (this.historyIndex >= this.history.length) {
            this.historyIndex = this.history.length;
            this.elements.input.value = this.commandBuffer;
        } else {
            this.elements.input.value = this.history[this.historyIndex];
        }
        
        // Place cursor at the end
        setTimeout(() => {
            this.elements.input.selectionStart = this.elements.input.value.length;
            this.elements.input.selectionEnd = this.elements.input.value.length;
        }, 0);
    }
    
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
    
    cancelCommand() {
        this.elements.input.value = '';
        this.out('^C', 'error');
    }
    
    clearInput() {
        this.elements.input.value = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TerminalApp().init();
});