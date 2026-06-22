import { HubData, SalesData } from './types';

const HUB_KEY = 'np-hub-v1';
const SALES_KEY = 'np_sales_os_v1';

export function loadHubData(): HubData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HUB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveHubData(data: HubData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HUB_KEY, JSON.stringify(data));
  } catch {}
}

export function loadSalesData(): SalesData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SALES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        deals: parsed.deals || [],
        lastSync: parsed.lastSync || null,
      };
    }
  } catch {}
  return null;
}

export function saveSalesData(data: SalesData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SALES_KEY, JSON.stringify({
      deals: data.deals,
      lastSync: data.lastSync,
      savedAt: Date.now(),
    }));
  } catch {}
}

export function exportBackup(hubData: HubData, salesData: SalesData) {
  const blob = new Blob(
    [JSON.stringify({ hub: hubData, sales: salesData, exportedAt: new Date().toISOString() }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `np-founder-hub-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
