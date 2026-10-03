import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://youtube.fastsitecheck.com';
const pages = readdirSync(root).filter((name) => name.endsWith('.html'));
const titles = new Set();
const descriptions = new Set();

for (const page of pages) {
  const html = readFileSync(resolve(root, page), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1] || '';
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] || '';
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;

  assert.ok(title.length >= 25 && title.length <= 65, `${page} title length: ${title.length}`);
  assert.ok(description.length >= 100 && description.length <= 170, `${page} description length: ${description.length}`);
  assert.ok(canonical.startsWith(base), `${page} canonical URL`);
  assert.equal(h1Count, 1, `${page} H1 count`);
  assert.ok(!titles.has(title), `${page} duplicate title`);
  assert.ok(!descriptions.has(description), `${page} duplicate description`);
  titles.add(title);
  descriptions.add(description);

  for (const [, href] of html.matchAll(/<a[^>]+href="([^"]+)"/gi)) {
    if (/^(?:https?:|mailto:|#)/.test(href)) continue;
    const file = href.split('#')[0] || 'index.html';
    assert.ok(existsSync(resolve(root, file)), `${page} missing link target: ${href}`);
  }

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    assert.doesNotThrow(() => JSON.parse(json), `${page} JSON-LD`);
  }
}

const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
for (const page of pages.filter((name) => !['privacy.html', 'terms.html'].includes(name))) {
  const expected = page === 'index.html' ? `${base}/` : `${base}/${page}`;
  assert.ok(sitemap.includes(`<loc>${expected}</loc>`), `sitemap missing ${expected}`);
}
assert.ok(readFileSync(resolve(root, 'robots.txt'), 'utf8').includes(`${base}/sitemap.xml`));

console.log(`Site SEO tests passed for ${pages.length} HTML pages.`);
