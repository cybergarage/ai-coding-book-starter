# AIコーディング入門 サンプルプロジェクト

AIコーディング入門シリーズで使用するスターターキット、文書テンプレート、完成例を管理するリポジトリです。

現在は書籍制作中のため、内容とディレクトリ構成が変更される可能性があります。書籍出版時に、書籍の版へ対応するGitHub Releaseを公開します。

## 対象書籍

- Claude Code入門
- Codex入門
- GitHub Copilot CLI入門

Claude Code版から制作し、Codex版とGitHub Copilot CLI版へ順次展開します。

## ディレクトリ

```text
.
├── starter/       # 各ハンズオンの開始点
├── templates/     # 仕様、テスト仕様、進捗、製品別の指示
├── experiments/   # 実行条件、ログ、検証結果
└── solutions/     # 実証で作成した完成例
```

`solutions/`には、各コーディングエージェントで実際に作成して検証した成果物を追加します。

## スターターの起動

Node.js 24 LTSを使用します。

```console
cd starter
npm ci
npm run dev
```

開発サーバーのURLをブラウザで開きます。Dev Containersを利用する場合は、Visual Studio Codeで`starter`ディレクトリを開いてから、`Dev Containers: Reopen in Container`を実行します。

## 確認

```console
cd starter
npm run typecheck
npm test
npm run build
```

GitHub Actionsでは、スターターと3方式の完成例に対して同じ確認を実行します。

## Release用ZIPの作成

書籍の版に対応するタグを指定し、`starter/`だけを含むZIPを作成します。

```console
./scripts/create-starter-archive.sh book-YYYYMMDD
```

ZIPは`dist/ai-coding-starter-book-YYYYMMDD.zip`として作成されます。スクリプトはGitに記録された内容を対象とするため、未コミットの変更はZIPへ入りません。

## 利用方法

書籍の手順では、GitHub Releaseから取得したスターターを方式ごとの作業用ディレクトリへ複製します。書籍から`main`ブランチを直接参照せず、書籍の版に対応したReleaseを使用してください。

## ライセンス

サンプルコードと付属文書は[MIT License](LICENSE)で提供します。
