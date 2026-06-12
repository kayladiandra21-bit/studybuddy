// sockets/chatSocket.js
// Real-time group chat.
//
// Flow:
//  1. Client connects with its JWT:  io(URL, { auth: { token } })
//  2. Client emits join_group(groupId) → server checks membership, joins room
//  3. Client emits send_message({ groupId, content })
//     → saved to MySQL → broadcast as receive_message to everyone in the room

const jwt = require('jsonwebtoken');
const GroupModel = require('../models/groupModel');
const MessageModel = require('../models/messageModel');

module.exports = function chatSocket(io) {
  // --- Authenticate every socket connection with the same JWT as the REST API
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Not authenticated'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id, role: decoded.role };
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[socket] user ${socket.user.id} connected`);

    // --- Join a group chat room (members only)
    socket.on('join_group', async (groupId) => {
      try {
        const isMember = await GroupModel.isMember(groupId, socket.user.id);
        if (!isMember) {
          return socket.emit('chat_error', { message: 'Join the group first.' });
        }
        socket.join(`group-${groupId}`);
        socket.emit('joined_group', { groupId });
      } catch (err) {
        socket.emit('chat_error', { message: 'Could not join the chat.' });
      }
    });

    socket.on('leave_group', (groupId) => {
      socket.leave(`group-${groupId}`);
    });

    // --- Send a message: persist, then broadcast to the room
    socket.on('send_message', async ({ groupId, content }) => {
      try {
        const text = String(content || '').trim();
        if (!text) return;
        if (text.length > 2000) {
          return socket.emit('chat_error', { message: 'Message too long (max 2000 chars).' });
        }

        const isMember = await GroupModel.isMember(groupId, socket.user.id);
        if (!isMember) {
          return socket.emit('chat_error', { message: 'Join the group first.' });
        }

        const message = await MessageModel.create(groupId, socket.user.id, text);
        io.to(`group-${groupId}`).emit('receive_message', message);
      } catch (err) {
        console.error('[socket] send_message failed:', err.message);
        socket.emit('chat_error', { message: 'Message could not be sent.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[socket] user ${socket.user.id} disconnected`);
    });
  });
};
