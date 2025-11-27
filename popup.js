// popup.js - start/stop behavior only

const startBtn = document.getElementById("start");

if (startBtn) {
  startBtn.addEventListener("click", () => {
    startBtn.disabled = true;
    startBtn.innerText = "Executando...";
    chrome.runtime.sendMessage({ action: "startScript" });
  });
}

// Enable button again when content.js finishes
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "desbloquearPopup") {
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.innerText = "Iniciar Auto Cupons";
    }
  }
});
