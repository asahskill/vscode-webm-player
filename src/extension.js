'use strict';
const vscode = require('vscode');

const VIEW_TYPE = 'webmOgv.preview';
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function getHtml(webview, extensionUri, videoUri) {
  const resource = (...parts) => webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...parts)).toString();
  const vendorBase = resource('vendor');
  const csp = [
    "default-src 'none'",
    `script-src ${webview.cspSource} 'wasm-unsafe-eval'`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `connect-src ${webview.cspSource}`,
    `media-src ${webview.cspSource}`,
    `img-src ${webview.cspSource} data:`
  ].join('; ');
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="${escapeHtml(resource('media', 'player.css'))}">
<title>WebM OGV Preview</title></head>
<body data-video="${escapeHtml(videoUri.toString())}" data-base="${escapeHtml(vendorBase)}">
<main><div id="stage"></div><div id="status" role="status">Loading WebM…</div>
<div class="controls">
<button id="toggle" type="button" aria-label="Play or pause">Play</button>
<label for="seek" class="sr-only">Seek</label><input id="seek" type="range" min="0" max="1000" value="0">
<span id="time">0:00 / 0:00</span>
<label for="volume" class="sr-only">Volume</label><input id="volume" type="range" min="0" max="1" step="0.05" value="1" title="Volume">
</div></main>
<script src="${escapeHtml(resource('vendor', 'ogv.js'))}"></script>
<script src="${escapeHtml(resource('media', 'player.js'))}"></script>
</body></html>`;
}

function activate(context) {
  context.subscriptions.push(vscode.window.registerCustomEditorProvider(VIEW_TYPE, {
    openCustomDocument: async uri => ({ uri, dispose() {} }),
    resolveCustomEditor: async (document, panel) => {
      const webview = panel.webview;
      webview.options = {
        enableScripts: true,
        localResourceRoots: [context.extensionUri, vscode.Uri.joinPath(document.uri, '..')]
      };
      webview.html = getHtml(webview, context.extensionUri, webview.asWebviewUri(document.uri));
    }
  }, { webviewOptions: { retainContextWhenHidden: false } }));
}

module.exports = { activate, getHtml, escapeHtml };
