<!-- src/lib/components/ui/MarkdownRenderer.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import 'highlight.js/styles/github-dark.css';

	// Definisikan props untuk menerima konten markdown
	const { content } = $props<{ content: string }>();

	let markedModule: typeof import('marked') | null = null;
	let hljs: typeof import('highlight.js') | null = null;

	onMount(async () => {
		const [{ marked }, highlight] = await Promise.all([import('marked'), import('highlight.js')]);
		markedModule = { marked } as any;
		hljs = (highlight as any).default || (highlight as any);
		marked.setOptions({ breaks: true, gfm: true } as any);
	});

	// Buat variabel reaktif untuk HTML yang sudah dirender
	let renderedHtml = $derived(marked.parse(content || ''));
</script>

<div class="prose dark:prose-invert max-w-none">
	{@html renderedHtml}
</div>
