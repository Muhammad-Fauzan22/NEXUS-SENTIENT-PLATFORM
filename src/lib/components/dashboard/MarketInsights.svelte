<script lang="ts">
  export let aspirasi: string;
  let loading = $state(false);
  let topDemand: { skill_name: string; mention_count_7d: number; velocity_score: number }[] = $state([]);
  let rising: { skill_name: string; mention_count_7d: number; velocity_score: number }[] = $state([]);
  let articles: { title: string; url?: string; published_at?: string }[] = $state([]);

  async function load() {
    loading = true;
    try {
      const res = await fetch(`/analytics/trending_skills/${encodeURIComponent(aspirasi)}`);
      const data = await res.json();
      topDemand = data.topDemand || [];
      rising = data.rising || [];
      articles = data.articles || [];
    } finally {
      loading = false;
    }
  }
</script>

<div class="mt-10">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Market Insights</h2>
    <button class="text-sm underline" onclick={load}>Refresh</button>
  </div>

  {#if loading}
    <p class="text-foreground/70 mt-2">Loading insights…</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      <div>
        <h3 class="font-medium mb-2">Top 5 In-Demand Skills</h3>
        <ul class="space-y-1">
          {#each topDemand as s}
          <li class="flex items-center justify-between bg-secondary/30 rounded px-3 py-2">
            <span>{s.skill_name}</span>
            <a class="text-sm text-primary underline" target="_blank" href={`https://www.google.com/search?q=${encodeURIComponent(s.skill_name + ' course')}`}>Find courses</a>
          </li>
          {/each}
        </ul>
      </div>

      <div>
        <h3 class="font-medium mb-2">Top 3 Rising Skills</h3>
        <ul class="space-y-1">
          {#each rising as s}
          <li class="flex items-center justify-between bg-secondary/30 rounded px-3 py-2">
            <span>{s.skill_name}</span>
            <a class="text-sm text-primary underline" target="_blank" href={`https://www.google.com/search?q=${encodeURIComponent(s.skill_name + ' course')}`}>Find courses</a>
          </li>
          {/each}
        </ul>
      </div>

      <div>
        <h3 class="font-medium mb-2">Recommended Reading</h3>
        <ul class="space-y-1">
          {#each articles as a}
          <li class="bg-secondary/30 rounded px-3 py-2">
            <a class="underline" target="_blank" href={a.url || '#'}>{a.title}</a>
            {#if a.published_at}<div class="text-xs text-foreground/70">{new Date(a.published_at).toLocaleDateString()}</div>{/if}
          </li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}
</div>

