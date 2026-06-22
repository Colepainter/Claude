"use client";

import { Deal } from '@/lib/types';
import { STAGES, HEALTH } from '@/lib/constants';
import { usd, fmtDate, daysUntil } from '@/lib/helpers';

interface PipelineCardProps {
  deal: Deal;
  onOpen: (id: string) => void;
}

const stageIndex = (k: string) => Math.max(0, STAGES.findIndex((s) => s.key === k));

export default function PipelineCard({ deal, onOpen }: PipelineCardProps) {
  const idx = stageIndex(deal.stage);
  const h = HEALTH[deal.health] || HEALTH.cold;
  const du = daysUntil(deal.nextDue);
  const overdue = du !== null && du < 0 && deal.stage !== 'complete';
  const docs = deal.documents || [];
  const planSet = docs.find((g) => g.type === 'Plan Set');
  const planSetUnsent = planSet && !planSet.shared;

  return (
    <button
      className="w-full text-left rounded-lg cursor-pointer flex flex-col transition-all duration-150"
      style={{
        background: '#f4ede2',
        color: '#1a1611',
        border: 'none',
        padding: '13px',
        gap: '8px',
        boxShadow: '0 1px 0 rgba(0,0,0,.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => onOpen(deal.id)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 22px rgba(0,0,0,.4)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = '';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 0 rgba(0,0,0,.3)';
      }}
    >
      {/* Top row: type + badges + health dot */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '8.5px',
            color: '#8a7f6d',
            textTransform: 'uppercase',
            letterSpacing: '.14em',
          }}
        >
          {deal.type}
        </span>
        <div className="flex items-center" style={{ gap: '7px' }}>
          {docs.length > 0 && (
            <span
              title={`${docs.length} linked document(s)`}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '9.5px',
                color: '#6a6051',
                background: 'rgba(26,22,17,.07)',
                borderRadius: '5px',
                padding: '2px 6px',
                letterSpacing: '.03em',
              }}
            >
              {'\u{1F4C4}'} {docs.length}
            </span>
          )}
          {planSetUnsent && (
            <span
              title="Plan set linked but not marked sent to build partner"
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '8.5px',
                textTransform: 'uppercase',
                letterSpacing: '.05em',
                color: '#fff',
                background: 'var(--orange)',
                borderRadius: '5px',
                padding: '2px 6px',
              }}
            >
              plan set &#x26A0;
            </span>
          )}
          <i
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: h.c,
              display: 'inline-block',
              flexShrink: 0,
            }}
            title={h.label}
          />
        </div>
      </div>

      {/* Deal name */}
      <div
        style={{
          fontWeight: 750,
          fontSize: '14px',
          lineHeight: 1.15,
          color: '#1a1611',
        }}
      >
        {deal.name}
      </div>

      {/* Product line */}
      {deal.product && (
        <div
          style={{
            fontSize: '11.5px',
            color: '#6a6051',
            lineHeight: 1.35,
          }}
        >
          {deal.product}
        </div>
      )}

      {/* Value + stage progress pips */}
      <div className="flex items-center justify-between" style={{ marginTop: '2px' }}>
        <span
          style={{
            fontWeight: 750,
            fontSize: '13px',
            fontVariantNumeric: 'tabular-nums',
            color: '#1a1611',
          }}
        >
          {deal.value ? usd(deal.value) : '—'}
        </span>
        <div className="flex" style={{ gap: '3px' }}>
          {STAGES.map((s, i) => (
            <i
              key={s.key}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: i <= idx ? s.heat : 'rgba(26,22,17,.14)',
                display: 'inline-block',
              }}
            />
          ))}
        </div>
      </div>

      {/* Next action */}
      {deal.nextAction && deal.stage !== 'complete' && (
        <div
          className="flex items-center"
          style={{
            gap: '6px',
            marginTop: '4px',
            paddingTop: '9px',
            borderTop: '1px solid rgba(26,22,17,.10)',
            fontSize: '11px',
            color: overdue ? '#c0431a' : '#5a5142',
          }}
        >
          <span style={{ color: 'var(--orange)', fontWeight: 700, flexShrink: 0 }}>
            &#x2192;
          </span>
          <span style={{ flex: 1, lineHeight: 1.3 }}>{deal.nextAction}</span>
          {deal.nextDue && (
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                whiteSpace: 'nowrap',
              }}
            >
              {overdue ? 'overdue' : fmtDate(deal.nextDue)}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
