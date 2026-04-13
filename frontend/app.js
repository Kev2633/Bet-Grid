// EdgeBoard - app.js
// State
const state = {
  accounts: [],
  transactions: [],
  promotions: [
    { id: 1, book: 'fanduel', bookName: 'FanDuel', title: 'Bet $5 Get $200 in Bonus Bets', sport: 'nba', terms: 'New users only. Min $5 bet required.', expiry: '2026-04-30' },
    { id: 2, book: 'draftkings', bookName: 'DraftKings', title: '20% Deposit Match up to $1000', sport: 'nfl', terms: '1x playthrough on deposit. Max bonus $1000.', expiry: '2026-05-15' },
    { id: 3, book: 'betmgm', bookName: 'BetMGM', title: 'First Bet up to $1500', sport: 'mlb', terms: 'If first bet loses, get back as bonus bets.', expiry: '2026-04-20' },
    { id: 4, book: 'caesars', bookName: 'Caesars', title: 'Profit Boost 50% on MLB', sport: 'mlb', terms: 'Max bet $25. Boost applied automatically.', expiry: '2026-04-18' },
    { id: 5, book: 'fanduel', bookName: 'FanDuel', title: 'No Sweat SGP - NBA Playoffs', sport: 'nba', terms: 'Place SGP of 3+ legs. If it loses, bonus bet back.', expiry: '2026-06-01' },
    { id: 6, book: 'draftkings', bookName: 'DraftKings', title: 'Stepped Up SGP - NHL', sport: 'nhl', terms: 'Boost increases with each leg added.', expiry: '2026-05-01' }
  ],
  lines: [
    { event: 'Lakers vs Celtics', sport: 'nba', market: 'moneyline', fanduel: '+150', draftkings: '+145', betmgm: '+155', caesars: '+148', best: 'BetMGM +155' },
    { event: 'Lakers vs Celtics', sport: 'nba', market: 'spread', fanduel: '+4.5 -110', draftkings: '+4.5 -108', betmgm: '+4 -110', caesars: '+4.5 -112', best: 'DK +4.5 -108' },
    { event: 'Yankees vs Dodgers', sport: 'mlb', market: 'moneyline', fanduel: '-130', draftkings: '-128', betmgm: '-135', caesars: '-125', best: 'Caesars -125' },
    { event: 'Yankees vs Dodgers', sport: 'mlb', market: 'total', fanduel: 'O8.5 -110', draftkings: 'O8.5 -105', betmgm: 'O8.5 -112', caesars: 'O8.5 -108', best: 'DK O8.5 -105' },
    { event: 'Chiefs vs Bills', sport: 'nfl', market: 'spread', fanduel: '-2.5 -110', draftkings: '-2.5 -108', betmgm: '-3 -105', caesars: '-2.5 -112', best: 'DK -2.5 -108' },
    { event: 'Panthers vs Lightning', sport: 'nhl', market: 'moneyline', fanduel: '+120', draftkings: '+125', betmgm: '+118', caesars: '+122', best: 'DK +125' }
  ]
};

// Book display names
const BOOK_NAMES = {
  fanduel: 'FanDuel', draftkings: 'DraftKings', betmgm: 'BetMGM',
  caesars: 'Caesars', pointsbet: 'PointsBet', barstool: 'ESPN BET',
  betrivers: 'BetRivers', hard_rock: 'Hard Rock Bet', fanatics: 'Fanatics'
};

// Tab Navigation
document.querySelectorAll('.nav-links li').forEach(li => {
  li.addEventListener('click', () => {
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    li.classList.add('active');
    document.getElementById('tab-' + li.dataset.tab).classList.add('active');
  });
});

// Render Dashboard
function renderDashboard() {
  const totalDep = state.transactions
    .filter(t => t.type === 'deposit')
    .reduce((s, t) => s + t.amount, 0);
  document.getElementById('total-deposited').textContent = '$' + totalDep.toFixed(2);
  document.getElementById('active-accounts').textContent = state.accounts.length;
  document.getElementById('active-promos').textContent = state.promotions.length;
  if (state.lines.length > 0) {
    document.getElementById('best-line').textContent = state.lines[0].best;
  }
  renderDepositsChart();
  renderRecentTransactions();
}

// Deposits Chart
function renderDepositsChart() {
  const chart = document.getElementById('deposits-chart');
  chart.innerHTML = '';
  const byBook = {};
  state.transactions.filter(t => t.type === 'deposit').forEach(t => {
    byBook[t.sportsbook] = (byBook[t.sportsbook] || 0) + t.amount;
  });
  const max = Math.max(...Object.values(byBook), 1);
  Object.entries(byBook).forEach(([book, amt]) => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = ((amt / max) * 180) + 'px';
    bar.innerHTML = '<span class="bar-value">$' + amt.toFixed(0) + '</span><span class="bar-label">' + (BOOK_NAMES[book] || book) + '</span>';
    chart.appendChild(bar);
  });
  if (Object.keys(byBook).length === 0) {
    chart.innerHTML = '<p style="color:var(--text-secondary);margin:auto;">No deposits yet. Add accounts or import CSV.</p>';
  }
}

// Recent Transactions
function renderRecentTransactions() {
  const tbody = document.querySelector('#recent-transactions tbody');
  tbody.innerHTML = '';
  const recent = state.transactions.slice(-10).reverse();
  recent.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + t.date + '</td><td>' + (BOOK_NAMES[t.sportsbook] || t.sportsbook) + '</td><td>' + t.type + '</td><td class="' + t.type + '">$' + t.amount.toFixed(2) + '</td>';
    tbody.appendChild(tr);
  });
  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="color:var(--text-secondary);text-align:center;">No transactions yet</td></tr>';
  }
}

// Render Lines
function renderLines() {
  const sport = document.getElementById('sport-filter').value;
  const market = document.getElementById('market-filter').value;
  const tbody = document.querySelector('#lines-table tbody');
  tbody.innerHTML = '';
  state.lines
    .filter(l => (sport === 'all' || l.sport === sport) && (market === 'all' || l.market === market))
    .forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + l.event + '</td><td>' + l.market + '</td><td>' + l.fanduel + '</td><td>' + l.draftkings + '</td><td>' + l.betmgm + '</td><td>' + l.caesars + '</td><td class="best-line">' + l.best + '</td>';
      tbody.appendChild(tr);
    });
}

document.getElementById('sport-filter').addEventListener('change', renderLines);
document.getElementById('market-filter').addEventListener('change', renderLines);
document.getElementById('refresh-odds').addEventListener('click', renderLines);

// Render Promos
function renderPromos() {
  const sport = document.getElementById('promo-sport-filter').value;
  const book = document.getElementById('promo-book-filter').value;
  const grid = document.getElementById('promos-grid');
  grid.innerHTML = '';
  state.promotions
    .filter(p => (sport === 'all' || p.sport === sport) && (book === 'all' || p.book === book))
    .forEach(p => {
      const card = document.createElement('div');
      card.className = 'promo-card';
      card.innerHTML = '<span class="book-badge ' + p.book + '">' + p.bookName + '</span><h4>' + p.title + '</h4><div class="promo-sport">' + p.sport.toUpperCase() + '</div><div class="promo-terms">' + p.terms + '</div><div class="promo-expiry">Expires: ' + p.expiry + '</div>';
      grid.appendChild(card);
    });
}

document.getElementById('promo-sport-filter').addEventListener('change', renderPromos);
document.getElementById('promo-book-filter').addEventListener('change', renderPromos);

// Render Accounts
function renderAccounts() {
  const grid = document.getElementById('accounts-grid');
  grid.innerHTML = '';
  state.accounts.forEach(a => {
    const deps = state.transactions.filter(t => t.sportsbook === a.sportsbook && t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
    const wds = state.transactions.filter(t => t.sportsbook === a.sportsbook && t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
    const bonuses = state.transactions.filter(t => t.sportsbook === a.sportsbook && t.type === 'bonus').reduce((s, t) => s + t.amount, 0);
    const card = document.createElement('div');
    card.className = 'account-card';
    card.innerHTML = '<h4>' + (BOOK_NAMES[a.sportsbook] || a.sportsbook) + '</h4>'
      + '<div class="account-nickname">' + (a.nickname || '') + '</div>'
      + '<div class="account-stat"><span class="label">Deposits</span><span class="value deposit">$' + deps.toFixed(2) + '</span></div>'
      + '<div class="account-stat"><span class="label">Withdrawals</span><span class="value withdrawal">$' + wds.toFixed(2) + '</span></div>'
      + '<div class="account-stat"><span class="label">Bonuses</span><span class="value">$' + bonuses.toFixed(2) + '</span></div>'
      + '<div class="account-stat"><span class="label">Net</span><span class="value">$' + (deps - wds + bonuses).toFixed(2) + '</span></div>';
    grid.appendChild(card);
  });
}

// Add Account Modal
document.getElementById('add-account-btn').addEventListener('click', () => {
  document.getElementById('add-account-modal').classList.remove('hidden');
});
document.getElementById('cancel-add-account').addEventListener('click', () => {
  document.getElementById('add-account-modal').classList.add('hidden');
});
document.getElementById('add-account-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const acct = { sportsbook: fd.get('sportsbook'), nickname: fd.get('nickname') };
  state.accounts.push(acct);
  const dep = parseFloat(fd.get('initial_deposit'));
  if (dep > 0) {
    state.transactions.push({ date: new Date().toISOString().slice(0,10), sportsbook: acct.sportsbook, type: 'deposit', amount: dep });
  }
  document.getElementById('add-account-modal').classList.add('hidden');
  e.target.reset();
  renderAll();
});

// CSV Import
let csvData = [];
document.getElementById('parse-csv').addEventListener('click', () => {
  const file = document.getElementById('csv-file').files[0];
  if (!file) return alert('Select a CSV file first.');
  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    csvData = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, i) => row[h] = vals[i]);
      return row;
    });
    // Render preview
    const thead = document.querySelector('#csv-preview-table thead');
    thead.innerHTML = '<tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr>';
    const tbody = document.querySelector('#csv-preview-table tbody');
    tbody.innerHTML = '';
    csvData.slice(0, 20).forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = headers.map(h => '<td>' + (row[h] || '') + '</td>').join('');
      tbody.appendChild(tr);
    });
    document.getElementById('csv-preview').classList.remove('hidden');
  };
  reader.readAsText(file);
});

document.getElementById('confirm-import').addEventListener('click', () => {
  csvData.forEach(row => {
    const txn = {
      date: row.date || new Date().toISOString().slice(0,10),
      sportsbook: (row.sportsbook || '').toLowerCase().replace(/\s+/g, ''),
      type: (row.type || 'deposit').toLowerCase(),
      amount: parseFloat(row.amount) || 0
    };
    state.transactions.push(txn);
    // Auto-create account if not exists
    if (!state.accounts.find(a => a.sportsbook === txn.sportsbook)) {
      state.accounts.push({ sportsbook: txn.sportsbook, nickname: '' });
    }
  });
  csvData = [];
  document.getElementById('csv-preview').classList.add('hidden');
  document.getElementById('csv-file').value = '';
  renderAll();
  alert('Imported ' + state.transactions.length + ' transactions.');
});

// Render All
function renderAll() {
  renderDashboard();
  renderLines();
  renderPromos();
  renderAccounts();
}

// Init
renderAll();
