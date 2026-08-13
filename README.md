# AIコーディングエージェント入門シリーズ

Claude Code、Codex、GitHub Copilot CLIを、実際にゲームを作りながら学ぶKindle書籍シリーズの公式サンプルリポジトリです。

同じ神経衰弱ゲームを、Vibe Coding、仕様駆動開発（SDD）、Loop Engineeringの3つの開発スタイルで実装します。完成したコードだけでなく、AIへの指示、仕様、テスト、権限、停止条件まで比較し、「どこまでAIに任せ、どこを人が確認するか」を具体的に身につけられます。

<table>
  <tr>
    <td width="33%" align="center">
      <a href="https://www.amazon.co.jp/dp/B0HDSXVMHV"><img src="docs/images/books/claude-code-cover.png" alt="Claude Code入門の表紙" width="280"></a>
    </td>
    <td width="33%" align="center">
      <a href="https://www.amazon.co.jp/dp/B0HDSFVD4D"><img src="docs/images/books/codex-cover.png" alt="Codex入門の表紙" width="280"></a>
    </td>
    <td width="33%" align="center">
      <a href="https://www.amazon.co.jp/dp/B0HDVS6QNX"><img src="docs/images/books/github-copilot-cli-cover.png" alt="GitHub Copilot CLI入門の表紙" width="280"></a>
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Claude Code入門</strong><br><a href="https://www.amazon.co.jp/dp/B0HDSXVMHV">Amazonで見る</a></td>
    <td align="center"><strong>Codex入門</strong><br><a href="https://www.amazon.co.jp/dp/B0HDSFVD4D">Amazonで見る</a></td>
    <td align="center"><strong>GitHub Copilot CLI入門</strong><br><a href="https://www.amazon.co.jp/dp/B0HDVS6QNX">Amazonで見る</a></td>
  </tr>
</table>

## 3つの開発スタイルを、同じ題材で比べる

本シリーズでは、16枚のカードを使う神経衰弱を3通りの進め方で作ります。題材と完成条件をそろえているため、AIコーディングの進め方によって、指示、成果物、人の役割がどう変わるかを比較できます。

| 開発スタイル | 進め方 | 体験できること |
| --- | --- | --- |
| Vibe Coding | 自然言語の指示から実装を始める | 素早く形にする方法と、曖昧な指示を修正する判断 |
| 仕様駆動開発（SDD） | 仕様を確認してから実装する | 仕様と実装を照合し、手戻りを抑える方法 |
| Loop Engineering | 仕様、テスト、進捗を使って実装と検証を繰り返す | 完了条件と停止条件を与えて、自律反復開発を管理する方法 |

## このシリーズで学べること

- 自然言語のプロンプトから、動くWebアプリケーションを作る手順
- Planモードで実装前に仕様と作業範囲を確認する方法
- 仕様書、テスト仕様、進捗記録をAIと人の共通言語にする方法
- 型検査、単体テスト、ビルド、ブラウザ操作で結果を検証する方法
- 権限確認、許可コマンド、停止条件を使って実行範囲を管理する方法
- 生成結果をうのみにせず、差分と動作から採用可否を判断する方法

## どの本を選ぶか

3冊は同じ題材と開発スタイルを扱いながら、起動方法、Planモード、権限、指示ファイル、プロンプトを製品ごとに解説しています。普段使う、またはこれから試したいAIコーディングエージェントの版を選んでください。

- **[Claude Code入門](https://www.amazon.co.jp/dp/B0HDSXVMHV)** — Claude CodeでAIコーディングを始めたい方へ
- **[Codex入門](https://www.amazon.co.jp/dp/B0HDSFVD4D)** — Codexで計画、実装、検証の流れを学びたい方へ
- **[GitHub Copilot CLI入門](https://www.amazon.co.jp/dp/B0HDVS6QNX)** — GitHub Copilot CLIを開発ワークフローへ取り入れたい方へ

プログラミングの基礎知識があり、AIコーディングエージェントを初めて実務的に試す技術者を想定しています。

## このリポジトリに含まれるもの

```text
.
├── starter/       # 3つの開発スタイルで共通する開始点
├── templates/     # 仕様、テスト仕様、進捗、製品別の指示
├── solutions/     # 各製品・各方式で実際に作成した完成例
├── experiments/   # 実行条件、追加指示、停止理由、検証記録
└── scripts/       # 配布物を確認・作成する補助スクリプト
```

完成例は、方式ごとの差を均一化した模範解答ではありません。各AIコーディングエージェントへ実際に指示し、修正と検証を行った結果をそのまま比較できる教材です。

## すぐに試す

Visual Studio Code、Dev Containers、Dockerを利用します。開発環境はNode.js 24、TypeScript、HTML/CSS、Vite、Vitestを基本としています。

まず、`main`ブランチの最新版をShallow Cloneします。

```console
git clone --depth 1 https://github.com/cybergarage/ai-coding-book-starter.git
cd ai-coding-book-starter
```

書籍の手順に従って、使用する製品と開発スタイルに対応するファイルを`templates/`から`starter/`へ配置します。各方式を比較する場合は、方式ごとに別のディレクトリへクローンすると、同じ開始状態を保てます。

スターターだけを動かす場合は、Visual Studio Codeで`starter/`を開き、`Dev Containers: Reopen in Container`を実行してから、次のコマンドを使用します。

```console
npm ci
npm run dev
```

実装後は、次のコマンドで型、テスト、ビルドを確認できます。

```console
npm run typecheck
npm test
npm run build
```

GitHub Actionsでも、スターターと各完成例に対して同じ確認を実行しています。

## 書籍とサンプルの役割

このリポジトリには、すぐ試せる開始点、テンプレート、完成コード、検証記録を収録しています。書籍では、それらを使う順序、AIへ渡すプロンプトの意図、応答を評価する基準、権限確認、トラブルへの対処を手順に沿って解説します。

コードを見るだけでなく、自分で指示し、比較し、検証するところまで体験したい方は、利用する製品の書籍と一緒に進めてください。

## 書籍を購入する

- [Claude Code入門 — Amazon Kindle](https://www.amazon.co.jp/dp/B0HDSXVMHV)
- [Codex入門 — Amazon Kindle](https://www.amazon.co.jp/dp/B0HDSFVD4D)
- [GitHub Copilot CLI入門 — Amazon Kindle](https://www.amazon.co.jp/dp/B0HDVS6QNX)

## ライセンス

サンプルコードと付属文書は[MIT License](LICENSE)で提供します。
