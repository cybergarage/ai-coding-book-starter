# 完成例

このディレクトリには、各コーディングエージェントを使った実証で得られた完成例を保存します。

想定した完成コードをあらかじめ配置せず、実際のプロンプト、実行結果、確認結果と対応付けて追加します。

現在の構成は次のとおりです。

```text
solutions/
├── claude-code/
│   ├── vibe/
│   ├── spec-driven/
│   └── autonomous/
└── codex/
    ├── vibe/
    ├── spec-driven/
    └── autonomous/
```

3方式とも、2026年7月29日にClaude Code 2.1.197とClaude Sonnet 5で作成し、Node.js 24のDev Containerで型検査、テスト、ビルドを確認しました。実行条件と比較結果は`experiments/claude-code/2026-07-29/`に記録しています。

Codex版の3方式は、2026年8月1日にCodex CLI 0.145.0と`gpt-5.6-sol`で作成しました。実行条件、追加指示、ブラウザ確認、比較結果は`experiments/codex/2026-08-01/`に記録しています。
