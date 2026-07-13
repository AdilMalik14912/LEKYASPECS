const React = require('react');
const { useState, useEffect, useRef, useCallback } = React;
const { useRouter } = require('next/router');
const Head = require('next/head').default;
const { useAuth } = require('./_app');
const {
  MessageSquare, Users, Hash, Plus, Search, Send, Paperclip, Smile,
  Pin, Trash2, Edit3, Reply, MoreVertical, X, Check, CheckCheck,
  ChevronRight, LogOut, Crown, Truck, Store, Sparkles, Phone,
  Image, FileText, Download, Settings, Bell, Circle, ArrowLeft,
  ChevronDown, AlertCircle, Loader2, Upload
} = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000' : '')
  : '';

// ─── Emoji Picker Data ──────────────────────────────────────────────────────
const EMOJI_LIST = ['👍','❤️','😂','😮','😢','🔥','🎉','✅','💯','🚀','⭐','👀','💪','🙏','😎','🤝','💡','📌','✨','🏆'];

// ─── Role badge helpers ──────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const config = {
    admin:    { icon: Crown,   label: 'Admin',    color: '#f0c040', bg: 'rgba(240,192,64,0.15)' },
    seller:   { icon: Store,   label: 'Seller',   color: '#60d0a0', bg: 'rgba(96,208,160,0.15)' },
    delivery: { icon: Truck,   label: 'Delivery', color: '#60b0f0', bg: 'rgba(96,176,240,0.15)' },
    stylist:  { icon: Sparkles,label: 'Stylist',  color: '#d08060', bg: 'rgba(208,128,96,0.15)' },
  };
  const c = config[role] || config.admin;
  const Icon = c.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
      color: c.color, background: c.bg, letterSpacing: '0.02em'
    }}>
      <Icon size={9} /> {c.label.toUpperCase()}
    </span>
  );
}

// ─── Online Dot ─────────────────────────────────────────────────────────────
function OnlineDot({ isOnline, size = 8 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: isOnline ? '#4ade80' : '#475569',
      boxShadow: isOnline ? '0 0 0 2px rgba(74,222,128,0.3)' : 'none',
      display: 'inline-block'
    }} />
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36, online, role }) {
  const colors = ['#c5a028','#60d0a0','#60b0f0','#d08060','#a060d0','#d06080'];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  const initials = name ? name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() : '?';
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx+1)%colors.length]})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38, fontWeight: 700, color: '#fff',
        border: '2px solid rgba(255,255,255,0.08)'
      }}>
        {initials}
      </div>
      {online !== undefined && (
        <span style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: online ? '#4ade80' : '#475569',
          border: '2px solid #1e2230',
          boxShadow: online ? '0 0 0 2px rgba(74,222,128,0.3)' : 'none'
        }} />
      )}
    </div>
  );
}

// ─── File Preview Card ───────────────────────────────────────────────────────
function FileCard({ url, name, type, small = false }) {
  const isImage = type === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name || '');
  const isPdf   = /\.pdf$/i.test(name || '');

  if (isImage && url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        style={{ display: 'block', borderRadius: 8, overflow: 'hidden', maxWidth: small ? 160 : 280, cursor: 'pointer' }}>
        <img src={url} alt={name} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
      background: 'rgba(255,255,255,0.06)', borderRadius: 8, textDecoration: 'none',
      border: '1px solid rgba(255,255,255,0.08)', maxWidth: small ? 180 : 260,
      color: '#ccc', transition: 'background 0.2s'
    }}>
      {isPdf ? <FileText size={18} color="#f87171" /> : <FileText size={18} color="#93c5fd" />}
      <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name || 'File'}
      </span>
      <Download size={14} style={{ flexShrink: 0, marginLeft: 'auto' }} />
    </a>
  );
}

// ─── Typing Indicator ───────────────────────────────────────────────────────
function TypingIndicator({ names }) {
  if (!names || names.length === 0) return null;
  const label = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : 'Several people are typing';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', color: '#8899aa', fontSize: 12 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 5, height: 5, borderRadius: '50%', background: '#c5a028',
            animation: `typingBounce 1.2s ${i * 0.2}s ease-in-out infinite`
          }} />
        ))}
      </div>
      <span>{label}…</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN CHAT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ChatPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [conversations,      setConversations]      = useState([]);
  const [activeConv,         setActiveConv]         = useState(null);
  const [messages,           setMessages]           = useState([]);
  const [teamMembers,        setTeamMembers]        = useState([]);
  const [members,            setMembers]            = useState([]);
  const [pinnedMessages,     setPinnedMessages]     = useState([]);
  const [sharedFiles,        setSharedFiles]        = useState([]);
  const [typingUsers,        setTypingUsers]        = useState([]);

  const [inputText,          setInputText]          = useState('');
  const [searchQuery,        setSearchQuery]        = useState('');
  const [memberSearch,       setMemberSearch]       = useState('');

  const [showEmojiPicker,    setShowEmojiPicker]    = useState(null); // message id
  const [replyTo,            setReplyTo]            = useState(null);
  const [editingMsg,         setEditingMsg]         = useState(null);
  const [showNewDm,          setShowNewDm]          = useState(false);
  const [showNewGroup,       setShowNewGroup]       = useState(false);
  const [groupName,          setGroupName]          = useState('');
  const [groupDesc,          setGroupDesc]          = useState('');
  const [selectedMembers,    setSelectedMembers]    = useState([]);
  const [activePanel,        setActivePanel]        = useState('members'); // members | pinned | files
  const [showRightPanel,     setShowRightPanel]     = useState(true);
  const [showContextMenu,    setShowContextMenu]    = useState(null); // { msgId, x, y }
  const [filePreview,        setFilePreview]        = useState(null); // { data, name, type }
  const [isUploading,        setIsUploading]        = useState(false);
  const [loadingMore,        setLoadingMore]        = useState(false);
  const [hasMore,            setHasMore]            = useState(false);
  const [isSending,          setIsSending]          = useState(false);
  const [mobileSidebar,      setMobileSidebar]      = useState(false);

  const messagesEndRef  = useRef(null);
  const messagesAreaRef = useRef(null);
  const fileInputRef    = useRef(null);
  const inputRef        = useRef(null);
  const pollRef         = useRef(null);
  const typingTimerRef  = useRef(null);
  const lastMsgId       = useRef(null);
  const isAtBottom      = useRef(true);

  // ── Auth Guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user === null) { router.push('/account'); return; }
    if (user && !['admin','seller','delivery','stylist'].includes(user.role) &&
        !['dev.parceluncle@gmail.com','admin@specs.com'].includes(user.email)) {
      router.push('/');
    }
  }, [user]);

  // ── API helper ─────────────────────────────────────────────────────────────
  const api = useCallback(async (method, path, body) => {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, [token]);

  // ── Load team + conversations on mount ────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    api('GET', '/api/chat/team').then(setTeamMembers).catch(console.error);
    api('GET', '/api/chat/conversations').then(setConversations).catch(console.error);
  }, [token]);

  // ── Polling for new messages + unread counts ──────────────────────────────
  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    const poll = async () => {
      if (typeof document !== 'undefined' && document.hidden) return; // Pause polling when tab is hidden
      try {
        const promises = [api('GET', '/api/chat/conversations')];
        if (activeConv) {
          promises.push(api('GET', `/api/chat/conversations/${activeConv.id}/messages?limit=50`));
          promises.push(api('GET', `/api/chat/typing/${activeConv.id}`));
        }

        const [convs, msgs, typing] = await Promise.all(promises);
        if (!isMounted) return;

        // Smart diffing for conversations to prevent UI re-render lag
        setConversations(prev => {
          if (prev.length !== convs.length) return convs;
          const changed = convs.some((c, i) => {
            const p = prev[i];
            return !p || p.id !== c.id || p.unread_count !== c.unread_count || p.last_message_at !== c.last_message_at;
          });
          return changed ? convs : prev;
        });

        if (activeConv && msgs) {
          setMessages(prev => {
            if (msgs.length !== prev.length || (msgs.length > 0 && msgs[msgs.length-1]?.id !== prev[prev.length-1]?.id)) {
              if (isAtBottom.current) {
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
              }
              return msgs;
            }
            // Deep check for reaction/edit updates on active messages
            const updated = msgs.some((m, i) => {
              const p = prev[i];
              return !p || p.edited_at !== m.edited_at || p.is_pinned !== m.is_pinned || JSON.stringify(p.reactions) !== JSON.stringify(m.reactions);
            });
            return updated ? msgs : prev;
          });
        }

        if (activeConv && typing) {
          const names = typing.map(t => t.name);
          setTypingUsers(prev => (prev.join(',') === names.join(',') ? prev : names));
        }
      } catch (_) {}
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => { isMounted = false; clearInterval(pollRef.current); };
  }, [token, activeConv]);

  // ── Load conversation data when switching ─────────────────────────────────
  const openConversation = async (conv) => {
    setActiveConv(conv);
    setMessages([]);
    setReplyTo(null);
    setEditingMsg(null);
    setInputText('');
    setMobileSidebar(false);
    try {
      const [msgs, mems, pinned, files] = await Promise.all([
        api('GET', `/api/chat/conversations/${conv.id}/messages?limit=50`),
        api('GET', `/api/chat/conversations/${conv.id}/members`),
        api('GET', `/api/chat/conversations/${conv.id}/pinned`),
        api('GET', `/api/chat/conversations/${conv.id}/files`),
      ]);
      setMessages(msgs);
      setMembers(mems);
      setPinnedMessages(pinned);
      setSharedFiles(files);
      setHasMore(msgs.length === 50);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 100);
      // Mark read
      api('POST', `/api/chat/conversations/${conv.id}/read`).catch(() => {});
    } catch (e) { console.error(e); }
  };

  // ── Load older messages ────────────────────────────────────────────────────
  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = messages[0].id;
      const older = await api('GET', `/api/chat/conversations/${activeConv.id}/messages?before=${oldest}&limit=50`);
      setMessages(prev => [...older, ...prev]);
      setHasMore(older.length === 50);
    } catch (_) {}
    setLoadingMore(false);
  };

  // ── Scroll tracking ───────────────────────────────────────────────────────
  const handleScroll = () => {
    const el = messagesAreaRef.current;
    if (!el) return;
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop < 100) loadMoreMessages();
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (isSending) return;
    if (!inputText.trim() && !filePreview) return;
    setIsSending(true);

    const body = {
      content:    editingMsg ? undefined : (inputText.trim() || undefined),
      replyToId:  replyTo?.id,
      fileData:   filePreview?.data,
      fileName:   filePreview?.name,
      fileType:   filePreview?.mimeType,
    };

    try {
      if (editingMsg) {
        const updated = await api('PUT', `/api/chat/messages/${editingMsg.id}/edit`, { content: inputText.trim() });
        setMessages(prev => prev.map(m => m.id === editingMsg.id ? { ...m, content: inputText.trim(), edited_at: new Date().toISOString() } : m));
        setEditingMsg(null);
      } else {
        setIsUploading(!!filePreview);
        const newMsg = await api('POST', `/api/chat/conversations/${activeConv.id}/messages`, body);
        setMessages(prev => {
          const exists = prev.find(m => m.id === newMsg.id);
          return exists ? prev : [...prev, newMsg];
        });
        // Update sidebar last message
        setConversations(prev => prev.map(c =>
          c.id === activeConv.id
            ? { ...c, last_message: newMsg.content || (newMsg.file_name ? `📎 ${newMsg.file_name}` : ''), last_message_at: newMsg.created_at }
            : c
        ));
      }
      setInputText('');
      setReplyTo(null);
      setFilePreview(null);
      setIsUploading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      console.error(e);
      setIsUploading(false);
    }
    setIsSending(false);
  };

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleInput = (e) => {
    setInputText(e.target.value);
    if (!activeConv) return;
    api('POST', '/api/chat/typing', { conversationId: activeConv.id, isTyping: true }).catch(() => {});
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      api('POST', '/api/chat/typing', { conversationId: activeConv.id, isTyping: false }).catch(() => {});
    }, 3000);
  };

  // ── Start DM ──────────────────────────────────────────────────────────────
  const startDm = async (targetUserId) => {
    try {
      const { id } = await api('POST', '/api/chat/conversations/dm', { targetUserId });
      const convs = await api('GET', '/api/chat/conversations');
      setConversations(convs);
      setShowNewDm(false);
      const conv = convs.find(c => c.id === id);
      if (conv) openConversation(conv);
    } catch (e) { console.error(e); }
  };

  // ── Create Group ──────────────────────────────────────────────────────────
  const createGroup = async () => {
    if (!groupName.trim()) return;
    try {
      const newGroup = await api('POST', '/api/chat/conversations/group', {
        name: groupName.trim(), description: groupDesc.trim(), memberIds: selectedMembers
      });
      const convs = await api('GET', '/api/chat/conversations');
      setConversations(convs);
      setShowNewGroup(false);
      setGroupName(''); setGroupDesc(''); setSelectedMembers([]);
      const conv = convs.find(c => c.id === newGroup.id);
      if (conv) openConversation(conv);
    } catch (e) { console.error(e); }
  };

  // ── File Upload ───────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFilePreview({ data: ev.target.result, name: file.name, mimeType: file.type, size: file.size });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Reactions ─────────────────────────────────────────────────────────────
  const toggleReaction = async (msgId, emoji) => {
    try {
      await api('POST', `/api/chat/messages/${msgId}/react`, { emoji });
      // Refresh messages
      const msgs = await api('GET', `/api/chat/conversations/${activeConv.id}/messages?limit=50`);
      setMessages(msgs);
    } catch (_) {}
    setShowEmojiPicker(null);
  };

  // ── Pin ───────────────────────────────────────────────────────────────────
  const togglePin = async (msgId) => {
    try {
      await api('PUT', `/api/chat/messages/${msgId}/pin`);
      const [msgs, pinned] = await Promise.all([
        api('GET', `/api/chat/conversations/${activeConv.id}/messages?limit=50`),
        api('GET', `/api/chat/conversations/${activeConv.id}/pinned`),
      ]);
      setMessages(msgs);
      setPinnedMessages(pinned);
    } catch (_) {}
    setShowContextMenu(null);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteMessage = async (msgId) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api('DELETE', `/api/chat/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (_) {}
    setShowContextMenu(null);
  };

  // ── Format time ──────────────────────────────────────────────────────────
  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m`;
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // ── Filtered conversations ─────────────────────────────────────────────────
  const filteredConvs = conversations.filter(c => {
    const name = c.name || c.other_user?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const dmConvs    = filteredConvs.filter(c => c.type === 'dm');
  const groupConvs = filteredConvs.filter(c => c.type === 'group');

  // ── Active conv name ─────────────────────────────────────────────────────
  const convName = activeConv
    ? (activeConv.name || activeConv.other_user?.name || 'Conversation')
    : '';

  // ── Key handler ──────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape') { setReplyTo(null); setEditingMsg(null); setFilePreview(null); }
  };

  if (!user) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Head>
        <title>Team Chat — Specs Admin</title>
        <meta name="description" content="Internal team messaging for Specs admin members" />
      </Head>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .msg-bubble { animation: fadeSlideIn 0.25s ease; }
        .chat-input:focus { outline: none; }
        .conv-item:hover { background: rgba(197,160,40,0.08) !important; }
        .conv-item.active { background: rgba(197,160,40,0.15) !important; border-left: 3px solid #c5a028 !important; }
        .action-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .msg-row:hover .msg-actions { opacity: 1 !important; }
        .emoji-btn:hover { transform: scale(1.25); }
        .panel-tab.active { color: #c5a028 !important; border-bottom-color: #c5a028 !important; }
        .panel-tab:hover { color: #e0d0a0 !important; }
        .team-member-row:hover { background: rgba(255,255,255,0.06) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(197,160,40,0.3); border-radius: 2px; }
        .file-drop-zone:hover { border-color: #c5a028 !important; background: rgba(197,160,40,0.05) !important; }
      `}</style>

      {/* Click outside to close menus */}
      {(showContextMenu || showEmojiPicker) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => { setShowContextMenu(null); setShowEmojiPicker(null); }} />
      )}

      <div style={{
        display: 'flex', height: '100vh', background: '#0d1117',
        fontFamily: "'Inter', sans-serif", overflow: 'hidden', color: '#e2e8f0'
      }}>

        {/* ══════════════════════════ LEFT SIDEBAR ══════════════════════════ */}
        <div style={{
          width: 280, minWidth: 280, background: '#13161d',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', height: '100vh',
          position: mobileSidebar ? 'fixed' : 'relative', left: 0, top: 0, zIndex: 50,
          transform: mobileSidebar || window?.innerWidth > 768 ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s'
        }}>
          {/* Brand header */}
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #c5a028, #f0c040)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <MessageSquare size={18} color="#000" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#f0e8c8', letterSpacing: '-0.02em' }}>Specs Chat</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Team Messaging</div>
              </div>
              <button onClick={() => router.push('/admin')} style={{
                marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4
              }}>
                <ArrowLeft size={16} />
              </button>
            </div>
            {/* Search bar */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations…"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '7px 10px 7px 30px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Scrollable conversation list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {/* ── Direct Messages ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 4px' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Direct Messages
              </span>
              <button onClick={() => setShowNewDm(true)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#c5a028', padding: 2,
                display: 'flex', alignItems: 'center', borderRadius: 4, transition: 'background 0.2s'
              }} title="New DM" className="action-btn">
                <Plus size={14} />
              </button>
            </div>
            {dmConvs.length === 0 && (
              <div style={{ padding: '6px 16px', color: '#4b5563', fontSize: 12 }}>No direct messages yet</div>
            )}
            {dmConvs.map(conv => (
              <div key={conv.id}
                className={`conv-item ${activeConv?.id === conv.id ? 'active' : ''}`}
                onClick={() => openConversation(conv)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
                  cursor: 'pointer', borderLeft: '3px solid transparent', transition: 'all 0.15s'
                }}>
                <Avatar name={conv.other_user?.name || conv.name} size={34} online={conv.other_user?.is_online} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.other_user?.name || conv.name}
                    </span>
                    <span style={{ fontSize: 10, color: '#4b5563', flexShrink: 0 }}>{formatTime(conv.last_message_at)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.last_message || conv.last_file_name || 'Start a conversation'}
                  </div>
                </div>
                {conv.unread_count > 0 && (
                  <span style={{
                    background: '#c5a028', color: '#000', borderRadius: 10, padding: '1px 6px',
                    fontSize: 11, fontWeight: 700, flexShrink: 0
                  }}>
                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                  </span>
                )}
              </div>
            ))}

            {/* ── Groups ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 4px' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Group Channels
              </span>
              <button onClick={() => setShowNewGroup(true)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#c5a028', padding: 2,
                display: 'flex', alignItems: 'center', borderRadius: 4, transition: 'background 0.2s'
              }} title="New Group" className="action-btn">
                <Plus size={14} />
              </button>
            </div>
            {groupConvs.length === 0 && (
              <div style={{ padding: '6px 16px', color: '#4b5563', fontSize: 12 }}>No groups yet</div>
            )}
            {groupConvs.map(conv => (
              <div key={conv.id}
                className={`conv-item ${activeConv?.id === conv.id ? 'active' : ''}`}
                onClick={() => openConversation(conv)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
                  cursor: 'pointer', borderLeft: '3px solid transparent', transition: 'all 0.15s'
                }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'linear-gradient(135deg, #2d3748, #4a5568)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Hash size={16} color="#c5a028" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.name}
                    </span>
                    <span style={{ fontSize: 10, color: '#4b5563', flexShrink: 0 }}>{formatTime(conv.last_message_at)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.last_message || conv.last_file_name || 'No messages yet'}
                  </div>
                </div>
                {conv.unread_count > 0 && (
                  <span style={{
                    background: '#c5a028', color: '#000', borderRadius: 10, padding: '1px 6px',
                    fontSize: 11, fontWeight: 700, flexShrink: 0
                  }}>
                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Current user footer */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 10, background: '#0f1117'
          }}>
            <Avatar name={user?.name} size={32} online={true} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <RoleBadge role={user?.role} />
            </div>
            <button onClick={() => router.push('/admin')} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4
            }} title="Back to Admin">
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* ══════════════════════════ MAIN CHAT AREA ════════════════════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
          {!activeConv ? (
            /* Empty state */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#4b5563', gap: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(197,160,40,0.2), rgba(197,160,40,0.05))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(197,160,40,0.2)'
              }}>
                <MessageSquare size={36} color="#c5a028" />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', textAlign: 'center', marginBottom: 8 }}>
                  Welcome to Specs Team Chat
                </div>
                <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', maxWidth: 320 }}>
                  Select a conversation on the left, or start a new DM or group channel.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowNewDm(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                  background: 'linear-gradient(135deg, #c5a028, #f0c040)', color: '#000',
                  border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer'
                }}>
                  <Users size={16} /> New Direct Message
                </button>
                <button onClick={() => setShowNewGroup(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                  background: 'rgba(255,255,255,0.06)', color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer'
                }}>
                  <Hash size={16} /> New Group
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── Conversation Header ── */}
              <div style={{
                padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#13161d', backdropFilter: 'blur(10px)'
              }}>
                <button onClick={() => setMobileSidebar(true)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280',
                  display: 'none', padding: 4
                }}>
                  <ArrowLeft size={18} />
                </button>
                {activeConv.type === 'dm' ? (
                  <Avatar name={activeConv.other_user?.name || convName} size={38}
                    online={activeConv.other_user?.is_online} />
                ) : (
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, #2d3748, #4a5568)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Hash size={18} color="#c5a028" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#f0e8c8' }}>{convName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {activeConv.type === 'dm'
                      ? (activeConv.other_user?.is_online ? '🟢 Online' : '⚫ Offline')
                      : `${members.length} members`}
                  </div>
                </div>
                {/* Panel toggles */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {['members','pinned','files'].map(panel => (
                    <button key={panel} onClick={() => {
                      if (activePanel === panel && showRightPanel) setShowRightPanel(false);
                      else { setActivePanel(panel); setShowRightPanel(true); }
                    }} style={{
                      background: activePanel === panel && showRightPanel ? 'rgba(197,160,40,0.15)' : 'none',
                      border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
                      color: activePanel === panel && showRightPanel ? '#c5a028' : '#6b7280',
                      fontSize: 12, fontWeight: 500, transition: 'all 0.2s'
                    }}>
                      {panel === 'members' && <Users size={15} />}
                      {panel === 'pinned'  && <Pin size={15} />}
                      {panel === 'files'   && <Paperclip size={15} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Messages + Right Panel wrapper ── */}
              <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                {/* Messages Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div ref={messagesAreaRef} onScroll={handleScroll} style={{
                    flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 2
                  }}>
                    {/* Load more */}
                    {hasMore && (
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <button onClick={loadMoreMessages} disabled={loadingMore} style={{
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8, padding: '6px 16px', color: '#8899aa', cursor: 'pointer', fontSize: 12
                        }}>
                          {loadingMore ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '↑ Load older messages'}
                        </button>
                      </div>
                    )}

                    {messages.map((msg, idx) => {
                      const isOwn   = msg.sender_id === user?.id;
                      const isSystem = msg.message_type === 'system';
                      const prevMsg  = messages[idx - 1];
                      const showAvatar = !isOwn && (!prevMsg || prevMsg.sender_id !== msg.sender_id || isSystem);
                      const showName   = !isOwn && showAvatar && activeConv.type === 'group';
                      const reactionEntries = msg.reactions ? Object.entries(msg.reactions) : [];

                      if (isSystem) return (
                        <div key={msg.id} style={{ textAlign: 'center', padding: '8px 0' }}>
                          <span style={{
                            fontSize: 11, color: '#4b5563', background: 'rgba(255,255,255,0.04)',
                            padding: '3px 12px', borderRadius: 20
                          }}>{msg.content}</span>
                        </div>
                      );

                      return (
                        <div key={msg.id} className="msg-row"
                          style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', marginBottom: 2, position: 'relative' }}>
                          {showName && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 44, marginBottom: 2 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#c5a028' }}>{msg.sender_name}</span>
                              <RoleBadge role={msg.sender_role} />
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                            {!isOwn && (
                              <div style={{ width: 32, flexShrink: 0 }}>
                                {showAvatar && <Avatar name={msg.sender_name} size={32} />}
                              </div>
                            )}
                            <div className="msg-bubble" style={{ maxWidth: '68%', position: 'relative' }}>
                              {/* Reply preview */}
                              {msg.reply_to_id && (
                                <div style={{
                                  padding: '4px 10px', background: 'rgba(197,160,40,0.08)',
                                  borderLeft: '2px solid #c5a028', borderRadius: '4px 4px 0 0',
                                  fontSize: 12, color: '#8899aa', marginBottom: -4
                                }}>
                                  <span style={{ fontWeight: 600 }}>{msg.reply_sender_name}: </span>
                                  {msg.reply_content || msg.reply_file_name || 'Attachment'}
                                </div>
                              )}
                              {/* Bubble */}
                              <div style={{
                                padding: msg.file_url && !msg.content ? '6px' : '10px 14px',
                                background: isOwn
                                  ? 'linear-gradient(135deg, #c5a028, #b8912a)'
                                  : 'rgba(255,255,255,0.07)',
                                borderRadius: isOwn
                                  ? (msg.reply_to_id ? '4px 12px 4px 12px' : '12px 4px 12px 12px')
                                  : (msg.reply_to_id ? '4px 12px 12px 4px' : '4px 12px 12px 12px'),
                                color: isOwn ? '#0d1117' : '#e2e8f0',
                                border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.06)',
                                position: 'relative', wordBreak: 'break-word'
                              }}>
                                {msg.file_url && <FileCard url={msg.file_url} name={msg.file_name} type={msg.file_type} />}
                                {msg.content && (
                                  <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: msg.file_url ? 6 : 0 }}>
                                    {msg.content}
                                  </div>
                                )}
                              </div>

                              {/* Time + edited + pinned */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                                {msg.is_pinned ? <Pin size={10} color="#c5a028" /> : null}
                                <span style={{ fontSize: 10, color: '#4b5563' }}>{formatTime(msg.created_at)}</span>
                                {msg.edited_at && <span style={{ fontSize: 10, color: '#4b5563' }}>(edited)</span>}
                                {isOwn && msg.read_by?.length > 0 && (
                                  <CheckCheck size={12} color="#4ade80" />
                                )}
                              </div>

                              {/* Reactions */}
                              {reactionEntries.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                                  {reactionEntries.map(([emoji, users]) => (
                                    <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)} style={{
                                      display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px',
                                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                                      borderRadius: 12, cursor: 'pointer', fontSize: 13,
                                      color: '#e2e8f0', transition: 'all 0.2s'
                                    }} title={users.map(u => u.user_name).join(', ')}>
                                      {emoji} <span style={{ fontSize: 11, color: '#8899aa' }}>{users.length}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Message actions (hover) */}
                            <div className="msg-actions" style={{
                              opacity: 0, display: 'flex', alignItems: 'center', gap: 2, transition: 'opacity 0.2s'
                            }}>
                              {[
                                { icon: Smile, title: 'React', action: () => setShowEmojiPicker(msg.id) },
                                { icon: Reply, title: 'Reply', action: () => { setReplyTo(msg); inputRef.current?.focus(); } },
                                isOwn && { icon: Edit3, title: 'Edit', action: () => { setEditingMsg(msg); setInputText(msg.content || ''); inputRef.current?.focus(); } },
                                { icon: Pin, title: msg.is_pinned ? 'Unpin' : 'Pin', action: () => togglePin(msg.id) },
                                (isOwn || user?.role === 'admin') && { icon: Trash2, title: 'Delete', action: () => deleteMessage(msg.id) },
                              ].filter(Boolean).map((btn, i) => (
                                <button key={i} onClick={btn.action} title={btn.title} style={{
                                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: 6, padding: 5, cursor: 'pointer', color: '#8899aa',
                                  display: 'flex', transition: 'all 0.15s'
                                }} className="action-btn">
                                  <btn.icon size={12} />
                                </button>
                              ))}

                              {/* Emoji picker */}
                              {showEmojiPicker === msg.id && (
                                <div style={{
                                  position: 'absolute', [isOwn ? 'right' : 'left']: 0, bottom: '100%',
                                  background: '#1e2230', border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: 12, padding: '10px', zIndex: 100,
                                  display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                                }}>
                                  {EMOJI_LIST.map(em => (
                                    <button key={em} onClick={() => toggleReaction(msg.id, em)} style={{
                                      background: 'none', border: 'none', cursor: 'pointer',
                                      fontSize: 20, padding: 4, borderRadius: 6, transition: 'transform 0.1s'
                                    }} className="emoji-btn">{em}</button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <TypingIndicator names={typingUsers} />
                    <div ref={messagesEndRef} />
                  </div>

                  {/* ── Input Area ── */}
                  <div style={{ padding: '12px 20px 16px', background: '#13161d', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {/* Reply / Edit banner */}
                    {(replyTo || editingMsg) && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', marginBottom: 8,
                        background: 'rgba(197,160,40,0.08)', border: '1px solid rgba(197,160,40,0.2)',
                        borderRadius: 8, borderLeft: '3px solid #c5a028'
                      }}>
                        {editingMsg ? <Edit3 size={14} color="#c5a028" /> : <Reply size={14} color="#c5a028" />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, color: '#c5a028', fontWeight: 600 }}>
                            {editingMsg ? 'Editing message' : `Replying to ${replyTo?.sender_name}`}
                          </div>
                          <div style={{ fontSize: 12, color: '#8899aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {editingMsg?.content || replyTo?.content || replyTo?.file_name}
                          </div>
                        </div>
                        <button onClick={() => { setReplyTo(null); setEditingMsg(null); setInputText(''); }} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2
                        }}>
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {/* File preview */}
                    {filePreview && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8
                      }}>
                        {filePreview.mimeType?.startsWith('image/') ? (
                          <img src={filePreview.data} alt={filePreview.name} style={{ height: 40, borderRadius: 4, objectFit: 'cover' }} />
                        ) : (
                          <FileText size={28} color="#93c5fd" />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{filePreview.name}</div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>
                            {(filePreview.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button onClick={() => setFilePreview(null)} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2
                        }}>
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {/* Main input row */}
                    <div style={{
                      display: 'flex', alignItems: 'flex-end', gap: 8,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, padding: '8px 12px', transition: 'border-color 0.2s',
                    }}>
                      <button onClick={() => fileInputRef.current?.click()} style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280',
                        padding: 4, display: 'flex', flexShrink: 0, transition: 'color 0.2s'
                      }} title="Attach file" className="action-btn">
                        <Paperclip size={18} />
                      </button>
                      <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip" />

                      <textarea
                        ref={inputRef}
                        value={inputText}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={editingMsg ? 'Edit message…' : `Message ${convName}…`}
                        rows={1}
                        className="chat-input"
                        style={{
                          flex: 1, background: 'none', border: 'none', color: '#e2e8f0',
                          fontSize: 14, resize: 'none', lineHeight: 1.5, maxHeight: 120, outline: 'none',
                          fontFamily: "'Inter', sans-serif", scrollbarWidth: 'none'
                        }}
                        onInput={e => {
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                      />

                      <button onClick={sendMessage} disabled={(!inputText.trim() && !filePreview) || isSending}
                        style={{
                          background: (!inputText.trim() && !filePreview) || isSending
                            ? 'rgba(197,160,40,0.3)' : 'linear-gradient(135deg, #c5a028, #f0c040)',
                          border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer',
                          color: '#000', display: 'flex', alignItems: 'center', flexShrink: 0,
                          transition: 'all 0.2s'
                        }}>
                        {isSending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: '#374151', marginTop: 4, paddingLeft: 4 }}>
                      Enter to send • Shift+Enter for newline • Esc to cancel
                    </div>
                  </div>
                </div>

                {/* ══════ RIGHT PANEL ══════ */}
                {showRightPanel && (
                  <div style={{
                    width: 260, minWidth: 260, borderLeft: '1px solid rgba(255,255,255,0.06)',
                    background: '#13161d', display: 'flex', flexDirection: 'column',
                    animation: 'slideInRight 0.2s ease'
                  }}>
                    {/* Panel tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {[
                        { key: 'members', label: 'Members', icon: Users },
                        { key: 'pinned',  label: 'Pinned',  icon: Pin },
                        { key: 'files',   label: 'Files',   icon: Paperclip },
                      ].map(({ key, label, icon: Icon }) => (
                        <button key={key}
                          className={`panel-tab ${activePanel === key ? 'active' : ''}`}
                          onClick={() => setActivePanel(key)}
                          style={{
                            flex: 1, padding: '12px 4px', background: 'none', border: 'none',
                            borderBottom: '2px solid transparent', color: '#4b5563', cursor: 'pointer',
                            fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 4, transition: 'all 0.2s'
                          }}>
                          <Icon size={13} /> {label}
                        </button>
                      ))}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
                      {/* Members Panel */}
                      {activePanel === 'members' && (
                        <div>
                          <div style={{ padding: '0 12px 8px', fontSize: 11, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {members.length} Members
                          </div>
                          {members.map(m => (
                            <div key={m.id} className="team-member-row" style={{
                              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                              cursor: m.id !== user?.id ? 'pointer' : 'default', transition: 'background 0.15s'
                            }} onClick={() => m.id !== user?.id && startDm(m.id)}>
                              <Avatar name={m.name} size={30} online={m.is_online} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {m.name} {m.id === user?.id ? '(you)' : ''}
                                </div>
                                <RoleBadge role={m.role} />
                              </div>
                            </div>
                          ))}
                          {activeConv.type === 'group' && (
                            <div style={{ padding: '8px 12px' }}>
                              <button onClick={() => {
                                const uid = prompt('Enter user ID to add:');
                                if (uid) api('POST', `/api/chat/conversations/${activeConv.id}/members`, { userId: uid })
                                  .then(() => api('GET', `/api/chat/conversations/${activeConv.id}/members`).then(setMembers));
                              }} style={{
                                width: '100%', padding: '7px', background: 'rgba(197,160,40,0.1)',
                                border: '1px dashed rgba(197,160,40,0.3)', borderRadius: 8,
                                color: '#c5a028', cursor: 'pointer', fontSize: 12, fontWeight: 500
                              }}>
                                + Add Member
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pinned Messages Panel */}
                      {activePanel === 'pinned' && (
                        <div>
                          <div style={{ padding: '0 12px 8px', fontSize: 11, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {pinnedMessages.length} Pinned
                          </div>
                          {pinnedMessages.length === 0 && (
                            <div style={{ padding: '20px 12px', textAlign: 'center', color: '#4b5563', fontSize: 13 }}>
                              <Pin size={24} style={{ opacity: 0.3, marginBottom: 8 }} /><br />No pinned messages
                            </div>
                          )}
                          {pinnedMessages.map(msg => (
                            <div key={msg.id} style={{
                              margin: '0 12px 8px', padding: '10px 12px',
                              background: 'rgba(197,160,40,0.06)', border: '1px solid rgba(197,160,40,0.15)',
                              borderRadius: 8, borderLeft: '2px solid #c5a028'
                            }}>
                              <div style={{ fontSize: 11, color: '#c5a028', fontWeight: 600, marginBottom: 4 }}>
                                📌 {msg.sender_name}
                              </div>
                              {msg.file_url && <FileCard url={msg.file_url} name={msg.file_name} type={msg.file_type} small />}
                              {msg.content && <div style={{ fontSize: 12, color: '#8899aa', lineHeight: 1.4 }}>{msg.content}</div>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Shared Files Panel */}
                      {activePanel === 'files' && (
                        <div>
                          <div style={{ padding: '0 12px 8px', fontSize: 11, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {sharedFiles.length} Files
                          </div>
                          {sharedFiles.length === 0 && (
                            <div style={{ padding: '20px 12px', textAlign: 'center', color: '#4b5563', fontSize: 13 }}>
                              <Paperclip size={24} style={{ opacity: 0.3, marginBottom: 8 }} /><br />No shared files
                            </div>
                          )}
                          {sharedFiles.map(f => (
                            <div key={f.id} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <FileCard url={f.file_url} name={f.file_name} type={f.file_type} small />
                              <div style={{ fontSize: 10, color: '#4b5563', marginTop: 4 }}>
                                {f.sender_name} · {formatTime(f.created_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Leave / Close panel */}
                    <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button onClick={() => setShowRightPanel(false)} style={{
                        width: '100%', padding: '7px', background: 'none',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                        color: '#6b7280', cursor: 'pointer', fontSize: 12
                      }}>
                        Close Panel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════ NEW DM MODAL ══════════════════ */}
      {showNewDm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }} onClick={e => e.target === e.currentTarget && setShowNewDm(false)}>
          <div style={{
            background: '#1e2230', borderRadius: 16, width: 440, maxHeight: '70vh',
            border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 18, color: '#f0e8c8', fontWeight: 700 }}>New Direct Message</h2>
                <button onClick={() => setShowNewDm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
                <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Search team members…" autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '8px 10px 8px 30px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, color: '#e2e8f0', fontSize: 14, outline: 'none'
                  }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {teamMembers.filter(m =>
                m.id !== user?.id &&
                (m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
                 m.email?.toLowerCase().includes(memberSearch.toLowerCase()))
              ).map(m => (
                <div key={m.id} className="team-member-row" onClick={() => startDm(m.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
                  cursor: 'pointer', transition: 'background 0.15s'
                }}>
                  <Avatar name={m.name} size={38} online={m.is_online} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{m.email}</div>
                  </div>
                  <RoleBadge role={m.role} />
                  <OnlineDot isOnline={m.is_online} size={10} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ NEW GROUP MODAL ══════════════════ */}
      {showNewGroup && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }} onClick={e => e.target === e.currentTarget && setShowNewGroup(false)}>
          <div style={{
            background: '#1e2230', borderRadius: 16, width: 480, maxHeight: '80vh',
            border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 18, color: '#f0e8c8', fontWeight: 700 }}>Create Group Channel</h2>
                <button onClick={() => setShowNewGroup(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input value={groupName} onChange={e => setGroupName(e.target.value)}
                  placeholder="Group name (required)" autoFocus
                  style={{
                    padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                    color: '#e2e8f0', fontSize: 14, outline: 'none'
                  }} />
                <input value={groupDesc} onChange={e => setGroupDesc(e.target.value)}
                  placeholder="Description (optional)"
                  style={{
                    padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                    color: '#e2e8f0', fontSize: 14, outline: 'none'
                  }} />
              </div>
            </div>
            <div style={{ padding: '12px 16px 4px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
              Select members ({selectedMembers.length} selected)
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {teamMembers.filter(m => m.id !== user?.id).map(m => {
                const selected = selectedMembers.includes(m.id);
                return (
                  <div key={m.id} className="team-member-row" onClick={() =>
                    setSelectedMembers(prev => selected ? prev.filter(id => id !== m.id) : [...prev, m.id])
                  } style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px',
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: selected ? 'rgba(197,160,40,0.08)' : 'transparent'
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected ? '#c5a028' : 'rgba(255,255,255,0.2)'}`,
                      background: selected ? '#c5a028' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s'
                    }}>
                      {selected && <Check size={11} color="#000" />}
                    </div>
                    <Avatar name={m.name} size={32} online={m.is_online} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: '#e2e8f0' }}>{m.name}</div>
                    </div>
                    <RoleBadge role={m.role} />
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={createGroup} disabled={!groupName.trim()} style={{
                width: '100%', padding: '11px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: groupName.trim() ? 'linear-gradient(135deg, #c5a028, #f0c040)' : 'rgba(197,160,40,0.3)',
                color: '#000', border: 'none', borderRadius: 10, transition: 'all 0.2s'
              }}>
                Create Group
                {selectedMembers.length > 0 ? ` with ${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''}` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
