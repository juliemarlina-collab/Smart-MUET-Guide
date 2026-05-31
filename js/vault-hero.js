/* =========================
   SMART MUET — VAULT HERO JS
   Reusable hero renderer for vault welcome pages
========================= */

document.addEventListener("DOMContentLoaded", function () {
  const heroMount = document.getElementById("vaultHeroMount");
  if (!heroMount) return;

  const completedText = getVaultHeroProgressText();

  const heroData = {
    label: "Foundation Practice Set 1",
    title: "Vault 1 Guided Journey",
    subtitle: "Start strong with guided MUET practice across all four tested components.",
    image: "assets/heroes/vault-1-guided-journey-card.png",
    imageAlt: "Vault 1 Guided Journey hero for Smart MUET",
    progressText: completedText
  };

  heroMount.innerHTML = `
    <section class="vault-hero-wrap">
      <div class="vault-hero-card">
        <img src="${heroData.image}" alt="${heroData.imageAlt}" class="vault-hero-image" onerror="this.closest('.vault-hero-card').classList.add('vault-hero-fallback'); this.remove();">
        <div class="vault-hero-caption">
          <div class="vault-hero-label">${heroData.label}</div>
          <h2 class="vault-hero-title">${heroData.title}</h2>
          <p class="vault-hero-subtitle">${heroData.subtitle}</p>
          <div class="vault-hero-meta">
            <span class="vault-meta-pill speaking">🎤 Speaking</span>
            <span class="vault-meta-pill reading">📖 Reading</span>
            <span class="vault-meta-pill listening">🎧 Listening</span>
            <span class="vault-meta-pill writing">✍️ Writing</span>
            <span class="vault-meta-pill progress">🏆 ${heroData.progressText}</span>
          </div>
        </div>
      </div>
    </section>
  `;
});

function getVaultHeroProgressText() {
  try {
    if (window.MUET && typeof MUET.vaultProgress === "function") {
      const prog = MUET.vaultProgress("VAULT-01");
      return `${prog.count || 0} / 4 Completed`;
    }
  } catch (err) {
    console.warn("Vault hero progress fallback used:", err);
  }
  return "0 / 4 Completed";
}
