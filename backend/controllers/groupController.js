// controllers/groupController.js
const GroupModel = require('../models/groupModel');
const MessageModel = require('../models/messageModel');

/** Only the group owner or an admin may edit/delete a group */
async function canManage(group, user) {
  return group.created_by === user.id || user.role === 'admin';
}

const GroupController = {
  // GET /api/groups?search=&subject=
  async list(req, res, next) {
    try {
      const groups = await GroupModel.findAll(req.user.id, req.query);
      res.json({ groups });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/groups/:id (members only)
  async getOne(req, res, next) {
    try {
      const group = await GroupModel.findById(req.params.id);
      if (!group) return res.status(404).json({ message: 'Group not found.' });

      const isMember = await GroupModel.isMember(group.id, req.user.id);
      const members = await GroupModel.members(group.id);

      res.json({ group: { ...group, is_member: isMember }, members });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/groups
  async create(req, res, next) {
    try {
      const id = await GroupModel.create(req.user.id, req.body);
      const group = await GroupModel.findById(id);
      res.status(201).json({ group });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/groups/:id
  async update(req, res, next) {
    try {
      const group = await GroupModel.findById(req.params.id);
      if (!group) return res.status(404).json({ message: 'Group not found.' });
      if (!(await canManage(group, req.user))) {
        return res.status(403).json({ message: 'Only the group owner can edit this group.' });
      }
      await GroupModel.update(group.id, req.body);
      res.json({ group: await GroupModel.findById(group.id) });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/groups/:id
  async remove(req, res, next) {
    try {
      const group = await GroupModel.findById(req.params.id);
      if (!group) return res.status(404).json({ message: 'Group not found.' });
      if (!(await canManage(group, req.user))) {
        return res.status(403).json({ message: 'Only the group owner can delete this group.' });
      }
      await GroupModel.remove(group.id);
      res.json({ message: 'Group deleted.' });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/groups/:id/join
  async join(req, res, next) {
    try {
      const group = await GroupModel.findById(req.params.id);
      if (!group) return res.status(404).json({ message: 'Group not found.' });
      await GroupModel.join(group.id, req.user.id);
      res.json({ message: `You joined ${group.group_name}.` });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/groups/:id/leave
  async leave(req, res, next) {
    try {
      await GroupModel.leave(req.params.id, req.user.id);
      res.json({ message: 'You left the group.' });
    } catch (err) {
      next(err);
    }
  },

  // ---------- Announcements ----------

  // GET /api/groups/:id/announcements
  async announcements(req, res, next) {
    try {
      if (!(await GroupModel.isMember(req.params.id, req.user.id))) {
        return res.status(403).json({ message: 'Join the group to see announcements.' });
      }
      res.json({ announcements: await GroupModel.announcements(req.params.id) });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/groups/:id/announcements
  async addAnnouncement(req, res, next) {
    try {
      const group = await GroupModel.findById(req.params.id);
      if (!group) return res.status(404).json({ message: 'Group not found.' });
      if (!(await canManage(group, req.user))) {
        return res.status(403).json({ message: 'Only the group owner can post announcements.' });
      }
      await GroupModel.addAnnouncement(group.id, req.user.id, req.body);
      res.status(201).json({ announcements: await GroupModel.announcements(group.id) });
    } catch (err) {
      next(err);
    }
  },

  // ---------- Files ----------

  // GET /api/groups/:id/files
  async files(req, res, next) {
    try {
      if (!(await GroupModel.isMember(req.params.id, req.user.id))) {
        return res.status(403).json({ message: 'Join the group to see shared files.' });
      }
      res.json({ files: await GroupModel.files(req.params.id) });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/groups/:id/files  (multipart/form-data, field name: "file")
  async uploadFile(req, res, next) {
    try {
      if (!(await GroupModel.isMember(req.params.id, req.user.id))) {
        return res.status(403).json({ message: 'Join the group to share files.' });
      }
      if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

      await GroupModel.addFile(req.params.id, req.user.id, {
        file_name: req.file.originalname,
        file_path: `/uploads/groups/${req.file.filename}`,
        file_size: req.file.size,
      });
      res.status(201).json({ files: await GroupModel.files(req.params.id) });
    } catch (err) {
      next(err);
    }
  },

  // ---------- Chat history (live chat itself is Socket.io, Step 4) ----------

  // GET /api/groups/:id/messages?limit=&before=
  async messages(req, res, next) {
    try {
      if (!(await GroupModel.isMember(req.params.id, req.user.id))) {
        return res.status(403).json({ message: 'Join the group to read the chat.' });
      }
      const messages = await MessageModel.findByGroup(req.params.id, req.query);
      res.json({ messages });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = GroupController;
