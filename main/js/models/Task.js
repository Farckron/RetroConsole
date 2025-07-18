"use strict";

/**
 * Task Model
 * Represents a single task with all its properties and methods
 */
class Task {
    constructor(id, description) {
        this.id = id;
        this.description = description;
        this.status = 'pending';
        this.createdAt = new Date();
        this.completedAt = null;
    }

    /**
     * Mark task as completed
     */
    complete() {
        if (this.status !== 'completed') {
            this.status = 'completed';
            this.completedAt = new Date();
        }
        return this;
    }

    /**
     * Mark task as pending
     */
    setPending() {
        this.status = 'pending';
        this.completedAt = null;
        return this;
    }

    /**
     * Check if task is completed
     */
    isCompleted() {
        return this.status === 'completed';
    }

    /**
     * Check if task is pending
     */
    isPending() {
        return this.status === 'pending';
    }

    /**
     * Get string representation for terminal display
     */
    toString() {
        const statusIcon = this.status === 'completed' ? '✓' : '○';
        return `[${this.id}] ${statusIcon} ${this.description}`;
    }

    /**
     * Get detailed string representation with timestamps
     */
    toDetailedString() {
        const statusIcon = this.status === 'completed' ? '✓' : '○';
        const createdDate = this.createdAt.toLocaleDateString();
        const completedInfo = this.completedAt ? 
            ` (completed: ${this.completedAt.toLocaleDateString()})` : '';
        return `[${this.id}] ${statusIcon} ${this.description} - Created: ${createdDate}${completedInfo}`;
    }

    /**
     * Convert task to JSON for storage
     */
    toJSON() {
        return {
            id: this.id,
            description: this.description,
            status: this.status,
            createdAt: this.createdAt.toISOString(),
            completedAt: this.completedAt ? this.completedAt.toISOString() : null
        };
    }

    /**
     * Create task from JSON data
     */
    static fromJSON(data) {
        const task = new Task(data.id, data.description);
        task.status = data.status;
        task.createdAt = new Date(data.createdAt);
        task.completedAt = data.completedAt ? new Date(data.completedAt) : null;
        return task;
    }

    /**
     * Validate task data
     */
    static isValidTaskData(data) {
        return data &&
            typeof data.id === 'number' &&
            typeof data.description === 'string' &&
            data.description.trim().length > 0 &&
            ['pending', 'completed'].includes(data.status) &&
            data.createdAt &&
            (data.completedAt === null || data.completedAt);
    }
}