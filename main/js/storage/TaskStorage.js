"use strict";

/**
 * Task Storage System
 * Handles saving and loading tasks from server API with localStorage fallback
 */
class TaskStorage {
    constructor() {
        this.apiBaseUrl = '/api/tasks';
        this.historyKey = 'terminal-history';
        this.tasksKey = 'terminal-tasks';
        this.isStorageAvailable = this.checkStorageAvailability();
        this.useServerStorage = false; // Use localStorage instead of server
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
     * Load tasks from localStorage or server
     */
    async loadTasks() {
        if (!this.useServerStorage) {
            return this.loadTasksFromLocalStorage();
        }
        
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
            console.error('Failed to load tasks from server, falling back to localStorage:', error);
            return this.loadTasksFromLocalStorage();
        }
    }

    /**
     * Load tasks from localStorage
     */
    loadTasksFromLocalStorage() {
        try {
            if (!this.isStorageAvailable) {
                return { success: true, tasks: [], source: 'fallback' };
            }

            const storedData = localStorage.getItem(this.tasksKey);

            if (!storedData) {
                return { success: true, tasks: [], source: 'empty' };
            }

            const parsedData = JSON.parse(storedData);
            const tasks = parsedData.tasks.map(taskData => Task.fromJSON(taskData));

            return {
                success: true,
                tasks: tasks,
                source: 'localStorage',
                timestamp: parsedData.timestamp
            };

        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            return {
                success: false,
                error: error.message,
                tasks: []
            };
        }
    }

    /**
     * Save tasks to localStorage
     */
    saveTasksToLocalStorage(tasks) {
        try {
            if (!this.isStorageAvailable) {
                return { success: false, error: 'LocalStorage unavailable' };
            }

            const dataToStore = JSON.stringify({
                tasks: tasks.map(task => task.toJSON()),
                timestamp: new Date().toISOString()
            });

            localStorage.setItem(this.tasksKey, dataToStore);
            return { success: true, count: tasks.length };

        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create task on server or localStorage
     */
    async createTask(description) {
        if (!this.useServerStorage) {
            return this.createTaskInLocalStorage(description);
        }
        
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
            console.error('Failed to create task on server, falling back to localStorage:', error);
            return this.createTaskInLocalStorage(description);
        }
    }

    /**
     * Create task in localStorage
     */
    createTaskInLocalStorage(description) {
        try {
            // Load existing tasks
            const loadResult = this.loadTasksFromLocalStorage();
            const tasks = loadResult.tasks || [];

            // Generate simple numeric ID
            const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => parseInt(t.id) || 0)) + 1 : 1;

            // Create new task with numeric ID
            const newTask = new Task(description, nextId);
            tasks.push(newTask);

            // Save updated tasks
            const saveResult = this.saveTasksToLocalStorage(tasks);
            
            if (saveResult.success) {
                return {
                    success: true,
                    task: newTask,
                    message: 'Task created successfully'
                };
            } else {
                throw new Error(saveResult.error);
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Complete task on server or localStorage
     */
    async completeTask(taskId) {
        if (!this.useServerStorage) {
            return this.completeTaskInLocalStorage(taskId);
        }
        
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
            console.error('Failed to complete task on server, falling back to localStorage:', error);
            return this.completeTaskInLocalStorage(taskId);
        }
    }

    /**
     * Complete task in localStorage
     */
    completeTaskInLocalStorage(taskId) {
        try {
            // Load existing tasks
            const loadResult = this.loadTasksFromLocalStorage();
            const tasks = loadResult.tasks || [];

            // Find and complete task
            const task = tasks.find(t => String(t.id) === String(taskId));
            if (!task) {
                throw new Error(`Task #${taskId} not found`);
            }

            task.complete();

            // Save updated tasks
            const saveResult = this.saveTasksToLocalStorage(tasks);
            
            if (saveResult.success) {
                return {
                    success: true,
                    task: task,
                    message: 'Task completed successfully'
                };
            } else {
                throw new Error(saveResult.error);
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete task on server or localStorage
     */
    async deleteTask(taskId) {
        if (!this.useServerStorage) {
            return this.deleteTaskInLocalStorage(taskId);
        }
        
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
            console.error('Failed to delete task on server, falling back to localStorage:', error);
            return this.deleteTaskInLocalStorage(taskId);
        }
    }

    /**
     * Delete task in localStorage
     */
    deleteTaskInLocalStorage(taskId) {
        try {
            // Load existing tasks
            const loadResult = this.loadTasksFromLocalStorage();
            const tasks = loadResult.tasks || [];

            // Find task to delete
            const taskIndex = tasks.findIndex(t => String(t.id) === String(taskId));
            if (taskIndex === -1) {
                throw new Error(`Task #${taskId} not found`);
            }

            const deletedTask = tasks[taskIndex];
            tasks.splice(taskIndex, 1);

            // Save updated tasks
            const saveResult = this.saveTasksToLocalStorage(tasks);
            
            if (saveResult.success) {
                return {
                    success: true,
                    task: deletedTask,
                    message: 'Task deleted successfully'
                };
            } else {
                throw new Error(saveResult.error);
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Clear all tasks on server or localStorage
     */
    async clearAllTasks() {
        if (!this.useServerStorage) {
            return this.clearAllTasksInLocalStorage();
        }
        
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
            console.error('Failed to clear tasks on server, falling back to localStorage:', error);
            return this.clearAllTasksInLocalStorage();
        }
    }

    /**
     * Clear all tasks in localStorage
     */
    clearAllTasksInLocalStorage() {
        try {
            if (this.isStorageAvailable) {
                localStorage.removeItem(this.tasksKey);
            }
            return { 
                success: true, 
                message: 'All tasks cleared successfully' 
            };
        } catch (error) {
            console.error('Error clearing tasks:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    /**
     * Get task statistics from server or localStorage
     */
    async getTaskStats() {
        if (!this.useServerStorage) {
            return this.getTaskStatsFromLocalStorage();
        }
        
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
            console.error('Failed to get stats from server, falling back to localStorage:', error);
            return this.getTaskStatsFromLocalStorage();
        }
    }

    /**
     * Get task statistics from localStorage
     */
    getTaskStatsFromLocalStorage() {
        try {
            const loadResult = this.loadTasksFromLocalStorage();
            const tasks = loadResult.tasks || [];

            const stats = {
                total: tasks.length,
                completed: tasks.filter(t => t.isCompleted).length,
                pending: tasks.filter(t => !t.isCompleted).length,
                createdToday: tasks.filter(t => {
                    const today = new Date().toDateString();
                    return new Date(t.createdAt).toDateString() === today;
                }).length
            };

            return {
                success: true,
                stats: stats
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Export tasks from localStorage or server
     */
    async exportTasks() {
        if (!this.useServerStorage) {
            return this.exportTasksFromLocalStorage();
        }
        
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
            console.error('Failed to export from server, falling back to localStorage:', error);
            return this.exportTasksFromLocalStorage();
        }
    }

    /**
     * Export tasks from localStorage
     */
    exportTasksFromLocalStorage() {
        try {
            const loadResult = this.loadTasksFromLocalStorage();
            const tasks = loadResult.tasks || [];

            const exportData = {
                tasks: tasks.map(task => task.toJSON()),
                exportedAt: new Date().toISOString(),
                source: 'localStorage'
            };

            return {
                success: true,
                data: JSON.stringify(exportData, null, 2)
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Import tasks to localStorage or server
     */
    async importTasks(jsonData) {
        if (!this.useServerStorage) {
            return this.importTasksToLocalStorage(jsonData);
        }
        
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
            console.error('Failed to import to server, falling back to localStorage:', error);
            return this.importTasksToLocalStorage(jsonData);
        }
    }

    /**
     * Import tasks to localStorage
     */
    importTasksToLocalStorage(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            const importTasks = data.tasks || data; // Support both formats

            // Load existing tasks
            const loadResult = this.loadTasksFromLocalStorage();
            const existingTasks = loadResult.tasks || [];

            // Convert imported data to Task objects
            const newTasks = importTasks.map(taskData => Task.fromJSON(taskData));

            // Merge with existing tasks (avoid duplicates by ID)
            const existingIds = new Set(existingTasks.map(t => t.id));
            const tasksToAdd = newTasks.filter(task => !existingIds.has(task.id));

            const allTasks = [...existingTasks, ...tasksToAdd];

            // Save merged tasks
            const saveResult = this.saveTasksToLocalStorage(allTasks);
            
            if (saveResult.success) {
                return {
                    success: true,
                    message: `Imported ${tasksToAdd.length} new tasks (${newTasks.length - tasksToAdd.length} duplicates skipped)`
                };
            } else {
                throw new Error(saveResult.error);
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