import { test, expect } from "@playwright/test";

/**
 * コーチングE2Eテスト
 * セッション一覧とチャットページの基本動作を検証
 */
test.describe("コーチング", () => {
  test("セッション一覧ページが表示される", async ({ page }) => {
    await page.goto("/coaching");

    // ヘッダー
    await expect(
      page.getByRole("heading", { name: "コーチング" })
    ).toBeVisible({ timeout: 10000 });

    // 新規セッションボタン
    await expect(
      page.getByRole("link", { name: /新規セッション/ })
    ).toBeVisible();

    // コーチ紹介カード
    await expect(page.getByText("AIライフコーチ")).toBeVisible();

    // セッション一覧が読み込まれるのを待つ
    await expect(
      page.getByText("過去のセッション")
    ).toBeVisible({ timeout: 10000 });
  });

  test("チャットページに遷移できる", async ({ page }) => {
    await page.goto("/coaching");

    await page.getByRole("link", { name: /コーチと話す/ }).click();
    await page.waitForURL(/\/coaching\/chat/);

    // チャットUIが表示される
    await expect(
      page.getByRole("heading", { name: "AIコーチ" })
    ).toBeVisible({ timeout: 10000 });

    // メッセージ入力欄
    await expect(page.getByLabel("メッセージ入力")).toBeVisible();

    // 送信ボタン
    await expect(page.getByRole("button", { name: "送信" })).toBeVisible();
  });

  test("メッセージを送信できる", async ({ page }) => {
    await page.goto("/coaching/chat");

    // チャットUI読み込みとセッション作成を待つ
    await expect(page.getByLabel("メッセージ入力")).toBeVisible({
      timeout: 15000,
    });

    // 入力欄が有効になるまで待つ（セッション作成完了後に有効化される）
    await expect(page.getByLabel("メッセージ入力")).toBeEnabled({
      timeout: 15000,
    });

    // メッセージ入力
    await page.getByLabel("メッセージ入力").fill("今日の目標について相談したいです");

    // 送信
    await page.getByRole("button", { name: "送信" }).click();

    // 送信したメッセージが表示される
    await expect(
      page.getByText("今日の目標について相談したいです")
    ).toBeVisible({ timeout: 10000 });
  });

  test("セッション再開で会話履歴が表示される", async ({ page }) => {
    // 1. 新規セッションでメッセージを送信
    await page.goto("/coaching/chat");

    await expect(page.getByLabel("メッセージ入力")).toBeEnabled({
      timeout: 15000,
    });

    await page.getByLabel("メッセージ入力").fill("セッション永続化テスト");
    await page.getByRole("button", { name: "送信" }).click();

    // 送信メッセージが表示されることを確認
    await expect(page.getByText("セッション永続化テスト")).toBeVisible({
      timeout: 10000,
    });

    // AI応答を待つ（モックまたはストリーミング）
    // メッセージが2つ以上になるのを待つ（初回挨拶 + ユーザー + AI応答）
    await page.waitForTimeout(3000);

    // 2. コーチング一覧ページに戻る
    await page.getByRole("button", { name: "戻る" }).click();
    await page.waitForURL(/\/coaching$/);

    // 3. 進行中のセッションが表示されるのを確認
    await expect(page.getByText("進行中のセッション")).toBeVisible({
      timeout: 10000,
    });

    // 「続ける」ボタンでセッション再開
    await page.getByRole("link", { name: "続ける" }).first().click();
    await page.waitForURL(/\/coaching\/chat\?session=/);

    // 4. 再開後のチャットUIが表示される
    await expect(
      page.getByRole("heading", { name: "AIコーチ" })
    ).toBeVisible({ timeout: 10000 });

    // セッション再開バッジが表示される
    await expect(page.getByText("セッション再開")).toBeVisible();

    // 5. 以前のメッセージ履歴が表示される
    await expect(page.getByText("セッション永続化テスト")).toBeVisible({
      timeout: 10000,
    });

    // 入力欄が有効であることを確認（セッション読み込み完了）
    await expect(page.getByLabel("メッセージ入力")).toBeEnabled({
      timeout: 15000,
    });
  });

  test("セッションを手動で終了できる", async ({ page }) => {
    await page.goto("/coaching/chat");

    // チャットUI読み込みを待つ
    await expect(page.getByLabel("メッセージ入力")).toBeEnabled({
      timeout: 15000,
    });

    // メッセージを送信
    await page.getByLabel("メッセージ入力").fill("手動終了テスト");
    await page.getByRole("button", { name: "送信" }).click();

    await expect(page.getByText("手動終了テスト")).toBeVisible({
      timeout: 10000,
    });

    // AI応答を待つ
    await page.waitForTimeout(3000);

    // メニューボタンをクリック
    await page.getByRole("button", { name: "メニュー" }).click();

    // 確認ダイアログが表示される
    await expect(
      page.getByText("セッションを終了しますか？")
    ).toBeVisible({ timeout: 5000 });

    // 終了ボタンをクリック
    await page.getByRole("button", { name: "セッションを終了" }).click();

    // サマリーページに遷移
    await page.waitForURL(/\/coaching\/summary\//, { timeout: 10000 });
  });

  test("セッション終了をキャンセルできる", async ({ page }) => {
    await page.goto("/coaching/chat");

    // チャットUI読み込みを待つ
    await expect(page.getByLabel("メッセージ入力")).toBeEnabled({
      timeout: 15000,
    });

    // メニューボタンをクリック
    await page.getByRole("button", { name: "メニュー" }).click();

    // 確認ダイアログが表示される
    await expect(
      page.getByText("セッションを終了しますか？")
    ).toBeVisible({ timeout: 5000 });

    // キャンセルボタンをクリック
    await page.getByRole("button", { name: "キャンセル" }).click();

    // ダイアログが閉じる
    await expect(
      page.getByText("セッションを終了しますか？")
    ).not.toBeVisible();

    // チャット入力が引き続き使える
    await expect(page.getByLabel("メッセージ入力")).toBeEnabled();
  });
});
