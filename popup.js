// --- Offers list ---
const offers = [
  { title: "🔥 Oferta do dia!", url: "https://mercadolivre.com/sec/14tazNY" },
  { title: "💸 Cupons que realmente funcionam", url: "https://mercadolivre.com/sec/123ABC" },
  { title: "🚀 Promoções de tecnologia com até 50% OFF", url: "https://mercadolivre.com/sec/TECH50" },
  { title: "🎁 Aproveite as ofertas em casa e decoração", url: "https://mercadolivre.com/sec/HOMEDEALS" },
  { title: "⚡ Descontos relâmpago em Eletrônicos!", url: "https://mercadolivre.com/sec/2JgWt2c" },
  { title: "🔥 Super descontos em Saúde", url: "https://mercadolivre.com/sec/1mjns82" },
  { title: "💰 Economize em moda e acessórios", url: "https://mercadolivre.com/sec/MODAEACESSORIOS" }
];

// --- Random selection helpers ---
function selectRandomOffer() {
  const idx = Math.floor(Math.random() * offers.length);
  return offers[idx];
}

function showRandomOffer() {
  const offer = selectRandomOffer();
  const adTitle = document.getElementById("adTitle");
  const adLink = document.getElementById("adLink");
  if (adTitle) adTitle.textContent = offer.title;
  if (adLink) {
    adLink.href = offer.url;
    adLink.textContent = "Ver oferta";
  }
}

const startBtn = document.getElementById("start");

if (startBtn) {
  startBtn.addEventListener("click", () => {
    startBtn.disabled = true;
    startBtn.innerText = "Executando...";
    // send message to background to start the script
    chrome.runtime.sendMessage({ action: "startScript" });
  });
}

// Recebe pedido para desbloquear o botão quando a execução termina
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "desbloquearPopup") {
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.innerText = "Iniciar Auto Cupons";
    }
  }
});

// Initialize popup: show a random offer when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  showRandomOffer();
});
