import { test, expect, Page } from "@playwright/test";
import LZString from "lz-string";

async function setEditorValue(page: Page, testId: string, value: string) {
  // Find the editor container and use Monaco's API to set value
  await page.evaluate(
    ({ testId, value }) => {
      const container = document.querySelector(`[data-testid="${testId}"]`);
      if (!container) throw new Error(`Editor ${testId} not found`);
      // Monaco stores editor instance reference - find it through the DOM
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const monaco = (window as any).monaco;
      if (monaco) {
        const editors = monaco.editor.getEditors();
        for (const editor of editors) {
          if (editor.getContainerDomNode() === container) {
            editor.setValue(value);
            return;
          }
        }
      }
      throw new Error(`Monaco editor not found for ${testId}`);
    },
    { testId, value }
  );
}

test.describe("Tsilly Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for Monaco editors to fully load
    await page.waitForSelector("[data-testid='editor-html']", { timeout: 15000 });
    await page.waitForSelector(".monaco-editor .view-lines", { timeout: 15000 });
    // Wait for Monaco global to be available
    await page.waitForFunction(() => (window as any).monaco?.editor?.getEditors()?.length >= 3, {
      timeout: 15000,
    });
  });

  test("HTML editing updates preview", async ({ page }) => {
    const iframe = page.frameLocator("iframe[title='Preview']");

    // Set HTML editor content
    await setEditorValue(page, "editor-html", '<div id="app"><h1>Test HTML Change</h1></div>');

    // Verify preview updated
    await expect(iframe.locator("h1")).toContainText("Test HTML Change", { timeout: 5000 });
  });

  test("CSS editing updates preview", async ({ page }) => {
    const iframe = page.frameLocator("iframe[title='Preview']");

    // First set HTML with an h1 element
    await setEditorValue(page, "editor-html", "<h1>Styled Header</h1>");
    await expect(iframe.locator("h1")).toBeVisible({ timeout: 5000 });

    // Set CSS editor content
    await setEditorValue(page, "editor-css", "h1 { color: rgb(255, 0, 0); }");

    // Wait and check h1 color
    await page.waitForTimeout(500);
    const h1Color = await iframe.locator("h1").evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(h1Color).toBe("rgb(255, 0, 0)");
  });

  test("TypeScript editing updates preview", async ({ page }) => {
    const iframe = page.frameLocator("iframe[title='Preview']");

    // Set TypeScript editor content
    await setEditorValue(page, "editor-typescript", 'document.body.innerHTML = "<p>TS Works</p>";');

    // Verify preview updated
    await expect(iframe.locator("p")).toContainText("TS Works", { timeout: 5000 });
  });

  test("TypeScript error shows in preview", async ({ page }) => {
    const iframe = page.frameLocator("iframe[title='Preview']");

    // Set TypeScript editor content with syntax error
    await setEditorValue(page, "editor-typescript", "const x: number = ;");

    // Check for compilation error in preview
    await expect(iframe.locator("text=Compilation Error")).toBeVisible({ timeout: 5000 });
  });

  test("share button copies URL and loads shared workspace", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // Set custom content in the editors
    await setEditorValue(page, "editor-html", '<div id="app"><h1>Shared Test</h1></div>');
    await setEditorValue(page, "editor-css", "h1 { color: rgb(0, 128, 0); }");
    await setEditorValue(page, "editor-typescript", 'console.log("shared");');

    // Click the share button
    const shareButton = page.getByTitle("Share");
    await shareButton.click();

    // Wait for the "Copied!" state
    await expect(page.getByTitle("Copied!")).toBeVisible({ timeout: 2000 });

    // Get the copied URL from clipboard
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("?code=");

    // Open a new page with the shared URL
    const newPage = await context.newPage();
    await newPage.goto(clipboardText);
    await newPage.waitForSelector("[data-testid='editor-html']", { timeout: 15000 });
    await newPage.waitForSelector(".monaco-editor .view-lines", { timeout: 15000 });
    await newPage.waitForFunction(() => (window as any).monaco?.editor?.getEditors()?.length >= 3, {
      timeout: 15000,
    });

    // Verify the shared content is loaded in the preview
    const iframe = newPage.frameLocator("iframe[title='Preview']");
    await expect(iframe.locator("h1")).toContainText("Shared Test", { timeout: 5000 });

    // Verify CSS is applied
    const h1Color = await iframe.locator("h1").evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(h1Color).toBe("rgb(0, 128, 0)");

    await newPage.close();
  });

  test("direct URL navigation loads workspace correctly", async ({ page }) => {
    // Create a workspace and encode it
    const workspace = {
      html: "<h1>Direct URL Test</h1>",
      css: "h1 { color: rgb(0, 0, 255); }",
      typescript: 'console.log("url loaded");',
    };
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(workspace));
    const urlWithCode = `http://localhost:5173/?code=${encoded}`;

    // Navigate directly to the URL with the code parameter
    await page.goto(urlWithCode);
    await page.waitForSelector("[data-testid='editor-html']", { timeout: 15000 });
    await page.waitForSelector(".monaco-editor .view-lines", { timeout: 15000 });
    await page.waitForFunction(
      () => (window as any).monaco?.editor?.getEditors()?.length >= 3,
      { timeout: 15000 }
    );

    // Verify the content is loaded in the preview
    const iframe = page.frameLocator("iframe[title='Preview']");
    await expect(iframe.locator("h1")).toContainText("Direct URL Test", { timeout: 5000 });

    // Verify CSS is applied
    const h1Color = await iframe.locator("h1").evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(h1Color).toBe("rgb(0, 0, 255)");
  });

  test("save button updates URL with current state", async ({ page }) => {
    // Set custom content in the editors
    await setEditorValue(page, "editor-html", "<h1>Save URL Test</h1>");
    await setEditorValue(page, "editor-css", "h1 { font-size: 24px; }");
    await setEditorValue(page, "editor-typescript", 'const x = "saved";');

    // Get initial URL (should not have code param)
    const initialUrl = page.url();
    expect(initialUrl).not.toContain("?code=");

    // Click the save button using data-testid
    const saveButton = page.locator('[data-testid="save-button"]');
    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await saveButton.click();

    // Wait for the "Saved!" state
    await expect(page.locator('[data-testid="save-button"][title="Saved!"]')).toBeVisible({ timeout: 3000 });

    // Verify URL now contains the code parameter
    await page.waitForFunction(() => window.location.href.includes("?code="), {
      timeout: 3000,
    });
    const newUrl = page.url();
    expect(newUrl).toContain("?code=");

    // Decode and verify the URL contains our content
    const urlObj = new URL(newUrl);
    const encoded = urlObj.searchParams.get("code");
    expect(encoded).not.toBeNull();

    const decoded = JSON.parse(
      LZString.decompressFromEncodedURIComponent(encoded!) || "{}"
    );
    expect(decoded.html).toBe("<h1>Save URL Test</h1>");
    expect(decoded.css).toBe("h1 { font-size: 24px; }");
    expect(decoded.typescript).toBe('const x = "saved";');
  });

  test("refreshing page with URL preserves state", async ({ page }) => {
    // Create a workspace and encode it
    const workspace = {
      html: "<h1>Refresh Test</h1>",
      css: "h1 { color: rgb(128, 0, 128); }",
      typescript: "",
    };
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(workspace));
    const urlWithCode = `http://localhost:5173/?code=${encoded}`;

    // Navigate to the URL
    await page.goto(urlWithCode);
    await page.waitForSelector("[data-testid='editor-html']", { timeout: 15000 });
    await page.waitForSelector(".monaco-editor .view-lines", { timeout: 15000 });
    await page.waitForFunction(
      () => (window as any).monaco?.editor?.getEditors()?.length >= 3,
      { timeout: 15000 }
    );

    // Verify content loaded
    let iframe = page.frameLocator("iframe[title='Preview']");
    await expect(iframe.locator("h1")).toContainText("Refresh Test", { timeout: 5000 });

    // Refresh the page
    await page.reload();
    await page.waitForSelector("[data-testid='editor-html']", { timeout: 15000 });
    await page.waitForSelector(".monaco-editor .view-lines", { timeout: 15000 });
    await page.waitForFunction(
      () => (window as any).monaco?.editor?.getEditors()?.length >= 3,
      { timeout: 15000 }
    );

    // Re-create iframe locator after reload
    iframe = page.frameLocator("iframe[title='Preview']");

    // Verify content is still there (loaded from URL which is preserved)
    await expect(iframe.locator("h1")).toContainText("Refresh Test", { timeout: 5000 });

    // Verify CSS is still applied
    const h1Color = await iframe.locator("h1").evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(h1Color).toBe("rgb(128, 0, 128)");
  });
});
