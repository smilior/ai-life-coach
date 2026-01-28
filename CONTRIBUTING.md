# Contributing Guide

AI ライフコーチアプリへの貢献ありがとうございます。このガイドでは、開発環境のセットアップから貢献までの流れを説明します。

## 目次

- [開発環境セットアップ](#開発環境セットアップ)
- [環境変数の設定](#環境変数の設定)
- [開発サーバーの起動](#開発サーバーの起動)
- [コーディング規約](#コーディング規約)
- [Git ワークフロー](#git-ワークフロー)
- [プルリクエスト](#プルリクエスト)

## 開発環境セットアップ

### 必要条件

- **Node.js**: v20.x 以上
- **pnpm**: v9.x 以上
- **Git**: 最新版

### インストール手順

1. **リポジトリのクローン**

```bash
git clone https://github.com/your-org/ai-life-coach.git
cd ai-life-coach
```

2. **pnpm のインストール**（未インストールの場合）

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

3. **依存関係のインストール**

```bash
pnpm install
```

4. **VSCode 拡張機能のインストール**

VSCode で開くと、推奨拡張機能のインストールを促されます。すべてインストールしてください。

## 環境変数の設定

1. **環境変数ファイルの作成**

```bash
cp .env.example .env.local
```

2. **各サービスの設定**

### Turso データベース

```bash
# Turso CLI のインストール
curl -sSfL https://get.tur.so/install.sh | bash

# ログイン
turso auth login

# データベース作成
turso db create ai-life-coach

# 接続URL取得
turso db show ai-life-coach --url

# 認証トークン取得
turso db tokens create ai-life-coach
```

取得した値を `.env.local` に設定:
```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Better Auth シークレット

```bash
# シークレットキーの生成（32文字以上）
openssl rand -base64 32
```

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. OAuth 2.0 クライアント ID を作成
3. 承認済みリダイレクト URI に以下を追加:
   - `http://localhost:3000/api/auth/callback/google`

### Anthropic API

1. [Anthropic Console](https://console.anthropic.com/) でアカウント作成
2. API キーを発行

## 開発サーバーの起動

```bash
# 開発サーバー起動
pnpm dev

# http://localhost:3000 でアクセス
```

### その他のコマンド

```bash
# ビルド
pnpm build

# 本番モード起動
pnpm start

# リント
pnpm lint

# リント（自動修正）
pnpm lint:fix

# 型チェック
pnpm type-check

# フォーマット
pnpm format
```

## コーディング規約

### TypeScript

- **strict モード**を使用
- `any` 型の使用は禁止（`unknown` を使用）
- 型推論が効く場合でも、公開 API には明示的な型注釈を付ける

```typescript
// Good
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### React コンポーネント

- 関数コンポーネントを使用
- Props の型定義は interface で定義
- コンポーネントファイルは PascalCase

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={styles[variant]}>
      {label}
    </button>
  );
}
```

### ファイル・フォルダ構成

```
src/
├── app/              # Next.js App Router
├── components/       # 共有コンポーネント
│   ├── ui/          # 基本UI（Button, Input等）
│   └── features/    # 機能別コンポーネント
├── lib/             # ユーティリティ、設定
├── hooks/           # カスタムフック
├── types/           # 型定義
└── styles/          # グローバルスタイル
```

### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `UserProfile.tsx` |
| フック | camelCase + use | `useAuth.ts` |
| ユーティリティ | camelCase | `formatDate.ts` |
| 定数 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 型/インターフェース | PascalCase | `UserProfile` |

### インポート順序

1. React / Next.js
2. 外部ライブラリ
3. 内部モジュール（エイリアス使用）
4. 相対パス
5. スタイル

```typescript
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

import { helperFunction } from './helpers';

import styles from './styles.module.css';
```

## Git ワークフロー

### ブランチ命名

```
feature/機能名     # 新機能
fix/バグ名        # バグ修正
refactor/対象    # リファクタリング
docs/対象        # ドキュメント
```

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に準拠:

```
feat: ユーザー認証機能を追加
fix: ログインエラーのハンドリングを修正
docs: README にセットアップ手順を追加
refactor: 認証ロジックをカスタムフックに分離
style: コードフォーマットを修正
test: ユーザー認証のテストを追加
chore: 依存関係を更新
```

## プルリクエスト

### 作成前のチェックリスト

- [ ] `pnpm lint` がパスする
- [ ] `pnpm type-check` がパスする
- [ ] `pnpm build` が成功する
- [ ] 新機能にはテストを追加（該当する場合）
- [ ] ドキュメントを更新（該当する場合）

### PR テンプレート

```markdown
## 概要
変更内容の簡潔な説明

## 変更点
- 変更1
- 変更2

## テスト方法
1. 手順1
2. 手順2

## スクリーンショット（該当する場合）

## 関連 Issue
Closes #123
```

## 質問・サポート

質問がある場合は、Issue を作成するか、チームの Slack チャンネルでお問い合わせください。
