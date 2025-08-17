<!-- src/lib/components/ui/MarkdownRenderer.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import 'highlight.js/styles/github-dark.css';

	// Definisikan props untuk menerima konten markdown
	const { content } = $props<{ content: string }>();

	let markedModule: typeof import('marked') | null = null;

	onMount(async () => {
		const [{ marked }] = await Promise.all([import('marked')]);
		markedModule = { marked } as any;
		marked.setOptions({ breaks: true, gfm: true } as any);
	});

	// Buat variabel reaktif untuk HTML yang sudah dirender
	let renderedHtml = $derived(
		markedModule ? (markedModule as any).marked.parse(content || '') : content || ''
	);
</script>

<div class="prose dark:prose-invert max-w-none">
	{@html renderedHtml}
</div>
