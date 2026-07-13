const React = require('react');
const { useState, useEffect, useCallback } = React;
const { useRouter } = require('next/router');
const Head = require('next/head').default;
const { useAuth } = require('./_app');
const {
  Users, TrendingUp, DollarSign, CheckCircle2, AlertTriangle,
  Clock, Plus, Search, Filter, RefreshCw, Phone, Mail, MessageSquare,
  Calendar, ArrowRight, ChevronRight, UserCheck, Flame, Tag, X,
  FileText, ArrowLeft, Loader2, Award, Briefcase, ChevronDown, Check,
  Sparkles, Wand2, Copy, Send
} = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000' : '')
  : '';

const STAGES = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Prescription Consult',
  'Offer Sent',
  'Converted Customer',
  'Lost'
];

const STAGE_COLORS = {
  'New Lead':             { bg: '#3b82f6', light: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
  'Contacted':            { bg: '#8b5cf6', light: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
  'Qualified':            { bg: '#06b6d4', light: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)' },
  'Prescription Consult': { bg: '#f59e0b', light: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  'Offer Sent':           { bg: '#ec4899', light: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)' },
  'Converted Customer':   { bg: '#10b981', light: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  'Lost':                 { bg: '#6b7280', light: 'rgba(107,114,128,0.12)',border: 'rgba(107,114,128,0.3)' },
};

function ScoreBadge({ score }) {
  let color = '#10b981'; // green
  let icon = '⚡';
  if (score >= 80) { color = '#ef4444'; icon = '🔥'; }
  else if (score >= 60) { color = '#f59e0b'; icon = '✨'; }
  else if (score < 40) { color = '#6b7280'; icon = '❄️'; }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
      borderRadius: 12, fontSize: 11, fontWeight: 700,
      color, background: `${color}18`, border: `1px solid ${color}33`
    }}>
      {icon} {score} pts
    </span>
  );
}

export default function CrmPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab,        setActiveTab]        = useState('analytics'); // analytics | kanban | directory | tasks
  const [stats,            setStats]            = useState(null);
  const [leads,            setLeads]            = useState([]);
  const [tasks,            setTasks]            = useState([]);
  const [teamMembers,      setTeamMembers]      = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [syncing,          setSyncing]          = useState(false);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [stageFilter,      setStageFilter]      = useState('');
  const [selectedLeadId,   setSelectedLeadId]   = useState(null);
  const [leadDetail,       setLeadDetail]       = useState(null);

  // Modals
  const [showCreateLead,   setShowCreateLead]   = useState(false);
  const [showCreateTask,   setShowCreateTask]   = useState(false);
  const [showLogModal,     setShowLogModal]     = useState(false);

  // AI Automation States
  const [runningAi,         setRunningAi]         = useState(false);
  const [aiInsights,        setAiInsights]        = useState(null);
  const [showAiEmailModal,  setShowAiEmailModal]  = useState(false);
  const [aiEmailDraft,      setAiEmailDraft]      = useState(null);
  const [generatingAiEmail, setGeneratingAiEmail] = useState(false);

  // Create Lead Form
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', stage: 'New Lead', source: 'Manual Entry', estimated_value: '', notes: '' });
  // Create Task Form
  const [newTask, setNewTask] = useState({ lead_id: '', title: '', description: '', due_date: '', priority: 'Medium', assigned_to: '' });
  // Log Interaction Form
  const [newLog, setNewLog] = useState({ type: 'call', subject: '', notes: '', outcome: 'Completed' });

  // ── Access Protection ──────────────────────────────────────────────────────
  useEffect(() => {
    if (user === null) { router.push('/account'); return; }
    if (user && !['admin','seller','delivery','stylist'].includes(user.role) &&
        !['dev.parceluncle@gmail.com','admin@specs.com'].includes(user.email)) {
      router.push('/');
    }
  }, [user]);

  // ── API Helper ─────────────────────────────────────────────────────────────
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

  // ── Load CRM Data ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [st, ld, tk, tm] = await Promise.all([
        api('GET', '/api/crm/stats'),
        api('GET', '/api/crm/leads'),
        api('GET', '/api/crm/tasks'),
        api('GET', '/api/chat/team'),
      ]);
      setStats(st);
      setLeads(ld);
      setTasks(tk);
      setTeamMembers(tm);
    } catch (e) { console.error('Error fetching CRM data:', e); }
    setLoading(false);
  }, [token, api]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Auto Sync ──────────────────────────────────────────────────────────────
  const handleAutoSync = async () => {
    setSyncing(true);
    try {
      const res = await api('POST', '/api/crm/auto-sync');
      alert(`✅ ${res.message}\nSynced ${res.syncedUsers} users & ${res.syncedContacts} contact inquiries!`);
      fetchAll();
    } catch (e) { alert('Sync error: ' + e.message); }
    setSyncing(false);
  };

  // ── Auto-Run AI CRM Engine Pass ─────────────────────────────────────────────
  const runAiEngine = async () => {
    setRunningAi(true);
    try {
      const res = await api('POST', '/api/crm/ai-automate');
      alert(`🤖 ${res.message}\n\n• Leads Ingested & Scored: ${res.updatedLeadsCount}\n• AI Follow-up Tasks Scheduled: ${res.autoTasksCreated}\n• Recommended Action: ${res.aiInsights?.recommendedAction}`);
      setAiInsights(res.aiInsights);
      fetchAll();
    } catch (e) {
      alert(`❌ AI Engine Error: ${e.message}`);
    } finally {
      setRunningAi(false);
    }
  };

  // ── Generate AI Sales Email Draft ───────────────────────────────────────────
  const handleGenerateAiEmail = async (leadId) => {
    setGeneratingAiEmail(true);
    setShowAiEmailModal(true);
    setAiEmailDraft(null);
    try {
      const res = await api('POST', '/api/crm/ai-generate-email', { leadId });
      setAiEmailDraft(res);
    } catch (e) {
      alert(`❌ Failed to generate AI email: ${e.message}`);
      setShowAiEmailModal(false);
    } finally {
      setGeneratingAiEmail(false);
    }
  };

  // ── Load Lead Detail ───────────────────────────────────────────────────────
  const inspectLead = async (id) => {
    setSelectedLeadId(id);
    try {
      const data = await api('GET', `/api/crm/leads/${id}`);
      setLeadDetail(data);
    } catch (e) { console.error(e); }
  };

  // ── Create Lead Submit ─────────────────────────────────────────────────────
  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLead.name.trim()) return;
    try {
      await api('POST', '/api/crm/leads', newLead);
      setShowCreateLead(false);
      setNewLead({ name: '', email: '', phone: '', stage: 'New Lead', source: 'Manual Entry', estimated_value: '', notes: '' });
      fetchAll();
    } catch (e) { alert(e.message); }
  };

  // ── Create Task Submit ─────────────────────────────────────────────────────
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.due_date) return;
    try {
      await api('POST', '/api/crm/tasks', newTask);
      setShowCreateTask(false);
      setNewTask({ lead_id: '', title: '', description: '', due_date: '', priority: 'Medium', assigned_to: '' });
      fetchAll();
      if (selectedLeadId) inspectLead(selectedLeadId);
    } catch (e) { alert(e.message); }
  };

  // ── Log Interaction Submit ─────────────────────────────────────────────────
  const handleLogInteraction = async (e) => {
    e.preventDefault();
    if (!selectedLeadId || !newLog.subject.trim()) return;
    try {
      await api('POST', `/api/crm/leads/${selectedLeadId}/interactions`, newLog);
      setShowLogModal(false);
      setNewLog({ type: 'call', subject: '', notes: '', outcome: 'Completed' });
      inspectLead(selectedLeadId);
      fetchAll();
    } catch (e) { alert(e.message); }
  };

  // ── Stage Update ───────────────────────────────────────────────────────────
  const handleStageChange = async (leadId, newStage) => {
    try {
      await api('PUT', `/api/crm/leads/${leadId}`, { stage: newStage });
      fetchAll();
      if (selectedLeadId === leadId) inspectLead(leadId);
    } catch (e) { console.error(e); }
  };

  // ── Toggle Task Status ─────────────────────────────────────────────────────
  const toggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api('PUT', `/api/crm/tasks/${taskId}`, { status: nextStatus });
      fetchAll();
      if (selectedLeadId) inspectLead(selectedLeadId);
    } catch (e) { console.error(e); }
  };

  // ── Filtered Leads ─────────────────────────────────────────────────────────
  const filteredLeads = leads.filter(l => {
    const matchSearch = !searchQuery.trim() ||
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStage = !stageFilter || l.stage === stageFilter;
    return matchSearch && matchStage;
  });

  if (!user) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Head>
        <title>Specs CRM — Customer Relationship & Pipeline Platform</title>
        <meta name="description" content="Specs Customer Relationship Management Studio" />
      </Head>

      <style>{`
        .kanban-col { background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
        .crm-card { background: #181c26; border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s ease; }
        .crm-card:hover { transform: translateY(-2px); border-color: #c5a028; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .crm-tab.active { background: rgba(197,160,40,0.15) !important; color: #f0c040 !important; border-color: #c5a028 !important; }
        .crm-row:hover { background: rgba(255,255,255,0.04) !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(197,160,40,0.3); border-radius: 3px; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#0d1117', color: '#e2e8f0',
        fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column'
      }}>

        {/* ══════════════════════════ HEADER ══════════════════════════ */}
        <header style={{
          background: '#13161d', borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.push('/admin')} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: 6, cursor: 'pointer', color: '#8899aa', display: 'flex'
            }} title="Back to Admin">
              <ArrowLeft size={16} />
            </button>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #c5a028, #f0c040)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Briefcase size={20} color="#000" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#f0e8c8', letterSpacing: '-0.02em' }}>Specs CRM</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Sales Pipeline & Customer Retention Studio</div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={runAiEngine} disabled={runningAi} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
            }}>
              {runningAi ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={15} />}
              Auto-Run AI Engine
            </button>
            <button onClick={handleAutoSync} disabled={syncing} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}>
              {syncing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} color="#c5a028" />}
              Auto Sync Leads
            </button>
            <button onClick={() => setShowCreateTask(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}>
              <Calendar size={14} color="#60b0f0" /> + Add Task
            </button>
            <button onClick={() => setShowCreateLead(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: 'linear-gradient(135deg, #c5a028, #f0c040)', color: '#000',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}>
              <Plus size={15} /> + New Lead
            </button>
          </div>
        </header>

        {/* ══════════════════════════ TAB BAR ══════════════════════════ */}
        <div style={{
          background: '#0f1218', borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto'
        }}>
          {[
            { key: 'analytics', label: '📊 Executive Dashboard', count: null },
            { key: 'kanban',    label: '🎯 Sales Pipeline (Kanban)', count: leads.length },
            { key: 'directory', label: '👥 Customer Directory', count: filteredLeads.length },
            { key: 'tasks',     label: '⏰ Follow-up Tasks', count: tasks.filter(t => t.status === 'Pending').length },
          ].map(tab => (
            <button key={tab.key}
              className={`crm-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '14px 18px', background: 'none', border: 'none',
                borderBottom: '2px solid transparent', color: '#6b7280', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}>
              {tab.label}
              {tab.count !== null && (
                <span style={{
                  background: 'rgba(255,255,255,0.1)', color: '#e2e8f0',
                  borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}

          {/* Search Bar */}
          <div style={{ marginLeft: 'auto', position: 'relative', minWidth: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search leads, email, phone…"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '6px 10px 6px 30px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, color: '#e2e8f0', fontSize: 12, outline: 'none'
              }}
            />
          </div>
        </div>

        {/* ══════════════════════════ MAIN CONTENT ══════════════════════════ */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
              <Loader2 size={36} color="#c5a028" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} /><br />
              Loading CRM Engine…
            </div>
          ) : (
            <>
              {/* ────────────────── 1. EXECUTIVE DASHBOARD ────────────────── */}
              {activeTab === 'analytics' && stats && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* AI Strategic Insights Card */}
                  <div className="crm-card" style={{
                    padding: '20px 24px', borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.12))',
                    border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', alignItems: 'center', gap: 16
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Sparkles size={22} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#f3e8ff', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>AI Autonomous CRM Intelligence</span>
                        <span style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '2px 8px', borderRadius: 10, fontSize: 10, uppercase: true, fontWeight: 700 }}>AUTOPILOT ACTIVE</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#d8b4fe', marginTop: 4, lineHeight: 1.5 }}>
                        {aiInsights?.recommendedAction || 'AI engine calculates high-intent deal scores, dynamically moves sales pipeline stages, and schedules follow-up tasks for 80+ score prospects.'}
                      </div>
                    </div>
                    <button onClick={runAiEngine} disabled={runningAi} style={{
                      padding: '8px 14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
                    }}>
                      Run AI Pass
                    </button>
                  </div>

                  {/* Metric Cards Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div className="crm-card" style={{ padding: '20px', borderRadius: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', uppercase: true }}>Pipeline Value</span>
                        <DollarSign size={20} color="#f0c040" />
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#f0e8c8' }}>
                        ₹{stats.metrics.pipelineValue.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Total value across active leads</div>
                    </div>

                    <div className="crm-card" style={{ padding: '20px', borderRadius: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Conversion Rate</span>
                        <TrendingUp size={20} color="#10b981" />
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
                        {stats.metrics.conversionRate}%
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{stats.metrics.convertedCount} converted customers</div>
                    </div>

                    <div className="crm-card" style={{ padding: '20px', borderRadius: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Total Leads</span>
                        <Users size={20} color="#60b0f0" />
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0' }}>
                        {stats.metrics.totalLeads}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Active in sales pipeline</div>
                    </div>

                    <div className="crm-card" style={{ padding: '20px', borderRadius: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Overdue Tasks</span>
                        <AlertTriangle size={20} color="#f87171" />
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#f87171' }}>
                        {stats.tasks.overdue}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{stats.tasks.pending} total pending tasks</div>
                    </div>
                  </div>

                  {/* Funnel Visualizer */}
                  <div className="crm-card" style={{ padding: '24px', borderRadius: 14 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#f0e8c8', fontWeight: 700 }}>Sales Funnel Pipeline</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {STAGES.map(st => {
                        const stData = stats.funnel[st] || { count: 0, total_value: 0 };
                        const pct = stats.metrics.totalLeads > 0 ? (stData.count / stats.metrics.totalLeads) * 100 : 0;
                        const col = STAGE_COLORS[st];
                        return (
                          <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 160, fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{st}</div>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', height: 28, borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                              <div style={{ width: `${Math.max(pct, 4)}%`, background: col.bg, height: '100%', transition: 'width 0.4s ease', borderRadius: 6 }} />
                              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                                {stData.count} leads (₹{stData.total_value.toLocaleString('en-IN')})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hot Leads + Sources */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                    {/* Hot Leads Leaderboard */}
                    <div className="crm-card" style={{ padding: '20px', borderRadius: 14 }}>
                      <h3 style={{ margin: '0 0 14px', fontSize: 15, color: '#f0e8c8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Flame color="#ef4444" size={18} /> 🔥 High Priority Hot Leads
                      </h3>
                      {stats.hotLeads.map(l => (
                        <div key={l.id} className="crm-row" onClick={() => inspectLead(l.id)} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', borderRadius: 8
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>{l.name}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{l.email || l.phone}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <ScoreBadge score={l.lead_score} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#c5a028' }}>₹{l.estimated_value?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Lead Sources */}
                    <div className="crm-card" style={{ padding: '20px', borderRadius: 14 }}>
                      <h3 style={{ margin: '0 0 14px', fontSize: 15, color: '#f0e8c8', fontWeight: 700 }}>Lead Sources</h3>
                      {stats.sources.map(src => (
                        <div key={src.source} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                          <span style={{ color: '#8899aa' }}>{src.source}</span>
                          <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{src.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────── 2. KANBAN PIPELINE BOARD ────────────────── */}
              {activeTab === 'kanban' && (
                <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, minHeight: 'calc(100vh - 160px)' }}>
                  {STAGES.map(st => {
                    const stageLeads = filteredLeads.filter(l => l.stage === st);
                    const col = STAGE_COLORS[st];
                    const totalVal = stageLeads.reduce((acc, l) => acc + (l.estimated_value || 0), 0);
                    return (
                      <div key={st} className="kanban-col" style={{ width: 280, minWidth: 280, display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: col.bg }}>{st}</span>
                            <span style={{ background: col.light, color: col.bg, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                              {stageLeads.length}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>₹{totalVal.toLocaleString('en-IN')}</div>
                        </div>

                        {/* Cards container */}
                        <div style={{ flex: 1, padding: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {stageLeads.map(l => (
                            <div key={l.id} className="crm-card" onClick={() => inspectLead(l.id)} style={{
                              padding: '14px', borderRadius: 10, cursor: 'pointer', position: 'relative'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>{l.name}</span>
                                <ScoreBadge score={l.lead_score} />
                              </div>
                              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {l.email || l.phone || 'No contact'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, pt: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#c5a028' }}>₹{l.estimated_value?.toLocaleString('en-IN')}</span>
                                {/* Quick stage selector */}
                                <select value={l.stage} onClick={e => e.stopPropagation()} onChange={e => handleStageChange(l.id, e.target.value)} style={{
                                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: 6, color: '#8899aa', fontSize: 11, padding: '2px 4px', outline: 'none'
                                }}>
                                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ────────────────── 3. CUSTOMER DIRECTORY ────────────────── */}
              {activeTab === 'directory' && (
                <div>
                  {/* Filters bar */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{
                      padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8, color: '#e2e8f0', fontSize: 13, outline: 'none'
                    }}>
                      <option value="">All Stages</option>
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="crm-card" style={{ borderRadius: 14, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
                          <th style={{ padding: '14px 16px' }}>Customer / Lead</th>
                          <th style={{ padding: '14px 16px' }}>Stage</th>
                          <th style={{ padding: '14px 16px' }}>Score</th>
                          <th style={{ padding: '14px 16px' }}>Est. Value</th>
                          <th style={{ padding: '14px 16px' }}>Total Spent</th>
                          <th style={{ padding: '14px 16px' }}>Source</th>
                          <th style={{ padding: '14px 16px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads.map(l => {
                          const col = STAGE_COLORS[l.stage] || STAGE_COLORS['New Lead'];
                          return (
                            <tr key={l.id} className="crm-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{l.name}</div>
                                <div style={{ fontSize: 11, color: '#6b7280' }}>{l.email} · {l.phone}</div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, color: col.bg, background: col.light, border: `1px solid ${col.border}` }}>
                                  {l.stage}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <ScoreBadge score={l.lead_score} />
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#c5a028' }}>
                                ₹{l.estimated_value?.toLocaleString('en-IN')}
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>
                                ₹{l.total_spent?.toLocaleString('en-IN')} ({l.total_orders} orders)
                              </td>
                              <td style={{ padding: '14px 16px', color: '#8899aa', fontSize: 12 }}>
                                {l.source}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => inspectLead(l.id)} style={{
                                    padding: '5px 10px', background: 'rgba(197,160,40,0.15)',
                                    border: '1px solid rgba(197,160,40,0.3)', borderRadius: 6,
                                    color: '#c5a028', cursor: 'pointer', fontSize: 12, fontWeight: 600
                                  }}>
                                    Inspect
                                  </button>
                                  {l.phone && (
                                    <button onClick={() => {
                                      const clean = l.phone.replace(/[^0-9]/g, '');
                                      const num = clean.length === 10 ? `91${clean}` : clean;
                                      const msg = `Hello ${l.name.split(' ')[0]}, greetings from Lekya Specs Eyewear Concierge! Explore your personalized offers: https://lekyaspecs.vercel.app`;
                                      window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }} title="Chat on WhatsApp" style={{
                                      padding: '5px 10px', background: 'rgba(34,197,94,0.15)',
                                      border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6,
                                      color: '#4ade80', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                      display: 'inline-flex', alignItems: 'center', gap: 4
                                    }}>
                                      💬 WA
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ────────────────── 4. FOLLOW-UP TASKS ────────────────── */}
              {activeTab === 'tasks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tasks.map(t => {
                    const isOverdue = t.status === 'Pending' && new Date(t.due_date) < new Date();
                    return (
                      <div key={t.id} className="crm-card" style={{
                        padding: '16px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16,
                        borderLeft: `4px solid ${isOverdue ? '#f87171' : (t.priority === 'High' ? '#f59e0b' : '#3b82f6')}`
                      }}>
                        <button onClick={() => toggleTaskStatus(t.id, t.status)} style={{
                          width: 22, height: 22, borderRadius: 6, border: `2px solid ${t.status === 'Completed' ? '#10b981' : '#4b5563'}`,
                          background: t.status === 'Completed' ? '#10b981' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}>
                          {t.status === 'Completed' && <Check size={14} color="#000" />}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontWeight: 700, fontSize: 15, color: t.status === 'Completed' ? '#6b7280' : '#e2e8f0', textDecoration: t.status === 'Completed' ? 'line-through' : 'none' }}>
                              {t.title}
                            </span>
                            {isOverdue && <span style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>OVERDUE</span>}
                          </div>
                          {t.description && <div style={{ fontSize: 13, color: '#8899aa', marginTop: 2 }}>{t.description}</div>}
                          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                            Lead: {t.lead_name || 'General'} · Due: {t.due_date} · Assigned: {t.assigned_name || 'Unassigned'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ══════════════════ LEAD INSPECTION DRAWER ══════════════════ */}
      {selectedLeadId && leadDetail && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', justifyContent: 'flex-end', zIndex: 1000, backdropFilter: 'blur(6px)'
        }} onClick={e => e.target === e.currentTarget && setSelectedLeadId(null)}>
          <div style={{
            width: 540, maxWidth: '100%', background: '#13161d', height: '100vh',
            borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.7)', overflow: 'hidden'
          }}>
            {/* Drawer Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#181c26' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ margin: 0, fontSize: 20, color: '#f0e8c8', fontWeight: 800 }}>{leadDetail.name}</h2>
                <button onClick={() => setSelectedLeadId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ScoreBadge score={leadDetail.lead_score} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#c5a028' }}>Est. Value: ₹{leadDetail.estimated_value?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Contact info card */}
              <div className="crm-card" style={{ padding: '16px', borderRadius: 10 }}>
                <div style={{ fontSize: 13, color: '#8899aa', marginBottom: 6 }}>📧 {leadDetail.email || 'No email'}</div>
                <div style={{ fontSize: 13, color: '#8899aa', marginBottom: 6 }}>📞 {leadDetail.phone || 'No phone'}</div>
                <div style={{ fontSize: 13, color: '#8899aa' }}>📍 Source: {leadDetail.source}</div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowLogModal(true)} style={{
                  flex: 1, padding: '10px', background: 'rgba(197,160,40,0.15)',
                  border: '1px solid rgba(197,160,40,0.3)', borderRadius: 8,
                  color: '#c5a028', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}>
                  <Phone size={14} /> Log Call / Note
                </button>
                <button onClick={() => handleGenerateAiEmail(leadDetail.id)} style={{
                  flex: 1, padding: '10px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                  border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: 8,
                  color: '#e9d5ff', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}>
                  <Wand2 size={14} color="#c084fc" /> Generate AI Sales Email
                </button>
              </div>

              {/* Interaction Timeline */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#f0e8c8', fontWeight: 700 }}>Activity & Interaction Timeline</h4>
                {leadDetail.interactions?.map(i => (
                  <div key={i.id} style={{
                    padding: '12px', background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8, marginBottom: 8, borderLeft: '3px solid #c5a028'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#c5a028' }}>
                      <span>{i.type.toUpperCase()}: {i.subject}</span>
                      <span style={{ color: '#6b7280', fontSize: 11 }}>{new Date(i.created_at).toLocaleDateString()}</span>
                    </div>
                    {i.notes && <div style={{ fontSize: 13, color: '#e2e8f0', marginTop: 4 }}>{i.notes}</div>}
                  </div>
                ))}
              </div>

              {/* Orders History */}
              {leadDetail.orders?.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#f0e8c8', fontWeight: 700 }}>Customer Order History</h4>
                  {leadDetail.orders.map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <span>Order #{o.id} ({o.status})</span>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>₹{o.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CREATE LEAD MODAL ══════════════════ */}
      {showCreateLead && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'
        }} onClick={e => e.target === e.currentTarget && setShowCreateLead(false)}>
          <form onSubmit={handleCreateLead} style={{
            background: '#1e2230', borderRadius: 16, width: 440, padding: 24,
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 14
          }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#f0e8c8', fontWeight: 700 }}>Create New CRM Lead</h3>
            <input value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} placeholder="Full Name (Required)" required style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none' }} />
            <input value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} placeholder="Email Address" style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none' }} />
            <input value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} placeholder="Phone Number" style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none' }} />
            <select value={newLead.stage} onChange={e => setNewLead({ ...newLead, stage: e.target.value })} style={{ padding: '10px', background: '#181c26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none' }}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" value={newLead.estimated_value} onChange={e => setNewLead({ ...newLead, estimated_value: e.target.value })} placeholder="Estimated Deal Value (₹)" style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none' }} />
            <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg, #c5a028, #f0c040)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Create Lead</button>
          </form>
        </div>
      )}

      {/* ══════════════════ CREATE TASK MODAL ══════════════════ */}
      {showCreateTask && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'
        }} onClick={e => e.target === e.currentTarget && setShowCreateTask(false)}>
          <form onSubmit={handleCreateTask} style={{
            background: '#1e2230', borderRadius: 16, width: 440, padding: 24,
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 14
          }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#f0e8c8', fontWeight: 700 }}>Schedule Follow-up Task</h3>
            <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task Title (Required)" required style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none' }} />
            <input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none' }} />
            <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} style={{ padding: '10px', background: '#181c26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none' }}>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority 🔥</option>
            </select>
            <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg, #c5a028, #f0c040)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Schedule Task</button>
          </form>
        </div>
      )}

      {/* ══════════════════ LOG INTERACTION MODAL ══════════════════ */}
      {showLogModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'
        }} onClick={e => e.target === e.currentTarget && setShowLogModal(false)}>
          <form onSubmit={handleLogInteraction} style={{
            background: '#1e2230', borderRadius: 16, width: 440, padding: 24,
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 14
          }}>
            <h3 style={{ margin: 0, fontSize: 18, color: '#f0e8c8', fontWeight: 700 }}>Log Customer Interaction</h3>
            <select value={newLog.type} onChange={e => setNewLog({ ...newLog, type: e.target.value })} style={{ padding: '10px', background: '#181c26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none' }}>
              <option value="call">Phone Call 📞</option>
              <option value="email">Email Sent 📧</option>
              <option value="meeting">In-Person Meeting 🤝</option>
              <option value="whatsapp">WhatsApp Message 💬</option>
              <option value="note">Internal Note 📝</option>
            </select>
            <input value={newLog.subject} onChange={e => setNewLog({ ...newLog, subject: e.target.value })} placeholder="Subject / Summary (Required)" required style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none' }} />
            <textarea value={newLog.notes} onChange={e => setNewLog({ ...newLog, notes: e.target.value })} placeholder="Details / Notes…" rows={3} style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', outline: 'none', resize: 'none' }} />
            <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg, #c5a028, #f0c040)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Log Interaction</button>
          </form>
        </div>
      )}

      {/* ══════════════════ AI EMAIL DRAFT MODAL ══════════════════ */}
      {showAiEmailModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)'
        }} onClick={e => e.target === e.currentTarget && setShowAiEmailModal(false)}>
          <div style={{
            background: '#181c26', borderRadius: 16, width: 560, maxWidth: '92%', padding: 24,
            border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={20} color="#c084fc" />
                <h3 style={{ margin: 0, fontSize: 18, color: '#f0e8c8', fontWeight: 800 }}>AI Sales Pitch Generator</h3>
              </div>
              <button onClick={() => setShowAiEmailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            {generatingAiEmail ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#c084fc' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} /><br />
                Drafting personalized AI sales email tailored to face shape & purchase history…
              </div>
            ) : aiEmailDraft ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#8899aa', textTransform: 'uppercase', fontWeight: 700 }}>Recipient</label>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, marginTop: 2 }}>{aiEmailDraft.customerName} ({aiEmailDraft.customerEmail})</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#8899aa', textTransform: 'uppercase', fontWeight: 700 }}>Subject</label>
                  <input value={aiEmailDraft.subject} readOnly style={{ width: '100%', boxSizing: 'border-box', padding: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 13, marginTop: 4, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#8899aa', textTransform: 'uppercase', fontWeight: 700 }}>AI Generated Pitch Body</label>
                  <textarea value={aiEmailDraft.body} readOnly rows={10} style={{ width: '100%', boxSizing: 'border-box', padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#e2e8f0', fontSize: 12, marginTop: 4, fontFamily: 'monospace', lineHeight: 1.5, outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button onClick={() => {
                    navigator.clipboard.writeText(`Subject: ${aiEmailDraft.subject}\n\n${aiEmailDraft.body}`);
                    alert('📋 AI Email copied to clipboard!');
                  }} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Copy size={15} /> Copy to Clipboard
                  </button>
                  <button onClick={() => {
                    window.location.href = `mailto:${aiEmailDraft.customerEmail}?subject=${encodeURIComponent(aiEmailDraft.subject)}&body=${encodeURIComponent(aiEmailDraft.body)}`;
                  }} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Send size={15} /> Open in Email App
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

