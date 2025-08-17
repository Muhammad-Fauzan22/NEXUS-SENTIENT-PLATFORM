import { json, error, type RequestHandler } from '@sveltejs/kit';
import { notionService } from '$lib/server/integrations/notion.service';
import { z } from 'zod';

const QuerySchema = z.object({ databaseId: z.string().min(10) });

export const GET: RequestHandler = async ({ url }) => {
  const databaseId = url.searchParams.get('databaseId');
  const parsed = QuerySchema.safeParse({ databaseId });
  if (!parsed.success) throw error(400, 'Missing or invalid databaseId');

  try {
    const projects = await notionService.findOpenProjects(parsed.data.databaseId);
    return json({ projects });
  } catch (e) {
    console.error('Failed to retrieve open projects from Notion', e);
    throw error(500, 'Failed to fetch projects');
  }
};
