"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  Bot,
  User,
  Loader2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Target,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { getToken } from "@/lib/authenticate";

const API = process.env.NEXT_PUBLIC_API_URL;
const AI_API = `${API}/api`;

// ─── suggested prompts ────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  { icon: DollarSign,   text: "How much did I spend this month?" },
  { icon: TrendingUp,   text: "Show my income vs expenses for the last 3 months" },
  { icon: BarChart3,    text: "What are my top expense categories this quarter?" },
  { icon: PiggyBank,    text: "Am I over budget anywhere right now?" },
  { icon: Target,       text: "Summarize my savings goal progress" },
  { icon: MessageSquare,text: "Find my recent restaurant or coffee expenses" },
];

// ─── simple markdown renderer ─────────────────────────────────────────────────
// Escapes HTML then applies markdown transforms — safe since source is GPT output.
function renderMarkdown(raw) {
  // 1. HTML-escape
  let html = raw
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;");

  // 2. Fenced code blocks
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g,
    (_, code) => `<pre><code>${code.trim()}</code></pre>`);

  // 3. Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm,  "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm,   "<h1>$1</h1>");

  // 4. Unordered lists — collapse consecutive <li> into <ul>
  html = html.replace(/^[-*•] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)(\n<li>[\s\S]*?<\/li>)*/g,
    (match) => `<ul>${match}</ul>`);

  // 5. Inline bold / italic / code
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g,     "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g,         "<em>$1</em>");
  html = html.replace(/`([^`\n]+)`/g,       "<code>$1</code>");

  // 6. Paragraphs from double newlines
  html = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Don't wrap blocks that are already block-level elements
      if (/^<(h[123]|ul|ol|pre|li)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  // 7. Remaining single newlines inside <p>
  html = html.replace(/([^>])\n([^<])/g, "$1<br>$2");

  return html;
}

// ─── message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-end`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
        isUser
          ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20"
          : "bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20"
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] group ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-br-sm"
            : "bg-slate-800 border border-slate-700/50 text-slate-200 rounded-bl-sm"
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          )}
        </div>
        {time && (
          <span className="text-[10px] text-slate-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {time}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex gap-3 items-end"
    >
      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 0.2, 0.4].map((delay) => (
            <motion.div
              key={delay}
              className="w-2 h-2 rounded-full bg-slate-500"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, delay }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── session item ─────────────────────────────────────────────────────────────
function SessionItem({ session, isActive, onSelect, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const date = new Date(session.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  return (
    <div
      className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
        isActive
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
      onClick={() => !confirmDelete && onSelect(session._id)}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate leading-tight">
          {session.sessionName || "New Conversation"}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">{date}</p>
      </div>

      {/* Delete button */}
      {confirmDelete ? (
        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onDelete(session._id)}
            className="px-2 py-0.5 text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-2 py-0.5 text-[10px] font-bold bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 rounded flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ sessions, activeSessionId, onSelect, onDelete, onNew, loading, open, onClose }) {
  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:relative z-40 md:z-auto
        flex flex-col w-72 h-full
        bg-gradient-to-b from-slate-950 to-slate-900
        border-r border-slate-800/60
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Fincraft AI</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-4 pb-3">
          <button
            onClick={onNew}
            disabled={loading}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/60 transition-all text-sm font-semibold disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 scrollbar-thin">
          {sessions.length === 0 && !loading && (
            <p className="text-xs text-slate-500 text-center py-8 px-4">
              No conversations yet.<br />Start a new chat above.
            </p>
          )}
          <AnimatePresence>
            {sessions.map((s) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <SessionItem
                  session={s}
                  isActive={s._id === activeSessionId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-800/60">
          <p className="text-[10px] text-slate-600 text-center leading-relaxed">
            Powered by GPT-4o · Your data stays private
          </p>
        </div>
      </aside>
    </>
  );
}

// ─── empty welcome state ──────────────────────────────────────────────────────
function WelcomeState({ onPrompt }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </motion.div>
      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-white mb-2"
      >
        How can I help you today?
      </motion.h2>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-slate-400 mb-8 max-w-sm"
      >
        I'm your personal finance AI. Ask me anything about your spending, income, budgets, or savings goals.
      </motion.p>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl"
      >
        {SUGGESTED_PROMPTS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            onClick={() => onPrompt(text)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/60 text-left text-sm text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all shadow-sm hover:shadow-md group"
          >
            <span className="flex-shrink-0 w-7 h-7 bg-slate-700 group-hover:bg-emerald-500/20 rounded-lg flex items-center justify-center transition-colors">
              <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </span>
            <span className="line-clamp-2 leading-snug">{text}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [sessions,       setSessions]       = useState([]);
  const [activeSession,  setActiveSession]  = useState(null);   // session object
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState("");
  const [sending,        setSending]        = useState(false);
  const [loadingSessions,setLoadingSessions]= useState(true);
  const [loadingMessages,setLoadingMessages]= useState(false);
  const [error,          setError]          = useState("");
  const [sidebarOpen,    setSidebarOpen]    = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  // ── helpers ────────────────────────────────────────────────────────────────
  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization:  `jwt ${getToken()}`,
  }), []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, sending, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // ── fetch sessions on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${AI_API}/chat-sessions`, { headers: headers() });
        if (!res.ok) throw new Error("Failed to load sessions");
        const data = await res.json();
        setSessions(data);
        // Auto-open most recent session if exists
        if (data.length > 0) {
          openSession(data[0]._id, data[0]);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingSessions(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── open a session and load its messages ───────────────────────────────────
  const openSession = useCallback(async (sessionId, sessionObj) => {
    setSidebarOpen(false);
    setActiveSession(sessionObj || sessions.find((s) => s._id === sessionId));
    setMessages([]);
    setLoadingMessages(true);
    setError("");
    try {
      const res = await fetch(`${AI_API}/chat-sessions/${sessionId}/messages`, {
        headers: headers(),
      });
      if (!res.ok) throw new Error("Failed to load messages");
      setMessages(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMessages(false);
    }
  }, [sessions, headers]);

  // ── create new session ─────────────────────────────────────────────────────
  const createSession = useCallback(async (firstMessage) => {
    const res = await fetch(`${AI_API}/chat-session`, {
      method:  "POST",
      headers: headers(),
      body:    JSON.stringify({ sessionName: firstMessage?.substring(0, 50) || undefined }),
    });
    if (!res.ok) throw new Error("Failed to create session");
    const { sessionId, sessionName } = await res.json();
    const newSession = { _id: sessionId, sessionName, createdAt: new Date().toISOString() };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSession(newSession);
    setMessages([]);
    return sessionId;
  }, [headers]);

  // ── handle new chat button ─────────────────────────────────────────────────
  const handleNewChat = useCallback(async () => {
    try {
      await createSession();
    } catch (e) {
      setError(e.message);
    }
  }, [createSession]);

  // ── delete session ─────────────────────────────────────────────────────────
  const deleteSession = useCallback(async (sessionId) => {
    try {
      await fetch(`${AI_API}/chat-sessions/${sessionId}`, {
        method:  "DELETE",
        headers: headers(),
      });
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      if (activeSession?._id === sessionId) {
        setActiveSession(null);
        setMessages([]);
      }
    } catch (e) {
      setError(e.message);
    }
  }, [activeSession, headers]);

  // ── send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || sending) return;
    setInput("");
    setError("");
    setSending(true);

    // Ensure we have a session
    let sessionId = activeSession?._id;
    if (!sessionId) {
      try {
        sessionId = await createSession(content);
      } catch (e) {
        setError(e.message);
        setSending(false);
        return;
      }
    }

    // Optimistic user message
    const optimistic = {
      _id:       `opt-${Date.now()}`,
      role:      "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`${AI_API}/chat-message`, {
        method:  "POST",
        headers: headers(),
        body:    JSON.stringify({ sessionId, userQuery: content }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to get response");
      }
      const { userMessage, assistantMessage } = await res.json();

      // Replace optimistic + add real messages
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== optimistic._id),
        userMessage,
        assistantMessage,
      ]);

      // Update session name if it changed
      setSessions((prev) =>
        prev.map((s) =>
          s._id === sessionId
            ? { ...s, sessionName: content.substring(0, 50) }
            : s
        )
      );
      setActiveSession((prev) =>
        prev?._id === sessionId
          ? { ...prev, sessionName: content.substring(0, 50) }
          : prev
      );
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
    } finally {
      setSending(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [input, sending, activeSession, createSession, headers]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen pt-16 bg-slate-950 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession?._id}
        onSelect={(id) => openSession(id, sessions.find((s) => s._id === id))}
        onDelete={deleteSession}
        onNew={handleNewChat}
        loading={loadingSessions}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Chat area ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-full">

        {/* Chat header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 h-14 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {activeSession?.sessionName || "Fincraft AI"}
              </p>
              <p className="text-[10px] text-emerald-400 font-semibold">● Online</p>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : !activeSession || messages.length === 0 ? (
            <WelcomeState onPrompt={(text) => sendMessage(text)} />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg._id} msg={msg} />
              ))}
              <AnimatePresence>
                {sending && <TypingIndicator />}
              </AnimatePresence>
            </>
          )}

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 shadow-sm mx-auto max-w-xl"
              >
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-300">Error</p>
                  <p className="text-xs text-red-400 mt-0.5">{error}</p>
                </div>
                <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-slate-800/60 bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 py-4">
          {!activeSession && (
            <p className="text-xs text-slate-500 text-center mb-3">
              Typing a message will automatically start a new conversation.
            </p>
          )}
          <div className={`flex items-end gap-3 rounded-2xl border bg-slate-800 shadow-sm transition-all ${
            sending ? "border-slate-700" : "border-slate-700 focus-within:border-emerald-500 focus-within:shadow-emerald-500/10 focus-within:shadow-md"
          }`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              placeholder="Ask about your finances… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none leading-relaxed max-h-40 disabled:opacity-60"
            />
            <div className="flex items-center gap-2 pr-3 pb-3 flex-shrink-0">
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || sending}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {sending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-2">
            Fincraft AI can make mistakes. Verify important financial decisions independently.
          </p>
        </div>
      </main>

      {/* ── Markdown styles ──────────────────────────────────────────────── */}
      <style>{`
        .markdown-content p { margin-bottom: 0.5rem; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content ul { list-style: disc; padding-left: 1.25rem; margin: 0.5rem 0; }
        .markdown-content li { margin-bottom: 0.2rem; }
        .markdown-content strong { font-weight: 700; }
        .markdown-content em { font-style: italic; }
        .markdown-content code {
          font-family: 'Menlo', 'Monaco', monospace;
          font-size: 0.8em;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 4px;
          padding: 0.1em 0.4em;
          color: #e2e8f0;
        }
        .markdown-content pre {
          background: #0f172a;
          color: #e2e8f0;
          border-radius: 10px;
          padding: 1rem;
          overflow-x: auto;
          margin: 0.75rem 0;
          font-size: 0.8em;
        }
        .markdown-content pre code {
          background: none;
          border: none;
          padding: 0;
          color: inherit;
          font-size: 1em;
        }
        .markdown-content h1 { font-size: 1.15em; font-weight: 800; margin: 0.75rem 0 0.4rem; }
        .markdown-content h2 { font-size: 1.05em; font-weight: 700; margin: 0.6rem 0 0.35rem; }
        .markdown-content h3 { font-size: 0.95em; font-weight: 700; margin: 0.5rem 0 0.3rem; color: #94a3b8; }
      `}</style>
    </div>
  );
}
