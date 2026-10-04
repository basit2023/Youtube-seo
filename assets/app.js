import {
  analyzeMetadata,
  buildDescription,
  compareMetadata,
  generateChapters,
  generateKeywordIdeas,
  generateTags,
  generateTitles
} from './seo-engine.mjs';

const byId = (id) => document.getElementById(id);
const value = (id) => byId(id)?.value || '';
const escapeHtml = (text) => String(text).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

const stateFields = [
  'studioKeyword', 'studioTitle', 'studioDescription', 'studioTags', 'studioThumbnail', 'studioHook',
  'keywordSeed', 'keywordAudience', 'titleTopic', 'titleKeyword', 'titleAudience', 'descTopic',
  'descKeyword', 'descAudience', 'descTakeaways', 'descLink', 'descCta', 'chapterDuration',
  'chapterOutline', 'thumbnailWords', 'thumbnailTitle', 'compareKeyword', 'yourTitle',
  'yourDescription', 'yourTags', 'theirTitle', 'theirDescription', 'theirTags'
];

function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
}

function switchPanel(name) {
  document.querySelectorAll('.tool-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.panel === name));
  document.querySelectorAll('.tool-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `panel-${name}`));
  history.replaceState(null, '', `#${name}`);
}

document.querySelectorAll('.tool-tab').forEach((tab) => tab.addEventListener('click', () => switchPanel(tab.dataset.panel)));

function studioInput() {
  return {
    keyword: value('studioKeyword'), title: value('studioTitle'), description: value('studioDescription'),
    tags: value('studioTags'), thumbnailText: value('studioThumbnail'), spokenHook: value('studioHook')
  };
}

function renderStudio() {
  const result = analyzeMetadata(studioInput());
  byId('studioScore').textContent = result.score;
  byId('scoreOrbit').style.setProperty('--score', result.score);
  byId('titleCount').textContent = `${result.counts.titleCharacters} / 100`;
  byId('descriptionCount').textContent = `${result.counts.descriptionCharacters.toLocaleString()} / 5,000`;
  const passed = result.checks.filter((item) => item.passed).length;
  byId('auditPassed').textContent = `${passed} of ${result.checks.length} checks ready`;
  byId('auditLabel').textContent = result.score >= 85 ? 'Strong, review for accuracy' : result.score >= 65 ? 'Good base, keep refining' : result.score >= 35 ? 'Several useful fixes remain' : 'Start with the core promise';
  byId('auditProgress').style.width = `${result.score}%`;
  byId('studioChecks').innerHTML = result.checks.map((item) => `
    <article class="check-item ${item.passed ? 'passed' : ''}">
      <span class="check-icon">${item.passed ? '✓' : '→'}</span>
      <div><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.guidance)}</p></div>
      <small>${item.points} pts</small>
    </article>`).join('');
  saveState();
}

byId('studioForm').addEventListener('input', renderStudio);

byId('keywordForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const ideas = generateKeywordIdeas(value('keywordSeed'), value('keywordAudience'));
  byId('keywordResults').innerHTML = ideas.map((idea) => `
    <article class="idea-card"><div><span>${escapeHtml(idea.intent)}</span><strong>${escapeHtml(idea.text)}</strong><small>${escapeHtml(idea.rationale)}</small></div><button type="button" class="use-keyword" data-keyword="${escapeHtml(idea.text)}">Use phrase</button><b>${idea.score}</b></article>`).join('');
  saveState();
});

byId('keywordResults').addEventListener('click', (event) => {
  const button = event.target.closest('.use-keyword');
  if (!button) return;
  byId('studioKeyword').value = button.dataset.keyword;
  byId('titleKeyword').value = button.dataset.keyword;
  renderStudio();
  showToast('Phrase added to SEO Studio and Title Lab');
});

byId('titleForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const titles = generateTitles(value('titleTopic'), value('titleKeyword'), value('titleAudience'));
  byId('titleResults').innerHTML = titles.map((item, index) => `
    <article class="title-result"><span>0${index + 1}</span><div><strong>${escapeHtml(item.title)}</strong><small>${item.characters} characters · ${item.keywordIncluded ? 'target phrase included' : 'phrase variation'}</small></div><button type="button" class="use-title" data-title="${escapeHtml(item.title)}">Use</button></article>`).join('');
  saveState();
});

byId('titleResults').addEventListener('click', (event) => {
  const button = event.target.closest('.use-title');
  if (!button) return;
  byId('studioTitle').value = button.dataset.title;
  byId('thumbnailTitle').value = button.dataset.title;
  renderStudio();
  renderThumbnail();
  showToast('Title added to the Studio and preview');
});

byId('descriptionForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const output = buildDescription({
    topic: value('descTopic'), keyword: value('descKeyword'), audience: value('descAudience'),
    takeaways: value('descTakeaways'), link: value('descLink'), cta: value('descCta'), chapters: value('chapterOutput')
  });
  byId('descriptionOutput').value = output;
  const words = output.split(/\s+/).filter(Boolean).length;
  byId('descriptionMeta').textContent = `${output.length.toLocaleString()} characters · ${words.toLocaleString()} words`;
  byId('studioDescription').value = output;
  if (!value('studioTags') && value('descKeyword')) byId('studioTags').value = generateTags(value('descKeyword')).join(', ');
  renderStudio();
  saveState();
});

byId('chapterForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const chapters = generateChapters(value('chapterDuration'), value('chapterOutline'));
  if (!chapters.length) {
    byId('chapterOutput').value = '';
    showToast('Use a valid duration and at least three sections');
    return;
  }
  byId('chapterOutput').value = chapters.join('\n');
  showToast('Chapter draft created—check it against the final edit');
});

document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
  const output = byId(button.dataset.copy);
  if (!output?.value) return showToast('Create a draft first');
  try {
    await navigator.clipboard.writeText(output.value);
    showToast('Copied to clipboard');
  } catch {
    output.focus();
    output.select();
    showToast('Text selected—press Ctrl+C to copy');
  }
}));

function renderThumbnail() {
  const words = value('thumbnailWords').trim();
  const title = value('thumbnailTitle').trim();
  byId('thumbOverlay').textContent = words || 'Your thumbnail';
  byId('previewTitle').textContent = title || 'Your video title appears here';
  const checked = document.querySelectorAll('[data-thumb-check]:checked').length;
  let score = checked * 18;
  if (words.length >= 2 && words.length <= 28) score += 14;
  if (title.length >= 35 && title.length <= 70) score += 14;
  score = Math.min(100, score);
  byId('thumbnailScore').textContent = `${score}%`;
  byId('thumbnailProgress').style.width = `${score}%`;
  saveState();
}

byId('thumbnailForm').addEventListener('input', renderThumbnail);
byId('thumbnailFile').addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    byId('thumbCanvas').style.backgroundImage = `linear-gradient(90deg, rgba(6,8,14,.72), rgba(6,8,14,.08)), url(${reader.result})`;
  });
  reader.readAsDataURL(file);
});

byId('compareForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const result = compareMetadata(
    { title: value('yourTitle'), description: value('yourDescription'), tags: value('yourTags') },
    { title: value('theirTitle'), description: value('theirDescription'), tags: value('theirTags') },
    value('compareKeyword')
  );
  const metric = (label, left, right) => `<div class="compare-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(left)}</strong><strong>${escapeHtml(right)}</strong></div>`;
  byId('comparisonOutput').innerHTML = `
    <div class="compare-table"><div class="compare-row headings"><span>Signal</span><strong>Your draft</strong><strong>Reference</strong></div>
      ${metric('Title length', `${result.yours.titleCharacters} chars`, `${result.competitor.titleCharacters} chars`)}
      ${metric('Description depth', `${result.yours.descriptionWords} words`, `${result.competitor.descriptionWords} words`)}
      ${metric('Tag count', result.yours.tags, result.competitor.tags)}
      ${metric('Phrase in title', result.yours.keywordInTitle ? 'Yes' : 'No', result.competitor.keywordInTitle ? 'Yes' : 'No')}
      ${metric('Phrase in opening', result.yours.keywordInOpening ? 'Yes' : 'No', result.competitor.keywordInOpening ? 'Yes' : 'No')}
    </div>
    <div class="gap-card"><span>Shared language</span><p>${result.shared.length ? result.shared.map(escapeHtml).join(' · ') : 'No meaningful shared terms yet.'}</p><span>Topics to research—not copy</span><p>${result.gaps.length ? result.gaps.map((term) => `<b>${escapeHtml(term)}</b>`).join(' ') : 'Your draft already covers the reference vocabulary.'}</p></div>`;
  saveState();
});

function saveState() {
  const state = {};
  stateFields.forEach((id) => { if (byId(id)) state[id] = byId(id).value; });
  localStorage.setItem('videoseo-lab-draft', JSON.stringify(state));
}

function restoreState() {
  try {
    const state = JSON.parse(localStorage.getItem('videoseo-lab-draft') || '{}');
    stateFields.forEach((id) => { if (byId(id) && state[id]) byId(id).value = state[id]; });
  } catch { localStorage.removeItem('videoseo-lab-draft'); }
}

byId('loadSampleWorkspace')?.addEventListener('click', () => {
  byId('studioKeyword').value = 'youtube seo for beginners';
  byId('studioTitle').value = 'YouTube SEO for Beginners: Step-by-Step Upload Strategy';
  byId('studioDescription').value = `youtube seo for beginners can feel overwhelming when every creator recommends a different strategy. In this step-by-step walkthrough, I cover how to choose one target search phrase, optimize your video packaging, and structure your introduction for viewer retention.\n\nYOU'LL LEARN\n• How to pick a realistic target search phrase\n• Formatting your title and thumbnail for high CTR\n• Writing opening description lines that give clear context\n• Creating clean video chapters\n\nCHAPTERS\n00:00 Introduction\n01:45 Finding a focused target phrase\n04:30 Writing a clear title promise\n07:15 Structuring the description & chapters\n10:00 Reviewing viewer retention reports\n\nHelpful resource: https://youtube.fastsitecheck.com/about.html\n\nShare what part of YouTube SEO you want covered in the next guide.\n\n#YouTubeSeo #VideoMarketing #CreatorTips`;
  byId('studioTags').value = 'youtube seo for beginners, youtube seo tutorial, video ranking tips, youtube growth strategy, content creator guide';
  byId('studioThumbnail').value = 'Rank Smarter 2026';
  byId('studioHook').value = 'In this video, I will show you how to optimize your YouTube video SEO step by step for better discovery.';
  byId('keywordSeed').value = 'youtube seo for beginners';
  byId('titleTopic').value = 'rank YouTube videos';
  byId('titleKeyword').value = 'youtube seo for beginners';
  byId('descTopic').value = 'youtube seo for beginners';
  byId('descKeyword').value = 'youtube seo for beginners';
  byId('chapterDuration').value = '12:30';
  byId('chapterOutline').value = 'Introduction\nFinding a focused target phrase\nWriting a clear title promise\nStructuring the description & chapters\nReviewing viewer retention reports';
  byId('thumbnailWords').value = 'Rank Smarter 2026';
  byId('thumbnailTitle').value = 'YouTube SEO for Beginners: Step-by-Step Upload Strategy';
  document.querySelectorAll('[data-thumb-check]').forEach((checkbox) => { checkbox.checked = true; });
  renderStudio();
  renderThumbnail();
  saveState();
  showToast('Sample video draft loaded');
});

byId('resetWorkspace').addEventListener('click', () => {
  stateFields.forEach((id) => { if (byId(id)) byId(id).value = ''; });
  document.querySelectorAll('[data-thumb-check]').forEach((checkbox) => { checkbox.checked = false; });
  byId('keywordAudience').value = 'beginners';
  byId('descriptionOutput').value = '';
  byId('chapterOutput').value = '';
  byId('thumbCanvas').style.backgroundImage = '';
  localStorage.removeItem('videoseo-lab-draft');
  renderStudio();
  renderThumbnail();
  showToast('Workspace cleared');
});

restoreState();
document.querySelectorAll('input:not([type="file"]), textarea').forEach((field) => field.addEventListener('change', saveState));
renderStudio();
renderThumbnail();
const initialPanel = location.hash.replace('#', '');
if (['studio', 'keywords', 'titles', 'description', 'chapters', 'thumbnail', 'compare'].includes(initialPanel)) switchPanel(initialPanel);
