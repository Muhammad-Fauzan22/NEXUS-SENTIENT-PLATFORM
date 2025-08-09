<!-- src/lib/components/ui/Input.svelte -->
<script>
    import { forwardEvents } from 'svelte/events';

    export let className = '';
    export let label = '';
    export let id = '';
    export let error = '';

    let inputRef;
    forwardEvents(inputRef, $$props);

    $: inputClasses = `flex h-10 w-full rounded-md border ${
        error ? 'border-red-500' : 'border-input'
    } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim();
</script>

<div class="space-y-1">
    {#if label}
        <label for={id} class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
        </label>
    {/if}
    <input
        bind:this={inputRef}
        id={id}
        class={inputClasses}
        {...$$restProps}
    />
    {#if error}
        <p class="text-sm font-medium text-red-500">{error}</p>
    {/if}
</div>

<style>
    /* Scoped styles jika diperlukan */
</style>