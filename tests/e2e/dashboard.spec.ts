import { test, expect } from "@playwright/test";

/**
 * ダッシュボードE2Eテスト
 * オンボーディング済みユーザーでダッシュボード表示を検証
 */
test.describe("ダッシュボード", () => {
  test("ダッシュボードが正しく表示される", async ({ page }) => {
    await page.goto("/dashboard");

    // グリーティングにユーザー名が表示される
    await expect(
      page.getByRole("heading", {
        name: /E2Eテストさん$/,
      })
    ).toBeVisible({ timeout: 10000 });

    // 日付表示
    await expect(
      page.getByText(/^\d{4}年\d{1,2}月\d{1,2}日/)
    ).toBeVisible();
  });

  test("習慣が空の場合、空状態メッセージが表示される", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /さん$/ })
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText("習慣がまだ登録されていません")
    ).toBeVisible();
  });

  test("デイリーチェックインが表示される", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /さん$/ })
    ).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("今日の気分は?")).toBeVisible();
    await expect(page.getByRole("button", { name: "良い" })).toBeVisible();
    await expect(page.getByRole("button", { name: "普通" })).toBeVisible();
  });

  test("コーチングCTAが表示され、遷移できる", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /さん$/ })
    ).toBeVisible({ timeout: 10000 });

    const coachingLink = page.getByRole("link", {
      name: /コーチングを始める/,
    });
    await expect(coachingLink).toBeVisible();

    await coachingLink.click();
    await page.waitForURL(/\/coaching/);
  });
});
