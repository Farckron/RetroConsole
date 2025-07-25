"use strict";

/**
 * HelpApp - Simple help application
 */
class HelpApp {
    constructor(windowId) {
        this.windowId = windowId;
        this.isInitialized = false;
    }

    /**
     * Initialize the help application
     */
    async init() {
        try {
            this.createHelpContent();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize HelpApp:', error);
            throw error;
        }
    }

    /**
     * Create help content
     */
    createHelpContent() {
        const window = document.getElementById(this.windowId);
        if (!window) {
            throw new Error(`Window ${this.windowId} not found`);
        }

        const content = window.querySelector('.window-content');
        if (!content) {
            throw new Error(`Window content area not found for ${this.windowId}`);
        }

        content.innerHTML = `
            <div style="padding: 20px; color: #ffffff; font-family: monospace;">
                <h2 style="color: #1793d1; margin-bottom: 20px;">Arch Desktop Interface - Help</h2>
                
                <h3 style="color: #10b981; margin: 15px 0 10px 0;">Keyboard Shortcuts:</h3>
                <ul style="margin-left: 20px; line-height: 1.6;">
                    <li><strong>Ctrl+Alt+T</strong> - Open new terminal window</li>
                    <li><strong>Alt+F4</strong> - Close active window</li>
                </ul>

                <h3 style="color: #10b981; margin: 15px 0 10px 0;">Terminal Commands:</h3>
                <ul style="margin-left: 20px; line-height: 1.6;">
                    <li><strong>add &lt;text&gt;</strong> - Add a new task</li>
                    <li><strong>list</strong> - Show all tasks</li>
                    <li><strong>list done</strong> - Show completed tasks</li>
                    <li><strong>list todo</strong> - Show pending tasks</li>
                    <li><strong>done &lt;id&gt;</strong> - Mark task as completed</li>
                    <li><strong>del &lt;id&gt;</strong> - Delete task</li>
                    <li><strong>clear</strong> - Delete all tasks</li>
                    <li><strong>stats</strong> - Show statistics</li>
                    <li><strong>export</strong> - Export tasks to file</li>
                    <li><strong>import</strong> - Import tasks from file</li>
                    <li><strong>help</strong> - Show help</li>
                </ul>

                <h3 style="color: #10b981; margin: 15px 0 10px 0;">Applications:</h3>
                <ul style="margin-left: 20px; line-height: 1.6;">
                    <li><strong>Terminal</strong> - Task management terminal</li>
                    <li><strong>Calculator</strong> - Simple calculator</li>
                    <li><strong>Help</strong> - This help window</li>
                </ul>

                <p style="margin-top: 20px; color: #94a3b8; font-style: italic;">
                    Click the icons in the taskbar to launch applications.
                </p>
            </div>
        `;
    }

    /**
     * Destroy the help application
     */
    destroy() {
        this.isInitialized = false;
    }
}