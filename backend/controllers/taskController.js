// controllers/taskController.js
const TaskModel = require('../models/taskModel');

const TaskController = {
  // GET /api/tasks?search=&priority=&subject=&status=&sort=
  async list(req, res, next) {
    try {
      const tasks = await TaskModel.findAll(req.user.id, req.query);
      res.json({ tasks });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/tasks/subjects (for filter dropdown)
  async subjects(req, res, next) {
    try {
      const subjects = await TaskModel.subjects(req.user.id);
      res.json({ subjects });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/tasks/:id
  async getOne(req, res, next) {
    try {
      const task = await TaskModel.findById(req.params.id, req.user.id);
      if (!task) return res.status(404).json({ message: 'Task not found.' });
      res.json({ task });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/tasks
  async create(req, res, next) {
    try {
      const id = await TaskModel.create(req.user.id, req.body);
      const task = await TaskModel.findById(id, req.user.id);
      res.status(201).json({ task });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/tasks/:id
  async update(req, res, next) {
    try {
      const ok = await TaskModel.update(req.params.id, req.user.id, req.body);
      if (!ok) return res.status(404).json({ message: 'Task not found.' });
      const task = await TaskModel.findById(req.params.id, req.user.id);
      res.json({ task });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/tasks/:id/status   body: { status: 'completed' | 'pending' }
  async setStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Status must be pending or completed.' });
      }
      const ok = await TaskModel.setStatus(req.params.id, req.user.id, status);
      if (!ok) return res.status(404).json({ message: 'Task not found.' });
      res.json({ message: 'Status updated.' });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/tasks/:id
  async remove(req, res, next) {
    try {
      const ok = await TaskModel.remove(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Task not found.' });
      res.json({ message: 'Task deleted.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TaskController;
