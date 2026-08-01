# スターターキット

神経衰弱ゲームを作成する前の共通プロジェクトです。

## 必要な環境

- Node.js 24 LTS
- npm 11

Dev Containersを使用する場合、Node.jsとnpmはコンテナ内に用意されます。

## コマンド

```console
npm ci
npm run dev
```

別のターミナルで次のコマンドを実行し、初期状態を確認します。

```console
npm run typecheck
npm test
npm run build
```

`npm test`は、テストファイルがまだ存在しない初期状態でも成功します。自律反復開発では、配布キットに同梱された`../templates/common/test.md`に従ってテストを追加します。

## OSによる差異

Dev Containersを使用すると、Windows、macOS、Linuxで同じLinux環境を利用できます。WindowsでDev Containersを使わず実行する場合は、PowerShellまたはコマンドプロンプトで同じ`npm`コマンドを実行してください。シェル固有のコマンドはスターターの手順に含めません。

WindowsではGitの改行変換設定によって差分が生じることがあります。このリポジトリは`.gitattributes`でテキストファイルの改行をLFに統一します。
