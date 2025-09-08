const startBtn = document.getElementById("start");

startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  startBtn.innerText = "Executando...";
  chrome.runtime.sendMessage({ action: "startScript" });
});

// Recebe pedido para desbloquear o botão quando a execução termina
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "desbloquearPopup") {
    startBtn.disabled = false;
    startBtn.innerText = "Iniciar Auto Cupons";
  }
});
