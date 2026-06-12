// hooks/useSocket.js — connect to the chat socket for one group.
// Handles join/leave on mount/unmount and message events.
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../services/api';

export default function useSocket(groupId, { onMessage, onError } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;
    const token =
      localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token');

    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('join_group', groupId));
    socket.on('receive_message', (msg) => onMessage?.(msg));
    socket.on('chat_error', (err) => onError?.(err.message));
    socket.on('connect_error', () => onError?.('Chat connection failed.'));

    return () => {
      socket.emit('leave_group', groupId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  function sendMessage(content) {
    socketRef.current?.emit('send_message', { groupId, content });
  }

  return { sendMessage };
}
