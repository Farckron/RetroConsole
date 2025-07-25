"use strict";

/**
 * TodoApp - Todo application that runs within terminal
 */
class TodoApp {
    constructor(windowId, terminal) {
        this.windowId = windowId;
        this.terminal = terminal;
        this.taskManager = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the todo application
     */
    async init() {
        try {
            // Use the same task manager as the terminal
            this.taskManager = this.terminal.taskManager;
            this.isInitialized = true;
            this.showWelcome();
        } catch (error) {
            console.error('Failed to initialize TodoApp:', error);
            throw error;
        }
    }

    /**
     * Show welcome message for todo app
     */
    showWelcome() {
        this.terminal.out('Todo Application Mode', 'help-title');
        this.terminal.out('Manage your tasks with simplified commands', 'info');
        
        if (this.taskManager) {
            const taskCount = this.taskManager.getAllTasks().length;
            this.terminal.out(`You have ${taskCount} tasks`, 'info');
        }
    }

    /**
     * Process commands in todo mode
     */
    processCommand(cmd, args) {
        if (!this.taskManager) {
            this.terminal.out('Error: TaskManager not available', 'error');
            return;
        }

        switch (cmd.toLowerCase()) {
            case 'add':
            case 'new':
                this.addTask(args.join(' '));
                break;
            case 'list':
            case 'show':
            case 'ls':
                this.listTasks(args[0]);
                break;
            case 'done':
            case 'complete':
            case 'finish':
                this.completeTask(args[0]);
                break;
            case 'delete':
            case 'remove':
            case 'del':
            case 'rm':
                this.deleteTask(args[0]);
                break;
            case 'stats':
            case 'status':
                this.showStats();
                break;
            case 'help':
                this.showHelp();
                break;
            default:
                this.terminal.out(`Unknown todo command: ${cmd}. Type 'help' for available commands.`, 'error');
        }
    }

    /**
     * Add a new task
     */
    async addTask(description) {
        if (!description) {
            this.terminal.out('Usage: add <task description>', 'error');
            return;
        }

        try {
            const result = await this.taskManager.createTask(description);
            if (result.success) {
                this.terminal.out(`✓ Added: ${description}`, 'success');
            } else {
                this.terminal.out(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.terminal.out(`Error adding task: ${error.message}`, 'error');
        }
    }

    /**
     * List tasks
     */
    listTasks(filter) {
        try {
            const tasks = this.taskManager.getAllTasks();
            
            if (tasks.length === 0) {
                this.terminal.out('No tasks found. Use "add" to create your first task!', 'info');
                return;
            }

            let filtered = tasks;
            if (filter === 'done') filtered = tasks.filter(t => t.isCompleted);
            if (filter === 'todo' || filter === 'pending') filtered = tasks.filter(t => !t.isCompleted);

            if (filtered.length === 0) {
                this.terminal.out(`No ${filter || 'matching'} tasks`, 'info');
                return;
            }

            this.terminal.out(`${filtered.length} task(s):`, 'help-title');
            filtered.forEach(task => {
                const status = task.isCompleted ? '✓' : '○';
                const style = task.isCompleted ? 'task-done' : 'task';
                this.terminal.out(`${task.id}. ${status} ${task.description}`, style);
            });
        } catch (error) {
            this.terminal.out(`Error listing tasks: ${error.message}`, 'error');
        }
    }

    /**
     * Complete a task
     */
    async completeTask(id) {
        if (!id) {
            this.terminal.out('Usage: done <task_id>', 'error');
            return;
        }

        try {
            const result = await this.taskManager.completeTask(id);
            if (result.success) {
                this.terminal.out(`✓ Completed: ${result.task.description}`, 'success');
            } else {
                this.terminal.out(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.terminal.out(`Error completing task: ${error.message}`, 'error');
        }
    }

    /**
     * Delete a task
     */
    async deleteTask(id) {
        if (!id) {
            this.terminal.out('Usage: delete <task_id>', 'error');
            return;
        }

        try {
            const result = await this.taskManager.deleteTask(id);
            if (result.success) {
                this.terminal.out(`✗ Deleted: ${result.task.description}`, 'success');
            } else {
                this.terminal.out(`Error: ${result.error}`, 'error');
            }
        } catch (error) {
            this.terminal.out(`Error deleting task: ${error.message}`, 'error');
        }
    }

    /**
     * Show task statistics
     */
    async showStats() {
        try {
            const stats = await this.taskManager.getTaskStats();
            this.terminal.out('📊 Task Statistics:', 'help-title');
            this.terminal.out(`Total: ${stats.total} | Completed: ${stats.completed} | Pending: ${stats.pending}`, 'info');
            if (stats.total > 0) {
                this.terminal.out(`Progress: ${stats.completionRate}% complete`, 'info');
            }
        } catch (error) {
            this.terminal.out(`Error getting stats: ${error.message}`, 'error');
        }
    }

    /**
     * Show help for todo app
     */
    showHelp() {
        this.terminal.out('Todo App Commands:', 'help-title');
        
        const commands = [
            ['add, new', '<description>', 'Add a new task'],
            ['list, show', '[done|todo]', 'List tasks (all, done, or pending)'],
            ['done, complete', '<id>', 'Mark task as completed'],
            ['delete, remove', '<id>', 'Delete a task'],
            ['stats, status', '', 'Show task statistics'],
            ['help', '', 'Show this help']
        ];
        
        commands.forEach(([cmd, args, desc]) => {
            const cmdText = cmd.padEnd(15);
            const argsText = args.padEnd(12);
            this.terminal.out(`${cmdText} ${argsText} ${desc}`, 'help-cmd');
        });
    }

    /**
     * Destroy the todo application
     */
    destroy() {
        this.isInitialized = false;
        this.taskManager = null;
    }
}