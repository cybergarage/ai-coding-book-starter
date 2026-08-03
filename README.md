# AIコーディング入門 サンプルプロジェクト

AIコーディング入門シリーズで使用するスターターキット、文書テンプレート、完成例を管理するリポジトリです。

現在は書籍制作中のため、内容とディレクトリ構成が変更される可能性があります。書籍出版時に、書籍の版へ対応するGitHub Releaseを公開します。

## 開発ブランチ

サンプルの開発と検証は`main`ブランチで行います。製品別の長期ブランチは作成せず、Claude Code、Codex、GitHub Copilot CLIのテンプレート、実証記録、完成例を`main`でまとめて管理します。読者へ配布する版は、`main`の検証済みコミットへ製品別の固定タグを付けて作成します。

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

Claude Code版では、`templates/claude-code/devcontainer.json`を`starter/.devcontainer/devcontainer.json`へ、`templates/claude-code/settings.json`を`starter/.claude/settings.json`へコピーします。Claude Code CLIはDev Containerの構築時に導入されるため、ホストOSへ手動でインストールする必要はありません。

Codex版では、`templates/codex/devcontainer.json`を`starter/.devcontainer/devcontainer.json`へ、`templates/codex/AGENTS.md`を`starter/AGENTS.md`へ、`templates/codex/.codex/config.toml`を`starter/.codex/config.toml`へコピーします。Codex CLIはDev Containerの構築時に固定バージョンを導入し、認証情報はGitで管理しないDockerボリュームへ保存します。

GitHub Copilot CLI版では、`templates/copilot-cli/devcontainer.json`を`starter/.devcontainer/devcontainer.json`へ、`templates/copilot-cli/.github/copilot-instructions.md`を`starter/.github/copilot-instructions.md`へコピーします。GitHub Copilot CLIはDev Containerの構築時に固定バージョンを導入し、認証情報とセッションはGitで管理しないDockerボリュームへ保存します。

## スターターの起動

Node.js 24 LTSを使用します。

```console
cd starter
npm ci
npm run dev
```

開発サーバーのURLをブラウザで開きます。Dev Containersを利用する場合は、Visual Studio Codeで`starter`ディレクトリを開いてから、`Dev Containers: Reopen in Container`を実行します。

Claude Code版のDev Container設定をコピーした場合は、コンテナを開いた後に次のコマンドでCLIを確認できます。

```console
claude --version
```

Codex版のDev Container設定をコピーした場合は、次のコマンドでCLIと認証状態を確認できます。

```console
codex --version
codex login status
```

GitHub Copilot CLI版のDev Container設定をコピーした場合は、次のコマンドでCLIを確認できます。

```console
copilot --version
```

## 確認

```console
cd starter
npm run typecheck
npm test
npm run build
```

GitHub Actionsでは、スターターと3方式の完成例に対して同じ確認を実行します。

## 固定版の取得

読者向けの標準手順では、書籍に対応するタグを指定してリポジトリをクローンします。方式ごとにクローン先を分け、その中の`starter/`を独立したGitリポジトリとして初期化します。

```console
git clone --branch book-PRODUCT-YYYYMMDD --single-branch \
  https://github.com/cybergarage/ai-coding-book-samples.git PRODUCT-vibe
```

出版用タグには製品名と日付を含めます。`main`ブランチは次の版の制作で変更されるため、書籍の再現手順から直接参照しません。

## Release用ZIPの作成

必要に応じて、書籍の版に対応するタグから`starter/`と`templates/`を含む配布キットを作成できます。読者向けの標準手順は固定タグを指定した`git clone`であり、このZIPの事前取得を前提にしません。

```console
./scripts/create-starter-archive.sh book-PRODUCT-YYYYMMDD
```

ZIPは`dist/ai-coding-book-kit-book-PRODUCT-YYYYMMDD.zip`として作成されます。展開すると、開始点の`starter/`、共通の仕様とテスト仕様、製品別の指示ファイルとプロンプトを同じディレクトリで参照できます。スクリプトはGitに記録された内容を対象とするため、未コミットの変更はZIPへ入りません。

## 利用方法

書籍の手順では、製品と方式ごとに固定タグを指定してクローンし、クローン内の`templates/`から方式に応じた文書を`starter/`へ配置します。その後、`starter/`を独立したGitリポジトリとして初期化し、コーディングエージェントによる変更だけを確認できる状態にします。

## ライセンス

サンプルコードと付属文書は[MIT License](LICENSE)で提供します。
