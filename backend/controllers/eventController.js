// controllers/eventController.js
const EventModel = require('../models/eventModel');
const TaskModel = require('../models/taskModel');

// Default colors per category (frontend can still override per event)
const CATEGORY_COLORS = {
  assignment: '#6366f1', // indigo
  exam: '#ef4444', // red
  meeting: '#f59e0b', // amber
  group_study: '#10b981', // emerald
  task: '#8b5cf6', // violet — tasks merged into the calendar
};

const EventController = {
  /**
   * GET /api/events?start=&end=
   * Returns events AND the user's tasks in one FullCalendar-ready feed,
   * so "tasks automatically appear on calendar" works server-side.
   */
  async list(req, res, next) {
    try {
      const events = await EventModel.findAll(req.user.id, req.query);
      const tasks = await TaskModel.findAll(req.user.id, {});

      const calendar = [
        ...events.map((e) => ({
          id: `event-${e.id}`,
          sourceId: e.id,
          source: 'event',
          title: e.title,
          start: e.event_date,
          end: e.end_date,
          category: e.category,
          description: e.description,
          color: e.color || CATEGORY_COLORS[e.category],
        })),
        ...tasks.map((t) => ({
          id: `task-${t.id}`,
          sourceId: t.id,
          source: 'task',
          title: `📌 ${t.title}`,
          start: t.due_date,
          category: 'task',
          description: t.description,
          color: t.status === 'completed' ? '#9ca3af' : CATEGORY_COLORS.task,
        })),
      ];

      res.json({ events: calendar });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/events
  async create(req, res, next) {
    try {
      const { category } = req.body;
      const valid = ['assignment', 'exam', 'meeting', 'group_study'];
      if (!valid.includes(category)) {
        return res.status(400).json({ message: `Category must be one of: ${valid.join(', ')}` });
      }
      const id = await EventModel.create(req.user.id, req.body);
      const event = await EventModel.findById(id, req.user.id);
      res.status(201).json({ event });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/events/:id
  async update(req, res, next) {
    try {
      const ok = await EventModel.update(req.params.id, req.user.id, req.body);
      if (!ok) return res.status(404).json({ message: 'Event not found.' });
      const event = await EventModel.findById(req.params.id, req.user.id);
      res.json({ event });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/events/:id
  async remove(req, res, next) {
    try {
      const ok = await EventModel.remove(req.params.id, req.user.id);
      if (!ok) return res.status(404).json({ message: 'Event not found.' });
      res.json({ message: 'Event deleted.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = EventController;
