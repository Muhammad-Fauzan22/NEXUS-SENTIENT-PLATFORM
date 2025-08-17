<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	import MarketInsights from '$lib/components/dashboard/MarketInsights.svelte';

	const { data } = $props();
	const { session, submissions } = data;

	function statusBadgeClasses(status: string): string {
		switch (status) {
			case 'Submitted':
				return 'bg-blue-500/20 text-blue-300';
			case 'Analyzing':
				return 'bg-yellow-500/20 text-yellow-300';
			case 'Complete':
				return 'bg-green-500/20 text-green-300';
			default:
				return '';
		}
	}
</script>

<div class="p-8">
	<h1 class="text-3xl font-bold text-primary">Welcome to your Dashboard</h1>
	<p class="text-lg text-foreground/80 mt-1">Logged in as: {session.user.email}</p>

	<div class="mt-8">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-semibold">My IDP Submissions</h2>
		</div>

		{#if submissions && submissions.length > 0}
			<div class="mt-4 space-y-4">
				{#each submissions as submission (submission.id)}
					<a
						href="/submission/{submission.id}"
						class="block p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-secondary relative"
					>
						<div class="flex justify-between items-center">
							<div>
								<h3 class="font-medium text-foreground">{submission.full_name}</h3>
								<p class="text-sm text-foreground/70 mt-1">
									Submitted on: {new Date(submission.created_at).toLocaleDateString()}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<!-- Lencana status -->
								<span
									class={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadgeClasses(submission.status)}`}
								>
									{submission.status}
								</span>
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
								>
									View Details
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<p class="mt-4 text-foreground/70">Anda belum memiliki pengajuan. Mulai buat sekarang!</p>
		{/if}

		<!-- Market Insights section -->
		{#if session?.user?.user_metadata?.aspirations}
			<MarketInsights aspirasi={session.user.user_metadata.aspirations} />
		{:else}
			<MarketInsights aspirasi={submissions?.[0]?.research_interest || 'engineering'} />
		{/if}
	</div>

	<Button href="/" variant="primary">Create New IDP Submission</Button>
</div>
