"use strict";

/**
 * HotkeyManager - Manages keyboard shortcuts for the desktop
 */
class HotkeyManager {
    constructor(desktopManager) {
        this.desktopManager = desktopManager;
        this.hotkeys = new Map();
        this.isEnabled = true;
        this.setupEventListeners();
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isEnabled) return;
            this.handleKeyDown(e);
        });
    }

    /**
     * Handle keydown events
     */
    handleKeyDown(event) {
        const key = this.getKeyString(event);
        const handler = this.hotkeys.get(key);
        
        if (handler) {
            event.preventDefault();
            event.stopPropagation();
            handler();
        }
    }

    /**
     * Get key string from event
     */
    getKeyString(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        if (event.metaKey) parts.push('meta');
        
        const key = event.key.toLowerCase();
        if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
            parts.push(key);
        }
        
        return parts.join('+');
    }

    /**
     * Register a hotkey
     */
    registerHotkey(keyString, handler) {
        this.hotkeys.set(keyString.toLowerCase(), handler);
    }

    /**
     * Unregister a hotkey
     */
    unregisterHotkey(keyString) {
        this.hotkeys.delete(keyString.toLowerCase());
    }

    /**
     * Enable hotkey handling
     */
    enable() {
        this.isEnabled = true;
    }

    /**
     * Disable hotkey handling
     */
    disable() {
        this.isEnabled = false;
    }

    /**
     * Get all registered hotkeys
     */
    getAllHotkeys() {
        return Array.from(this.hotkeys.keys());
    }

    /**
     * Clear all hotkeys
     */
    clearAll() {
        this.hotkeys.clear();
    }

    /**
     * Destroy the hotkey manager
     */
    destroy() {
        this.clearAll();
        this.isEnabled = false;
    }
}