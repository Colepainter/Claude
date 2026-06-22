"use client";

import { useState } from 'react';
import { Deal } from '@/lib/types';
import { STAGES } from '@/lib/constants';
import { todayISO } from '@/lib/helpers';

interface AddDealDrawerProps {
  onClose: () => void;
  onAdd: (deal: Omit<Deal, 'id'>) => void;
  onToast: (msg: string) => void;
}

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

export default function AddDealDrawer({ onClose, onAdd, onToast }: AddDealDrawerProps) {
  const [f, setF] = useState({
    name: '',
    contact: '',
    type: 'Commercial',
    location: '',
    product: '',
    value: '',
    stage: 'inquiry',
    health: 'warm',
    nextAction: '',
    nextDue: '',
    notes: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = () => {
    if (!f.name.trim()) return onToast('Name required');
    onAdd({
      name: f.name.trim(),
      contact: f.contact.trim(),
      type: f.type,
      location: f.location.trim(),
      product: f.product.trim(),
      value: Number(f.value) || 0,
      stage: f.stage,
      health: f.health,
      nextAction: f.nextAction.trim(),
      nextDue: f.nextDue,
      notes: f.notes.trim(),
      source: '',
      comms: [],
      documents: [],
      created: todayISO(),
    });
    onToast('Deal added');
    onClose();
  };

  const monoLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '.1em',
    cursor: 'pointer',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(8,7,5,.62)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <aside
        className="h-full overflow-y-auto"
        style={{
          width: 'min(560px, 100%)',
          background: 'var(--char-800)',
          borderLeft: '1px solid var(--line-2)',
          animation: 'drawerSlide .22s cubic-bezier(.2,.7,.2,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes drawerSlide {
            from { transform: translateX(28px); opacity: .5; }
            to { transform: none; opacity: 1; }
          }
          .add-input:focus { border-color: var(--orange) !important; }
        `}</style>

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
            New
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
            Add a deal
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 26px 40px' }}>
          <Block label="Name">
            <input
              className="add-input"
              style={inputStyle}
              value={f.name}
              onChange={set('name')}
              placeholder="Contact or project"
            />
          </Block>

          <Block label="Contact">
            <input
              className="add-input"
              style={inputStyle}
              value={f.contact}
              onChange={set('contact')}
              placeholder="Email · phone"
            />
          </Block>

          <div style={{ display: 'flex', gap: '9px' }}>
            <Block label="Type">
              <select
                className="add-input"
                style={inputStyle}
                value={f.type}
                onChange={set('type')}
              >
                <option value="Commercial">Commercial</option>
                <option value="Residential">Residential</option>
              </select>
            </Block>
            <Block label="Value ($)">
              <input
                className="add-input"
                style={inputStyle}
                type="number"
                value={f.value}
                onChange={set('value')}
                placeholder="0"
              />
            </Block>
          </div>

          <Block label="Location">
            <input
              className="add-input"
              style={inputStyle}
              value={f.location}
              onChange={set('location')}
              placeholder="City, State"
            />
          </Block>

          <Block label="Product">
            <input
              className="add-input"
              style={inputStyle}
              value={f.product}
              onChange={set('product')}
              placeholder="Refuge 2, Basin 4, etc."
            />
          </Block>

          <div style={{ display: 'flex', gap: '9px' }}>
            <Block label="Stage">
              <select
                className="add-input"
                style={inputStyle}
                value={f.stage}
                onChange={set('stage')}
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Block>
            <Block label="Health">
              <select
                className="add-input"
                style={inputStyle}
                value={f.health}
                onChange={set('health')}
              >
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </Block>
          </div>

          <Block label="Next Action">
            <input
              className="add-input"
              style={inputStyle}
              value={f.nextAction}
              onChange={set('nextAction')}
              placeholder="What's the next move?"
            />
          </Block>

          <Block label="Due">
            <input
              className="add-input"
              style={inputStyle}
              type="date"
              value={f.nextDue}
              onChange={set('nextDue')}
            />
          </Block>

          <Block label="Notes">
            <textarea
              className="add-input"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              rows={4}
              value={f.notes}
              onChange={set('notes')}
              placeholder="Anything relevant to this deal"
            />
          </Block>

          <button
            onClick={submit}
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
              ...monoLabelStyle,
            }}
          >
            Add deal
          </button>
        </div>
      </aside>
    </div>
  );
}
