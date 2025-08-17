import { describe, it, expect } from 'vitest';
import { MemoryCache } from '../../src/lib/server/cache/memoryCache';

describe('MemoryCache', () => {
	it('stores and retrieves values within TTL', () => {
		const cache = new MemoryCache<string>(1000);
		cache.set('k', 'v', 1000);
		expect(cache.get('k')).toBe('v');
	});

	it('evicts after TTL', async () => {
		const cache = new MemoryCache<string>(10);
		cache.set('k', 'v', 10);
		await new Promise((r) => setTimeout(r, 20));
		expect(cache.get('k')).toBeNull();
	});
});
