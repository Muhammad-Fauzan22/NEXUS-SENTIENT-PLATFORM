<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	
	const { data } = $props<PageData>();
	
	// Ekstrak sesi dari data
	const { session } = data;
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold text-primary">Welcome to your Dashboard</h1>
	<p class="text-lg text-foreground/80 mt-1">Logged in as: {session.user.email}</p>
	
	<div class="mt-8">
		<h2 class="text-xl font-semibold">My IDP Submissions</h2>
		<p class="mt-2 text-foreground/70">Your past submissions will be displayed here.</p>
	</div>
	
	<a 
		href="/" 
		class="mt-8 inline-block bg-primary hover:bg-primary/90 text-foreground font-bold py-2 px-4 rounded-lg transition-colors"
	>
		Create New IDP Submission
	</a>
</div>