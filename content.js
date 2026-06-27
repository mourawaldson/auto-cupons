if (!window.__autoCuponsLoaded) {

  window.__autoCuponsLoaded = true;

  window.pararExecucao = false;
  window.executandoPagina = false;

  chrome.runtime.onMessage.addListener((request) => {

    if (request.action === "startScript") {
      window.iniciarAutoCupons();
    }

  });

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

      console.log("Parada solicitada pelo usuário.");

      window.pararExecucao = true;
      window.executandoPagina = false;

      chrome.storage.local.remove([
        "autoCuponsAtivo",
        "autoCuponsUltimaUrl"
      ]);

      botao.innerText = "Parando...";
      botao.disabled = true;

      setTimeout(() => {
        removerBotaoParar();
      }, 200);
    };

    document.body.appendChild(botao);
  }

  function removerBotaoParar() {

    const botao = document.getElementById("btnPararCupons");

    if (botao) {
      botao.remove();
    }

    window.executandoPagina = false;
  }

  function isApplyElement(el) {

    const text = (
      el.innerText ||
      el.textContent ||
      ""
    ).trim().toLowerCase();

    return text.includes("aplicar");
  }

  function isEnabled(el) {

    if (el.disabled) return false;

    const ariaDisabled =
      el.getAttribute?.("aria-disabled");

    return ariaDisabled !== "true";
  }

  async function esperarInterrompivel(ms) {

    const intervalo = 50;
    const repeticoes = Math.ceil(ms / intervalo);

    for (let i = 0; i < repeticoes; i++) {

      if (window.pararExecucao) {
        return false;
      }

      await new Promise(resolve =>
        setTimeout(resolve, intervalo)
      );
    }

    return true;
  }

  async function aplicarCuponsSeguros() {

    while (true) {

      if (window.pararExecucao) {
        console.log("Execução interrompida.");
        return;
      }

      const botao = Array
        .from(document.querySelectorAll("button, a"))
        .find(el =>
          isApplyElement(el) &&
          isEnabled(el)
        );

      if (!botao) {
        console.log("Nenhum cupom restante encontrado.");
        return;
      }

      if (window.pararExecucao) return;

      botao.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      botao.click();

      console.log("Cupom aplicado.");

      const continuar =
        await esperarInterrompivel(500);

      if (!continuar) return;
    }
  }

  async function processPageOnce() {

    if (window.executandoPagina) return;

    window.executandoPagina = true;

    criarBotaoParar();

    await aplicarCuponsSeguros();

    if (window.pararExecucao) {

      console.log("Execução encerrada.");

      removerBotaoParar();

      chrome.storage.local.remove([
        "autoCuponsAtivo",
        "autoCuponsUltimaUrl"
      ]);

      return;
    }

    const proximo = document.querySelector(
      'a[title="Próximo"]'
    );

    console.log("Botão próximo:", proximo);

    if (proximo) {

      chrome.storage.local.set({
        autoCuponsAtivo: true,
        autoCuponsUltimaUrl: window.location.href
      });

      window.executandoPagina = false;

      console.log("Indo para próxima página...");

      setTimeout(() => {

        if (!window.pararExecucao) {
          proximo.click();
        }

      }, 500);

    } else {

      console.log("Fim das páginas.");

      removerBotaoParar();

      chrome.storage.local.remove([
        "autoCuponsAtivo",
        "autoCuponsUltimaUrl"
      ]);
    }
  }

  window.iniciarAutoCupons = () => {

    if (window.executandoPagina) return;

    window.pararExecucao = false;

    chrome.storage.local.set({
      autoCuponsAtivo: true,
      autoCuponsUltimaUrl: window.location.href
    });

    processPageOnce();
  };

  chrome.storage.local.get(
    [
      "autoCuponsAtivo",
      "autoCuponsUltimaUrl"
    ],
    ({
      autoCuponsAtivo,
      autoCuponsUltimaUrl
    }) => {

      if (
        autoCuponsAtivo &&
        autoCuponsUltimaUrl &&
        autoCuponsUltimaUrl !== window.location.href
      ) {

        console.log("Continuação automática.");

        chrome.storage.local.set({
          autoCuponsUltimaUrl: window.location.href
        });

        setTimeout(() => {

          if (!window.pararExecucao) {
            processPageOnce();
          }

        }, 500);
      }

    }
  );

}