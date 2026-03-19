/* ═══════════════════════════════════════════════════════════════
   EV Primitive CMS — Admin Dashboard JavaScript
   ═══════════════════════════════════════════════════════════════ */

'use strict';

const API = '';   // same-origin; change to 'http://localhost:3000' if running separately

/* ─── State ─── */
let authToken = localStorage.getItem('cms_token');
let currentUser = null;
let currentLeadStatus = '';

/* ─── Utilities ─── */
function apiFetch(path, opts = {}) {
  return fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    ...opts
  });
}

function toast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function openModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalBackdrop').hidden = false;
}
function closeModal() {
  document.getElementById('modalBackdrop').hidden = true;
  document.getElementById('modalContent').innerHTML = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', e => {
  if (e.target === document.getElementById('modalBackdrop')) closeModal();
});

/* ─── Auth ─── */
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('loginError');
  err.textContent = '';
  btn.textContent = 'Signing in…';
  btn.disabled = true;

  try {
    const res  = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
      })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Login failed');

    authToken   = data.token;
    currentUser = data.user;
    localStorage.setItem('cms_token', authToken);
    showCMS();
  } catch (ex) {
    err.textContent = ex.message;
  } finally {
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  authToken   = null;
  currentUser = null;
  localStorage.removeItem('cms_token');
  document.getElementById('cmsShell').hidden  = true;
  document.getElementById('loginScreen').hidden = false;
});

/* ─── Boot: auto-login if token exists ─── */
async function boot() {
  if (!authToken) return;
  try {
    const res  = await apiFetch('/api/auth/me');
    if (!res.ok) throw new Error();
    currentUser = await res.json();
    showCMS();
  } catch {
    localStorage.removeItem('cms_token');
    authToken = null;
  }
}

function showCMS() {
  document.getElementById('loginScreen').hidden = true;
  document.getElementById('cmsShell').hidden    = false;
  document.getElementById('sidebarUser').textContent = currentUser?.name || currentUser?.email || 'Admin';
  loadDashboard();
}

/* ─── Panel switching ─── */
window.switchPanel = function(id) {
  document.querySelectorAll('.sidebar__item').forEach(el => {
    el.classList.toggle('is-active', el.dataset.panel === id);
  });
  document.querySelectorAll('.panel').forEach(p => {
    p.classList.toggle('is-active', p.id === `panel-${id}`);
  });

  // Lazy-load panel data
  const loaders = {
    heroes:   loadHeroes,
    vehicles: loadVehicles,
    media:    loadMedia,
    leads:    () => loadLeads(currentLeadStatus),
    content:  loadContentBlocks,
    settings: loadSettings,
  };
  loaders[id]?.();
};

document.querySelectorAll('.sidebar__item').forEach(btn => {
  btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
});

/* ─── Dashboard ─── */
async function loadDashboard() {
  try {
    const [vehicles, heroes, media, leads] = await Promise.all([
      apiFetch('/api/vehicles').then(r => r.json()),
      apiFetch('/api/content/heroes').then(r => r.json()),
      apiFetch('/api/media').then(r => r.json()),
      apiFetch('/api/leads?status=new').then(r => r.json())
    ]);
    document.getElementById('statVehicles').textContent = vehicles.length || 0;
    document.getElementById('statHeroes').textContent   = heroes.length || 0;
    document.getElementById('statMedia').textContent    = media.total || 0;
    document.getElementById('statLeads').textContent    = leads.total || 0;
  } catch { /* backend offline */ }
}

/* ─── Heroes ─── */
async function loadHeroes() {
  const list = document.getElementById('heroList');
  list.innerHTML = '<div class="spinner"></div>';
  try {
    const res    = await apiFetch('/api/content/heroes');
    const heroes = await res.json();
    list.innerHTML = '';

    heroes.forEach(h => {
      const card = document.createElement('div');
      card.className = 'cms-card';
      card.innerHTML = `
        <div class="cms-card__header">
          <span class="cms-card__title">${h.title}</span>
          <span class="badge ${h.published ? 'badge--live' : 'badge--draft'}">${h.published ? 'Live' : 'Draft'}</span>
        </div>
        <div class="cms-card__body">
          <div class="cms-card__field"><label>Subtitle</label><input type="text" value="${h.subtitle || ''}" data-field="subtitle" data-id="${h.id}"></div>
          <div class="cms-card__field"><label>Background Image URL</label><input type="text" value="${h.background_image || ''}" data-field="background_image" data-id="${h.id}" placeholder="/images/..."></div>
          <div class="cms-card__field"><label>Primary CTA Label</label><input type="text" value="${h.cta_primary_label || 'Order Now'}" data-field="cta_primary_label" data-id="${h.id}"></div>
          <div class="cms-card__field"><label>Primary CTA Link</label><input type="text" value="${h.cta_primary_href || ''}" data-field="cta_primary_href" data-id="${h.id}"></div>
        </div>
        <div class="cms-card__actions">
          <button class="btn-primary btn-sm" data-save-hero="${h.id}">Save</button>
          <button class="btn-secondary btn-sm" data-toggle-hero="${h.id}" data-pub="${h.published}">${h.published ? 'Unpublish' : 'Publish'}</button>
        </div>
      `;
      list.appendChild(card);
    });

    // Save hero
    list.querySelectorAll('[data-save-hero]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id      = btn.dataset.saveHero;
        const inputs  = list.querySelectorAll(`input[data-id="${id}"]`);
        const payload = {};
        inputs.forEach(inp => { payload[inp.dataset.field] = inp.value; });

        btn.textContent = 'Saving…';
        const r = await apiFetch(`/api/content/heroes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        btn.textContent = 'Save';
        toast(r.ok ? 'Hero updated' : 'Error saving', r.ok ? 'success' : 'error');
      });
    });

    // Toggle publish
    list.querySelectorAll('[data-toggle-hero]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id       = btn.dataset.toggleHero;
        const pub      = btn.dataset.pub === '1' ? 0 : 1;
        const r = await apiFetch(`/api/content/heroes/${id}`, { method: 'PUT', body: JSON.stringify({ published: pub }) });
        if (r.ok) loadHeroes();
      });
    });

  } catch { list.innerHTML = '<p style="color:var(--text-muted)">Could not load heroes. Is the server running?</p>'; }
}

/* ─── Vehicles ─── */
async function loadVehicles() {
  const el = document.getElementById('vehicleList');
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const res      = await apiFetch('/api/vehicles');
    const vehicles = await res.json();

    el.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Model</th><th>Slug</th><th>Base Price</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${vehicles.map(v => `
            <tr>
              <td>${v.name}</td>
              <td>${v.slug}</td>
              <td>$${Number(v.base_price).toLocaleString()}</td>
              <td><span class="badge ${v.published ? 'badge--live' : 'badge--draft'}">${v.published ? 'Live' : 'Draft'}</span></td>
              <td>
                <button class="btn-secondary btn-sm" style="margin-right:0.5rem" onclick="editVehicle('${v.id}','${v.slug}')">Edit</button>
                <button class="btn-danger" onclick="deleteVehicle('${v.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch { el.innerHTML = '<p style="color:var(--text-muted)">Error loading vehicles.</p>'; }
}

window.editVehicle = function(id, slug) {
  openModal(`
    <h2>Edit Vehicle — ${slug}</h2>
    <form class="modal-form" id="vehicleForm">
      <div class="field"><label>Name</label><input name="name" type="text"></div>
      <div class="field"><label>Tagline</label><input name="tagline" type="text"></div>
      <div class="field"><label>Base Price ($)</label><input name="base_price" type="number" step="1"></div>
      <div class="field"><label>Hero Image URL</label><input name="hero_image" type="text" placeholder="/images/..."></div>
      <div class="modal-actions">
        <button type="submit" class="btn-primary">Save Changes</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
      </div>
      <p id="vehicleFormStatus" style="font-size:0.875rem;color:var(--success);margin-top:0.5rem;"></p>
    </form>
  `);

  // Prefill
  apiFetch(`/api/vehicles/${slug}`).then(r => r.json()).then(v => {
    document.querySelector('[name=name]').value       = v.name || '';
    document.querySelector('[name=tagline]').value    = v.tagline || '';
    document.querySelector('[name=base_price]').value = v.base_price || '';
    document.querySelector('[name=hero_image]').value = v.hero_image || '';
  });

  document.getElementById('vehicleForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());
    const r = await apiFetch(`/api/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    const statusEl = document.getElementById('vehicleFormStatus');
    statusEl.textContent = r.ok ? '✓ Saved' : 'Error saving';
    if (r.ok) setTimeout(closeModal, 800);
  });
};

window.deleteVehicle = function(id) {
  if (!confirm('Delete this vehicle? This cannot be undone.')) return;
  apiFetch(`/api/vehicles/${id}`, { method: 'DELETE' }).then(r => {
    toast(r.ok ? 'Vehicle deleted' : 'Error deleting', r.ok ? 'success' : 'error');
    if (r.ok) loadVehicles();
  });
};

document.getElementById('addVehicleBtn').addEventListener('click', () => {
  openModal(`
    <h2>Add New Vehicle</h2>
    <form class="modal-form" id="addVehicleForm">
      <div class="field"><label>Name</label><input name="name" required type="text" placeholder="Model Y"></div>
      <div class="field"><label>Slug</label><input name="slug" required type="text" placeholder="model-y"></div>
      <div class="field"><label>Tagline</label><input name="tagline" type="text"></div>
      <div class="field"><label>Base Price ($)</label><input name="base_price" required type="number" step="1"></div>
      <div class="field"><label>Hero Image URL</label><input name="hero_image" type="text" placeholder="/images/..."></div>
      <div class="modal-actions">
        <button type="submit" class="btn-primary">Create</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  document.getElementById('addVehicleForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const r  = await apiFetch('/api/vehicles', { method: 'POST', body: JSON.stringify(Object.fromEntries(fd)) });
    toast(r.ok ? 'Vehicle created' : 'Error creating vehicle', r.ok ? 'success' : 'error');
    if (r.ok) { closeModal(); loadVehicles(); }
  });
});

/* ─── Media Library ─── */
async function loadMedia() {
  const grid = document.getElementById('mediaGrid');
  grid.innerHTML = '<div class="spinner"></div>';
  try {
    const res  = await apiFetch('/api/media');
    const data = await res.json();
    grid.innerHTML = '';

    data.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'media-item';
      const isImage = item.mime_type.startsWith('image/');
      el.innerHTML = `
        ${isImage ? `<img src="${item.url}" alt="${item.alt_text || item.original_name}" loading="lazy">` : `<div style="height:120px;display:flex;align-items:center;justify-content:center;font-size:2rem;background:var(--surface2)">🎬</div>`}
        <div class="media-item__name">${item.original_name}</div>
        <button class="media-item__del" title="Delete" data-del-media="${item.id}">✕</button>
      `;
      grid.appendChild(el);
    });

    // Delete
    grid.querySelectorAll('[data-del-media]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Delete this file?')) return;
        const r = await apiFetch(`/api/media/${btn.dataset.delMedia}`, { method: 'DELETE' });
        toast(r.ok ? 'Deleted' : 'Error', r.ok ? 'success' : 'error');
        if (r.ok) loadMedia();
      });
    });

    if (data.items.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;">No media uploaded yet.</p>';
    }
  } catch { grid.innerHTML = '<p style="color:var(--text-muted)">Error loading media.</p>'; }
}

/* Upload files */
document.getElementById('uploadBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', async e => {
  const files   = Array.from(e.target.files);
  const progress = document.getElementById('uploadProgress');
  progress.hidden = false;
  progress.textContent = `Uploading ${files.length} file(s)…`;

  const fd = new FormData();
  files.forEach(f => fd.append('files', f));

  const r = await fetch(`${API}/api/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: fd
  });

  progress.hidden = true;
  e.target.value  = '';

  toast(r.ok ? `${files.length} file(s) uploaded` : 'Upload failed', r.ok ? 'success' : 'error');
  if (r.ok) loadMedia();
});

/* Google Drive import */
document.getElementById('driveBtn').addEventListener('click', () => {
  openModal(`
    <h2>Import from Google Drive</h2>
    <p style="color:var(--text-muted);margin-bottom:1.5rem;font-size:0.875rem;">
      Paste the Google Drive file ID or use the folder browser to select a file.
    </p>
    <form class="modal-form" id="driveImportForm">
      <div class="field"><label>Drive File ID</label><input name="fileId" type="text" placeholder="1AbCd_XyZ..." required></div>
      <div class="field"><label>Alt Text (optional)</label><input name="altText" type="text"></div>
      <div class="modal-actions">
        <button type="submit" class="btn-primary">Import</button>
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
      </div>
      <p id="driveStatus" style="font-size:0.875rem;margin-top:0.5rem;"></p>
    </form>
    <hr style="border-color:var(--border);margin:1.5rem 0">
    <div>
      <h3 style="font-size:1rem;margin-bottom:0.75rem;">Browse Your Drive Folder</h3>
      <button class="btn-secondary btn-sm" id="browseDriveBtn">Load Folder Contents</button>
      <div id="driveFolderList" style="margin-top:1rem;max-height:200px;overflow-y:auto;"></div>
    </div>
  `);

  document.getElementById('driveImportForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const statusEl = document.getElementById('driveStatus');
    statusEl.textContent = 'Importing from Drive…';
    const r = await apiFetch('/api/media/from-drive', { method: 'POST', body: JSON.stringify(Object.fromEntries(fd)) });
    const data = await r.json();
    statusEl.textContent = r.ok ? `✓ Imported: ${data.original_name}` : `Error: ${data.error}`;
    statusEl.style.color  = r.ok ? 'var(--success)' : 'var(--danger)';
    if (r.ok) { setTimeout(closeModal, 1200); loadMedia(); }
  });

  document.getElementById('browseDriveBtn')?.addEventListener('click', async () => {
    const list = document.getElementById('driveFolderList');
    list.innerHTML = '<div class="spinner"></div>';
    try {
      const r    = await apiFetch('/api/media/drive-folders');
      const files = await r.json();
      list.innerHTML = files.length
        ? files.map(f => `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--border);">
            <span style="font-size:0.875rem">${f.name}</span>
            <button class="btn-secondary btn-sm" onclick="importDriveFile('${f.id}')">Import</button>
          </div>`).join('')
        : '<p style="color:var(--text-muted);font-size:0.875rem">No files found in folder.</p>';
    } catch { list.innerHTML = '<p style="color:var(--danger);font-size:0.875rem">Drive not configured. Set GOOGLE_APPLICATION_CREDENTIALS in .env</p>'; }
  });
});

window.importDriveFile = async function(fileId) {
  const r = await apiFetch('/api/media/from-drive', { method: 'POST', body: JSON.stringify({ fileId }) });
  toast(r.ok ? 'File imported from Drive' : 'Drive import failed', r.ok ? 'success' : 'error');
  if (r.ok) { closeModal(); loadMedia(); }
};

/* ─── Leads ─── */
async function loadLeads(status = '') {
  currentLeadStatus = status;
  const el = document.getElementById('leadsList');
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const url  = status ? `/api/leads?status=${status}` : '/api/leads';
    const res  = await apiFetch(url);
    const data = await res.json();

    el.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Email</th><th>Type</th><th>Address</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          ${data.leads.map(l => `
            <tr>
              <td>${l.email}</td>
              <td>${l.type}</td>
              <td>${l.address || '—'}</td>
              <td><span class="badge badge--${l.status}">${l.status}</span></td>
              <td>${new Date(l.created_at).toLocaleDateString()}</td>
              <td>
                <select class="lead-status-sel" data-lead-id="${l.id}" style="width:auto;padding:0.3rem 0.5rem;font-size:0.8rem;">
                  <option ${l.status==='new'?'selected':''}>new</option>
                  <option ${l.status==='contacted'?'selected':''}>contacted</option>
                  <option ${l.status==='closed'?'selected':''}>closed</option>
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    el.querySelectorAll('.lead-status-sel').forEach(sel => {
      sel.addEventListener('change', async () => {
        await apiFetch(`/api/leads/${sel.dataset.leadId}`, { method: 'PATCH', body: JSON.stringify({ status: sel.value }) });
        toast('Lead updated', 'success');
      });
    });

    if (data.leads.length === 0) el.innerHTML = '<p style="color:var(--text-muted)">No leads found.</p>';
  } catch { el.innerHTML = '<p style="color:var(--text-muted)">Error loading leads.</p>'; }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    loadLeads(btn.dataset.status);
  });
});

/* ─── Content Blocks ─── */
async function loadContentBlocks() {
  const list = document.getElementById('contentList');
  list.innerHTML = '<div class="spinner"></div>';
  try {
    const res    = await apiFetch('/api/content/blocks');
    const blocks = await res.json();
    list.innerHTML = '';

    if (blocks.length === 0) {
      list.innerHTML = '<p style="color:var(--text-muted)">No content blocks found. They\'re created automatically when you save content.</p>';
      return;
    }

    blocks.forEach(b => {
      const card = document.createElement('div');
      card.className = 'cms-card';
      card.innerHTML = `
        <div class="cms-card__header">
          <span class="cms-card__title">${b.page} / ${b.key}</span>
          <span class="cms-card__meta">${b.type}</span>
        </div>
        <div class="field">
          <textarea rows="3" data-block-page="${b.page}" data-block-key="${b.key}" style="font-size:0.875rem;">${b.value}</textarea>
        </div>
        <div class="cms-card__actions">
          <button class="btn-primary btn-sm" data-save-block="${b.page}__${b.key}">Save</button>
        </div>
      `;
      list.appendChild(card);
    });

    list.querySelectorAll('[data-save-block]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const [page, key] = btn.dataset.saveBlock.split('__');
        const ta          = list.querySelector(`[data-block-page="${page}"][data-block-key="${key}"]`);
        btn.textContent   = 'Saving…';
        const r = await apiFetch(`/api/content/blocks/${page}/${key}`, { method: 'PUT', body: JSON.stringify({ value: ta.value }) });
        btn.textContent = 'Save';
        toast(r.ok ? 'Block updated' : 'Error', r.ok ? 'success' : 'error');
      });
    });
  } catch { list.innerHTML = '<p style="color:var(--text-muted)">Error loading content blocks.</p>'; }
}

/* ─── Settings ─── */
async function loadSettings() {
  try {
    const res      = await apiFetch('/api/content/settings');
    const settings = await res.json();
    const form     = document.getElementById('settingsForm');
    Object.entries(settings).forEach(([key, val]) => {
      const el = form.querySelector(`[name="${key}"]`);
      if (el) el.value = val;
    });
  } catch { /* offline */ }
}

document.getElementById('settingsForm').addEventListener('submit', async e => {
  e.preventDefault();
  const fd      = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  const r = await apiFetch('/api/content/settings', { method: 'PUT', body: JSON.stringify(payload) });
  const saved = document.getElementById('settingsSaved');
  saved.hidden = false;
  toast(r.ok ? 'Settings saved' : 'Error saving settings', r.ok ? 'success' : 'error');
  setTimeout(() => saved.hidden = true, 2500);
});

/* ─── Drive Sync Panel ─── */
async function loadDrivePanel() {
  // Wired up via event listeners below (no auto-load needed)
}

document.getElementById('driveSyncBtn')?.addEventListener('click', async () => {
  const btn    = document.getElementById('driveSyncBtn');
  const status = document.getElementById('driveSyncStatus');
  btn.textContent = '⟳ Syncing…';
  btn.disabled    = true;
  status.textContent = 'Connecting to Google Drive folder…';
  status.style.color = 'var(--text-muted)';

  try {
    const r    = await apiFetch('/api/drive/sync', { method: 'POST' });
    const data = await r.json();

    if (!r.ok) throw new Error(data.error || 'Sync failed');

    const lines = [
      `✓ Synced ${data.downloaded?.length || 0} image(s) from Drive`,
      data.downloaded?.map(d => `  • ${d.file} → ${d.slug} (${d.url})`).join('\n'),
      data.skipped?.length  ? `\nSkipped (no slug match): ${data.skipped.join(', ')}` : '',
      data.errors?.length   ? `\nErrors: ${data.errors.map(e => e.file + ': ' + e.error).join(', ')}` : '',
    ].filter(Boolean).join('\n');

    status.style.color = '#22c55e';
    status.innerHTML   = `<pre style="font-size:0.8125rem;white-space:pre-wrap;line-height:1.6">${lines}</pre>`;
    toast(`Synced ${data.downloaded?.length || 0} image(s) from Drive`, 'success');

    // Refresh heroes panel if open
    if (document.getElementById('panel-heroes').classList.contains('is-active')) loadHeroes();
  } catch (err) {
    status.style.color = 'var(--danger)';
    status.innerHTML = `
      <p style="color:var(--danger);font-weight:500">Drive sync failed: ${err.message}</p>
      <p style="margin-top:0.75rem;font-size:0.8125rem;color:var(--text-muted)">
        To enable Drive sync, complete these one-time setup steps:<br>
        1. Create a Google Cloud service account with Drive API enabled<br>
        2. Download the JSON key → <code>server/google-service-account.json</code><br>
        3. Share the folder <code>1QMFOVwZAGQp-aaZKHyXh34l2gTSgzPNw</code> with the service account email<br>
        4. Set <code>GOOGLE_APPLICATION_CREDENTIALS=./server/google-service-account.json</code> in your .env<br>
        5. Restart the server and click Sync again
      </p>
    `;
  } finally {
    btn.textContent = '⟳ Sync All Images from Drive';
    btn.disabled    = false;
  }
});

document.getElementById('driveListBtn')?.addEventListener('click', async () => {
  const fileList = document.getElementById('driveFileList');
  const status   = document.getElementById('driveSyncStatus');
  fileList.innerHTML = '<div class="spinner"></div>';

  try {
    const r    = await apiFetch('/api/drive/list');
    const data = await r.json();

    if (!r.ok) throw new Error(data.error || 'List failed');

    const products = ['thermal-suite', '212', 'communal', 'nook', 'cold-plunge', 'commercial', 'about'];
    status.style.color = 'var(--text-muted)';
    status.textContent = `Found ${data.files.length} file(s) in your Drive folder.`;

    fileList.innerHTML = data.files.map(f => `
      <div class="cms-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
        <div>
          <div style="font-weight:500;font-size:0.9375rem">${f.name}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.2rem">${f.mimeType} · ${f.id}</div>
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
          <select id="slug-${f.id}" style="padding:0.35rem 0.5rem;font-size:0.8125rem;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);">
            <option value="">— assign to —</option>
            ${products.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
          <button class="btn-primary btn-sm" onclick="assignDriveFile('${f.id}')">Assign</button>
        </div>
      </div>
    `).join('') || '<p style="color:var(--text-muted)">No image files found in folder.</p>';
  } catch (err) {
    fileList.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
});

window.assignDriveFile = async function(fileId) {
  const sel     = document.getElementById(`slug-${fileId}`);
  const heroSlug = sel?.value;
  if (!heroSlug) { toast('Please select a product slug first', 'error'); return; }

  const r    = await apiFetch('/api/drive/assign', { method: 'POST', body: JSON.stringify({ fileId, heroSlug }) });
  const data = await r.json();
  if (r.ok) {
    toast(`✓ Assigned to ${heroSlug}: ${data.url}`, 'success');
    if (document.getElementById('panel-heroes').classList.contains('is-active')) loadHeroes();
  } else {
    toast(`Error: ${data.error}`, 'error');
  }
};

// Register drive panel in the loader map
const origSwitchPanel = window.switchPanel;
window.switchPanel = function(id) {
  origSwitchPanel(id);
  if (id === 'drive') loadDrivePanel();
};

/* ─── Boot ─── */
boot();
