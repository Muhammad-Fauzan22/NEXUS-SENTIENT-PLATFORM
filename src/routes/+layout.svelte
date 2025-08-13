<script lang="ts">
	import '../app.css';
</script>

<div class="min-h-screen bg-background text-foreground flex flex-col">
	<header class="border-b border-secondary">
		<nav class="container mx-auto p-4 flex justify-between items-center">
			<h1 class="text-xl font-bold text-primary">NEXUS</h1>
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