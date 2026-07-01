import fs from 'fs';
import Task from '../models/Task.js';
import { isMongoConnected, getFallbackDbPath } from '../config/db.js';

// --- Local JSON File Database Helpers ---
const readLocalTasks = () => {
  try {
    const filePath = getFallbackDbPath();
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local tasks file:', error);
    return [];
  }
};

const writeLocalTasks = (tasks) => {
  try {
    const filePath = getFallbackDbPath();
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing local tasks file:', error);
    return false;
  }
};

// Map priority to numeric values for sorting
const priorityMap = {
  high: 3,
  medium: 2,
  low: 1,
};

// --- Task Controller Actions ---

// @desc    Get all tasks (with searching, filtering, and sorting)
// @route   GET /api/tasks
export const getTasks = async (req, res) => {
  const { status, priority, search, sortBy, order, dueRange } = req.query;
  const isMongo = isMongoConnected();

  if (isMongo) {
    try {
      let query = {};

      // Filtering: Status
      if (status && status !== 'all') {
        query.status = status;
      }

      // Filtering: Priority
      if (priority && priority !== 'all') {
        query.priority = priority;
      }

      // Searching: Title and Description (case-insensitive regex)
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Filtering: Due Date Ranges
      if (dueRange && dueRange !== 'all') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        if (dueRange === 'overdue') {
          query.dueDate = { $lt: todayStart };
          query.status = { $ne: 'completed' }; // Completed tasks cannot be overdue
        } else if (dueRange === 'today') {
          query.dueDate = { $gte: todayStart, $lte: todayEnd };
        } else if (dueRange === 'week') {
          const sevenDaysLater = new Date();
          sevenDaysLater.setDate(todayStart.getDate() + 7);
          sevenDaysLater.setHours(23, 59, 59, 999);
          query.dueDate = { $gte: todayStart, $lte: sevenDaysLater };
        }
      }

      // Build Sorting Query
      let sortQuery = {};
      const sortField = sortBy || 'createdAt';
      const sortOrder = order === 'asc' ? 1 : -1;

      if (sortField === 'priority') {
        // Mongoose doesn't support custom mapping easily in standard find,
        // so we sort after querying or do an aggregation. For simplicity,
        // let's retrieve tasks and sort them in JS if priority sort is requested,
        // or sort by status/createdAt as secondary keys.
        // Actually, sorting in JS is extremely fast and robust for standard tasks quantities.
        // We'll perform database-level sorting for dueDate and createdAt, and handle priority sorting.
        if (sortField === 'priority') {
          // Retrieve and sort in memory
          let tasks = await Task.find(query);
          tasks.sort((a, b) => {
            const valA = priorityMap[a.priority] || 0;
            const valB = priorityMap[b.priority] || 0;
            return (valA - valB) * sortOrder;
          });
          return res.json(tasks);
        }
      } else {
        sortQuery[sortField] = sortOrder;
      }

      const tasks = await Task.find(query).sort(sortQuery);
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error fetching tasks from MongoDB', error: error.message });
    }
  } else {
    // --- LOCAL FILE DATABASE FALLBACK ---
    try {
      let tasks = readLocalTasks();

      // Filtering: Status
      if (status && status !== 'all') {
        tasks = tasks.filter((task) => task.status === status);
      }

      // Filtering: Priority
      if (priority && priority !== 'all') {
        tasks = tasks.filter((task) => task.priority === priority);
      }

      // Searching: Title and Description
      if (search) {
        const lowerSearch = search.toLowerCase();
        tasks = tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(lowerSearch) ||
            task.description.toLowerCase().includes(lowerSearch)
        );
      }

      // Filtering: Due Date Range
      if (dueRange && dueRange !== 'all') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        tasks = tasks.filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);

          if (dueRange === 'overdue') {
            return dueDate < todayStart && task.status !== 'completed';
          } else if (dueRange === 'today') {
            return dueDate >= todayStart && dueDate <= todayEnd;
          } else if (dueRange === 'week') {
            const sevenDaysLater = new Date();
            sevenDaysLater.setDate(todayStart.getDate() + 7);
            sevenDaysLater.setHours(23, 59, 59, 999);
            return dueDate >= todayStart && dueDate <= sevenDaysLater;
          }
          return true;
        });
      }

      // Sorting
      const sortField = sortBy || 'createdAt';
      const sortOrder = order === 'asc' ? 1 : -1;

      tasks.sort((a, b) => {
        if (sortField === 'priority') {
          const valA = priorityMap[a.priority] || 0;
          const valB = priorityMap[b.priority] || 0;
          return (valA - valB) * sortOrder;
        } else if (sortField === 'dueDate') {
          if (!a.dueDate) return sortOrder; // Put nulls at the end
          if (!b.dueDate) return -sortOrder;
          return (new Date(a.dueDate) - new Date(b.dueDate)) * sortOrder;
        } else {
          // Default sorting (createdAt)
          return (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrder;
        }
      });

      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error fetching local tasks', error: error.message });
    }
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
export const getTaskById = async (req, res) => {
  const { id } = req.params;
  const isMongo = isMongoConnected();

  if (isMongo) {
    try {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      return res.json(task);
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Task not found (Invalid ID)' });
      }
      return res.status(500).json({ message: 'Server Error fetching task', error: error.message });
    }
  } else {
    // --- LOCAL FILE DATABASE FALLBACK ---
    const tasks = readLocalTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.json(task);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  // Validation
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Validation Error: Title is required' });
  }
  if (title.length > 100) {
    return res.status(400).json({ message: 'Validation Error: Title cannot exceed 100 characters' });
  }
  if (description && description.length > 500) {
    return res.status(400).json({ message: 'Validation Error: Description cannot exceed 500 characters' });
  }
  if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Validation Error: Invalid status value' });
  }
  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ message: 'Validation Error: Invalid priority value' });
  }

  const isMongo = isMongoConnected();

  if (isMongo) {
    try {
      const newTask = new Task({
        title,
        description: description || '',
        status: status || 'pending',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
      });

      const savedTask = await newTask.save();
      return res.status(201).json(savedTask);
    } catch (error) {
      return res.status(400).json({ message: 'Error saving task to MongoDB', error: error.message });
    }
  } else {
    // --- LOCAL FILE DATABASE FALLBACK ---
    try {
      const tasks = readLocalTasks();
      const newLocalTask = {
        id: 'task_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        title: title.trim(),
        description: description ? description.trim() : '',
        status: status || 'pending',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      tasks.push(newLocalTask);
      writeLocalTasks(tasks);

      return res.status(201).json(newLocalTask);
    } catch (error) {
      return res.status(500).json({ message: 'Error saving local task', error: error.message });
    }
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate } = req.body;

  // Validation if fields are provided
  if (title !== undefined && (!title || title.trim() === '')) {
    return res.status(400).json({ message: 'Validation Error: Title cannot be empty' });
  }
  if (title && title.length > 100) {
    return res.status(400).json({ message: 'Validation Error: Title cannot exceed 100 characters' });
  }
  if (description && description.length > 500) {
    return res.status(400).json({ message: 'Validation Error: Description cannot exceed 500 characters' });
  }
  if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Validation Error: Invalid status value' });
  }
  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ message: 'Validation Error: Invalid priority value' });
  }

  const isMongo = isMongoConnected();

  if (isMongo) {
    try {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

      const updatedTask = await task.save();
      return res.json(updatedTask);
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Task not found (Invalid ID)' });
      }
      return res.status(400).json({ message: 'Error updating task in MongoDB', error: error.message });
    }
  } else {
    // --- LOCAL FILE DATABASE FALLBACK ---
    try {
      const tasks = readLocalTasks();
      const taskIndex = tasks.findIndex((t) => t.id === id);

      if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const existingTask = tasks[taskIndex];

      const updatedLocalTask = {
        ...existingTask,
        title: title !== undefined ? title.trim() : existingTask.title,
        description: description !== undefined ? description.trim() : existingTask.description,
        status: status !== undefined ? status : existingTask.status,
        priority: priority !== undefined ? priority : existingTask.priority,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate).toISOString() : null) : existingTask.dueDate,
        updatedAt: new Date().toISOString(),
      };

      tasks[taskIndex] = updatedLocalTask;
      writeLocalTasks(tasks);

      return res.json(updatedLocalTask);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating local task', error: error.message });
    }
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const isMongo = isMongoConnected();

  if (isMongo) {
    try {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      await Task.deleteOne({ _id: id });
      return res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Task not found (Invalid ID)' });
      }
      return res.status(500).json({ message: 'Server Error deleting task', error: error.message });
    }
  } else {
    // --- LOCAL FILE DATABASE FALLBACK ---
    try {
      const tasks = readLocalTasks();
      const taskIndex = tasks.findIndex((t) => t.id === id);

      if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
      }

      tasks.splice(taskIndex, 1);
      writeLocalTasks(tasks);

      return res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting local task', error: error.message });
    }
  }
};
