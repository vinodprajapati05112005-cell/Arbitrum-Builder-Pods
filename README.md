# ArbiLearn 🚀

A modern, beginner-friendly Web3 learning platform built for the **Arbitrum Builder Pods** workshop.
Explore blockchain concepts, track live crypto prices, and simulate mining — all in the browser.

---

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `ArbiLearn/index.html` | Landing page with hero, Layer 2 explainer, features, and blockchain visual |
| Concepts | `ArbiLearn/concepts.html` | Side-by-side comparison cards: Web2/Web3, ETH/BTC, Keys, Blockchain/DB |
| Live Prices | `ArbiLearn/prices.html` | Real-time dashboard using CoinGecko API (BTC, ETH, ARB, SOL) |
| Simulator | `ArbiLearn/simulator.html` | Interactive SHA-256 mining simulator with 2 linked blocks |

## Features

- Futuristic dark theme with purple/blue gradients and glassmorphism cards
- Sticky responsive navbar with mobile hamburger menu
- Animated particle background
- Scroll reveal animations
- Live crypto prices with auto-refresh every 30 seconds
- Real SHA-256 hashing via Web Crypto API (no libraries)
- Proof of Work mining simulation
- Immutability demo — edit Block 1 to break Block 2

## Project Structure

```
ArbiLearn/
├── index.html          # Home / Landing Page
├── concepts.html       # Web3 Concepts comparisons
├── prices.html         # Live Crypto Prices Dashboard
├── simulator.html      # Blockchain Mining Simulator
├── css/
│   ├── style.css       # Global shared styles
│   ├── home.css        # Home page styles
│   ├── concepts.css    # Concepts page styles
│   ├── prices.css      # Prices dashboard styles
│   └── simulator.css   # Simulator styles
├── js/
│   ├── app.js          # Shared: navbar, particles, scroll reveal
│   ├── prices.js       # CoinGecko API fetching & rendering
│   └── simulator.js    # SHA-256 mining logic
└── README.md
```

## Technologies

- HTML5, CSS3, Vanilla JavaScript (ES2020+)
- Web Crypto API (`crypto.subtle.digest`) for SHA-256
- CoinGecko Public API for live prices
- CSS custom properties, flexbox, grid
- IntersectionObserver for scroll animations
- No frameworks, no build tools, no dependencies

## How to Run

**Option 1 — Live Server (Recommended)**
1. Install the **Live Server** extension in VS Code
2. Right-click `ArbiLearn/index.html` → **Open with Live Server**
3. Browser opens at `http://127.0.0.1:5500/ArbiLearn/index.html`

**Option 2 — Python**
```bash
cd ArbiLearn
python -m http.server 8080
```
Then open `http://localhost:8080`

**Option 3 — Node.js**
```bash
cd ArbiLearn
npx serve .
```
Then open `http://localhost:3000`

> **Note:** You need a local server for the Live Prices page to work (CoinGecko API requires `http://` not `file://`)

## API Used

**CoinGecko Simple Price API**
```
GET https://api.coingecko.com/api/v3/simple/price
  ?ids=bitcoin,ethereum,arbitrum,solana
  &vs_currencies=usd
  &include_24hr_change=true
```
Free tier, no API key required. Rate limit: ~10–30 calls/minute.

## Future Improvements

- Add more coins with search/filter
- Persist mined blocks to localStorage
- Add difficulty slider to the mining simulator
- Add a wallet connect demo (MetaMask)
- Add a simple smart contract interaction example
- Dark/light theme toggle
- PWA support for offline use

---

Built with ❤️ by **Your Name** · Arbitrum Builder Pods Batch · 2025
