import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8080/api/email';

const TONE_OPTIONS = [
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    icon: '💼',
    desc: 'Formal, structured, and business-ready tone'
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
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('PROFESSIONAL');
  const [generatedBody, setGeneratedBody] = useState('');
  const [draftId, setDraftId] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

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
  const [smtpForm, setSmtpForm] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    fromEmail: ''
  });

  // Fetch status & history on mount
  useEffect(() => {
    checkSystemStatus();
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

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleApplyTemplate = (tmpl) => {
    setPrompt(tmpl.prompt);
    if (!subject) setSubject(tmpl.subject);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showAlert('error', 'Please write a prompt or rough email notes before generating.');
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
          recipient,
          subject
        })
      });

      if (!res.ok) {
        throw new Error('Server returned error while generating email.');
      }

      const data = await res.json();
      setGeneratedBody(data.generatedContent);
      if (data.subject) {
        setSubject(data.subject);
      }
      setDraftId(data.draftId);
      showAlert('success', `✨ AI drafted email in ${selectedTone} tone using Llama 3.2!`);
      fetchHistory();
    } catch (err) {
      showAlert('error', 'Failed to generate email: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!recipient.trim()) {
      showAlert('error', 'Please enter a recipient email address.');
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
          recipient,
          subject: subject || 'No Subject',
          body: generatedBody,
          tone: selectedTone
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showAlert('success', data.message);
        fetchHistory();
      } else {
        showAlert('error', data.message || 'Failed to send email.');
      }
    } catch (err) {
      showAlert('error', 'Error sending email: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedBody) return;
    const fullText = `Subject: ${subject}\n\n${generatedBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadDraft = (item) => {
    setRecipient(item.recipient || '');
    setSubject(item.subject || '');
    setPrompt(item.prompt || '');
    setGeneratedBody(item.generatedContent || '');
    setSelectedTone(item.tone || 'PROFESSIONAL');
    setDraftId(item.id);
    showAlert('info', `Loaded email #${item.id} into editor.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
        if (draftId === id) setDraftId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/smtp-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpForm)
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'SMTP settings updated successfully!');
        setShowSettings(false);
        checkSystemStatus();
      }
    } catch (err) {
      showAlert('error', 'Failed to update SMTP: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-logo-glow">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
          </div>
          <div className="brand-info">
            <h1>Smart AI Email Assistant</h1>
            <p>
              <span>Spring Boot 3.4</span>
              <span>•</span>
              <span>Local Ollama (Llama 3.2)</span>
              <span>•</span>
              <span>Direct Mail Dispatch</span>
            </p>
          </div>
        </div>

        <div className="header-status-group">
          <div className="status-badge" title="Local Ollama AI Engine">
            <span className={`status-dot ${status.ollamaOnline ? 'online' : 'offline'}`}></span>
            <span>Ollama: {status.ollamaOnline ? status.model : 'Offline'}</span>
          </div>

          <div className="status-badge" title="Spring Boot Backend">
            <span className={`status-dot ${status.backendOnline ? 'online' : 'offline'}`}></span>
            <span>API: {status.backendOnline ? ':8080' : 'Disconnected'}</span>
          </div>

          <button 
            className="btn-icon-label" 
            onClick={() => setShowSettings(true)}
            title="Configure SMTP Email Delivery"
          >
            ⚙️ {status.smtpConfigured ? 'SMTP Live' : 'SMTP Setup'}
          </button>
        </div>
      </header>

      {/* Global Alert Notification */}
      {alert && (
        <div className={`alert-banner ${alert.type}`}>
          <span>{alert.text}</span>
          <button className="btn-close" onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <main className="main-workspace">
        {/* Left Column: Composer & Tone Selection */}
        <section className="glass-panel">
          <div className="panel-header">
            <h2>
              <span>✍️</span> Compose & Tone Selection
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Step 1: Input details & Choose Tone
            </span>
          </div>

          {/* Recipient Email */}
          <div className="input-field-group">
            <label className="field-label" htmlFor="recipient-input">
              <span>Send To (Recipient Email) *</span>
              <span style={{ fontSize: '0.75rem', textTransform: 'none', color: 'var(--accent-cyan)' }}>
                Direct Delivery
              </span>
            </label>
            <div className="text-input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="recipient-input"
                type="email"
                className="text-input"
                placeholder="e.g. rahul.sharma@example.com, manager@company.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
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

          {/* Tone Selector */}
          <div className="input-field-group">
            <label className="field-label">
              <span>Select Tone (AI Persona)</span>
              <span style={{ color: 'var(--primary)' }}>
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

          {/* Raw Prompt / Notes */}
          <div className="input-field-group">
            <label className="field-label" htmlFor="prompt-input">
              <span>Raw Notes / Thoughts / Rough Points *</span>
              <span style={{ fontSize: '0.75rem', textTransform: 'none', color: 'var(--text-muted)' }}>
                {prompt.length} chars
              </span>
            </label>
            <textarea
              id="prompt-input"
              className="textarea-input"
              placeholder="Type rough points, bullet notes, or a quick message in Hindi/English... e.g.:
- Tell Rahul to finish the finance report by tomorrow 5 PM
- Need it ready before the investor call
- Ask if he needs extra assistance"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <button
            id="btn-generate-ai"
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

        {/* Right Column: AI Draft Preview & Send */}
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
              placeholder="Email subject will appear here..."
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

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Recipient: <strong style={{ color: recipient ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                {recipient || 'Not specified yet'}
              </strong>
            </span>
          </div>

          {/* Send Email Action Button */}
          <button
            id="btn-send-email"
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
                <span>Send Email to {recipient ? recipient.split('@')[0] : 'Recipient'}</span>
              </>
            )}
          </button>
        </section>
      </main>

      {/* Bottom Section: Sent & Drafts History */}
      <section className="history-section">
        <div className="panel-header">
          <h2>
            <span>📜</span> Sent Emails & Drafts History ({history.length})
          </h2>
          <button className="btn-secondary" onClick={fetchHistory} style={{ fontSize: '0.8rem' }}>
            🔄 Refresh History
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No emails drafted or sent yet. Create your first email above!
          </div>
        ) : (
          <div className="history-grid">
            {history.map((item) => (
              <div
                key={item.id}
                className="history-card"
                onClick={() => handleLoadDraft(item)}
                title="Click to load into editor"
              >
                <div className="history-card-top">
                  <span className="history-recipient">To: {item.recipient || 'No recipient'}</span>
                  <span className={`badge-tag ${(item.tone || 'professional').toLowerCase()}`}>
                    {item.tone || 'PROFESSIONAL'}
                  </span>
                </div>

                <div className="history-subject">{item.subject || 'No Subject'}</div>
                <div className="history-snippet">{item.generatedContent || item.prompt}</div>

                <div className="history-card-footer">
                  <span style={{ color: item.status?.includes('SENT') ? '#34d399' : '#f59e0b' }}>
                    ● {item.status || 'DRAFT'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    <button
                      className="btn-close"
                      style={{ fontSize: '0.9rem', padding: '0 4px' }}
                      onClick={(e) => handleDeleteHistory(e, item.id)}
                      title="Delete draft"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SMTP Configuration Modal */}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ Email & SMTP Settings</h3>
              <button className="btn-close" onClick={() => setShowSettings(false)}>×</button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Configure your Gmail or SMTP credentials for direct live email dispatch. If left empty, the application runs smoothly in <strong>Sandbox / Simulation Mode</strong> with full database logging.
            </p>

            <form onSubmit={handleSaveSmtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-field-group">
                <label className="field-label">SMTP Host</label>
                <input
                  type="text"
                  className="text-input no-icon"
                  value={smtpForm.host}
                  onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="input-field-group">
                <label className="field-label">SMTP Port</label>
                <input
                  type="number"
                  className="text-input no-icon"
                  value={smtpForm.port}
                  onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) || 587 })}
                  placeholder="587"
                />
              </div>

              <div className="input-field-group">
                <label className="field-label">Gmail / Email Address</label>
                <input
                  type="email"
                  className="text-input no-icon"
                  value={smtpForm.username}
                  onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="input-field-group">
                <label className="field-label">
                  <span>App Password</span>
                  <a 
                    href="https://myaccount.google.com/apppasswords" 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'none' }}
                  >
                    Generate Google App Password ↗
                  </a>
                </label>
                <input
                  type="password"
                  className="text-input no-icon"
                  value={smtpForm.password}
                  onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })}
                  placeholder="16-character Google App Password"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowSettings(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-generate" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
