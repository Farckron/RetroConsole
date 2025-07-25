"use strict";

/**
 * Task Manager
 * Coordinates task operations and interacts with server storage
 */
class TaskManager {
    constructor() {
        this.storage = new TaskStorage();
        this.tasks = [];
        this.nextId = 1;
        this.isLoaded = false;
    }

    /**
     * Load tasks from server
     */
    async loadTasks() {
        console.log('TaskManager: Loading tasks...');
        const result = await this.storage.loadTasks();
        if (result.success) {
            this.tasks = result.tasks || [];
            // Calculate next ID from existing tasks
            this.nextId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => parseInt(t.id) || 0)) + 1 : 1;
            this.isLoaded = true;
            console.log(`TaskManager: Loaded ${this.tasks.length} tasks, next ID: ${this.nextId}`);
        } else {
            console.error('Failed to load tasks:', result.error);
            this.tasks = [];
            this.nextId = 1;
            this.isLoaded = true;
        }
        return result;
    }

    /**
     * Create new task on server
     */
    async createTask(description) {
        try {
            if (!description || typeof description !== 'string' || description.trim().length === 0) {
                return { success: false, error: 'Empty description' };
            }

            const result = await this.storage.createTask(description.trim());
            
            if (result.success) {
                // Reload tasks to get updated list from server
                await this.loadTasks();
            }

            return result;

        } catch (error) {
            return {
                success: false,
                error: `Error creating task: ${error.message}`
            };
        }
    }

    /**
     * Get all tasks (from local cache)
     */
    getAllTasks() {
        return [...this.tasks];
    }

    /**
     * Get task by ID (from local cache)
     */
    getTaskById(id) {
        // Support both string and number IDs
        return this.tasks.find(task => String(task.id) === String(id)) || null;
    }

    /**
     * Complete task on server
     */
    async completeTask(taskId) {
        try {
            const task = this.getTaskById(taskId);
            if (!task) {
                return { success: false, error: `Task #${taskId} not found` };
            }

            if (task.isCompleted) {
                return { success: false, error: `Already done #${taskId}` };
            }

            const result = await this.storage.completeTask(task.id);
            
            if (result.success) {
                // Reload tasks to get updated list from server
                await this.loadTasks();
            }

            return result;

        } catch (error) {
            return {
                success: false,
                error: `Error completing task: ${error.message}`
            };
        }
    }

    /**
     * Delete task on server
     */
    async deleteTask(taskId) {
        try {
            const task = this.getTaskById(taskId);
            if (!task) {
                return { success: false, error: `Task #${taskId} not found` };
            }

            const result = await this.storage.deleteTask(task.id);
            
            if (result.success) {
                // Reload tasks to get updated list from server
                await this.loadTasks();
            }

            return result;

        } catch (error) {
            return {
                success: false,
                error: `Error deleting task: ${error.message}`
            };
        }
    }

    /**
     * Clear all tasks on server
     */
    async clearAllTasks() {
        try {
            const result = await this.storage.clearAllTasks();
            
            if (result.success) {
                // Reload tasks to get updated list from server
                await this.loadTasks();
            }

            return result;

        } catch (error) {
            return {
                success: false,
                error: `Error clearing tasks: ${error.message}`
            };
        }
    }

    /**
     * Get task statistics (from server)
     */
    async getTaskStats() {
        try {
            const result = await this.storage.getTaskStats();
            
            if (result.success) {
                return result.stats;
            } else {
                // Fallback to local calculation
                const total = this.tasks.length;
                const completed = this.tasks.filter(t => t.isCompleted).length;
                const pending = total - completed;

                return {
                    total,
                    completed,
                    pending,
                    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
                };
            }

        } catch (error) {
            // Fallback to local calculation
            const total = this.tasks.length;
            const completed = this.tasks.filter(t => t.isCompleted).length;
            const pending = total - completed;

            return {
                total,
                completed,
                pending,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        }
    }

    /**
     * Search tasks by keywords (local search)
     */
    searchTasks(query) {
        if (!query || typeof query !== 'string') {
            return this.getAllTasks();
        }

        const searchTerm = query.toLowerCase().trim();
        return this.tasks.filter(task =>
            task.description.toLowerCase().includes(searchTerm) ||
            task.id.toString().includes(searchTerm)
        );
    }

    /**
     * Filter tasks by status (local filter)
     */
    filterTasksByStatus(status) {
        if (status === 'completed') {
            return this.tasks.filter(t => t.isCompleted);
        } else if (status === 'pending') {
            return this.tasks.filter(t => t.isPending());
        }
        return this.getAllTasks();
    }

    /**
     * Export tasks from server
     */
    async exportTasks() {
        return await this.storage.exportTasks();
    }

    /**
     * Import tasks to server
     */
    async importTasks(jsonData) {
        const result = await this.storage.importTasks(jsonData);
        if (result.success) {
            await this.loadTasks();
        }
        return result;
    }

    /**
     * Refresh tasks from server
     */
    async refreshTasks() {
        return await this.loadTasks();
    }
}