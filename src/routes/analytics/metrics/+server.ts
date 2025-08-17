import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

export const GET: RequestHandler = async () => {
  try {
    const [kc, st, top] = await Promise.all([
      supabaseAdmin.from('knowledge_chunks').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('skill_trends').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('skill_trends').select('skill_name, velocity_score').order('velocity_score', { ascending: false }).limit(10)
    ]);
    const knowledge_chunks = kc.count ?? null;
    const skill_trends = st.count ?? null;
    const topSkills = top.data || [];
    return json({ knowledge_chunks, skill_trends, topSkills, serverTime: new Date().toISOString() });
  } catch (e) {
    return json({ knowledge_chunks: null, skill_trends: null, topSkills: [], serverTime: new Date().toISOString() });
  }
};

