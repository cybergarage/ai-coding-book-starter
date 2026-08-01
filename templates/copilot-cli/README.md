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
copilot --experimental --disallow-temp-dir
```

初回は`/login`でGitHubへサインインし、現在の`starter`を信頼することを確認します。`/instructions`で`.github/copilot-instructions.md`が読み込まれたことを確認します。

ローカルサンドボックスは実験的機能です。`/sandbox enable`で有効にし、作業ディレクトリ外とネットワークを制限します。Dev Containerの`--security-opt=seccomp=unconfined`は、Linux上でbubblewrapを使う内側のサンドボックスに必要です。CLI自身の通常の承認は残し、`--allow-all`、`--allow-all-tools`、`--allow-all-paths`、`--allow-all-urls`、`--yolo`は使用しません。
