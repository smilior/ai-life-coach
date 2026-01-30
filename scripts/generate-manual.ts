/**
 * マニュアル生成スクリプト
 *
 * Playwrightを使って各画面のスクリーンショットを取得し、
 * 重要箇所にハイライト枠とラベルを付けてMarkdownマニュアルを自動生成する。
 *
 * 使い方:
 *   npm run manual:generate
 *
 * 前提:
 *   - ローカルサーバーが起動済み (npm run dev)
 *   - .env.local に必要な環境変数が設定済み
 */

import { chromium, type Page, type BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3002";
const ROOT_DIR = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT_DIR, "docs");
const IMAGES_DIR = path.join(DOCS_DIR, "manual", "images");
const MANUAL_PATH = path.join(DOCS_DIR, "manual.md");

// モバイルビューポート (iPhone 14 相当)
const VIEWPORT = { width: 390, height: 844 };
// Retina 2x で高解像度キャプチャ
const DEVICE_SCALE_FACTOR = 2;

// ハイライト色
const HIGHLIGHT_COLOR = "#FF3B30";
const HIGHLIGHT_BG = "rgba(255, 59, 48, 0.08)";

interface Highlight {
  /** CSSセレクタ */
  selector: string;
  /** ラベルテキスト（例: "① 始めるボタン"） */
  label: string;
}

interface Screenshot {
  section: string;
  title: string;
  filename: string;
  description: string;
}

const captures: Screenshot[] = [];

// ─── ヘルパー ───────────────────────────────────────

function ensureDirs() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

/**
 * Playwright locatorでバウンディングボックスを取得し、
 * 固定位置のオーバーレイ要素で枠線+ラベルを描画する
 */
async function addHighlights(page: Page, highlights: Highlight[]) {
  const boxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }> = [];

  for (const h of highlights) {
    try {
      const locator = page.locator(h.selector).first();
      const box = await locator.boundingBox({ timeout: 2000 });
      if (box) {
        boxes.push({ ...box, label: h.label });
      }
    } catch {
      // セレクタが見つからない場合はスキップ
      console.log(`    ⚠ セレクタ未検出: ${h.selector}`);
    }
  }

  if (boxes.length === 0) return;

  // ページ全体のスクロール量を取得
  const scroll = await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
  }));

  await page.evaluate(
    ({ boxes, color, bg, scroll }) => {
      for (const box of boxes) {
        // 枠線オーバーレイ
        const border = document.createElement("div");
        border.className = "__manual-highlight-box__";
        border.style.cssText = [
          "position: absolute",
          `top: ${box.y + scroll.y - 3}px`,
          `left: ${box.x + scroll.x - 3}px`,
          `width: ${box.width + 6}px`,
          `height: ${box.height + 6}px`,
          `border: 3px solid ${color}`,
          "border-radius: 8px",
          `background: ${bg}`,
          "z-index: 99998",
          "pointer-events: none",
        ].join(";");
        document.body.appendChild(border);

        // ラベル
        const label = document.createElement("div");
        label.textContent = box.label;
        label.className = "__manual-highlight-box__";
        label.style.cssText = [
          "position: absolute",
          `top: ${Math.max(0, box.y + scroll.y - 30)}px`,
          `left: ${box.x + scroll.x - 3}px`,
          `background: ${color}`,
          "color: white",
          "padding: 2px 10px",
          "border-radius: 6px",
          "font-size: 13px",
          "font-weight: bold",
          "z-index: 99999",
          "white-space: nowrap",
          "box-shadow: 0 2px 4px rgba(0,0,0,0.2)",
          "pointer-events: none",
        ].join(";");
        document.body.appendChild(label);
      }
    },
    { boxes, color: HIGHLIGHT_COLOR, bg: HIGHLIGHT_BG, scroll }
  );
}

/**
 * ハイライトを除去する
 */
async function removeHighlights(page: Page) {
  await page.evaluate(() => {
    document
      .querySelectorAll(".__manual-highlight-box__")
      .forEach((el) => el.remove());
  });
}

/**
 * ハイライト付きスクリーンショットを撮影
 */
async function captureWithHighlights(
  page: Page,
  section: string,
  title: string,
  filename: string,
  description: string,
  highlights: Highlight[],
  options?: { fullPage?: boolean }
) {
  // fullPage キャプチャ時に fixed ナビバーがコンテンツに重なるのを防止
  const isFullPage = options?.fullPage ?? true;
  if (isFullPage) {
    await page.evaluate(() => {
      const style = document.createElement("style");
      style.id = "__manual-fix-nav__";
      style.textContent =
        "nav.fixed, nav[class*='fixed'] { position: relative !important; }";
      document.head.appendChild(style);
    });
    await page.waitForTimeout(100);
  }

  if (highlights.length > 0) {
    await addHighlights(page, highlights);
    await page.waitForTimeout(200);
  }

  const filepath = path.join(IMAGES_DIR, filename);
  await page.screenshot({
    path: filepath,
    fullPage: isFullPage,
  });
  captures.push({ section, title, filename, description });
  console.log(
    `  📸 ${section} > ${title} (${highlights.length} highlights)`
  );

  if (highlights.length > 0) {
    await removeHighlights(page);
  }

  // ナビバーのスタイル修正を戻す
  if (isFullPage) {
    await page.evaluate(() => {
      document.getElementById("__manual-fix-nav__")?.remove();
    });
  }
}

async function waitForPageReady(page: Page, timeout = 10000) {
  await page.waitForLoadState("networkidle", { timeout }).catch(() => {});
  await page.waitForTimeout(500);
}

/**
 * 認証用Cookieをcontextに設定する
 */
async function authenticateContext(
  context: BrowserContext,
  email: string,
  password: string
) {
  const page = await context.newPage();

  const signInRes = await page.request.post(
    `${BASE_URL}/api/auth/sign-in/email`,
    {
      data: { email, password },
      headers: { Origin: BASE_URL },
    }
  );

  if (!signInRes.ok()) {
    throw new Error(`Sign-in failed: ${signInRes.status()}`);
  }

  const setCookies = signInRes
    .headersArray()
    .filter((h) => h.name.toLowerCase() === "set-cookie");
  const baseUrl = new URL(BASE_URL);

  for (const header of setCookies) {
    const cookieStr = header.value;
    const [nameValue] = cookieStr.split(";");
    const eqIndex = nameValue.indexOf("=");
    const cookieName = nameValue.substring(0, eqIndex);
    const cookieValue = nameValue.substring(eqIndex + 1);
    await context.addCookies([
      {
        name: cookieName,
        value: cookieValue,
        domain: baseUrl.hostname,
        path: "/",
        secure: baseUrl.protocol === "https:",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  }

  await page.close();
}

// ─── キャプチャセクション ──────────────────────────────

type Browser = Awaited<ReturnType<typeof chromium.launch>>;

/**
 * 1. ランディングページ & ログイン (認証不要)
 */
async function capturePublicPages(browser: Browser) {
  console.log("\n📄 公開ページ");
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR });
  const page = await context.newPage();

  // ランディングページ
  await page.goto(BASE_URL);
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "はじめに",
    "ランディングページ",
    "01-landing.png",
    [
      "- ① **特徴カード**: アプリの3つの特徴（AIコーチとの対話・スモールステップ・習慣化サポート）が表示されます",
      "- ② **「無料で始める」ボタン**: タップするとオンボーディングに進みます",
      "- ③ **「ログイン」ボタン**: 既存アカウントでログインします",
    ].join("\n"),
    [
      { selector: ".space-y-3 > .border", label: "① 特徴カード" },
      { selector: 'a:has-text("無料で始める")', label: "② 無料で始める" },
      { selector: 'a:has-text("ログイン")', label: "③ ログイン" },
    ]
  );

  // ログインページ
  await page.goto(`${BASE_URL}/login`);
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "はじめに",
    "ログインページ",
    "02-login.png",
    [
      "- ① **ログインボタン**: メールアドレスとパスワードを入力してログインします",
      "- ② **ゲストモード**: アカウントなしでお試し利用できます",
    ].join("\n"),
    [
      { selector: 'button:has-text("ログイン"), button:has-text("メールで")', label: "① ログイン" },
      { selector: 'a:has-text("ゲスト")', label: "② ゲストモード" },
    ]
  );

  await context.close();
}

/**
 * 2. オンボーディングフロー (新規ユーザー)
 */
async function captureOnboarding(browser: Browser) {
  console.log("\n📄 オンボーディング");
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR });
  const page = await context.newPage();

  const timestamp = Date.now();
  const email = `manual-${timestamp}@test.com`;
  const password = "ManualTest123!";
  const name = "テストユーザー";

  const signUpRes = await page.request.post(
    `${BASE_URL}/api/auth/sign-up/email`,
    {
      data: { email, password, name },
      headers: { Origin: BASE_URL },
    }
  );

  if (!signUpRes.ok()) {
    console.warn("  ⚠️  ユーザー登録に失敗。オンボーディングはスキップします。");
    await context.close();
    return { email: "", password: "" };
  }

  await authenticateContext(context, email, password);

  // Step 1: ウェルカム
  await page.goto(`${BASE_URL}/onboarding/welcome`);
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "オンボーディング",
    "ステップ1: ウェルカム",
    "03-onboarding-welcome.png",
    [
      "- ① **進行状況バー**: 全5ステップの進捗を示します",
      "- ② **機能紹介カード**: 目標設定・AIコーチング・習慣形成の3つの特徴",
      "- ③ **「始める」ボタン**: タップしてオンボーディングを開始します",
    ].join("\n"),
    [
      { selector: "header", label: "① 進行状況" },
      { selector: "main .space-y-3", label: "② 機能紹介" },
      { selector: 'button:has-text("始める")', label: "③ 始める" },
    ]
  );

  // Step 2: 目的選択
  await page.click('button:has-text("始める")');
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "オンボーディング",
    "ステップ2: 目的選択",
    "04-onboarding-purpose.png",
    [
      "- ① **目的カード**: 3つの目的から1つを選択します",
      "  - **パフォーマンス向上**: キャリアアップやスキル習得",
      "  - **メンタル安定**: ストレス軽減や自己肯定感アップ",
      "  - **変革**: 転職や独立など人生の転機",
      "- ② **ナビゲーション**: 「戻る」「次へ」で移動します",
    ].join("\n"),
    [
      { selector: "main .space-y-3", label: "① 目的カード" },
      { selector: "main .flex.items-center.gap-4", label: "② ナビゲーション" },
    ]
  );

  // 目的を選択した状態
  await page.click("text=パフォーマンス向上");
  await page.waitForTimeout(300);
  await captureWithHighlights(
    page,
    "オンボーディング",
    "ステップ2: 目的を選択した状態",
    "05-onboarding-purpose-selected.png",
    [
      "- ① **選択済みカード**: 選択した目的がハイライトされ、チェックマークが付きます",
      "- ② **「次へ」ボタン**: 目的を選択すると有効化され、次のステップに進めます",
    ].join("\n"),
    [
      { selector: '[data-state="checked"], [aria-pressed="true"], .border-primary', label: "① 選択中" },
      { selector: 'button:has-text("次へ")', label: "② 次へ" },
    ]
  );

  // Step 3: 価値観インタビュー
  await page.click('button:has-text("次へ")');
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "オンボーディング",
    "ステップ3: 価値観インタビュー",
    "06-onboarding-values.png",
    [
      "- ① **質問カード**: 5つの質問が順番に表示されます。質問番号で進捗が分かります",
      "- ② **回答入力欄**: 自由記述で回答します。じっくり考えて入力してください",
    ].join("\n"),
    [
      { selector: "main h1", label: "① 質問" },
      { selector: "textarea", label: "② 回答欄" },
    ]
  );

  // Step 4: 動機の深掘り
  await page.goto(`${BASE_URL}/onboarding/motivation`);
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "オンボーディング",
    "ステップ4: 動機の深掘り",
    "07-onboarding-motivation.png",
    [
      "- ① **選択した目的の表示**: 前のステップで選んだ目的が確認できます",
      "- ② **動機入力欄**: 「なぜその目的が大切か」を自由に記述します。深い理由を書くほどAIコーチの理解が深まります",
    ].join("\n"),
    [
      { selector: 'text=選択した目的 >> xpath=..', label: "① 選択した目的" },
      { selector: "textarea", label: "② 動機入力欄" },
    ]
  );

  // Step 5: 完了画面
  await page.goto(`${BASE_URL}/onboarding/complete`);
  await waitForPageReady(page);
  await page.waitForTimeout(1000);
  await captureWithHighlights(
    page,
    "オンボーディング",
    "ステップ5: 完了",
    "08-onboarding-complete.png",
    [
      "- ① **完了チェックリスト**: 設定した3つの項目（目的・価値観・動機）が完了済みで表示されます",
      "- ② **「ダッシュボードへ」ボタン**: タップするとメイン画面に移動します",
    ].join("\n"),
    [
      { selector: "main .border", label: "① 完了リスト" },
      { selector: 'button:has-text("ダッシュボード")', label: "② ダッシュボードへ" },
    ]
  );

  await context.close();
  return { email, password };
}

/**
 * 3. メインアプリ画面 (認証済みユーザー)
 */
async function captureMainApp(
  browser: Browser,
  _credentials: { email: string; password: string }
) {
  console.log("\n📄 メインアプリ");

  const timestamp = Date.now();
  const email = `manual-main-${timestamp}@test.com`;
  const password = "ManualTest123!";
  const name = "マニュアルユーザー";

  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DEVICE_SCALE_FACTOR });
  const setupPage = await context.newPage();

  const signUpRes = await setupPage.request.post(
    `${BASE_URL}/api/auth/sign-up/email`,
    {
      data: { email, password, name },
      headers: { Origin: BASE_URL },
    }
  );

  if (!signUpRes.ok()) {
    console.warn("  ⚠️  ユーザー登録に失敗。メインアプリのキャプチャをスキップします。");
    await context.close();
    return;
  }

  const profileHeaders: Record<string, string> = { Origin: BASE_URL };
  if (process.env.E2E_TEST_SECRET) {
    profileHeaders["x-e2e-secret"] = process.env.E2E_TEST_SECRET;
  }
  await setupPage.request.post(`${BASE_URL}/api/auth/test-login`, {
    data: { email },
    headers: profileHeaders,
  });

  await setupPage.close();
  await authenticateContext(context, email, password);
  const page = await context.newPage();

  // ── ダッシュボード ──
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForSelector('h1:has-text("さん")', { timeout: 15000 }).catch(() => {});
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "メイン機能",
    "ダッシュボード",
    "09-dashboard.png",
    [
      "- ① **挨拶エリア**: ユーザー名と今日の日付が表示されます",
      "- ② **デイリーチェックイン**: 「今日の気分は？」から気分を選択します",
      "- ③ **コーチングCTA**: 「コーチングを始める」でAIコーチとの対話を開始します",
      "- ④ **ナビゲーションバー**: 各機能（ホーム・コーチング・習慣・進捗・設定）に移動します",
    ].join("\n"),
    [
      { selector: "h1", label: "① 挨拶" },
      { selector: 'text="今日の気分は?"', label: "② チェックイン" },
      { selector: 'a:has-text("コーチングを始める"), button:has-text("コーチングを始める")', label: "③ コーチングCTA" },
      { selector: "nav", label: "④ ナビゲーション" },
    ]
  );

  // ── コーチングトップ ──
  await page.goto(`${BASE_URL}/coaching`);
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "コーチング",
    "コーチングトップ",
    "10-coaching.png",
    [
      "- ① **「新規セッション」ボタン**: 新しいコーチングセッションを開始します",
      "- ② **AIコーチ紹介カード**: AIコーチの説明と「コーチと話す」ボタンがあります",
      "- ③ **セッション履歴**: 過去のセッション一覧が表示されます",
    ].join("\n"),
    [
      { selector: 'a:has-text("新規セッション")', label: "① 新規セッション" },
      { selector: ".bg-gradient-to-r", label: "② AIコーチ紹介" },
      { selector: 'text="過去のセッション"', label: "③ セッション履歴" },
    ]
  );

  // ── コーチングチャット ──
  await page.goto(`${BASE_URL}/coaching/chat`);
  await waitForPageReady(page);
  await page.waitForTimeout(2000);
  await captureWithHighlights(
    page,
    "コーチング",
    "チャット画面",
    "11-coaching-chat.png",
    [
      "- ① **ヘッダー**: 現在のセッション情報（ステップ番号・テーマ）が表示されます",
      "- ② **メッセージエリア**: AIコーチとの対話内容が表示されます",
      "- ③ **入力欄**: メッセージを入力して送信ボタン（矢印）で送ります",
    ].join("\n"),
    [
      { selector: "header, div:has(> button > svg):first-child", label: "① ヘッダー" },
      { selector: 'textarea[aria-label="メッセージ入力"]', label: "③ メッセージ入力" },
    ],
    { fullPage: false }
  );

  // ── 習慣一覧 ──
  await page.goto(`${BASE_URL}/habits`);
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "習慣管理",
    "習慣一覧",
    "12-habits.png",
    [
      "- ① **習慣管理**: 登録した習慣が一覧表示されます。各習慣の達成状況が確認できます",
      "- ② **追加ボタン**: 新しい習慣を追加できます",
    ].join("\n"),
    [
      { selector: "h1", label: "① 習慣管理" },
      { selector: 'a:has-text("追加"), button:has-text("追加")', label: "② 追加ボタン" },
    ]
  );

  // ── 新規習慣作成 ──
  await page.goto(`${BASE_URL}/habits/new`);
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "習慣管理",
    "新規習慣作成",
    "13-habits-new.png",
    [
      "- ① **入力フォーム**: 習慣名・説明・頻度などの詳細を入力します",
      "- ② **保存ボタン**: 入力後に保存して習慣を登録します",
    ].join("\n"),
    [
      { selector: "form, main form", label: "① 入力フォーム" },
      { selector: 'button[type="submit"], button:has-text("保存"), button:has-text("作成"), button:has-text("登録")', label: "② 保存" },
    ]
  );

  // ── 進捗ページ ──
  await page.goto(`${BASE_URL}/progress`);
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "進捗確認",
    "進捗ページ",
    "14-progress.png",
    [
      "- ① **進捗・統計**: 習慣の達成状況やストリーク（連続達成日数）を確認できます",
      "- ② **KPIカード**: 達成率・完了回数・習慣数を一覧で確認できます",
    ].join("\n"),
    [
      { selector: "h1", label: "① 進捗・統計" },
      { selector: ".grid.grid-cols-3", label: "② KPIカード" },
    ]
  );

  // ── 設定ページ ──
  await page.goto(`${BASE_URL}/settings`);
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "設定",
    "設定ページ",
    "15-settings.png",
    [
      "- ① **プロフィールセクション**: ユーザー名とアイコンが表示されます",
      "- ② **設定項目**: 通知・ダークモード・アカウント情報などを変更できます",
    ].join("\n"),
    [
      { selector: ".flex.items-center.gap-3:has(span), .flex.items-center.gap-4:has(span)", label: "① プロフィール" },
      { selector: "main .space-y-1, main .space-y-2", label: "② 設定項目" },
    ]
  );

  // ── プロフィール編集 ──
  await page.goto(`${BASE_URL}/settings/profile`);
  await waitForPageReady(page);
  await captureWithHighlights(
    page,
    "設定",
    "プロフィール編集",
    "16-settings-profile.png",
    [
      "- ① **ニックネーム入力**: 表示名を変更できます",
      "- ② **目的の変更**: オンボーディングで設定した目的を変更できます",
      "- ③ **保存ボタン**: 変更を保存します",
    ].join("\n"),
    [
      { selector: 'input[name="nickname"], input:first-of-type', label: "① ニックネーム" },
      { selector: 'button:has-text("パフォーマンス向上"), button:has-text("メンタル安定")', label: "② 目的選択" },
      { selector: 'button:has-text("保存")', label: "③ 保存" },
    ]
  );

  await context.close();
}

// ─── Markdown 生成 ────────────────────────────────

function generateMarkdown(): string {
  const sections = new Map<string, Screenshot[]>();

  for (const cap of captures) {
    if (!sections.has(cap.section)) {
      sections.set(cap.section, []);
    }
    sections.get(cap.section)!.push(cap);
  }

  const lines: string[] = [];
  lines.push("# AIライフコーチ ユーザーマニュアル");
  lines.push("");
  lines.push("> このマニュアルはPlaywrightにより自動生成されたスクリーンショットを元に作成されています。");
  lines.push("> 画面上の赤い枠線とラベルが、各機能の場所を示しています。");
  lines.push("");

  // 目次
  lines.push("## 目次");
  lines.push("");
  let sectionIdx = 1;
  for (const [sectionName, items] of sections) {
    lines.push(
      `${sectionIdx}. [${sectionName}](#${sectionIdx}-${encodeSection(sectionName)})`
    );
    for (const item of items) {
      lines.push(`   - [${item.title}](#${encodeTitle(item.title)})`);
    }
    sectionIdx++;
  }
  lines.push("");

  lines.push("---");
  lines.push("");

  // セクション
  sectionIdx = 1;
  for (const [sectionName, items] of sections) {
    lines.push(`## ${sectionIdx}. ${sectionName}`);
    lines.push("");

    for (const item of items) {
      lines.push(`### ${item.title}`);
      lines.push("");
      lines.push(`![${item.title}](manual/images/${item.filename})`);
      lines.push("");
      lines.push(item.description);
      lines.push("");
    }

    sectionIdx++;
  }

  // フッター
  lines.push("---");
  lines.push("");
  lines.push(`*最終更新: ${new Date().toLocaleDateString("ja-JP")}*`);
  lines.push("");

  return lines.join("\n");
}

function encodeSection(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function encodeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[:：\s]+/g, "-")
    .replace(/-+/g, "-");
}

// ─── メイン ────────────────────────────────────────

async function main() {
  console.log("🚀 マニュアル生成を開始します...");
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Output:   ${MANUAL_PATH}`);
  console.log(`   Images:   ${IMAGES_DIR}`);

  ensureDirs();

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. 公開ページ
    await capturePublicPages(browser);

    // 2. オンボーディング
    const onboardingCreds = await captureOnboarding(browser);

    // 3. メインアプリ
    await captureMainApp(browser, onboardingCreds);

    // Markdown生成
    const markdown = generateMarkdown();
    fs.writeFileSync(MANUAL_PATH, markdown, "utf-8");

    console.log(`\n✅ マニュアル生成完了!`);
    console.log(`   📄 ${MANUAL_PATH}`);
    console.log(`   🖼️  ${captures.length} 枚のスクリーンショット`);
  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
