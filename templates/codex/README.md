# Codex版テンプレート

Codex版の演習を始める前に、クローンしたリポジトリの`starter/`へ必要なファイルを配置します。

```console
cp templates/codex/devcontainer.json starter/.devcontainer/devcontainer.json
cp templates/codex/AGENTS.md starter/AGENTS.md
mkdir -p starter/.codex
cp templates/codex/.codex/config.toml starter/.codex/config.toml
```

方式に応じて、`templates/common/`の文書を`starter/`へコピーします。

- Vibe Coding: 共通文書をコピーしない
- 仕様駆動開発: `spec.md`
- Loop Engineering: `spec.md`、`test.md`、`progress.md`

`starter/`を独立したGitリポジトリとして初期化し、開始状態をコミットしてからDev Containerを開きます。Codex CLIの認証情報は`starter/`へ保存せず、Dev Container設定で作成するDockerボリュームに保存します。

Dev Containerの`--security-opt=seccomp=unconfined`は、Codexがコンテナ内でLinuxサンドボックスを作成するために必要です。Codex自体の既定値は`workspace-write`と`on-request`のまま使用し、`danger-full-access`や`--yolo`は使用しません。
