"use strict";

/**
 * CalculatorApp - Simple calculator application
 */
class CalculatorApp {
    constructor(windowId) {
        this.windowId = windowId;
    }

    async init() {
        const window = document.getElementById(this.windowId);
        const content = window.querySelector('.window-content');
        
        content.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #e2e8f0;">
                <h3>Calculator</h3>
                <p>Calculator app coming soon...</p>
            </div>
        `;
    }

    destroy() {
        // Cleanup if needed
    }
}