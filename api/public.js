// ============================================================================
// /api/public — the READ-ONLY, NO-PASSWORD data source for Xanderr's public
// Art Gallery (the pre-login page) AND for AI crawlers wanting clean data.
//
//   GET /api/public  →  { ok, student, bio, gallery, trophies, writing, jsonld }
//
// SAFETY: this route can only ever read four whitelisted keys and returns a
// hand-sanitized subset of each. It NEVER touches savings, colleges, decisions,
// recommendations, calendar, family rules, progress, or anything else — those
// keys are not even queried, so they cannot leak. Only items the student has
// explicitly marked `public: true` are returned. Writing is excerpted unless
// she also set `publicFull: true`. CORS is open so AI tools can read it.
// ============================================================================

import { readStateKeys } from './_supabase.js';

// First N words of a body, with an ellipsis if trimmed.
function excerpt(text, words = 60) {
  if (!text) return '';
  const w = String(text).trim().split(/\s+/);
  if (w.length <= words) return String(text).trim();
  return w.slice(0, words).join(' ') + '…';
}

// Achievements → Trophy Box. Achievements are inherently shareable; we expose
// the descriptive fields and the (already-public) image/link URLs she pasted.
function publicTrophies(items = []) {
  return (items || [])
    .filter((a) => a && a.public)
    .map((a) => ({
      id: a.id,
      category: a.category || 'award',
      title: a.title || '',
      venue: a.venue || '',
      date: a.date || '',
      description: a.description || '',
      image: a.image || '',
      link: a.link || '',
    }));
}

// Writing → The Ink & Page. Excerpt by default; full body only when she opted
// in per-piece. We deliberately DROP prompt/school/wordLimit/link so private
// essay prompts and private doc links never go public.
function publicWriting(items = []) {
  return (items || [])
    .filter((w) => w && w.public)
    .map((w) => {
      const full = !!w.publicFull;
      return {
        id: w.id,
        category: w.category || 'story',
        title: w.title || 'Untitled',
        date: w.date || '',
        favorite: !!w.favorite,
        excerpt: excerpt(w.body, 60),
        body: full ? (w.body || '') : '',
        full,
      };
    });
}

// Portfolio → the art wall. Only published pieces that actually have an image.
// We DROP notes/schools/scholarships/target — those reveal application strategy.
function publicGallery(items = []) {
  return (items || [])
    .filter((p) => p && p.public && p.image)
    .map((p) => ({
      id: p.id,
      title: p.title || '',
      medium: p.medium || '',
      status: p.status || '',
      image: p.image,
    }));
}

// schema.org JSON-LD so search engines and AI get clean, structured data.
function buildJsonLd({ origin, bio, gallery, writing, trophies }) {
  const works = [];
  for (const g of gallery) {
    works.push({
      '@type': 'VisualArtwork',
      name: g.title || 'Untitled',
      artMedium: g.medium || undefined,
      image: g.image,
      creator: { '@type': 'Person', name: 'Xanderr' },
    });
  }
  for (const w of writing) {
    works.push({
      '@type': 'CreativeWork',
      name: w.title || 'Untitled',
      abstract: w.excerpt || undefined,
      creator: { '@type': 'Person', name: 'Xanderr' },
    });
  }
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Xanderr',
    description: bio || 'Young visual artist and writer building an art-school portfolio.',
    url: origin || undefined,
    knowsAbout: ['Visual Art', 'Creative Writing', 'Illustration'],
  };
  const awards = trophies.map((t) => t.title).filter(Boolean);
  if (awards.length) person.award = awards;
  if (works.length) person.workExample = works;
  return person;
}

export default async function handler(req, res) {
  // Open, read-only, cacheable. AI tools can fetch this cross-origin.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, reason: 'method not allowed' });
  }

  // If Supabase isn't configured (or unreachable), readStateKeys returns {} and
  // we serve an empty-but-valid gallery rather than erroring.
  let state = {};
  try {
    state = await readStateKeys(['viol_achievements', 'viol_writing', 'viol_portfolio', 'viol_bio']);
  } catch {
    state = {};
  }

  const trophies = publicTrophies(state.viol_achievements);
  const writing = publicWriting(state.viol_writing);
  const gallery = publicGallery(state.viol_portfolio);
  const bioRaw = state.viol_bio || {};
  const bio = bioRaw && bioRaw.public && bioRaw.text ? String(bioRaw.text) : '';

  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0];
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const origin = host ? `${proto}://${host}` : '';

  const jsonld = buildJsonLd({ origin, bio, gallery, writing, trophies });

  return res.status(200).json({
    ok: true,
    student: { name: 'Xanderr' },
    bio,
    gallery,
    trophies,
    writing,
    jsonld,
    counts: { gallery: gallery.length, trophies: trophies.length, writing: writing.length },
    generatedAt: new Date().toISOString(),
  });
}
