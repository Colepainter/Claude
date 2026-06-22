import { HubData, Deal } from './types';

const t = Date.now();

export const SEED_HUB: HubData = {
  suppliers: [
    { id: 's1', name: 'Qontrast', role: 'Build partner', status: 'Preferred', category: 'Sauna + cold plunge fabrication', contactName: 'Sadie Stayner · Jake', email: 'sadie@qontrast.life', phone: '801-890-3840', website: 'https://qontrast.life', leadTime: 'Per build', supplyType: 'Partner-sourced', supplies: 'Sole sauna & cold-plunge build partner. Sources most build materials.', notes: '634 N Mill Rd, Vineyard, UT 84059. Sole build partner — do not multi-source without sign-off. 2x/wk ops sync.', _u: t },
    { id: 's2', name: 'Superior Saunas', role: 'Material supplier', status: 'Preferred', category: 'Heaters & sauna components', contactName: '', email: 'info@superiorsaunas.com', phone: '', website: 'https://www.superiorsaunas.com', leadTime: '~1 wk ship (FedEx)', supplyType: 'NP-supplied', supplies: 'HUUM heaters & controls, sauna accessories. Recent order #43800 (HUUM temp/heater).', notes: '', _u: t },
    { id: 's3', name: 'Stack', role: 'Build partner', status: 'Trial', category: 'Build partner (named in Build Standards)', contactName: '', email: '', phone: '', website: '', leadTime: '', supplyType: 'Partner-sourced', supplies: 'Listed as a build partner in Sauna Build Standards Rev 2.0.', notes: 'Add contact details — surfaced from build standards, not yet confirmed active.', _u: t },
    { id: 's4', name: 'Big Country Co', role: 'Install partner', status: 'Trial', category: 'Site / install (Ogden Valley)', contactName: 'Chris Woolstenhulme', email: 'chris.bigcountryco@gmail.com', phone: '801-821-1387', website: '', leadTime: '', supplyType: '', supplies: 'Also reachable at cwooly@evoutah.com (EVO Utah).', notes: 'Surfaced on the Henry / Huntsville job. Verify whether this is a standing partner.', _u: t },
    { id: 's5', name: 'High Creek Design', role: 'Install partner', status: 'Trial', category: 'Design / site partner', contactName: 'Josh Munns', email: 'josh.highcreekdesign@gmail.com', phone: '435-890-…', website: '', leadTime: '', supplyType: '', supplies: '', notes: 'Surfaced on the Henry / Huntsville job. Phone partial — confirm.', _u: t },
  ],
  products: [
    { id: 'p1', name: 'Refuge 2 — 2-Person Cabin Sauna', rev: 'Rev C', status: 'Active', dimensions: "6'x4'x7' (84\" H)", priceBand: '$24k–$28k', leadTime: '8–10 wks', finishes: 'Thermo-cedar ext / clear cedar int', specs: 'HUUM Drop 6kW · 1 bench tier · single glass door', brochures: [], _u: t },
    { id: 'p2', name: 'Basin 4 — 4-Person Modular Sauna', rev: 'Rev A', status: 'In design', dimensions: "8'x6'x7'", priceBand: '$36k–$42k', leadTime: '10–12 wks', finishes: 'Shou sugi ban ext / hemlock int', specs: '9kW heater · L-bench · panoramic glass', brochures: [], _u: t },
  ],
  research: [
    { id: 'r1', title: 'Summit County exempt-structure threshold', type: 'Code finding', jurisdiction: 'Summit County', summary: 'Accessory structures under 200 sqft may be exempt from building permit, but electrical permit and setbacks still apply. Verify with jurisdiction before each install.', owner: 'Cole', date: '2026-05-10', link: '', _u: t },
    { id: 'r2', title: 'Thermo-mod cedar vs WRC — heat cycling', type: 'Material test', jurisdiction: '', summary: 'Thermo cedar showed noticeably less cupping after 30 heat cycles vs. standard WRC; material cost +18%. Worth it on premium tiers.', owner: 'Shop', date: '2026-04-22', link: '', _u: t },
  ],
  improvements: [
    { id: 'i1', title: 'Move heater control to exterior junction', product: 'Refuge 2 · Rev C→D', status: 'Proposed', impact: 'Cuts install time ~45 min and cleans up the interior wall.', owner: 'Cole', date: '2026-06-01', _u: t },
    { id: 'i2', title: 'Switch door hinge to soft-close', product: 'All models', status: 'In progress', impact: 'Reduces warranty claims from door slam on glass.', owner: 'Shop', date: '2026-05-18', _u: t },
  ],
  plans: [
    { id: 'b1', name: 'Refuge 2 — Plan Set', product: 'Refuge 2 (Rev C)', version: 'v1.3', date: '2026-06-12', status: 'Issued', includes: { sitePlan: true, structural: true, anchorage: true, utilities: true, elevations: true }, specs: "Footprint 6'x4'; 84\" ridge height; 4x helical anchors; 240V / 30A dedicated circuit; HUUM Drop 6kW heater.", cuts: 'Wall studs 2x4 @16" o.c. — qty 24 @ 81"\nTop/bottom plate 2x4 — qty 6 @ 72"\nBench frame 2x4 — qty 12 @ varies\nCladding T&G cedar — 96 lf\nBench slats clear cedar 1x4 — qty 28 @ 18"', notes: 'Verify anchor torque 150 ft-lb before deck framing.', pdfLink: '', _u: t },
  ],
  resources: [
    { id: 'rs1', label: 'Product Catalog', type: 'Folder', url: 'https://drive.google.com/drive/folders/1Y2ekj_6y_TZ2jmJoz_eNH83R_LyUog0H', note: 'Drive folder — the full product catalog.', _u: t },
    { id: 'rs2', label: 'Product Brochures', type: 'Folder', url: 'https://drive.google.com/drive/folders/1FAI9CQzwLojtUXAxghHctTXxcCmnQaqD', note: 'Drive folder — all product brochures.', _u: t },
    { id: 'rs3', label: 'Pricing & Estimating', type: 'Folder', url: 'https://drive.google.com/drive/folders/1xqvqTy64VdAzQH95xcH1JaQMNb-fEYqc', note: 'Drive folder — pricing + estimating.', _u: t },
    { id: 'rs4', label: 'Sauna Build Standards Rev 2.0', type: 'Doc', url: 'https://docs.google.com/document/d/1QFXFY1fM96xdYn_ay7RwIxsrhqarIDSdzyg6Hq_6C-0/edit', note: 'Canonical build reference for every build.', _u: t },
    { id: 'rs5', label: 'Suppliers (Drive)', type: 'Folder', url: 'https://drive.google.com/drive/folders/1GkS7UmP3fIj9z5Jw1KgXZmDrhFc5tcbN', note: 'Drive folder — supplier files.', _u: t },
  ],
};

export const SEED_DEALS: Deal[] = [
  {
    id: 'andy', name: 'Andy Gunion', contact: 'agunion02@hotmail.com · (970) 376-2116',
    type: 'Residential', location: '1780 Juniper, Aspen, CO · ~8,000 ft',
    product: 'Thermal Suite Essential MP1 + lay-down cold plunge', value: 66000,
    stage: 'design', health: 'hot', nextAction: 'Assemble & send proposal package', nextDue: '2026-06-23',
    notes: 'Design LOCKED. All thermally-modified ash interior (+~$6k, for indoor shower), cement fiberboard exterior painted charcoal-gray, black standing-seam roof, added view window. 80% down → 20% + delivery on completion. 12-wk lead.\n\n⚠ ELECTRICAL: notes say 240V/50A service but \'2× 60A breakers preferred\' + Iki heater 50A — lock exact circuit(s) in build plan before it reaches his electrician.\n\nAndy owes: site photos/videos (crane survey), house paint color, panel-capacity confirmation.',
    source: 'https://fathom.video/calls/716600746',
    comms: [{ id: 'a1', date: '2026-06-19', channel: 'Meeting', note: 'Design finalization call (Fathom). Model + finishes locked. Sent home with homework: site media, paint color, electrical check.' }],
    created: '2026-06-19',
  },
  {
    id: 'ewp', name: 'Ryan Cole — EW Partners', contact: 'Ryan Cole · EW Partners',
    type: 'Commercial', location: 'Snowmass Village, CO · 48-unit condo pool deck',
    product: 'Commercial sauna + dual cold plunge', value: 70800,
    stage: 'design', health: 'warm', nextAction: 'Finalize & send 8-page proposal', nextDue: '2026-06-24',
    notes: '8-page branded proposal brochure drafted. Base commercial sauna $55k + 2× cold plunge @ $7,900 = $70,800 working figure (extras TBD: Carriti star ceiling, White Glove +$2,500).\n\n⚠ VERIFY before send: Finnleo Lava floor heater — catalog lists 50A, quoted circuit is 60A. Confirm against Finnleo spec sheet.',
    source: '',
    comms: [{ id: 'e1', date: '2026-06-15', channel: 'Note', note: 'Full 8-page proposal brochure drafted in NP branding.' }],
    created: '2026-06-10',
  },
  {
    id: 'jfish', name: 'JFish Dev Tour', contact: 'TBD — reconstruct from Gmail',
    type: 'Commercial', location: 'Dev site tour · 6/19, 1–3 PM',
    product: 'TBD', value: 0,
    stage: 'consult', health: 'warm', nextAction: 'Reconstruct from Gmail: who / scope / next step', nextDue: '2026-06-23',
    notes: '2-hour in-person development tour on 6/19. No Fathom recording — blind on content. Needs a readout before it can be scoped.',
    source: '',
    comms: [{ id: 'j1', date: '2026-06-19', channel: 'Meeting', note: 'In-person dev tour (2 hrs). Not recorded.' }],
    created: '2026-06-19',
  },
];
