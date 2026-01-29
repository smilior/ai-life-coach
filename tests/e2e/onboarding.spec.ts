import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:3002";

/**
 * オンボーディングE2Eテスト
 * 新規ユーザーが5ステップのオンボーディングを完了してダッシュボードに到達する
 */
test.describe("オンボーディング", () => {
  // 独自の認証状態を使う（オンボーディング未完了ユーザー）
  test.use({ storageState: { cookies: [], origins: [] } });

  test("新規ユーザーがオンボーディングを完了してダッシュボードに到達する", async ({
    page,
  }) => {
    const email = `onboarding-${Date.now()}@test.com`;
    const password = "TestPassword123!";
    const name = "オンボーディングテスト";

    // Better Auth でユーザー登録
    const signUpRes = await page.request.post(
      `${BASE}/api/auth/sign-up/email`,
      {
        data: { email, password, name },
        headers: { Origin: BASE },
      }
    );
    expect(signUpRes.ok()).toBeTruthy();

    // sign-inしてセッションCookieを取得（HTTPS環境ではCookieを手動設定）
    const signInRes = await page.request.post(
      `${BASE}/api/auth/sign-in/email`,
      {
        data: { email, password },
        headers: { Origin: BASE },
      }
    );
    expect(signInRes.ok()).toBeTruthy();

    // Set-CookieヘッダーからセッションCookieを抽出してブラウザに設定
    const setCookies = signInRes.headersArray().filter(h => h.name.toLowerCase() === "set-cookie");
    const baseUrl = new URL(BASE);
    for (const header of setCookies) {
      const cookieStr = header.value;
      const [nameValue] = cookieStr.split(";");
      const eqIndex = nameValue.indexOf("=");
      const cookieName = nameValue.substring(0, eqIndex);
      const cookieValue = nameValue.substring(eqIndex + 1);
      await page.context().addCookies([{
        name: cookieName,
        value: cookieValue,
        domain: baseUrl.hostname,
        path: "/",
        secure: baseUrl.protocol === "https:",
        httpOnly: true,
        sameSite: "Lax",
      }]);
    }

    // ダッシュボードへアクセス → オンボーディング未完了なのでリダイレクト
    await page.goto("/dashboard");
    await page.waitForURL(/\/onboarding/, { timeout: 10000 });

    // Step 0: ウェルカムページ
    await page.goto("/onboarding/welcome");
    await expect(
      page.getByRole("heading", { name: "AIライフコーチへようこそ" })
    ).toBeVisible();
    await page.getByRole("button", { name: "始める" }).click();

    // Step 1: 目的選択
    await page.waitForURL(/\/onboarding\/purpose/);
    await expect(
      page.getByRole("heading", { name: "あなたの目的は？" })
    ).toBeVisible();

    // 「パフォーマンス向上」を選択
    await page
      .locator("div[role='button']")
      .filter({ hasText: "パフォーマンス向上" })
      .click();
    await page.getByRole("button", { name: "次へ" }).click();

    // Step 2: 価値観インタビュー（5問）
    await page.waitForURL(/\/onboarding\/values/);
    await expect(
      page.getByRole("heading", { name: "価値観インタビュー" })
    ).toBeVisible();

    const valueAnswers = [
      "プログラミングに夢中になりました",
      "朝早く起きて運動し、集中して仕事をする理想の1日",
      "世界一周旅行に挑戦したい",
      "誠実さ、成長、自由",
      "新しいスキルを身につけて自信がついた変化",
    ];

    for (let i = 0; i < 5; i++) {
      await expect(page.locator("textarea")).toBeVisible();
      await page.locator("textarea").fill(valueAnswers[i]);

      if (i < 4) {
        await page.getByRole("button", { name: "次へ" }).click();
      } else {
        await page.getByRole("button", { name: "完了" }).click();
      }
    }

    // Step 3: 動機の深掘り
    await page.waitForURL(/\/onboarding\/motivation/);
    await expect(
      page.getByRole("heading", { name: "動機を深掘りしましょう" })
    ).toBeVisible();

    await page
      .locator("textarea")
      .fill("自分の可能性を最大限に引き出したいからです");
    await page.getByRole("button", { name: "次へ" }).click();

    // Step 4: 完了ページ
    await page.waitForURL(/\/onboarding\/complete/);
    await expect(
      page.getByRole("heading", { name: "おめでとうございます！" })
    ).toBeVisible();

    // 完了項目の確認
    await expect(page.getByText("目的の設定")).toBeVisible();
    await expect(page.getByText("価値観の明確化")).toBeVisible();
    await expect(page.getByText("動機の深掘り")).toBeVisible();

    // ダッシュボードへ遷移
    await page.getByRole("button", { name: /ダッシュボードへ/ }).click();

    // ダッシュボード到達確認
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: /さん$/ })
    ).toBeVisible({ timeout: 10000 });
  });
});
