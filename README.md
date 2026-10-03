# VideoSEO Lab

VideoSEO Lab is a standalone, dependency-free YouTube SEO planning workspace. It was informed by the workflows creators expect from established products, but its interface, copy, scoring model, and implementation are original.

## Included in this MVP

- Transparent 100-point video metadata and packaging audit
- Search-intent keyword map without invented volume data
- Human-readable title angle generator
- Description builder with takeaways, resources, calls to action, and chapters
- Focused tag generator that reflects YouTube's limited role for tags
- Valid chapter timestamp generator
- Local thumbnail preview and readiness checklist
- Side-by-side metadata and topical-gap comparison
- Automatic local draft saving with a visible reset control
- Responsive landing page, FAQ, About, Privacy, and Terms pages
- Structured data and indexable metadata for the eventual production site

## Run locally

From this directory:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080/`.

Use localhost or HTTPS because browsers commonly restrict JavaScript modules and clipboard access on direct `file://` pages.

## Test

```powershell
node tests/seo-engine.test.mjs
```

The tests use Node's built-in assertion library and require no package installation.

## Before production launch

1. Confirm the final brand name and purchase a matching domain.
2. Add canonical URLs, an Open Graph image, favicon assets, `robots.txt`, and a sitemap using that real domain.
3. Replace the starter legal-page operator and contact language with final business details.
4. Self-host the fonts if performance or privacy requirements call for it.
5. Add analytics or advertising only after updating the privacy notice and implementing required consent controls.
6. If real YouTube data is required, proxy YouTube Data API calls through a backend. Never expose a unrestricted production API key in browser JavaScript.
7. Add accounts only when saved cloud projects, channel connections, or team collaboration justify the extra friction.

## Honest product positioning

The keyword score measures specificity and intent, not search volume. The SEO score measures preparation, not ranking probability. YouTube's public guidance emphasizes relevance, engagement, quality, accurate packaging, and viewer satisfaction. Tags have a limited discovery role and should not be treated as a shortcut.

## Suggested next product phase

- Optional YouTube OAuth connection and channel health dashboard
- YouTube Data API lookup for public video metadata and statistics
- Search-result sampling and topic clustering with clearly sourced data
- Saved projects and reusable upload profiles
- Thumbnail experiment tracking based on user-entered impressions and CTR
- Retention-review worksheet using exported YouTube Analytics data
- Publish checklist for Shorts, long-form, live streams, and podcasts

This product is not affiliated with YouTube, Google, TubeBuddy, or Backlinko.
