"use strict";

/**
 * Desktop Application - Main entry point for the desktop interface
 */
class DesktopApp {
    constructor() {
        this.desktopManager = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the desktop application
     */
    async init() {
        try {
            // Initialize desktop manager
            this.desktopManager = new DesktopManager();
            await this.desktopManager.init();

            // Setup taskbar
            this.setupTaskbar();

            // Setup clock
            this.setupClock();

            // Create initial terminal window
            await this.createInitialWindow();

            this.isInitialized = true;
            console.log('Desktop application initialized successfully');

        } catch (error) {
            console.error('Failed to initialize desktop application:', error);
        }
    }

    /**
     * Setup taskbar functionality
     */
    setupTaskbar() {
        const launcherButtons = document.querySelectorAll('.launcher-btn');
        
        launcherButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const appName = btn.dataset.app;
                this.launchApp(appName);
            });
        });
    }

    /**
     * Setup system clock
     */
    setupClock() {
        const clockElement = document.getElementById('clock');
        if (!clockElement) return;

        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const dateStr = now.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });

            const timeEl = clockElement.querySelector('.time');
            const dateEl = clockElement.querySelector('.date');
            
            if (timeEl) timeEl.textContent = timeStr;
            if (dateEl) dateEl.textContent = dateStr;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    /**
     * Launch an application
     */
    async launchApp(appName) {
        if (!this.desktopManager) return;

        try {
            let windowOptions = { title: appName };
            
            switch (appName) {
                case 'terminal':
                    windowOptions = { title: 'Terminal', width: 800, height: 600 };
                    break;
                case 'calculator':
                    windowOptions = { title: 'Calculator', width: 400, height: 500 };
                    break;
                case 'help':
                    windowOptions = { title: 'Help', width: 600, height: 400 };
                    break;
            }

            const window = await this.desktopManager.createNewWindow(windowOptions);
            
            if (window && appName !== 'terminal') {
                // For non-terminal apps, create the appropriate app instance
                let app;
                switch (appName) {
                    case 'calculator':
                        app = new CalculatorApp(window.id);
                        break;
                    case 'help':
                        app = new HelpApp(window.id);
                        break;
                }
                
                if (app) {
                    await app.init();
                    window.app = app;
                }
            }

        } catch (error) {
            console.error(`Failed to launch ${appName}:`, error);
        }
    }

    /**
     * Create initial terminal window
     */
    async createInitialWindow() {
        await this.launchApp('terminal');
    }
}

// Initialize desktop application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new DesktopApp();
    app.init();
});