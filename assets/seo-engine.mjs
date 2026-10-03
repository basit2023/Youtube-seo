const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in',
  'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'with', 'your'
]);

const clean = (value = '') => String(value).replace(/\s+/g, ' ').trim();
const lower = (value = '') => clean(value).toLocaleLowerCase();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function includesPhrase(text, phrase) {
  const target = clean(phrase);
  if (!target) return false;
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(target)}([^\\p{L}\\p{N}]|$)`, 'iu').test(clean(text));
}

export function meaningfulWords(value) {
  return lower(value)
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

function check(id, label, passed, points, guidance) {
  return { id, label, passed: Boolean(passed), points, guidance };
}

export function analyzeMetadata(input = {}) {
  const keyword = clean(input.keyword);
  const title = clean(input.title);
  const description = String(input.description || '').trim();
  const tags = splitTags(input.tags);
  const thumbnailText = clean(input.thumbnailText);
  const spokenHook = clean(input.spokenHook);
  const firstLines = description.split(/\r?\n/).slice(0, 3).join(' ');
  const titleWords = title.split(/\s+/).filter(Boolean).length;
  const descriptionWords = description.split(/\s+/).filter(Boolean).length;
  const keywordNearStart = keyword && lower(title).indexOf(lower(keyword)) >= 0 && lower(title).indexOf(lower(keyword)) <= 24;
  const chapterLines = description.split(/\r?\n/).filter((line) => /^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}\s+\S/.test(line));
  const uniqueTags = new Set(tags.map(lower));

  const checks = [
    check('keyword', 'A clear target phrase is defined', keyword.length >= 2, 8, 'Choose one specific phrase that matches the viewer’s problem or goal.'),
    check('title-length', 'Title is readable and within YouTube’s limit', title.length >= 35 && title.length <= 70, 10, 'Aim for roughly 35–70 characters while staying under YouTube’s 100-character maximum.'),
    check('title-words', 'Title gives enough context', titleWords >= 5 && titleWords <= 14, 5, 'Use enough words to explain the promise without turning the title into a sentence.'),
    check('title-keyword', 'Target phrase appears naturally in the title', includesPhrase(title, keyword), 12, 'Use the exact phrase only when it reads naturally and accurately describes the video.'),
    check('title-front', 'Target phrase appears early in the title', keywordNearStart, 5, 'Lead with the subject when possible; do not sacrifice clarity just to move a phrase.'),
    check('description-depth', 'Description adds useful context', descriptionWords >= 80, 10, 'Explain the outcome, key lessons, resources, and next step in original language.'),
    check('description-limit', 'Description stays within 5,000 characters', description.length > 0 && description.length <= 5000, 4, 'YouTube allows up to 5,000 characters. Remove repetition before cutting useful context.'),
    check('description-keyword', 'Target phrase appears in the opening lines', includesPhrase(firstLines, keyword), 10, 'Mention the main topic naturally before the viewer has to expand the description.'),
    check('spoken-hook', 'Opening hook supports the title promise', spokenHook.length >= 20 && includesPhrase(spokenHook, keyword), 8, 'Say what the viewer will learn early, using natural words that match the topic.'),
    check('tags', 'Tags are focused rather than stuffed', tags.length >= 3 && tags.length <= 12, 5, 'Use a small set of exact, variant, topical, and common-misspelling tags.'),
    check('tag-unique', 'Tags are unique', uniqueTags.size === tags.length && tags.length > 0, 3, 'Remove duplicated tags; repetition does not create extra relevance.'),
    check('chapters', 'Description includes valid-looking chapters', chapterLines.length >= 3 && /^(?:00:00|0:00)\s+/m.test(description), 7, 'Use at least three ascending timestamps, start at 00:00, and keep chapters at least 10 seconds apart.'),
    check('thumbnail', 'Thumbnail copy is short and distinct', thumbnailText.length >= 2 && thumbnailText.length <= 28, 8, 'Use a short complementary message instead of repeating the full title.'),
    check('accuracy', 'Title avoids obvious clickbait patterns', !/(guaranteed|100% guaranteed|secret trick|instant millions|you won.?t believe)/i.test(title) && title.length > 0, 5, 'Make a compelling promise you can deliver. Misleading packaging damages retention and trust.')
  ];

  const score = checks.reduce((total, item) => total + (item.passed ? item.points : 0), 0);
  const total = checks.reduce((sum, item) => sum + item.points, 0);
  return {
    score: Math.round((score / total) * 100),
    checks,
    counts: {
      titleCharacters: title.length,
      descriptionCharacters: description.length,
      descriptionWords,
      tags: tags.length,
      tagCharacters: tags.join(', ').length,
      chapters: chapterLines.length
    }
  };
}

export function splitTags(value = '') {
  const raw = Array.isArray(value) ? value : String(value).split(/[,\n]/);
  return raw.map(clean).filter(Boolean);
}

export function generateKeywordIdeas(seed, audience = 'beginners') {
  const topic = clean(seed);
  if (!topic) return [];
  const templates = [
    { intent: 'Learn', text: `${topic} tutorial for ${audience}` },
    { intent: 'Learn', text: `how to ${topic} step by step` },
    { intent: 'Learn', text: `${topic} explained simply` },
    { intent: 'Solve', text: `${topic} mistakes to avoid` },
    { intent: 'Solve', text: `why ${topic} is not working` },
    { intent: 'Solve', text: `${topic} troubleshooting guide` },
    { intent: 'Compare', text: `best ${topic} tools` },
    { intent: 'Compare', text: `${topic} vs alternatives` },
    { intent: 'Compare', text: `${topic} comparison for ${audience}` },
    { intent: 'Act', text: `${topic} checklist` },
    { intent: 'Act', text: `${topic} setup from scratch` },
    { intent: 'Act', text: `${topic} workflow that saves time` },
    { intent: 'Proof', text: `${topic} case study` },
    { intent: 'Proof', text: `${topic} before and after` },
    { intent: 'Fresh', text: `${topic} guide 2026` }
  ];
  return templates.map((item, index) => ({
    ...item,
    score: Math.max(58, 91 - index * 2 + (item.text.split(' ').length >= 4 ? 3 : 0)),
    rationale: item.text.split(' ').length >= 4 ? 'Specific intent and useful long-tail framing' : 'Broad discovery phrase'
  }));
}

export function generateTitles(topic, keyword, audience = 'beginners') {
  const subject = clean(topic) || clean(keyword);
  const phrase = clean(keyword) || subject;
  if (!subject) return [];
  const candidates = [
    `${phrase}: A Practical Guide for ${audience}`,
    `How to ${subject} Step by Step (Without the Guesswork)`,
    `${subject} Explained: What Actually Matters`,
    `I Tested This ${subject} Workflow — Here’s What Worked`,
    `${subject}: 7 Mistakes That Hold ${audience} Back`,
    `Before You Try ${subject}, Watch This`,
    `The Simple ${subject} Checklist I Use Every Time`,
    `${phrase} From Scratch: A Clear, Repeatable Process`
  ];
  return [...new Set(candidates.map(clean))].map((title) => ({
    title: title.slice(0, 100),
    characters: Math.min(title.length, 100),
    keywordIncluded: includesPhrase(title, phrase)
  }));
}

export function generateTags(keyword, related = '') {
  const phrase = clean(keyword);
  if (!phrase) return [];
  const words = meaningfulWords(phrase);
  const extras = splitTags(related);
  const suggestions = [
    phrase,
    `${phrase} tutorial`,
    `${phrase} for beginners`,
    `how to ${phrase}`,
    `${phrase} tips`,
    `${phrase} guide`,
    ...extras,
    ...words.filter((word) => word.length > 3)
  ];
  const unique = [];
  const seen = new Set();
  for (const tag of suggestions) {
    const normalized = lower(tag);
    if (!normalized || seen.has(normalized)) continue;
    if ([...unique, tag].join(', ').length > 480) break;
    seen.add(normalized);
    unique.push(clean(tag));
  }
  return unique.slice(0, 12);
}

export function buildDescription({ topic, keyword, audience, takeaways, link, cta, chapters } = {}) {
  const subject = clean(topic) || clean(keyword) || 'this topic';
  const phrase = clean(keyword) || subject;
  const viewer = clean(audience) || 'creators';
  const points = String(takeaways || '')
    .split(/\r?\n/)
    .map((line) => clean(line.replace(/^[-*•]\s*/, '')))
    .filter(Boolean);
  const learning = points.length
    ? points.map((point) => `• ${point}`).join('\n')
    : `• Understand the core ${subject} process\n• Avoid the mistakes that waste time\n• Apply a clear next step after watching`;
  const resource = clean(link) ? `\n\nHelpful resource: ${clean(link)}` : '';
  const chapterBlock = clean(chapters) ? `\n\nCHAPTERS\n${String(chapters).trim()}` : '';
  const closing = clean(cta) || `Share the part of ${phrase} you want me to cover next.`;
  return `${phrase} can feel complicated when every guide gives different advice. In this video, I break the process into practical steps for ${viewer}, explain what deserves attention first, and show how to make decisions without relying on shortcuts or empty promises.\n\nYOU’LL LEARN\n${learning}${chapterBlock}${resource}\n\n${closing}\n\n#${hashtag(phrase)} #YouTubeTips #ContentStrategy`.slice(0, 5000);
}

export function hashtag(value) {
  return clean(value).replace(/[^\p{L}\p{N}]+/gu, '');
}

function parseDuration(value) {
  const raw = clean(value);
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) return Number(raw) * 60;
  const parts = raw.split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function timestamp(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours) return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function generateChapters(duration, outline = '') {
  const totalSeconds = parseDuration(duration);
  const labels = String(outline)
    .split(/\r?\n/)
    .map((line) => clean(line.replace(/^[-*•\d.)\s]+/, '')))
    .filter(Boolean);
  if (!totalSeconds || labels.length < 3 || totalSeconds < labels.length * 10) return [];
  const interval = totalSeconds / labels.length;
  return labels.map((label, index) => `${timestamp(index * interval)} ${label}`);
}

export function compareMetadata(yours = {}, competitor = {}, keyword = '') {
  const summarize = (data) => {
    const title = clean(data.title);
    const description = String(data.description || '').trim();
    const tags = splitTags(data.tags);
    return {
      titleCharacters: title.length,
      descriptionWords: description.split(/\s+/).filter(Boolean).length,
      tags: tags.length,
      keywordInTitle: includesPhrase(title, keyword),
      keywordInOpening: includesPhrase(description.split(/\r?\n/).slice(0, 3).join(' '), keyword),
      terms: new Set([...meaningfulWords(title), ...meaningfulWords(description), ...tags.flatMap(meaningfulWords)])
    };
  };
  const left = summarize(yours);
  const right = summarize(competitor);
  const shared = [...left.terms].filter((term) => right.terms.has(term));
  const gaps = [...right.terms].filter((term) => !left.terms.has(term)).slice(0, 12);
  return { yours: left, competitor: right, shared, gaps };
}
