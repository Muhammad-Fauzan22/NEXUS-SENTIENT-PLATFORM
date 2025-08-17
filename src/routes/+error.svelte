<!-- src/routes/+error.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<div class="flex flex-col items-center justify-center min-h-screen text-center p-4">
	<h1 class="text-9xl font-bold text-primary">{$page.status}</h1>

	<p class="text-4xl font-medium mt-4">{$page.error?.message || 'Terjadi Kesalahan'}</p>

	<p class="text-lg text-foreground/70 mt-2">
		Maaf, terjadi kesalahan tak terduga atau halaman yang Anda cari tidak dapat ditemukan.
	</p>

	<Button href="/" variant="primary" class="mt-8">Kembali ke Beranda</Button>
</div>
