/**
 * ArbiLearn - simulator.js
 * Interactive Blockchain Mining Simulator
 *
 * KEY CONCEPTS EXPLAINED:
 *
 * NONCE: A "number used once." Miners increment this number repeatedly
 *        until the resulting hash meets the difficulty target.
 *        It's the variable that makes mining a computational puzzle.
 *
 * HASHING: SHA-256 is a one-way cryptographic function. Given any input,
 *          it always produces the same 64-character hex output. You cannot
 *          reverse it — you can only try inputs until you find a match.
 *
 * PROOF OF WORK: The difficulty target here is a hash starting with "00".
 *                Miners must find a nonce that produces such a hash.
 *                This proves they did computational work — it can't be faked.
 *
 * IMMUTABILITY: Each block stores the previous block's hash. If you change
 *               Block 1's data, its hash changes, breaking Block 2's link.
 *               This is how blockchains prevent tampering.
 */

// ── State ──
// Stores the mined hash for each block so Block 2 can link to Block 1
const blockState = {
  1: { mined: false, hash: null, nonce: 0 },
  2: { mined: false, hash: null, nonce: 0 },
};

// Mining is async — track if currently running to prevent double-clicks
let miningInProgress = false;

// ── SHA-256 via Web Crypto API ──
/**
 * Compute SHA-256 hash of a string.
 * Uses the browser's built-in Web Crypto API (no libraries needed).
 *
 * @param {string} message - The input string to hash
 * @returns {Promise<string>} - 64-character hex string
 */
async function sha256(message) {
  // Encode the string as UTF-8 bytes
  const msgBuffer = new TextEncoder().encode(message);

  // Use Web Crypto to compute SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // Convert the ArrayBuffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Logging ──
/**
 * Append a line to the terminal-style mining log.
 *
 * @param {number} blockNum - Which block's log to write to
 * @param {string} message  - The log message
 * @param {string} type     - 'default' | 'info' | 'warn' | 'error'
 */
function log(blockNum, message, type = 'default') {
  const logEl = document.getElementById(`log-${blockNum}`);
  if (!logEl) return;

  const line = document.createElement('div');
  line.className = `log-line ${type !== 'default' ? type : ''}`;
  line.textContent = `$ ${message}`;
  logEl.appendChild(line);

  // Auto-scroll to bottom
  logEl.scrollTop = logEl.scrollHeight;
}

/**
 * Clear a block's log.
 */
function clearLog(blockNum) {
  const logEl = document.getElementById(`log-${blockNum}`);
  if (logEl) logEl.innerHTML = '';
}

// ── UI Helpers ──
/**
 * Update the validity badge on a block.
 */
function setValidity(blockNum, status) {
  const el = document.getElementById(`validity-${blockNum}`);
  if (!el) return;

  el.className = 'block-validity';

  if (status === 'valid') {
    el.textContent = '✓ Valid';
    el.classList.add('valid');
  } else if (status === 'invalid') {
    el.textContent = '✗ Invalid';
    el.classList.add('invalid');
  } else if (status === 'mining') {
    el.textContent = '⛏ Mining...';
    el.classList.add('mining');
  } else {
    el.textContent = '⏳ Not Mined';
  }
}

/**
 * Update the block card's border/glow based on state.
 */
function setBlockStyle(blockNum, style) {
  const el = document.getElementById(`block-${blockNum}`);
  if (!el) return;
  el.classList.remove('valid-block', 'invalid-block', 'mining-block');
  if (style) el.classList.add(`${style}-block`);
}

/**
 * Update the hash display box.
 */
function setHashDisplay(blockNum, hash, isValid) {
  const el   = document.getElementById(`hash-${blockNum}`);
  const text = document.getElementById(`hash-text-${blockNum}`);
  if (!el || !text) return;

  text.textContent = hash;
  el.classList.remove('valid-hash', 'invalid-hash');
  if (isValid === true)  el.classList.add('valid-hash');
  if (isValid === false) el.classList.add('invalid-hash');
}

/**
 * Update the nonce display.
 */
function setNonce(blockNum, nonce) {
  const el = document.getElementById(`nonce-${blockNum}`);
  if (el) el.textContent = nonce.toLocaleString();
}

/**
 * Update Block 2's "Previous Hash" display to show Block 1's hash.
 */
function linkBlock2ToBlock1(hash) {
  const el   = document.getElementById('prev-hash-2');
  const text = document.getElementById('prev-hash-text-2');
  if (!el || !text) return;

  text.textContent = hash;
  el.classList.add('valid-hash');
}

// ── Core Mining Logic ──
/**
 * Mine a block using Proof of Work.
 *
 * PROOF OF WORK ALGORITHM:
 * 1. Take block data + previous hash + nonce
 * 2. Hash them together with SHA-256
 * 3. If hash starts with "00" → FOUND! Block is mined.
 * 4. Otherwise, increment nonce and try again.
 *
 * The difficulty here is "starts with 00" (2 leading zeros).
 * Real Bitcoin requires ~19 leading zeros — much harder!
 *
 * @param {number} blockNum - Which block to mine (1 or 2)
 */
async function mineBlock(blockNum) {
  if (miningInProgress) return;

  // Block 2 requires Block 1 to be mined first
  if (blockNum === 2 && !blockState[1].mined) {
    log(2, 'ERROR: Mine Block #1 first!', 'error');
    return;
  }

  miningInProgress = true;

  // Get the block's data input
  const data = document.getElementById(`data-${blockNum}`)?.value?.trim() || 'empty';

  // Get the previous hash
  // Block 1's previous hash is all zeros (genesis)
  // Block 2's previous hash is Block 1's mined hash
  const prevHash = blockNum === 1
    ? '0000000000000000000000000000000000000000000000000000000000000000'
    : blockState[1].hash;

  // Disable the mine button during mining
  const mineBtn = document.getElementById(`mine-btn-${blockNum}`);
  if (mineBtn) mineBtn.disabled = true;

  // Reset state
  clearLog(blockNum);
  setValidity(blockNum, 'mining');
  setBlockStyle(blockNum, 'mining');
  blockState[blockNum].mined = false;
  blockState[blockNum].nonce = 0;

  log(blockNum, `Starting mining Block #${blockNum}...`, 'info');
  log(blockNum, `Data: "${data}"`, 'info');
  log(blockNum, `Prev Hash: ${prevHash.slice(0, 16)}...`, 'info');
  log(blockNum, `Difficulty: hash must start with "00"`, 'warn');

  let nonce = 0;
  let hash  = '';
  let found = false;

  // ── Mining Loop ──
  // We use async batching to avoid freezing the browser UI.
  // Every 500 iterations, we yield control back to the browser
  // so the DOM can update and show progress.
  const BATCH_SIZE = 500;

  while (!found) {
    // Process a batch of nonces
    for (let i = 0; i < BATCH_SIZE; i++) {
      // Build the block content string: data + prevHash + nonce
      const content = `${data}${prevHash}${nonce}`;

      // Compute SHA-256 hash
      hash = await sha256(content);

      // PROOF OF WORK CHECK: Does the hash start with "00"?
      if (hash.startsWith('00')) {
        found = true;
        break;
      }

      nonce++;
    }

    // Update UI every batch
    setNonce(blockNum, nonce);
    setHashDisplay(blockNum, hash, null);

    // Log progress every 2000 iterations
    if (nonce % 2000 === 0 && !found) {
      log(blockNum, `Tried ${nonce.toLocaleString()} nonces... still mining`);
    }

    // Yield to browser to keep UI responsive
    if (!found) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // ── Block Mined! ──
  blockState[blockNum].mined = true;
  blockState[blockNum].hash  = hash;
  blockState[blockNum].nonce = nonce;

  // Update UI
  setNonce(blockNum, nonce);
  setHashDisplay(blockNum, hash, true);
  setValidity(blockNum, 'valid');
  setBlockStyle(blockNum, 'valid');

  log(blockNum, `✓ BLOCK MINED! Nonce: ${nonce.toLocaleString()}`, 'info');
  log(blockNum, `✓ Hash: ${hash}`, 'info');
  log(blockNum, `✓ Proof of Work verified (starts with "00")`, 'info');

  // If Block 1 was mined, link Block 2 and enable its mine button
  if (blockNum === 1) {
    linkBlock2ToBlock1(hash);

    // Enable Block 2's mine button
    const btn2 = document.getElementById('mine-btn-2');
    if (btn2) btn2.disabled = false;

    // Update Block 2's validity label
    setValidity(2, 'pending');
    document.getElementById('validity-2').textContent = '⏳ Ready to Mine';

    // Activate chain connector
    const connector = document.getElementById('connector-1-2');
    if (connector) connector.classList.add('linked');

    log(2, `Block #1 mined! Previous hash linked.`, 'info');
    log(2, `You can now mine Block #2.`, 'info');
  }

  // Update tamper demo status
  updateTamperStatus();

  // Re-enable mine button
  if (mineBtn) mineBtn.disabled = false;
  miningInProgress = false;
}

// ── Tamper Detection ──
/**
 * Check if Block 2's previous hash still matches Block 1's current hash.
 * This demonstrates IMMUTABILITY — changing Block 1 breaks Block 2.
 */
async function checkChainIntegrity() {
  if (!blockState[1].mined || !blockState[2].mined) return;

  const data1    = document.getElementById('data-1')?.value?.trim() || 'empty';
  const prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  // Recompute Block 1's hash with current data
  const content  = `${data1}${prevHash}${blockState[1].nonce}`;
  const newHash1 = await sha256(content);

  const isIntact = newHash1 === blockState[1].hash;

  if (!isIntact) {
    // Block 1 was tampered — Block 2 is now invalid
    setBlockStyle(2, 'invalid');
    setValidity(2, 'invalid');
    setHashDisplay(2, blockState[2].hash, false);

    const connector = document.getElementById('connector-1-2');
    if (connector) connector.classList.remove('linked');

    updateTamperStatus(false);
  } else {
    setBlockStyle(2, 'valid');
    setValidity(2, 'valid');
    setHashDisplay(2, blockState[2].hash, true);

    const connector = document.getElementById('connector-1-2');
    if (connector) connector.classList.add('linked');

    updateTamperStatus(true);
  }
}

/**
 * Update the tamper demo status box.
 */
function updateTamperStatus(isValid) {
  const el = document.getElementById('tamper-status');
  if (!el) return;

  if (!blockState[1].mined || !blockState[2].mined) {
    el.className = 'tamper-status';
    el.textContent = 'Mine both blocks to see the immutability demo.';
    return;
  }

  if (isValid === false) {
    el.className = 'tamper-status chain-broken';
    el.textContent = '⛔ Chain BROKEN! Block #1 was tampered. Block #2 is now invalid because its "Previous Hash" no longer matches Block #1\'s hash. This is how blockchains prevent fraud!';
  } else {
    el.className = 'tamper-status chain-valid';
    el.textContent = '✅ Chain VALID! Both blocks are intact and properly linked. Try editing Block #1\'s data to see what happens.';
  }
}

// ── Listen for data changes on Block 1 ──
// When Block 1's data changes after both blocks are mined,
// re-check chain integrity to demonstrate immutability.
document.addEventListener('DOMContentLoaded', () => {
  const input1 = document.getElementById('data-1');
  if (input1) {
    input1.addEventListener('input', () => {
      if (blockState[1].mined && blockState[2].mined) {
        checkChainIntegrity();
      }
    });
  }
});
