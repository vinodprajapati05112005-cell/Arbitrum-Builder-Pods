/**
 * ArbiLearn - prices.js
 * Fetches live crypto prices from CoinGecko API
 * and renders animated dashboard cards.
 */

// ── Coin metadata (icons, colors, display names) ──
const COIN_META = {
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
  },
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.15)',
  },
  arbitrum: {
    name: 'Arbitrum',
    symbol: 'ARB',
    icon: '◈',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.15)',
  },
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.15)',
  },
};

// ── CoinGecko API endpoint ──
const API_URL =
  'https://api.coingecko.com/api/v3/simple/price' +
  '?ids=bitcoin,ethereum,arbitrum,solana' +
  '&vs_currencies=usd' +
  '&include_24hr_change=true';

// ── Auto-refresh interval (30 seconds) ──
const REFRESH_INTERVAL = 30_000;
let refreshTimer = null;
let lastUpdated = null;

/**
 * Fetch prices from CoinGecko.
 * Returns the JSON data or throws on error.
 */
async function fetchPrices() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Format a USD price with commas and appropriate decimals.
 * e.g. 65432.12 → "$65,432.12"
 */
function formatPrice(price) {
  if (price >= 1) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  // For very small prices (sub-dollar)
  return '$' + price.toFixed(4);
}

/**
 * Format the 24h change percentage.
 * Returns { text, isPositive }
 */
function formatChange(change) {
  const isPositive = change >= 0;
  const text = (isPositive ? '+' : '') + change.toFixed(2) + '%';
  return { text, isPositive };
}

/**
 * Build a single price card HTML string.
 */
function buildCard(coinId, data, index) {
  const meta   = COIN_META[coinId];
  const price  = data[coinId]?.usd;
  const change = data[coinId]?.usd_24h_change;

  if (price === undefined) return '';

  const { text: changeText, isPositive } = formatChange(change ?? 0);
  const arrow = isPositive ? '▲' : '▼';
  const changeClass = isPositive ? 'positive' : 'negative';

  return `
    <div class="price-card" style="animation-delay:${index * 0.1}s">
      <div class="coin-header">
        <div class="coin-icon" style="background:${meta.bg};color:${meta.color}">
          ${meta.icon}
        </div>
        <div class="coin-info">
          <div class="coin-name">${meta.name}</div>
          <div class="coin-symbol">${meta.symbol}</div>
        </div>
      </div>
      <div class="coin-price">${formatPrice(price)}</div>
      <div class="coin-change ${changeClass}">
        <span class="arrow">${arrow}</span>
        <span>${changeText} (24h)</span>
      </div>
      <div class="coin-updated">Updated: ${new Date().toLocaleTimeString()}</div>
    </div>
  `;
}

/**
 * Render all price cards into the grid.
 */
function renderCards(data) {
  const grid = document.getElementById('price-grid');
  if (!grid) return;

  const coins = Object.keys(COIN_META);
  grid.innerHTML = coins
    .map((id, i) => buildCard(id, data, i))
    .join('');
}

/**
 * Show the loading state.
 */
function showLoading() {
  document.getElementById('loading-state').style.display = 'block';
  document.getElementById('error-state').style.display   = 'none';
  document.getElementById('price-grid').style.display    = 'none';
}

/**
 * Show the error state with a message.
 */
function showError(message) {
  document.getElementById('loading-state').style.display  = 'none';
  document.getElementById('error-state').style.display    = 'block';
  document.getElementById('price-grid').style.display     = 'none';
  document.getElementById('error-message').textContent    = message;

  // Update status indicator
  const dot  = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  dot.className  = 'status-dot error';
  text.textContent = 'Connection failed';
}

/**
 * Show the price grid.
 */
function showGrid() {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('error-state').style.display   = 'none';
  document.getElementById('price-grid').style.display    = 'grid';

  // Update status indicator
  const dot  = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  dot.className  = 'status-dot live';
  text.textContent = 'Live · Auto-refreshes in 30s';
}

/**
 * Main load function — fetches and renders prices.
 */
async function loadPrices(isRefresh = false) {
  if (!isRefresh) showLoading();

  // Animate refresh button
  const refreshIcon = document.getElementById('refresh-icon');
  if (refreshIcon) refreshIcon.classList.add('spinning');

  try {
    const data = await fetchPrices();
    renderCards(data);
    showGrid();
    lastUpdated = new Date();
  } catch (err) {
    console.error('Price fetch failed:', err);
    showError(err.message || 'Unable to connect to CoinGecko API. Check your internet connection.');
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('spinning');
  }
}

/**
 * Start the auto-refresh timer.
 */
function startAutoRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(() => loadPrices(true), REFRESH_INTERVAL);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  // Initial load
  loadPrices();
  startAutoRefresh();

  // Manual refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadPrices(true);
      // Reset the auto-refresh timer so it doesn't double-fire
      startAutoRefresh();
    });
  }
});
