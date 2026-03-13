// State
let allPorts = [];
let filteredPorts = [];
let autoRefreshTimer = null;
let prevPortSet = new Set();
let pendingKill = null;

// DOM
const listBody = document.getElementById('port-list-body');
const searchInput = document.getElementById('search-input');
const countBadge = document.getElementById('count-badge');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const autoRefreshBtn = document.getElementById('auto-refresh-btn');
const autoRefreshLabel = document.getElementById('auto-refresh-label');
const refreshBtn = document.getElementById('refresh-btn');
const killModal = document.getElementById('kill-modal');
const killModalText = document.getElementById('kill-modal-text');
const killConfirmBtn = document.getElementById('kill-confirm-btn');
const killCancelBtn = document.getElementById('kill-cancel-btn');
const toastContainer = document.getElementById('toast-container');

// ─── LOAD ────────────────────────────────────────────────────────────────────
async function loadPorts() {
  setStatus('loading', 'Scanning…');
  const ports = await window.api.getAllPorts();
  allPorts = ports.sort((a, b) => a.port - b.port);

  const newSet = new Set(allPorts.map(p => `${p.pid}-${p.port}`));
  // mark new entries
  allPorts.forEach(p => { p._new = !prevPortSet.has(`${p.pid}-${p.port}`); });
  prevPortSet = newSet;

  applyFilter();
  setStatus('idle', `${allPorts.length} port${allPorts.length !== 1 ? 's' : ''} listening`);
}

function applyFilter() {
  const q = searchInput.value.trim().toLowerCase();
  filteredPorts = q
    ? allPorts.filter(p =>
        String(p.port).includes(q) ||
        p.command.toLowerCase().includes(q) ||
        String(p.pid).includes(q) ||
        p.user.toLowerCase().includes(q)
      )
    : allPorts;
  render();
}

// ─── RENDER ──────────────────────────────────────────────────────────────────
function render() {
  countBadge.textContent = allPorts.length;

  if (filteredPorts.length === 0) {
    listBody.innerHTML = `
      <div class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
        <p>No ports found</p>
      </div>`;
    return;
  }

  listBody.innerHTML = filteredPorts.map(p => `
    <div class="port-row${p._new ? ' new' : ''}" data-port="${p.port}">
      <div class="port-num">${p.port}</div>
      <div>
        <div class="process-name">${escHtml(p.command)}</div>
        <div class="process-pid">user: ${escHtml(p.user)}</div>
      </div>
      <div class="pid-cell">${p.pid}</div>
      <div><span class="proto-badge">${p.protocol}</span></div>
      <div>
        <button class="kill-btn" data-pid="${p.pid}" data-port="${p.port}" data-cmd="${escHtml(p.command)}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Kill
        </button>
      </div>
    </div>
  `).join('');

  // attach kill listeners
  listBody.querySelectorAll('.kill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { pid, port, cmd } = btn.dataset;
      showKillModal(Number(pid), Number(port), cmd);
    });
  });
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── KILL MODAL ──────────────────────────────────────────────────────────────
function showKillModal(pid, port, cmd) {
  pendingKill = { pid, port, cmd };
  killModalText.textContent = `Kill "${cmd}" (PID ${pid}) on port :${port}?`;
  killModal.classList.remove('hidden');
}

killCancelBtn.addEventListener('click', () => {
  killModal.classList.add('hidden');
  pendingKill = null;
});

killConfirmBtn.addEventListener('click', async () => {
  if (!pendingKill) return;
  killModal.classList.add('hidden');
  const { pid, port, cmd } = pendingKill;
  pendingKill = null;

  const result = await window.api.killProcess(pid);
  if (result.ok) {
    toast(`Killed "${cmd}" on :${port}`, 'success');
    await loadPorts();
  } else {
    toast(`Failed: ${result.error}`, 'error');
  }
});

// ─── TOAST ───────────────────────────────────────────────────────────────────
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  toastContainer.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ─── STATUS ──────────────────────────────────────────────────────────────────
function setStatus(state, msg) {
  statusText.textContent = msg;
  statusDot.className = 'status-dot' + (state === 'loading' ? ' loading' : '');
}

// ─── AUTO REFRESH ────────────────────────────────────────────────────────────
autoRefreshBtn.addEventListener('click', () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
    autoRefreshLabel.textContent = 'Auto Refresh: Off';
    autoRefreshBtn.classList.remove('primary');
  } else {
    autoRefreshTimer = setInterval(loadPorts, 2000);
    autoRefreshLabel.textContent = 'Auto Refresh: On';
    autoRefreshBtn.classList.add('primary');
  }
});

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
document.querySelectorAll('.sidebar-item[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-item[data-view]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.dataset.view === 'all') {
      searchInput.value = '';
      applyFilter();
    } else {
      searchInput.focus();
    }
  });
});

document.querySelectorAll('.sidebar-item[data-quickport]').forEach(btn => {
  btn.addEventListener('click', () => {
    searchInput.value = btn.dataset.quickport;
    applyFilter();
    document.querySelectorAll('.sidebar-item[data-view]').forEach(b => b.classList.remove('active'));
  });
});

// ─── SEARCH ──────────────────────────────────────────────────────────────────
searchInput.addEventListener('input', applyFilter);

// ─── REFRESH ─────────────────────────────────────────────────────────────────
refreshBtn.addEventListener('click', loadPorts);

// ─── DONATE ──────────────────────────────────────────────────────────────────
const donateUrl = 'https://ko-fi.com/rexlqv';
document.getElementById('donate-btn').addEventListener('click', () => window.api.openExternal(donateUrl));
document.getElementById('donate-link').addEventListener('click', () => window.api.openExternal(donateUrl));

// ─── INIT ────────────────────────────────────────────────────────────────────
loadPorts();
