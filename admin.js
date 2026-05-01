// ── ADMIN CONFIG ─────────────────────────────────────────────────────────────
// Change this to your secret password
const ADMIN_PASSWORD = 'krasivy2025';
const AUTH_KEY       = 'kl_admin_auth';

function escapeAdmin(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wilayaHtml(o) {
  if (o.wilayaName || (o.wilayaCode !== undefined && o.wilayaCode !== '')) {
    const c = o.wilayaCode != null ? o.wilayaCode : '';
    return `🗺️ Wilaya ${escapeAdmin(c)} — ${escapeAdmin(o.wilayaName || '')}<br>`;
  }
  if (o.clientCity) return `🗺️ ${escapeAdmin(o.clientCity)}<br>`;
  return '';
}

// ── LOGIN ────────────────────────────────────────────────────────────────────
function checkPassword() {
  const input = document.getElementById('adminPassword').value;
  const errEl = document.getElementById('loginError');

  if (input === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, '1');
    localStorage.setItem(AUTH_KEY, '1');  // show admin link in menu
    showAdminPanel();
  } else {
    errEl.classList.add('show');
    document.getElementById('adminPassword').value = '';
  }
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

function showAdminPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display  = 'block';
  initAdminData();
}

function compressImageFile(file, maxW = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const u = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(u);
      let w = img.width;
      let h = img.height;
      if (w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = c.toDataURL('image/jpeg', quality);
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      resolve({ base64, mimeType: 'image/jpeg' });
    };
    img.onerror = () => {
      URL.revokeObjectURL(u);
      reject(new Error('Image invalide'));
    };
    img.src = u;
  });
}

async function uploadImageToDrive(file) {
  const { base64, mimeType } = await compressImageFile(file);
  const base = (file.name || 'photo').replace(/\.[^.]+$/, '');
  const res = await postToScript({
    action:   'uploadImage',
    base64,
    mimeType,
    fileName: base + '.jpg',
  });
  if (!res || !res.success || !res.url) {
    throw new Error(res?.error || 'Upload refusé');
  }
  return res.url;
}

// Auto-login if already authenticated this session
window.addEventListener('DOMContentLoaded', () => {
  addColorRow();

  const mainFile = document.getElementById('aMainImgFile');
  const mainStatus = document.getElementById('aMainImgStatus');
  if (mainFile) {
    mainFile.addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      if (mainStatus) mainStatus.textContent = 'Envoi de la photo…';
      try {
        const url = await uploadImageToDrive(f);
        document.getElementById('aMainImg').value = url;
        if (mainStatus) mainStatus.textContent = 'Image ajoutée — vous pouvez enregistrer la montre.';
        showToast('Photo enregistrée sur Drive');
      } catch (err) {
        if (mainStatus) mainStatus.textContent = '';
        showToast(err.message || 'Upload échoué — copiez le nouveau Code.gs dans Apps Script et redéployez.');
      }
      e.target.value = '';
    });
  }

  document.getElementById('colorRows').addEventListener('change', async (ev) => {
    const inp = ev.target;
    if (inp.type !== 'file' || !inp.files || !inp.files.length) return;
    const row = inp.closest('[data-color-row]');
    if (!row) return;
    const urlEl = row.querySelector('[data-url]');
    const statusEl = row.querySelector('[data-upload-status]');
    if (statusEl) statusEl.textContent = 'Envoi…';
    try {
      const url = await uploadImageToDrive(inp.files[0]);
      if (urlEl) urlEl.value = url;
      if (statusEl) statusEl.textContent = 'OK';
      showToast('Photo couleur enregistrée');
    } catch (err) {
      if (statusEl) statusEl.textContent = '';
      showToast(err.message || 'Upload échoué');
    }
    inp.value = '';
  });

  if (sessionStorage.getItem(AUTH_KEY) === '1') {
    showAdminPanel();
  }
});

// ── TABS ─────────────────────────────────────────────────────────────────────
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    const names = ['watches','orders'];
    btn.classList.toggle('active', names[i] === tabName);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab${tabName.charAt(0).toUpperCase()+tabName.slice(1)}`);
  });

  if (tabName === 'orders') loadOrders();
}

// ── COLOR ROWS ───────────────────────────────────────────────────────────────
let colorRowCount = 0;

function addColorRow() {
  colorRowCount++;
  const id = `cr_${colorRowCount}`;
  const row = document.createElement('div');
  row.dataset.colorRow = id;
  row.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:12px;padding:12px;background:var(--dark3);border-radius:4px;border:1px solid rgba(255,255,255,0.06)';
  row.innerHTML = `
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" data-name placeholder="Nom de la couleur" style="flex:1;background:var(--dark);border:1px solid rgba(255,255,255,0.08);color:var(--white);font-family:var(--font-body);padding:10px 12px;border-radius:4px;font-size:13px;outline:none">
      <button type="button" onclick="removeColorRow('${id}')" style="color:#ff6b6b;font-size:20px;padding:4px 10px;background:none;border:none;cursor:pointer;line-height:1;flex-shrink:0">×</button>
    </div>
    <input type="url" data-url placeholder="URL image (ou photo ci-dessous)" style="background:var(--dark);border:1px solid rgba(255,255,255,0.08);color:var(--white);font-family:var(--font-body);padding:10px 12px;border-radius:4px;font-size:13px;outline:none;width:100%;box-sizing:border-box">
    <label class="admin-file-pick" style="margin-top:0">
      <input type="file" accept="image/*" capture="environment">
      <span>📷 Photo pour cette couleur</span>
    </label>
    <p data-upload-status style="color:var(--gray);font-size:10px;margin:0;min-height:14px"></p>
  `;
  document.getElementById('colorRows').appendChild(row);
}

function removeColorRow(id) {
  document.querySelector(`[data-color-row="${id}"]`)?.remove();
}

function collectColors() {
  const rows = document.querySelectorAll('#colorRows [data-color-row]');
  const colors = [];
  const colorImages = [];

  rows.forEach(row => {
    const name = row.querySelector('[data-name]')?.value.trim() || '';
    const url  = row.querySelector('[data-url]')?.value.trim() || '';
    if (name) {
      colors.push(name);
      if (url) colorImages.push(`${name}::${url}`);
    }
  });

  return { colors, colorImages };
}

// ── ADD WATCH ─────────────────────────────────────────────────────────────────
async function addWatch() {
  const name    = document.getElementById('aName').value.trim();
  const type    = document.getElementById('aType').value.trim();
  const price   = document.getElementById('aPrice').value.trim();
  const desc    = document.getElementById('aDesc').value.trim();
  const mainImg = document.getElementById('aMainImg').value.trim();
  const errEl   = document.getElementById('addError');
  const { colors, colorImages } = collectColors();

  if (!name || !type || !price || !mainImg || colors.length === 0) {
    errEl.textContent = 'Please fill Name, Type, Price, Main Image, and at least one Color.';
    errEl.classList.add('show');
    return;
  }
  errEl.classList.remove('show');

  const payload = {
    action:      'addWatch',
    id:          `w_${Date.now()}`,
    name,
    type,
    price,
    description: desc,
    mainImage:   mainImg,
    colors:      colors.join(','),
    colorImages: colorImages.join(','),
  };

  const btn = document.querySelector('#tabWatches .btn-gold');
  btn.textContent = 'Adding…';
  btn.disabled = true;

  try {
    const result = await postToScript(payload);
    if (!result || result.success !== true) {
      showToast('❌ ' + (result?.error || 'Google Sheets — vérifiez SPREADSHEET_ID dans Code.gs et redéploiement.'));
      btn.textContent = 'Add Watch to Catalog';
      btn.disabled = false;
      return;
    }

    showToast('✅ Montre enregistrée dans la feuille.');

    ['aName','aType','aPrice','aDesc','aMainImg'].forEach(id => document.getElementById(id).value = '');
    const st = document.getElementById('aMainImgStatus');
    if (st) st.textContent = '';
    document.getElementById('colorRows').innerHTML = '';
    colorRowCount = 0;
    addColorRow();

    setTimeout(loadAdminWatches, 800);

  } catch (e) {
    showToast('❌ Error adding watch.');
  }

  btn.textContent = 'Add Watch to Catalog';
  btn.disabled = false;
}

// ── LOAD ADMIN DATA ───────────────────────────────────────────────────────────
async function initAdminData() {
  loadAdminWatches();
}

async function loadAdminWatches() {
  const listEl = document.getElementById('adminWatchList');
  listEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--gray);font-size:12px"><div class="spinner"></div>Loading…</div>';

  const watches = await fetchWatches();

  if (watches.length === 0) {
    listEl.innerHTML = '<p style="color:var(--gray);text-align:center;font-size:12px;padding:20px">No watches yet. Add one above.</p>';
    return;
  }

  listEl.innerHTML = watches.map(w => `
    <div class="admin-watch-item">
      <img src="${w.mainImage}" alt="${w.name}" onerror="this.style.display='none'">
      <div class="info">
        <strong>${w.name}</strong>
        <span>${w.type} — ${w.price} DZD</span>
      </div>
      <button class="btn-delete" onclick="deleteWatch('${w.id}', this)">Delete</button>
    </div>
  `).join('');
}

async function deleteWatch(id, btn) {
  if (!confirm('Delete this watch? This cannot be undone.')) return;
  btn.textContent = '…';

  try {
    const result = await postToScript({ action: 'deleteWatch', id });
    if (!result || result.success !== true) {
      showToast(result?.error || 'Suppression impossible.');
      btn.textContent = 'Delete';
      return;
    }
    showToast('Watch deleted.');
    setTimeout(loadAdminWatches, 800);
  } catch (e) {
    showToast('Error deleting watch.');
    btn.textContent = 'Delete';
  }
}

async function loadOrders() {
  const listEl = document.getElementById('ordersList');
  listEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--gray);font-size:12px"><div class="spinner"></div>Loading…</div>';

  try {
    const res  = await fetch(`${SCRIPT_URL}?action=getOrders`);
    const data = await res.json();
    const orders = data.orders || [];

    if (orders.length === 0) {
      listEl.innerHTML = '<p style="color:var(--gray);text-align:center;font-size:12px;padding:20px">No orders yet.</p>';
      return;
    }

    listEl.innerHTML = orders.reverse().map(o => `
      <div style="background:var(--dark2);border:1px solid rgba(255,255,255,0.06);border-radius:4px;padding:16px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div>
            <strong style="color:var(--white);font-size:15px">${o.clientName}</strong>
            <div style="color:var(--gold);font-size:11px;letter-spacing:2px;margin-top:2px">${o.watchName} — ${o.watchColor}</div>
          </div>
          <div style="font-family:var(--font-display);font-size:18px;color:var(--white)">${o.watchPrice} DZD</div>
        </div>
        <div style="color:var(--gray);font-size:12px;line-height:1.7">
          📞 ${o.clientPhone || ''}<br>
          ${wilayaHtml(o)}
          📦 Livraison: ${o.carrier ? o.carrier : 'ZR Express'} ${o.deliveryMode ? '(' + escapeAdmin(o.deliveryMode) + ')' : ''} ${o.shippingDZD != null && o.shippingDZD !== '' ? '— ' + escapeAdmin(o.shippingDZD) + ' DA' : ''}<br>
          📍 ${escapeAdmin(o.clientAddress || '')}<br>
          ${o.notes ? '📝 ' + escapeAdmin(o.notes).replace(/\n/g, '<br>') + '<br>' : ''}
          🕐 ${new Date(o.timestamp).toLocaleString('fr-DZ')}
        </div>
      </div>
    `).join('');
  } catch (e) {
    listEl.innerHTML = '<p style="color:#ff6b6b;text-align:center;font-size:12px;padding:20px">Error loading orders.</p>';
  }
}
