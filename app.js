// ==========================================================================
// TF Cost Governor - Frontend Interactive Engine
// ==========================================================================

let appState = {
  resources: [],
  filtered: [],
  selectedProvider: 'ALL',
  searchQuery: '',
  sortBy: 'cost-desc'
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initApp();
});

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');

  document.documentElement.setAttribute('data-theme', initialTheme);

  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      showToast(newTheme === 'dark' ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated');
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage') || toast;
  toastMsg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

async function initApp() {
  setupEventListeners();

  let data = window.GOVERNANCE_DATA;

  if (!data) {
    try {
      const response = await fetch('data/governance_data.json');
      if (response.ok) {
        data = await response.json();
      }
    } catch (err) {
      console.warn('Could not fetch json file:', err);
    }
  }

  if (data) {
    appState.resources = data.resources || [];
    renderStats(data);
    renderBriefSummary(data.summary);
    renderProviderPills(data.providers || []);
    applyFiltersAndSort();
  }
}

function renderStats(data) {
  document.getElementById('statResources').textContent = data.total_resources || 0;
  document.getElementById('statMonthlySpend').textContent = `$${(data.total_monthly_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo`;
  document.getElementById('statCompliance').textContent = `${data.compliance_rate || 100}% PASSED`;

  if (data.generated_at) {
    const dateObj = new Date(data.generated_at);
    document.getElementById('lastUpdatedTag').textContent = `Last updated: ${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}

function renderBriefSummary(summary) {
  if (!summary || !summary.markdown_brief) return;
  const rawMarkdown = summary.markdown_brief;
  const formattedHtml = rawMarkdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '<br>');

  document.getElementById('briefContent').innerHTML = formattedHtml;
}

function renderProviderPills(providers) {
  const container = document.getElementById('providerContainer');
  container.querySelectorAll('.cat-pill:not([data-provider="ALL"])').forEach(el => el.remove());

  providers.sort().forEach(prov => {
    const btn = document.createElement('button');
    btn.className = 'cat-pill';
    btn.dataset.provider = prov;
    btn.textContent = prov;
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.selectedProvider = prov;
      applyFiltersAndSort();
    });
    container.appendChild(btn);
  });
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const sortSelect = document.getElementById('sortSelect');
  const allCatBtn = document.querySelector('.cat-pill[data-provider="ALL"]');

  searchInput.addEventListener('input', (e) => {
    appState.searchQuery = e.target.value.toLowerCase().trim();
    clearBtn.classList.toggle('show', appState.searchQuery.length > 0);
    applyFiltersAndSort();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    appState.searchQuery = '';
    clearBtn.classList.remove('show');
    applyFiltersAndSort();
  });

  allCatBtn.addEventListener('click', () => {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    allCatBtn.classList.add('active');
    appState.selectedProvider = 'ALL';
    applyFiltersAndSort();
  });

  sortSelect.addEventListener('change', (e) => {
    appState.sortBy = e.target.value;
    applyFiltersAndSort();
  });
}

function applyFiltersAndSort() {
  let list = [...appState.resources];

  if (appState.selectedProvider !== 'ALL') {
    list = list.filter(item => item.provider === appState.selectedProvider);
  }

  if (appState.searchQuery) {
    const q = appState.searchQuery;
    list = list.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.provider.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  }

  switch (appState.sortBy) {
    case 'cost-desc':
      list.sort((a, b) => b.monthly_cost - a.monthly_cost);
      break;
    case 'cost-asc':
      list.sort((a, b) => a.monthly_cost - b.monthly_cost);
      break;
    case 'name-asc':
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  appState.filtered = list;
  document.getElementById('resultsCount').textContent = `Showing ${list.length} of ${appState.resources.length} tracked IaC resources`;

  renderTable(list);
}

function renderTable(items) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = items.map(item => `
    <tr>
      <td style="font-weight: 700; color: var(--text-main);">${item.name}</td>
      <td><span class="pill-provider">${item.provider}</span></td>
      <td style="color: var(--text-muted); font-size: 12px;">${item.category}</td>
      <td style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-cyan);">$${item.monthly_cost.toFixed(2)}</td>
      <td><span class="score-badge">✔ ${item.policy_rule}</span></td>
      <td style="font-size: 12px; color: var(--text-muted); max-width: 380px;">${item.finops_tip}</td>
    </tr>
  `).join('');
}
