const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const TASKS_FILE = path.join(__dirname, 'main', 'data', 'tasks.json');

// Constants
const TASK_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed'
};

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
    DESCRIPTION_REQUIRED: 'Description is required',
    INVALID_TASK_ID: 'Invalid task ID',
    TASK_NOT_FOUND: 'Task not found',
    TASK_ALREADY_COMPLETED: 'Task is already completed',
    TASK_ALREADY_EXISTS: 'Task already exists',
    FAILED_TO_READ_TASKS: 'Failed to read tasks',
    FAILED_TO_SAVE_TASK: 'Failed to save task',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    INVALID_TASKS_DATA: 'Invalid tasks data',
    ENDPOINT_NOT_FOUND: 'Endpoint not found'
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('main'));

/**
 * Read tasks from JSON file
 * @returns {Promise<Object>} Tasks data with metadata
 */
async function readTasksFromFile() {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading tasks file:', error);
        // Return default structure if file doesn't exist
        return {
            tasks: [],
            metadata: {
                version: "1.0",
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                totalTasks: 0,
                completedTasks: 0,
                pendingTasks: 0
            }
        };
    }
}

/**
 * Write tasks to JSON file
 * @param {Object} tasksData - Tasks data with metadata
 * @returns {Promise<boolean>} Success status
 */
async function writeTasksToFile(tasksData) {
    try {
        // Update metadata
        tasksData.metadata.lastModified = new Date().toISOString();
        tasksData.metadata.totalTasks = tasksData.tasks.length;
        tasksData.metadata.completedTasks = tasksData.tasks.filter(t => t.status === 'completed').length;
        tasksData.metadata.pendingTasks = tasksData.tasks.filter(t => t.status === 'pending').length;

        await fs.writeFile(TASKS_FILE, JSON.stringify(tasksData, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing tasks file:', error);
        return false;
    }
}

/**
 * Get next available task ID
 * @param {Array} tasks - Array of tasks
 * @returns {number} Next available ID
 */
function getNextId(tasks) {
    return tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/&/g, '&amp;');
}

// API Routes

/**
 * GET /api/tasks - Get all tasks
 * @route GET /api/tasks
 * @returns {Object} Tasks data with metadata
 */
app.get('/api/tasks', async (req, res) => {
    try {
        const tasksData = await readTasksFromFile();
        res.json({
            success: true,
            data: tasksData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to read tasks'
        });
    }
});

/**
 * POST /api/tasks - Create new task
 * @route POST /api/tasks
 * @param {string} description - Task description
 * @returns {Object} Created task data
 */
app.post('/api/tasks', async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || typeof description !== 'string' || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Description is required'
            });
        }

        const tasksData = await readTasksFromFile();
        const trimmedDescription = description.trim();

        // Check for duplicates
        const existingTask = tasksData.tasks.find(task =>
            task.description.toLowerCase() === trimmedDescription.toLowerCase()
        );

        if (existingTask) {
            return res.status(409).json({
                success: false,
                error: `Task already exists with ID ${existingTask.id}`
            });
        }

        // Create new task
        const newTask = {
            id: getNextId(tasksData.tasks),
            description: trimmedDescription,
            status: 'pending',
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        tasksData.tasks.push(newTask);

        const saved = await writeTasksToFile(tasksData);
        if (!saved) {
            return res.status(500).json({
                success: false,
                error: 'Failed to save task'
            });
        }

        res.status(201).json({
            success: true,
            data: newTask,
            message: `Task ${newTask.id} created successfully`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/tasks/:id/complete - Mark task as completed
 * @route PUT /api/tasks/:id/complete
 * @param {number} id - Task ID
 * @returns {Object} Updated task data
 */
app.put('/api/tasks/:id/complete', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);

        if (isNaN(taskId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID'
            });
        }

        const tasksData = await readTasksFromFile();
        const task = tasksData.tasks.find(t => t.id === taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: `Task with ID ${taskId} not found`
            });
        }

        if (task.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: `Task ${taskId} is already completed`
            });
        }

        // Mark as completed
        task.status = 'completed';
        task.completedAt = new Date().toISOString();

        const saved = await writeTasksToFile(tasksData);
        if (!saved) {
            return res.status(500).json({
                success: false,
                error: 'Failed to save task completion'
            });
        }

        res.json({
            success: true,
            data: task,
            message: `Task ${taskId} marked as completed`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/tasks/:id - Delete task
 * @route DELETE /api/tasks/:id
 * @param {number} id - Task ID
 * @returns {Object} Deleted task data
 */
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);

        if (isNaN(taskId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID'
            });
        }

        const tasksData = await readTasksFromFile();
        const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
            return res.status(404).json({
                success: false,
                error: `Task with ID ${taskId} not found`
            });
        }

        const deletedTask = tasksData.tasks.splice(taskIndex, 1)[0];

        const saved = await writeTasksToFile(tasksData);
        if (!saved) {
            // Restore task if save failed
            tasksData.tasks.splice(taskIndex, 0, deletedTask);
            return res.status(500).json({
                success: false,
                error: 'Failed to save after deletion'
            });
        }

        res.json({
            success: true,
            data: deletedTask,
            message: `Task ${taskId} deleted successfully`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/tasks - Clear all tasks
 * @route DELETE /api/tasks
 * @returns {Object} Success message with count
 */
app.delete('/api/tasks', async (req, res) => {
    try {
        const tasksData = await readTasksFromFile();
        const taskCount = tasksData.tasks.length;

        if (taskCount === 0) {
            return res.json({
                success: true,
                message: 'No tasks to clear'
            });
        }

        tasksData.tasks = [];

        const saved = await writeTasksToFile(tasksData);
        if (!saved) {
            return res.status(500).json({
                success: false,
                error: 'Failed to clear tasks'
            });
        }

        res.json({
            success: true,
            message: `Cleared ${taskCount} task(s)`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/tasks/stats - Get task statistics
 * @route GET /api/tasks/stats
 * @returns {Object} Task statistics
 */
app.get('/api/tasks/stats', async (req, res) => {
    try {
        const tasksData = await readTasksFromFile();
        const stats = {
            total: tasksData.tasks.length,
            completed: tasksData.tasks.filter(t => t.status === 'completed').length,
            pending: tasksData.tasks.filter(t => t.status === 'pending').length
        };
        stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/tasks/export - Export tasks as JSON
 * @route GET /api/tasks/export
 * @returns {File} JSON file download
 */
app.get('/api/tasks/export', async (req, res) => {
    try {
        const tasksData = await readTasksFromFile();

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="tasks-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(tasksData);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to export tasks'
        });
    }
});

/**
 * POST /api/tasks/import - Import tasks from JSON
 * @route POST /api/tasks/import
 * @param {Array} tasks - Array of tasks to import
 * @param {boolean} replaceExisting - Whether to replace existing tasks
 * @returns {Object} Import results
 */
app.post('/api/tasks/import', async (req, res) => {
    try {
        const { tasks, replaceExisting = false } = req.body;

        if (!tasks || !Array.isArray(tasks)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid tasks data'
            });
        }

        const tasksData = await readTasksFromFile();

        if (replaceExisting) {
            tasksData.tasks = [];
        }

        let importedCount = 0;
        let skippedCount = 0;
        const errors = [];

        for (const taskData of tasks) {
            try {
                // Validate task data
                if (!taskData.description || typeof taskData.description !== 'string') {
                    errors.push(`Invalid task: missing or invalid description`);
                    skippedCount++;
                    continue;
                }

                // Check for duplicates
                const exists = tasksData.tasks.find(t =>
                    t.description.toLowerCase() === taskData.description.toLowerCase()
                );

                if (exists && !replaceExisting) {
                    skippedCount++;
                    continue;
                }

                // Create task with new ID
                const newTask = {
                    id: getNextId(tasksData.tasks),
                    description: taskData.description.trim(),
                    status: taskData.status === 'completed' ? 'completed' : 'pending',
                    createdAt: taskData.createdAt || new Date().toISOString(),
                    completedAt: taskData.status === 'completed' ?
                        (taskData.completedAt || new Date().toISOString()) : null
                };

                tasksData.tasks.push(newTask);
                importedCount++;

            } catch (error) {
                errors.push(`Error processing task: ${error.message}`);
                skippedCount++;
            }
        }

        const saved = await writeTasksToFile(tasksData);
        if (!saved) {
            return res.status(500).json({
                success: false,
                error: 'Failed to save imported tasks'
            });
        }

        res.json({
            success: true,
            message: `Import completed: ${importedCount} imported, ${skippedCount} skipped`,
            data: {
                imported: importedCount,
                skipped: skippedCount,
                errors: errors
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/tasks`);
});

module.exports = app;