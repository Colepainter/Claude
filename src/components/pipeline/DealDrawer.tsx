"use client";

import { useState, useEffect } from 'react';
import { Deal } from '@/lib/types';
import { STAGES, HEALTH, DOC_TYPES, COMM_CHANNELS } from '@/lib/constants';
import { usd, fmtDate, todayISO, draftFor } from '@/lib/helpers';

interface DealDrawerProps {
  deal: Deal;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Deal>) => void;
  onDelete: (id: string) => void;
  onToast: (msg: string) => void;
}

const stageIndex = (k: string) => Math.max(0, STAGES.findIndex((s) => s.key === k));

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--char-900)',
  border: '1px solid var(--line-2)',
  borderRadius: '7px',
  color: 'var(--cream)',
  fontFamily: 'var(--sans)',
  fontSize: '13.5px',
  padding: '11px 12px',
  outline: 'none',
};

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '9px',
          letterSpacing: '.12em',
          textTransform: 'uppercase' as const,
          color: 'var(--cream-faint)',
          marginBottom: '9px',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Fact({
  label,
  value,
  dot,
  wide,
}: {
  label: string;
  value: string;
  dot?: string;
  wide?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: wide ? '1 / -1' : undefined }}>
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '.14em',
          color: 'var(--cream-faint)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '13px',
          color: 'var(--cream)',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
        }}
      >
        {dot && (
          <i
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dot,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
        )}
        {value || '—'}
      </span>
    </div>
  );
}

export default function DealDrawer({ deal, onClose, onUpdate, onDelete, onToast }: DealDrawerProps) {
  const idx = stageIndex(deal.stage);
  const [tab, setTab] = useState<'overview' | 'comms' | 'docs' | 'draft'>('overview');
  const [na, setNa] = useState(deal.nextAction || '');
  const [nd, setNd] = useState(deal.nextDue || '');
  const [notes, setNotes] = useState(deal.notes || '');
  const [draft, setDraft] = useState('');
  const [cChan, setCChan] = useState('Call');
  const [cNote, setCNote] = useState('');
  const [docType, setDocType] = useState('Plan Set');
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    setNa(deal.nextAction || '');
    setNd(deal.nextDue || '');
    setNotes(deal.notes || '');
    setDraft('');
  }, [deal.id]);

  const moveStage = (key: string) => {
    const stageLabel = STAGES[stageIndex(key)].label;
    const entry = {
      id: 'c' + Date.now(),
      date: todayISO(),
      channel: 'Stage',
      note: 'Moved to ' + stageLabel,
    };
    onUpdate(deal.id, { stage: key, comms: [entry, ...(deal.comms || [])] });
    onToast('Moved to ' + stageLabel);
  };

  const saveAction = () => {
    onUpdate(deal.id, { nextAction: na, nextDue: nd });
    onToast('Next action saved');
  };

  const doneAction = () => {
    const entry = {
      id: 'c' + Date.now(),
      date: todayISO(),
      channel: 'Done',
      note: '✓ ' + (deal.nextAction || 'action'),
    };
    onUpdate(deal.id, {
      comms: [entry, ...(deal.comms || [])],
      nextAction: '',
      nextDue: '',
    });
    setNa('');
    setNd('');
    onToast('Marked done & logged');
  };

  const saveNotes = () => {
    onUpdate(deal.id, { notes });
    onToast('Notes saved');
  };

  const logComm = () => {
    if (!cNote.trim()) return;
    const entry = {
      id: 'c' + Date.now(),
      date: todayISO(),
      channel: cChan,
      note: cNote.trim(),
    };
    onUpdate(deal.id, { comms: [entry, ...(deal.comms || [])] });
    setCNote('');
    onToast('Logged');
  };

  const genDraft = () => setDraft(draftFor(deal));

  const copyDraft = () => {
    navigator.clipboard?.writeText(draft);
    onToast('Copied to clipboard');
  };

  const addDoc = () => {
    if (!docUrl.trim()) return;
    const entry = {
      id: 'g' + Date.now(),
      type: docType,
      url: docUrl.trim(),
      shared: false,
      date: todayISO(),
    };
    onUpdate(deal.id, { documents: [entry, ...(deal.documents || [])] });
    setDocUrl('');
    onToast('Document linked');
  };

  const toggleShared = (id: string) => {
    onUpdate(deal.id, {
      documents: (deal.documents || []).map((g) =>
        g.id === id ? { ...g, shared: !g.shared } : g
      ),
    });
  };

  const removeDoc = (id: string) => {
    onUpdate(deal.id, {
      documents: (deal.documents || []).filter((g) => g.id !== id),
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${deal.name}?`)) {
      onDelete(deal.id);
    }
  };

  const h = HEALTH[deal.health] || HEALTH.cold;

  const tabLabels: Record<string, string> = {
    overview: 'Overview',
    comms: 'Communications',
    docs: 'Documents',
    draft: 'Draft Follow-up',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(8,7,5,.62)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <style>{`
        @keyframes dealDrawerSlide {
          from { transform: translateX(28px); opacity: .5; }
          to { transform: none; opacity: 1; }
        }
        .dd-input:focus { border-color: var(--orange) !important; }
        .dd-input { transition: border-color .15s; }
        .dd-step-cur { background: var(--dd-heat) !important; border-color: var(--dd-heat) !important; box-shadow: 0 0 16px -2px var(--dd-heat) !important; }
        .dd-step-cur .dd-step-code, .dd-step-cur .dd-step-name { color: #fff !important; }
        .dd-step-done { border-color: var(--line-2) !important; }
        .dd-step-done .dd-step-code { color: var(--cream-dim) !important; }
        .dd-btn-ghost:hover { color: var(--cream) !important; border-color: var(--cream-dim) !important; }
        .dd-btn-solid:hover { background: var(--orange-2) !important; }
        .dd-tab-active { color: var(--cream) !important; }
        .dd-tab-active::after { content: ""; position: absolute; left: 12px; right: 12px; bottom: -1px; height: 2px; background: var(--orange); }
        .dd-del:hover { background: rgba(232,90,35,.12) !important; }
        .dd-doc-x:hover { color: var(--orange) !important; }
        .dd-doc-share-on { color: #fff !important; background: #2f7a3f !important; border-color: #2f7a3f !important; }
        .dd-step:hover { border-color: var(--cream-faint) !important; }
      `}</style>

      <aside
        className="h-full overflow-y-auto"
        style={{
          width: 'min(560px, 100%)',
          background: 'var(--char-800)',
          borderLeft: '1px solid var(--line-2)',
          animation: 'dealDrawerSlide .22s cubic-bezier(.2,.7,.2,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            position: 'relative',
            padding: '26px 26px 22px',
            background: 'var(--char-850)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'none',
              border: 'none',
              color: 'var(--cream-faint)',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            &#x2715;
          </button>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: 'var(--orange)',
            }}
          >
            {deal.type}
          </div>
          <h2
            style={{
              fontSize: '23px',
              fontWeight: 800,
              margin: '8px 0 4px',
              letterSpacing: '-.01em',
              color: 'var(--cream)',
            }}
          >
            {deal.name}
          </h2>
          <div style={{ fontSize: '12.5px', color: 'var(--cream-dim)' }}>{deal.contact}</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '13px 18px',
              marginTop: '18px',
            }}
          >
            <Fact label="Value" value={deal.value ? usd(deal.value) : '—'} />
            <Fact label="Health" value={h.label} dot={h.c} />
            <Fact label="Location" value={deal.location} wide />
            <Fact label="Product" value={deal.product} wide />
          </div>
        </div>

        {/* Stage stepper */}
        <div
          style={{
            padding: '18px 26px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '9px',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'var(--cream-faint)',
              marginBottom: '11px',
            }}
          >
            Stage &middot; tap to advance
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {STAGES.map((s, i) => {
              const isCur = i === idx;
              const isDone = i < idx;
              return (
                <button
                  key={s.key}
                  className={`dd-step${isCur ? ' dd-step-cur' : ''}${isDone ? ' dd-step-done' : ''}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 3px',
                    background: 'var(--char-750)',
                    border: '1px solid var(--line)',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    transition: '.14s',
                    minWidth: 0,
                    ['--dd-heat' as string]: s.heat,
                  }}
                  onClick={() => moveStage(s.key)}
                  title={s.label}
                >
                  <span
                    className="dd-step-code"
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--cream-faint)',
                    }}
                  >
                    {s.code}
                  </span>
                  <span
                    className="dd-step-name"
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '7px',
                      color: 'var(--cream-faint)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      letterSpacing: '.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            padding: '0 26px',
            background: 'var(--char-850)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          {(['overview', 'comms', 'docs', 'draft'] as const).map((t) => (
            <button
              key={t}
              className={tab === t ? 'dd-tab-active' : ''}
              style={{
                background: 'none',
                border: 'none',
                color: tab === t ? 'var(--cream)' : 'var(--cream-faint)',
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                padding: '14px 12px',
                position: 'relative',
              }}
              onClick={() => setTab(t)}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div style={{ padding: '22px 26px 40px' }}>
          {/* Overview tab */}
          {tab === 'overview' && (
            <>
              <Block label="Next Action">
                <input
                  className="dd-input"
                  style={inputStyle}
                  value={na}
                  onChange={(e) => setNa(e.target.value)}
                  placeholder="What's the next move?"
                />
                <div style={{ display: 'flex', gap: '9px', marginTop: '9px', alignItems: 'center' }}>
                  <input
                    className="dd-input"
                    style={{ ...inputStyle, flex: 1 }}
                    type="date"
                    value={nd}
                    onChange={(e) => setNd(e.target.value)}
                  />
                  <button
                    className="dd-btn-solid"
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '10px',
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      border: '1px solid var(--orange)',
                      background: 'var(--orange)',
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onClick={saveAction}
                  >
                    Save
                  </button>
                  <button
                    className="dd-btn-ghost"
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '10px',
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      border: '1px solid var(--line-2)',
                      background: 'transparent',
                      color: 'var(--cream-dim)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onClick={doneAction}
                  >
                    Mark done
                  </button>
                </div>
              </Block>

              <Block label="Notes">
                <textarea
                  className="dd-input"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                  rows={8}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button
                  className="dd-btn-ghost"
                  style={{
                    marginTop: '9px',
                    fontFamily: 'var(--mono)',
                    fontSize: '10px',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    border: '1px solid var(--line-2)',
                    background: 'transparent',
                    color: 'var(--cream-dim)',
                  }}
                  onClick={saveNotes}
                >
                  Save notes
                </button>
              </Block>

              {deal.source && (
                <Block label="Source">
                  <a
                    href={deal.source}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--orange)', fontSize: '12.5px', wordBreak: 'break-all' }}
                  >
                    {deal.source}
                  </a>
                </Block>
              )}

              <button
                className="dd-del"
                style={{
                  background: 'none',
                  border: '1px solid rgba(232,90,35,.4)',
                  color: '#e87a52',
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
                onClick={handleDelete}
              >
                Delete deal
              </button>
            </>
          )}

          {/* Communications tab */}
          {tab === 'comms' && (
            <>
              <Block label="Log Communication">
                <div style={{ display: 'flex', gap: '9px', alignItems: 'center' }}>
                  <select
                    className="dd-input"
                    style={{ ...inputStyle, flex: 1 }}
                    value={cChan}
                    onChange={(e) => setCChan(e.target.value)}
                  >
                    {COMM_CHANNELS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    className="dd-btn-solid"
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '10px',
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      border: '1px solid var(--orange)',
                      background: 'var(--orange)',
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onClick={logComm}
                  >
                    Log
                  </button>
                </div>
                <textarea
                  className="dd-input"
                  style={{ ...inputStyle, marginTop: '9px', resize: 'vertical', lineHeight: 1.5 }}
                  rows={3}
                  value={cNote}
                  onChange={(e) => setCNote(e.target.value)}
                  placeholder="What happened?"
                />
              </Block>

              <div style={{ marginTop: '6px' }}>
                {(deal.comms || []).map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '13px 0',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '5px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: '9px',
                          letterSpacing: '.1em',
                          textTransform: 'uppercase',
                          color: 'var(--orange)',
                        }}
                      >
                        {c.channel}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: '10px',
                          color: 'var(--cream-faint)',
                        }}
                      >
                        {fmtDate(c.date)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--cream-dim)',
                        lineHeight: 1.5,
                      }}
                    >
                      {c.note}
                    </div>
                  </div>
                ))}
                {(!deal.comms || deal.comms.length === 0) && (
                  <div style={{ fontSize: '11px', color: 'var(--cream-faint)', padding: '6px 2px' }}>
                    No history yet.
                  </div>
                )}
              </div>
            </>
          )}

          {/* Documents tab */}
          {tab === 'docs' && (
            <>
              <p
                style={{
                  fontSize: '12.5px',
                  color: 'var(--cream-dim)',
                  lineHeight: 1.5,
                  margin: '0 0 14px',
                }}
              >
                Files live in Drive — paste the share link here. The Sales OS tracks the pointer, not
                the file, so your build partner always gets a working link.
              </p>

              <Block label="Link a Document">
                <div style={{ display: 'flex', gap: '9px', alignItems: 'center' }}>
                  <select
                    className="dd-input"
                    style={{ ...inputStyle, flex: 1 }}
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    {DOC_TYPES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    className="dd-btn-solid"
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '10px',
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      border: '1px solid var(--orange)',
                      background: 'var(--orange)',
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onClick={addDoc}
                  >
                    Link
                  </button>
                </div>
                <input
                  className="dd-input"
                  style={{ ...inputStyle, marginTop: '9px' }}
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="Paste Drive / Dropbox share link"
                />
              </Block>

              <div style={{ marginTop: '6px' }}>
                {(deal.documents || []).map((g) => (
                  <div
                    key={g.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '13px 0',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          display: 'block',
                          fontFamily: 'var(--mono)',
                          fontSize: '9px',
                          letterSpacing: '.1em',
                          textTransform: 'uppercase',
                          color: 'var(--orange)',
                          marginBottom: '4px',
                        }}
                      >
                        {g.type}
                      </span>
                      <a
                        href={g.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '12px',
                          color: 'var(--cream-dim)',
                          wordBreak: 'break-all',
                          textDecoration: 'none',
                        }}
                      >
                        {g.url}
                      </a>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0,
                      }}
                    >
                      {g.type === 'Plan Set' && (
                        <button
                          className={g.shared ? 'dd-doc-share-on' : ''}
                          style={{
                            fontFamily: 'var(--mono)',
                            fontSize: '8.5px',
                            letterSpacing: '.05em',
                            textTransform: 'uppercase',
                            color: 'var(--cream-faint)',
                            background: 'transparent',
                            border: '1px solid var(--line-2)',
                            borderRadius: '5px',
                            padding: '5px 8px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => toggleShared(g.id)}
                        >
                          {g.shared ? '✓ Sent to build partner' : 'Mark sent to partner'}
                        </button>
                      )}
                      <button
                        className="dd-doc-x"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--cream-faint)',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                        onClick={() => removeDoc(g.id)}
                        title="Remove link"
                      >
                        &#x2715;
                      </button>
                    </div>
                  </div>
                ))}
                {(!deal.documents || deal.documents.length === 0) && (
                  <div style={{ fontSize: '11px', color: 'var(--cream-faint)', padding: '6px 2px' }}>
                    No documents linked yet. Drop in the plan set, proposal, site photos, or contract.
                  </div>
                )}
              </div>
            </>
          )}

          {/* Draft tab */}
          {tab === 'draft' && (
            <>
              <p
                style={{
                  fontSize: '12.5px',
                  color: 'var(--cream-dim)',
                  lineHeight: 1.5,
                  margin: '0 0 14px',
                }}
              >
                Generates a follow-up in your voice based on this deal&apos;s stage. Edit, then copy
                into Gmail.
              </p>
              <button
                className="dd-btn-solid"
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  borderRadius: '6px',
                  padding: '10px 15px',
                  cursor: 'pointer',
                  border: '1px solid var(--orange)',
                  background: 'var(--orange)',
                  color: '#fff',
                }}
                onClick={genDraft}
              >
                Generate draft
              </button>
              {draft && (
                <>
                  <textarea
                    className="dd-input"
                    style={{ ...inputStyle, marginTop: '14px', resize: 'vertical', lineHeight: 1.5 }}
                    rows={12}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button
                    className="dd-btn-ghost"
                    style={{
                      marginTop: '9px',
                      fontFamily: 'var(--mono)',
                      fontSize: '10px',
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      border: '1px solid var(--line-2)',
                      background: 'transparent',
                      color: 'var(--cream-dim)',
                    }}
                    onClick={copyDraft}
                  >
                    Copy
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
