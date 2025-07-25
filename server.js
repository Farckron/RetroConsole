// Updated server with Google OAuth login support and session management.
// NOTE: This file is a modified version of the original RetroConsole server.
// It introduces authentication using Passport's Google OAuth 2.0 strategy
// and exposes a simple `/api/user` endpoint to retrieve the authenticated user.

const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;
const TASKS_FILE = path.join(__dirname, 'main', 'data', 'tasks.json');

/**
 * Passport configuration.
 *
 * The Google client ID and secret must be provided via environment variables.
 * See the README for instructions on creating OAuth credentials.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      callbackURL: '/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // In a real application you might persist the user profile here.
      return done(null, profile);
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// --- Helpers ---
/**
 * Return the default tasks structure when no tasks file exists.
 * @returns {{ tasks: Array, metadata: Object }}
 */
const getDefaultData = () => ({
  tasks: [],
  metadata: {
    version: '1.0',
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  },
});

/**
 * Read tasks from the tasks file. Returns default data if file is absent or unreadable.
 * @returns {Promise<{ tasks: Array, metadata: Object }>}
 */
async function readTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return getDefaultData();
  }
}

/**
 * Persist tasks to disk and update metadata counts and timestamps.
 * @param {{ tasks: Array, metadata: Object }} data
 * @returns {Promise<void>}
 */
async function writeTasks(data) {
  data.metadata.lastModified = new Date().toISOString();
  data.metadata.totalTasks = data.tasks.length;
  data.metadata.completedTasks = data.tasks.filter((t) => t.status === 'completed').length;
  data.metadata.pendingTasks = data.tasks.filter((t) => t.status !== 'completed').length;
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
}

// Wrap async route handlers so we don't need to repeat try/catch everywhere.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'retroconsole-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'main')));

// --- Authentication Routes ---
/**
 * Initiate Google OAuth authentication. Redirects user to Google's consent page.
 */
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

/**
 * Google OAuth callback. Handles the response from Google and redirects to the home page.
 */
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
  }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

/**
 * Log out the current user and redirect to the homepage.
 */
app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

/**
 * Retrieve the authenticated user's profile.
 */
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ success: true, user: req.user });
  } else {
    res.json({ success: false, user: null });
  }
});

// --- Task Routes ---
/**
 * GET /api/tasks - Retrieve all tasks and metadata.
 */
app.get(
  '/api/tasks',
  asyncHandler(async (req, res) => {
    const tasksData = await readTasks();
    res.json({ success: true, data: tasksData });
  })
);

/**
 * POST /api/tasks - Create a new task. Requires a non-empty description.
 */
app.post(
  '/api/tasks',
  asyncHandler(async (req, res) => {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'Description is required' });
    }
    const data = await readTasks();
    const desc = description.trim().toLowerCase();
    if (data.tasks.some((t) => t.description.toLowerCase() === desc)) {
      return res.status(409).json({ success: false, error: 'Task already exists' });
    }
    const newId = data.tasks.length ? Math.max(...data.tasks.map((t) => t.id)) + 1 : 1;
    const newTask = {
      id: newId,
      description: description.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    data.tasks.push(newTask);
    await writeTasks(data);
    res.status(201).json({
      success: true,
      data: newTask,
      message: `Task ${newId} created successfully`,
    });
  })
);

/**
 * PUT /api/tasks/:id/complete - Mark a task as completed.
 */
app.put(
  '/api/tasks/:id/complete',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, error: 'Invalid task ID' });
    }
    const data = await readTasks();
    const task = data.tasks.find((t) => t.id === id);
    if (!task) return res.status(404).json({ success: false, error: `Task ${id} not found` });
    if (task.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Task already completed' });
    }
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    await writeTasks(data);
    res.json({ success: true, data: task, message: `Task ${id} marked as completed` });
  })
);

/**
 * DELETE /api/tasks/:id - Delete a task by ID.
 */
app.delete(
  '/api/tasks/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = await readTasks();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: `Task ${id} not found` });
    const [removed] = data.tasks.splice(idx, 1);
    await writeTasks(data);
    res.json({ success: true, data: removed, message: `Task ${id} deleted successfully` });
  })
);

/**
 * DELETE /api/tasks - Clear all tasks.
 */
app.delete(
  '/api/tasks',
  asyncHandler(async (req, res) => {
    const data = await readTasks();
    const count = data.tasks.length;
    if (!count) return res.json({ success: true, message: 'No tasks to clear' });
    data.tasks = [];
    await writeTasks(data);
    res.json({ success: true, message: `Cleared ${count} task(s)` });
  })
);

/**
 * GET /api/tasks/stats - Return summary statistics for tasks.
 */
app.get(
  '/api/tasks/stats',
  asyncHandler(async (req, res) => {
    const { tasks } = await readTasks();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = total - completed;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    res.json({ success: true, data: { total, completed, pending, completionRate } });
  })
);

/**
 * GET /api/tasks/export - Export tasks as JSON file.
 */
app.get(
  '/api/tasks/export',
  asyncHandler(async (req, res) => {
    const data = await readTasks();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tasks-${new Date().toISOString().slice(0, 10)}.json"`
    );
    res.json(data);
  })
);

/**
 * POST /api/tasks/import - Import tasks from JSON. Optionally replace existing tasks.
 */
app.post(
  '/api/tasks/import',
  asyncHandler(async (req, res) => {
    const { tasks, replaceExisting = false } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ success: false, error: 'Invalid tasks data' });
    }
    const data = await readTasks();
    if (replaceExisting) data.tasks = [];
    let imported = 0,
      skipped = 0;
    tasks.forEach((item) => {
      if (!item.description || typeof item.description !== 'string') {
        skipped++;
        return;
      }
      const desc = item.description.trim().toLowerCase();
      if (!replaceExisting && data.tasks.some((t) => t.description.toLowerCase() === desc)) {
        skipped++;
        return;
      }
      const newId = data.tasks.length ? Math.max(...data.tasks.map((t) => t.id)) + 1 : 1;
      data.tasks.push({
        id: newId,
        description: item.description.trim(),
        status: item.status === 'completed' ? 'completed' : 'pending',
        createdAt: item.createdAt || new Date().toISOString(),
        completedAt:
          item.status === 'completed'
            ? item.completedAt || new Date().toISOString()
            : null,
      });
      imported++;
    });
    await writeTasks(data);
    res.json({
      success: true,
      message: `Import completed: ${imported} imported, ${skipped} skipped`,
      data: { imported, skipped },
    });
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
