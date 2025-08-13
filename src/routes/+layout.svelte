<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { Toaster } from 'svelte-sonner';
	import Button from '$lib/components/ui/Button.svelte';
	import Logo from '$lib/components/core/Logo.svelte';
	
	const { data } = $props<PageData>();
	
	// Buat variabel reaktif untuk session dan supabase
	let { session, supabase } = $derived(data);
	
	// Fungsi untuk logout
	async function handleSignOut() {
		await supabase.auth.signOut();
		// Arahkan ke halaman utama untuk me-refresh sesi
		await goto('/');
	}
</script>

<div class="min-h-screen bg-background text-foreground flex flex-col">
	<header class="border-b border-secondary">
		<nav class="container mx-auto p-4 flex justify-between items-center">
			<!-- Gantikan teks "NEXUS" dengan komponen Logo -->
			<a href="/" class="text-primary">
				<Logo size={8} />
			</a>
			
			{#if session}
				<!-- Pengguna sudah login -->
				<div class="flex items-center gap-4">
					<span class="text-sm text-foreground/80">{session.user.email}</span>
					<Button
						variant="secondary"
						on:click={handleSignOut}
					>
						Logout
					</Button>
				</div>
			{:else}
				<!-- Pengguna belum login -->
				<Button href="/login" variant="primary">
					Login
				</Button>
			{/if}
		</nav>
	</header>

	<main class="container mx-auto p-4 flex-grow">
		<slot />
	</main>

	<footer class="border-t border-secondary">
		<div class="container mx-auto p-4 text-center text-secondary text-sm">
			© 2024 NEXUS - The Sentient Development Platform
		</div>
	</footer>
	
	<!-- Provider Toast -->
	<Toaster />
</div>