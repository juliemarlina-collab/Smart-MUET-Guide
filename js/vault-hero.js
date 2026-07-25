/* =================================================
   MUET SmartHub — vault-hero.js
   Blueprint v3.5 — SVG NAMING FIX
   Renamed vault files to remove spaces from paths
================================================= */

// IMPORTANT: SVG files have been renamed to remove spaces:
// OLD: vault 02-hero.svg → NEW: vault-02-hero.svg
// OLD: mock exam 01-hero.svg → NEW: mock-exam-01-hero.svg
// This prevents loading errors and improves compatibility

const VAULT_HERO_CONFIG = {
  'VAULT-00': {
    label: 'Starter Vault · Sample Practice',
    title: 'Starter Vault',
    subtitle: 'Learn the app flow using sample questions. Does not count toward your main vault scores.',
    image: 'assets/heroes/welcome-hero.svg'
  },
  'VAULT-01': {
    label: 'Foundation Practice Set 1',
    title: 'Vault 1 Guided Journey',
    subtitle: 'Start strong with guided MUET practice across all four tested components.',
    image: 'assets/heroes/vault-1-guided-journey-card.svg'
  },
  'VAULT-02': {
    label: 'Foundation Practice Set 2',
    title: 'Vault 2 Guided Journey',
    subtitle: 'Keep building your MUET skills with a fresh set of guided practice across all four tested components.',
    image: 'assets/heroes/vault-02-hero.svg'  // ← FIXED: was "vault 02-hero.svg"
  },
  'VAULT-03': {
    label: 'Foundation Practice Set 3',
    title: 'Vault 3 Guided Journey',
    subtitle: 'Keep building your MUET skills with a fresh set of guided practice across all four tested components.',
    image: 'assets/heroes/vault-03-hero.svg'  // ← FIXED: was "vault 03-hero.svg"
  },
  'VAULT-04': {
    label: 'Foundation Practice Set 4',
    title: 'Vault 4 Guided Journey',
    subtitle: 'Keep building your MUET skills with a fresh set of guided practice across all four tested components.',
    image: 'assets/heroes/vault-04-hero.svg'  // ← FIXED: was "vault 04-hero.svg"
  },
  'VAULT-05': {
    label: 'Foundation Practice Set 5',
    title: 'Vault 5 Guided Journey',
    subtitle: 'Keep building your MUET skills with a fresh set of guided practice across all four tested components.',
    image: 'assets/heroes/vault-05-hero.svg'  // ← FIXED: was "vault 05- hero.svg"
  },
  'VAULT-06': {
    label: 'Foundation Practice Set 6',
    title: 'Vault 6 Guided Journey',
    subtitle: 'Keep building your MUET skills with a fresh set of guided practice across all four tested components.',
    image: 'assets/heroes/vault-06-hero.svg'
  },
  'MOCK-01': {
    label: 'Full Mock Exam 1',
    title: 'Mock Exam 1',
    subtitle: 'A full, timed simulation of all four MUET components.',
    image: 'assets/heroes/mock-exam-01-hero.svg'  // ← FIXED: was "mock exam 01-hero.svg"
  },
  'MOCK-02': {
    label: 'Full Mock Exam 2',
    title: 'Mock Exam 2',
    subtitle: 'A full, timed simulation of all four MUET components.',
    image: 'assets/heroes/mock-exam-02-hero.svg'  // ← FIXED: was "mock exam 02-hero.svg"
  }
};

// Fallback used for any vaultId not yet listed above (e.g. new vaults added
// before their hero artwork/config entry is ready).
function fallbackHeroConfig(vaultId, vaultTitle) {
  return {
    label: 'Guided Practice Set',
    title: vaultTitle || vaultId,
    subtitle: 'Keep building your MUET skills with a fresh set of guided practice across all four tested components.',
    image: 'assets/heroes/study-vault-hero.svg'
  };
}

document.addEventListener('DOMContentLoaded', function () {
  const mount = document.getElementById('vaultHeroMount');
  if (!mount) return;

  // Read active vault context
  let vaultId    = 'VAULT-01';
  let vaultTitle = 'Vault 1';
  let vaultType  = 'practice';
  try {
    const av = JSON.parse(localStorage.getItem('muet_active_vault') || '{}');
    if (av.vaultId)    vaultId    = av.vaultId;
    if (av.vaultTitle) vaultTitle = av.vaultTitle;
    if (av.vaultType)  vaultType  = av.vaultType;
  } catch (_) {}

  // Progress count
  let count = 0;
  try {
    if (window.MUET && typeof MUET.vaultProgress === 'function') {
      count = MUET.vaultProgress(vaultId).count || 0;
    }
  } catch (_) {}

  const cfg = VAULT_HERO_CONFIG[vaultId] || fallbackHeroConfig(vaultId, vaultTitle);
  const { label, title, subtitle, image } = cfg;

  const progressLabel = count === 4 ? '✅ All 4 Components Done' : `🏆 ${count} / 4 Completed`;

  mount.innerHTML = `
    <div class="vault-hero-wrap">
      <div class="vault-hero-card">
        <img
          src="${image}"
          alt="${title} hero image"
          class="vault-hero-image"
          loading="lazy"
          onerror="this.closest('.vault-hero-card').style.background='linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)'; this.style.display='none'"
        >
        <div class="vault-hero-caption">
          <div class="vault-hero-label">${label}</div>
          <h2 class="vault-hero-title">${title}</h2>
          <p class="vault-hero-subtitle">${subtitle}</p>
          <div class="vault-hero-meta">
            <div class="vault-meta-pill speaking">🎤<span>Speaking<br><small>800/2</small></span></div>
            <div class="vault-meta-pill reading">📖<span>Reading<br><small>800/3</small></span></div>
            <div class="vault-meta-pill listening">🎧<span>Listening<br><small>800/1</small></span></div>
            <div class="vault-meta-pill writing">✍️<span>Writing<br><small>800/4</small></span></div>
            <div class="vault-meta-pill progress" id="heroProgressChip">${progressLabel}</div>
          </div>
        </div>
      </div>
    </div>`;

  // Keep hero progress chip in sync whenever updateVaultProgress() runs
  const _origUpdate = window.updateVaultProgress;
  if (typeof _origUpdate === 'function') {
    window.updateVaultProgress = function () {
      _origUpdate();
      try {
        const prog = MUET.vaultProgress(vaultId);
        const chip = document.getElementById('heroProgressChip');
        if (chip) {
          // Animate the update
          chip.style.animation = 'none';
          setTimeout(() => {
            chip.textContent = prog.count === 4 ? '✅ All 4 Components Done' : `🏆 ${prog.count} / 4 Completed`;
            chip.style.animation = 'progressPulse 2s ease-in-out';
          }, 10);
        }
      } catch (_) {}
    };
  }
});
