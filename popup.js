const startBtn = document.getElementById("start");

if (startBtn) {

  startBtn.addEventListener("click", () => {

    startBtn.disabled = true;
    startBtn.innerText = "Executando...";

    chrome.runtime.sendMessage({
      action: "startScript"
    });

    window.close();
  });

}