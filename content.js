// content.js - Auto Cupons (versão idempotente)

// Evita redeclarações
if (!window.__autoCuponsLoaded) {
  window.__autoCuponsLoaded = true;

  window.pararExecucao = false;
  window.executandoPagina = false;

  function criarBotaoParar() {
    if (document.getElementById("btnPararCupons")) return;

    const botao = document.createElement("button");
    botao.id = "btnPararCupons";
    botao.innerText = "Parar AutoCupons";
    Object.assign(botao.style, {
      position: "fixed",
      top: "10px",
      right: "10px",
      zIndex: "999999",
      padding: "10px 15px",
      backgroundColor: "#d9534f",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
    });

    botao.onclick = () => {
      window.pararExecucao = true;
      sessionStorage.removeItem("autoCuponsAtivo");
      sessionStorage.removeItem("autoCuponsUltimaUrl");
      desbloquearPopup();
      botao.innerText = "Parando...";
      botao.disabled = true;
    };

    document.body.appendChild(botao);
  }

  function removerBotaoParar() {
    const botao = document.getElementById("btnPararCupons");
    if (botao) botao.remove();
    window.pararExecucao = false;
    window.executandoPagina = false;
  }

  function desbloquearPopup() {
    if (chrome.runtime?.sendMessage) {
      try {
        chrome.runtime.sendMessage({ action: "desbloquearPopup" }, () => {
          if (chrome.runtime.lastError) {
              // evita erro "Receiving end does not exist"
              console.log("Popup não estava ouvindo, ignorado.");
          }
        });
      } catch (e) {
        console.log("Erro ao enviar mensagem para popup:", e.message);
      }
    }
  }


  function isApplyElement(el) {
    const text = (el.innerText || el.textContent || "").trim().toLowerCase();
    return text.includes("aplicar");
  }

  function isEnabled(el) {
    if (el.disabled) return false;
    const ariaDisabled = el.getAttribute?.("aria-disabled");
    return ariaDisabled !== "true";
  }

  async function aplicarCuponsSeguros() {
    const esperar = ms => new Promise(r => setTimeout(r, ms));
    while (!window.pararExecucao) {
      const botao = Array.from(document.querySelectorAll("button, a"))
        .find(el => isApplyElement(el) && isEnabled(el));
      if (!botao) break;
      botao.scrollIntoView({ block: "center" });
      botao.click();
      await esperar(400);
    }
  }

  async function processPageOnce() {
    if (window.executandoPagina) return;
    window.executandoPagina = true;

    criarBotaoParar();

    await aplicarCuponsSeguros();

    if (window.pararExecucao) {
      removerBotaoParar();
      sessionStorage.removeItem("autoCuponsAtivo");
      sessionStorage.removeItem("autoCuponsUltimaUrl");
      desbloquearPopup();
      return;
    }

    const proximo = document.querySelector('a[title="Seguinte"]');
    if (proximo) {
      sessionStorage.setItem("autoCuponsAtivo", "1");
      sessionStorage.setItem("autoCuponsUltimaUrl", window.location.href);
      window.executandoPagina = false;
      setTimeout(() => proximo.click(), 200);
    } else {
      console.log("Fim das páginas! ✅");
      removerBotaoParar();
      sessionStorage.removeItem("autoCuponsAtivo");
      sessionStorage.removeItem("autoCuponsUltimaUrl");
      desbloquearPopup();
    }
  }

  // Primeira execução manual
  window.iniciarAutoCupons = () => {
    window.pararExecucao = false;
    sessionStorage.setItem("autoCuponsAtivo", "1");
    sessionStorage.setItem("autoCuponsUltimaUrl", window.location.href);
    processPageOnce();
  };

  // Continua só se mudou de página
  const ativo = sessionStorage.getItem("autoCuponsAtivo") === "1";
  const ultima = sessionStorage.getItem("autoCuponsUltimaUrl");
  if (ativo && ultima && ultima !== window.location.href) {
    sessionStorage.setItem("autoCuponsUltimaUrl", window.location.href);
    setTimeout(() => processPageOnce(), 100);
  }
}
