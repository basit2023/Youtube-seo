import {
  analyzeMetadata,
  buildDescription,
  compareMetadata,
  generateChapters,
  generateKeywordIdeas,
  generateTags,
  generateTitles
} from './seo-engine.mjs';

const mount = document.getElementById('focusedTool');
const tool = document.body.dataset.tool;
const esc = (value) => String(value).replace(/[&<>'"]/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
const get = (id) => document.getElementById(id)?.value || '';
const row = (label, value) => `<div class="result-line"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;
const output = (html) => { document.getElementById('focusedOutput').innerHTML = html; };

const configs = {
  seo: {
    heading: 'Check the complete upload package',
    note: 'Every point has a visible reason. The score measures preparation, not ranking probability.',
    form: `<label>Target phrase<input id="keyword" required placeholder="youtube seo for beginners"></label><label>Thumbnail words<input id="thumbnail" placeholder="Rank Smarter"></label><label class="wide">Video title<input id="title" maxlength="100" required placeholder="YouTube SEO: A Practical Guide for New Creators"></label><label class="wide">Description<textarea id="description" rows="6" required></textarea></label><label class="wide">Tags<textarea id="tags" rows="3"></textarea></label><label class="wide">Opening hook<input id="hook" placeholder="Tell the viewer what they will learn"></label>`,
    action: 'Check my video SEO',
    run() {
      const result = analyzeMetadata({keyword:get('keyword'), title:get('title'), description:get('description'), tags:get('tags'), thumbnailText:get('thumbnail'), spokenHook:get('hook')});
      output(`<h3>Your preparation score: <b>${result.score}/100</b></h3>${result.checks.map((item) => row(item.label, item.passed ? 'Ready' : 'Improve')).join('')}`);
    }
  },
  keywords: {
    heading: 'Map one topic across viewer intent',
    note: 'Opportunity scores describe specificity and intent. They are not invented search-volume estimates.',
    form: `<label>Seed topic<input id="seed" required placeholder="edit videos on phone"></label><label>Audience<input id="audience" value="beginners"></label>`,
    action: 'Generate keyword angles',
    run() { output(generateKeywordIdeas(get('seed'), get('audience')).map((item) => row(`${item.intent}: ${item.text}`, `${item.score}/100`)).join('')); }
  },
  titles: {
    heading: 'Create accurate title directions',
    note: 'Use the options as editorial starting points, then make the wording sound like your channel.',
    form: `<label>Video topic<input id="topic" required placeholder="rank YouTube videos"></label><label>Target phrase<input id="keyword" placeholder="youtube seo"></label><label class="wide">Audience<input id="audience" placeholder="small channels"></label>`,
    action: 'Generate title ideas',
    run() { output(generateTitles(get('topic'), get('keyword'), get('audience')).map((item) => row(item.title, `${item.characters} characters`)).join('')); }
  },
  descriptions: {
    heading: 'Build a useful video description',
    note: 'The draft starts with context, explains the value, and gives viewers a natural next step.',
    form: `<label>Video topic<input id="topic" required placeholder="ranking YouTube videos"></label><label>Target phrase<input id="keyword" placeholder="youtube seo"></label><label>Audience<input id="audience" placeholder="new creators"></label><label>Helpful link<input id="link" type="url" placeholder="https://example.com/resource"></label><label class="wide">Key takeaways, one per line<textarea id="takeaways" rows="5"></textarea></label><label class="wide">Closing invitation<input id="cta" placeholder="Tell me what you want covered next"></label>`,
    action: 'Build my description',
    run() { const text = buildDescription({topic:get('topic'),keyword:get('keyword'),audience:get('audience'),takeaways:get('takeaways'),link:get('link'),cta:get('cta')}); output(`<textarea id="copyOutput" readonly>${esc(text)}</textarea><button class="focused-copy" type="button" data-copy>Copy description</button>`); }
  },
  tags: {
    heading: 'Create a focused set of YouTube tags',
    note: 'Tags have a limited discovery role. Use them for close variations, context, and common wording differences.',
    form: `<label class="wide">Main target phrase<input id="keyword" required placeholder="youtube seo"></label><label class="wide">Related phrases, comma separated<textarea id="related" rows="4" placeholder="video ranking, creator tips, youtube search"></textarea></label>`,
    action: 'Generate focused tags',
    run() { const tags = generateTags(get('keyword'), get('related')); output(`<textarea id="copyOutput" readonly>${esc(tags.join(', '))}</textarea><p>${tags.length} unique tags · ${tags.join(', ').length} characters</p><button class="focused-copy" type="button" data-copy>Copy tags</button>`); }
  },
  chapters: {
    heading: 'Turn an outline into starting timestamps',
    note: 'The generator spaces sections evenly. Adjust every timestamp against the finished video before publishing.',
    form: `<label class="wide">Video duration<input id="duration" required placeholder="12:30 or 45"></label><label class="wide">Outline, one section per line<textarea id="outline" required rows="7" placeholder="Introduction&#10;Choose the topic&#10;Write the title&#10;Review the upload"></textarea></label>`,
    action: 'Create video chapters',
    run() { const chapters = generateChapters(get('duration'), get('outline')); output(chapters.length ? `<textarea id="copyOutput" readonly>${esc(chapters.join('\n'))}</textarea><button class="focused-copy" type="button" data-copy>Copy chapters</button>` : '<p>Add a valid duration and at least three sections. Each generated chapter must have room for ten seconds or more.</p>'); }
  },
  thumbnail: {
    heading: 'Check whether the thumbnail supports the title',
    note: 'This quick review focuses on clarity and promise alignment. Use the full workspace for an image preview.',
    form: `<label class="wide">Video title<input id="title" maxlength="100" required></label><label class="wide">Thumbnail words<input id="words" maxlength="40" required></label><label><input class="inline-check" type="checkbox" id="contrast"> Strong contrast</label><label><input class="inline-check" type="checkbox" id="subject"> Clear subject</label><label><input class="inline-check" type="checkbox" id="accurate"> Accurate promise</label><label><input class="inline-check" type="checkbox" id="mobile"> Readable on mobile</label>`,
    action: 'Check thumbnail readiness',
    run() { const words=get('words').trim(); const title=get('title').trim(); const checks=['contrast','subject','accurate','mobile'].filter((id)=>document.getElementById(id).checked).length; const score=Math.min(100,checks*18+(words.length>=2&&words.length<=28?14:0)+(title.length>=35&&title.length<=70?14:0)); output(`<h3>Thumbnail readiness: <b>${score}%</b></h3>${row('Thumbnail copy', words.length <= 28 ? 'Concise' : 'Shorten it')}${row('Title length', `${title.length}/100`)}${row('Manual checks', `${checks}/4`)}`); }
  },
  compare: {
    heading: 'Compare topic coverage without copying',
    note: 'The tool surfaces language gaps as research prompts. Your final angle and wording should remain original.',
    form: `<label class="wide">Target phrase<input id="keyword" required></label><label>Your title<input id="yourTitle" required></label><label>Reference title<input id="theirTitle" required></label><label>Your description<textarea id="yourDescription" rows="5"></textarea></label><label>Reference description<textarea id="theirDescription" rows="5"></textarea></label><label>Your tags<textarea id="yourTags" rows="3"></textarea></label><label>Reference tags<textarea id="theirTags" rows="3"></textarea></label>`,
    action: 'Compare metadata',
    run() { const result=compareMetadata({title:get('yourTitle'),description:get('yourDescription'),tags:get('yourTags')},{title:get('theirTitle'),description:get('theirDescription'),tags:get('theirTags')},get('keyword')); output(`${row('Your title length', `${result.yours.titleCharacters} characters`)}${row('Reference title length', `${result.competitor.titleCharacters} characters`)}${row('Your description', `${result.yours.descriptionWords} words`)}${row('Reference description', `${result.competitor.descriptionWords} words`)}<p><b>Research gaps:</b> ${esc(result.gaps.join(', ') || 'No clear vocabulary gaps found.')}</p>`); }
  }
};

const config = configs[tool];
if (mount && config) {
  mount.innerHTML = `<h2>${esc(config.heading)}</h2><p>${esc(config.note)}</p><form class="focused-form" id="focusedForm">${config.form}<button class="button primary" type="submit">${esc(config.action)}</button></form><div class="focused-output" id="focusedOutput" aria-live="polite"></div>`;
  document.getElementById('focusedForm').addEventListener('submit', (event) => { event.preventDefault(); config.run(); });
  mount.addEventListener('click', async (event) => {
    if (!event.target.closest('[data-copy]')) return;
    const field = document.getElementById('copyOutput');
    try { await navigator.clipboard.writeText(field.value); event.target.textContent = 'Copied'; }
    catch { field.focus(); field.select(); event.target.textContent = 'Press Ctrl+C'; }
  });
}
