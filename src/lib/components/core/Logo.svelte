<!-- src/lib/components/core/Logo.svelte -->
<script lang="ts">
	// Definisikan prop untuk mengontrol ukuran logo
	let { size = 8 } = $props<{ size?: number }>();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 100 100"
	width={size * 4}
	height={size * 4}
	class="inline-block"
>
	<!-- Latar belakang lingkaran untuk kesan kokoh -->
	<circle cx="50" cy="50" r="45" fill="currentColor" class="text-primary" />
	
	<!-- Bentuk huruf M stilisasi -->
	<path 
		d="M30 50 L30 25 L40 25 L50 40 L60 25 L70 25 L70 50" 
		stroke="white" 
		stroke-width="5" 
		fill="none" 
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	
	<!-- Garis horizontal bawah untuk stabilitas -->
	<line 
		x1="35" 
		y1="55" 
		x2="65" 
		y2="55" 
		stroke="white" 
		stroke-width="5" 
		stroke-linecap="round"
	/>
	
	<!-- Titik aksen di bawah untuk keseimbangan -->
	<circle cx="50" cy="65" r="3" fill="white" />
</svg>