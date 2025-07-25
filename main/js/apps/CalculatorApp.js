"use strict";

/**
 * CalculatorApp - Simple calculator application that runs within terminal
 */
class CalculatorApp {
    constructor(windowId, terminal) {
        this.windowId = windowId;
        this.terminal = terminal;
        this.memory = 0;
        this.lastResult = 0;
        this.isInitialized = false;
    }

    /**
     * Initialize the calculator application
     */
    async init() {
        try {
            this.isInitialized = true;
            this.showWelcome();
        } catch (error) {
            console.error('Failed to initialize CalculatorApp:', error);
            throw error;
        }
    }

    /**
     * Show welcome message for calculator app
     */
    showWelcome() {
        this.terminal.out('Calculator Application Mode', 'help-title');
        this.terminal.out('Enter mathematical expressions or use calculator commands', 'info');
        this.terminal.out('Examples: 2 + 3, sqrt(16), sin(30), etc.', 'info');
    }

    /**
     * Process commands in calculator mode
     */
    processCommand(cmd, args) {
        const input = [cmd, ...args].join(' ').trim();
        
        // Handle special calculator commands
        switch (cmd.toLowerCase()) {
            case 'clear':
            case 'c':
                this.clear();
                break;
            case 'memory':
            case 'mem':
                this.showMemory();
                break;
            case 'store':
            case 'ms':
                this.storeMemory(args.join(' '));
                break;
            case 'recall':
            case 'mr':
                this.recallMemory();
                break;
            case 'help':
                this.showHelp();
                break;
            default:
                // Try to evaluate as mathematical expression
                this.calculate(input);
        }
    }

    /**
     * Calculate mathematical expression
     */
    calculate(expression) {
        try {
            // Replace common mathematical functions
            let processedExpression = expression
                .replace(/\bsqrt\(/g, 'Math.sqrt(')
                .replace(/\bsin\(/g, 'Math.sin(')
                .replace(/\bcos\(/g, 'Math.cos(')
                .replace(/\btan\(/g, 'Math.tan(')
                .replace(/\blog\(/g, 'Math.log10(')
                .replace(/\bln\(/g, 'Math.log(')
                .replace(/\babs\(/g, 'Math.abs(')
                .replace(/\bfloor\(/g, 'Math.floor(')
                .replace(/\bceil\(/g, 'Math.ceil(')
                .replace(/\bround\(/g, 'Math.round(')
                .replace(/\bpi\b/g, 'Math.PI')
                .replace(/\be\b/g, 'Math.E')
                .replace(/\bpow\(/g, 'Math.pow(')
                .replace(/\^/g, '**'); // Support ^ for exponentiation

            // Basic security check - only allow safe mathematical operations
            if (!/^[0-9+\-*/.() \sMath\w]*$/.test(processedExpression)) {
                this.terminal.out('Invalid expression. Only mathematical operations are allowed.', 'error');
                return;
            }

            const result = eval(processedExpression);
            
            if (isNaN(result)) {
                this.terminal.out('Result: NaN (Not a Number)', 'error');
            } else if (!isFinite(result)) {
                this.terminal.out('Result: Infinity', 'error');
            } else {
                this.lastResult = result;
                this.terminal.out(`= ${result}`, 'success');
            }
        } catch (error) {
            this.terminal.out(`Error: ${error.message}`, 'error');
        }
    }

    /**
     * Clear calculator state
     */
    clear() {
        this.memory = 0;
        this.lastResult = 0;
        this.terminal.out('Calculator cleared', 'info');
    }

    /**
     * Show memory value
     */
    showMemory() {
        this.terminal.out(`Memory: ${this.memory}`, 'info');
    }

    /**
     * Store value in memory
     */
    storeMemory(value) {
        if (!value) {
            // Store last result if no value provided
            this.memory = this.lastResult;
            this.terminal.out(`Stored ${this.lastResult} in memory`, 'success');
        } else {
            try {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    this.terminal.out('Invalid number for memory storage', 'error');
                    return;
                }
                this.memory = numValue;
                this.terminal.out(`Stored ${numValue} in memory`, 'success');
            } catch (error) {
                this.terminal.out('Error storing in memory', 'error');
            }
        }
    }

    /**
     * Recall value from memory
     */
    recallMemory() {
        this.terminal.out(`Memory recall: ${this.memory}`, 'info');
        this.lastResult = this.memory;
    }

    /**
     * Show help for calculator app
     */
    showHelp() {
        this.terminal.out('Calculator Commands:', 'help-title');
        
        const commands = [
            ['<expression>', '', 'Calculate mathematical expression'],
            ['clear, c', '', 'Clear calculator state'],
            ['memory, mem', '', 'Show memory value'],
            ['store, ms', '[value]', 'Store value in memory (last result if no value)'],
            ['recall, mr', '', 'Recall value from memory'],
            ['help', '', 'Show this help']
        ];
        
        commands.forEach(([cmd, args, desc]) => {
            const cmdText = cmd.padEnd(15);
            const argsText = args.padEnd(8);
            this.terminal.out(`${cmdText} ${argsText} ${desc}`, 'help-cmd');
        });

        this.terminal.out('Supported Functions:', 'help-title');
        const functions = [
            'sqrt(x) - Square root',
            'sin(x), cos(x), tan(x) - Trigonometric functions',
            'log(x) - Base 10 logarithm',
            'ln(x) - Natural logarithm',
            'abs(x) - Absolute value',
            'floor(x), ceil(x), round(x) - Rounding functions',
            'pow(x,y) or x^y - Exponentiation',
            'pi, e - Mathematical constants'
        ];
        
        functions.forEach(func => {
            this.terminal.out(`  ${func}`, 'info');
        });

        this.terminal.out('Examples: 2 + 3 * 4, sqrt(16), sin(pi/2), pow(2,3)', 'info');
    }

    /**
     * Destroy the calculator application
     */
    destroy() {
        this.isInitialized = false;
        this.memory = 0;
        this.lastResult = 0;
    }
}