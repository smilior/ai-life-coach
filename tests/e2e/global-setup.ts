import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");
const BASE = "http://localhost:3002";

setup("authenticate", async ({ page }) => {
  const timestamp = Date.now();
  const email = `e2e-${timestamp}@test.com`;
  const password = "TestPassword123!";
  const name = "E2Eテスト";

  // Better Auth でユーザー登録（セッションCookieも自動設定される）
  const signUpRes = await page.request.post(
    `${BASE}/api/auth/sign-up/email`,
    { data: { email, password, name } }
  );
  expect(signUpRes.ok()).toBeTruthy();

  // オンボーディング完了プロフィールを作成
  const profileRes = await page.request.post(
    `${BASE}/api/auth/test-login`,
    { data: { email } }
  );
  expect(profileRes.ok()).toBeTruthy();

  // ダッシュボードにアクセスして認証確認
  await page.goto("/dashboard");
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });

  // 認証状態を保存
  await page.context().storageState({ path: authFile });
});
