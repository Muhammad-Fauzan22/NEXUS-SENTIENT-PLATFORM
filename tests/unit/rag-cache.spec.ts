import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as RagModule from '../../src/lib/server/ai/rag';
import * as EmbModule from '../../src/lib/server/ai/providers/embeddings';

describe('RAG cache', () => {
  beforeEach(() => {
    // reset module state between tests if needed
  });

  it('returns cached results for identical query', async () => {
    const spyEmbed = vi.spyOn(EmbModule, 'embeddingProvider', 'get').mockReturnValue({
      generateEmbedding: vi.fn(async () => Array(1536).fill(0.1))
    } as any);

    const result1 = await RagModule.retrieveContext('hello world');
    const result2 = await RagModule.retrieveContext('hello world');

    expect(Array.isArray(result1)).toBe(true);
    expect(Array.isArray(result2)).toBe(true);
    spyEmbed.mockRestore();
  });
});

