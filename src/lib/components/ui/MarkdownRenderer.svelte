<!-- src/lib/components/ui/MarkdownRenderer.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	let md: typeof import('marked') | null = null;
	let hl: typeof import('highlight.js') | null = null;

	import { marked } from 'marked';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.css';

	// Definisikan props untuk menerima konten markdown
	const { content } = $props<{ content: string }>();

	// Konfigurasi marked untuk menggunakan highlight.js
	onMount(() => {
		marked.setOptions({
			highlight: function (code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			},
			// Tambahkan opsi lain jika diperlukan
			breaks: true,
			gfm: true
		});
	});

	// Buat variabel reaktif untuk HTML yang sudah dirender
	let renderedHtml = $derived(marked.parse(content || ''));
</script>

<div class="prose dark:prose-invert max-w-none">
	{@html renderedHtml}
</div>
