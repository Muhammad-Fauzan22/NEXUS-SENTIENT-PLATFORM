import { logger } from '$lib/server/utils/logger';

/**
 * NotionService
 * - Abstraksi tipis di atas Notion API untuk kebutuhan platform.
 * - Menggunakan dynamic import agar tidak memaksa dependency saat runtime jika belum terpasang.
 *   Pasang paket: `npm i @notionhq/client`
 */
export class NotionService {
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.NOTION_API_KEY || '';
    if (!this.token) {
      logger.warn('NOTION_API_KEY is not set. NotionService is disabled.');
    }
  }

  private async getClient() {
    if (!this.token) throw new Error('NOTION_API_KEY is not configured');
    // Dynamic import to avoid hard dependency if package is not installed yet
    const mod = await import('@notionhq/client');
    const { Client } = mod as unknown as { Client: new (opts: { auth: string }) => any };
    return new Client({ auth: this.token });
  }

  /**
   * Cari proyek yang sedang membuka rekrutmen pada database Notion.
   * Konvensi default: properti select bernama "Status" bernilai "Open".
   * Jika filter gagal (karena skema berbeda), akan fallback ke hasil tanpa filter (maks 25).
   */
  async findOpenProjects(databaseId: string) {
    const client = await this.getClient();

    try {
      const res = await client.databases.query({
        database_id: databaseId,
        filter: {
          property: 'Status',
          select: { equals: 'Open' }
        },
        page_size: 50
      });
      return res.results.map((page: any) => this.mapProject(page));
    } catch (err) {
      logger.warn('NotionService.findOpenProjects failed with filter. Fallback to unfiltered.', { err });
      const res = await client.databases.query({ database_id: databaseId, page_size: 25 });
      return res.results.map((page: any) => this.mapProject(page));
    }
  }

  /**
   * Ambil konten dokumen dari database Notion berdasarkan judul halaman (Name/Title).
   * Jika properti bernama berbeda, gunakan filter custom sesuai kebutuhan.
   */
  async getDocumentByName(databaseId: string, docName: string): Promise<{ pageId: string; title: string; text: string } | null> {
    const client = await this.getClient();

    // Coba filter properti Title bernama 'Name'
    const query = async () => {
      try {
        return await client.databases.query({
          database_id: databaseId,
          filter: {
            property: 'Name',
            title: { equals: docName }
          },
          page_size: 1
        });
      } catch (err) {
        // Fallback: tanpa filter, lalu cari secara manual
        logger.warn('NotionService.getDocumentByName failed Title filter. Fallback to manual search.', { err });
        const res = await client.databases.query({ database_id: databaseId, page_size: 100 });
        return {
          results: res.results.filter((p: any) => this.extractTitle(p).trim().toLowerCase() === docName.trim().toLowerCase())
        } as any;
      }
    };

    const res = await query();
    const page = (res.results && res.results[0]) || null;
    if (!page) return null;

    const pageId = page.id;
    const title = this.extractTitle(page);
    const text = await this.getPagePlainText(client, pageId);
    return { pageId, title, text };
  }

  // Helpers
  private mapProject(page: any) {
    const title = this.extractTitle(page);
    const tags = this.extractMultiSelect(page, 'Tags') || this.extractMultiSelect(page, 'Kategori') || [];
    const status = this.extractSelect(page, 'Status');
    return {
      id: page.id,
      title,
      status,
      tags
    };
  }

  private extractTitle(page: any): string {
    const props = page.properties || {};
    const titleProp = props.Name || props.Title || props.Judul;
    if (!titleProp || !Array.isArray(titleProp.title)) return '';
    return titleProp.title.map((t: any) => t.plain_text || '').join('').trim();
  }

  private extractSelect(page: any, propName: string): string | null {
    const props = page.properties || {};
    const prop = props[propName];
    if (!prop || !prop.select) return null;
    return prop.select?.name || null;
  }

  private extractMultiSelect(page: any, propName: string): string[] | null {
    const props = page.properties || {};
    const prop = props[propName];
    if (!prop || !Array.isArray(prop.multi_select)) return null;
    return prop.multi_select.map((s: any) => s.name).filter(Boolean);
  }

  private async getPagePlainText(client: any, pageId: string): Promise<string> {
    const blocks: string[] = [];
    const appendBlocks = async (pid: string) => {
      let cursor: string | undefined = undefined;
      do {
        const res: any = await client.blocks.children.list({ block_id: pid, start_cursor: cursor });
        for (const b of res.results as any[]) {
          blocks.push(this.blockToText(b));
          if (b.has_children) {
            await appendBlocks(b.id);
          }
        }
        cursor = res.has_more ? res.next_cursor : undefined;
      } while (cursor);
    };

    await appendBlocks(pageId);
    return blocks.filter(Boolean).join('\n');
  }

  private blockToText(block: any): string {
    const rt = (rts: any[]) => (rts || []).map((r) => r.plain_text || '').join('');
    const t = block.type;
    const data = block[t] || {};
    switch (t) {
      case 'heading_1':
        return `# ${rt(data.rich_text)}`;
      case 'heading_2':
        return `## ${rt(data.rich_text)}`;
      case 'heading_3':
        return `### ${rt(data.rich_text)}`;
      case 'paragraph':
        return rt(data.rich_text);
      case 'bulleted_list_item':
        return `- ${rt(data.rich_text)}`;
      case 'numbered_list_item':
        return `1. ${rt(data.rich_text)}`;
      case 'to_do':
        return `- [${data.checked ? 'x' : ' '}] ${rt(data.rich_text)}`;
      case 'quote':
        return `> ${rt(data.rich_text)}`;
      case 'callout':
        return rt(data.rich_text);
      case 'code':
        return '```\n' + (data?.rich_text?.[0]?.plain_text || '') + '\n```';
      case 'toggle':
        return rt(data.rich_text);
      default:
        return '';
    }
  }
}

export const notionService = new NotionService();
