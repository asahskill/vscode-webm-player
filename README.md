# WebM Player

Read-only `.webm` player for Visual Studio Code using [ogv.js](https://github.com/bvibber/ogv.js) WebAssembly decoders.

VS Code already previews VP8 WebM. This extension offers another editor for files that its built-in player cannot decode, especially VP9. ogv.js also supports Opus and Vorbis audio. AV1 in ogv.js is experimental and is not promised by this extension. Decoding runs on the webview thread because VS Code webviews restrict workers, so large and high-resolution files can be slow.

## Install and use

Download the `.vsix` from [Releases](https://github.com/asahskill/vscode-webm-player/releases), then run **Extensions: Install from VSIX...** in VS Code. Right-click a `.webm` file and choose **Open With... → WebM Player**. To use it automatically, choose **Configure default editor for '*.webm'** in **Open With...**, or add this setting:

```json
"workbench.editorAssociations": { "*.webm": "webmOgv.preview" }
```

The player includes play/pause, seeking, and volume controls. It works offline with local or remote workspace files that VS Code can expose to a webview. No video data is sent to an external server.

## Build

```sh
npm ci
npm run check
npm run package
```

The package script copies required ogv.js runtime assets into `vendor/`, then builds `webm-ogv-preview-0.1.0.vsix`. The workflow checks every push to `main`; pushing a version tag such as `v0.1.0` builds the VSIX and attaches it to a GitHub Release. Keep the tag and `package.json` version aligned.

## Limitations and licenses

WebM is a container, not a codec. Support depends on the video and audio tracks inside it. ogv.js plays VP8/VP9 with Opus/Vorbis; unsupported tracks may fail. There is no transcoding or video editing. The extension's source is MIT licensed. ogv.js bundles third-party codec libraries with their own licenses; inspect `node_modules/ogv` and the upstream license notices when redistributing the VSIX.
