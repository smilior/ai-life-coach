# AIライフコーチングアプリ 要件定義書

**ドキュメントバージョン**: 1.1.0
**最終更新日**: 2026-01-28
**ステータス**: レビュー反映済み

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [ターゲットユーザー](#2-ターゲットユーザー)
3. [機能要件](#3-機能要件)
4. [非機能要件](#4-非機能要件)
5. [技術アーキテクチャ](#5-技術アーキテクチャ)
6. [技術実装詳細](#6-技術実装詳細)
7. [データモデル設計](#7-データモデル設計)
8. [API設計方針](#8-api設計方針)
9. [エラーハンドリング戦略](#9-エラーハンドリング戦略)
10. [優先度とリリース計画](#10-優先度とリリース計画)
11. [成功指標（KPI）](#11-成功指標kpi)

---

## 1. プロジェクト概要

### 1.1 ビジョン

「すべての人が自分らしく前に進める社会を創る」

AIコーチとの対話を通じて、ユーザーが自分の内なる答えを発見し、持続可能な行動変容を実現するライフコーチングプラットフォームを構築する。

### 1.2 ミッション

解決志向アプローチ（Solution-Focused Brief Therapy）をベースに、以下を実現する：

- **気づきの促進**: ユーザーが持つ強みと可能性に気づく
- **行動の習慣化**: スモールステップで無理なく続けられる習慣形成
- **自己効力感の向上**: 小さな成功体験の積み重ねによる自信の醸成

### 1.3 プロダクトコンセプト

```
「2分から始まる、あなただけの成長ストーリー」
```

- **スマホファースト**: 通勤中、休憩時間など、隙間時間で完結
- **対話型UX**: チャット形式で自然なコーチング体験
- **行動重視**: 考えすぎず、まず小さく動くことを促進

### 1.4 コアバリュー

| 価値 | 説明 |
|------|------|
| **Simple** | 機能を絞り、迷わないUI |
| **Encouraging** | 常にポジティブなフィードバック |
| **Actionable** | すべての対話が具体的行動につながる |
| **Personal** | 一人ひとりに寄り添うパーソナライズ |

---

## 2. ターゲットユーザー

### 2.1 プライマリペルソナ

#### ペルソナA: 成長意欲のある若手社会人

| 項目 | 詳細 |
|------|------|
| **名前** | 田中 美咲（仮名） |
| **年齢** | 28歳 |
| **職業** | IT企業 マーケティング担当 |
| **課題** | キャリアアップしたいが何から始めればいいかわからない |
| **目標** | 自信を持ってリーダーシップを発揮したい |
| **行動特性** | 自己啓発本は読むが行動に移せない |
| **利用シーン** | 通勤電車内、就寝前のベッドで |

#### ペルソナB: ワークライフバランスを求めるミドル層

| 項目 | 詳細 |
|------|------|
| **名前** | 佐藤 健一（仮名） |
| **年齢** | 42歳 |
| **職業** | メーカー 課長職 |
| **課題** | 仕事に追われ自分の時間がない |
| **目標** | 健康習慣と家族時間を確保したい |
| **行動特性** | 完璧主義で三日坊主になりがち |
| **利用シーン** | 朝の準備中、昼休み |

### 2.2 セカンダリペルソナ

- **学生**: 就活や資格取得に向けた習慣化
- **フリーランス**: 自己管理とモチベーション維持
- **主婦/主夫**: 新しい挑戦や自己実現

### 2.3 ユーザーセグメント

```
┌─────────────────────────────────────────────────────┐
│                    利用目的                          │
├─────────────────┬─────────────────┬─────────────────┤
│   パフォーマンス │    メンタル     │      変革       │
│      向上       │     安定        │                 │
├─────────────────┼─────────────────┼─────────────────┤
│ ・キャリアアップ │ ・ストレス軽減  │ ・転職準備      │
│ ・スキル習得    │ ・自己肯定感UP  │ ・独立起業      │
│ ・生産性向上    │ ・人間関係改善  │ ・ライフシフト  │
└─────────────────┴─────────────────┴─────────────────┘
```

### 2.4 ユーザーストーリーマップ

#### コアジャーニー

```
認知 → 登録 → オンボーディング → 初回対話 → 習慣設定 → 日次実践 → 振り返り → 継続/発展
```

---

## 3. 機能要件

### 3.1 オンボーディング・パーソナライゼーション

#### 3.1.1 ウェルカムフロー

| ID | 機能 | 詳細 | 優先度 |
|----|------|------|--------|
| ONB-001 | 目的選択 | 3つの目的から選択（パフォーマンス/メンタル/変革） | P0 |
| ONB-002 | 価値観インタビュー | 5問の対話形式質問で価値観を抽出 | P0 |
| ONB-003 | 内発的動機の特定 | 「なぜそれが大切？」を3回深掘り | P0 |
| ONB-004 | コーチング目標設定 | 3ヶ月後の理想状態を言語化 | P0 |
| ONB-005 | パーソナリティ推定 | 回答から性格傾向を分析（表示はしない） | P1 |

#### 3.1.2 価値観インタビュー質問例

```
Q1: 最近、時間を忘れて夢中になったことは何ですか？
Q2: 理想の1日を想像してください。朝起きてから夜寝るまで、どんな過ごし方をしていますか？
Q3: もし何の制約もなかったら、何に挑戦してみたいですか？
Q4: あなたが大切にしている価値観を3つ挙げるとしたら？
Q5: 3ヶ月後、「やってよかった」と思える変化は何ですか？
```

#### 3.1.3 プロフィール設定

| ID | 機能 | 詳細 | 優先度 |
|----|------|------|--------|
| ONB-010 | 基本情報入力 | ニックネーム、通知設定 | P0 |
| ONB-011 | 生活リズム設定 | 起床/就寝時間、忙しい時間帯 | P1 |
| ONB-012 | 通知許可 | プッシュ通知の許可取得 | P0 |

### 3.2 AIコーチの対話設計

#### 3.2.1 解決志向アプローチ 9ステップモデル

```
┌─────────────────────────────────────────────────────────────┐
│                    対話フローチャート                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [1. 感情の受容]                                             │
│       ↓                                                     │
│  [2. リフレーミング] ← 必要に応じて                           │
│       ↓                                                     │
│  [3. 目標確認]                                               │
│       ↓                                                     │
│  [4. スケーリング] ← 10点満点で現在地確認                      │
│       ↓                                                     │
│  [5. 称賛] ← 既にできていることを認める                        │
│       ↓                                                     │
│  [6. 例外探求] ← うまくいった時を探す                          │
│       ↓                                                     │
│  [7. 強み発見]                                               │
│       ↓                                                     │
│  [8. 選択肢拡大] ← 複数の可能性を提示                          │
│       ↓                                                     │
│  [9. スモールステップ設定] ← 2分で始められる行動へ              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.2 対話機能一覧

| ID | 機能 | 詳細 | 優先度 |
|----|------|------|--------|
| DLG-001 | 感情受容応答 | ユーザーの感情を言語化して反映 | P0 |
| DLG-002 | リフレーミング | ネガティブな表現をポジティブに変換 | P0 |
| DLG-003 | スケーリング質問 | 「10点満点で今何点？」形式の質問 | P0 |
| DLG-004 | 例外質問 | 「うまくいった時はどんな時？」 | P0 |
| DLG-005 | ミラクルクエスチョン | 理想状態を具体的にイメージさせる | P1 |
| DLG-006 | コーピングクエスチョン | 困難を乗り越えた経験を引き出す | P1 |
| DLG-007 | 強み発見フィードバック | 対話から強みを抽出して伝える | P0 |
| DLG-008 | 選択肢提示 | 3つの行動オプションを提案 | P0 |
| DLG-009 | スモールステップ化 | 2分ルールに基づく行動分解 | P0 |

#### 3.2.3 対話の原則とルール

**コーチングマインドセット**

```yaml
基本姿勢:
  - 答えはユーザーの中にある（Solution-Focused）
  - ジャッジしない、評価しない
  - 未来志向（問題分析より解決策）

禁止事項:
  - 直接的なアドバイス（「〜すべき」「〜しなさい」）
  - 原因追求（「なぜできなかったの？」）
  - 比較（「他の人は〜」）
  - 否定的表現（「でも」「しかし」で始まる文）
```

**質問数制限（内省過多防止）**

| セッション種別 | 最大質問数 | 最大所要時間 |
|---------------|----------|-------------|
| デイリーチェックイン | 3問 | 2分 |
| 通常セッション | 5問 | 5分 |
| 深掘りセッション | 8問 | 10分 |
| 週次振り返り | 6問 | 7分 |

**心理的安全性を担保する言葉遣い**

```
推奨表現:
  - 「〜と感じているんですね」（感情の反映）
  - 「それは大変でしたね」（共感）
  - 「素晴らしいですね」「すごいです」（称賛）
  - 「もし〜だとしたら？」（仮定形での問いかけ）
  - 「〜という選択肢もありますね」（押し付けない提案）

避けるべき表現:
  - 「頑張って」（プレッシャー）
  - 「簡単ですよ」（軽視）
  - 「普通は〜」（一般化）
```

#### 3.2.4 セッション種別

| ID | 種別 | 説明 | トリガー |
|----|------|------|---------|
| SES-001 | デイリーチェックイン | 朝の気分確認と今日の1アクション | 毎朝通知 |
| SES-002 | フリーセッション | ユーザー主導の自由対話 | ユーザー起動 |
| SES-003 | 習慣振り返り | 設定習慣の実施確認 | 習慣時刻後 |
| SES-004 | 週次振り返り | 1週間の成果と来週の目標 | 日曜夜 |
| SES-005 | 称賛セッション | 達成時のお祝い対話 | 目標達成時 |

### 3.3 習慣化支援システム

#### 3.3.1 習慣設定機能

| ID | 機能 | 詳細 | 優先度 |
|----|------|------|--------|
| HBT-001 | 習慣登録 | 新しい習慣を登録（最大5個/MVP） | P0 |
| HBT-002 | 2分ルール提案 | 習慣を2分以内で始められる形に分解 | P0 |
| HBT-003 | 習慣スタッキング | 既存習慣にくっつける設定 | P0 |
| HBT-004 | If-Thenプランニング | トリガーと行動のセット設定 | P0 |
| HBT-005 | リマインダー設定 | 習慣実行時刻の通知設定 | P0 |

**2分ルール自動提案の例**

```
ユーザー入力: 「毎日運動したい」

AI提案:
┌────────────────────────────────────────────┐
│ 2分で始められる形にしてみましょう！          │
├────────────────────────────────────────────┤
│ レベル1: 運動着に着替える（1分）             │
│ レベル2: ストレッチ3種類（2分）              │
│ レベル3: スクワット10回（2分）               │
├────────────────────────────────────────────┤
│ まずはどれから始めてみますか？               │
└────────────────────────────────────────────┘
```

**習慣スタッキング設定UI**

```
「[既存の習慣] の後に [新しい習慣] をする」

例:
・朝コーヒーを入れた後に → 3分瞑想する
・歯を磨いた後に → スクワット10回する
・電車に乗った後に → 英単語アプリを開く
```

**If-Thenプランニングテンプレート**

```
もし [状況/トリガー] になったら、[行動] をする

テンプレート例:
・もし（時間）朝7時になったら → 水を1杯飲む
・もし（場所）会社に着いたら → 今日のタスク3つ書く
・もし（気分）イライラしたら → 深呼吸を3回する
・もし（行動）スマホを触りたくなったら → 5分だけにする
```

#### 3.3.2 進捗追跡機能

| ID | 機能 | 詳細 | 優先度 |
|----|------|------|--------|
| TRK-001 | 習慣チェック | ワンタップで完了記録 | P0 |
| TRK-002 | カレンダービュー | 月間の実施状況を可視化 | P0 |
| TRK-003 | ストリーク表示 | 連続達成日数の表示 | P0 |
| TRK-004 | 達成率グラフ | 週次/月次の達成率推移 | P1 |
| TRK-005 | 習慣詳細履歴 | 各習慣の実施履歴一覧 | P1 |

**カレンダービューUI設計**

```
        2026年 1月
  日  月  火  水  木  金  土
              1   2   3   4
              ●   ●   ○   ●
  5   6   7   8   9  10  11
  ○   ●   ●   ●   ●   ●   ○
 12  13  14  15  16  17  18
  ○   ●   ●   ●   ●   ●   ●
 19  20  21  22  23  24  25
  ●   ●   ●   ●   ●   ●   ●
 26  27
  ●   ◎  ← 今日

● 達成  ○ 未達成  ◎ 今日
```

#### 3.3.3 ゲーミフィケーション

| ID | 機能 | 詳細 | 優先度 |
|----|------|------|--------|
| GMF-001 | レベルシステム | 経験値に基づくレベルアップ | P1 |
| GMF-002 | バッジ獲得 | 特定条件でバッジ付与 | P1 |
| GMF-003 | 達成通知 | バッジ獲得時のアニメーション | P1 |
| GMF-004 | マイルストーン | 7日、30日、100日の特別演出 | P1 |

**バッジ一覧（初期）**

| バッジ名 | 条件 | アイコン |
|---------|------|---------|
| First Step | 初めての習慣チェック | 足跡 |
| Week Master | 7日連続達成 | 星 |
| Month Champion | 30日連続達成 | 王冠 |
| Early Bird | 朝7時前に5回チェック | 太陽 |
| Night Owl | 夜の習慣5回達成 | 月 |
| Comeback | 途切れた後に再開 | 復活の矢印 |
| Perfect Week | 1週間全習慣達成 | ダイヤモンド |

**80%ルールの実装**

```
週の達成率が80%以上 → 「素晴らしい週でした！」
週の達成率が50-79% → 「よく頑張りました！来週も一緒に」
週の達成率が50%未満 → 「少しずつでOK。できた日を大切に」

※ 100%達成を求めず、80%で十分という姿勢を明示
```

### 3.4 フォローアップ・リマインド機能

#### 3.4.1 プッシュ通知設計

| ID | 通知種別 | タイミング | 内容例 |
|----|---------|----------|--------|
| NTF-001 | モーニングチェックイン | 起床時刻 | 「おはようございます。今日の調子はいかがですか？」 |
| NTF-002 | 習慣リマインド | 習慣設定時刻の5分前 | 「もうすぐ[習慣名]の時間です」 |
| NTF-003 | 習慣確認 | 習慣設定時刻の30分後 | 「[習慣名]は完了しましたか？」 |
| NTF-004 | 称賛通知 | ストリーク更新時 | 「5日連続達成！すごいです！」 |
| NTF-005 | 週次振り返り | 日曜20:00 | 「今週の振り返りをしませんか？」 |
| NTF-006 | 復帰促進 | 3日間未使用時 | 「お元気ですか？小さな一歩から始めましょう」 |

**通知頻度制限**

```yaml
1日の最大通知数: 5件
同一種別の最小間隔: 4時間
夜間通知禁止時間: 22:00 - 7:00（ユーザー設定可能）
```

#### 3.4.2 内的トリガー移行支援

| ID | 機能 | 詳細 | 優先度 |
|----|------|------|--------|
| TRG-001 | 外的→内的移行 | 通知に頼らず自発的に実行できるよう支援 | P2 |
| TRG-002 | 通知削減提案 | 21日連続達成で通知削減を提案 | P2 |
| TRG-003 | 感情トリガー設定 | 特定の感情を習慣のきっかけに | P2 |

#### 3.4.3 週次振り返りセッション

```
週次振り返りフロー:

1. 今週のハイライト
   「今週、一番嬉しかった瞬間は何でしたか？」

2. 達成の確認
   「[習慣名]は[N]回達成できましたね！」

3. 成功要因の探求
   「うまくいった日は、何が違いましたか？」

4. 来週への意気込み
   「来週、特に頑張りたいことはありますか？」

5. 調整提案
   「習慣の難易度や時間を調整しますか？」
```

### 3.5 認証・アカウント管理

| ID | 機能 | 詳細 | 優先度 |
|----|------|------|--------|
| AUTH-001 | Google認証 | Better Authによるソーシャルログイン | P0 |
| AUTH-002 | ゲストモード | 登録なしで一部機能を試用 | P1 |
| AUTH-003 | アカウント削除 | GDPR対応のデータ完全削除 | P0 |
| AUTH-004 | データエクスポート | 自分のデータをJSON形式でDL | P2 |

### 3.6 設定・カスタマイズ

| ID | 機能 | 詳細 | 優先度 |
|----|------|------|--------|
| SET-001 | プロフィール編集 | ニックネーム、アイコン変更 | P0 |
| SET-002 | 通知設定 | 通知ON/OFF、時間帯設定 | P0 |
| SET-003 | コーチトーン設定 | AIの口調選択（優しい/フランク/ビジネス） | P2 |
| SET-004 | テーマ設定 | ライト/ダーク/システム連動 | P1 |
| SET-005 | 言語設定 | 日本語（将来的に多言語） | P2 |

---

## 4. 非機能要件

### 4.1 パフォーマンス要件

| 項目 | 要件値 | 測定方法 |
|------|--------|---------|
| 初回表示速度（LCP） | 2.5秒以内 | Lighthouse |
| インタラクション応答（INP） | 200ms以内 | Web Vitals |
| レイアウトシフト（CLS） | 0.1以下 | Lighthouse |
| AI応答時間 | 3秒以内 | APM |
| API応答時間（P95） | 500ms以内 | APM |
| オフライン対応 | 基本機能利用可能 | PWA |

**モバイル最適化**

```yaml
バンドルサイズ:
  初期JS: 100KB以下（gzip）
  初期CSS: 30KB以下（gzip）

画像最適化:
  フォーマット: WebP優先、AVIF対応
  遅延読み込み: すべての画面外画像

ネットワーク最適化:
  Service Worker: キャッシュ戦略実装
  Prefetch: 次画面の先読み
```

### 4.2 セキュリティ要件

| 項目 | 要件 | 対応方法 |
|------|------|---------|
| 認証 | OAuth 2.0 / OIDC | Better Auth |
| 通信暗号化 | TLS 1.3 | Vercel自動対応 |
| データ暗号化 | 保存時暗号化 | Turso対応 |
| XSS対策 | エスケープ処理 | React標準 |
| CSRF対策 | トークン検証 | Better Auth |
| レート制限 | 100req/分/ユーザー | Edge Middleware |

**プライバシー保護**

```yaml
データ保持:
  対話ログ: 1年間（ユーザー設定で延長可）
  習慣データ: 無期限（削除リクエストまで）

匿名化:
  AI学習には匿名化データのみ使用
  個人特定可能情報は除外

GDPR/個人情報保護法対応:
  データポータビリティ: JSON形式エクスポート
  削除権: 30日以内に完全削除
  同意管理: 明示的なオプトイン
```

### 4.3 可用性・信頼性

| 項目 | 目標値 |
|------|--------|
| 稼働率 | 99.9%（月間ダウンタイム43分以内） |
| RPO（目標復旧時点） | 1時間 |
| RTO（目標復旧時間） | 4時間 |
| バックアップ | 日次自動バックアップ |

### 4.4 スケーラビリティ

```yaml
初期想定:
  MAU: 10,000ユーザー
  DAU: 3,000ユーザー
  同時接続: 500ユーザー

スケール計画:
  Phase 1: 10,000 MAU（Vercel Pro）
  Phase 2: 100,000 MAU（Vercel Enterprise検討）
  Phase 3: 1,000,000 MAU（インフラ再設計）
```

### 4.5 アクセシビリティ

| 項目 | 要件 |
|------|------|
| WCAG準拠 | Level AA |
| スクリーンリーダー | 完全対応 |
| キーボード操作 | 全機能対応 |
| カラーコントラスト | 4.5:1以上 |
| フォントサイズ | 可変対応 |

---

## 5. 技術アーキテクチャ

### 5.1 システム構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │   Mobile    │    │   Mobile    │    │   Desktop   │        │
│   │  (PWA/iOS)  │    │  (PWA/And)  │    │    (Web)    │        │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘        │
│          │                  │                  │                │
│          └──────────────────┼──────────────────┘                │
│                             │                                   │
│                    ┌────────▼────────┐                          │
│                    │  Next.js App    │                          │
│                    │  (App Router)   │                          │
│                    │  + shadcn/ui    │                          │
│                    └────────┬────────┘                          │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                    Vercel Edge Network                          │
├─────────────────────────────┼───────────────────────────────────┤
│                             │                                   │
│   ┌─────────────────────────▼─────────────────────────┐         │
│   │              Edge Middleware                       │         │
│   │  - Authentication Check                           │         │
│   │  - Rate Limiting                                  │         │
│   │  - Geo Routing                                    │         │
│   └─────────────────────────┬─────────────────────────┘         │
│                             │                                   │
│   ┌─────────────┬───────────┼───────────┬─────────────┐         │
│   │             │           │           │             │         │
│   ▼             ▼           ▼           ▼             ▼         │
│ ┌─────┐    ┌─────────┐ ┌─────────┐ ┌─────────┐  ┌─────────┐    │
│ │ SSR │    │  API    │ │  API    │ │  API    │  │  API    │    │
│ │Pages│    │ /auth   │ │ /chat   │ │ /habits │  │ /users  │    │
│ └─────┘    └────┬────┘ └────┬────┘ └────┬────┘  └────┬────┘    │
│                 │           │           │            │          │
└─────────────────┼───────────┼───────────┼────────────┼──────────┘
                  │           │           │            │
┌─────────────────┼───────────┼───────────┼────────────┼──────────┐
│                 │     Backend Services  │            │          │
├─────────────────┼───────────┼───────────┼────────────┼──────────┤
│                 │           │           │            │          │
│   ┌─────────────▼───────────┼───────────┼────────────▼────────┐ │
│   │           Better Auth                                     │ │
│   │     (Google OAuth + Session Management)                   │ │
│   └───────────────────────────────────────────────────────────┘ │
│                             │                                   │
│   ┌─────────────────────────▼─────────────────────────────────┐ │
│   │                    AI Service Layer                       │ │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│   │  │  Claude AI  │  │   Prompt    │  │  Context    │        │ │
│   │  │    API      │  │  Templates  │  │  Manager    │        │ │
│   │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│   └───────────────────────────────────────────────────────────┘ │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                      Data Layer                                 │
├─────────────────────────────┼───────────────────────────────────┤
│                             │                                   │
│   ┌─────────────────────────▼─────────────────────────────────┐ │
│   │                      Turso                                │ │
│   │            (Distributed SQLite Database)                  │ │
│   │                                                           │ │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │ │
│   │  │  Users  │ │ Habits  │ │Sessions │ │Messages │         │ │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 技術スタック詳細

| レイヤー | 技術 | バージョン | 選定理由 |
|---------|------|-----------|---------|
| フロントエンド | Next.js | 16+ | App Router、Server Components |
| UIライブラリ | shadcn/ui | 最新 | カスタマイズ性、アクセシビリティ |
| スタイリング | Tailwind CSS | 4.x | ユーティリティファースト |
| 状態管理 | Zustand | 5.x | 軽量、シンプル |
| フォーム | React Hook Form + Zod | 最新 | バリデーション統合 |
| 認証 | Better Auth | 最新 | モダンな認証ソリューション |
| DB | Turso | 最新 | Edge対応SQLite |
| ORM | Drizzle ORM | 最新 | 型安全、軽量 |
| AI | Claude API | 最新 | 高品質な対話生成 |
| デプロイ | Vercel | - | Edge最適化 |
| 監視 | Vercel Analytics | - | Web Vitals監視 |

### 5.3 ディレクトリ構造

```
ai-life-coach/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認証関連ページ
│   │   ├── login/
│   │   └── callback/
│   ├── (main)/                   # メインアプリ
│   │   ├── chat/                 # AI対話
│   │   ├── habits/               # 習慣管理
│   │   ├── progress/             # 進捗確認
│   │   └── settings/             # 設定
│   ├── onboarding/               # オンボーディング
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── habits/
│   │   └── users/
│   ├── layout.tsx
│   └── page.tsx
├── components/                    # UIコンポーネント
│   ├── ui/                       # shadcn/ui
│   ├── chat/                     # チャット関連
│   ├── habits/                   # 習慣関連
│   └── shared/                   # 共通
├── lib/                          # ユーティリティ
│   ├── auth/                     # Better Auth設定
│   ├── db/                       # Drizzle設定
│   ├── ai/                       # AI関連
│   └── utils/
├── hooks/                        # カスタムフック
├── stores/                       # Zustand ストア
├── types/                        # TypeScript型定義
├── prompts/                      # AIプロンプトテンプレート
├── public/                       # 静的ファイル
└── docs/                         # ドキュメント
```

### 5.4 モバイルファースト設計指針

**ブレークポイント**

```css
/* Mobile First */
sm: 640px   /* 大きめのスマホ */
md: 768px   /* タブレット */
lg: 1024px  /* 小さめのPC */
xl: 1280px  /* デスクトップ */
```

**タッチインタラクション**

```yaml
タップターゲット:
  最小サイズ: 44x44px
  推奨サイズ: 48x48px
  間隔: 8px以上

ジェスチャー:
  スワイプ: 習慣チェックの完了/取り消し
  プルダウン: リフレッシュ
  ロングプレス: コンテキストメニュー
```

**ナビゲーション**

```
┌─────────────────────────────────┐
│          ヘッダー               │
│  ロゴ              プロフィール  │
├─────────────────────────────────┤
│                                 │
│                                 │
│         メインコンテンツ         │
│                                 │
│                                 │
├─────────────────────────────────┤
│  ホーム  チャット  習慣  進捗  設定 │
│    🏠      💬      ✓      📊    ⚙️ │
└─────────────────────────────────┘
     ボトムナビゲーション
```

---

## 6. 技術実装詳細

### 6.1 Better Auth認証設計

#### 6.1.1 セッション管理戦略

```yaml
セッション方式: Database Session（推奨）

選定理由:
  - サーバーサイドでのセッション無効化が容易
  - セッション情報の拡張が柔軟
  - Tursoとの統合が自然

セッション設定:
  有効期間: 30日
  更新タイミング: アクセス時に自動延長
  同時セッション: 制限なし（将来的に制限可能）
```

#### 6.1.2 Googleプロバイダー設定

```typescript
// lib/auth/config.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: false, // Googleのみ
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: ["openid", "email", "profile"],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30日
    updateAge: 60 * 60 * 24, // 24時間ごとに更新
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5分キャッシュ
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL!,
  ],
});
```

#### 6.1.3 コールバックURL設計

```yaml
本番環境:
  ベースURL: https://app.example.com
  コールバック: https://app.example.com/api/auth/callback/google
  Google Console設定:
    - Authorized JavaScript origins: https://app.example.com
    - Authorized redirect URIs: https://app.example.com/api/auth/callback/google

開発環境:
  ベースURL: http://localhost:3000
  コールバック: http://localhost:3000/api/auth/callback/google
  Google Console設定:
    - Authorized JavaScript origins: http://localhost:3000
    - Authorized redirect URIs: http://localhost:3000/api/auth/callback/google

Vercelプレビュー:
  動的URL対応: NEXT_PUBLIC_APP_URL環境変数で制御
```

#### 6.1.4 認証ミドルウェア配置

```typescript
// middleware.ts
import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 認証が必要なパス
const protectedPaths = [
  "/chat",
  "/habits",
  "/progress",
  "/settings",
  "/onboarding",
];

// 認証済みユーザーがアクセスできないパス
const authPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  // 保護されたパスへの未認証アクセス
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 認証済みユーザーのログインページアクセス
  if (authPaths.some((p) => pathname.startsWith(p))) {
    if (session) {
      return NextResponse.redirect(new URL("/chat", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

#### 6.1.5 認証状態のキャッシュ戦略

```yaml
クライアントサイド:
  方式: React Query + Better Auth hooks
  キャッシュ時間: 5分
  再検証: フォーカス時、ネットワーク再接続時

サーバーサイド:
  方式: Cookie-based Session
  キャッシュ: Better Auth cookieCacheを活用
  ISR/SSGとの併用:
    - 静的ページ: 認証不要コンテンツのみ
    - 動的ページ: Server Componentsで都度検証
    - Partial Prerendering: 認証部分は動的レンダリング

セッション検証最適化:
  - Edge Middlewareで軽量チェック（Cookie存在確認）
  - 詳細検証はServer Components/API Routesで実施
  - データベースクエリは必要時のみ
```

### 6.2 Turso/SQLite制約対応

#### 6.2.1 日時型の扱い

```yaml
方針: TEXT型 + ISO8601形式

理由:
  - SQLiteにはネイティブのDATETIME型がない
  - Tursoでの互換性確保
  - タイムゾーン情報の保持

フォーマット: "YYYY-MM-DDTHH:mm:ss.sssZ"

Drizzle ORM設定:
  - mode: "string"を使用
  - アプリケーション層でDate変換
```

```typescript
// lib/db/schema.ts
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

// 日時カラムの定義
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

// ヘルパー関数
export function toISOString(date: Date): string {
  return date.toISOString();
}

export function fromISOString(isoString: string): Date {
  return new Date(isoString);
}
```

#### 6.2.2 JSON型の扱い

```yaml
方針: TEXT型 + JSON関数

保存: JSON.stringify()でシリアライズ
取得: JSON.parse()でパース
検索: SQLiteのjson_extract()関数を使用
```

```typescript
// Drizzle ORMでのJSON定義
import { text } from "drizzle-orm/sqlite-core";

// カスタムJSON型
export const jsonColumn = <T>(name: string) =>
  text(name).$type<T>();

// 使用例
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  settings: jsonColumn<UserSettings>("settings"),
  values: jsonColumn<string[]>("values"),
});

// SQLでのJSON検索例
// SELECT * FROM users WHERE json_extract(settings, '$.notifications.enabled') = true
```

#### 6.2.3 マイグレーション戦略

```yaml
ツール: Drizzle Kit

ワークフロー:
  1. スキーマ変更: lib/db/schema.tsを編集
  2. マイグレーション生成: pnpm drizzle-kit generate
  3. ローカル適用: pnpm drizzle-kit migrate
  4. 本番適用: CI/CDパイプラインで自動実行

ベストプラクティス:
  - 破壊的変更は避ける（カラム削除より非推奨化）
  - 新カラムはNULLABLEまたはDEFAULT付き
  - インデックス追加は別マイグレーションで
  - ロールバック手順を事前に準備
```

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
```

#### 6.2.4 libSQL固有の考慮事項

```yaml
接続管理:
  - HTTP接続: Vercel Serverless向け（コールドスタート対応）
  - WebSocket: 長時間接続が必要な場合のみ

パフォーマンス:
  - Embedded Replicas: 読み取り高速化（将来検討）
  - プリペアドステートメント: Drizzle ORMで自動対応

制約:
  - トランザクション: HTTP経由では単一リクエスト内のみ
  - 同時書き込み: シリアライズされる（書き込み競合なし）
  - 最大行サイズ: 1MB（JSON含む）
```

### 6.3 AIストリーミング実装

#### 6.3.1 Vercel AI SDK活用

```typescript
// app/api/v1/chat/sessions/[id]/messages/route.ts
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { auth } from "@/lib/auth/config";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 認証チェック
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { content } = await request.json();

  // コンテキスト取得（過去メッセージ、ユーザー情報等）
  const context = await getChatContext(params.id, session.user.id);

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: buildSystemPrompt(context),
    messages: [
      ...context.previousMessages,
      { role: "user", content },
    ],
    maxTokens: 1024,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}
```

#### 6.3.2 ストリーミングUI連携

```typescript
// components/chat/chat-interface.tsx
"use client";

import { useChat } from "ai/react";
import { useRef, useEffect } from "react";

export function ChatInterface({ sessionId }: { sessionId: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({
    api: `/api/v1/chat/sessions/${sessionId}/messages`,
    onError: (error) => {
      console.error("Chat error:", error);
      // エラーハンドリング
    },
    onFinish: (message) => {
      // メッセージ完了時の処理（保存等）
    },
  });

  // 自動スクロール
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      <ChatInput
        input={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={stop}
      />

      {error && (
        <ErrorBanner error={error} onRetry={reload} />
      )}
    </div>
  );
}
```

#### 6.3.3 AIレート制限

```yaml
制限設計:
  ユーザーあたり:
    - 1分間: 10リクエスト
    - 1時間: 100リクエスト
    - 1日: 500リクエスト

  グローバル:
    - 1分間: 1000リクエスト（サービス全体）

実装:
  - Upstash Ratelimitを使用
  - Edge Middlewareで事前チェック
  - 超過時は429レスポンス + Retry-Afterヘッダー
```

```typescript
// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const chatRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:chat",
});

// API Routeでの使用
export async function checkRateLimit(userId: string) {
  const { success, limit, remaining, reset } =
    await chatRatelimit.limit(userId);

  if (!success) {
    return {
      error: true,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    };
  }

  return { error: false };
}
```

### 6.4 Server/Client Components境界

#### 6.4.1 コンポーネント分割方針

```
┌─────────────────────────────────────────────────────────────────┐
│                    ページ別コンポーネント設計                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /chat                                                          │
│  ├── page.tsx (Server) - セッション取得、初期データフェッチ       │
│  ├── ChatContainer.tsx (Client) - 状態管理、リアルタイム通信     │
│  │   ├── MessageList.tsx (Client) - メッセージ表示              │
│  │   ├── ChatInput.tsx (Client) - 入力UI                        │
│  │   └── TypingIndicator.tsx (Client) - ローディング表示        │
│  └── ChatHeader.tsx (Server) - 静的ヘッダー                      │
│                                                                 │
│  /habits                                                        │
│  ├── page.tsx (Server) - 習慣一覧取得                            │
│  ├── HabitList.tsx (Server) - 習慣リスト表示                     │
│  │   └── HabitCard.tsx (Client) - スワイプ操作、チェック        │
│  ├── AddHabitButton.tsx (Client) - モーダル制御                  │
│  └── HabitForm.tsx (Client) - フォーム入力                       │
│                                                                 │
│  /progress                                                      │
│  ├── page.tsx (Server) - 進捗データ取得                          │
│  ├── CalendarView.tsx (Client) - インタラクティブカレンダー      │
│  ├── StreakDisplay.tsx (Server) - ストリーク表示                 │
│  └── StatsCards.tsx (Server) - 統計カード                        │
│                                                                 │
│  /settings                                                      │
│  ├── page.tsx (Server) - 設定データ取得                          │
│  └── SettingsForm.tsx (Client) - 設定変更フォーム                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.4.2 データフェッチ戦略

```yaml
Server Components:
  用途:
    - 初期データロード
    - SEO対応が必要なコンテンツ
    - 認証状態の取得
  方法:
    - async/await で直接DB/API呼び出し
    - キャッシュ: fetch() の cache オプション

Client Components:
  用途:
    - ユーザーインタラクション後のデータ取得
    - リアルタイム更新
    - Optimistic Updates
  方法:
    - React Query (TanStack Query)
    - SWR（必要に応じて）
```

```typescript
// Server Componentでのデータフェッチ
// app/(main)/habits/page.tsx
import { auth } from "@/lib/auth/config";
import { getHabits } from "@/lib/db/queries";

export default async function HabitsPage() {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  const habits = await getHabits(session!.user.id);

  return (
    <div>
      <HabitList habits={habits} />
      <AddHabitButton />
    </div>
  );
}
```

#### 6.4.3 Server Actions活用

```typescript
// lib/actions/habits.ts
"use server";

import { auth } from "@/lib/auth/config";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { habits, habitLogs } from "@/lib/db/schema";
import { z } from "zod";

const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  twoMinuteVersion: z.string().max(200).optional(),
  reminderTime: z.string().optional(),
});

export async function createHabit(formData: FormData) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const validated = createHabitSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    twoMinuteVersion: formData.get("twoMinuteVersion"),
    reminderTime: formData.get("reminderTime"),
  });

  await db.insert(habits).values({
    id: generateId(),
    userId: session.user.id,
    ...validated,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/habits");
}

export async function checkHabit(habitId: string) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const today = new Date().toISOString().split("T")[0];

  await db.insert(habitLogs).values({
    id: generateId(),
    habitId,
    userId: session.user.id,
    date: today,
    completedAt: new Date().toISOString(),
  });

  revalidatePath("/habits");
  revalidatePath("/progress");
}
```

### 6.5 PWA実装詳細

#### 6.5.1 Service Worker戦略

```yaml
戦略: Workbox（next-pwa統合）

キャッシュ戦略:
  StaleWhileRevalidate:
    - 静的アセット（JS, CSS, フォント）
    - 画像

  NetworkFirst:
    - API レスポンス
    - HTMLページ

  CacheFirst:
    - Google Fonts
    - 外部CDNリソース

  NetworkOnly:
    - 認証API
    - AIストリーミングAPI
```

```javascript
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
        },
      },
    },
    {
      urlPattern: /\/api\/v1\/(?!chat|auth).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5分
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

#### 6.5.2 オフラインキャッシュ対象

```yaml
必須キャッシュ（AppShell）:
  - /_next/static/**（JSバンドル）
  - /manifest.json
  - /icons/**
  - オフラインフォールバックページ

推奨キャッシュ:
  - 最新の習慣一覧（IndexedDB）
  - 今日の習慣チェック状態
  - ユーザープロフィール

キャッシュしない:
  - AIチャットAPI（リアルタイム性必須）
  - 認証API
  - 週次/月次統計（サイズ大）

オフライン時の挙動:
  - 習慣チェック: ローカル保存 → オンライン時同期
  - チャット: 「オフラインです」メッセージ表示
  - 進捗: キャッシュデータ表示 + 更新日時表示
```

#### 6.5.3 プッシュ通知実装

```typescript
// lib/push-notifications.ts
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:support@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    type?: "checkin" | "reminder" | "achievement";
  };
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
  } catch (error) {
    if ((error as any).statusCode === 410) {
      // 購読が無効になっている場合は削除
      await removeSubscription(subscription.endpoint);
    }
    throw error;
  }
}

// Service Worker側での受信処理
// public/sw.js（追加部分）
self.addEventListener("push", (event) => {
  const payload = event.data?.json() ?? {};

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-72x72.png",
      data: payload.data,
      vibrate: [100, 50, 100],
      actions: [
        { action: "open", title: "開く" },
        { action: "dismiss", title: "閉じる" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    const url = event.notification.data?.url || "/";
    event.waitUntil(clients.openWindow(url));
  }
});
```

### 6.6 環境変数定義

#### 6.6.1 必須環境変数一覧

```bash
# .env.example

# ===========================================
# 認証（Better Auth）
# ===========================================
# Google OAuth認証情報
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Better Auth シークレット（32文字以上のランダム文字列）
BETTER_AUTH_SECRET=your-random-secret-key-min-32-chars

# ===========================================
# データベース（Turso）
# ===========================================
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# ===========================================
# AI（Anthropic Claude）
# ===========================================
ANTHROPIC_API_KEY=sk-ant-xxxxx

# ===========================================
# アプリケーション
# ===========================================
# 本番: https://app.example.com
# 開発: http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# PWA プッシュ通知（VAPID）
# ===========================================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# ===========================================
# レート制限（Upstash Redis）
# ===========================================
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=your-upstash-token
```

#### 6.6.2 開発/本番環境の違い

```yaml
開発環境 (.env.local):
  NEXT_PUBLIC_APP_URL: http://localhost:3000
  NODE_ENV: development
  特記事項:
    - PWA無効化
    - 詳細ログ出力
    - ホットリロード有効
    - ソースマップ有効

ステージング環境 (.env.staging):
  NEXT_PUBLIC_APP_URL: https://staging.example.com
  NODE_ENV: production
  特記事項:
    - 本番同等設定
    - テストデータ使用可
    - デバッグツール有効

本番環境 (Vercel Environment Variables):
  NEXT_PUBLIC_APP_URL: https://app.example.com
  NODE_ENV: production
  特記事項:
    - 全機能有効
    - エラー監視有効
    - パフォーマンス最適化
    - セキュリティヘッダー強化

Vercel設定:
  - 環境変数は Vercel Dashboard で管理
  - プレビュー環境には自動でURLが設定される
  - シークレットは暗号化保存
```

---

## 7. データモデル設計

### 7.1 ER図

```
┌─────────────────┐       ┌─────────────────┐
│      users      │       │    sessions     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │
│ email           │   │   │ user_id (FK)    │──┐
│ name            │   │   │ type            │  │
│ avatar_url      │   │   │ status          │  │
│ purpose         │   │   │ started_at      │  │
│ values          │   │   │ ended_at        │  │
│ motivation      │   │   │ summary         │  │
│ onboarding_done │   │   │ created_at      │  │
│ settings        │   │   └─────────────────┘  │
│ created_at      │   │                        │
│ updated_at      │   │   ┌─────────────────┐  │
└─────────────────┘   │   │    messages     │  │
         │            │   ├─────────────────┤  │
         │            │   │ id (PK)         │  │
         │            └──▶│ session_id (FK) │◀─┘
         │                │ role            │
         │                │ content         │
         │                │ metadata        │
         │                │ created_at      │
         │                └─────────────────┘
         │
         │            ┌─────────────────┐
         │            │     habits      │
         │            ├─────────────────┤
         └───────────▶│ id (PK)         │
                      │ user_id (FK)    │
                      │ name            │
                      │ description     │
                      │ trigger         │
                      │ cue_type        │
                      │ cue_value       │
                      │ stack_after     │
                      │ if_then         │
                      │ reminder_time   │
                      │ is_active       │
                      │ created_at      │
                      │ updated_at      │
                      └────────┬────────┘
                               │
                               │
                      ┌────────▼────────┐
                      │  habit_logs     │
                      ├─────────────────┤
                      │ id (PK)         │
                      │ habit_id (FK)   │
                      │ completed_at    │
                      │ note            │
                      │ mood            │
                      └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│     badges      │       │  user_badges    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◀──────│ id (PK)         │
│ name            │       │ user_id (FK)    │
│ description     │       │ badge_id (FK)   │
│ icon            │       │ earned_at       │
│ condition       │       └─────────────────┘
│ category        │
└─────────────────┘
```

### 7.2 テーブル定義（Turso/SQLite対応）

#### users テーブル

```sql
-- Turso/SQLite: 日時はTEXT型（ISO8601形式）、JSONはTEXT型で保存
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  purpose TEXT CHECK (purpose IN ('performance', 'mental', 'transformation')),
  values TEXT, -- JSON配列: ["価値観1", "価値観2"]
  motivation TEXT, -- 内発的動機
  onboarding_completed_at TEXT, -- ISO8601: "2026-01-28T10:30:00.000Z"
  settings TEXT, -- JSON: UserSettings型
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 更新時のupdated_at自動更新トリガー
CREATE TRIGGER users_updated_at
  AFTER UPDATE ON users
  FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = OLD.id;
END;
```

#### chat_sessions テーブル

```sql
-- Better Authのsessionテーブルと区別するためchat_sessionsに命名
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'onboarding', 'daily_checkin', 'free',
    'habit_review', 'weekly_review', 'celebration'
  )),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  current_step TEXT, -- 解決志向アプローチの現在ステップ
  context TEXT, -- JSON: SessionContext型
  started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ended_at TEXT, -- ISO8601形式
  summary TEXT, -- AI生成のセッションサマリー
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(user_id, status);
```

#### messages テーブル

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata TEXT, -- JSON: { emotions_detected?: string[], step?: string }
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(session_id, created_at);
```

#### habits テーブル

```sql
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  two_minute_version TEXT, -- 2分ルール版
  trigger_type TEXT CHECK (trigger_type IN ('time', 'location', 'action', 'emotion')),
  trigger_value TEXT,
  stack_after_habit_id TEXT REFERENCES habits(id), -- 習慣スタッキング
  if_then_condition TEXT, -- If-Thenの条件
  if_then_action TEXT, -- If-Thenの行動
  reminder_enabled INTEGER DEFAULT 1, -- SQLite: BOOLEAN は INTEGER (0/1)
  reminder_time TEXT, -- "HH:MM" 形式
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
  frequency_days TEXT, -- JSON配列: ["mon", "wed", "fri"]
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_active ON habits(user_id, is_active);

CREATE TRIGGER habits_updated_at
  AFTER UPDATE ON habits
  FOR EACH ROW
BEGIN
  UPDATE habits SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = OLD.id;
END;
```

#### habit_logs テーブル

```sql
CREATE TABLE habit_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL, -- ISO8601形式
  date TEXT NOT NULL, -- "YYYY-MM-DD" 形式（集計用）
  note TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  UNIQUE(habit_id, date) -- 1日1回制限
);

CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, date);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, date);
-- ストリーク計算用の複合インデックス
CREATE INDEX idx_habit_logs_streak ON habit_logs(user_id, habit_id, date DESC);
```

#### badges テーブル

```sql
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER,
  category TEXT CHECK (category IN ('streak', 'milestone', 'special')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 初期バッジデータ（マイグレーションで投入）
INSERT INTO badges (id, name, description, icon, condition_type, condition_value, category) VALUES
('first_step', 'First Step', '初めての習慣チェック', 'footprints', 'habit_check_count', 1, 'milestone'),
('week_master', 'Week Master', '7日連続達成', 'star', 'streak_days', 7, 'streak'),
('month_champion', 'Month Champion', '30日連続達成', 'crown', 'streak_days', 30, 'streak'),
('comeback', 'Comeback', '途切れた後に再開', 'refresh', 'comeback', 1, 'special');
```

#### user_badges テーブル

```sql
CREATE TABLE user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id),
  earned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
```

#### Better Auth用テーブル（自動生成）

```sql
-- Better Authが自動生成するテーブル（参考）
-- 実際のスキーマはBetter Auth設定時に生成される

CREATE TABLE auth_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER DEFAULT 0,
  name TEXT,
  image TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE auth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(provider, provider_account_id)
);

-- 注意: usersテーブルとauth_usersは1:1で紐づける
-- user_idをauth_users.idと同じ値にするか、
-- usersテーブルにauth_user_id外部キーを追加する
```

### 7.3 JSON構造定義

#### user.settings

```typescript
interface UserSettings {
  notifications: {
    enabled: boolean;
    morning_checkin: boolean;
    habit_reminders: boolean;
    weekly_review: boolean;
    achievements: boolean;
    quiet_hours: {
      enabled: boolean;
      start: string; // "22:00"
      end: string;   // "07:00"
    };
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'ja' | 'en';
  };
  coaching: {
    tone: 'gentle' | 'casual' | 'professional';
  };
  lifestyle: {
    wake_time: string; // "07:00"
    sleep_time: string; // "23:00"
    busy_hours: string[]; // ["09:00-12:00", "14:00-18:00"]
  };
}
```

#### session.context

```typescript
interface SessionContext {
  onboarding_step?: number;
  solution_focused_step?: string;
  scaling_scores?: {
    initial: number;
    current: number;
    target: number;
  };
  identified_strengths?: string[];
  action_options?: string[];
  selected_action?: string;
  emotions_detected?: string[];
}
```

---

## 8. API設計方針

### 8.1 設計原則

```yaml
原則:
  - RESTful設計（リソース指向）
  - JSON:API仕様ベース
  - バージョニング（/api/v1/）
  - 認証必須（Better Auth）
  - レート制限（100req/min/user）

レスポンス形式:
  成功: { data: T, meta?: {} }
  エラー: { error: { code: string, message: string, details?: {} } }

HTTPステータス:
  200: OK
  201: Created
  204: No Content
  400: Bad Request
  401: Unauthorized
  403: Forbidden
  404: Not Found
  429: Too Many Requests
  500: Internal Server Error
```

### 8.2 エンドポイント一覧

#### 認証 API

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/auth/session` | 現在のセッション取得 |
| POST | `/api/auth/signin/google` | Googleログイン開始 |
| GET | `/api/auth/callback/google` | Googleコールバック |
| POST | `/api/auth/signout` | ログアウト |
| DELETE | `/api/auth/account` | アカウント削除 |

#### ユーザー API

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/v1/users/me` | 自分のプロフィール取得 |
| PATCH | `/api/v1/users/me` | プロフィール更新 |
| PATCH | `/api/v1/users/me/settings` | 設定更新 |
| POST | `/api/v1/users/me/onboarding` | オンボーディング完了 |
| GET | `/api/v1/users/me/stats` | 統計情報取得 |
| GET | `/api/v1/users/me/badges` | 獲得バッジ一覧 |

#### チャット API

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/v1/chat/sessions` | 新規セッション開始 |
| GET | `/api/v1/chat/sessions/:id` | セッション詳細取得 |
| POST | `/api/v1/chat/sessions/:id/messages` | メッセージ送信 |
| PATCH | `/api/v1/chat/sessions/:id` | セッション終了 |
| GET | `/api/v1/chat/sessions` | セッション履歴一覧 |

#### 習慣 API

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/v1/habits` | 習慣一覧取得 |
| POST | `/api/v1/habits` | 習慣作成 |
| GET | `/api/v1/habits/:id` | 習慣詳細取得 |
| PATCH | `/api/v1/habits/:id` | 習慣更新 |
| DELETE | `/api/v1/habits/:id` | 習慣削除 |
| POST | `/api/v1/habits/:id/check` | 習慣チェック（完了記録） |
| DELETE | `/api/v1/habits/:id/check/:date` | 習慣チェック取り消し |
| GET | `/api/v1/habits/:id/logs` | 習慣ログ一覧 |
| GET | `/api/v1/habits/:id/stats` | 習慣統計 |

#### 進捗 API

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/v1/progress/daily` | 今日の進捗 |
| GET | `/api/v1/progress/weekly` | 週間サマリー |
| GET | `/api/v1/progress/monthly` | 月間サマリー |
| GET | `/api/v1/progress/calendar` | カレンダーデータ |
| GET | `/api/v1/progress/streaks` | ストリーク情報 |

### 8.3 AIチャット API詳細

#### リクエスト

```typescript
// POST /api/v1/chat/sessions/:id/messages
interface SendMessageRequest {
  content: string;
  metadata?: {
    is_quick_reply?: boolean;
    selected_option?: string;
  };
}
```

#### レスポンス（ストリーミング）

```typescript
// Server-Sent Events形式
interface ChatStreamEvent {
  type: 'start' | 'delta' | 'end' | 'error';
  data: {
    message_id?: string;
    content?: string; // delta時は差分テキスト
    metadata?: {
      step?: string; // 解決志向アプローチの現在ステップ
      quick_replies?: string[]; // 選択肢
      action_suggested?: boolean;
    };
  };
}
```

### 8.4 エラーコード

```typescript
enum ErrorCode {
  // 認証エラー (1xxx)
  AUTH_REQUIRED = 'E1001',
  AUTH_INVALID_TOKEN = 'E1002',
  AUTH_EXPIRED = 'E1003',

  // バリデーションエラー (2xxx)
  VALIDATION_REQUIRED = 'E2001',
  VALIDATION_INVALID_FORMAT = 'E2002',
  VALIDATION_OUT_OF_RANGE = 'E2003',

  // リソースエラー (3xxx)
  RESOURCE_NOT_FOUND = 'E3001',
  RESOURCE_ALREADY_EXISTS = 'E3002',
  RESOURCE_LIMIT_EXCEEDED = 'E3003',

  // レート制限 (4xxx)
  RATE_LIMIT_EXCEEDED = 'E4001',

  // サーバーエラー (5xxx)
  INTERNAL_ERROR = 'E5001',
  AI_SERVICE_UNAVAILABLE = 'E5002',
  DATABASE_ERROR = 'E5003',
}
```

---

## 9. エラーハンドリング戦略

### 9.1 エラー分類体系

```yaml
レイヤー別エラー分類:

  API層:
    - バリデーションエラー (400)
    - 認証エラー (401)
    - 認可エラー (403)
    - リソース未検出 (404)
    - レート制限 (429)
    - サーバーエラー (500)

  認証層 (Better Auth):
    - セッション期限切れ
    - 無効なトークン
    - Googleプロバイダーエラー
    - アカウント無効化

  データベース層 (Turso):
    - 接続エラー
    - クエリタイムアウト
    - 一意制約違反
    - 外部キー制約違反

  AI層 (Claude API):
    - レート制限
    - トークン上限超過
    - コンテンツフィルター
    - サービス一時停止
```

### 9.2 ユーザー向けエラーメッセージ

```typescript
// lib/errors/messages.ts
export const userMessages = {
  // 認証エラー
  AUTH_REQUIRED: "ログインが必要です。",
  AUTH_EXPIRED: "セッションが期限切れです。再度ログインしてください。",
  AUTH_FAILED: "ログインに失敗しました。もう一度お試しください。",

  // バリデーションエラー
  VALIDATION_REQUIRED: "入力内容を確認してください。",
  VALIDATION_TOO_LONG: "文字数が上限を超えています。",
  HABIT_LIMIT_EXCEEDED: "習慣は最大5個まで登録できます。",

  // リソースエラー
  NOT_FOUND: "お探しのページが見つかりませんでした。",
  ALREADY_EXISTS: "すでに登録されています。",

  // AI関連エラー
  AI_UNAVAILABLE: "AIコーチが一時的に利用できません。しばらくお待ちください。",
  AI_RATE_LIMITED: "リクエストが多すぎます。少し時間をおいてお試しください。",
  AI_RESPONSE_ERROR: "回答の生成中にエラーが発生しました。再度お試しください。",

  // ネットワーク/サーバーエラー
  NETWORK_ERROR: "通信エラーが発生しました。接続を確認してください。",
  SERVER_ERROR: "サーバーエラーが発生しました。しばらくお待ちください。",
  TIMEOUT: "応答に時間がかかっています。再度お試しください。",

  // デフォルト
  UNKNOWN: "予期しないエラーが発生しました。",
} as const;
```

### 9.3 リトライ戦略

```yaml
自動リトライ対象:
  - ネットワークエラー（一時的な接続障害）
  - 503 Service Unavailable
  - 429 Rate Limited（Retry-Afterヘッダー準拠）
  - データベース接続エラー

リトライしない:
  - 400 Bad Request（バリデーションエラー）
  - 401/403（認証/認可エラー）
  - 404 Not Found
  - ユーザー操作起因のエラー

リトライ設定:
  最大回数: 3回
  間隔: 指数バックオフ（1秒、2秒、4秒）
  ジッター: 0-500msのランダム遅延追加
```

```typescript
// lib/utils/retry.ts
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay } = { ...defaultConfig, ...config };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // リトライ不可エラーの判定
      if (!isRetryable(error)) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt) + Math.random() * 500,
          maxDelay
        );
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof Response) {
    return [429, 503, 504].includes(error.status);
  }
  if (error instanceof Error) {
    return error.message.includes("network") ||
           error.message.includes("timeout") ||
           error.message.includes("ECONNRESET");
  }
  return false;
}
```

### 9.4 エラーUI/UXパターン

```yaml
インラインエラー:
  用途: フォームバリデーション、入力エラー
  表示: 入力フィールド直下に赤文字で表示
  動作: リアルタイムバリデーション

トーストエラー:
  用途: 一時的な操作エラー、リトライ可能なエラー
  表示: 画面下部にスライドイン
  自動消去: 5秒後
  アクション: 「再試行」ボタン（該当する場合）

モーダルエラー:
  用途: 重大なエラー、操作ブロックが必要な場合
  表示: 中央にオーバーレイ表示
  アクション: 「OK」または「再読み込み」

フルページエラー:
  用途: 404、500、認証エラー
  表示: 専用エラーページ
  アクション: 「ホームに戻る」「再ログイン」

オフラインバナー:
  用途: ネットワーク切断時
  表示: 画面上部に固定表示
  動作: オンライン復帰時に自動消去
```

```typescript
// components/error/error-boundary.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // エラーログ送信（Sentry等）
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <h2 className="text-xl font-semibold mb-2">
        問題が発生しました
      </h2>
      <p className="text-muted-foreground mb-4 text-center">
        予期しないエラーが発生しました。
        <br />
        再度お試しいただくか、しばらく経ってからアクセスしてください。
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>再試行</Button>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          ホームに戻る
        </Button>
      </div>
    </div>
  );
}
```

---

## 10. 優先度とリリース計画

### 10.1 フェーズ概要

```
┌─────────────────────────────────────────────────────────────────┐
│                        リリースロードマップ                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: MVP          Phase 2: Growth       Phase 3: Scale    │
│  (8週間)               (8週間)               (継続)             │
│                                                                 │
│  ┌─────────┐          ┌─────────┐          ┌─────────┐         │
│  │コア機能  │    →    │エンゲージ │    →    │拡張・最適化│        │
│  │リリース  │          │メント強化│          │          │         │
│  └─────────┘          └─────────┘          └─────────┘         │
│                                                                 │
│  - 認証                - ゲーミフィケーション  - 多言語対応      │
│  - オンボーディング    - 週次振り返り         - チーム機能       │
│  - 基本対話            - 通知最適化           - コーチマッチング │
│  - 習慣CRUD            - データエクスポート   - API公開          │
│  - 進捗表示            - ダークモード                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Phase 1: MVP（8週間）

#### Week 1-2: 基盤構築

| タスク | 詳細 | 担当 |
|--------|------|------|
| プロジェクトセットアップ | Next.js 16, shadcn/ui, Tailwind | 開発 |
| DB設計・マイグレーション | Turso + Drizzle ORM | 開発 |
| 認証実装 | Better Auth + Google OAuth | 開発 |
| CI/CD構築 | Vercel自動デプロイ | 開発 |
| デザインシステム | コンポーネント基盤 | デザイン |

#### Week 3-4: オンボーディング

| タスク | 詳細 | 担当 |
|--------|------|------|
| ウェルカム画面 | 目的選択UI | 開発 |
| 価値観インタビュー | 対話形式質問フロー | 開発 |
| プロフィール設定 | 基本情報入力 | 開発 |
| AIプロンプト設計 | オンボーディング用 | AI |

#### Week 5-6: AIチャット・習慣機能

| タスク | 詳細 | 担当 |
|--------|------|------|
| チャットUI | モバイル最適化 | 開発 |
| AI対話エンジン | Claude API統合 | 開発 |
| 解決志向プロンプト | 9ステップ対応 | AI |
| 習慣CRUD | 作成・編集・削除 | 開発 |
| 習慣チェック | ワンタップ完了 | 開発 |

#### Week 7-8: 進捗・テスト

| タスク | 詳細 | 担当 |
|--------|------|------|
| カレンダービュー | 月間表示 | 開発 |
| ストリーク表示 | 連続日数 | 開発 |
| 基本通知 | PWA通知 | 開発 |
| E2Eテスト | 主要フロー | QA |
| β版リリース | 限定公開 | 運用 |

**MVP機能スコープ**

```
✅ 含める（P0）:
  - Google認証
  - オンボーディング（目的選択、価値観質問）
  - フリーセッション対話
  - デイリーチェックイン
  - 習慣登録（最大3個）
  - 習慣チェック
  - カレンダービュー
  - ストリーク表示
  - 基本通知

❌ 含めない（Phase 2以降）:
  - ゲーミフィケーション（バッジ、レベル）
  - 週次振り返り
  - 習慣スタッキング設定UI
  - If-Thenプランニング設定UI
  - ダークモード
  - データエクスポート
```

### 10.3 Phase 2: Growth（8週間）

| 週 | 機能 | 詳細 |
|----|------|------|
| Week 9-10 | ゲーミフィケーション | バッジ、レベル、経験値 |
| Week 11-12 | 週次振り返り | 振り返りセッション、サマリー |
| Week 13-14 | 通知最適化 | 時間帯最適化、頻度調整 |
| Week 15-16 | UX改善 | ダークモード、設定拡充 |

### 10.4 Phase 3: Scale（継続）

| 機能 | 詳細 | 優先度 |
|------|------|--------|
| 多言語対応 | 英語、他言語 | P2 |
| Apple Watch連携 | 習慣チェック | P2 |
| チーム機能 | 家族/友人と共有 | P3 |
| プロコーチ連携 | 人間コーチとの協働 | P3 |
| API公開 | 外部サービス連携 | P3 |

### 10.5 マイルストーン

| マイルストーン | 日付 | 基準 |
|---------------|------|------|
| 内部アルファ版 | Week 6 | 基本機能動作確認 |
| クローズドβ版 | Week 8 | 50名限定テスト |
| パブリックβ版 | Week 12 | 一般公開（招待制） |
| 正式リリース v1.0 | Week 16 | 有料プラン開始 |

---

## 11. 成功指標（KPI）

### 11.1 North Star Metric

```
「週に3回以上AIコーチと対話し、1つ以上の習慣を継続しているユーザー数」
```

### 11.2 KPI体系

```
┌─────────────────────────────────────────────────────────────────┐
│                         KPI Dashboard                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   獲得      │  │ アクティベ  │  │  リテンション │             │
│  │ Acquisition │  │   ーション  │  │  Retention   │             │
│  │             │  │ Activation  │  │              │             │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤             │
│  │ 新規登録数  │  │オンボーディ │  │ Day 1: 40%  │             │
│  │ インストール│  │ング完了率  │  │ Day 7: 20%  │             │
│  │ CVR        │  │ 初回対話率  │  │ Day 30: 10% │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │  エンゲージ │  │   収益      │                              │
│  │  Engagement │  │  Revenue    │                              │
│  │             │  │             │                              │
│  ├─────────────┤  ├─────────────┤                              │
│  │ DAU/MAU    │  │ ARPU       │                              │
│  │ セッション数│  │ LTV        │                              │
│  │ 習慣達成率 │  │ 課金率     │                              │
│  └─────────────┘  └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 KPI詳細

#### 獲得（Acquisition）

| 指標 | 定義 | MVP目標 | Phase 2目標 |
|------|------|---------|-------------|
| 新規登録数 | 月間の新規アカウント作成数 | 500/月 | 2,000/月 |
| オーガニック流入率 | 広告以外からの流入割合 | 30% | 50% |
| 招待経由率 | 既存ユーザーからの招待経由 | 10% | 25% |

#### アクティベーション（Activation）

| 指標 | 定義 | MVP目標 | Phase 2目標 |
|------|------|---------|-------------|
| オンボーディング完了率 | 登録→オンボーディング完了 | 60% | 75% |
| 初回対話率 | 登録→初回AI対話完了 | 70% | 85% |
| 習慣設定率 | 登録→初習慣設定完了 | 50% | 65% |
| Time to Value | 登録→価値実感までの時間 | 5分以内 | 3分以内 |

#### リテンション（Retention）

| 指標 | 定義 | MVP目標 | Phase 2目標 |
|------|------|---------|-------------|
| Day 1 Retention | 翌日再訪率 | 40% | 50% |
| Day 7 Retention | 7日後再訪率 | 20% | 30% |
| Day 30 Retention | 30日後再訪率 | 10% | 15% |
| Week 4 習慣継続率 | 4週間後も習慣を続けている率 | 25% | 35% |

#### エンゲージメント（Engagement）

| 指標 | 定義 | MVP目標 | Phase 2目標 |
|------|------|---------|-------------|
| DAU/MAU | 日次/月次アクティブ比率 | 20% | 30% |
| 平均セッション時間 | 1セッションあたりの滞在時間 | 3分 | 5分 |
| 週間対話回数 | ユーザーあたりの対話セッション | 3回 | 5回 |
| 習慣チェック率 | 設定習慣の達成率 | 60% | 70% |
| ストリーク平均 | 連続達成日数の平均 | 5日 | 10日 |

#### 収益（Revenue）※Phase 2以降

| 指標 | 定義 | 目標 |
|------|------|------|
| 有料転換率 | 無料→有料への転換率 | 5% |
| ARPU | ユーザーあたり平均収益 | ¥500/月 |
| LTV | 顧客生涯価値 | ¥6,000 |
| CAC | 顧客獲得コスト | ¥1,000以下 |
| LTV/CAC | 投資対効果 | 6以上 |

### 11.4 品質指標

| 指標 | 定義 | 目標 |
|------|------|------|
| NPS | ネットプロモータースコア | 40以上 |
| CSAT | 顧客満足度スコア | 4.2/5.0以上 |
| App Store評価 | ストアレビュー平均 | 4.5以上 |
| バグ報告数 | 月間のバグ報告件数 | 10件以下 |
| クラッシュフリー率 | クラッシュなしセッション率 | 99.5%以上 |

### 11.5 OKR例（MVP期間）

```
Objective: 習慣化を支援する魅力的なプロダクトをリリースする

Key Results:
  KR1: β版で100名のユーザーを獲得する
  KR2: オンボーディング完了率60%以上を達成する
  KR3: Day 7 Retention 20%以上を達成する
  KR4: ユーザーの習慣達成率60%以上を達成する
  KR5: NPS 30以上を達成する
```

---

## 付録

### A. 用語集

| 用語 | 説明 |
|------|------|
| 解決志向アプローチ | 問題の原因よりも解決策に焦点を当てるコーチング手法 |
| スケーリング | 10点満点で現状を評価する質問技法 |
| 2分ルール | 新しい習慣を2分以内で完了できる形にする原則 |
| 習慣スタッキング | 既存の習慣の後に新しい習慣をつなげる手法 |
| If-Thenプランニング | 「もし〜なら、〜する」形式の行動計画 |
| ストリーク | 習慣の連続達成日数 |

### B. 参考文献

1. 「解決志向ブリーフセラピー」- Insoo Kim Berg
2. 「Atomic Habits」- James Clear
3. 「Hooked」- Nir Eyal
4. 「コーチング・バイブル」- CTI

### C. 環境変数クイックリファレンス

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth クライアントID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth クライアントシークレット |
| `BETTER_AUTH_SECRET` | Yes | Better Auth セッション暗号化キー |
| `TURSO_DATABASE_URL` | Yes | Turso データベースURL |
| `TURSO_AUTH_TOKEN` | Yes | Turso 認証トークン |
| `ANTHROPIC_API_KEY` | Yes | Claude API キー |
| `NEXT_PUBLIC_APP_URL` | Yes | アプリケーションベースURL |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Yes | VAPID 公開鍵（プッシュ通知） |
| `VAPID_PRIVATE_KEY` | Yes | VAPID 秘密鍵 |
| `UPSTASH_REDIS_URL` | Yes | Upstash Redis URL（レート制限） |
| `UPSTASH_REDIS_TOKEN` | Yes | Upstash Redis トークン |

### D. 更新履歴

| バージョン | 日付 | 変更内容 | 担当 |
|-----------|------|---------|------|
| 1.0.0 | 2026-01-27 | 初版作成 | PM |
| 1.1.0 | 2026-01-28 | テックリードレビュー反映: Better Auth設計、Turso/SQLite制約、AIストリーミング、Server/Client境界、エラーハンドリング、PWA詳細、環境変数定義を追加 | PM |

---

**Document End**
