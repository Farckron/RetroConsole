/**
 * Task Manager
 * Coordinates task operations and interacts with server storage
 */
class TaskManager {
    constructor() {
        this.storage = new TaskStorage();
        this.tasks = [];
        this.nextId = 1;
        this.loadTasks();
    }

    /**
     * Load tasks from server
     */
    async loadTasks() {
        const result = await this.storage.loadTasks();
        if (result.success) {
            this.tasks = result.tasks || [];
            this.nextId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
        } else {
            console.error('Failed to load tasks:', result.error);
            this.tasks = [];
            this.nextId = 1;
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
        const taskId = parseInt(id);
        if (isNaN(taskId)) {
            return null;
        }
        return this.tasks.find(task => task.id === taskId) || null;
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

            if (task.isCompleted()) {
                return { success: false, error: `Already done #${taskId}` };
            }

            const result = await this.storage.completeTask(taskId);
            
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

            const result = await this.storage.deleteTask(taskId);
            
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
                const completed = this.tasks.filter(t => t.isCompleted()).length;
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
            const completed = this.tasks.filter(t => t.isCompleted()).length;
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
            return this.tasks.filter(t => t.isCompleted());
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