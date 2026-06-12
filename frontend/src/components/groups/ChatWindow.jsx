// Real-time chat: history via REST, live messages via Socket.io
import { useEffect, useRef, useState } from 'react';
import { groupService } from '../../services/groupService';
import { useAuth } from '../../contexts/AuthContext';
import useSocket from '../../hooks/useSocket';
import Alert from '../ui/Alert';

export default function ChatWindow({ groupId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const { sendMessage } = useSocket(groupId, {
    onMessage: (msg) => setMessages((prev) => [...prev, msg]),
    onError: setError,
  });

  useEffect(() => {
    groupService.messages(groupId).then((res) => setMessages(res.data.messages));
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  }

  return (
    <div className="flex h-[28rem] flex-col">
      <Alert>{error}</Alert>
      <div className="flex-1 space-y-3 overflow-y-auto p-1">
        {messages.length === 0 && (
          <p className="py-16 text-center text-sm text-slate-400">
            No messages yet. Say hi! 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.user_id === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                mine
                  ? 'rounded-br-md bg-brand-600 text-white'
                  : 'rounded-bl-md bg-slate-100 dark:bg-slate-800'
              }`}>
                {!mine && <p className="mb-0.5 text-xs font-semibold text-brand-600 dark:text-brand-400">{m.sender_name}</p>}
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <p className={`mt-1 text-right text-[10px] ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                  {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn-primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
