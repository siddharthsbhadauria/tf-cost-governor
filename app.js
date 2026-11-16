// TF Cost Governor dashboard. Renders data/governance_data.js (window.GOVERNANCE_DATA).

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
const money = (n, dp = 0) => `$${n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const CHECK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>';

const state = { resources: [], cloud: '', query: '' };

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  let data = window.GOVERNANCE_DATA;
  if (!data) {
    try { data = await (await fetch('data/governance_data.json')).json(); } catch (e) { data = null; }
  }
  if (data && data.resources?.length) {
    state.resources = data.resources;
    renderUpdated(data.generated_at);
    renderHeadline(data.resources);
    renderClouds(data.resources);
    renderBars(data.resources);
    initTable();
  } else {
    document.getElementById('tableBody').innerHTML = '<tr><td colspan="5" class="empty">The dataset could not be loaded.</td></tr>';
  }
  initBand();
  initReveal();
});

function initTheme() {
  const root = document.documentElement;
  const dark = matchMedia('(prefers-color-scheme: dark)');
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = (root.dataset.theme || (dark.matches ? 'dark' : 'light')) === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

function renderUpdated(iso) {
  if (!iso) return;
  const d = new Date(iso);
  document.getElementById('updated').textContent =
    `Updated ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

/* ---------- Band ---------- */

function renderHeadline(res) {
  const total = res.reduce((s, r) => s + r.monthly_cost, 0);
  const top = [...res].sort((a, b) => b.monthly_cost - a.monthly_cost)[0];
  const share = Math.round((top.monthly_cost / total) * 100);
  const priced = res.filter((r) => r.monthly_cost > 0);
  const passing = priced.filter((r) => r.policy_pass).length;
  const cards = [
    { value: `${money(total)}`, label: `a month, estimated, to run all ${res.length} resources across AWS, GCP and Azure.`, context: `${money(total * 12)} a year` },
    { value: `${share}%`, label: `of that is one resource: the ${top.name}.`, context: money(top.monthly_cost, 2) + ' / month' },
    { value: `${passing} of ${priced.length}`, label: 'priced resources enforce their security guardrail.', context: 'KMS, IMDSv2, private endpoints, TLS 1.2' },
  ];
  document.getElementById('headline').innerHTML = cards.map((c) => `
    <div class="outcome">
      <dt class="outcome-label">${esc(c.label)}</dt>
      <dd class="outcome-value">${esc(c.value)}</dd>
      <dd class="outcome-context">${esc(c.context)}</dd>
    </div>`).join('');
}

/* ---------- Spend ---------- */

function renderClouds(res) {
  const order = ['AWS', 'GCP', 'Azure'];
  const groups = order.map((c) => {
    const rs = res.filter((r) => r.provider === c);
    return { c, total: rs.reduce((s, r) => s + r.monthly_cost, 0), n: rs.length };
  }).filter((g) => g.n);
  document.getElementById('clouds').innerHTML = groups.map((g) => `
    <div class="cloud">
      <p class="cloud-name">${esc(g.c)}</p>
      <p class="cloud-total">${money(g.total)}</p>
      <p class="cloud-meta">${g.n} resources · per month</p>
    </div>`).join('');
}

function renderBars(res) {
  const sorted = [...res].filter((r) => r.monthly_cost > 0).sort((a, b) => b.monthly_cost - a.monthly_cost);
  const free = res.filter((r) => !r.monthly_cost);
  const max = sorted[0].monthly_cost;
  const list = document.getElementById('bars');
  list.innerHTML = sorted.map((r) => `
    <li class="bar-row">
      <span class="bar-name">${esc(r.name)}<small>${esc(r.provider)} · ${esc(r.id)}</small></span>
      <span class="bar-track" aria-hidden="true"><i style="width:${(r.monthly_cost / max) * 100}%"></i></span>
      <span class="bar-cost">${money(r.monthly_cost, 2)}</span>
    </li>`).join('') + (free.length ? `
    <li class="bar-row is-zero">
      <span class="bar-name bar-free">${free.length} more resources billed through a parent<small>${free.map((r) => esc(r.id)).join('<br>')}</small></span>
      <span class="bar-cost">$0.00</span>
    </li>` : '');
  if (!document.documentElement.classList.contains('motion')) { list.classList.add('in'); return; }
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { list.classList.add('in'); io.disconnect(); }
  }, { rootMargin: '0px 0px -15% 0px' });
  io.observe(list);
}

/* ---------- Table ---------- */

function initTable() {
  const select = document.getElementById('cloudSelect');
  [...new Set(state.resources.map((r) => r.provider))].sort().forEach((c) => select.add(new Option(c, c)));
  select.addEventListener('change', () => { state.cloud = select.value; renderTable(); });
  document.getElementById('searchInput').addEventListener('input', (e) => { state.query = e.target.value.trim().toLowerCase(); renderTable(); });
  renderTable();
}

function renderTable() {
  const rows = state.resources
    .filter((r) => !state.cloud || r.provider === state.cloud)
    .filter((r) => !state.query || `${r.name} ${r.id} ${r.policy_rule} ${r.category}`.toLowerCase().includes(state.query))
    .sort((a, b) => b.monthly_cost - a.monthly_cost);
  document.getElementById('resultCount').textContent = `${rows.length} of ${state.resources.length} resources`;
  document.getElementById('tableBody').innerHTML = rows.length ? rows.map((r) => `
    <tr>
      <td class="res">${esc(r.monthly_cost ? r.name : r.category)}<span class="addr">${esc(r.id)}</span></td>
      <td class="cloud-col">${esc(r.provider)}</td>
      <td class="rule">${r.policy_pass ? `<span class="status">${CHECK}Pass</span>` : '<span class="status fail">Fail</span>'}<br>${esc(r.policy_rule)}</td>
      <td class="num">${money(r.monthly_cost, 2)}</td>
      <td class="tip-col">${esc(r.finops_tip)}</td>
    </tr>`).join('') : '<tr><td colspan="5" class="empty">No resources match.</td></tr>';
}

/* ---------- Motion ---------- */

function initBand() {
  const band = document.querySelector('.outcomes');
  if (!document.documentElement.classList.contains('motion')) { band.classList.add('in'); return; }
  const open = () => { band.classList.add('in'); removeEventListener('scroll', check); };
  const check = () => { if (scrollY > 80 || band.getBoundingClientRect().top < innerHeight * 0.45) open(); };
  addEventListener('scroll', check, { passive: true });
  check();
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!document.documentElement.classList.contains('motion')) { els.forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
}
