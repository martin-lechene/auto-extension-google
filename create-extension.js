const shell = require('shelljs');
const mkdirp = require('mkdirp');

// Créer la structure de base de l'extension
shell.mkdir('-p', 'images');
mkdirp.sync('js');


// Créer les fichiers manifest.json, popup.html, popup.js et content.js
const manifestContent = `
{
  "manifest_version": 3,
  "name": "Mon Extension de Récupération de Données",
  "version": "1.0",
  "permissions": ["activeTab"],
  "browser_action": {
    "default_popup": "popup.html",
    "default_icon": {
        "16": "images/icon16.png",
        "32": "images/icon32.png",
        "48": "images/icon48.png",
        "128": "images/icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
`;
shell.ShellString(manifestContent).to('manifest.json');

const popupHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Mon Extension</title>
  <script src="popup.js"></script>
</head>
<body>
  <button id="extractButton">Extraire les données</button>
</body>
</html>
`;
shell.ShellString(popupHtmlContent).to('popup.html');

const popupJsContent = `
document.getElementById("extractButton").addEventListener("click", function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "extractData" }, function(response) {
      if (response && response.data) {
        const data = response.data;
        const blob = new Blob([data], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "data.txt";
        a.click();
      }
    });
  });
});
`;
shell.ShellString(popupJsContent).to('popup.js');

const contentJsContent = `
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "extractData") {
    const selectedElement = window.prompt("Sélectionnez un élément en utilisant un sélecteur CSS (classe, id ou balise HTML) :");
    const data = document.querySelector(selectedElement).innerText;

    sendResponse({ data: data });
  }
});
`;
shell.ShellString(contentJsContent).to('content.js');
