import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { chromium, Browser, Page, BrowserContext } from "playwright";
import fs from "fs/promises";
import path from "path";
import {
  cleanXData,
  saveCleanedData,
  CleanedData,
} from "../utils/x-data-processor";

// Types
type ToolResponse = {
  success: boolean;
  message: string;
  error?: string;
  data?: CleanedData;
};

// Configuration
const CONFIG = {
  auth: {
    email: "ahmaddraw6@gmail.com",
    username: "shiinoo854283",
    password: "A66h2002",
  },
  browser: {
    viewport: { width: 1280, height: 720 },
    slowMo: 1000,
    headless: false,
  },
  urls: {
    login: "https://x.com/i/flow/login",
    listBase: "https://x.com/i/lists",
  },
  timeouts: {
    input: 30000,
    navigation: 2000,
  },
  paths: {
    bronze: "data/bronze",
    gold: "data/gold",
  },
};

// Input Schema
const XScraperInputSchema = z.object({
  outputPath: z.string().optional().default("x-data.json"),
  listId: z.string().default("1885044904994234805"),
});

// Helper Functions
async function ensureOutputDirectories(
  fileName: string
): Promise<{ bronzePath: string; goldPath: string }> {
  const projectRoot = process.cwd();
  const bronzeDir = path.resolve(projectRoot, CONFIG.paths.bronze);
  const goldDir = path.resolve(projectRoot, CONFIG.paths.gold);

  // Ensure both directories exist
  for (const dir of [bronzeDir, goldDir]) {
    try {
      await fs.access(dir, fs.constants.W_OK);
      console.log(`[X-Scraper] Directory ${dir} exists and is writable`);
    } catch {
      console.log(`[X-Scraper] Creating directory at ${dir}`);
      await fs.mkdir(dir, { recursive: true });
    }
  }

  return {
    bronzePath: path.resolve(bronzeDir, fileName),
    goldPath: path.resolve(goldDir, fileName),
  };
}

async function setupBrowser(): Promise<{
  browser: Browser;
  context: BrowserContext;
  page: Page;
}> {
  console.log('[X-Scraper] Setting up browser with config:', JSON.stringify(CONFIG.browser));
  const browser = await chromium.launch(CONFIG.browser);
  console.log('[X-Scraper] Browser launched successfully');

  const context = await browser.newContext({
    viewport: CONFIG.browser.viewport,
  });
  console.log('[X-Scraper] Browser context created with viewport:', CONFIG.browser.viewport);

  const page = await context.newPage();
  console.log('[X-Scraper] New page created');

  await page.route("**/*", (route) => route.continue());
  console.log('[X-Scraper] Page routing configured');

  return { browser, context, page };
}

async function handleAuthentication(page: Page): Promise<void> {
  console.log('[X-Scraper] Navigating to login page:', CONFIG.urls.login);
  await page.goto(CONFIG.urls.login);
  console.log('[X-Scraper] Starting authentication');

  // Email step
  console.log('[X-Scraper] Waiting for email input field...');
  const emailInput = await page.waitForSelector(
    'input[autocomplete="username"]',
    { state: "visible", timeout: CONFIG.timeouts.input }
  );
  console.log('[X-Scraper] Email input field found, filling with:', CONFIG.auth.email);
  await emailInput.fill(CONFIG.auth.email);
  console.log('[X-Scraper] Clicking Next button');
  await page.click('span:has-text("Next")');
  console.log('[X-Scraper] Waiting for navigation timeout:', CONFIG.timeouts.navigation);
  await page.waitForTimeout(CONFIG.timeouts.navigation);

  // Handle unusual activity check
  console.log('[X-Scraper] Checking for unusual activity prompt...');
  const hasUnusualActivity = await page.evaluate(() =>
    document.body.textContent?.includes("There was unusual login activity")
  );
  console.log('[X-Scraper] Unusual activity detected:', hasUnusualActivity);

  if (hasUnusualActivity) {
    console.log('[X-Scraper] Handling unusual activity check');
    console.log('[X-Scraper] Waiting for username input field...');
    const usernameInput = await page.waitForSelector(
      'input[autocomplete="on"]',
      { state: "visible", timeout: CONFIG.timeouts.input }
    );
    console.log('[X-Scraper] Username input field found, filling with:', CONFIG.auth.username);
    await usernameInput.fill(CONFIG.auth.username);
    console.log('[X-Scraper] Clicking Next button');
    await page.click('span:has-text("Next")');
    console.log('[X-Scraper] Waiting for navigation timeout:', CONFIG.timeouts.navigation);
    await page.waitForTimeout(CONFIG.timeouts.navigation);
  }

  // Password step
  await page.waitForSelector('input[type="password"]', {
    state: "visible",
    timeout: CONFIG.timeouts.input,
  });
  await page.fill('input[type="password"]', CONFIG.auth.password);
  await page.click('span:has-text("Log in")');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: CONFIG.timeouts.input });
}

async function saveRawResponse(
  data: unknown,
  outputPath: string
): Promise<void> {
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2), "utf-8");
  const stats = await fs.stat(outputPath);
  console.log(
    `[X-Scraper] Raw data saved successfully to ${outputPath}! File size: ${stats.size} bytes`
  );
}

// Main Tool
export const xScraperTool = createTool({
  id: "x-list-scraper",
  description:
    "Scrapes posts from an X list and returns cleaned data with post content, owner, and publish date",
  inputSchema: XScraperInputSchema,
  execute: async ({ context }): Promise<ToolResponse> => {
    console.log('[X-Scraper] Starting execution with context:', JSON.stringify(context));
    const { outputPath, listId } = context;
    let browser: Browser | undefined;

    try {
      console.log('[X-Scraper] Initializing scraping process for list ID:', listId);
      // Ensure output directories exist and get file paths
      const { bronzePath, goldPath } =
        await ensureOutputDirectories(outputPath);
      console.log('[X-Scraper] Output directories configured:', { bronzePath, goldPath });

      // Setup browser
      console.log('[X-Scraper] Setting up browser instance...');
      const { browser: b, page } = await setupBrowser();
      browser = b;

      // Handle authentication
      await handleAuthentication(page);

      // Navigate to list and wait for data
      const listUrl = `${CONFIG.urls.listBase}/${listId}`;
      console.log('[X-Scraper] Navigating to list URL:', listUrl);
      await page.goto(listUrl);
      console.log('[X-Scraper] Waiting for ListLatestTweetsTimeline response...');
      const response = await page.waitForResponse(
        (res) => {
          const matches = res.url().includes("ListLatestTweetsTimeline") && res.status() === 200;
          console.log('[X-Scraper] Response intercepted:', {
            url: res.url(),
            status: res.status(),
            matches
          });
          return matches;
        }
      );
      console.log('[X-Scraper] Received list data response');

      // Extract data from response
      const responseData = await response.json();

      // Save raw data to bronze layer
      await saveRawResponse(responseData, bronzePath);

      // Clean and save processed data to gold layer
      const cleanedData = await cleanXData(responseData);
      await saveCleanedData(cleanedData, goldPath);

      // Close browser
      await browser.close();

      // Return success message with cleaned data
      return {
        success: true,
        message: `Successfully processed X data:\n- Raw data saved to: ${bronzePath}\n- Cleaned data saved to: ${goldPath}`,
        data: cleanedData,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error(`[X-Scraper] Error: ${errorMessage}`);

      if (browser) {
        await browser.close();
      }

      return {
        success: false,
        message: `Failed to scrape X: ${errorMessage}`,
        error: errorMessage,
      };
    }
  },
});
