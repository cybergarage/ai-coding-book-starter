# GitHub Copilot CLI版テンプレート

GitHub Copilot CLI版の演習を始める前に、クローンしたリポジトリの`starter/`へ必要なファイルを配置します。

```console
cp templates/copilot-cli/devcontainer.json starter/.devcontainer/devcontainer.json
mkdir -p starter/.github
cp templates/copilot-cli/.github/copilot-instructions.md starter/.github/copilot-instructions.md
```

方式に応じて、`templates/common/`の文書を`starter/`へコピーします。

- Vibe Coding: 共通文書をコピーしない
- 仕様駆動開発: `spec.md`
- Loop Engineering: `spec.md`、`test.md`、`progress.md`

`starter/`を独立したGitリポジトリとして初期化し、開始状態をコミットしてからDev Containerを開きます。GitHub Copilot CLI 1.0.77はDev Containerの構築時に導入され、`~/.copilot`はGit管理外のDockerボリュームへ保存されます。

コンテナ内では次のコマンドでCLIを起動します。

```console
copilot --disallow-temp-dir
```

初回は`/login`でGitHubへサインインし、現在の`starter`を信頼することを確認します。`/instructions`で`.github/copilot-instructions.md`が読み込まれたことを確認します。

Dev Container内でもCLI自身の通常の承認を残し、必要な範囲だけを許可します。`--allow-all`、`--allow-all-tools`、`--allow-all-paths`、`--allow-all-urls`、`--yolo`は使用しません。`starter/`はホストOSと共有されるため、作業後は`git status --short`と`git diff`で変更を確認します。
