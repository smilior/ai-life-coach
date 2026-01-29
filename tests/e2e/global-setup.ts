import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");
const BASE = process.env.BASE_URL || "http://localhost:3002";

setup("authenticate", async ({ page }) => {
  const timestamp = Date.now();
  const email = `e2e-${timestamp}@test.com`;
  const password = "TestPassword123!";
  const name = "E2Eテスト";

  // Better Auth でユーザー登録（APIリクエスト）
  const signUpRes = await page.request.post(
    `${BASE}/api/auth/sign-up/email`,
    {
      data: { email, password, name },
      headers: { Origin: BASE },
    }
  );
  expect(signUpRes.ok()).toBeTruthy();

  // オンボーディング完了プロフィールを作成
  const profileHeaders: Record<string, string> = { Origin: BASE };
  if (process.env.E2E_TEST_SECRET) {
    profileHeaders["x-e2e-secret"] = process.env.E2E_TEST_SECRET;
  }
  const profileRes = await page.request.post(
    `${BASE}/api/auth/test-login`,
    { data: { email }, headers: profileHeaders }
  );
  expect(profileRes.ok()).toBeTruthy();

  // ブラウザでログインページにアクセスしてサインイン
  // (APIのsign-upではSet-CookieがSecure属性のためブラウザコンテキストに反映されない場合がある)
  const signInRes = await page.request.post(
    `${BASE}/api/auth/sign-in/email`,
    {
      data: { email, password },
      headers: { Origin: BASE },
    }
  );
  expect(signInRes.ok()).toBeTruthy();

  // ダッシュボードにアクセスして認証確認
  await page.goto("/dashboard");
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });

  // 認証状態を保存
  await page.context().storageState({ path: authFile });
});
