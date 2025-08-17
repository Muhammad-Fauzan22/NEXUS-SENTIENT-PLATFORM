// V2 Trends Analyzer helpers: multi-word extraction, synonym normalization, velocity

const SYNONYMS: Record<string, string> = {
  'ml': 'machine learning',
  'ai': 'artificial intelligence',
  'c++': 'cpp',
  'c#': 'csharp',
  'tf': 'tensorflow',
  'pyTorch': 'pytorch',
  'solid works': 'solidworks',
  'fe analysis': 'fea',
  'finite element analysis': 'fea',
  'computational fluid dynamics': 'cfd',
  'autodesk autocad': 'autocad',
  'mat lab': 'matlab'
};

const MULTIWORD_DICTIONARY = [
  'finite element analysis',
  'computational fluid dynamics',
  'project management',
  'machine learning',
  'artificial intelligence',
  'deep learning'
];

export function normalizeSkill(raw: string): string {
  const s = (raw || '').trim().toLowerCase();
  if (!s) return '';
  if (SYNONYMS[s]) return SYNONYMS[s];
  return s.replace(/\s{2,}/g, ' ');
}

export function extractSkillsV2(text: string): string[] {
  const lower = (text || '').toLowerCase();
  const found = new Set<string>();

  // find multi-word first
  for (const phrase of MULTIWORD_DICTIONARY) {
    if (lower.includes(phrase)) found.add(normalizeSkill(phrase));
  }

  // token-level for single words and symbols like c++, c#
  const tokens = lower
    .replace(/[^a-z0-9+#\.\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const KNOWN = new Set<string>([
    'python','matlab','cad','solidworks','ansys','autocad','cfd','fea','linux','cpp','csharp','java','sql','mongodb','pytorch','tensorflow','keras','simulink','robotics','hvac','firmware','plc','arduino','raspberry','docker','kubernetes','git','jira','machine','learning','deep','artificial','intelligence','battery','thermal','ev','mechanical','manufacturing','lean','six','sigma','project','management'
  ]);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'c++') found.add('cpp');
    else if (t === 'c#') found.add('csharp');
    else if (KNOWN.has(t)) {
      // combine bigrams/trigrams for known phrases
      const bi = `${t} ${tokens[i+1]||''}`.trim();
      const tri = `${t} ${tokens[i+1]||''} ${tokens[i+2]||''}`.trim();
      if (MULTIWORD_DICTIONARY.includes(bi)) found.add(normalizeSkill(bi));
      else if (MULTIWORD_DICTIONARY.includes(tri)) found.add(normalizeSkill(tri));
      else found.add(normalizeSkill(t));
    }
  }

  return Array.from(found);
}

export function computeVelocity(mentions7: number, mentions30: number): number {
  const a = 1; // smoothing
  const r = (mentions7 + a) / (mentions30 + a);
  // map ratio to 0..1 with cap
  return Math.max(0, Math.min(1, r));
}

