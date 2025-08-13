<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	
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
			<h1 class="text-xl font-bold text-primary">NEXUS</h1>
			
			{#if session}
				<!-- Pengguna sudah login -->
				<div class="flex items-center gap-4">
					<span class="text-sm text-foreground/80">{session.user.email}</span>
					<button
						on:click={handleSignOut}
						class="bg-destructive hover:bg-destructive-hover text-foreground px-3 py-1 rounded-md text-sm transition-colors"
					>
						Logout
					</button>
				</div>
			{:else}
				<!-- Pengguna belum login -->
				<a 
					href="/login" 
					class="bg-primary hover:bg-primary-hover text-foreground px-4 py-2 rounded-md text-sm transition-colors"
				>
					Login
				</a>
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
</div>