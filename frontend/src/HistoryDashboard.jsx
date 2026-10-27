import { useState, useMemo } from 'react';

function HistoryDashboard({ history, onLoadDraft, onDeleteDraft, onRefresh, onSwitchToStudio, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTone, setSelectedTone] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewingItem, setViewingItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = history.length;
    const sentDelivered = history.filter(h => h.status === 'SENT').length;
    const sentSimulated = history.filter(h => h.status?.includes('Simulated') || h.status === 'SENT_SIMULATED').length;
    const drafts = history.filter(h => h.status === 'DRAFT' || !h.status).length;
    return { total, sentDelivered, sentSimulated, drafts };
  }, [history]);

  // Compute Tone Distribution
  const toneStats = useMemo(() => {
    const total = history.length || 1;
    const prof = history.filter(h => (h.tone || 'PROFESSIONAL') === 'PROFESSIONAL').length;
    const friend = history.filter(h => h.tone === 'FRIENDLY').length;
    const casual = history.filter(h => h.tone === 'CASUAL').length;
    const urgent = history.filter(h => h.tone === 'URGENT').length;
    return {
      prof, friend, casual, urgent,
      profPct: Math.round((prof / total) * 100),
      friendPct: Math.round((friend / total) * 100),
      casualPct: Math.round((casual / total) * 100),
      urgentPct: Math.round((urgent / total) * 100)
    };
  }, [history]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.recipient && item.recipient.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.sender && item.sender.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.generatedContent && item.generatedContent.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTone = selectedTone === 'ALL' || item.tone?.toUpperCase() === selectedTone;

      const matchStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'SENT' && item.status?.includes('SENT')) ||
        (selectedStatus === 'DRAFT' && (item.status === 'DRAFT' || !item.status));

      return matchSearch && matchTone && matchStatus;
    });
  }, [history, searchTerm, selectedTone, selectedStatus]);

  const handleCopyDraft = (e, item) => {
    e.stopPropagation();
    const fullText = `Subject: ${item.subject || 'No Subject'}\n\n${item.generatedContent || item.prompt}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="history-dashboard-wrapper">
      {/* Top Banner / Metrics Overview */}
      <div className="metrics-banner-grid">
        <div className="metric-card metric-total">
          <div className="metric-header">
            <span>📚 Total Drafts Created</span>
            <span className="metric-icon">✉️</span>
          </div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-subtext">All generated AI emails</div>
        </div>

        <div className="metric-card metric-sent">
          <div className="metric-header">
            <span>🚀 Delivered via SMTP</span>
            <span className="metric-icon">🟢</span>
          </div>
          <div className="metric-value">{metrics.sentDelivered}</div>
          <div className="metric-subtext">Delivered to real inboxes</div>
        </div>

        <div className="metric-card metric-sandbox">
          <div className="metric-header">
            <span>🧪 Sandbox Testing</span>
            <span className="metric-icon">🟡</span>
          </div>
          <div className="metric-value">{metrics.sentSimulated}</div>
          <div className="metric-subtext">Simulated & safely logged</div>
        </div>

        <div className="metric-card metric-drafts">
          <div className="metric-header">
            <span>📝 Saved as Draft</span>
            <span className="metric-icon">📌</span>
          </div>
          <div className="metric-value">{metrics.drafts}</div>
          <div className="metric-subtext">Ready for review & send</div>
        </div>
      </div>

      {/* Visual Tone Distribution Analytics Bar */}
      {history.length > 0 && (
        <div className="tone-analytics-card">
          <div className="tone-analytics-header">
            <span className="analytics-title">📊 Tone Distribution Analysis</span>
            <div className="tone-legend-group">
              <span className="legend-item"><span className="legend-dot dot-prof"></span> Professional ({toneStats.prof})</span>
              <span className="legend-item"><span className="legend-dot dot-friend"></span> Friendly ({toneStats.friend})</span>
              <span className="legend-item"><span className="legend-dot dot-casual"></span> Casual ({toneStats.casual})</span>
              <span className="legend-item"><span className="legend-dot dot-urgent"></span> Urgent ({toneStats.urgent})</span>
            </div>
          </div>
          <div className="tone-segmented-bar">
            {toneStats.prof > 0 && <div className="seg seg-prof" style={{ width: `${toneStats.profPct}%` }} title={`Professional: ${toneStats.profPct}%`}></div>}
            {toneStats.friend > 0 && <div className="seg seg-friend" style={{ width: `${toneStats.friendPct}%` }} title={`Friendly: ${toneStats.friendPct}%`}></div>}
            {toneStats.casual > 0 && <div className="seg seg-casual" style={{ width: `${toneStats.casualPct}%` }} title={`Casual: ${toneStats.casualPct}%`}></div>}
            {toneStats.urgent > 0 && <div className="seg seg-urgent" style={{ width: `${toneStats.urgentPct}%` }} title={`Urgent: ${toneStats.urgentPct}%`}></div>}
          </div>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="history-controls-card">
        <div className="search-input-wrapper">
          <span className="input-icon">🔍</span>
          <input
            type="text"
            className="text-input"
            placeholder="Search by recipient, subject, sender, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="btn-clear-search" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>

        {/* Tone Filter Buttons */}
        <div className="filter-chips-group">
          <span className="filter-label">Tone:</span>
          {['ALL', 'PROFESSIONAL', 'FRIENDLY', 'CASUAL', 'URGENT'].map((t) => (
            <button
              key={t}
              type="button"
              className={`filter-chip ${selectedTone === t ? 'active' : ''}`}
              onClick={() => setSelectedTone(t)}
            >
              {t === 'ALL' ? 'All Tones' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Status Filter Buttons */}
        <div className="filter-chips-group">
          <span className="filter-label">Status:</span>
          {['ALL', 'SENT', 'DRAFT'].map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-chip ${selectedStatus === s ? 'active' : ''}`}
              onClick={() => setSelectedStatus(s)}
            >
              {s === 'ALL' ? 'All Status' : s}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="history-top-actions">
          <button type="button" className="btn-secondary" onClick={onRefresh} title="Sync latest history">
            <span>🔄</span> Refresh
          </button>
          <button type="button" className="btn-primary-action" onClick={onSwitchToStudio}>
            <span>✍️</span> Compose New Email
          </button>
        </div>
      </div>

      {/* History Items Grid */}
      {filteredHistory.length === 0 ? (
        <div className="empty-history-card">
          <div className="empty-icon">📭</div>
          <h3>No Emails Match Your Criteria</h3>
          <p>
            {history.length === 0
              ? 'You have not drafted or sent any emails yet. Jump into the Studio to craft your first AI email!'
              : 'No results found matching your search or filters. Try clearing filters to see all drafts.'}
          </p>
          <button type="button" className="btn-generate" onClick={onSwitchToStudio} style={{ marginTop: '12px' }}>
            <span>✍️ Open AI Email Studio</span>
          </button>
        </div>
      ) : (
        <div className="history-dashboard-grid">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="dashboard-email-card"
              onClick={() => setViewingItem(item)}
              title="Click to view full email details"
            >
              <div className="card-top-bar">
                <div className="card-addresses">
                  {item.sender && (
                    <span className="from-pill">From: {item.sender}</span>
                  )}
                  <span className="to-pill">To: {item.recipient || 'No Recipient'}</span>
                </div>
                <span className={`badge-tag ${(item.tone || 'professional').toLowerCase()}`}>
                  {item.tone || 'PROFESSIONAL'}
                </span>
              </div>

              <h4 className="card-subject-title">{item.subject || 'No Subject Defined'}</h4>
              <p className="card-body-snippet">
                {item.generatedContent || item.prompt}
              </p>

              <div className="card-footer-bar">
                <div className="status-indicator-tag">
                  <span className={`status-dot ${item.status?.includes('SENT') ? 'online' : 'draft'}`}></span>
                  <span style={{ color: item.status?.includes('SENT') ? '#34d399' : '#f59e0b', fontWeight: 600 }}>
                    {item.status || 'DRAFT'}
                  </span>
                </div>

                <div className="card-action-btns">
                  <span className="card-timestamp">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>

                  <button
                    type="button"
                    className="btn-card-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadDraft(item);
                    }}
                    title="Load in Studio to edit or send"
                  >
                    <span>✍️</span> Edit
                  </button>

                  <button
                    type="button"
                    className="btn-card-action"
                    onClick={(e) => handleCopyDraft(e, item)}
                    title="Copy full text to clipboard"
                  >
                    {copiedId === item.id ? '✓ Copied' : '📋 Copy'}
                  </button>

                  <button
                    type="button"
                    className="btn-card-action btn-danger-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this draft permanently?')) {
                        onDeleteDraft(e, item.id);
                      }
                    }}
                    title="Delete permanently"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Email Viewer Modal */}
      {viewingItem && (
        <div className="modal-backdrop" onClick={() => setViewingItem(null)}>
          <div className="modal-content viewer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge-tag ${(viewingItem.tone || 'professional').toLowerCase()}`}>
                  {viewingItem.tone}
                </span>
                <span className="status-pill-modal">
                  ● {viewingItem.status || 'DRAFT'}
                </span>
              </div>
              <button className="btn-close" onClick={() => setViewingItem(null)}>×</button>
            </div>

            <div className="viewer-meta-grid">
              <div>
                <span className="viewer-meta-label">Sender:</span>
                <strong>{viewingItem.sender || 'Default Sender'}</strong>
              </div>
              <div>
                <span className="viewer-meta-label">Recipient:</span>
                <strong>{viewingItem.recipient || 'None'}</strong>
              </div>
              <div>
                <span className="viewer-meta-label">Created At:</span>
                <span>{viewingItem.createdAt ? new Date(viewingItem.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>

            <div className="viewer-subject-box">
              <span className="viewer-meta-label">Subject:</span>
              <h3>{viewingItem.subject || 'No Subject'}</h3>
            </div>

            <div className="viewer-content-box">
              <span className="viewer-meta-label">Email Body:</span>
              <div className="viewer-text-body">
                {viewingItem.generatedContent || viewingItem.prompt}
              </div>
            </div>

            {viewingItem.prompt && viewingItem.generatedContent && (
              <div className="viewer-notes-box">
                <span className="viewer-meta-label">Original Prompt / Notes:</span>
                <p>{viewingItem.prompt}</p>
              </div>
            )}

            <div className="viewer-footer-actions">
              <button type="button" className="btn-secondary" onClick={() => setViewingItem(null)}>
                Close
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={(e) => handleCopyDraft(e, viewingItem)}
                >
                  {copiedId === viewingItem.id ? '✓ Copied!' : '📋 Copy Draft'}
                </button>
                <button
                  type="button"
                  className="btn-generate"
                  onClick={() => {
                    const itm = viewingItem;
                    setViewingItem(null);
                    onLoadDraft(itm);
                  }}
                >
                  <span>✍️ Load in Studio & Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryDashboard;
