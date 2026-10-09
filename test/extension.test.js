'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

test('read-only WebM editor exposes local media and escaped HTML', async () => {
  const originalLoad = Module._load;
  let registration;
  const vscode = {
    Uri: { joinPath: (base, ...parts) => `${base}/${parts.join('/')}` },
    window: { registerCustomEditorProvider: (...args) => { registration = args; return { dispose() {} }; } }
  };
  Module._load = function (id, ...args) { return id === 'vscode' ? vscode : originalLoad.call(this, id, ...args); };
  let extension;
  try { extension = require('../src/extension'); } finally { Module._load = originalLoad; }
  const context = { extensionUri: 'file:///extension', subscriptions: [] };
  extension.activate(context);
  assert.equal(registration[0], 'webmOgv.preview');
  const document = await registration[1].openCustomDocument('file:///project/a&b.webm');
  const webview = {
    cspSource: 'vscode-webview-resource:',
    asWebviewUri: uri => `https://resources.example/${encodeURIComponent(uri)}`
  };
  await registration[1].resolveCustomEditor(document, { webview });
  assert.equal(webview.options.enableScripts, true);
  assert.deepEqual(webview.options.localResourceRoots, [context.extensionUri, `${document.uri}/..`]);
  assert.match(webview.html, /ogv\.js/);
  assert.match(webview.html, /wasm-unsafe-eval/);
  assert.match(webview.html, /a%26b\.webm/);
  assert.equal(extension.escapeHtml('<x&"'), '&lt;x&amp;&quot;');
});
