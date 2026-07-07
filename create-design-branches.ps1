$ErrorActionPreference = "Stop"

function Write-Concept {
  param(
    [string]$Branch,
    [string]$CommitMessage,
    [string]$ConceptName,
    [string]$HeroEyebrow,
    [string]$Intro,
    [string]$Css
  )

  Write-Host ""
  Write-Host "Creating $Branch..." -ForegroundColor Cyan
  git checkout -B $Branch main

  $html = Get-Content "index.html" -Raw
  $html = $html -replace '<p class="eyebrow">Household Receipts 2\.0</p>', "<p class=""eyebrow"">$HeroEyebrow</p>"
  $html = $html -replace 'Track the invisible work that keeps your household running\. Log what got done, who did it, and how much time it took\.', $Intro
  Set-Content "index.html" $html

  $baseCss = git show main:styles.css
  Set-Content "styles.css" ($baseCss + "`n`n/* $ConceptName concept */`n" + $Css)

  git add index.html styles.css
  git commit -m $CommitMessage
  git push -u origin $Branch
}

git fetch origin
git checkout main
git pull --ff-only origin main
if (-not (git tag --list v2.0-original)) {
  git tag v2.0-original
  git push origin v2.0-original
} else {
  Write-Host "Tag v2.0-original already exists. Continuing..." -ForegroundColor Yellow
}

$softCss = @'
:root {
  --bg: #f8f2ea;
  --surface: #fffaf4;
  --surface-strong: #ffffff;
  --ink: #302820;
  --muted: #7a6e62;
  --line: #eadfd1;
  --accent: #557c70;
  --accent-2: #c1775b;
  --accent-3: #8d7bb6;
  --soft-green: #eaf3ef;
  --soft-clay: #fdebe3;
  --shadow: 0 24px 80px rgba(82, 61, 42, 0.13);
}

body {
  background: linear-gradient(160deg, #fffaf2 0%, #f6eee3 48%, #eef3ee 100%);
}

.hero {
  align-content: center;
}

.phone-frame {
  border-radius: 38px;
  background: rgba(255, 250, 244, 0.82);
}

.app-header,
.panel,
.tabs,
.metric-card,
.report-stat,
.receipt-card {
  border-color: rgba(203, 184, 162, 0.7);
}

.metric-card,
.report-stat,
.receipt-card {
  box-shadow: 0 10px 28px rgba(87, 66, 46, 0.08);
}

.btn,
input,
select,
textarea,
.tab {
  border-radius: 18px;
}
'@

$boldCss = @'
:root {
  --bg: #111417;
  --surface: #171c20;
  --surface-strong: #20272c;
  --ink: #f7f3ea;
  --muted: #b9c0bf;
  --line: #334047;
  --accent: #38b68d;
  --accent-2: #ff8a5c;
  --accent-3: #7aa7ff;
  --soft-green: #17382e;
  --soft-clay: #3a241d;
  --shadow: 0 26px 90px rgba(0, 0, 0, 0.45);
}

body {
  background: linear-gradient(135deg, #0f1215 0%, #171d22 55%, #252019 100%);
}

.hero {
  min-height: 34vh;
}

.phone-frame {
  border-color: #3f4b52;
  background: rgba(16, 20, 23, 0.92);
}

.app-header,
.panel,
.tabs,
.metric-card,
.report-stat,
.receipt-card {
  background: var(--surface);
  border-color: var(--line);
}

.metric-card.mine {
  background: linear-gradient(135deg, #15372d, #1d4f3f);
}

.metric-card.partner {
  background: linear-gradient(135deg, #3a211b, #553326);
}

.btn.secondary,
input,
select,
textarea {
  background: #101417;
  color: var(--ink);
}

.tab.active {
  background: var(--accent);
  color: #06110d;
}
'@

$appleCss = @'
:root {
  --bg: #f5f5f7;
  --surface: #ffffff;
  --surface-strong: #ffffff;
  --ink: #1d1d1f;
  --muted: #6e6e73;
  --line: #d9d9de;
  --accent: #0071e3;
  --accent-2: #bf5b3f;
  --accent-3: #5856d6;
  --soft-green: #eef6ff;
  --soft-clay: #fff2ed;
  --shadow: 0 18px 60px rgba(0, 0, 0, 0.12);
}

body {
  background: #f5f5f7;
}

h1 {
  font-weight: 800;
  letter-spacing: 0;
}

.phone-frame {
  border-radius: 42px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.15);
}

.app-header,
.panel,
.tabs,
.metric-card,
.report-stat,
.receipt-card {
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(60, 60, 67, 0.16);
}

.btn {
  border-radius: 999px;
}

.btn.primary,
.tab.active {
  background: #0071e3;
}

input,
select,
textarea {
  border-radius: 12px;
  background: #fbfbfd;
}
'@

$playfulCss = @'
:root {
  --bg: #fff7e8;
  --surface: #fffaf0;
  --surface-strong: #ffffff;
  --ink: #2e271c;
  --muted: #776b5b;
  --line: #ead6ba;
  --accent: #2f7f6f;
  --accent-2: #df6157;
  --accent-3: #f2b84b;
  --soft-green: #e0f4ea;
  --soft-clay: #ffe2d5;
  --shadow: 0 24px 72px rgba(139, 83, 36, 0.16);
}

body {
  background: linear-gradient(135deg, #fff8e9 0%, #ffe9dc 44%, #e6f4ed 100%);
}

.tagline {
  color: #df6157;
}

.phone-frame {
  border-radius: 30px;
  transform: rotate(-0.4deg);
}

.panel,
.metric-card,
.report-stat,
.receipt-card {
  border-width: 2px;
}

.metric-card.mine {
  background: #dff5e9;
}

.metric-card.partner {
  background: #ffe3d5;
}

.btn.primary {
  background: linear-gradient(135deg, #2f7f6f, #3f9f8a);
}

.tab.active {
  background: #df6157;
}

.person-badge {
  border: 2px solid rgba(47, 127, 111, 0.18);
}
'@

Write-Concept `
  -Branch "look/soft-modern" `
  -CommitMessage "Create soft modern design concept" `
  -ConceptName "Soft modern" `
  -HeroEyebrow "Soft modern concept" `
  -Intro "A calm, polished way to track what got done, who did it, and how much invisible work it took." `
  -Css $softCss

Write-Concept `
  -Branch "look/bold-saas" `
  -CommitMessage "Create bold SaaS dashboard concept" `
  -ConceptName "Bold SaaS" `
  -HeroEyebrow "Bold SaaS concept" `
  -Intro "A sharper dashboard for tracking household labor like the operational system it actually is." `
  -Css $boldCss

Write-Concept `
  -Branch "look/apple-minimal" `
  -CommitMessage "Create Apple-style minimal concept" `
  -ConceptName "Apple minimal" `
  -HeroEyebrow "Apple minimal concept" `
  -Intro "A clean, quiet app experience for logging household work without extra noise." `
  -Css $appleCss

Write-Concept `
  -Branch "look/playful-family" `
  -CommitMessage "Create playful family dashboard concept" `
  -ConceptName "Playful family" `
  -HeroEyebrow "Playful family concept" `
  -Intro "A warmer, cheekier dashboard for counting the everyday work that somehow keeps happening." `
  -Css $playfulCss

git checkout main
Write-Host ""
Write-Host "Done. Four design branches are pushed to GitHub." -ForegroundColor Green
