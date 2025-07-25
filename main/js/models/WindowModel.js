"use strict";

/**
 * WindowModel - Data structure for desktop windows
 * Represents a single window with all its properties and state
 */
class WindowModel {
    constructor(id, x, y, width, height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.zIndex = 10;
        this.isActive = false;
        this.isMinimized = false;
        this.isMaximized = false;
        this.terminal = null;
        this.element = null;
        this.createdAt = new Date();
        
        // Store original bounds for maximize/restore functionality
        this.originalBounds = null;
        
        // Window options
        this.title = 'Window';
        this.resizable = true;
        this.minimizable = true;
        this.maximizable = true;
        this.closable = true;
    }

    /**
     * Set window position
     */
    setPosition(x, y) {
        this.x = Math.max(0, x);
        this.y = Math.max(0, y);
        if (this.element) {
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        }
        return this;
    }

    /**
     * Set window size
     */
    setSize(width, height) {
        this.width = Math.max(300, width);
        this.height = Math.max(200, height);
        if (this.element) {
            this.element.style.width = `${this.width}px`;
            this.element.style.height = `${this.height}px`;
        }
        return this;
    }

    /**
     * Set window z-index
     */
    setZIndex(zIndex) {
        this.zIndex = zIndex;
        if (this.element) {
            this.element.style.zIndex = zIndex;
        }
        return this;
    }

    /**
     * Set active state
     */
    setActive(active) {
        this.isActive = active;
        if (this.element) {
            if (active) {
                this.element.classList.add('active');
            } else {
                this.element.classList.remove('active');
            }
        }
        return this;
    }

    /**
     * Minimize window
     */
    minimize() {
        this.isMinimized = true;
        if (this.element) {
            this.element.style.display = 'none';
        }
        return this;
    }

    /**
     * Restore window from minimized state
     */
    restore() {
        this.isMinimized = false;
        if (this.element) {
            this.element.style.display = 'flex';
        }
        return this;
    }

    /**
     * Maximize window
     */
    maximize() {
        if (!this.isMaximized) {
            // Save original bounds
            this.originalBounds = {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };
            
            // Set maximized state
            this.isMaximized = true;
            this.setPosition(0, 0);
            
            if (this.element) {
                this.element.style.width = '100%';
                this.element.style.height = 'calc(100% - 48px)'; // Account for taskbar
            }
        }
        return this;
    }

    /**
     * Restore window from maximized state
     */
    unmaximize() {
        if (this.isMaximized && this.originalBounds) {
            this.isMaximized = false;
            this.setPosition(this.originalBounds.x, this.originalBounds.y);
            this.setSize(this.originalBounds.width, this.originalBounds.height);
            this.originalBounds = null;
        }
        return this;
    }

    /**
     * Toggle maximize state
     */
    toggleMaximize() {
        if (this.isMaximized) {
            this.unmaximize();
        } else {
            this.maximize();
        }
        return this;
    }

    /**
     * Check if window is visible (not minimized)
     */
    isVisible() {
        return !this.isMinimized;
    }

    /**
     * Get window bounds
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Set window options
     */
    setOptions(options) {
        if (options.title !== undefined) this.title = options.title;
        if (options.resizable !== undefined) this.resizable = options.resizable;
        if (options.minimizable !== undefined) this.minimizable = options.minimizable;
        if (options.maximizable !== undefined) this.maximizable = options.maximizable;
        if (options.closable !== undefined) this.closable = options.closable;
        return this;
    }

    /**
     * Attach terminal instance to window
     */
    attachTerminal(terminal) {
        this.terminal = terminal;
        return this;
    }

    /**
     * Detach terminal instance from window
     */
    detachTerminal() {
        if (this.terminal && this.terminal.destroy) {
            this.terminal.destroy();
        }
        this.terminal = null;
        return this;
    }

    /**
     * Focus the window's terminal
     */
    focusTerminal() {
        if (this.terminal && this.terminal.focus) {
            this.terminal.focus();
        }
        return this;
    }

    /**
     * Convert window to JSON for serialization
     */
    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            zIndex: this.zIndex,
            isActive: this.isActive,
            isMinimized: this.isMinimized,
            isMaximized: this.isMaximized,
            title: this.title,
            resizable: this.resizable,
            minimizable: this.minimizable,
            maximizable: this.maximizable,
            closable: this.closable,
            createdAt: this.createdAt.toISOString(),
            originalBounds: this.originalBounds
        };
    }

    /**
     * Create WindowModel from JSON data
     */
    static fromJSON(data) {
        const window = new WindowModel(data.id, data.x, data.y, data.width, data.height);
        window.zIndex = data.zIndex || 10;
        window.isActive = data.isActive || false;
        window.isMinimized = data.isMinimized || false;
        window.isMaximized = data.isMaximized || false;
        window.title = data.title || 'Window';
        window.resizable = data.resizable !== undefined ? data.resizable : true;
        window.minimizable = data.minimizable !== undefined ? data.minimizable : true;
        window.maximizable = data.maximizable !== undefined ? data.maximizable : true;
        window.closable = data.closable !== undefined ? data.closable : true;
        window.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        window.originalBounds = data.originalBounds || null;
        return window;
    }

    /**
     * Validate window data
     */
    static isValidWindowData(data) {
        return data &&
            typeof data.id === 'string' &&
            typeof data.x === 'number' &&
            typeof data.y === 'number' &&
            typeof data.width === 'number' &&
            typeof data.height === 'number' &&
            data.width > 0 &&
            data.height > 0;
    }
}