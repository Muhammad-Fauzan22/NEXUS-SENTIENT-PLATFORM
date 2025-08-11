<script lang="ts">
	import Label from './Label.svelte';
	import { clsx } from 'clsx';

	type Props = {
		label: string;
		forId: string;
		errorMessage?: string | null;
		class?: string;
	};

	let { label, forId, errorMessage = null, class: className }: Props = $props();
</script>

<div class={clsx('grid w-full items-center gap-2', className)}>
	<Label for={forId}>{label}</Label>

	<!--
    Slot ini adalah tempat di mana kita akan menempatkan komponen Input,
    Textarea, atau komponen form lainnya. Komponen induk akan
    meneruskan komponen form yang sebenarnya ke sini.
  -->
	<slot />

	{#if errorMessage}
		<p class="text-sm font-medium text-destructive">{errorMessage}</p>
	{/if}
</div>

<!--
  CONTOH PENGGUNAAN:
  
  <FormField label="Nama Lengkap" forId="fullName" errorMessage={errors.fullName}>
    <Input id="fullName" bind:value={$formData.fullName} hasError={!!errors.fullName} />
  </FormField>

  <FormField label="Deskripsi Diri" forId="description" errorMessage={errors.description}>
    <Textarea id="description" bind:value={$formData.description} hasError={!!errors.description} />
  </FormField>
-->