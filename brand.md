# 株式会社SasaTech — Brand Design System

## Colors

### Primary Colors

> **FIXED — モード共通**（Light / Dark で同じ値を使用）

| トークン | HEX | RGB | 用途 |
|---|---|---|---|
| `--primary-main` | `#598D76` | RGB(89, 141, 118) | 見出し、ボタン、リンク |
| `--primary-tint1` | `#8BB3A1` | RGB(139, 179, 161) | テキスト強調、サブヘッダー |
| `--primary-tint2` | `#B5D2C6` | RGB(181, 210, 198) | 装飾要素 |
| `--primary-tint3` | `#E0EDE7` | RGB(224, 237, 231) | 背景、交互色 |

### Text Colors

| トークン | Light Mode | Dark Mode | 用途 |
|---|---|---|---|
| Heading | `#1A2E24` | `#EAF0ED` | 見出し、タイトル、ラベル |
| Body | `#374F44` | `#B8C8C0` | 本文テキスト、入力値 |
| Sub | `#8A9B93` | `#6B8078` | 補足、プレースホルダー、日付 |
| Disabled | `#BDC7C1` | `#3E524A` | 無効テキスト、非活性ラベル |

**CSS変数名**: `--text-{heading|body|sub|disabled}-{light|dark}`

### Background Colors

3層構造（Page → Section → Card）で視覚的な奥行きと情報の階層を表現。

| トークン | Light Mode | Dark Mode | 用途 |
|---|---|---|---|
| BG Page | `#F7FAF8` | `#111A1E` | ページ全体の背景 |
| BG Card | `#FFFFFF` | `#1A2328` | カード、モーダル、ドロップダウン |
| BG Section | `#EEF3F0` | `#152028` | セクション背景、サイドバー |

**CSS変数名**: `--bg-{page|card|section}-{light|dark}`

### Border Colors

| トークン | Light Mode | Dark Mode | 用途 |
|---|---|---|---|
| Border Default | `#C8D4CC` | `#3A4E46` | カード外枠、フォーム、テーブルヘッダー罫線 |
| Border Subtle | `#E2EAE5` | `#263530` | 区切り線、テーブル行間、軽い区分け |

**CSS変数名**: `--border-{default|subtle}-{light|dark}`

### Status Colors

#### Main（固定 — モード共通）

| トークン | HEX | 用途 |
|---|---|---|
| `--error-main` | `#C4504A` | エラーテキスト・アイコン |
| `--warning-main` | `#C48F3A` | 警告テキスト・アイコン |
| `--success-main` | `#4A8F5E` | 成功テキスト・アイコン |
| `--info-main` | `#4A7A9B` | 情報テキスト・アイコン |

#### BG（Light / Dark 切替）

| トークン | Light Mode | Dark Mode | 用途 |
|---|---|---|---|
| Error BG | `#F2DEDD` | `#3D1C1A` | エラー背景 |
| Warning BG | `#F5EBDA` | `#3A2D14` | 警告背景 |
| Success BG | `#DDF0E2` | `#1A3322` | 成功背景 |
| Info BG | `#DCE9F1` | `#1A2C3A` | 情報背景 |

**CSS変数名**: `--{error|warning|success|info}-bg-{light|dark}`

#### Text Dark（ダークモード専用）

| トークン | HEX | 用途 |
|---|---|---|
| `--error-text-dark` | `#E8908B` | ダーク用エラーテキスト |
| `--warning-text-dark` | `#DEB76E` | ダーク用警告テキスト |
| `--success-text-dark` | `#7DBF8F` | ダーク用成功テキスト |
| `--info-text-dark` | `#7BAFC8` | ダーク用情報テキスト |

---

## Typography

### Typography Scale

> **FIXED — モード共通**
> フォントファミリー: **Noto Sans JP** (`'Noto Sans JP', sans-serif`)

| トークン | サイズ | ウェイト | 行間 | 用途 |
|---|---|---|---|---|
| `--fs-display` | 36px / 2.25rem | Bold (700) | 1.4 | ヒーロー、LP |
| `--fs-h1` | 28px / 1.75rem | Bold (700) | 1.5 | ページ見出し |
| `--fs-h2` | 22px / 1.375rem | SemiBold (600) | 1.5 | セクション見出し |
| `--fs-h3` | 18px / 1.125rem | SemiBold (600) | 1.5 | カードタイトル |
| `--fs-body` | 16px / 1rem | Regular (400) | 1.8 | 本文、説明文 |
| `--fs-sm` | 14px / 0.875rem | Regular (400) | 1.7 | ラベル、テーブル |
| `--fs-xs` | 12px / 0.75rem | Regular (400) | 1.7 | キャプション、ヒント |
| `--fs-xxs` | 11px / 0.6875rem | Medium (500) | 1.7 | バッジ、ツールチップ |

### Typography Usage

#### テキスト階層

```
Display  (36px/Bold)     — ヒーローセクション、ランディングページ
H1       (28px/Bold)     — ページタイトル
H2       (22px/SemiBold) — セクション見出し
H3       (18px/SemiBold) — カードタイトル、サブ見出し
Body     (16px/Regular)  — 本文テキスト、説明文
Small    (14px/Regular)  — フォームラベル、テーブルセル
XSmall   (12px/Regular)  — キャプション、タイムスタンプ
XXSmall  (11px/Medium)   — バッジ、ツールチップ
```

#### 日本語設計の考慮事項

- 本文（Body）の行間は **1.8** — 日本語の可読性を考慮して広めに設定
- Small 以下でも行間 **1.7** を確保
- Display の行間は **1.4** — 大きな文字は詰めて視覚的なインパクトを重視

---

## Reference

### Color Reference

| カラー | Light Mode | Dark Mode | 用途 |
|---|---|---|---|
| **Primary（固定）** | | | |
| Main | `#598D76` | `#598D76` | 見出し、ボタン、リンク |
| Tint 1 | `#8BB3A1` | `#8BB3A1` | テキスト強調、サブヘッダー |
| Tint 2 | `#B5D2C6` | `#B5D2C6` | 装飾要素 |
| Tint 3 | `#E0EDE7` | `#E0EDE7` | 背景、交互色 |
| **Text** | | | |
| Heading | `#1A2E24` | `#EAF0ED` | 見出し、タイトル |
| Body | `#374F44` | `#B8C8C0` | 本文テキスト |
| Sub | `#8A9B93` | `#6B8078` | 補足、プレースホルダー |
| Disabled | `#BDC7C1` | `#3E524A` | 無効テキスト |
| **Background** | | | |
| Page | `#F7FAF8` | `#111A1E` | ページ背景 |
| Card | `#FFFFFF` | `#1A2328` | カード、モーダル |
| Section | `#EEF3F0` | `#152028` | セクション背景 |
| **Border** | | | |
| Default | `#C8D4CC` | `#3A4E46` | カード外枠、フォーム |
| Subtle | `#E2EAE5` | `#263530` | 区切り線 |
| **Status** | | | |
| Error Main | `#C4504A` | `#C4504A` | エラーテキスト・アイコン |
| Error BG | `#F2DEDD` | `#3D1C1A` | エラー背景 |
| Error Text Dark | — | `#E8908B` | ダーク用エラーテキスト |
| Warning Main | `#C48F3A` | `#C48F3A` | 警告テキスト・アイコン |
| Warning BG | `#F5EBDA` | `#3A2D14` | 警告背景 |
| Warning Text Dark | — | `#DEB76E` | ダーク用警告テキスト |
| Success Main | `#4A8F5E` | `#4A8F5E` | 成功テキスト・アイコン |
| Success BG | `#DDF0E2` | `#1A3322` | 成功背景 |
| Success Text Dark | — | `#7DBF8F` | ダーク用成功テキスト |
| Info Main | `#4A7A9B` | `#4A7A9B` | 情報テキスト・アイコン |
| Info BG | `#DCE9F1` | `#1A2C3A` | 情報背景 |
| Info Text Dark | — | `#7BAFC8` | ダーク用情報テキスト |

### Typography Reference

| トークン | サイズ | ウェイト | 行間 | 用途 |
|---|---|---|---|---|
| Display | 36px / 2.25rem | Bold (700) | 1.4 | ヒーロー、LP |
| H1 | 28px / 1.75rem | Bold (700) | 1.5 | ページ見出し |
| H2 | 22px / 1.375rem | SemiBold (600) | 1.5 | セクション見出し |
| H3 | 18px / 1.125rem | SemiBold (600) | 1.5 | カードタイトル |
| Body | 16px / 1rem | Regular (400) | 1.8 | 本文、説明文 |
| Small | 14px / 0.875rem | Regular (400) | 1.7 | ラベル、テーブル |
| XSmall | 12px / 0.75rem | Regular (400) | 1.7 | キャプション、ヒント |
| XXSmall | 11px / 0.6875rem | Medium (500) | 1.7 | バッジ、ツールチップ |