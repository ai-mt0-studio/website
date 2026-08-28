// Playwright automation: capture "input" and "result" screenshots for the free tools
// on the production site (https://ai-mt0-studio.com), saved to images/screenshots/.
// Run with: node scripts/screenshot-tools.js [slug1,slug2,...]
//
// Output filenames match the paths referenced in the tool-screenshot placeholder
// comments inside tools.html, e.g. images/screenshots/<slug>-input.png / -result.png.

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const BASE_URL = 'https://ai-mt0-studio.com';
const OUT_DIR = path.join(__dirname, '..', 'images', 'screenshots');
const VIEWPORT = { width: 1180, height: 860 };

fs.mkdirSync(OUT_DIR, { recursive: true });

async function shotOf(page, slug, name) {
  const file = path.join(OUT_DIR, `${slug}-${name}.png`);
  await page.screenshot({ path: file });
  console.log('  saved', path.relative(process.cwd(), file));
}

async function safeFill(page, selector, value) {
  const loc = page.locator(selector).first();
  if (await loc.count()) await loc.fill(value).catch(() => {});
}
async function safeClick(page, selector) {
  const loc = page.locator(selector).first();
  if (await loc.count()) await loc.click().catch(() => {});
}
async function safeSelect(page, selector, index) {
  const loc = page.locator(selector).first();
  if (await loc.count()) await loc.selectOption({ index }).catch(() => {});
}
// Text-based button matches often hit multiple elements across hidden step panels;
// scope to the one that's actually visible right now.
async function clickVisibleText(page, text) {
  const loc = page.locator(`button:visible:has-text("${text}")`).first();
  if (await loc.count()) await loc.click().catch(() => {});
}

// Generic opt-btn quiz stepper shared by income-simulator / time-simulator / diagnosis.html
async function runOptBtnQuiz(page, { sampleText } = {}) {
  for (let i = 0; i < 15; i++) {
    const step = page.locator('.q-step').filter({ hasNotText: '' }).locator('visible=true').first();
    const visibleStep = page.locator('.q-step:visible').first();
    if (!(await visibleStep.count())) break;

    const textarea = visibleStep.locator('textarea');
    if (await textarea.count()) {
      await textarea.fill(sampleText || '毎月の請求書作成や経理業務に時間がかかっています。');
    }
    const optBtn = visibleStep.locator('.opt-btn').first();
    if (await optBtn.count()) {
      await optBtn.click();
    }
    await page.waitForTimeout(150);

    const nextBtn = visibleStep.locator('button[id^="nextBtn"]:not([disabled])');
    if (await nextBtn.count()) {
      await nextBtn.first().click();
    } else {
      // last step of diagnosis.html uses a plain .btn-diagnose button
      const finishBtn = visibleStep.locator('.btn-diagnose:not([disabled])');
      if (await finishBtn.count()) {
        await finishBtn.first().click();
      } else {
        break;
      }
    }
    await page.waitForTimeout(200);
    if (await page.locator('#resultSection:visible').count()) break;
  }
  await page.waitForTimeout(400);
}

const TOOLS = [
  {
    slug: 'business-os',
    url: '/business-os.html',
    async run(page) {
      await safeClick(page, '.nav-item[data-tab="estimate"]');
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');

      await safeFill(page, '#docToName', '株式会社サンプル商事');
      await safeFill(page, '#docToAddress', '東京都渋谷区〇〇1-2-3');
      const nameInp = page.locator('#itemRows .item-row input[data-f="name"]').first();
      if (await nameInp.count()) {
        await nameInp.fill('AI導入コンサルティング');
        await page.locator('#itemRows .item-row input[data-f="qty"]').first().fill('1');
        await page.locator('#itemRows .item-row input[data-f="price"]').first().fill('150000');
      }
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'sales-mail-tool',
    url: '/sales-mail-tool.html',
    async run(page) {
      await safeFill(page, '#toCompany', '株式会社サンプル物産');
      await safeSelect(page, '#toIndustry', 1);
      await safeFill(page, '#toName', '佐藤 一郎');
      await safeFill(page, '#fromCompany', 'AI MT0 Studio');
      await safeSelect(page, '#fromIndustry', 1);
      await safeFill(page, '#service', '業務効率化AIツールの導入支援');
      await safeFill(page, '#appeal', '導入費用を抑えながら、業務時間を大幅に削減できます。無料デモもご用意しています。');
      await shotOf(page, this.slug, 'input');

      await safeClick(page, 'button:has-text("営業文を生成する")');
      await page.locator('#resultSection').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'contact-manager',
    url: '/contact-manager.html',
    async run(page) {
      await safeClick(page, 'button:has-text("新規登録")');
      await page.waitForTimeout(300);
      await safeFill(page, '#fName', '山田 太郎');
      await safeFill(page, '#fCompany', '株式会社サンプル商事');
      await safeFill(page, '#fIndustry', 'IT・Web制作業');
      await safeFill(page, '#fContact', 'yamada@example.com');
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');

      await safeClick(page, 'button:has-text("ダッシュボードへ")');
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'income-simulator',
    url: '/income-simulator.html',
    async run(page) {
      const firstOpt = page.locator('.q-step:visible .opt-btn').first();
      if (await firstOpt.count()) await firstOpt.click();
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');

      await runOptBtnQuiz(page);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'time-simulator',
    url: '/time-simulator.html',
    async run(page) {
      const firstOpt = page.locator('.q-step:visible .opt-btn').first();
      if (await firstOpt.count()) await firstOpt.click();
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');

      await runOptBtnQuiz(page);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'manual-tool',
    url: '/manual-tool.html',
    async run(page) {
      await safeSelect(page, '#industry', 1);
      await safeFill(page, '#taskName', '新規顧客への見積書作成手順');
      await safeSelect(page, '#target', 1);
      await safeSelect(page, '#frequency', 1);
      await safeSelect(page, '#duration', 1);
      await safeSelect(page, '#difficulty', 1);
      await safeFill(page, '#purpose', 'お客様から見積依頼を受けた際に、正確かつ迅速に見積書を作成・送付するための手順です。');
      await safeFill(page, '#tools', 'パソコン、Excel、会社印鑑、顧客情報リスト');
      await safeFill(page, '#preCheck', '顧客の担当者名、希望納期、数量');
      await safeClick(page, 'button:has-text("手順を追加")');
      await page.waitForTimeout(200);
      const stepInput = page.locator('#stepList input').first();
      if (await stepInput.count()) await stepInput.fill('顧客からの見積依頼内容を確認する');
      await safeFill(page, '#warnings', '金額の入力ミスに注意。必ず上長に確認後、送付すること。');
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');

      await safeClick(page, 'button:has-text("マニュアルを作成する")');
      await page.locator('#resultSection').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'prompt-manager',
    url: '/prompt-manager.html',
    async run(page) {
      await safeClick(page, 'button:has-text("新規作成")');
      await page.waitForTimeout(300);
      await safeFill(page, '#pTitle', 'ブログ記事の導入文を書くプロンプト');
      await safeFill(page, '#pBody', 'あなたはプロのライターです。以下のテーマについて、読者の興味を引く導入文を200文字程度で書いてください。テーマ：{テーマ}');
      await safeFill(page, '#pTags', 'ブログ, 記事, Claude');
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');

      await safeClick(page, 'button:has-text("保存")');
      await page.waitForTimeout(400);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'report-builder',
    url: '/report-builder.html',
    async run(page) {
      await shotOf(page, this.slug, 'input');

      await safeFill(page, '#reportTitle', '7月度 営業報告');
      await safeFill(page, '#reportPeriod', '2026年7月1日〜7月31日');
      await safeFill(page, '#reportAuthor', '営業部 山田');
      await safeClick(page, '#btnAddItem');
      await page.waitForTimeout(200);
      const itemInputs = page.locator('#itemList input[type="text"]');
      if (await itemInputs.count()) await itemInputs.first().fill('新規契約件数');
      const itemNums = page.locator('#itemList input[type="number"]');
      if (await itemNums.count()) await itemNums.first().fill('12');
      await page.waitForTimeout(400);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'advisor-tool',
    url: '/advisor-tool.html',
    async run(page) {
      await safeClick(page, '.sel-btn[data-v="IT・Web"]');
      await clickVisibleText(page, '次へ');
      await page.waitForTimeout(250);

      await safeSelect(page, '#employees', 1);
      await safeSelect(page, '#companySize', 1);
      await safeSelect(page, '#bizYears', 1);
      await safeSelect(page, '#aiExp', 1);
      await clickVisibleText(page, '次へ');
      await page.waitForTimeout(250);

      const checks = page.locator('#problemsGrid .check-item');
      if (await checks.count()) {
        await checks.nth(0).click();
        if (await checks.count() > 1) await checks.nth(1).click();
      }
      await clickVisibleText(page, '次へ');
      await page.waitForTimeout(250);

      await safeFill(page, '#freeText', '毎月の請求書作成に2〜3時間かかっている。Excelで顧客管理しているが検索しにくい。');
      await safeSelect(page, '#overtime', 1);
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');

      await clickVisibleText(page, '無料診断を実行する');
      await page.locator('#resultSection').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'score-diagnosis-tool',
    url: '/diagnosis.html',
    async run(page) {
      const firstOpt = page.locator('.q-step:visible .opt-btn').first();
      if (await firstOpt.count()) await firstOpt.click();
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');

      await runOptBtnQuiz(page, { sampleText: '毎月の請求書・見積書の作成に時間がかかっている、SNS投稿の作成に時間を取られている。' });
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'schedule-builder',
    url: '/schedule-builder.html',
    async run(page) {
      await safeFill(page, '#evTitle', '早番シフト');
      const dateInp = page.locator('#evDate');
      if (await dateInp.count()) {
        const d = new Date(); d.setDate(d.getDate() + 1);
        await dateInp.fill(d.toISOString().slice(0, 10));
      }
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');

      await safeClick(page, 'button:has-text("予定を追加")');
      await page.waitForTimeout(400);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    slug: 'task-priority',
    url: '/task-priority.html',
    async run(page) {
      await safeFill(page, '#taskName', '見積書の作成');
      await safeSelect(page, '#taskUrgent', 1);
      await safeSelect(page, '#taskImportant', 1);
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');

      await safeClick(page, 'button:has-text("タスクを追加")');
      await page.waitForTimeout(400);
      await shotOf(page, this.slug, 'result');
    },
  },
  {
    // Claude APIキー必須 → 前回同様「入力済み画面のみ」を1枚だけ撮影 (-input のみ)
    slug: 'diagnosis-tool',
    url: '/diagnosis-tool.html',
    async run(page) {
      await safeClick(page, '.industry-btn[data-industry="IT・Web"]');
      await clickVisibleText(page, '次へ');
      await page.waitForTimeout(250);
      await safeSelect(page, '#employees', 1);
      await safeSelect(page, '#years', 1);
      await safeSelect(page, '#revenue', 1);
      await safeSelect(page, '#staff', 1);
      await clickVisibleText(page, '次へ');
      await page.waitForTimeout(250);
      const checkItems = page.locator('#problemsGrid .check-item');
      if (await checkItems.count()) {
        await checkItems.nth(0).click();
        if (await checkItems.count() > 1) await checkItems.nth(1).click();
      }
      await clickVisibleText(page, '次へ');
      await page.waitForTimeout(250);
      await safeFill(page, '#details', '毎月の見積書作成に半日かかっている。Excelの管理が複雑でミスが多い。');
      await safeSelect(page, '#aiKnowledge', 1);
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');
    },
  },
  {
    // Claude APIキー必須 → 前回同様「入力済み画面のみ」を1枚だけ撮影 (-input のみ)
    slug: 'report-tool-app',
    url: '/report-tool.html',
    async run(page) {
      const taskInp = page.locator('#taskList .task-row input[type="text"]').first();
      if (await taskInp.count()) await taskInp.fill('〇〇機能の実装とレビュー対応');
      await safeFill(page, '#workHours', '8');
      await safeFill(page, '#tomorrowPlan', '〇〇のレビュー対応、△△ミーティング参加');
      await safeFill(page, '#issues', '〇〇の仕様が不明瞭で進捗が遅れています');
      await page.waitForTimeout(300);
      await shotOf(page, this.slug, 'input');
    },
  },
];

async function main() {
  const only = process.argv[2] ? process.argv[2].split(',') : null;
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT, locale: 'ja-JP' });

  for (const tool of TOOLS) {
    if (only && !only.includes(tool.slug)) continue;
    console.log('==>', tool.slug);
    const page = await context.newPage();
    try {
      await page.goto(BASE_URL + tool.url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(600);
      await tool.run(page);
    } catch (err) {
      console.error('  FAILED', tool.slug, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

main();
