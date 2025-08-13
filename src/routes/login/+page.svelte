<!-- src/routes/login/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { toast } from 'svelte-sonner';
	
	const { data } = $props<PageData>();
	
	// Akses Supabase client dari data layout
	const { supabase } = data;
	
	// State untuk form
	let email = '';
	let password = '';
	let loading = false;
	
	// Fungsi untuk mendaftar (Sign Up)
	async function handleSignUp() {
		loading = true;
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password
			});
			
			if (error) {
				toast.error(error.message || 'Terjadi kesalahan pada server.');
				return;
			}
			
			toast.success('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
		} catch (err) {
			toast.error('Terjadi kesalahan saat pendaftaran.');
		} finally {
			loading = false;
		}
	}
	
	// Fungsi untuk masuk (Sign In)
	async function handleSignIn() {
		loading = true;
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			
			if (error) {
				toast.error(error.message || 'Terjadi kesalahan pada server.');
				return;
			}
			
			// Jika berhasil, arahkan ke halaman dashboard
			await goto('/dashboard');
		} catch (err) {
			toast.error('Terjadi kesalahan saat login.');
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-background">
	<div class="w-full max-w-md p-8 space-y-8 bg-secondary/30 rounded-lg shadow-md">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-primary">Welcome to NEXUS</h1>
			<p class="mt-2 text-foreground/80">Sign in to your account or create a new one</p>
		</div>
		
		<form class="mt-8 space-y-6" on:submit|preventDefault>
			<div class="space-y-4">
				<div>
					<label for="email" class="block mb-2 text-sm font-medium text-foreground/80">
						Email Address
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						class="bg-background border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
						placeholder="your.email@example.com"
					/>
				</div>
				
				<div>
					<label for="password" class="block mb-2 text-sm font-medium text-foreground/80">
						Password
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						class="bg-background border border-secondary/80 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
						placeholder="••••••••"
					/>
				</div>
			</div>
			
			<div class="flex flex-col sm:flex-row gap-4 pt-4">
				<button
					type="button"
					on:click={handleSignUp}
					disabled={loading}
					class="flex-1 bg-accent text-foreground py-2 px-4 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-colors"
				>
					{#if loading}
						Loading...
					{:else}
						Sign Up
					{/if}
				</button>
				
				<button
					type="button"
					on:click={handleSignIn}
					disabled={loading}
					class="flex-1 bg-primary text-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
				>
					{#if loading}
						Loading...
					{:else}
						Sign In
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>