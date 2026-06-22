export const usd = (n: number) =>
  '$' + (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

export const usdShort = (n: number) => {
  n = Number(n) || 0;
  if (n >= 1000) return '$' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return '$' + n;
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const daysUntil = (iso: string): number | null => {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  const t = new Date(todayISO() + 'T00:00:00');
  return Math.round((d.getTime() - t.getTime()) / 86400000);
};

export const genId = () => 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const esc = (s: unknown): string =>
  (s == null ? '' : String(s))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function draftFor(deal: { name: string; stage: string }) {
  const first = deal.name.split(/[ —]/)[0];
  switch (deal.stage) {
    case 'design':
      return `Hey ${first} — great talking through the build. Putting your full package together now: line-item pricing, the brochure, and a build-plan sheet your contractors can work straight off of (pad, electrical, plumbing, crane set).\n\nTwo quick things from your end so I can lock the crane survey and the exterior match:\n• A few photos/videos of the site\n• The exact paint color on the house\n\nI'll have the proposal over to you shortly.`;
    case 'proposal':
      return `Hey ${first} — just making sure the proposal landed. Happy to hop on a quick call and walk the line items if that's easier.\n\nAnything you'd want to tweak on the design before we lock your build slot?`;
    case 'deposit':
      return `Hey ${first} — ready to get you on the production calendar. It's a 12-week build, and a $450 hold deposit locks your slot so we can start sourcing and scheduling.\n\nWant me to send the deposit link?`;
    case 'consult':
      return `Hey ${first} — good to connect. To put together the right setup for your space, I just need a couple of details: the spot you're picturing, your power situation, and roughly how many people you want it to hold.\n\nWhen's a good time for a quick design call?`;
    case 'production':
      return `Hey ${first} — quick build update: your unit is in production and tracking to schedule. I'll flag you as we approach the install window so we can line up the crane and final site prep.`;
    default:
      return `Hey ${first} — checking in. Where's your head at on moving forward? Happy to answer anything still open.`;
  }
}
