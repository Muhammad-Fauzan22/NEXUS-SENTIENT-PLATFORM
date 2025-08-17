<script lang="ts">
	let loading = $state(true);
	let metrics: {
		knowledge_chunks?: number | null;
		skill_trends?: number | null;
		topSkills?: { skill_name: string; velocity_score: number }[];
		serverTime?: string;
	} = $state({});

	async function loadMetrics() {
		loading = true;
		try {
			const res = await fetch('/analytics/metrics');
			metrics = await res.json();
		} catch {
			metrics = {};
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadMetrics();
	});
</script>

<div class="p-6 max-w-5xl mx-auto">
	<h1 class="text-2xl font-semibold">Admin Metrics</h1>
	<div class="text-sm text-foreground/70">
		Server Time: {metrics.serverTime || '-'}
		<button class="ml-3 underline" onclick={loadMetrics}>Refresh</button>
	</div>

	{#if loading}
		<p class="mt-6">Loading…</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
			<div class="border rounded p-4">
				<div class="text-foreground/70 text-sm">Knowledge Chunks</div>
				<div class="text-2xl font-bold">{metrics.knowledge_chunks ?? '-'}</div>
			</div>
			<div class="border rounded p-4">
				<div class="text-foreground/70 text-sm">Skill Trends</div>
				<div class="text-2xl font-bold">{metrics.skill_trends ?? '-'}</div>
			</div>
			<div class="border rounded p-4">
				<div class="text-foreground/70 text-sm">Top Skills (by velocity)</div>
				<ol class="mt-2 space-y-1 list-decimal list-inside">
					{#each metrics.topSkills || [] as s}
						<li class="flex items-center justify-between">
							<span>{s.skill_name}</span>
							<span class="text-xs text-foreground/70">{s.velocity_score?.toFixed(2)}</span>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	{/if}
</div>
