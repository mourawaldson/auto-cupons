chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startScript") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) return;
      const tabId = tab.id;
      // injeta o content.js e, em seguida, chama a função de start no contexto da página
      chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] })
        .then(() => {
          return chrome.scripting.executeScript({
            target: { tabId },
            func: () => { if (window.iniciarAutoCupons) window.iniciarAutoCupons(); }
          });
        })
        .catch(err => console.error("Erro ao injetar/iniciar content.js:", err));
    });
  } else if (request.action === "desbloquearPopup") {
    // repassa a mensagem aos listeners (popup)
    chrome.runtime.sendMessage({ action: "desbloquearPopup" });
  }
});
