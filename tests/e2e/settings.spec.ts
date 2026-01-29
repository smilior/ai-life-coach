import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:3002";

/**
 * 設定画面E2Eテスト
 * 設定ページの表示とアカウント操作を検証
 */
test.describe("設定", () => {
  test("設定ページが正しく表示される", async ({ page }) => {
    await page.goto("/settings");

    // ページヘッダー (h1)
    await expect(
      page.getByRole("heading", { name: "設定" })
    ).toBeVisible({ timeout: 10000 });

    // ユーザー情報の表示
    await expect(page.getByText("E2Eテスト")).toBeVisible();
  });

  test("通知設定セクションが表示される", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "設定" })
    ).toBeVisible({ timeout: 10000 });

    // CardTitle は div なので getByText を使う
    await expect(page.getByText("通知設定")).toBeVisible();
  });

  test("表示設定セクションが表示される", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "設定" })
    ).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("表示設定")).toBeVisible();
    await expect(page.getByText("ダークモード")).toBeVisible();
  });

  test("アカウントセクションが表示される", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "設定" })
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText("アカウント", { exact: true })
    ).toBeVisible();

    // ログアウトボタン
    await expect(
      page.getByRole("button", { name: /ログアウト/ })
    ).toBeVisible();

    // アカウント削除ボタン
    await expect(
      page.getByRole("button", { name: "アカウント削除" })
    ).toBeVisible();
  });

  test("アプリ情報セクションが表示される", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "設定" })
    ).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("アプリ情報")).toBeVisible();
    await expect(page.getByText("0.1.0")).toBeVisible();
  });

  test("アカウント削除ダイアログが正しく動作する", async ({ page }) => {
    // 削除テスト用に別ユーザーを作成（既存のセッションCookieをクリア）
    await page.context().clearCookies();

    const email = `delete-test-${Date.now()}@test.com`;
    const password = "TestPassword123!";

    const signUpRes = await page.request.post(
      `${BASE}/api/auth/sign-up/email`,
      {
        data: { email, password, name: "削除テスト" },
        headers: { Origin: BASE },
      }
    );
    expect(signUpRes.ok()).toBeTruthy();

    // プロフィール作成
    const profileHeaders: Record<string, string> = { Origin: BASE };
    if (process.env.E2E_TEST_SECRET) {
      profileHeaders["x-e2e-secret"] = process.env.E2E_TEST_SECRET;
    }
    await page.request.post(`${BASE}/api/auth/test-login`, {
      data: { email },
      headers: profileHeaders,
    });

    // sign-inしてセッションCookieを取得
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

    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "設定" })
    ).toBeVisible({ timeout: 10000 });

    // アカウント削除ボタンをクリック
    await page.getByRole("button", { name: "アカウント削除" }).click();

    // ダイアログ表示の確認
    await expect(page.getByText("アカウントを削除しますか？")).toBeVisible();

    // 確認入力なしでは削除ボタンが無効
    const deleteButton = page.getByRole("button", {
      name: "アカウントを削除",
    });
    await expect(deleteButton).toBeDisabled();

    // 「削除」と入力
    await page.locator("#delete-confirm").fill("削除");

    // 削除ボタンが有効になる
    await expect(deleteButton).toBeEnabled();

    // 削除実行
    await deleteButton.click();

    // ホーム画面へリダイレクト（削除後 signOut → router.push("/")）
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
  });
});
