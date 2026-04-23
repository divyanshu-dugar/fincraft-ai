"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessagesSkeleton } from "@/components/skeletons/PageSkeletons";
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
  Target,
  Menu,
  X,
  ChevronDown,
  Wallet,
  Lightbulb,
} from "lucide-react";
import { getToken } from "@/lib/authenticate";

const API = process.env.NEXT_PUBLIC_API_URL;
const AI_API = `${API}/api/v1`;

// ─── categorized question prompts ────────────────────────────────────────────
const QUESTION_CATEGORIES = [
  {
    id: "expenses",
    label: "Expenses",
    icon: Wallet,
    color: "rose",
    accent: "from-rose-500/20 to-orange-500/10 border-rose-500/30",
    iconColor: "text-rose-400",
    chipColor: "bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25",
    questions: [
      "How much did I spend this month?",
      "How much did I spend on momos last month?",
      "How many times did I order Swiggy in 2026?",
      "What did I spend $500 on last month?",
      "What were my top 5 biggest purchases this month?",
      "Show my food and dining expenses for March",
      "Do I overspend on weekends?",
      "Which day of the week do I spend the most?",
    ],
  },
  {
    id: "trends",
    label: "Trends & Analysis",
    icon: TrendingUp,
    color: "blue",
    accent: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
    iconColor: "text-blue-400",
    chipColor: "bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25",
    questions: [
      "Break down my spending by category for last month",
      "Is my grocery spending going up or down?",
      "Compare my Q1 vs Q2 spending",
      "Which month was my highest spending in 2026?",
      "What are my recurring monthly expenses?",
      "What subscriptions am I paying regularly?",
      "Where is most of my money going?",
    ],
  },
  {
    id: "income",
    label: "Income & Cashflow",
    icon: DollarSign,
    color: "emerald",
    accent: "from-emerald-500/20 to-green-500/10 border-emerald-500/30",
    iconColor: "text-emerald-400",
    chipColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25",
    questions: [
      "How much did I earn last month?",
      "What's my savings rate this month?",
      "How much did I save in Q1 2026?",
      "Did I earn more than I spent in March?",
      "What's my income breakdown by category?",
      "Show my income vs expenses for the last 3 months",
    ],
  },
  {
    id: "budgets",
    label: "Budgets",
    icon: BarChart3,
    color: "amber",
    accent: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    iconColor: "text-amber-400",
    chipColor: "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25",
    questions: [
      "Am I over budget anywhere right now?",
      "Which budget am I closest to blowing?",
      "How much is left in my Food budget?",
      "Show me all my active budgets",
    ],
  },
  {
    id: "goals",
    label: "Savings Goals",
    icon: Target,
    color: "purple",
    accent: "from-purple-500/20 to-violet-500/10 border-purple-500/30",
    iconColor: "text-purple-400",
    chipColor: "bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25",
    questions: [
      "Show me all my savings goals",
      "Am I on track to hit my vacation fund by July?",
      "How much more do I need to save for my MacBook?",
      "How much do I need to save per day to meet my emergency fund goal?",
      "Which of my goals is furthest from completion?",
    ],
  },
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
        {isUser ? <User className="w-4 h-4 text-slate-900 dark:text-white" /> : <Bot className="w-4 h-4 text-slate-900 dark:text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] group ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-br-sm"
            : "bg-slate-100 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-bl-sm"
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
        <Bot className="w-4 h-4 text-slate-900 dark:text-white" />
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
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
          ? "bg-white/10 text-slate-900 dark:text-white"
          : "text-slate-600 dark:text-slate-400 hover:bg-white/5 hover:text-slate-800 dark:text-slate-200"
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
            className="px-2 py-0.5 text-[10px] font-bold bg-slate-600 hover:bg-slate-500 text-slate-900 dark:text-white rounded-md transition-colors"
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
        bg-gradient-to-b from-slate-50 dark:from-slate-950 to-white dark:to-slate-900
        border-r border-slate-200 dark:border-slate-800/60
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Fincraft AI</span>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
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
            <div className="text-center py-8 px-4">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
              </div>
              <p className="text-xs font-medium text-slate-500">No conversations yet</p>
              <p className="text-[11px] text-slate-600 mt-1">Start a new chat above</p>
            </div>
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
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800/60">
          <p className="text-[10px] text-slate-600 text-center leading-relaxed">
            Powered by GPT-4o · Your data stays private
          </p>
        </div>
      </aside>
    </>
  );
}

// ─── question category accordion ──────────────────────────────────────────────
function QuestionCategory({ cat, onPrompt, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const Icon = cat.icon;
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${cat.accent} overflow-hidden transition-all`}>
      {/* Header row */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className={`w-7 h-7 rounded-lg bg-slate-100/60 dark:bg-slate-800/60 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${cat.iconColor}`} />
        </span>
        <span className="flex-1 text-sm font-bold text-slate-900 dark:text-white">{cat.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Question chips */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              {cat.questions.map((q) => (
                <button
                  key={q}
                  onClick={() => onPrompt(q)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all text-left ${cat.chipColor}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── empty welcome state ──────────────────────────────────────────────────────
function WelcomeState({ onPrompt }) {
  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8 max-w-2xl mx-auto w-full">
      {/* Hero */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-4"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <Sparkles className="w-8 h-8 text-slate-900 dark:text-white" />
        </div>
      </motion.div>
      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-slate-900 dark:text-white mb-1 text-center"
      >
        How can I help you today?
      </motion.h2>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-slate-600 dark:text-slate-400 mb-6 text-center max-w-sm"
      >
        Ask me anything about your spending, income, budgets, or savings goals.
      </motion.p>

      {/* Category accordions */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full space-y-2"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
          <p className="text-xs text-slate-500 font-medium">Click a category to browse questions, then tap any to ask it</p>
        </div>
        {QUESTION_CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <QuestionCategory cat={cat} onPrompt={onPrompt} defaultOpen={i === 0} />
          </motion.div>
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">

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
        <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 h-14 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-200/50 dark:bg-slate-700/50 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activeSession?.sessionName || "Fincraft AI"}
              </p>
              <p className="text-[10px] text-emerald-400 font-semibold">● Online</p>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
          {loadingMessages ? (
            <ChatMessagesSkeleton />
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
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 py-4">
          {!activeSession && (
            <p className="text-xs text-slate-500 text-center mb-3">
              Typing a message will automatically start a new conversation.
            </p>
          )}
          <div className={`flex items-end gap-3 rounded-2xl border bg-slate-100 dark:bg-slate-800 shadow-sm transition-all ${
            sending ? "border-slate-300 dark:border-slate-700" : "border-slate-300 dark:border-slate-700 focus-within:border-emerald-500 focus-within:shadow-emerald-500/10 focus-within:shadow-md"
          }`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              placeholder="Ask about your finances… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 outline-none leading-relaxed max-h-40 disabled:opacity-60"
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
