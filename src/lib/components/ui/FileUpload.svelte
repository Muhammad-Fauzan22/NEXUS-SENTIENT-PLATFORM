<!-- src/lib/components/ui/FileUpload.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    import Button from '$lib/components/ui/Button.svelte';

    export let label = 'Pilih File';
    export let fieldName = 'file';
    export let id = '';
    export let accept = '';
    export let required = false;
    export let className = '';

    let selectedFile = $state(null);
    let uploadStatus = $state('idle');
    let errorMessage = $state('');

    const dispatch = createEventDispatcher();

    function handleFileChange(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            selectedFile = files[0];
            uploadStatus = 'selected';
            errorMessage = '';
            dispatch('fileChange', { file: selectedFile, fieldName });
        } else {
            selectedFile = null;
            uploadStatus = 'idle';
            errorMessage = '';
            dispatch('fileChange', { file: null, fieldName });
        }
    }
</script>

<div class={`space-y-2 ${className}`}>
    <label for={id} class="block text-sm font-medium text-gray-700">
        {label} {required ? ' *' : ''}
    </label>

    <div class="flex items-center space-x-2">
        <input
            type="file"
            id={id}
            name={fieldName}
            accept={accept}
            required={required}
            on:change={handleFileChange}
            class="sr-only"
        />

        <label
            for={id}
            class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
            <svg class="mr-2 -ml-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Pilih File
        </label>

        <div class="flex items-center text-sm text-gray-500">
            {#if uploadStatus === 'idle'}
                <span class="italic">Belum ada file dipilih</span>
            {:else if uploadStatus === 'selected'}
                <span class="font-medium text-blue-600 truncate max-w-xs">{selectedFile?.name}</span>
            {/if}
        </div>
    </div>

    {#if errorMessage}
        <p class="mt-1 text-sm text-red-600">{errorMessage}</p>
    {/if}
</div>

<style>
    /* Scoped styles jika diperlukan */
</style>