chrome.runtime.onMessage.addListener((request) => {

  if (request.action === "startScript") {

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true
      },
      (tabs) => {

        const tab = tabs[0];

        if (!tab) return;

        chrome.tabs.sendMessage(tab.id, {
          action: "startScript"
        });

      }
    );

  }

});