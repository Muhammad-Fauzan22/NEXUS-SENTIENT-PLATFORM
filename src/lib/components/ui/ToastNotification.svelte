<!-- src/lib/components/ui/ToastNotification.svelte -->
<script>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';

    export let type = 'info';
    export let title = '';
    export let message = '';
    export let duration = 5000;
    export let dismissible = true;

    let isVisible = $state(true);
    let dismissTimeoutId = $state(null);

    const dispatch = createEventDispatcher();

    onMount(() => {
        if (duration > 0) {
            scheduleDismiss();
        }
    });

    onDestroy(() => {
        clearDismissTimeout();
    });

    function scheduleDismiss() {
        dismissTimeoutId = setTimeout(() => {
            closeToast();
        }, duration);
    }

    function clearDismissTimeout() {
        if (dismissTimeoutId) {
            clearTimeout(dismissTimeoutId);
            dismissTimeoutId = null;
        }
    }

    function closeToast() {
        clearDismissTimeout();
        isVisible = false;
        setTimeout(() => {
            dispatch('close');
        }, 150);
    }

    function handleMouseEnter() {
        if (duration > 0) {
            clearDismissTimeout();
        }
    }

    function handleMouseLeave() {
        if (duration > 0) {
            scheduleDismiss();
        }
    }

    $: typeClasses = getTypeClasses(type);
    $: iconSvg = getIconSvg(type);

    function getTypeClasses(toastType) {
        const baseClasses = "max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 ease-in-out";
        const typeMap = {
            success: "bg-green-50 text-green-800 border border-green-200",
            error: "bg-red-50 text-red-800 border border-red-200",
            warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
            info: "bg-blue-50 text-blue-800 border border-blue-200"
        };
        return `${baseClasses} ${typeMap[toastType] || typeMap.info}`;
    }

    function getIconSvg(toastType) {
        const iconMap = {
            success: `<svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`,
            error: `<svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`,
            warning: `<svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`,
            info: `<svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>`
        };
        return iconMap[toastType] || iconMap.info;
    }
</script>

{#if isVisible}
    <div
        class={typeClasses}
        role="alert"
        aria-live="polite"
        on:mouseenter={handleMouseEnter}
        on:mouseleave={handleMouseLeave}
    >
        <div class="p-4">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    {@html iconSvg}
                </div>
                <div class="ml-3 w-0 flex-1 pt-0.5">
                    {#if title}
                        <p class="text-sm font-medium">{title}</p>
                    {/if}
                    <p class="mt-1 text-sm opacity-90">{message}</p>
                </div>
                {#if dismissible}
                    <div class="ml-4 flex-shrink-0 flex">
                        <button
                            class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                            on:click={closeToast}
                            aria-label="Tutup notifikasi"
                        >
                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    /* Scoped styles jika diperlukan */
</style>