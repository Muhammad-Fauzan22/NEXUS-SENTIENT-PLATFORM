<script lang="ts">
	import { getContext } from 'svelte';
	import { clsx } from 'clsx';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type ContextType = {
		value: string | number | null;
		name: string;
		updateValue: (newValue: string | number | null) => void;
	};

	type Props = HTMLInputAttributes & {
		value: string | number;
		id: string;
	};

	let { value, id, ...rest }: Props = $props();

	const group: ContextType = getContext('radioGroup');

	const baseClasses =
		'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="flex items-center">
	<input
		type="radio"
		{id}
		name={group.name}
		{value}
		checked={group.value === value}
		onchange={() => group.updateValue(value)}
		class={clsx('peer sr-only', rest.class)}
		{...rest}
	/>
	<label
		for={id}
		class="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-primary text-primary ring-offset-background peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary-focus peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
	>
	</label>
	<label for={id} class="ml-3 cursor-pointer text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
		<slot />
	</label>
</div>

<!--
  CONTOH PENGGUNAAN:

  <RadioGroup bind:value={$formData.satisfaction} name="satisfaction-group">
    <FormField label="Tingkat Kepuasan" forId="">
      <div class="flex flex-col gap-2 pt-2">
        <RadioGroupItem value={1} id="sat-1">Sangat Tidak Puas</RadioGroupItem>
        <RadioGroupItem value={2} id="sat-2">Tidak Puas</RadioGroupItem>
        <RadioGroupItem value={3} id="sat-3">Netral</RadioGroupItem>
        <RadioGroupItem value={4} id="sat-4">Puas</RadioGroupItem>
        <RadioGroupItem value={5} id="sat-5">Sangat Puas</RadioGroupItem>
      </div>
    </FormField>
  </RadioGroup>
-->