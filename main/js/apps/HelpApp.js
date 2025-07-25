"use strict";

/**
 * HelpApp - Simple help application
 */
class HelpApp {
    constructor(windowId, terminal) {
        this.windowId = windowId;
        this.terminal = terminal;
        this.isInitialized = false;
    }

    /**
     * Initialize the help application
     */
    async init() {
        try {
            this.showHelpContent();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize HelpApp:', error);
            throw error;
        }
    }

    /**
     * Show help content in terminal
     */
    showHelpContent() {
        this.terminal.out('Arch Desktop Interface - Help', 'help-title');
        this.terminal.out('', 'info');
        
        this.terminal.out('Keyboard Shortcuts:', 'help-title');
        this.terminal.out('  Ctrl+Alt+T    - Open new terminal window', 'info');
        this.terminal.out('  Ctrl+Alt+W    - Close active window', 'info');
        this.terminal.out('', 'info');

        this.terminal.out('Terminal Commands (in terminal mode):', 'help-title');
        this.terminal.out('  add <text>    - Add a new task', 'info');
        this.terminal.out('  list          - Show all tasks', 'info');
        this.terminal.out('  list done     - Show completed tasks', 'info');
        this.terminal.out('  list todo     - Show pending tasks', 'info');
        this.terminal.out('  done <id>     - Mark task as completed', 'info');
        this.terminal.out('  del <id>      - Delete task', 'info');
        this.terminal.out('  clear         - Delete all tasks', 'info');
        this.terminal.out('  stats         - Show statistics', 'info');
        this.terminal.out('  export        - Export tasks to file', 'info');
        this.terminal.out('  import        - Import tasks from file', 'info');
        this.terminal.out('', 'info');

        this.terminal.out('Application Commands:', 'help-title');
        this.terminal.out('  apps          - List available applications', 'info');
        this.terminal.out('  todo          - Switch to todo app', 'info');
        this.terminal.out('  calculator    - Switch to calculator app', 'info');
        this.terminal.out('  help          - Switch to help app (this)', 'info');
        this.terminal.out('  exit          - Return to terminal mode', 'info');
        this.terminal.out('', 'info');

        this.terminal.out('Usage Tips:', 'help-title');
        this.terminal.out('  - Use taskbar buttons to launch apps in new windows', 'info');
        this.terminal.out('  - Type app names to switch between apps within a terminal', 'info');
        this.terminal.out('  - Each terminal window can run different apps independently', 'info');
        this.terminal.out('  - Use "exit" to return to terminal mode from any app', 'info');
    }

    /**
     * Process commands in help mode
     */
    processCommand(cmd, args) {
        switch (cmd.toLowerCase()) {
            case 'refresh':
            case 'reload':
                this.showHelpContent();
                break;
            case 'help':
                this.showHelp();
                break;
            default:
                this.terminal.out(`Help app doesn't handle "${cmd}". Type "exit" to return to terminal.`, 'error');
        }
    }

    /**
     * Show help for help app
     */
    showHelp() {
        this.terminal.out('Help App Commands:', 'help-title');
        this.terminal.out('  refresh       - Refresh help content', 'info');
        this.terminal.out('  help          - Show this help', 'info');
        this.terminal.out('  exit          - Return to terminal mode', 'info');
    }

    /**
     * Destroy the help application
     */
    destroy() {
        this.isInitialized = false;
    }
}