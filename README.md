# MARK CMS

ローカルファーストな Markdown コンテンツ管理システム。

**Tauri 2** (Rust) + **React 19** (TypeScript) + **Vite 7** で構築されたデスクトップアプリケーションです。

## 特徴

- **ローカルファースト** — すべてのデータはローカルファイルシステム上に保存。サーバー不要
- **Markdown エディタ** — TipTap ベースの WYSIWYG エディタで Markdown を直感的に編集
- **コンテンツタイプ** — フロントマタースキーマを設定で定義し、構造化されたコンテンツを管理
- **多言語対応** — 日本語・英語・ドイツ語・フランス語・中国語・韓国語の 6 言語に対応
- **ライト / ダークテーマ** — OS 設定に依存しない独立したテーマ切り替え
- **ワークスペース** — 複数のプロジェクトをワークスペース単位で管理

## 必要環境

- **Node.js** >= 18
- **Rust** (stable)
- **macOS** (現在の対象プラットフォーム)

Tauri 2 の開発環境セットアップについては [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/) を参照してください。

## セットアップ

```bash
# 依存パッケージのインストール
npm install
```

## 開発

```bash
# Tauri デスクトップアプリを開発モードで起動
npm run tauri dev

# フロントエンドのみ起動 (ポート 1420)
npm run dev
```

## ビルド

```bash
# 配布用デスクトップアプリをビルド
npm run tauri build
```

## リント・フォーマット

[Biome](https://biomejs.dev/) を使用しています。

```bash
npm run lint         # チェック
npm run lint:fix     # 自動修正
npm run format       # フォーマット
```

## プロジェクト構成

```
mark-cms/
├── src/                    # フロントエンド (React + TypeScript)
│   ├── pages/              # ページコンポーネント
│   ├── components/         # UI コンポーネント
│   │   ├── editor/         # エディタ関連
│   │   ├── layout/         # レイアウト関連
│   │   └── shared/         # 共通コンポーネント
│   ├── hooks/              # カスタムフック
│   ├── commands/            # Tauri IPC ラッパー
│   ├── types/              # TypeScript 型定義
│   ├── i18n/               # 多言語翻訳ファイル
│   └── styles/             # グローバルスタイル・テーマ
├── src-tauri/              # バックエンド (Rust + Tauri)
│   └── src/
│       ├── commands/       # Tauri コマンドハンドラ
│       ├── models/         # データモデル
│       └── errors.rs       # エラー型定義
├── public/                 # 静的アセット
├── brand.md                # ブランドデザインシステム
└── CLAUDE.md               # Claude Code 向けガイド
```

## データ構造

ワークスペースの設定は `<workspace>/.markcms/config.json` に保存されます。コンテンツタイプごとにフォルダパス・フロントマタースキーマ・ソート設定を定義できます。

Markdown ファイルは YAML フロントマターを使用し、フロントエンド (`gray-matter`) と Rust (`serde_yaml`) の両方でパースされます。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| デスクトップフレームワーク | Tauri 2 |
| フロントエンド | React 19, TypeScript, Vite 7 |
| エディタ | TipTap (tiptap-markdown) |
| バックエンド | Rust (serde, tokio, walkdir, chrono) |
| リンター / フォーマッター | Biome |
| フォント | Noto Sans JP |

## ライセンス

Private
