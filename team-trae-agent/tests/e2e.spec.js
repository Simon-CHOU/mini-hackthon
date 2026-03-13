import { test, expect } from '@playwright/test';

test('Web Terminal Time Machine E2E', async ({ page }) => {
  await page.goto('/');

  // Story 1: Basic Interface
  await expect(page.locator('.xterm-screen')).toBeVisible();

  // Story 2: Mock Terminal
  // Type 'echo hello' and Enter
  await page.keyboard.type('echo hello');
  await page.keyboard.press('Enter');
  // Check output
  await expect(page.locator('.xterm-rows')).toContainText('hello');

  // Type 'ls' and Enter
  await page.keyboard.type('ls');
  await page.keyboard.press('Enter');
  // Check output
  await expect(page.locator('.xterm-rows')).toContainText('file1.txt');

  // Story 3 & 4: Record and Replay
  // Clear screen first? Or just continue.
  
  // Start Recording
  await page.click('#record-btn');
  await expect(page.locator('#status')).toContainText('Recording');

  // Type a command
  await page.keyboard.type('echo magic');
  await page.keyboard.press('Enter');

  // Stop Recording
  await page.click('#record-btn');
  await expect(page.locator('#status')).toContainText('Recorded');

  // Start Replay
  await page.click('#replay-btn');
  await expect(page.locator('#status')).toContainText('Replaying');

  // Wait for Replay to finish
  await expect(page.locator('#status')).toHaveText('Replay Finished', { timeout: 10000 });

  // Verify 'echo magic' was replayed and executed
  // Note: Since we cleared terminal on Replay, 'echo magic' should be visible now.
  await expect(page.locator('.xterm-rows')).toContainText('magic');
});
