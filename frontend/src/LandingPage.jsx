import { useState } from 'react';

// 5 Comprehensive Enterprise Scenarios across 4 Tone Modes
const SCENARIOS = {
  MILESTONE: {
    id: 'MILESTONE',
    label: '📊 Project Milestone',
    title: 'Q3 Backend & Database Milestone Completion',
    rawNotes: [
      '• Backend APIs, DB migrations and security tests 100% verified in staging',
      '• Ready for stakeholder demo this Thursday at 3:00 PM',
      '• Need confirmation on attendee list and review of attached release summary',
      '• Deployed via Docker with zero downtime'
    ],
    tones: {
      PROFESSIONAL: {
        badge: 'Executive & Formal',
        subject: 'Update: Q3 Backend API & Database Milestone Finalization',
        body: `Dear Leadership Team,\n\nI am pleased to formally provide an update regarding our Q3 milestone deliverables. All backend REST API modules, database migrations, and security audit tests have been successfully verified within our staging environment.\n\nWe are on schedule to conduct the stakeholder demonstration this Thursday at 3:00 PM. Please review the attached release summary and confirm your availability.\n\nThank you for your ongoing support.\n\nBest regards,\nAnand Patel\nLead Software Engineer`
      },
      FRIENDLY: {
        badge: 'Warm & Collaborative',
        subject: 'Great news: Q3 backend milestone wrapped ahead of schedule! 🎉',
        body: `Hi everyone!\n\nHope your week is off to a great start! I'm thrilled to share that our team has wrapped up all backend APIs, database migrations, and staging tests ahead of schedule.\n\nWe're hosting a quick demo this Thursday at 3:00 PM to celebrate and walk through what we've built. Take a peek at the attached summary whenever you have a moment!\n\nCheers,\nAnand`
      },
      CASUAL: {
        badge: 'Relaxed & Direct',
        subject: 'Quick heads-up: Q3 backend tasks finished',
        body: `Hey team,\n\nJust touching base—we crossed the finish line on backend APIs and database tasks today. Everything is running cleanly in staging.\n\nWe have a brief walkthrough set for Thursday at 3:00 PM. Let me know if that works for your calendar or if you need any adjustments.\n\nCatch you later,\nAnand`
      },
      URGENT: {
        badge: 'Action-Driven & Deadline',
        subject: 'URGENT: Final Sign-off Needed for Q3 Milestone Demo by Thursday',
        body: `Dear Stakeholders,\n\nAll critical backend components and database pipelines are complete and deployed to staging. To proceed with the deployment schedule, we require final stakeholder sign-off prior to Thursday's 3:00 PM review.\n\nPlease review the attached release notes immediately and submit any blockers by 12:00 PM tomorrow.\n\nRegards,\nAnand Patel\nLead Software Engineer`
      }
    }
  },

  RESCHEDULE: {
    id: 'RESCHEDULE',
    label: '📅 Reschedule Meeting',
    title: 'Client Strategy & Architecture Sync Reschedule',
    rawNotes: [
      '• Need to move tomorrow’s client sync from 11:00 AM to Friday at 3:00 PM',
      '• Unavoidable scheduling clash with an emergency production deployment',
      '• Apologize for the short notice, open to alternative slots if Friday is packed'
    ],
    tones: {
      PROFESSIONAL: {
        badge: 'Executive & Formal',
        subject: 'Request to Reschedule: Client Architecture Strategy Sync',
        body: `Dear Mr. Henderson,\n\nI hope this email finds you well. Due to an unforeseen high-priority production deployment, I must respectfully request that we reschedule our sync originally planned for tomorrow at 11:00 AM.\n\nWould Friday at 3:00 PM work for your schedule? Please accept my sincere apologies for any inconvenience this adjustment may cause. I remain flexible should an alternative time suit you better.\n\nSincerely,\nAnand Patel\nTechnical Solutions Lead`
      },
      FRIENDLY: {
        badge: 'Warm & Empathetic',
        subject: 'Quick question regarding tomorrow’s meeting time 😊',
        body: `Hi David,\n\nHope you're having a productive week! Something urgent came up on our production deployment schedule tomorrow morning, and I want to make sure I give our sync my undivided attention.\n\nWould you be open to moving our call to Friday at 3:00 PM? Really appreciate your understanding, and let me know if another time works better for you!\n\nWarmly,\nAnand`
      },
      CASUAL: {
        badge: 'Relaxed & Direct',
        subject: 'Reschedule tomorrow’s sync to Friday?',
        body: `Hi David,\n\nQuick heads up—an urgent production release landed on my plate for tomorrow morning. Could we push our catch-up to Friday at 3:00 PM instead?\n\nSorry about the sudden change. Let me know if that slot works for you!\n\nBest,\nAnand`
      },
      URGENT: {
        badge: 'High-Priority & Deadline',
        subject: 'IMPORTANT: Rescheduling Tomorrow’s 11:00 AM Sync - Immediate Confirmation',
        body: `Dear David,\n\nDue to an urgent production deployment scheduled for tomorrow morning, I am unable to attend our 11:00 AM meeting. \n\nI propose moving our discussion to Friday at 3:00 PM. Please confirm your availability by end of day today so we can finalize the calendar invitation.\n\nBest regards,\nAnand Patel`
      }
    }
  },

  PROPOSAL: {
    id: 'PROPOSAL',
    label: '💼 Proposal Follow-up',
    title: 'Enterprise AI Software License & Scope Follow-up',
    rawNotes: [
      '• Following up on enterprise proposal and scope deck sent last Tuesday',
      '• Checking if security and engineering review teams had questions',
      '• Ready to schedule a 15-minute call to finalize Q4 pilot agreement'
    ],
    tones: {
      PROFESSIONAL: {
        badge: 'Executive & Formal',
        subject: 'Following Up: Enterprise AI Architecture Proposal & Next Steps',
        body: `Dear Ms. Kapoor,\n\nI am writing to follow up on the enterprise architecture proposal and scope document submitted last Tuesday for your team’s consideration.\n\nPlease let me know if your technical or security committees have any preliminary questions or require additional documentation. We are available for a brief 15-minute alignment call this week to finalize the pilot timeline.\n\nLooking forward to your guidance.\n\nWarm regards,\nAnand Patel\nHead of Enterprise Partnerships`
      },
      FRIENDLY: {
        badge: 'Warm & Collaborative',
        subject: 'Checking in on our recent proposal – hope you loved it! ✨',
        body: `Hi Priya,\n\nHope you’re having a wonderful week! Just wanted to gently check in to see how the proposal and architecture deck landed with your engineering team.\n\nWe’d love to hop on a quick 15-minute call whenever convenient to answer questions or explore ideas together. Looking forward to staying connected!\n\nBest wishes,\nAnand`
      },
      CASUAL: {
        badge: 'Relaxed & Direct',
        subject: 'Quick follow-up on the AI proposal',
        body: `Hi Priya,\n\nJust checking in regarding the proposal we sent over last Tuesday. Did the team get a chance to take a look?\n\nHappy to jump on a quick 15-minute chat this week if anyone has questions before we take the next step. Talk soon!\n\nBest,\nAnand`
      },
      URGENT: {
        badge: 'High-Priority & Deadline',
        subject: 'URGENT: Proposal Review Deadline for Q4 Pilot Allocation',
        body: `Dear Ms. Kapoor,\n\nI am following up regarding the enterprise proposal submitted last Tuesday. In order to guarantee engineering bandwidth and pilot deployment for the Q4 cycle, we require confirmation by this Friday at 5:00 PM.\n\nPlease let us know if any questions remain so we can resolve them immediately.\n\nRegards,\nAnand Patel`
      }
    }
  },

  INCIDENT: {
    id: 'INCIDENT',
    label: '🚨 Critical Incident',
    title: 'Payment Gateway Timeout Incident & Mitigation',
    rawNotes: [
      '• Payment webhook timeouts detected at 09:15 UTC affecting checkout',
      '• Fallback retry queue activated; hotfix patch v2.4.1 deployed to staging',
      '• Full post-mortem report and root-cause analysis will be shared by 5:00 PM'
    ],
    tones: {
      PROFESSIONAL: {
        badge: 'Executive & Formal',
        subject: 'Incident Notification: Payment Gateway Timeout & Staging Hotfix Status',
        body: `Dear Management Team,\n\nWe detected intermittent payment webhook timeouts on our primary checkout service at 09:15 UTC today. The secondary retry queue was immediately activated to mitigate customer drop-off.\n\nHotfix patch v2.4.1 has been successfully deployed to staging and is undergoing final verification. A comprehensive post-mortem report detailing root cause and preventative measures will be published by 5:00 PM today.\n\nSincerely,\nAnand Patel\nIncident Response Lead`
      },
      FRIENDLY: {
        badge: 'Empathetic & Transparent',
        subject: 'Heads-up on payment gateway hiccup (fix already in staging! 🛠️)',
        body: `Hi everyone,\n\nWanting to be fully transparent: we saw a brief delay with payment webhooks earlier this morning around 09:15 UTC. The team jumped on it immediately and our fallback queue kept transactions safe.\n\nThe hotfix is already staged and looking great. We’ll share a friendly summary of what happened and our learnings by 5:00 PM. Thanks so much for your patience!\n\nBest,\nAnand`
      },
      CASUAL: {
        badge: 'Relaxed & Direct',
        subject: 'Update: Payment webhook issue resolved in staging',
        body: `Hey all,\n\nQuick heads up on this morning’s checkout timeouts. We caught it quickly, switched on the fallback queue, and hotfix v2.4.1 is already in staging.\n\nEverything is stabilizing, and I’ll send out a recap note before 5:00 PM today. Cheers!\n\nBest,\nAnand`
      },
      URGENT: {
        badge: 'Critical & High-Priority',
        subject: 'CRITICAL ALERT: Payment Webhook Timeout - Hotfix v2.4.1 In Staging',
        body: `ATTENTION: Engineering & Operations Teams,\n\nA critical timeout issue on payment webhooks was identified at 09:15 UTC. The secondary retry queue is active. Hotfix v2.4.1 is currently undergoing validation on staging.\n\nALL on-call leads must join the incident bridge immediately. Post-mortem publication deadline is strictly 5:00 PM.\n\nAnand Patel\nIncident Commander`
      }
    }
  },

  LEAVE: {
    id: 'LEAVE',
    label: '🏖️ Leave Application',
    title: 'Casual Leave Request & Task Handover',
    rawNotes: [
      '• Requesting casual leave this coming Monday for personal urgent work',
      '• All active tickets and sprint tasks handed over to Rahul',
      '• Available on mobile for critical production emergencies only'
    ],
    tones: {
      PROFESSIONAL: {
        badge: 'Executive & Formal',
        subject: 'Application for Casual Leave - Monday, November 2nd',
        body: `Dear Mr. Verma,\n\nI am writing to formally request casual leave for this coming Monday, November 2nd, due to urgent personal obligations. \n\nI have prepared a thorough handover of all active sprint tasks and customer escalation tickets with Rahul Sharma. I will ensure all pending pull requests are merged prior to my departure Friday evening. In case of an emergency, I remain reachable by phone.\n\nThank you for considering my request.\n\nWarm regards,\nAnand Patel\nSenior Software Engineer`
      },
      FRIENDLY: {
        badge: 'Warm & Collaborative',
        subject: 'Leave request for this coming Monday (tasks handed over!) ☀️',
        body: `Hi Vikram,\n\nHope you're having a smooth week! I need to take casual leave this coming Monday for some family matters. \n\nRahul has graciously agreed to cover my sprint tasks, and everything is organized so the team won't miss a beat. If anything urgent pops up, feel free to give me a quick ring. Thanks so much!\n\nBest,\nAnand`
      },
      CASUAL: {
        badge: 'Relaxed & Direct',
        subject: 'Out of office this Monday - Handover to Rahul',
        body: `Hi Vikram,\n\nJust letting you know I’ll be out of office this coming Monday for personal work. \n\nRahul is covering all my sprint items and reviews. I'll catch up on everything first thing Tuesday morning. Ping me on mobile if anything catches fire!\n\nCheers,\nAnand`
      },
      URGENT: {
        badge: 'Action-Driven & Timely',
        subject: 'URGENT: Leave Request & Complete Handover for Monday, Nov 2nd',
        body: `Dear Vikram,\n\nDue to an urgent and unexpected personal commitment, I must take leave this coming Monday, November 2nd.\n\nAll critical deliverables have been transitioned to Rahul Sharma. Please approve the leave request in the HR portal so the schedule can be finalized today.\n\nRegards,\nAnand Patel`
      }
    }
  }
};

const FAQ_ITEMS = [
  {
    q: 'Do my private emails or client data get sent to OpenAI or cloud servers?',
    a: 'Absolutely not. SmartMail AI uses a local Ollama instance running on your machine (http://localhost:11434 with llama3.2). All inference happens 100% on-premises on your local CPU/GPU. No emails, prompts, or recipient addresses ever leave your workstation.'
  },
  {
    q: 'How does live Gmail SMTP email sending work?',
    a: 'SmartMail AI integrates with Spring Boot’s JavaMailSender over TLS port 587. You simply create a standard 16-character Google App Password in your Google Account Security settings and paste it into the UI Settings modal. SmartMail AI tests the connection with live validation before any email is dispatched.'
  },
  {
    q: 'What is Sandbox Mode and when should I use it?',
    a: 'Sandbox Mode allows you to generate emails, test prompts, preview tone changes, and test the "Send" workflow without requiring any email passwords or sending live emails. Dispatches are logged cleanly to your local database and terminal.'
  },
  {
    q: 'Can I use SmartMail AI without creating an account?',
    a: 'Yes! Click "Instant Demo Mode" anywhere on this page to immediately access the AI Studio and test tone generation, editing, and copying without logging in.'
  },
  {
    q: 'How are my drafts and history saved?',
    a: 'SmartMail AI includes an embedded file-based H2 database that automatically persists your drafts, sent status, timestamps, and recipient info across server restarts. You can also switch to MySQL with one line in application.properties.'
  },
  {
    q: 'Can I use other local AI models besides Llama 3.2?',
    a: 'Yes. While Llama 3.2 is pre-configured for optimal speed (~1.2s) and high email polish, you can easily change the model to mistral, llama3, qwen2.5, or deepseek in application.properties or run it via ollama run <model>.'
  }
];

function LandingPage({
  onOpenAuth,
  onExploreGuest,
  systemStatus,
  currentUser,
  onSwitchToStudio,
  onSwitchToHistory,
  onLoadSampleToStudio
}) {
  const [activeScenarioId, setActiveScenarioId] = useState('MILESTONE');
  const [activeTone, setActiveTone] = useState('PROFESSIONAL');
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const currentScenario = SCENARIOS[activeScenarioId] || SCENARIOS.MILESTONE;
  const currentToneData = currentScenario.tones[activeTone] || currentScenario.tones.PROFESSIONAL;

  const handleCopyPreview = () => {
    const text = `Subject: ${currentToneData.subject}\n\n${currentToneData.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleTryInStudio = () => {
    if (onLoadSampleToStudio) {
      onLoadSampleToStudio({
        title: currentScenario.title,
        prompt: currentScenario.rawNotes.join('\n'),
        subject: currentToneData.subject,
        tone: activeTone,
        body: currentToneData.body
      });
    } else {
      onSwitchToStudio();
    }
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-wrapper">
      {/* 1. TOP STICKY NAVIGATION BAR */}
      <nav className="landing-nav" id="top">
        <div className="landing-brand">
          <div className="brand-logo-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </div>
          <div className="landing-brand-text">
            <h2>SmartMail AI</h2>
            <span className="brand-tag">Enterprise Suite v2.4</span>
          </div>
        </div>

        {/* Desktop Anchor Navigation Links */}
        <div className="landing-nav-links">
          <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Features</a>
          <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')}>How It Works</a>
          <a href="#playground" onClick={(e) => scrollToSection(e, 'playground')}>Live Studio</a>
          <a href="#comparison" onClick={(e) => scrollToSection(e, 'comparison')}>Why Us</a>
          <a href="#architecture" onClick={(e) => scrollToSection(e, 'architecture')}>Architecture</a>
          <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')}>FAQ</a>
        </div>

        <div className="landing-nav-right">
          {/* Live Engine Status Badge */}
          <div className="status-badge" title="Local Ollama AI Inference Engine">
            <span className={`status-dot ${systemStatus?.ollamaOnline ? 'online' : 'offline'}`}></span>
            <span>{systemStatus?.ollamaOnline ? `Llama 3.2 Active` : 'AI Local Server Offline'}</span>
          </div>

          {currentUser ? (
            <div className="landing-user-controls">
              <span className="landing-user-name" title={currentUser.email}>
                👤 {currentUser.fullName || currentUser.email}
              </span>
              <button
                type="button"
                className="btn-landing-cta"
                onClick={onSwitchToStudio}
              >
                <span>✍️</span> Open Studio
              </button>
            </div>
          ) : (
            <div className="landing-auth-buttons">
              <button
                type="button"
                className="btn-hero-ghost nav-ghost-btn"
                onClick={onExploreGuest}
                title="Explore without creating an account"
              >
                <span>⚡</span> Quick Demo
              </button>

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
            </div>
          )}
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="landing-hero">
        <div className="hero-pill-badge">
          <span className="pill-dot"></span>
          <span>✨ Enterprise-Grade Local AI Email Assistant • 100% Privacy • Zero Token Costs</span>
        </div>

        <h1 className="hero-title">
          Turn Scattered Notes Into <br />
          <span className="gradient-text">Executive-Grade Emails</span> in Seconds
        </h1>

        <p className="hero-subtitle">
          The self-hosted, privacy-first AI email copilot built with <strong>Spring Boot 3.4</strong> and local <strong>Ollama (Llama 3.2)</strong>.
          Draft with 4 tone personas, preview subject & body, and dispatch directly to real Gmail inboxes—with zero per-token cloud costs.
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
                <span>🚀 Launch AI Studio ({currentUser.fullName || 'User'})</span>
              </button>
              <button
                type="button"
                className="btn-hero-secondary"
                onClick={onSwitchToHistory}
              >
                <span>📊 Audit History & Analytics</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-hero-primary"
                onClick={() => onOpenAuth('register')}
              >
                <span>🚀 Get Started Free (Email or Phone)</span>
              </button>

              <button
                type="button"
                className="btn-hero-ghost"
                onClick={onExploreGuest}
              >
                <span>⚡ Try Instant Demo Mode</span>
              </button>

              <button
                type="button"
                className="btn-hero-secondary"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
              >
                <span>📖 See How It Works</span>
              </button>
            </>
          )}
        </div>

        {/* Trust Badges / Live Metrics Row */}
        <div className="landing-stats-bar">
          <div className="landing-stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">On-Premises Privacy</span>
            <span className="stat-sublabel">Zero cloud token leaks</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat-item">
            <span className="stat-number">~1.2s</span>
            <span className="stat-label">Local Ollama Latency</span>
            <span className="stat-sublabel">Meta Llama 3.2 Engine</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat-item">
            <span className="stat-number">4 Modes</span>
            <span className="stat-label">Adaptive Personas</span>
            <span className="stat-sublabel">Formal, Casual, Warm, Urgent</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat-item">
            <span className="stat-number">Live SMTP</span>
            <span className="stat-label">Direct Inbox Delivery</span>
            <span className="stat-sublabel">TLS 587 + Sandbox Mode</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat-item">
            <span className="stat-number">Dual Auth</span>
            <span className="stat-label">Email & Mobile Login</span>
            <span className="stat-sublabel">Isolated History DB</span>
          </div>
        </div>

        {/* 3. INTERACTIVE LIVE TONE PLAYGROUND SHOWCASE */}
        <div className="hero-preview-wrapper" id="playground">
          <div className="section-header-tag">
            <span>✨ Live Interactive Tone Studio</span>
          </div>
          <h2 className="section-title-sub">
            One Core Idea. <span className="gradient-text">Four Distinct Voices.</span>
          </h2>
          <p className="section-desc-sub">
            Select an enterprise scenario below, toggle between AI persona tones, and inspect how SmartMail AI dynamically structures salutations, phrasing, and calls-to-action.
          </p>

          {/* Scenario Selector Chips */}
          <div className="playground-scenario-pills">
            {Object.values(SCENARIOS).map((sc) => (
              <button
                key={sc.id}
                type="button"
                className={`scenario-pill ${activeScenarioId === sc.id ? 'active' : ''}`}
                onClick={() => setActiveScenarioId(sc.id)}
              >
                <span>{sc.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Playground Window */}
          <div className="hero-preview-card">
            <div className="preview-card-header">
              <div className="window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="window-title">{currentScenario.title}</span>
              </div>

              {/* Tone Switcher Tabs */}
              <div className="preview-tone-tabs">
                {[
                  { id: 'PROFESSIONAL', label: '💼 Professional' },
                  { id: 'FRIENDLY', label: '🤝 Friendly' },
                  { id: 'CASUAL', label: '☕ Casual' },
                  { id: 'URGENT', label: '⚡ Urgent' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`preview-tab-chip ${activeTone === t.id ? 'active' : ''}`}
                    onClick={() => setActiveTone(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="preview-card-body">
              {/* Left Side: Raw Input Notes */}
              <div className="preview-input-side">
                <div className="preview-side-header">
                  <div className="preview-side-label">
                    <span>📝</span> Raw Rough Notes (Input)
                  </div>
                  <span className="preview-side-badge">Zero Formatting Needed</span>
                </div>

                <div className="preview-notes-box">
                  {currentScenario.rawNotes.map((note, idx) => (
                    <p key={idx}>{note}</p>
                  ))}
                </div>

                <div className="preview-meta-pill">
                  <span>⚡ AI Pipeline: Prompt Engineer ➔ Ollama Llama 3.2 ➔ Spring Boot</span>
                </div>
              </div>

              <div className="preview-divider-arrow">
                <div className="arrow-circle">➔</div>
                <span className="arrow-label">~1.2s</span>
              </div>

              {/* Right Side: Polished Output */}
              <div className="preview-output-side">
                <div className="preview-side-header">
                  <div className="preview-side-label">
                    <span>✨</span> Polished Email ({currentToneData.badge})
                  </div>
                  <div className="output-action-btns">
                    <button
                      type="button"
                      className="btn-tiny-action"
                      onClick={handleCopyPreview}
                      title="Copy email to clipboard"
                    >
                      {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                    <button
                      type="button"
                      className="btn-tiny-action studio-link"
                      onClick={handleTryInStudio}
                      title="Load this into AI Studio composer"
                    >
                      🚀 Try in Studio
                    </button>
                  </div>
                </div>

                <div className="preview-subject-line">
                  <span className="subject-prefix">Subject:</span> {currentToneData.subject}
                </div>

                <div className="preview-output-text">
                  {currentToneData.body}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="landing-section" id="how-it-works">
        <div className="section-badge-center">
          <span>🛠️ Seamless 3-Step Process</span>
        </div>
        <h2 className="section-main-heading">
          How SmartMail AI <span className="gradient-text">Streamlines Your Day</span>
        </h2>
        <p className="section-main-desc">
          Go from fragmented thoughts to a perfectly crafted corporate email in less than 15 seconds.
        </p>

        <div className="how-it-works-grid">
          <div className="step-card">
            <div className="step-number-tag">01</div>
            <div className="step-icon-wrap icon-indigo">
              <span>📝</span>
            </div>
            <h3>Dump Your Thoughts</h3>
            <p>
              Type messy bullet points, quick voice transcriptions, or rough notes. Forget about grammar, formal greetings, or formatting.
            </p>
            <div className="step-highlight">
              <span>✦ Eliminates writer’s block</span>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number-tag">02</div>
            <div className="step-icon-wrap icon-cyan">
              <span>🧠</span>
            </div>
            <h3>Pick Persona & Tone</h3>
            <p>
              Select from 4 precision-engineered tones: Executive Professional, Warm Friendly, Casual Peer, or High-Priority Urgent.
            </p>
            <div className="step-highlight">
              <span>✦ Local Llama 3.2 synthesis in ~1.2s</span>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number-tag">03</div>
            <div className="step-icon-wrap icon-emerald">
              <span>🚀</span>
            </div>
            <h3>Send Live or Sandbox</h3>
            <p>
              Inspect the subject line and polished body. Send directly to real inboxes via verified Gmail SMTP, or test safely in Sandbox mode.
            </p>
            <div className="step-highlight">
              <span>✦ Auto-saved to persistent database</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE CAPABILITIES MATRIX */}
      <section className="landing-section" id="features">
        <div className="section-badge-center">
          <span>💼 Enterprise Capabilities</span>
        </div>
        <h2 className="section-main-heading">
          Engineered for <span className="gradient-text">Privacy, Speed & Precision</span>
        </h2>
        <p className="section-main-desc">
          Every layer of SmartMail AI is built to provide enterprise-grade reliability, data privacy, and effortless communication.
        </p>

        <div className="landing-features-grid">
          <div className="feature-card">
            <div className="feature-icon-box icon-purple">🔒</div>
            <span className="feature-pill-tag">100% On-Premises</span>
            <h3>Zero Cloud Data Leaks</h3>
            <p>
              Runs completely on your local machine via Ollama. Confidential corporate correspondence, financial numbers, and client names never touch third-party cloud servers.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box icon-cyan">🎭</div>
            <span className="feature-pill-tag">4 Adaptive Personas</span>
            <h3>Audience-Tailored Phrasing</h3>
            <p>
              Whether updating the C-suite, coordinating with peers, nurturing a client relationship, or resolving an urgent blocker, your tone is always calibrated to perfection.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box icon-emerald">📨</div>
            <span className="feature-pill-tag">Direct SMTP Delivery</span>
            <h3>Gmail & Sandbox Integration</h3>
            <p>
              Integrated directly with Spring Boot <code>JavaMailSender</code> over secure TLS (Port 587). Send real emails directly from the dashboard, or test in Sandbox Mode.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box icon-amber">💾</div>
            <span className="feature-pill-tag">Dual Persistence</span>
            <h3>Persistent History & Drafts</h3>
            <p>
              All drafts and sent emails are saved to an embedded file-based H2 database (or production MySQL). Reload past drafts back into the studio composer with a single click.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box icon-rose">📱</div>
            <span className="feature-pill-tag">Dual Authentication</span>
            <h3>Email & Phone Sign-In</h3>
            <p>
              Built for enterprise versatility: sign in using either your corporate email or your 10-digit mobile number, with individual history isolation and secure password hashing.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box icon-indigo">⚡</div>
            <span className="feature-pill-tag">Zero Recurring Fees</span>
            <h3>Unlimited Free Local AI</h3>
            <p>
              No OpenAI or Anthropic monthly subscriptions, per-token charges, or rate-limiting. Generate 10 or 1,000 emails a day with unlimited local horsepower.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BEFORE VS AFTER COMPARISON */}
      <section className="landing-section" id="comparison">
        <div className="section-badge-center">
          <span>📊 The Productivity Difference</span>
        </div>
        <h2 className="section-main-heading">
          Traditional Emailing <span className="gradient-text">vs. SmartMail AI</span>
        </h2>
        <p className="section-main-desc">
          Compare the cognitive drag of writing from scratch against an automated, context-aware AI assistant.
        </p>

        <div className="comparison-cards-container">
          {/* Old Traditional Method */}
          <div className="comparison-card traditional">
            <div className="comparison-card-badge red">
              <span>❌ The Traditional Way</span>
            </div>
            <ul className="comparison-list">
              <li>
                <span className="list-icon">⏱️</span>
                <div>
                  <strong>15 to 25 minutes lost per email</strong>
                  <p>Staring at a blank screen struggling with formal phrasing and structure.</p>
                </div>
              </li>
              <li>
                <span className="list-icon">😰</span>
                <div>
                  <strong>High risk of tone mismatch</strong>
                  <p>Sounding unintentionally blunt to leadership or awkwardly formal to team peers.</p>
                </div>
              </li>
              <li>
                <span className="list-icon">🔀</span>
                <div>
                  <strong>Tab fatigue & disjointed tools</strong>
                  <p>Switching across text editors, grammar checkers, and webmail browser tabs.</p>
                </div>
              </li>
              <li>
                <span className="list-icon">☁️</span>
                <div>
                  <strong>Cloud privacy risks</strong>
                  <p>Accidentally pasting confidential contracts into third-party public AI tools.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* With SmartMail AI */}
          <div className="comparison-card modern">
            <div className="comparison-card-badge green">
              <span>✨ With SmartMail AI Enterprise</span>
            </div>
            <ul className="comparison-list">
              <li>
                <span className="list-icon">⚡</span>
                <div>
                  <strong>Done in under 15 seconds</strong>
                  <p>Convert 3 quick bullet notes into a complete, articulate email instantly.</p>
                </div>
              </li>
              <li>
                <span className="list-icon">🎯</span>
                <div>
                  <strong>Guaranteed tone perfection</strong>
                  <p>Executive, Friendly, Casual, or Urgent phrasing tailored to the exact audience.</p>
                </div>
              </li>
              <li>
                <span className="list-icon">✉️</span>
                <div>
                  <strong>One-click SMTP dispatch</strong>
                  <p>Send directly to real inboxes or test safely in Sandbox mode without leaving the app.</p>
                </div>
              </li>
              <li>
                <span className="list-icon">🔒</span>
                <div>
                  <strong>100% On-premises security</strong>
                  <p>Local Ollama LLM ensures confidential data never leaves your workstation.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. SYSTEM ARCHITECTURE & TECH STACK */}
      <section className="landing-section" id="architecture">
        <div className="section-badge-center">
          <span>🏛️ Technical Architecture</span>
        </div>
        <h2 className="section-main-heading">
          Full-Stack Enterprise <span className="gradient-text">Engineering</span>
        </h2>
        <p className="section-main-desc">
          Designed with modern Java 21, Spring Boot 3.4, React 18, and local Meta Llama 3.2 inference.
        </p>

        {/* Architecture Flow Pipeline */}
        <div className="arch-flow-diagram">
          <div className="arch-step">
            <div className="arch-step-badge">Frontend Client</div>
            <h4>React 18 + Vite</h4>
            <p>Glassmorphic UI • Tone Selector • Live Preview • History Table</p>
          </div>
          <div className="arch-connector">➔ REST API</div>

          <div className="arch-step">
            <div className="arch-step-badge">Backend Service</div>
            <h4>Spring Boot 3.4 (Java 21)</h4>
            <p>EmailController • OllamaService • JavaMailSender • JPA Repos</p>
          </div>
          <div className="arch-connector">➔ Port 11434</div>

          <div className="arch-step">
            <div className="arch-step-badge">AI Engine</div>
            <h4>Local Ollama (Llama 3.2)</h4>
            <p>Prompt Engine • Temperature Tuning • Zero Cloud Fees</p>
          </div>
          <div className="arch-connector">➔ Port 587 / JDBC</div>

          <div className="arch-step">
            <div className="arch-step-badge">Storage & Mail</div>
            <h4>H2 / MySQL & Gmail SMTP</h4>
            <p>File-based DB • Live Delivery • Sandbox Dispatcher</p>
          </div>
        </div>

        {/* Live System Health Cards */}
        <div className="system-health-grid">
          <div className="health-card">
            <div className="health-status-indicator online"></div>
            <div className="health-details">
              <span className="health-title">Backend API Core</span>
              <span className="health-desc">Spring Boot 3.4 • Java 21 • Port 8080</span>
            </div>
            <span className="health-pill active">Online</span>
          </div>

          <div className="health-card">
            <div className={`health-status-indicator ${systemStatus?.ollamaOnline ? 'online' : 'offline'}`}></div>
            <div className="health-details">
              <span className="health-title">AI Engine (Ollama)</span>
              <span className="health-desc">Meta Llama 3.2 • Local Inference</span>
            </div>
            <span className={`health-pill ${systemStatus?.ollamaOnline ? 'active' : 'inactive'}`}>
              {systemStatus?.ollamaOnline ? 'Active' : 'Offline'}
            </span>
          </div>

          <div className="health-card">
            <div className={`health-status-indicator ${systemStatus?.smtpConfigured ? 'online' : 'sandbox'}`}></div>
            <div className="health-details">
              <span className="health-title">Email Dispatcher</span>
              <span className="health-desc">
                {systemStatus?.smtpConfigured ? `Gmail SMTP Live (${systemStatus.smtpUser})` : 'Sandbox Mode Active'}
              </span>
            </div>
            <span className={`health-pill ${systemStatus?.smtpConfigured ? 'active' : 'sandbox'}`}>
              {systemStatus?.smtpConfigured ? 'Live SMTP' : 'Sandbox'}
            </span>
          </div>

          <div className="health-card">
            <div className="health-status-indicator online"></div>
            <div className="health-details">
              <span className="health-title">Persistence Engine</span>
              <span className="health-desc">File-based H2 (./data/emaildb) • MySQL Ready</span>
            </div>
            <span className="health-pill active">Persistent</span>
          </div>
        </div>
      </section>

      {/* 8. WHO BENEFITS / USER PERSONAS */}
      <section className="landing-section">
        <div className="section-badge-center">
          <span>🎯 Real-World Applications</span>
        </div>
        <h2 className="section-main-heading">
          Built for <span className="gradient-text">High-Performing Teams</span>
        </h2>
        <p className="section-main-desc">
          From leadership memos to emergency engineering escalations, SmartMail AI delivers clarity across every role.
        </p>

        <div className="persona-grid">
          <div className="persona-card">
            <div className="persona-icon">👔</div>
            <h4>Executives & Directors</h4>
            <p>Quickly summarize meeting decisions, provide board updates, and delegate tasks with formal executive sign-offs in seconds.</p>
          </div>

          <div className="persona-card">
            <div className="persona-icon">💻</div>
            <h4>Engineers & Tech Leads</h4>
            <p>Turn raw git commit logs, bug investigations, and sprint blockers into clean customer release announcements.</p>
          </div>

          <div className="persona-card">
            <div className="persona-icon">🤝</div>
            <h4>Sales & Account Managers</h4>
            <p>Send persuasive proposal follow-ups, renewal check-ins, and contract inquiries that drive immediate executive responses.</p>
          </div>

          <div className="persona-card">
            <div className="persona-icon">👥</div>
            <h4>HR & Team Leaders</h4>
            <p>Compose empathetic welcome notes, leave approvals, policy reminders, and team recognition announcements effortlessly.</p>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
      <section className="landing-section" id="faq">
        <div className="section-badge-center">
          <span>❓ Got Questions?</span>
        </div>
        <h2 className="section-main-heading">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <p className="section-main-desc">
          Everything you need to know about SmartMail AI, security, and setup.
        </p>

        <div className="faq-accordion-container">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`faq-item ${isOpen ? 'open' : ''}`}
                onClick={() => setOpenFaqIndex(isOpen ? null : index)}
              >
                <div className="faq-question-row">
                  <span className="faq-q-text">{item.q}</span>
                  <span className="faq-chevron">{isOpen ? '−' : '+'}</span>
                </div>
                {isOpen && (
                  <div className="faq-answer-row">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. HIGH-IMPACT BOTTOM CTA BANNER */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <div className="hero-pill-badge">
            <span className="pill-dot"></span>
            <span>⚡ Ready to Supercharge Your Daily Communication?</span>
          </div>

          <h2 className="cta-heading">
            Stop Staring at Blank Drafts. <br />
            <span className="gradient-text">Start Writing With Local AI Today.</span>
          </h2>

          <p className="cta-subheading">
            Join professionals saving hours every week with 100% private, tone-perfect email generation.
            No credit card, no cloud API tokens, zero setup friction.
          </p>

          <div className="hero-action-row">
            {currentUser ? (
              <button
                type="button"
                className="btn-hero-primary"
                onClick={onSwitchToStudio}
              >
                <span>🚀 Return to AI Studio</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => onOpenAuth('register')}
                >
                  <span>✨ Create Account Free</span>
                </button>
                <button
                  type="button"
                  className="btn-hero-ghost"
                  onClick={onExploreGuest}
                >
                  <span>⚡ Launch Instant Demo Mode</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 11. MODERN ENTERPRISE FOOTER */}
      <footer className="landing-footer">
        <div className="footer-top-row">
          <div className="footer-brand-side">
            <div className="landing-brand">
              <div className="brand-logo-glow">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </div>
              <div className="landing-brand-text">
                <h2>SmartMail AI</h2>
                <span className="brand-tag">Enterprise Edition</span>
              </div>
            </div>
            <p className="footer-brand-desc">
              Next-generation privacy-first AI Email Assistant. Built with Spring Boot 3.4 (Java 21 LTS), React 18, and local Ollama Llama 3.2.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h5>Navigation</h5>
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Features</a>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')}>How It Works</a>
              <a href="#playground" onClick={(e) => scrollToSection(e, 'playground')}>Interactive Studio</a>
              <a href="#comparison" onClick={(e) => scrollToSection(e, 'comparison')}>Comparison</a>
              <a href="#architecture" onClick={(e) => scrollToSection(e, 'architecture')}>Architecture</a>
            </div>

            <div className="footer-col">
              <h5>Application</h5>
              <button type="button" className="footer-link-btn" onClick={onExploreGuest}>Instant Demo</button>
              <button type="button" className="footer-link-btn" onClick={() => onOpenAuth('login')}>Sign In</button>
              <button type="button" className="footer-link-btn" onClick={() => onOpenAuth('register')}>Register Free</button>
              <a href="http://localhost:8080/h2-console" target="_blank" rel="noreferrer">H2 Web Console</a>
            </div>

            <div className="footer-col">
              <h5>Tech Stack</h5>
              <span>Java 21 LTS</span>
              <span>Spring Boot 3.4</span>
              <span>Ollama Llama 3.2</span>
              <span>React 18 + Vite</span>
              <span>JavaMailSender (SMTP)</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p>© 2026 SmartMail AI Enterprise. Developed with pride by Anand Patel. All rights reserved.</p>
          <div className="footer-back-to-top">
            <a href="#top" onClick={(e) => scrollToSection(e, 'top')}>Back to Top ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
