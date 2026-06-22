"use client";

import { useState, useMemo } from 'react';
import { Deal } from '@/lib/types';
import { STAGES, HEALTH } from '@/lib/constants';
import { usd, usdShort, fmtDate, daysUntil } from '@/lib/helpers';
import PipelineCard from './PipelineCard';
import DealDrawer from './DealDrawer';
import AddDealDrawer from './AddDealDrawer';

interface PipelineProps {
  deals: Deal[];
  onUpdateDeal: (id: string, patch: Partial<Deal>) => void;
  onAddDeal: (deal: Omit<Deal, 'id'>) => void;
  onDeleteDeal: (id: string) => void;
  onToast: (msg: string) => void;
}

const stageIndex = (k: string) => Math.max(0, STAGES.findIndex((s) => s.key === k));

function actionsDue(deals: Deal[]) {
  let overdue = 0;
  deals.forEach((d) => {
    if (d.stage === 'complete' || !d.nextAction) return;
    const du = daysUntil(d.nextDue);
    if (du !== null && du < 0) overdue++;
  });
  return { overdue };
}

export default function Pipeline({ deals, onUpdateDeal, onAddDeal, onDeleteDeal, onToast }: PipelineProps) {
  const [view, setView] = useState<'pipeline' | 'today'>('pipeline');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Residential' | 'Commercial'>('All');
  const [showClosed, setShowClosed] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const metrics = useMemo(() => {
    const open = deals.filter((d) => d.stage !== 'complete');
    const pipeline = open.reduce((s, d) => s + (Number(d.value) || 0), 0);
    const needsAction = open.filter((d) => {
      if (!d.nextAction) return false;
      const du = daysUntil(d.nextDue);
      return du !== null && du <= 0;
    }).length;
    const hot = deals.filter((d) => d.health === 'hot' && d.stage !== 'complete').length;
    return { pipeline, needsAction, hot, open: open.length };
  }, [deals]);

  const visible = useMemo(
    () => deals.filter((d) => typeFilter === 'All' || d.type === typeFilter),
    [deals, typeFilter]
  );

  const { overdue } = actionsDue(deals);
  const sel = deals.find((d) => d.id === selId) || null;

  const handleDeleteDeal = (id: string) => {
    onDeleteDeal(id);
    setSelId(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--char-900)', color: 'var(--cream)' }}>
      <style>{`
        @keyframes pipelineFade { from { opacity: 0; } to { opacity: 1; } }
        .pipe-tab { position: relative; background: none; border: none; cursor: pointer; font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; padding: 15px 14px; color: var(--cream-faint); transition: color .15s; }
        .pipe-tab.on { color: var(--cream); }
        .pipe-tab.on::after { content: ""; position: absolute; left: 14px; right: 14px; bottom: -1px; height: 2px; background: var(--orange); }
        .pipe-fbtn { font-family: var(--mono); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--cream-faint); background: transparent; border: 1px solid var(--line); border-radius: 20px; padding: 6px 13px; cursor: pointer; transition: .13s; }
        .pipe-fbtn.on { color: #1a1611; background: var(--cream); border-color: var(--cream); }
        .pipe-col-empty { font-size: 11px; color: var(--cream-faint); line-height: 1.5; padding: 6px 2px; }
        .pipe-row:hover { border-color: var(--line-2) !important; background: var(--char-800) !important; }
        .pipe-add-btn:hover { background: var(--orange-2) !important; }
        .pipe-new-btn:hover { color: var(--cream) !important; border-color: var(--cream-dim) !important; }
      `}</style>

      {/* Metrics bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          padding: '16px 26px',
          background: 'var(--char-850)',
          borderBottom: '1px solid var(--line)',
          flexWrap: 'wrap',
        }}
      >
        <Metric label="Open Pipeline" value={usd(metrics.pipeline)} />
        <Metric label="Active Deals" value={String(metrics.open)} />
        <Metric label="Hot" value={String(metrics.hot)} dot="#e85a23" />
        <Metric
          label="Needs Action"
          value={String(metrics.needsAction)}
          accent={metrics.needsAction > 0}
          dot={metrics.needsAction > 0 ? '#e85a23' : undefined}
        />
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="pipe-add-btn"
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
              transition: '.15s',
            }}
            onClick={() => setAdding(true)}
          >
            + New Deal
          </button>
        </div>
      </div>

      {/* View tabs + filter */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 26px',
          background: 'var(--char-850)',
          borderBottom: '1px solid var(--line)',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`pipe-tab${view === 'pipeline' ? ' on' : ''}`}
            onClick={() => setView('pipeline')}
          >
            Pipeline
          </button>
          <button
            className={`pipe-tab${view === 'today' ? ' on' : ''}`}
            onClick={() => setView('today')}
          >
            Today &amp; This Week
            {overdue > 0 && (
              <span
                style={{
                  marginLeft: '7px',
                  background: 'var(--orange)',
                  color: '#fff',
                  borderRadius: '9px',
                  fontSize: '10px',
                  padding: '1px 6px',
                }}
              >
                {overdue}
              </span>
            )}
          </button>
        </div>

        {view === 'pipeline' && (
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {(['All', 'Residential', 'Commercial'] as const).map((t) => (
              <button
                key={t}
                className={`pipe-fbtn${typeFilter === t ? ' on' : ''}`}
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </button>
            ))}
            <span
              style={{
                width: '1px',
                height: '18px',
                background: 'var(--line-2)',
                margin: '0 4px',
                display: 'inline-block',
              }}
            />
            <button
              className={`pipe-fbtn${showClosed ? ' on' : ''}`}
              onClick={() => setShowClosed((v) => !v)}
            >
              {showClosed ? 'Hide closed' : 'Show closed'}
            </button>
          </div>
        )}
      </nav>

      {/* Body */}
      {view === 'pipeline' ? (
        <PipelineView deals={visible} onOpen={setSelId} showClosed={showClosed} />
      ) : (
        <TodayView deals={deals} onOpen={setSelId} />
      )}

      {/* Deal drawer */}
      {sel && (
        <DealDrawer
          deal={sel}
          onClose={() => setSelId(null)}
          onUpdate={onUpdateDeal}
          onDelete={handleDeleteDeal}
          onToast={onToast}
        />
      )}

      {/* Add deal drawer */}
      {adding && (
        <AddDealDrawer
          onClose={() => setAdding(false)}
          onAdd={onAddDeal}
          onToast={onToast}
        />
      )}
    </div>
  );
}

/* ---------- Metric ---------- */
function Metric({
  label,
  value,
  accent,
  dot,
}: {
  label: string;
  value: string;
  accent?: boolean;
  dot?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '9.5px',
          textTransform: 'uppercase',
          letterSpacing: '.14em',
          color: 'var(--cream-faint)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '19px',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          color: accent ? 'var(--orange)' : 'var(--cream)',
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
            }}
          />
        )}
        {value}
      </span>
    </div>
  );
}

/* ---------- Pipeline view ---------- */
function PipelineView({
  deals,
  onOpen,
  showClosed,
}: {
  deals: Deal[];
  onOpen: (id: string) => void;
  showClosed: boolean;
}) {
  const byStage = (k: string) => deals.filter((d) => d.stage === k);
  const stages = showClosed
    ? STAGES
    : STAGES.filter((s) => s.key !== 'production' && s.key !== 'complete');
  const closedCount = deals.filter(
    (d) => d.stage === 'production' || d.stage === 'complete'
  ).length;

  return (
    <div style={{ padding: '22px 26px 60px' }}>
      {/* Thermal rail */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${stages.length}, 1fr)`,
          gap: '3px',
          marginBottom: '26px',
        }}
      >
        {stages.map((s) => {
          const ds = byStage(s.key);
          const sum = ds.reduce((a, d) => a + (Number(d.value) || 0), 0);
          return (
            <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div
                style={{
                  height: '5px',
                  borderRadius: '3px',
                  background: s.heat,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: s.heat,
                  }}
                >
                  {s.code}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '9.5px',
                    textTransform: 'uppercase',
                    letterSpacing: '.14em',
                    color: 'var(--cream-dim)',
                  }}
                >
                  {s.label}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  color: 'var(--cream-faint)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span>
                  {ds.length} deal{ds.length === 1 ? '' : 's'}
                </span>
                {sum > 0 && <span>{usdShort(sum)}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${stages.length}, minmax(168px, 1fr))`,
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}
      >
        {stages.map((s) => {
          const ds = byStage(s.key);
          return (
            <div
              key={s.key}
              style={{
                background: 'var(--char-850)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                minHeight: '140px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Column header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 13px',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: s.heat,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '.14em',
                    color: 'var(--cream-dim)',
                    flex: 1,
                  }}
                >
                  {s.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '11px',
                    color: 'var(--cream-faint)',
                  }}
                >
                  {ds.length}
                </span>
              </div>

              {/* Column body */}
              <div
                style={{
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {ds.length === 0 ? (
                  <div className="pipe-col-empty">{s.blurb}</div>
                ) : (
                  ds.map((d) => <PipelineCard key={d.id} deal={d} onOpen={onOpen} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!showClosed && closedCount > 0 && (
        <div
          style={{
            marginTop: '16px',
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            letterSpacing: '.04em',
            color: 'var(--cream-faint)',
            textAlign: 'center',
          }}
        >
          {closedCount} closed deal{closedCount === 1 ? '' : 's'} hidden — use &ldquo;Show closed&rdquo; to view production &amp; completed.
        </div>
      )}
    </div>
  );
}

/* ---------- Today view ---------- */
function TodayView({ deals, onOpen }: { deals: Deal[]; onOpen: (id: string) => void }) {
  const items = deals
    .filter((d) => d.nextAction && d.stage !== 'complete')
    .map((d) => ({ d, du: daysUntil(d.nextDue) }));

  const buckets: {
    key: string;
    label: string;
    test: (du: number | null) => boolean;
  }[] = [
    { key: 'od', label: 'Overdue', test: (du) => du !== null && du < 0 },
    { key: 'td', label: 'Today', test: (du) => du === 0 },
    { key: 'wk', label: 'Next 7 Days', test: (du) => du !== null && du > 0 && du <= 7 },
    { key: 'lt', label: 'Later', test: (du) => du !== null && (du as number) > 7 },
    { key: 'nd', label: 'No Date', test: (du) => du === null },
  ];

  return (
    <div style={{ padding: '24px 26px 60px', maxWidth: '920px' }}>
      {buckets.map((b) => {
        const rows = items.filter((it) => b.test(it.du));
        if (!rows.length) return null;
        return (
          <div key={b.key} style={{ marginBottom: '26px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '11px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '.14em',
                  color: b.key === 'od' ? 'var(--orange)' : 'var(--cream-dim)',
                }}
              >
                {b.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  color: 'var(--cream-faint)',
                }}
              >
                {rows.length}
              </span>
            </div>
            {rows.map(({ d, du }) => {
              const s = STAGES[stageIndex(d.stage)];
              const h = HEALTH[d.health] || HEALTH.cold;
              return (
                <button
                  key={d.id}
                  className="pipe-row"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    background: 'var(--char-850)',
                    border: '1px solid var(--line)',
                    borderRadius: '9px',
                    marginBottom: '7px',
                    cursor: 'pointer',
                    transition: '.13s',
                    color: 'var(--cream)',
                  }}
                  onClick={() => onOpen(d.id)}
                >
                  <i
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      background: h.c,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>
                      {d.name}
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: '9px',
                          color: 'var(--cream-faint)',
                          letterSpacing: '.1em',
                          marginLeft: '8px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {d.type}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '12.5px',
                        color: 'var(--cream-dim)',
                        marginTop: '3px',
                      }}
                    >
                      {d.nextAction}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '10px',
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                        color: s.heat,
                      }}
                    >
                      {s.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '11px',
                        fontVariantNumeric: 'tabular-nums',
                        color: du !== null && du < 0 ? 'var(--orange)' : 'var(--cream-faint)',
                      }}
                    >
                      {d.nextDue ? fmtDate(d.nextDue) : '—'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
      {items.length === 0 && (
        <div
          style={{
            padding: '80px 0',
            textAlign: 'center',
            color: 'var(--cream-faint)',
            fontSize: '14px',
          }}
        >
          No open actions. Pipeline&apos;s clear — go build.
        </div>
      )}
    </div>
  );
}
