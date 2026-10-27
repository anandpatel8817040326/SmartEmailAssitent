import { useState, useEffect } from 'react';
import './App.css';
import AuthModal from './AuthModal';
import LandingPage from './LandingPage';
import HistoryDashboard from './HistoryDashboard';

const API_BASE = 'http://localhost:8080/api/email';

const TONE_OPTIONS = [
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    icon: '💼',
    desc: 'Formal, structured, and executive business tone'
  },
  {
    id: 'CASUAL',
    name: 'Casual',
    icon: '☕',
    desc: 'Relaxed, conversational, and natural phrasing'
  },
  {
    id: 'FRIENDLY',
    name: 'Friendly',
    icon: '🤝',
    desc: 'Warm, positive, empathetic, and collaborative'
  },
  {
    id: 'URGENT',
    name: 'Urgent',
    icon: '⚡',
    desc: 'Direct, action-driven, with deadline emphasis'
  }
];

const TEMPLATE_PROMPTS = [
  {
    label: '📅 Reschedule Meeting',
    prompt: 'Need to reschedule tomorrow’s sync meeting to Friday at 3 PM due to a client conflict. Apologies for the inconvenience.',
    subject: 'Reschedule: Tomorrow’s Sync Meeting'
  },
  {
    label: '📊 Project Status Update',
    prompt: 'Phase 1 development is 100% completed. Database and AI integration are working smoothly. Ready for stakeholder demo this week.',
    subject: 'Project Milestone 1 - Completion Update'
  },
  {
    label: '📝 Proposal Follow-up',
    prompt: 'Checking in regarding the business proposal sent last Tuesday. Looking forward to knowing if there are any questions before finalizing.',
    subject: 'Following up on our recent proposal'
  },
  {
    label: '🏖️ Leave Application',
    prompt: 'Requesting casual leave on this coming Friday for personal urgent work. All pending tasks will be handed over to Rahul before leaving.',
    subject: 'Leave Request for Friday'
  }
];

function App() {
  // Authentication & Guest State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_email_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [guestMode, setGuestMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  // Active View Tab: 'studio' | 'history'
  const [activeView, setActiveView] = useState('studio');

  // Composer Form State
  const [sender, setSender] = useState(() => {
    const saved = localStorage.getItem('smart_email_sender');
    if (saved) return saved;
    try {
      const u = localStorage.getItem('smart_email_user');
      if (u) {
        const parsed = JSON.parse(u);
        return parsed.fullName ? `${parsed.fullName} <${parsed.email}>` : parsed.email;
      }
    } catch {}
    return '';
  });
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('PROFESSIONAL');
  const [generatedBody, setGeneratedBody] = useState('');
  const [draftId, setDraftId] = useState(null);

  const handleSenderChange = (val) => {
    setSender(val);
    localStorage.setItem('smart_email_sender', val);
  };

  // Generation & Dispatch State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  // System & History Data
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({
    backendOnline: false,
    ollamaOnline: false,
    model: 'llama3.2',
    smtpConfigured: false,
    smtpUser: ''
  });

  const [alert, setAlert] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isVerifyingSmtp, setIsVerifyingSmtp] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [verifySuccess, setVerifySuccess] = useState(null);

  const [smtpForm, setSmtpForm] = useState(() => ({
    host: 'smtp.gmail.com',
    port: 587,
    username: localStorage.getItem('smart_email_smtp_user') || '',
    password: localStorage.getItem('smart_email_smtp_pass') || '',
    fromEmail: ''
  }));

  // Auto-sync credentials and load history on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('smart_email_smtp_user');
    const savedPass = localStorage.getItem('smart_email_smtp_pass');
    if (savedUser && savedPass) {
      fetch(`${API_BASE}/smtp-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: 'smtp.gmail.com',
          port: 587,
          username: savedUser,
          password: savedPass
        })
      }).then(() => checkSystemStatus()).catch(() => checkSystemStatus());
    } else {
      checkSystemStatus();
    }
    fetchHistory();
  }, []);

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  const checkSystemStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        setStatus(prev => ({ ...prev, backendOnline: false }));
      }
    } catch {
      setStatus(prev => ({ ...prev, backendOnline: false, ollamaOnline: false }));
    }
  };

  const fetchHistory = async (targetUserId) => {
    try {
      const uId = targetUserId !== undefined ? targetUserId : (currentUser ? currentUser.id : null);
      const url = uId ? `${API_BASE}/history?userId=${uId}` : `${API_BASE}/history`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setGuestMode(false);
    localStorage.setItem('smart_email_user', JSON.stringify(user));
    if (user.email && !sender) {
      handleSenderChange(user.fullName ? `${user.fullName} <${user.email}>` : user.email);
    }
    showAlert('success', `Welcome back, ${user.fullName || user.email}!`);
    fetchHistory(user.id);
    setActiveView('studio');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGuestMode(false);
    localStorage.removeItem('smart_email_user');
    setSender('');
    setActiveView('home');
    showAlert('info', 'Logged out successfully. Returned to Home Page.');
  };

  const handleApplyTemplate = (tmpl) => {
    setPrompt(tmpl.prompt);
    if (!subject) setSubject(tmpl.subject);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showAlert('error', 'Please write rough email notes or prompt points before generating.');
      return;
    }

    setIsGenerating(true);
    setAlert(null);

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          tone: selectedTone,
          userId: currentUser ? currentUser.id : null,
          sender,
          recipient,
          subject
        })
      });

      if (!res.ok) {
        throw new Error('Server returned an error while generating email.');
      }

      const data = await res.json();
      setGeneratedBody(data.generatedContent);
      if (data.subject) {
        setSubject(data.subject);
      }
      setDraftId(data.draftId);
      showAlert('success', `✨ AI drafted email in ${selectedTone} tone using Llama 3.2!`);
      fetchHistory(currentUser ? currentUser.id : null);
    } catch (err) {
      showAlert('error', 'Failed to generate email: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!recipient.trim()) {
      showAlert('error', 'Please enter a recipient email address (To).');
      return;
    }
    if (!generatedBody.trim()) {
      showAlert('error', 'Please generate or write an email body before sending.');
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch(`${API_BASE}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          userId: currentUser ? currentUser.id : null,
          sender,
          recipient,
          subject: subject || 'No Subject',
          body: generatedBody,
          tone: selectedTone
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showAlert('success', data.message);
        fetchHistory(currentUser ? currentUser.id : null);
      } else {
        showAlert('error', data.message || 'Failed to deliver email.');
      }
    } catch (err) {
      showAlert('error', 'Error sending email: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedBody) return;
    const fullText = subject ? `Subject: ${subject}\n\n${generatedBody}` : generatedBody;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadDraft = (item) => {
    if (item.sender) {
      handleSenderChange(item.sender);
    }
    setRecipient(item.recipient || '');
    setSubject(item.subject || '');
    setPrompt(item.prompt || '');
    setGeneratedBody(item.generatedContent || '');
    setSelectedTone(item.tone || 'PROFESSIONAL');
    setDraftId(item.id);
    setActiveView('studio'); // Switch immediately to AI Studio so loaded draft is visible!
    showAlert('info', `Loaded email #${item.id} into Studio.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (e, id) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory(currentUser ? currentUser.id : null);
        if (draftId === id) setDraftId(null);
        showAlert('info', 'Draft removed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifySmtp = async (e) => {
    e.preventDefault();
    if (!smtpForm.username.trim() || !smtpForm.password.trim()) {
      setVerifyError('Please enter both your Gmail address and 16-character App Password.');
      return;
    }

    setIsVerifyingSmtp(true);
    setVerifyError(null);
    setVerifySuccess(null);

    try {
      const res = await fetch(`${API_BASE}/smtp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifySuccess(data.message);
        localStorage.setItem('smart_email_smtp_user', smtpForm.username.trim());
        localStorage.setItem('smart_email_smtp_pass', smtpForm.password.trim());
        if (!sender) {
          handleSenderChange(smtpForm.username.trim());
        }
        showAlert('success', '✅ Gmail credentials verified & active for live delivery!');
        setTimeout(() => {
          setShowSettings(false);
          setVerifySuccess(null);
        }, 1200);
        checkSystemStatus();
      } else {
        setVerifyError(data.message || 'Verification failed. Please check your credentials.');
      }
    } catch (err) {
      setVerifyError('Error connecting to backend server: ' + err.message);
    } finally {
      setIsVerifyingSmtp(false);
    }
  };

  const handleClearSmtp = async () => {
    try {
      await fetch(`${API_BASE}/smtp-clear`, { method: 'POST' });
      localStorage.removeItem('smart_email_smtp_user');
      localStorage.removeItem('smart_email_smtp_pass');
      setSmtpForm(prev => ({ ...prev, username: '', password: '' }));
      setVerifyError(null);
      setVerifySuccess(null);
      showAlert('info', 'Reverted to Sandbox Mode.');
      checkSystemStatus();
      setShowSettings(false);
    } catch (err) {
      console.error(err);
    }
  };

  // IF USER IS NOT LOGGED IN AND NOT IN GUEST DEMO MODE -> SHOW LANDING / HOME PAGE
  if (!currentUser && !guestMode) {
    return (
      <>
        <LandingPage
          onOpenAuth={(tab) => {
            setAuthModalTab(tab);
            setShowAuthModal(true);
          }}
          onExploreGuest={() => {
            setGuestMode(true);
            setActiveView('studio');
          }}
          systemStatus={status}
          currentUser={currentUser}
          onSwitchToStudio={() => setActiveView('studio')}
          onSwitchToHistory={() => setActiveView('history')}
        />

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
          initialTab={authModalTab}
        />
      </>
    );
  }

  // MAIN APPLICATION DASHBOARD (Studio + History Views)
  return (
    <div className="app-container">
      {/* Top Application Header */}
      <header className="app-header">
        <div className="brand-wrapper" onClick={() => setActiveView('home')} title="Go to Home Overview">
          <div className="brand-logo-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
          </div>
          <div className="brand-info">
            <h1>SmartMail AI</h1>
            <p>
              <span>Enterprise Edition</span>
              <span>•</span>
              <span>Llama 3.2</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Home vs Studio vs History Dashboard) */}
        <div className="nav-view-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${activeView === 'home' ? 'active' : ''}`}
            onClick={() => setActiveView('home')}
          >
            <span>🏠</span>
            <span>Home</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeView === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveView('studio')}
          >
            <span>✍️</span>
            <span>AI Studio</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeView === 'history' ? 'active' : ''}`}
            onClick={() => setActiveView('history')}
          >
            <span>📊</span>
            <span>History Dashboard</span>
            <span className="tab-counter-badge">{history.length}</span>
          </button>
        </div>

        {/* Right Status & Profile Controls */}
        <div className="header-status-group">
          <div className="status-badge" title="Local Ollama AI Engine">
            <span className={`status-dot ${status.ollamaOnline ? 'online' : 'offline'}`}></span>
            <span>Ollama: {status.ollamaOnline ? status.model : 'Offline'}</span>
          </div>

          <button 
            type="button"
            className="btn-icon-label" 
            onClick={() => setShowSettings(true)}
            title="Configure SMTP Delivery"
          >
            ⚙️ {status.smtpConfigured ? 'SMTP Live' : 'SMTP Setup'}
          </button>

          {currentUser ? (
            <div className="user-profile-badge">
              <div className="user-avatar-circle" title={currentUser.fullName}>
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-badge-info">
                <span className="user-badge-name">{currentUser.fullName}</span>
                <span className="user-badge-meta">
                  {currentUser.email || currentUser.contactNumber}
                </span>
              </div>
              <button className="btn-logout" onClick={handleLogout} title="Sign Out">
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge-tag casual" style={{ fontSize: '0.75rem' }}>Demo Mode</span>
              <button
                type="button"
                className="btn-primary-action"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => { setAuthModalTab('login'); setShowAuthModal(true); }}
              >
                <span>🔐</span> Sign In
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Global Alert Notification */}
      {alert && (
        <div className={`alert-banner ${alert.type}`}>
          <span>{alert.text}</span>
          <button className="btn-close" onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      {/* VIEW 0: HOME / LANDING PAGE */}
      {activeView === 'home' && (
        <LandingPage
          onOpenAuth={(tab) => {
            setAuthModalTab(tab);
            setShowAuthModal(true);
          }}
          onExploreGuest={() => {
            setGuestMode(true);
            setActiveView('studio');
          }}
          systemStatus={status}
          currentUser={currentUser}
          onSwitchToStudio={() => setActiveView('studio')}
          onSwitchToHistory={() => setActiveView('history')}
        />
      )}

      {/* VIEW 1: AI STUDIO COMPOSER & PREVIEW */}
      {activeView === 'studio' && (
        <main className="main-workspace">
          {/* Left Column: Composer */}
          <section className="glass-panel">
            <div className="panel-header">
              <h2>
                <span>✍️</span> Compose & Tone Selection
              </h2>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                onClick={() => setActiveView('history')}
              >
                <span>📊</span> View History ({history.length})
              </button>
            </div>

            {/* Sender & Recipient Email Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div className="input-field-group" style={{ marginBottom: 0 }}>
                <label className="field-label" htmlFor="sender-input">
                  <span>Sender (Your Email / Name)</span>
                  <span style={{ fontSize: '0.72rem', textTransform: 'none', color: 'var(--accent-purple)' }}>
                    From / Reply-To
                  </span>
                </label>
                <div className="text-input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="sender-input"
                    type="text"
                    className="text-input"
                    placeholder="e.g. yourname@company.com"
                    value={sender}
                    onChange={(e) => handleSenderChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-field-group" style={{ marginBottom: 0 }}>
                <label className="field-label" htmlFor="recipient-input">
                  <span>Send To (Recipient Email) *</span>
                  <span style={{ fontSize: '0.72rem', textTransform: 'none', color: 'var(--accent-cyan)' }}>
                    Target Inbox
                  </span>
                </label>
                <div className="text-input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    id="recipient-input"
                    type="email"
                    className="text-input"
                    placeholder="e.g. client@example.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Subject Line */}
            <div className="input-field-group">
              <label className="field-label" htmlFor="subject-input">
                <span>Email Subject (Optional - AI can generate)</span>
              </label>
              <div className="text-input-wrapper">
                <span className="input-icon">📌</span>
                <input
                  id="subject-input"
                  type="text"
                  className="text-input"
                  placeholder="e.g. Quarterly Review Meeting / Project Deliverables"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            {/* Tone Selector Grid */}
            <div className="input-field-group">
              <label className="field-label">
                <span>Select Tone (AI Persona)</span>
                <span style={{ color: 'var(--primary-light)' }}>
                  {TONE_OPTIONS.find(t => t.id === selectedTone)?.name} Mode
                </span>
              </label>
              <div className="tone-selector-grid">
                {TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    id={`tone-btn-${tone.id.toLowerCase()}`}
                    className={`tone-card ${selectedTone === tone.id ? 'active' : ''}`}
                    onClick={() => setSelectedTone(tone.id)}
                  >
                    <div className="tone-card-top">
                      <span className="tone-icon">{tone.icon}</span>
                      <span className="tone-title">{tone.name}</span>
                    </div>
                    <span className="tone-desc">{tone.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Idea Templates */}
            <div className="input-field-group">
              <label className="field-label">
                <span>Quick Templates</span>
              </label>
              <div className="quick-ideas-wrapper">
                {TEMPLATE_PROMPTS.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-chip"
                    onClick={() => handleApplyTemplate(tmpl)}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Raw Prompt / Notes Input */}
            <div className="input-field-group">
              <label className="field-label" htmlFor="prompt-input">
                <span>Raw Notes / Rough Thoughts *</span>
                <span style={{ fontSize: '0.75rem', textTransform: 'none', color: 'var(--text-muted)' }}>
                  {prompt.length} chars
                </span>
              </label>
              <textarea
                id="prompt-input"
                className="textarea-input"
                placeholder="Type rough points or bullet notes... e.g.:
- Tell Rahul to finish the finance report by tomorrow 5 PM
- Need it ready before the investor call
- Ask if he needs extra assistance"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {/* Generate Action Button */}
            <button
              id="btn-generate-ai"
              type="button"
              className="btn-generate"
              onClick={handleGenerate}
              disabled={isGenerating || !status.backendOnline}
            >
              {isGenerating ? (
                <>
                  <div className="spinner"></div>
                  <span>Generating with Llama 3.2...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Transform to {TONE_OPTIONS.find(t => t.id === selectedTone)?.name} Email</span>
                </>
              )}
            </button>
          </section>

          {/* Right Column: Draft Preview & Send */}
          <section className="glass-panel">
            <div className="panel-header">
              <h2>
                <span>📨</span> Polished Draft & Send
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge-tag ${selectedTone.toLowerCase()}`}>
                  {selectedTone}
                </span>
                {draftId && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Draft #{draftId}
                  </span>
                )}
              </div>
            </div>

            {/* Editable Subject */}
            <div className="input-field-group">
              <label className="field-label" htmlFor="preview-subject-input">
                <span>Final Subject Line</span>
              </label>
              <input
                id="preview-subject-input"
                type="text"
                className="text-input no-icon"
                placeholder="AI-generated subject will appear here..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Editable Body */}
            <div className="input-field-group">
              <label className="field-label" htmlFor="preview-body-input">
                <span>Email Body (Editable)</span>
                <span style={{ fontSize: '0.75rem', textTransform: 'none', color: 'var(--text-muted)' }}>
                  {generatedBody ? `${generatedBody.split(/\s+/).filter(Boolean).length} words` : 'Empty'}
                </span>
              </label>
              <textarea
                id="preview-body-input"
                className="preview-body-textarea"
                placeholder="Your AI-generated email will appear here ready to review, edit, and send..."
                value={generatedBody}
                onChange={(e) => setGeneratedBody(e.target.value)}
              />
            </div>

            {/* Preview Toolbar */}
            <div className="preview-toolbar">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  id="btn-copy-clipboard"
                  className="btn-secondary"
                  onClick={handleCopyToClipboard}
                  disabled={!generatedBody}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Draft'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setGeneratedBody('');
                    setDraftId(null);
                  }}
                  disabled={!generatedBody}
                >
                  🧹 Clear
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>From: <strong style={{ color: sender ? 'var(--accent-purple)' : 'var(--text-muted)' }}>{sender || 'Default Sender'}</strong></span>
                <span>To: <strong style={{ color: recipient ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{recipient || 'Not specified yet'}</strong></span>
              </div>
            </div>

            {/* Send Email Action Button */}
            <button
              id="btn-send-email"
              type="button"
              className="btn-send"
              onClick={handleSendEmail}
              disabled={isSending || !generatedBody || !recipient}
            >
              {isSending ? (
                <>
                  <div className="spinner"></div>
                  <span>Dispatching Email...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Send Email {recipient ? `to ${recipient.split('@')[0]}` : ''}</span>
                </>
              )}
            </button>
          </section>
        </main>
      )}

      {/* VIEW 2: DEDICATED HISTORY & OUTBOX DASHBOARD */}
      {activeView === 'history' && (
        <HistoryDashboard
          history={history}
          onLoadDraft={handleLoadDraft}
          onDeleteDraft={handleDeleteHistory}
          onRefresh={() => fetchHistory()}
          onSwitchToStudio={() => setActiveView('studio')}
          currentUser={currentUser}
        />
      )}

      {/* SMTP Configuration & Self-Verification Modal */}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3>⚡ Connect & Verify Gmail (Live Dispatch)</h3>
              <button className="btn-close" onClick={() => setShowSettings(false)}>×</button>
            </div>

            {/* Quick 3-Step Guide Card */}
            <div className="smtp-guide-card">
              <div className="guide-title">
                <span>🔐</span> How to get your 16-character Google App Password:
              </div>
              <ol className="guide-steps">
                <li>
                  Click below to open Google Security (Make sure <strong>2-Step Verification</strong> is ON):
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-google-link"
                    >
                      <span>🚀 Open Google App Passwords Page ↗</span>
                    </a>
                  </div>
                </li>
                <li>In <em>"App name"</em>, type <strong>Smart Email</strong> and click <strong>Create</strong>.</li>
                <li>Copy the <strong>16-letter yellow password</strong> (e.g. <code>abcd efgh ijkl mnop</code>) and paste it below.</li>
              </ol>
            </div>

            {/* Live Connection Status Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              background: status.smtpConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${status.smtpConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              color: status.smtpConfigured ? '#34d399' : '#f59e0b'
            }}>
              <span>
                {status.smtpConfigured ? `🟢 Active Live SMTP: ${status.smtpUser}` : '🟡 Currently in Safe Sandbox / Simulation Mode'}
              </span>
              {status.smtpConfigured && (
                <button
                  type="button"
                  onClick={handleClearSmtp}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fb7185',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Disconnect (Use Sandbox)
                </button>
              )}
            </div>

            {/* In-Modal Error / Success Notice */}
            {verifyError && (
              <div className="alert-banner error" style={{ fontSize: '0.82rem', padding: '10px 14px' }}>
                <span>❌ {verifyError}</span>
              </div>
            )}
            {verifySuccess && (
              <div className="alert-banner success" style={{ fontSize: '0.82rem', padding: '10px 14px' }}>
                <span>{verifySuccess}</span>
              </div>
            )}

            <form onSubmit={handleVerifySmtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-field-group">
                <label className="field-label">Your Gmail Address *</label>
                <div className="text-input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    className="text-input"
                    value={smtpForm.username}
                    onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })}
                    placeholder="e.g. yourname@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label className="field-label">
                  <span>16-Character App Password *</span>
                  <span style={{ fontSize: '0.75rem', textTransform: 'none', color: 'var(--text-muted)' }}>
                    Spaces are automatically handled
                  </span>
                </label>
                <div className="text-input-wrapper">
                  <span className="input-icon">🔑</span>
                  <input
                    type="password"
                    className="text-input"
                    value={smtpForm.password}
                    onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })}
                    placeholder="e.g. abcd efgh ijkl mnop"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-generate"
                  style={{ padding: '10px 22px', fontSize: '0.9rem' }}
                  disabled={isVerifyingSmtp}
                >
                  {isVerifyingSmtp ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                      <span>Verifying with Google...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ Test & Verify Connection</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal for Email & Contact Number Login / Registration */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        initialTab={authModalTab}
      />
    </div>
  );
}

export default App;
