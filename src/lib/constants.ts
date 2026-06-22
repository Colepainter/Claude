import { Stage, SectionDef } from './types';

export const STAGES: Stage[] = [
  { key: 'inquiry', label: 'Inquiry', code: '01', prob: 0.10, heat: '#4f6d7a', blurb: 'New contact in.' },
  { key: 'consult', label: 'Consultation', code: '02', prob: 0.25, heat: '#6a8079', blurb: 'Discovery / design call.' },
  { key: 'design', label: 'Design Locked', code: '03', prob: 0.50, heat: '#998a5f', blurb: 'Model, finishes & scope finalized.' },
  { key: 'proposal', label: 'Proposal Sent', code: '04', prob: 0.65, heat: '#c0823f', blurb: 'Estimate + brochure + build plan out.' },
  { key: 'deposit', label: 'Hold Deposit', code: '05', prob: 0.85, heat: '#d96a2b', blurb: '$450 deposit — production slot locked.' },
  { key: 'production', label: 'In Production', code: '06', prob: 0.95, heat: '#e85a23', blurb: '80% down — building (12-wk lead).' },
  { key: 'complete', label: 'Completed', code: '07', prob: 1.00, heat: '#ff4d12', blurb: 'Installed · 20% balance · sign-off.' },
];

export const HEALTH: Record<string, { c: string; label: string }> = {
  hot: { c: '#e85a23', label: 'Hot' },
  warm: { c: '#d8a24a', label: 'Warm' },
  cold: { c: '#5b7a8c', label: 'Cold' },
};

export const INCLUDE_KEYS: [string, string][] = [
  ['sitePlan', 'Site plan'],
  ['structural', 'Structural'],
  ['anchorage', 'Anchorage'],
  ['utilities', 'Utilities'],
  ['elevations', 'Elevations'],
];

export const RES_TYPES = ['Brochure', 'Pricing sheet', 'Google Sheet', 'Spec sheet', 'Link'];
export const LIB_TYPES = ['Folder', 'Brochure', 'Pricing', 'Google Sheet', 'Doc', 'Link'];
export const DOC_TYPES = ['Plan Set', 'Proposal', 'Site Photos', 'Contract', 'Other'];
export const COMM_CHANNELS = ['Call', 'Email', 'Text', 'Meeting', 'Note'];

export const SECTIONS: SectionDef[] = [
  {
    id: 'suppliers', label: 'Suppliers', title: 'Suppliers',
    desc: 'Build partners and material suppliers — with one-tap contact.',
    lede: 'Everyone in the supply chain, contactable in one tap.',
    titleField: 'name', icon: 'truck',
    fields: [
      { key: 'name', label: 'Supplier / partner', type: 'text', req: true },
      { key: 'role', label: 'Role', type: 'select', opts: ['Build partner', 'Material supplier', 'Install partner', 'Logistics', 'Other'] },
      { key: 'status', label: 'Status', type: 'select', opts: ['Preferred', 'Backup', 'Trial'] },
      { key: 'category', label: 'Supplies / scope', type: 'text', ph: 'Heaters & sauna components' },
      { key: 'contactName', label: 'Contact name', type: 'text', ph: 'Sadie Stayner' },
      { key: 'email', label: 'Email', type: 'text', mono: true, ph: 'name@vendor.com' },
      { key: 'phone', label: 'Phone', type: 'text', mono: true, ph: '801-555-0100' },
      { key: 'website', label: 'Website', type: 'text', mono: true, ph: 'https://…' },
      { key: 'leadTime', label: 'Lead time', type: 'text', mono: true, ph: '5–6 wks' },
      { key: 'supplyType', label: 'Supply responsibility', type: 'select', opts: ['', 'NP-supplied', 'Partner-sourced'] },
      { key: 'supplies', label: 'Details', type: 'textarea', ph: 'Specific products, terms, anything the team needs.' },
      { key: 'notes', label: 'Notes', type: 'textarea', ph: 'Address, account terms, flags.' },
    ],
  },
  {
    id: 'products', label: 'Products', title: 'Products',
    desc: 'Each NP unit — specs, revs, and attached resources.',
    lede: 'The model line as it stands today, with brochures and sheets attached.',
    titleField: 'name', icon: 'box',
    fields: [
      { key: 'name', label: 'Product name', type: 'text', req: true, ph: 'Refuge 2 — 2-Person Cabin Sauna' },
      { key: 'rev', label: 'Revision', type: 'text', mono: true, ph: 'Rev C' },
      { key: 'status', label: 'Status', type: 'select', opts: ['Active', 'In design', 'Retired'] },
      { key: 'dimensions', label: 'Dimensions', type: 'text', mono: true, ph: "6'x4'x7' (84\" H)" },
      { key: 'priceBand', label: 'Price band', type: 'text', mono: true, ph: '$24k–$28k' },
      { key: 'leadTime', label: 'Lead time', type: 'text', mono: true, ph: '8–10 wks' },
      { key: 'finishes', label: 'Finishes', type: 'text', ph: 'Thermo-cedar ext / clear cedar int' },
      { key: 'specs', label: 'Key specs', type: 'textarea', ph: 'HUUM Drop 6kW · 1 bench tier · single glass door' },
      { key: 'brochures', label: 'Brochures & sales resources', type: 'reslist', addLabel: 'brochure / sheet' },
    ],
  },
  {
    id: 'research', label: 'Research', title: 'Research',
    desc: 'Material tests, code findings, and market notes.',
    lede: 'What we have learned, so a question is answered once and never re-litigated.',
    titleField: 'title', icon: 'flask',
    fields: [
      { key: 'title', label: 'Title', type: 'text', req: true, ph: 'Summit County exempt-structure threshold' },
      { key: 'type', label: 'Type', type: 'select', opts: ['Code finding', 'Material test', 'Market', 'Competitor'] },
      { key: 'jurisdiction', label: 'Jurisdiction (if code)', type: 'text', ph: 'Summit County' },
      { key: 'summary', label: 'Finding', type: 'textarea', req: true, ph: 'What we learned and what it changes.' },
      { key: 'owner', label: 'Owner', type: 'text', ph: 'Cole' },
      { key: 'date', label: 'Date', type: 'text', mono: true, ph: '2026-05-10' },
      { key: 'link', label: 'Source link', type: 'text', ph: 'https://…' },
    ],
  },
  {
    id: 'improvements', label: 'Improvements', title: 'Product Improvements',
    desc: 'The change log + backlog: proposed through shipped.',
    lede: 'Every idea to make the product better — tracked from proposed to shipped.',
    titleField: 'title', icon: 'trending-up',
    fields: [
      { key: 'title', label: 'Improvement', type: 'text', req: true, ph: 'Move heater control to exterior junction' },
      { key: 'product', label: 'Affects', type: 'text', ph: 'Refuge 2 · Rev C→D' },
      { key: 'status', label: 'Status', type: 'select', opts: ['Proposed', 'In progress', 'Shipped', 'Parked'] },
      { key: 'impact', label: 'Impact', type: 'textarea', ph: 'Cuts install time ~45 min; cleaner interior' },
      { key: 'owner', label: 'Owner', type: 'text', ph: 'Cole' },
      { key: 'date', label: 'Logged', type: 'text', mono: true, ph: '2026-06-01' },
    ],
  },
  {
    id: 'plans', label: 'Build Plans', title: 'Build Plan Sets',
    desc: 'Plan set per product — version, specs, and cut list.',
    lede: 'The catalog of issued plan sets. Each one prints to a clean build sheet.',
    titleField: 'name', icon: 'file-text',
    fields: [
      { key: 'name', label: 'Plan set name', type: 'text', req: true, ph: 'Refuge 2 — Plan Set' },
      { key: 'product', label: 'Product / rev', type: 'text', ph: 'Refuge 2 (Rev C)' },
      { key: 'version', label: 'Version', type: 'text', mono: true, ph: 'v1.3' },
      { key: 'date', label: 'Date', type: 'text', mono: true, ph: '2026-06-12' },
      { key: 'status', label: 'Status', type: 'select', opts: ['Draft', 'Issued', 'Superseded'] },
      { key: 'includes', label: 'Set includes', type: 'includes' },
      { key: 'specs', label: 'Build specs', type: 'textarea', ph: "Footprint 6'x4'; 84\" ridge; 4x helical anchors" },
      { key: 'cuts', label: 'Cut list', type: 'textarea', mono: true, ph: 'Wall studs 2x4 @16" — qty 24 @ 81"' },
      { key: 'notes', label: 'Field notes', type: 'text', ph: 'Verify anchor torque 150 ft-lb' },
      { key: 'pdfLink', label: 'PDF link', type: 'text', ph: 'Drive / link to full set' },
    ],
  },
  {
    id: 'resources', label: 'Resources', title: 'Sales Resources',
    desc: 'Every sales resource in one place — catalogs, brochures, pricing.',
    lede: 'One home for the resources you reach for on a sales call.',
    titleField: 'label', icon: 'folder',
    fields: [
      { key: 'label', label: 'Name', type: 'text', req: true, ph: 'Product Brochures' },
      { key: 'type', label: 'Type', type: 'select', opts: ['Folder', 'Brochure', 'Pricing', 'Google Sheet', 'Doc', 'Link'] },
      { key: 'url', label: 'Link', type: 'text', mono: true, ph: 'https://drive.google.com/…' },
      { key: 'note', label: 'Note', type: 'text', ph: 'What is in here' },
    ],
  },
];

export const STATUS_COLORS: Record<string, string> = {
  Preferred: 'ok', Active: 'ok', Issued: 'ok', Shipped: 'ok',
  'In progress': 'warn', 'In design': 'warn', Draft: 'warn', Proposed: 'ember',
  Backup: 'mute', Trial: 'mute', Retired: 'mute', Parked: 'mute', Superseded: 'mute',
};

export const ROLE_COLORS: Record<string, string> = {
  'Build partner': 'ember', 'Material supplier': 'ok', 'Install partner': 'mute', 'Logistics': 'mute',
};
