import assert from 'node:assert/strict';
import {
  analyzeMetadata,
  buildDescription,
  compareMetadata,
  generateChapters,
  generateKeywordIdeas,
  generateTags,
  generateTitles,
  includesPhrase
} from '../assets/seo-engine.mjs';

assert.equal(includesPhrase('YouTube SEO guide', 'youtube seo'), true);
assert.equal(includesPhrase('YouTube SEO guide', ''), false);

const ideas = generateKeywordIdeas('youtube seo', 'small channels');
assert.equal(ideas.length, 15);
assert.ok(ideas.every((idea) => idea.text.includes('youtube seo')));

const titles = generateTitles('rank YouTube videos', 'youtube seo', 'new creators');
assert.equal(titles.length, 8);
assert.ok(titles.every((item) => item.characters <= 100));

const tags = generateTags('youtube seo', 'video ranking, creator tips');
assert.ok(tags.includes('youtube seo'));
assert.equal(new Set(tags).size, tags.length);

const chapters = generateChapters('12:00', 'Introduction\nFind a keyword\nWrite the title\nImprove retention');
assert.equal(chapters.length, 4);
assert.ok(chapters[0].startsWith('00:00'));

const chaptersHuman = generateChapters('12 mins', 'Introduction\nFind a keyword\nWrite the title\nImprove retention');
assert.equal(chaptersHuman.length, 4);
assert.ok(chaptersHuman[0].startsWith('00:00'));

const description = buildDescription({
  topic: 'ranking videos',
  keyword: 'youtube seo',
  audience: 'new creators',
  takeaways: 'Find a clear topic\nPackage the promise\nReview retention',
  chapters: chapters.join('\n')
});
assert.ok(description.toLowerCase().includes('youtube seo'));
assert.ok(description.includes('CHAPTERS'));

const audit = analyzeMetadata({
  keyword: 'youtube seo',
  title: 'YouTube SEO: A Practical Guide for New Creators',
  description,
  tags: tags.join(', '),
  thumbnailText: 'Rank With Clarity',
  spokenHook: 'This YouTube SEO walkthrough shows what to fix first and why it matters.'
});
assert.ok(audit.score >= 70);
assert.equal(audit.counts.tags, tags.length);

// Edge cases and empty inputs
assert.doesNotThrow(() => analyzeMetadata());
assert.doesNotThrow(() => analyzeMetadata({}));
assert.deepEqual(generateKeywordIdeas(''), []);
assert.deepEqual(generateTitles(''), []);
assert.deepEqual(generateTags(''), []);
assert.equal(typeof buildDescription(), 'string');
assert.deepEqual(generateChapters('0:00', 'Intro\nBody'), []);
assert.doesNotThrow(() => compareMetadata());

// Boundary checks & clickbait detection
const clickbaitAudit = analyzeMetadata({
  keyword: 'youtube seo',
  title: 'Guaranteed 100% Secret Trick for Millions of Views!',
  description: 'Short desc',
  tags: 'tag1'
});
const clickbaitCheck = clickbaitAudit.checks.find((c) => c.id === 'accuracy');
assert.equal(clickbaitCheck.passed, false);

// Unicode & uppercase phrase matching
assert.equal(includesPhrase('How to optimize YouTube SEO in 2026', 'YOUTUBE SEO'), true);
assert.equal(includesPhrase('Créer une vidéo YouTube SEO facile', 'YouTube SEO'), true);

// Tag duplication and character budget
const dupTags = generateTags('youtube seo', 'youtube seo, YOUTUBE SEO, video tips');
assert.equal(dupTags.length, new Set(dupTags.map((t) => t.toLowerCase())).size);
assert.ok(dupTags.join(', ').length <= 480);

console.log('SEO engine tests passed (including edge cases & boundary checks).');
