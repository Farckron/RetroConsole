"use strict";

/**
 * DesktopManager - Main coordinator for the desktop interface
 * Manages the overall desktop environment and coordinates all components
 */
class DesktopManager {
    constructor() {
        this.windowManager = null;
        this.animationEngine = null;
        this.hotkeyManager = null;
        this.appRegistry = null;
        this.isInitialized = false;
        this.elements = {};
    }

    /**
     * Initialize the desktop environment
     */
    async init() {
        try {
            this.cacheElements();
            this.setupBackground();
            await this.initializeComponents();
            this.setupHotkeys();
            this.isInitialized = true;
            console.log('DesktopManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize DesktopManager:', error);
            throw error;
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            body: document.body,
            desktop: document.getElementById('desktop') || this.createDesktopElement()
        };
    }

    /**
     * Create the main desktop element if it doesn't exist
     */
    createDesktopElement() {
        const desktop = document.createElement('div');
        desktop.id = 'desktop';
        desktop.className = 'desktop-container';
        document.body.appendChild(desktop);
        return desktop;
    }

    /**
     * Setup the desktop background styling
     */
    setupBackground() {
        // Apply Arch Linux styling to body
        document.body.classList.add('arch-desktop');
        
        // Remove any existing terminal if present (for migration)
        const existingTerminal = document.querySelector('.terminal');
        if (existingTerminal && existingTerminal.parentNode !== this.elements.desktop) {
            existingTerminal.style.display = 'none';
        }
    }

    /**
     * Initialize all desktop components
     */
    async initializeComponents() {
        // Initialize AnimationEngine first (needed by WindowManager)
        this.animationEngine = new AnimationEngine();
        
        // Initialize WindowManager with AnimationEngine
        this.windowManager = new WindowManager(this.animationEngine);
        
        // Initialize AppRegistry
        this.appRegistry = new AppRegistry();
        this.registerDefaultApps();
        
        // Initialize HotkeyManager
        this.hotkeyManager = new HotkeyManager(this);
    }

    /**
     * Register default applications
     */
    registerDefaultApps() {
        // Register the existing apps (terminal, calc, help)
        this.appRegistry.registerApp('terminal', TerminalInstance, {
            title: 'Terminal',
            icon: '⚡'
        });
        this.appRegistry.registerApp('calculator', CalculatorApp, {
            title: 'Calculator',
            icon: '🔢'
        });
        this.appRegistry.registerApp('help', HelpApp, {
            title: 'Help',
            icon: '❓'
        });
    }

    /**
     * Setup default hotkeys
     */
    setupHotkeys() {
        // Ctrl+Alt+T - Open new terminal window
        this.hotkeyManager.registerHotkey('ctrl+alt+t', () => {
            this.createNewWindow();
        });

        // Alt+F4 - Close active window
        this.hotkeyManager.registerHotkey('alt+f4', () => {
            const activeWindow = this.windowManager.getActiveWindow();
            if (activeWindow) {
                this.windowManager.closeWindow(activeWindow.id);
            }
        });
    }

    /**
     * Create a new terminal window
     */
    async createNewWindow(options = {}) {
        if (!this.isInitialized) {
            console.warn('DesktopManager not initialized');
            return null;
        }

        try {
            const windowOptions = {
                width: 800,
                height: 600,
                title: 'Terminal',
                ...options
            };

            const window = await this.windowManager.createWindow(windowOptions);
            
            if (window) {
                // Create terminal instance for this window
                const terminal = new TerminalInstance(window.id, this.appRegistry);
                await terminal.init();
                
                // Associate terminal with window
                window.terminal = terminal;
                
                console.log(`Created new window: ${window.id}`);
                return window;
            }
        } catch (error) {
            console.error('Failed to create new window:', error);
            return null;
        }
    }

    /**
     * Get the window manager
     */
    getWindowManager() {
        return this.windowManager;
    }

    /**
     * Get the animation engine
     */
    getAnimationEngine() {
        return this.animationEngine;
    }

    /**
     * Get the hotkey manager
     */
    getHotkeyManager() {
        return this.hotkeyManager;
    }

    /**
     * Get the app registry
     */
    getAppRegistry() {
        return this.appRegistry;
    }

    /**
     * Shutdown the desktop environment
     */
    shutdown() {
        try {
            if (this.hotkeyManager) {
                this.hotkeyManager.destroy();
            }
            
            if (this.windowManager) {
                this.windowManager.closeAllWindows();
            }
            
            this.isInitialized = false;
            console.log('DesktopManager shutdown complete');
        } catch (error) {
            console.error('Error during shutdown:', error);
        }
    }
}