"use strict";

/**
 * Task Storage System
 * Handles saving and loading tasks from server API with localStorage fallback
 */
class TaskStorage {
    constructor() {
        this.apiBaseUrl = '/api/tasks';
        this.historyKey = 'terminal-history';
        this.isStorageAvailable = this.checkStorageAvailability();
        this.useServerStorage = true;
    }

    /**
     * Check localStorage availability
     */
    checkStorageAvailability() {
        try {
            if (typeof localStorage === 'undefined') {
                console.warn('LocalStorage not supported');
                return false;
            }

            const testKey = '__storage_test__';
            const testValue = 'test_value_' + Date.now();

            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);

            return retrieved === testValue;
        } catch (error) {
            console.warn('LocalStorage check failed:', error.message);
            return false;
        }
    }

    /**
     * Make API request
     */
    async apiRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * Load tasks from server
     */
    async loadTasks() {
        try {
            const response = await this.apiRequest(this.apiBaseUrl);
            
            if (response.success && response.data && response.data.tasks) {
                const tasks = response.data.tasks.map(taskData => Task.fromJSON(taskData));
                return {
                    success: true,
                    tasks: tasks,
                    source: 'server'
                };
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Failed to load tasks from server:', error);
            return {
                success: false,
                error: error.message,
                tasks: []
            };
        }
    }

    /**
     * Create task on server
     */
    async createTask(description) {
        try {
            const response = await this.apiRequest(this.apiBaseUrl, {
                method: 'POST',
                body: JSON.stringify({ description })
            });

            if (response.success) {
                return {
                    success: true,
                    task: Task.fromJSON(response.data),
                    message: response.message
                };
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Complete task on server
     */
    async completeTask(taskId) {
        try {
            const response = await this.apiRequest(`${this.apiBaseUrl}/${taskId}/complete`, {
                method: 'PUT'
            });

            if (response.success) {
                return {
                    success: true,
                    task: Task.fromJSON(response.data),
                    message: response.message
                };
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete task on server
     */
    async deleteTask(taskId) {
        try {
            const response = await this.apiRequest(`${this.apiBaseUrl}/${taskId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                return {
                    success: true,
                    task: Task.fromJSON(response.data),
                    message: response.message
                };
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Clear all tasks on server
     */
    async clearAllTasks() {
        try {
            const response = await this.apiRequest(this.apiBaseUrl, {
                method: 'DELETE'
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message
                };
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get task statistics from server
     */
    async getTaskStats() {
        try {
            const response = await this.apiRequest(`${this.apiBaseUrl}/stats`);

            if (response.success) {
                return {
                    success: true,
                    stats: response.data
                };
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Export tasks from server
     */
    async exportTasks() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/export`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                data: JSON.stringify(data, null, 2)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Import tasks to server
     */
    async importTasks(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            const tasks = data.tasks || data; // Support both formats

            const response = await this.apiRequest(`${this.apiBaseUrl}/import`, {
                method: 'POST',
                body: JSON.stringify({ tasks, replaceExisting: false })
            });

            if (response.success) {
                return {
                    success: true,
                    message: response.message
                };
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Save command history (localStorage only)
     */
    saveHistory(history) {
        try {
            if (!this.isStorageAvailable) {
                return { success: false, error: 'LocalStorage unavailable' };
            }

            if (!Array.isArray(history)) {
                throw new Error('History must be an array');
            }

            const dataToStore = JSON.stringify({
                history: history,
                timestamp: new Date().toISOString()
            });

            localStorage.setItem(this.historyKey, dataToStore);
            return { success: true, count: history.length };

        } catch (error) {
            console.error('Error saving history:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Load command history (localStorage only)
     */
    loadHistory() {
        try {
            if (!this.isStorageAvailable) {
                return { success: true, history: [], source: 'fallback' };
            }

            const storedData = localStorage.getItem(this.historyKey);

            if (!storedData) {
                return { success: true, history: [], source: 'empty' };
            }

            const parsedData = JSON.parse(storedData);

            if (!parsedData.history || !Array.isArray(parsedData.history)) {
                throw new Error('Invalid history data structure');
            }

            return {
                success: true,
                history: parsedData.history,
                source: 'localStorage',
                timestamp: parsedData.timestamp
            };

        } catch (error) {
            console.error('Error loading history:', error);
            return {
                success: false,
                error: error.message,
                history: []
            };
        }
    }

    /**
     * Clear command history (localStorage only)
     */
    clearHistory() {
        try {
            if (this.isStorageAvailable) {
                localStorage.removeItem(this.historyKey);
            }
            return { success: true };
        } catch (error) {
            console.error('Error clearing history:', error);
            return { success: false, error: error.message };
        }
    }
}