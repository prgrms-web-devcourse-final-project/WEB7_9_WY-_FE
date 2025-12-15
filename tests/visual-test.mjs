import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = './.playwright-mcp/visual-tests';

// Viewport configurations
const viewports = {
  mobile: { width: 375, height: 812, name: 'mobile' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1280, height: 900, name: 'desktop' }
};

// Pages to test
const pages = [
  { path: '/', name: 'calendar' },
  { path: '/artists', name: 'artists' },
  { path: '/party', name: 'party' },
  { path: '/chats', name: 'chats' },
  { path: '/mypage', name: 'mypage' }
];

// Theme modes
const themes = ['light', 'dark'];

async function runVisualTests() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = [];

  console.log('🧪 Starting Visual Layout Tests\n');

  for (const [viewportKey, viewport] of Object.entries(viewports)) {
    console.log(`\n📱 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);

    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: theme
      });
      const page = await context.newPage();

      for (const pageConfig of pages) {
        try {
          // Navigate to page
          await page.goto(`${BASE_URL}${pageConfig.path}`, {
            waitUntil: 'networkidle',
            timeout: 15000
          });

          // Wait for content to render
          await page.waitForTimeout(1000);

          // Take screenshot
          const filename = `${pageConfig.name}-${viewport.name}-${theme}.png`;
          await page.screenshot({
            path: `${SCREENSHOT_DIR}/${filename}`,
            fullPage: false
          });

          // Check layout metrics
          const metrics = await page.evaluate(() => {
            const body = document.body;
            const main = document.querySelector('main') || body;
            const nav = document.querySelector('nav');
            const bottomNav = document.querySelector('[role="navigation"]');
            const sidebar = document.querySelector('[class*="sidebar"]') || document.querySelector('[class*="Sidebar"]');
            const header = document.querySelector('header');

            return {
              bodyWidth: body.scrollWidth,
              bodyHeight: body.scrollHeight,
              viewportWidth: window.innerWidth,
              hasHorizontalOverflow: body.scrollWidth > window.innerWidth + 1,
              navVisible: nav ? window.getComputedStyle(nav).display !== 'none' : false,
              bottomNavVisible: bottomNav ? window.getComputedStyle(bottomNav).display !== 'none' : false,
              sidebarVisible: sidebar ? window.getComputedStyle(sidebar).display !== 'none' : false,
              headerVisible: header ? window.getComputedStyle(header).display !== 'none' : false,
              backgroundColor: window.getComputedStyle(body).backgroundColor,
              textColor: window.getComputedStyle(body).color
            };
          });

          const result = {
            page: pageConfig.name,
            viewport: viewport.name,
            theme,
            screenshot: filename,
            metrics,
            status: metrics.hasHorizontalOverflow ? '⚠️ OVERFLOW' : '✅ OK'
          };

          results.push(result);
          console.log(`  ${result.status} ${pageConfig.name} (${theme}): ${filename}`);

        } catch (error) {
          results.push({
            page: pageConfig.name,
            viewport: viewport.name,
            theme,
            status: '❌ ERROR',
            error: error.message
          });
          console.log(`  ❌ ${pageConfig.name} (${theme}): ${error.message}`);
        }
      }

      await context.close();
    }
  }

  await browser.close();

  // Generate report
  console.log('\n\n📊 Visual Test Report');
  console.log('='.repeat(60));

  // Summary by viewport
  for (const viewport of Object.values(viewports)) {
    console.log(`\n${viewport.name.toUpperCase()} (${viewport.width}px)`);
    console.log('-'.repeat(40));
    const viewportResults = results.filter(r => r.viewport === viewport.name);
    for (const r of viewportResults) {
      const details = [];
      if (r.metrics) {
        if (r.metrics.hasHorizontalOverflow) details.push(`overflow: ${r.metrics.bodyWidth}px`);
        if (r.metrics.sidebarVisible) details.push('sidebar');
        if (r.metrics.bottomNavVisible) details.push('bottomNav');
        if (r.metrics.headerVisible) details.push('header');
      }
      console.log(`  ${r.status} ${r.page} (${r.theme})${details.length ? ` [${details.join(', ')}]` : ''}`);
    }
  }

  // Dark mode color check
  console.log('\n\n🎨 Theme Color Validation');
  console.log('='.repeat(60));
  for (const r of results) {
    if (r.metrics && r.theme === 'dark') {
      const bg = r.metrics.backgroundColor;
      // Check if dark mode has proper dark background
      const isDark = bg.includes('rgb(18') || bg.includes('rgb(0') || bg.includes('rgb(30') || bg.includes('rgb(33');
      console.log(`  ${isDark ? '✅' : '⚠️'} ${r.page} (${r.viewport}): bg=${bg}`);
    }
  }

  // Save JSON report
  await writeFile(
    `${SCREENSHOT_DIR}/report.json`,
    JSON.stringify(results, null, 2)
  );

  console.log(`\n📁 Screenshots saved to: ${SCREENSHOT_DIR}/`);
  console.log(`📋 Report saved to: ${SCREENSHOT_DIR}/report.json`);

  // Check for issues
  const issues = results.filter(r => r.status !== '✅ OK');
  if (issues.length > 0) {
    console.log(`\n⚠️  Found ${issues.length} issue(s)`);
  } else {
    console.log('\n✅ All visual tests passed!');
  }

  return results;
}

runVisualTests().catch(console.error);
