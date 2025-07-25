"use strict";

/**
 * AppRegistry - Manages available applications
 */
class AppRegistry {
    constructor() {
        this.apps = new Map();
    }

    /**
     * Register an application
     */
    registerApp(name, appClass, options = {}) {
        this.apps.set(name, {
            name,
            class: appClass,
            options: {
                title: name.charAt(0).toUpperCase() + name.slice(1),
                icon: '⚡',
                ...options
            }
        });
    }

    /**
     * Get registered application
     */
    getApp(name) {
        return this.apps.get(name);
    }

    /**
     * Get all registered applications
     */
    getAllApps() {
        return Array.from(this.apps.values());
    }

    /**
     * Check if app is registered
     */
    hasApp(name) {
        return this.apps.has(name);
    }

    /**
     * Unregister an application
     */
    unregisterApp(name) {
        this.apps.delete(name);
    }
}