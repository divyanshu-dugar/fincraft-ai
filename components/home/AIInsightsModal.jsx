'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader, Plus, Trash2 } from 'lucide-react';
import { getToken } from '@/lib/authenticate';

export default function AIInsightsModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all chat sessions on modal open
  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen]);

  // Fetch messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    }
  }, [currentSessionId]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat-sessions`,
        {
          headers: {
            'Authorization': `jwt ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch sessions');

      const data = await response.json();
      setSessions(data);

      // Auto-select first session or create new one
      if (data.length > 0 && !currentSessionId) {
        setCurrentSessionId(data[0]._id);
      } else if (data.length === 0) {
        createNewSession();
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat-sessions/${sessionId}/messages`,
        {
          headers: {
            'Authorization': `jwt ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setMessages(data);
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to load messages');
    }
  };

  const createNewSession = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `jwt ${token}`,
          },
          body: JSON.stringify({
            sessionName: `Conversation ${new Date().toLocaleDateString()}`,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to create session');

      const data = await response.json();
      setCurrentSessionId(data.sessionId);
      setMessages([]);
      await fetchSessions();
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err.message || 'Failed to create new session');
    }
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat-sessions/${sessionId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `jwt ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete session');

      await fetchSessions();
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err.message || 'Failed to delete session');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentSessionId) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Store the message to send
    const messageToSend = input;
    
    // Add user message optimistically
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `jwt ${token}`,
          },
          body: JSON.stringify({
            sessionId: currentSessionId,
            userQuery: messageToSend,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add assistant message
      const aiMessage = {
        role: 'assistant',
        content: data.assistantMessage.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      await fetchSessions(); // Refresh sessions to update names
    } catch (err) {
      console.error('Error:', err);
      
      // Add error message instead of discarding
      const errorMessage = {
        role: 'error',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date(),
        retryMessage: messageToSend,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retryMessage = async (retryMessage) => {
    if (!currentSessionId) return;

    // Remove the error message
    setMessages((prev) => prev.filter((msg) => msg.role !== 'error'));
    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `jwt ${token}`,
          },
          body: JSON.stringify({
            sessionId: currentSessionId,
            userQuery: retryMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const aiMessage = {
        role: 'assistant',
        content: data.assistantMessage.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      await fetchSessions();
    } catch (err) {
      console.error('Error:', err);
      
      const errorMessage = {
        role: 'error',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date(),
        retryMessage: retryMessage,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[600px] bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-cyan-400/20 shadow-2xl shadow-cyan-500/20 flex overflow-hidden">
        
        {/* Sidebar - Chat Sessions */}
        <div className="w-64 border-r border-cyan-400/10 flex flex-col bg-slate-950">
          {/* Header */}
          <div className="p-4 border-b border-cyan-400/10">
            <button
              onClick={createNewSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-semibold transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingSessions ? (
              <div className="flex items-center justify-center h-20">
                <Loader className="w-5 h-5 animate-spin text-cyan-400" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No conversations yet
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() => setCurrentSessionId(session._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors group flex items-center justify-between cursor-pointer ${
                    currentSessionId === session._id
                      ? 'bg-cyan-500/20 border border-cyan-400/50'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <span className="text-sm truncate text-slate-200">
                    {session.sessionName}
                  </span>
                  <div
                    onClick={(e) => deleteSession(session._id, e)}
                    className="p-1 hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-cyan-400/10">
            <div>
              <h2 className="text-xl font-bold text-white">💡 AI Insights</h2>
              <p className="text-sm text-slate-400 mt-1">
                Get personalized financial insights and advice
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-slate-400">
                  Ask me anything about your finances!
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  I can help with budgeting, expense insights, goals, and more.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'error' ? (
                    <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                      <div className="bg-red-900/20 text-red-300 border border-red-500/30 px-4 py-3 rounded-lg">
                        <p className="text-sm leading-relaxed break-words mb-2">
                          {msg.content}
                        </p>
                        <button
                          onClick={() => retryMessage(msg.retryMessage)}
                          disabled={loading}
                          className="text-xs bg-red-600/40 hover:bg-red-600/60 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : 'bg-slate-800 text-slate-100 border border-cyan-400/20'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {msg.content}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-100 border border-cyan-400/20 px-4 py-3 rounded-lg flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-cyan-400/10 p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your finances..."
                disabled={loading || !currentSessionId}
                className="flex-1 px-4 py-3 bg-slate-800 border border-cyan-400/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <button
                type="submit"
                disabled={loading || !input.trim() || !currentSessionId}
                className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
