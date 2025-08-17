import { supabaseAdmin } from '$lib/server/supabase';

export async function getTopTrendingSkills(aspirasi: string, limit = 5): Promise<string[]> {
  const q = (aspirasi || '').trim();
  if (!q) return [];
  const { data, error } = await supabaseAdmin
    .from('skill_trends')
    .select('skill_name')
    .ilike('related_roles', `%${q}%`)
    .order('velocity_score', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((d) => d.skill_name).filter(Boolean);
}

