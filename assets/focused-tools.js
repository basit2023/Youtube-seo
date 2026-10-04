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
    note: 'Review wording, visual clarity, title alignment, and preview your thumbnail image directly on the page.',
    form: `<label class="wide">Video title<input id="title" maxlength="100" placeholder="e.g. YouTube SEO Guide for Beginners" required></label><label class="wide">Thumbnail words<input id="words" maxlength="40" placeholder="e.g. Rank Smarter" required></label><label class="wide">Thumbnail image (optional)<input id="focusedThumbFile" type="file" accept="image/png,image/jpeg,image/webp"></label><label><input class="inline-check" type="checkbox" id="contrast"> Strong contrast</label><label><input class="inline-check" type="checkbox" id="subject"> Clear subject</label><label><input class="inline-check" type="checkbox" id="accurate"> Accurate promise</label><label><input class="inline-check" type="checkbox" id="mobile"> Readable on mobile</label>`,
    action: 'Check thumbnail readiness',
    run() {
      const words = get('words').trim();
      const title = get('title').trim();
      const checks = ['contrast', 'subject', 'accurate', 'mobile'].filter((id) => document.getElementById(id)?.checked).length;
      const score = Math.min(100, checks * 18 + (words.length >= 2 && words.length <= 28 ? 14 : 0) + (title.length >= 35 && title.length <= 70 ? 14 : 0));
      output(`<h3>Thumbnail readiness: <b>${score}%</b></h3><div class="youtube-preview" style="margin: 15px 0;"><div class="thumb-canvas" id="focusedThumbCanvas" style="aspect-ratio:16/9; display:flex; align-items:center; padding:20px; border-radius:10px; background-color:#222737; background-image:linear-gradient(145deg,#202737,#0c0f17); background-size:cover; background-position:center; overflow:hidden;"><span style="font:800 28px var(--font-display); text-transform:uppercase; text-shadow:0 2px 10px rgba(0,0,0,.7);">${esc(words || 'Your thumbnail')}</span></div><div class="preview-copy"><div class="avatar"></div><div><strong>${esc(title || 'Your title here')}</strong><span>Your channel · 1.2K views · 2 hours ago</span></div></div></div>${row('Thumbnail copy', words.length <= 28 ? 'Concise' : 'Shorten it')}${row('Title length', `${title.length}/100`)}${row('Manual checks', `${checks}/4`)}`);
      const fileInput = document.getElementById('focusedThumbFile');
      if (fileInput?.files?.[0]) {
        const reader = new FileReader();
        reader.onload = () => {
          const canvas = document.getElementById('focusedThumbCanvas');
          if (canvas) canvas.style.backgroundImage = `linear-gradient(90deg, rgba(6,8,14,.72), rgba(6,8,14,.08)), url(${reader.result})`;
        };
        reader.readAsDataURL(fileInput.files[0]);
      }
    }
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
    const btn = event.target.closest('[data-copy]');
    if (!btn) return;
    const field = document.getElementById('copyOutput');
    if (!field) return;
    const originalText = btn.dataset.originalText || btn.textContent;
    btn.dataset.originalText = originalText;
    try {
      await navigator.clipboard.writeText(field.value);
      btn.textContent = 'Copied!';
    } catch {
      field.focus();
      field.select();
      btn.textContent = 'Press Ctrl+C';
    }
    setTimeout(() => { btn.textContent = originalText; }, 2000);
  });
}
