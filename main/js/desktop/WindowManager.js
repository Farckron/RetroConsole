"use strict";

/**
 * WindowManager - Manages desktop windows
 * Handles window creation, destruction, positioning, and z-index management
 */
class WindowManager {
    constructor(animationEngine) {
        this.animationEngine = animationEngine;
        this.windows = new Map(); // Map<string, WindowModel>
        this.activeWindowId = null;
        this.nextWindowId = 1;
        this.windowContainer = null;
        this.maxZIndex = 10;
        this.init();
    }

    /**
     * Initialize window manager
     */
    init() {
        this.windowContainer = document.getElementById('window-container');
        if (!this.windowContainer) {
            console.error('Window container not found');
        }
    }

    /**
     * Create a new window
     * @param {Object} options - Window configuration options
     * @returns {WindowModel} The created window model
     */
    async createWindow(options = {}) {
        const windowId = `window-${this.nextWindowId++}`;
        
        const defaultOptions = {
            title: 'Terminal',
            width: 600,
            height: 400,
            resizable: true,
            minimizable: true,
            maximizable: true,
            closable: true
        };

        const windowOptions = { ...defaultOptions, ...options };
        
        // Calculate position for new window
        const position = this.calculateNewWindowPosition();
        
        // Create window model
        const windowModel = new WindowModel(
            windowId,
            position.x,
            position.y,
            windowOptions.width,
            windowOptions.height
        );
        
        // Set window options
        windowModel.setOptions(windowOptions);
        
        // Create DOM element
        const windowElement = this.createWindowElement(windowModel);
        windowModel.element = windowElement;
        
        // Add to windows collection
        this.windows.set(windowId, windowModel);
        this.windowContainer.appendChild(windowElement);
        
        // Setup event listeners
        this.setupWindowEvents(windowModel);
        
        // Set as active window and bring to front
        this.focusWindow(windowId);
        
        // Animate window opening
        if (this.animationEngine) {
            this.animationEngine.animateWindowOpen(windowElement);
        }

        return windowModel;
    }

    /**
     * Create window DOM element
     * @param {WindowModel} windowModel - The window model to create element for
     * @returns {HTMLElement} The created window element
     */
    createWindowElement(windowModel) {
        const windowEl = document.createElement('div');
        windowEl.id = windowModel.id;
        windowEl.className = 'desktop-window';
        windowEl.style.left = `${windowModel.x}px`;
        windowEl.style.top = `${windowModel.y}px`;
        windowEl.style.width = `${windowModel.width}px`;
        windowEl.style.height = `${windowModel.height}px`;
        windowEl.style.zIndex = windowModel.zIndex;

        windowEl.innerHTML = `
            <div class="window-header">
                <div class="window-title">${windowModel.title}</div>
                <div class="window-controls">
                    ${windowModel.minimizable ? '<button class="window-control-btn minimize" title="Minimize"></button>' : ''}
                    ${windowModel.maximizable ? '<button class="window-control-btn maximize" title="Maximize"></button>' : ''}
                    ${windowModel.closable ? '<button class="window-control-btn close" title="Close"></button>' : ''}
                </div>
            </div>
            <div class="window-content"></div>
        `;

        return windowEl;
    }

    /**
     * Calculate position for new window (cascade positioning)
     * @returns {Object} Position object with x and y coordinates
     */
    calculateNewWindowPosition() {
        const offset = this.windows.size * 30;
        const maxOffset = 200;
        
        return {
            x: 100 + (offset % maxOffset),
            y: 100 + (offset % maxOffset)
        };
    }

    /**
     * Setup window event listeners
     * @param {WindowModel} windowModel - The window model to setup events for
     */
    setupWindowEvents(windowModel) {
        const header = windowModel.element.querySelector('.window-header');
        const controls = windowModel.element.querySelectorAll('.window-control-btn');

        // Window dragging
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('window-control-btn')) return;
            
            isDragging = true;
            this.focusWindow(windowModel.id);
            
            const rect = windowModel.element.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', handleDragEnd);
        });

        const handleDrag = (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;
            
            // Update window model position
            windowModel.setPosition(x, y);
        };

        const handleDragEnd = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
        };

        // Window controls
        controls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (btn.classList.contains('close')) {
                    this.closeWindow(windowModel.id);
                } else if (btn.classList.contains('minimize')) {
                    this.minimizeWindow(windowModel.id);
                } else if (btn.classList.contains('maximize')) {
                    this.toggleMaximizeWindow(windowModel.id);
                }
            });
        });

        // Focus window on click
        windowModel.element.addEventListener('mousedown', () => {
            this.focusWindow(windowModel.id);
        });
    }

    /**
     * Close a window
     * @param {string} windowId - ID of the window to close
     */
    closeWindow(windowId) {
        const windowModel = this.windows.get(windowId);
        if (!windowModel) return;

        // Animate window closing
        if (this.animationEngine) {
            this.animationEngine.animateWindowClose(windowModel.element, () => {
                this.destroyWindow(windowId);
            });
        } else {
            this.destroyWindow(windowId);
        }
    }

    /**
     * Destroy window and remove from DOM and memory
     * @param {string} windowId - ID of the window to destroy
     */
    destroyWindow(windowId) {
        const windowModel = this.windows.get(windowId);
        if (!windowModel) return;

        // Clean up terminal instance
        windowModel.detachTerminal();

        // Remove from DOM
        windowModel.element.remove();
        
        // Remove from windows collection
        this.windows.delete(windowId);

        // Set new active window if this was active
        if (this.activeWindowId === windowId) {
            const remainingWindows = Array.from(this.windows.keys());
            this.activeWindowId = remainingWindows.length > 0 ? remainingWindows[remainingWindows.length - 1] : null;
            
            if (this.activeWindowId) {
                this.focusWindow(this.activeWindowId);
            }
        }
    }

    /**
     * Minimize a window
     * @param {string} windowId - ID of the window to minimize
     */
    minimizeWindow(windowId) {
        const windowModel = this.windows.get(windowId);
        if (!windowModel) return;

        // Animate window minimize
        if (this.animationEngine) {
            this.animationEngine.animateWindowMinimize(windowModel.element, () => {
                windowModel.minimize();
                
                // Set new active window
                const visibleWindows = Array.from(this.windows.values()).filter(w => w.isVisible());
                if (visibleWindows.length > 0) {
                    this.focusWindow(visibleWindows[visibleWindows.length - 1].id);
                } else {
                    this.activeWindowId = null;
                }
            });
        } else {
            windowModel.minimize();
            
            // Set new active window
            const visibleWindows = Array.from(this.windows.values()).filter(w => w.isVisible());
            if (visibleWindows.length > 0) {
                this.focusWindow(visibleWindows[visibleWindows.length - 1].id);
            } else {
                this.activeWindowId = null;
            }
        }
    }

    /**
     * Restore a minimized window
     * @param {string} windowId - ID of the window to restore
     */
    restoreWindow(windowId) {
        const windowModel = this.windows.get(windowId);
        if (!windowModel) return;

        // Animate window restore
        if (this.animationEngine) {
            this.animationEngine.animateWindowRestore(windowModel.element).then(() => {
                windowModel.restore();
                this.focusWindow(windowId);
            });
        } else {
            windowModel.restore();
            this.focusWindow(windowId);
        }
    }

    /**
     * Toggle maximize state of a window
     * @param {string} windowId - ID of the window to toggle maximize
     */
    toggleMaximizeWindow(windowId) {
        const windowModel = this.windows.get(windowId);
        if (!windowModel) return;

        windowModel.toggleMaximize();
    }

    /**
     * Focus a window (set as active and bring to front)
     * @param {string} windowId - ID of the window to focus
     */
    focusWindow(windowId) {
        const previousActiveWindow = this.getActiveWindow();
        
        // Remove active state from all windows and animate blur
        this.windows.forEach(windowModel => {
            if (windowModel.isActive && windowModel.id !== windowId) {
                windowModel.setActive(false);
                // Animate window blur effect
                if (this.animationEngine) {
                    this.animationEngine.animateWindowBlur(windowModel.element);
                }
            }
        });

        // Set new active window
        const windowModel = this.windows.get(windowId);
        if (windowModel) {
            windowModel.setActive(true);
            this.activeWindowId = windowId;
            
            // Bring to front (z-index management)
            this.maxZIndex++;
            windowModel.setZIndex(this.maxZIndex);

            // Animate window focus effect
            if (this.animationEngine) {
                this.animationEngine.animateWindowFocus(windowModel.element);
            }

            // Focus terminal if it exists
            windowModel.focusTerminal();
        }
    }

    /**
     * Move a window to a new position
     * @param {string} windowId - ID of the window to move
     * @param {number} x - New x coordinate
     * @param {number} y - New y coordinate
     */
    moveWindow(windowId, x, y) {
        const windowModel = this.windows.get(windowId);
        if (windowModel) {
            windowModel.setPosition(x, y);
        }
    }

    /**
     * Get active window
     */
    getActiveWindow() {
        return this.windows.get(this.activeWindowId);
    }

    /**
     * Get all windows
     */
    getAllWindows() {
        return Array.from(this.windows.values());
    }

    /**
     * Close all windows
     */
    closeAllWindows() {
        const windowIds = Array.from(this.windows.keys());
        windowIds.forEach(id => this.closeWindow(id));
    }
}