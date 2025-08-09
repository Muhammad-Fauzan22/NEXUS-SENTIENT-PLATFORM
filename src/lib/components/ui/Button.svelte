<!-- src/lib/components/ui/Button.svelte -->
<script>
    export let variant = 'primary';
    export let size = 'md';
    export let disabled = false;
    export let className = '';
    export let type = 'button';
    export let ariaLabel = '';

    $: baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    $: variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        link: 'underline-offset-4 hover:underline text-primary'
    }[variant] || '';
    $: sizeClasses = {
        sm: 'h-9 rounded-md px-3 text-xs',
        md: 'h-10 py-2 px-4',
        lg: 'h-11 rounded-md px-8'
    }[size] || '';
</script>

<button
    class=`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim()
    type={type}
    disabled={disabled}
    aria-label={ariaLabel}
    {...$$restProps}
>
    <slot />
</button>

<style>
    /* Scoped styles jika diperlukan */
</style>