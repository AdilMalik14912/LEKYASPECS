const React = require('react');
const { useState, useEffect, useRef } = React;
const { useRouter } = require('next/router');
const Head = require('next/head').default;
const Link = require('next/link').default;
const { useAuth, useToast } = require('./_app');
const {
  Briefcase, MessageSquare, User, ClipboardList, Send, Calendar, Clock, Lock, CheckCircle2,
  AlertCircle, LogOut, Loader2, Sparkles, Phone, Mail, Camera, FileText
} = require('lucide-react');

const API_BASE = typeof window !== 'undefined'
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '')
  : '';

export default function HoStaffDashboard() {
  const { user, token, logout, updateProfile, authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Navigation
  const [activeTab, setActiveTab] = useState('reports'); // reports | chat | profile

  // Reports tab state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  // New report form state
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [tasksPending, setTasksPending] = useState('');
  const [issuesFaced, setIssuesFaced] = useState('');

  // Profile update state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Auth gate check
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/account');
      return;
    }
    if (user && user.role !== 'ho_staff' && user.role !== 'admin') {
      router.push('/');
      return;
    }
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAvatar(user.avatar || '');
    }
  }, [user, authLoading]);

  // Load report history
  useEffect(() => {
    if (token) {
      fetchReportHistory();
    }
  }, [token]);

  const fetchReportHistory = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ho-staff/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!tasksCompleted.trim()) {
      showToast('Please detail the tasks you completed.', 'error');
      return;
    }

    setSubmittingReport(true);
    try {
      const res = await fetch(`${API_BASE}/api/ho-staff/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tasks_completed: tasksCompleted,
          tasks_pending: tasksPending,
          issues_faced: issuesFaced
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('EOD Report submitted successfully!', 'success');
        setTasksCompleted('');
        setTasksPending('');
        setIssuesFaced('');
        fetchReportHistory();
      } else {
        showToast(data.message || 'Failed to submit report', 'error');
      }
    } catch (err) {
      showToast('Network error, please try again.', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size must be less than 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profilePassword && profilePassword !== profileConfirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      const body = {
        name: profileName,
        phone: profilePhone,
        avatar: profileAvatar
      };
      if (profilePassword) {
        body.password = profilePassword;
      }

      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Profile updated successfully!', 'success');
        updateProfile({ name: data.name, phone: data.phone, avatar: data.avatar });
        setProfilePassword('');
        setProfileConfirmPassword('');
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Error updating profile settings.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-sm font-semibold text-emerald-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Opening Head Office Staff Panel...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>HO Staff Hub — Specs Management</title>
        <meta name="description" content="HO Staff member console to track tasks, report work EOD, and chat with team." />
      </Head>

      <style>{`
        .staff-bg {
          min-height: 100vh;
          background: #0d1117;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
        }
        .sidebar {
          background: #161b22;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          width: 240px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          color: #8b949e;
          border-left: 3px solid transparent;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
        }
        .nav-item:hover {
          color: #e6edf3;
          background: rgba(255, 255, 255, 0.03);
        }
        .nav-item.active {
          color: #f0c040;
          background: rgba(197, 160, 40, 0.08);
          border-left-color: #f0c040;
        }
        .report-card {
          background: #161b22;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .report-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          border-color: rgba(197, 160, 40, 0.3);
        }
        .form-input {
          width: 100%;
          background: #0d1117;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #e2e8f0;
          padding: 10px 14px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: #f0c040;
        }
        .submit-btn {
          background: linear-gradient(135deg, #c5a028, #f0c040);
          color: #000;
          border: none;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.1s, opacity 0.2s;
        }
        .submit-btn:active {
          transform: scale(0.98);
        }
        .submit-btn:hover {
          opacity: 0.95;
        }
        .hover-overlay-btn {
          opacity: 0 !important;
        }
        .hover-overlay-btn:hover {
          opacity: 1 !important;
        }
        @media (max-width: 768px) {
          .layout-container {
            flex-direction: column !important;
          }
          .sidebar {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            flex-direction: row !important;
            overflow-x: auto;
          }
          .nav-item {
            flex: 1;
            padding: 12px 10px;
            justify-content: center;
            border-left: none !important;
            border-bottom: 3px solid transparent;
          }
          .nav-item.active {
            border-bottom-color: #f0c040;
          }
        }
      `}</style>

      <div className="staff-bg">
        {/* Top Navbar */}
        <header style={{
          background: '#161b22',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #c5a028, #f0c040)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Briefcase size={18} color="#000" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#f0e8c8' }}>HO Staff Hub</div>
              <div style={{ fontSize: 10, color: '#8b949e', letterSpacing: 0.5 }}>LEKYA SPECS MANAGEMENT</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>{user.name}</span>
              <span style={{ fontSize: 9, color: '#34d399', textTransform: 'uppercase', fontWeight: 'bold' }}>Head Office Staff</span>
            </div>
            <button onClick={logout} title="Log Out" style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: 8, cursor: 'pointer', color: '#f87171', display: 'flex'
            }}>
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Dashboard Main layout */}
        <div className="layout-container" style={{ display: 'flex', flex: 1 }}>
          
          {/* Sidebar */}
          <nav className="sidebar">
            <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <ClipboardList size={18} />
              <span>EOD Daily Reports</span>
            </div>
            <div className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              <MessageSquare size={18} />
              <span>Team Messaging</span>
            </div>
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <User size={18} />
              <span>My Settings</span>
            </div>
          </nav>

          {/* Main Dashboard Panels */}
          <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>

            {/* TAB 1: REPORTS TAB */}
            {activeTab === 'reports' && (
              <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 28 }}>
                  
                  {/* Submit EOD form panel */}
                  <div style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <ClipboardList size={22} color="#f0c040" />
                      <h2 style={{ fontSize: 20, fontWeight: 800 }}>Submit Daily EOD Report</h2>
                    </div>
                    <p style={{ fontSize: 12, color: '#8b949e', marginBottom: 20 }}>
                      Fill out this report to summarize work accomplishments, pending milestones, and any blockers encountered today.
                    </p>

                    <form onSubmit={handleReportSubmit} className="space-y-4">
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>Tasks Completed Today (Required)</label>
                        <textarea
                          rows={3}
                          required
                          value={tasksCompleted}
                          onChange={e => setTasksCompleted(e.target.value)}
                          placeholder="List key tasks you finished today..."
                          className="form-input"
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>Tasks Pending / Next Day Targets</label>
                        <textarea
                          rows={2}
                          value={tasksPending}
                          onChange={e => setTasksPending(e.target.value)}
                          placeholder="What tasks are remaining or planned for tomorrow..."
                          className="form-input"
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>Issues / Blocker Details</label>
                        <textarea
                          rows={2}
                          value={issuesFaced}
                          onChange={e => setIssuesFaced(e.target.value)}
                          placeholder="List any blocker, hardware/software issues or questions..."
                          className="form-input"
                          style={{ resize: 'vertical' }}
                        />
                      </div>

                      <button type="submit" disabled={submittingReport} className="submit-btn">
                        {submittingReport ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                        Submit Report
                      </button>
                    </form>
                  </div>

                  {/* Submission History */}
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: '#f0e8c8' }}>Submission History</h3>
                    
                    {reportsLoading ? (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto', color: '#f0c040' }} />
                      </div>
                    ) : reports.length === 0 ? (
                      <div style={{
                        textAlign: 'center', padding: '40px 20px', background: '#161b22',
                        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12
                      }}>
                        <p style={{ color: '#8b949e', fontSize: 13 }}>No reports submitted yet. Submit your first EOD report above!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reports.map(rep => (
                          <div key={rep.id} className="report-card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10, marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Calendar size={14} color="#f0c040" />
                                <span style={{ fontSize: 13, fontWeight: 700 }}>EOD Report: {new Date(rep.report_date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8b949e', fontSize: 11 }}>
                                <Clock size={12} />
                                <span>{new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                              <div>
                                <span style={{ fontWeight: 700, color: '#34d399', textTransform: 'uppercase', fontSize: 10, display: 'block', marginBottom: 2 }}>Tasks Completed:</span>
                                <p style={{ color: '#c9d1d9', lineHeight: 1.5 }}>{rep.tasks_completed}</p>
                              </div>
                              {rep.tasks_pending && (
                                <div>
                                  <span style={{ fontWeight: 700, color: '#60b0f0', textTransform: 'uppercase', fontSize: 10, display: 'block', marginBottom: 2 }}>Tasks Pending:</span>
                                  <p style={{ color: '#c9d1d9', lineHeight: 1.5 }}>{rep.tasks_pending}</p>
                                </div>
                              )}
                              {rep.issues_faced && (
                                <div>
                                  <span style={{ fontWeight: 700, color: '#f87171', textTransform: 'uppercase', fontSize: 10, display: 'block', marginBottom: 2 }}>Issues / Blockers:</span>
                                  <p style={{ color: '#c9d1d9', lineHeight: 1.5 }}>{rep.issues_faced}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: TEAM CHAT REDIRECT OR INTEGRATION */}
            {activeTab === 'chat' && (
              <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '60px 20px', background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(197,160,40,0.1)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 20px'
                }}>
                  <MessageSquare size={32} color="#f0c040" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Internal Team Chat Console</h2>
                <p style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px' }}>
                  Connect with the Head Office team, sales staff, rider base, and stylists. Submit screenshots, share files, and send audio reports in real-time.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
                  <Link href="/chat">
                    <a className="submit-btn" style={{ textDecoration: 'none' }}>
                      <MessageSquare size={16} /> Open Chat Panel
                    </a>
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 3: SETTINGS PROFILE EDIT */}
            {activeTab === 'profile' && (
              <div style={{ maxWidth: 600, margin: '0 auto', background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <User size={22} color="#f0c040" />
                  <h2 style={{ fontSize: 20, fontWeight: 800 }}>Profile & Account Settings</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  
                  {/* Read-Only Email Field */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>Email Address (Read-Only)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: 8 }}>
                      <Mail size={16} color="#8b949e" />
                      <span style={{ fontSize: 13, color: '#8b949e' }}>{user.email}</span>
                    </div>
                  </div>

                  {/* Profile Picture Uploader */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <label style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8b949e' }}>Profile Photo</label>
                    <div style={{ position: 'relative', width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(197,160,40,0.3)', background: '#0d1117' }}>
                      {profileAvatar ? (
                        <img src={profileAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', color: '#f0c040' }}>
                          {profileName ? profileName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', border: 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          opacity: 0, transition: 'opacity 0.2s', color: '#fff'
                        }}
                        className="hover-overlay-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Camera size={18} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="submit-btn"
                      style={{ padding: '6px 12px', fontSize: 11, background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      Choose Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                  </div>

                  {/* Name field */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>Display Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  {/* Phone field */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>Phone Number</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="form-input"
                    />
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '24px 0' }} />
                  
                  {/* Change Password inputs */}
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#f0e8c8', marginBottom: 4 }}>Change Password</h3>
                    <p style={{ fontSize: 11, color: '#8b949e', marginBottom: 14 }}>Enter a new password below to update it.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>New Password</label>
                        <input
                          type="password"
                          value={profilePassword}
                          onChange={e => setProfilePassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#8b949e', marginBottom: 6 }}>Confirm New Password</label>
                        <input
                          type="password"
                          value={profileConfirmPassword}
                          onChange={e => setProfileConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={profileLoading} className="submit-btn" style={{ width: '100%', justifyContent: 'center' }}>
                    {profileLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={15} />}
                    Save Account Settings
                  </button>

                </form>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
HoStaffDashboard.isStaffRoute = true;
