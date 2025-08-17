// Lightweight trends utilities used by scripts/analyze_trends.ts

export function normalizeSkill(s: string): string {
  return (s || '').toLowerCase().trim();
}

const BOOSTED = new Set([
  'python','pytorch','tensorflow','matlab','ansys','solidworks','autocad','cad',
  'robotics','mechatronics','mechanical','finite element','fea','cfd',
  'docker','kubernetes','git','linux','sql','postgres','supabase',
  'javascript','typescript','node','react','svelte','sveltekit','fastapi','django','flask',
  'aws','azure','gcp','nlp','llm','computer vision','opencv'
]);

export function extractSkillsV2(text: string): string[] {
  if (!text) return [];
  const tokens = text
    .replace(/[^a-zA-Z0-9+#\.\-\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t && t.length >= 2 && t.length <= 40);

  const skills: string[] = [];
  for (const t of tokens) {
    const n = normalizeSkill(t);
    if (/^(c\+\+|c#|c|python|java(script)?|typescript|rust|go|matlab|ansys|solidworks|autocad|cad|docker|kubernetes|git|linux|sql|postgres|supabase|pytorch|tensorflow|react|svelte(kit)?|node|fastapi|django|flask|aws|azure|gcp|nlp|llm|opencv)$/i.test(n)) {
      skills.push(n);
    } else if (BOOSTED.has(n)) {
      skills.push(n);
    }
  }
  return skills;
}

export function computeVelocity(cnt7: number, cnt30: number): number {
  // Simple smoothed velocity metric
  const a = cnt7 + 1;
  const b = cnt30 - cnt7 + 1;
  return +(a / (a + b)).toFixed(4); // 0..1
}

