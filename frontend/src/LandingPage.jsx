import { useState } from 'react';

function LandingPage({ onOpenAuth, onExploreGuest, systemStatus, currentUser, onSwitchToStudio, onSwitchToHistory }) {
  const [activePreviewTone, setActivePreviewTone] = useState('PROFESSIONAL');

  const DEMO_PREVIEWS = {
    PROFESSIONAL: {
      title: '💼 Professional Mode',
      badge: 'Executive & Formal',
      subject: 'Update: Q3 Project Deliverables & Timeline Finalization',
      body: `Dear Mr. Sharma,\n\nI am writing to formally provide an update on the Q3 milestones. All backend API modules and database integrations have been successfully finalized and verified in our staging environment.\n\nPlease let me know your availability for a 15-minute sync on Thursday to review the stakeholder presentation.\n\nBest regards,\nAnand Patel\nTechnical Lead`
    },
    FRIENDLY: {
      title: '🤝 Friendly Mode',
      badge: 'Warm & Empathetic',
      subject: 'Quick check-in on the Q3 milestones! 😊',
      body: `Hey Rahul!\n\nHope your week is off to a great start! Just wanted to share the good news—we’ve wrapped up all backend APIs and database tests ahead of schedule.\n\nWhenever you get a chance, let's catch up over coffee or a quick call on Thursday. Have a great day ahead!\n\nCheers,\nAnand`
    },
    CASUAL: {
      title: '☕ Casual Mode',
      badge: 'Relaxed & Direct',
      subject: 'Quick heads-up regarding Q3 tasks',
      body: `Hi Rahul,\n\nJust touching base—we finished up all the backend work and database tasks today. Everything is running smoothly.\n\nLet’s sync up briefly on Thursday if that works for you. Catch you later!\n\nBest,\nAnand`
    },
    URGENT: {
      title: '⚡ Urgent Mode',
      badge: 'High-Priority & Deadline',
      subject: 'URGENT: Action Required for Q3 Milestone Review by Thursday',
      body: `Dear Team,\n\nAll critical backend components and database pipelines are now complete. We must conduct the final stakeholder sign-off by Thursday at 3:00 PM.\n\nPlease review the attached staging report immediately and confirm your sign-off by 12:00 PM tomorrow.\n\nRegards,\nAnand Patel`
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Top Navbar */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="brand-logo-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
          </div>
          <div className="landing-brand-text">
            <h2>SmartMail AI</h2>
            <span className="brand-tag">Enterprise Edition</span>
          </div>
        </div>

        <div className="landing-nav-right">
          <div className="status-badge" title="AI Model Status">
            <span className={`status-dot ${systemStatus?.ollamaOnline ? 'online' : 'offline'}`}></span>
            <span>{systemStatus?.ollamaOnline ? `Llama 3.2 Active` : 'AI Offline'}</span>
          </div>

          {currentUser ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className="user-badge-name" style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                👤 {currentUser.fullName || currentUser.email}
              </span>
              <button
                type="button"
                className="btn-primary-action"
                onClick={onSwitchToStudio}
              >
                <span>✍️ Open AI Studio</span>
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn-landing-signin"
                onClick={() => onOpenAuth('login')}
              >
                <span>🔐</span> Sign In
              </button>

              <button
                type="button"
                className="btn-landing-cta"
                onClick={() => onOpenAuth('register')}
              >
                <span>✨</span> Get Started Free
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-pill-badge">
          <span className="pill-dot"></span>
          <span>Next-Gen Enterprise AI Assistant • Powered by Local Ollama & Spring Boot</span>
        </div>

        <h1 className="hero-title">
          Write, Polish & Dispatch <br />
          <span className="gradient-text">High-Impact Emails</span> in Seconds
        </h1>

        <p className="hero-subtitle">
          Transform rough bullet notes into executive-ready emails across 4 adaptive tones.
          100% private with local Ollama, dual H2/MySQL persistence, and instant Gmail SMTP delivery.
        </p>

        {/* Hero Actions */}
        <div className="hero-action-row">
          {currentUser ? (
            <>
              <button
                type="button"
                className="btn-hero-primary"
                onClick={onSwitchToStudio}
              >
                <span>🚀 Go to AI Studio ({currentUser.fullName || 'User'})</span>
              </button>
              <button
                type="button"
                className="btn-hero-secondary"
                onClick={onSwitchToHistory}
              >
                <span>📊 View History & Analytics</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-hero-primary"
                onClick={() => onOpenAuth('register')}
              >
                <span>🚀 Create Account (Email or Phone)</span>
              </button>

              <button
                type="button"
                className="btn-hero-secondary"
                onClick={() => onOpenAuth('login')}
              >
                <span>🔐 Existing User Sign In</span>
              </button>

              <button
                type="button"
                className="btn-hero-ghost"
                onClick={onExploreGuest}
                title="Explore without creating an account"
              >
                <span>⚡ Instant Demo Mode</span>
              </button>
            </>
          )}
        </div>

        {/* Live Metrics Row */}
        <div className="landing-stats-bar">
          <div className="landing-stat-item">
            <span className="stat-number">4</span>
            <span className="stat-label">AI Persona Tones</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat-item">
            <span className="stat-number">~1.2s</span>
            <span className="stat-label">Local Ollama Latency</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Private & Self-Hosted</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat-item">
            <span className="stat-number">2-Way</span>
            <span className="stat-label">Email & Phone Auth</span>
          </div>
        </div>

        {/* Interactive Live Demo Preview Card */}
        <div className="hero-preview-card">
          <div className="preview-card-header">
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="preview-tone-tabs">
              {['PROFESSIONAL', 'FRIENDLY', 'CASUAL', 'URGENT'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`preview-tab-chip ${activePreviewTone === t ? 'active' : ''}`}
                  onClick={() => setActivePreviewTone(t)}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="preview-card-body">
            <div className="preview-input-side">
              <div className="preview-side-label">
                <span>📝</span> Raw Rough Notes (Input)
              </div>
              <div className="preview-notes-box">
                <p>• Tell Rahul backend APIs and DB tests done</p>
                <p>• Need quick sync on Thursday for stakeholder review</p>
                <p>• Ask him to check staging report</p>
              </div>
              <div className="preview-meta-pill">
                <span>⚡ AI Latency: ~1.2s • Llama 3.2</span>
              </div>
            </div>

            <div className="preview-divider-arrow">➔</div>

            <div className="preview-output-side">
              <div className="preview-side-label">
                <span>✨</span> AI Polished Output ({DEMO_PREVIEWS[activePreviewTone].title})
              </div>
              <div className="preview-subject-line">
                <strong>Subject:</strong> {DEMO_PREVIEWS[activePreviewTone].subject}
              </div>
              <div className="preview-output-text">
                {DEMO_PREVIEWS[activePreviewTone].body}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="landing-features-grid">
        <div className="feature-card">
          <div className="feature-icon-box icon-purple">💼</div>
          <h3>4 AI Tone Personas</h3>
          <p>Instantly adapt your message for executives (Professional), team members (Friendly), casual check-ins, or critical deadlines (Urgent).</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box icon-cyan">🔒</div>
          <h3>100% Private & Local AI</h3>
          <p>Zero third-party cloud leaks. All email generation runs locally on your machine via Ollama with zero token subscription fees.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box icon-emerald">📱</div>
          <h3>Email & Mobile Sign-In</h3>
          <p>Full flexibility for enterprise users: register and sign in effortlessly with either your corporate Email or Contact Number.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box icon-amber">📨</div>
          <h3>Live SMTP & Sandbox Mode</h3>
          <p>Deliver directly to real inboxes via verified Gmail SMTP with reply-to routing, or test freely in zero-config Sandbox Mode.</p>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="landing-footer">
        <p>SmartMail AI Enterprise • Built with Spring Boot 3.4 (Java 21), React + Vite & Ollama Llama 3.2</p>
        <div className="footer-links">
          <button type="button" className="footer-btn" onClick={() => onOpenAuth('login')}>Sign In</button>
          <span>•</span>
          <button type="button" className="footer-btn" onClick={() => onOpenAuth('register')}>Register</button>
          <span>•</span>
          <button type="button" className="footer-btn" onClick={onExploreGuest}>Live Studio</button>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
