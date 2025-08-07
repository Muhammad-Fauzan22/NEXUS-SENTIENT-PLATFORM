<!-- src/routes/+page.svelte -->
<script lang="ts">
    import Step1UserData from '$lib/components/assessment/Step_1_UserData.svelte';
    import Step2RIASEC from '$lib/components/assessment/Step_2_RIASEC.svelte';
    import Step3PWB from '$lib/components/assessment/Step_3_PWB.svelte'; // Pastikan komponen ini ada
    import Button from '$lib/components/ui/Button.svelte';
    import {
        assessmentStore,
        resetAssessment
    } from '$lib/stores/assessmentStore';
    import { riasecQuestions } from '$lib/data/riasecQuestions.js';
    import { goto } from '$app/navigation'; // Untuk redirect setelah submit

    let currentStep = 1;
    const totalSteps = 3; // Sesuaikan dengan jumlah langkah

    function nextStep() {
        if (currentStep < totalSteps) currentStep++;
    }

    function prevStep() {
        if (currentStep > 1) currentStep--;
    }

    // --- Validasi Data per Langkah ---
    function isStep1Valid(): boolean {
        const userData = $assessmentStore.userData;
        return !!(userData.name?.trim() && userData.email?.trim() && userData.nrp?.trim());
        // Tambahkan validasi lain untuk field userData jika diperlukan
    }

    function isStep2Valid(): boolean {
        // Pastikan semua pertanyaan RIASEC telah dijawab
        const answeredQuestions = Object.keys($assessmentStore.riasec.scores);
        return answeredQuestions.length === riasecQuestions.length;
    }

    function isStep3Valid(): boolean {
        // Contoh validasi sederhana untuk PWB: pastikan semua dimensi memiliki nilai
        const pwbScores = $assessmentStore.pwb;
        return Object.values(pwbScores).every((score) => score !== null && score >= 1 && score <= 10);
        // Sesuaikan logika validasi sesuai dengan struktur dan skala PWB yang digunakan
    }

    function isCurrentStepValid(): boolean {
        switch (currentStep) {
            case 1:
                return isStep1Valid();
            case 2:
                return isStep1Valid() && isStep2Valid(); // Step 2 membutuhkan data Step 1
            case 3:
                return isStep1Valid() && isStep2Valid() && isStep3Valid(); // Step 3 membutuhkan data sebelumnya
            default:
                return false;
        }
    }

    // --- Submit Data ---
    async function handleSubmit() {
        if (!isCurrentStepValid()) {
            console.warn('Form tidak valid. Tidak dapat mengirim data.');
            // Bisa menampilkan pesan error ke user
            return;
        }

        // --- Proses Data Sebelum Pengiriman ---
        // Hitung profil RIASEC (Primer, Sekunder, Tersier) jika belum dihitung oleh komponen
        // Ini adalah contoh logika sederhana, sebaiknya dipindah ke helper function
        const scores = $assessmentStore.riasec.scores;
        const typeScores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

        riasecQuestions.forEach((q) => {
            const score = scores[q.id];
            if (score !== undefined && q.type) {
                typeScores[q.type] += score;
            }
        });

        const sortedTypes = Object.entries(typeScores)
            .sort((a, b) => b[1] - a[1])
            .map(([type]) => type);

        const riasecProfile = {
            primary: sortedTypes[0] || null,
            secondary: sortedTypes[1] || null,
            tertiary: sortedTypes[2] || null
        };

        // Buat objek data akhir yang akan dikirim
        const finalData = {
            ...$assessmentStore,
            riasec: {
                ...$assessmentStore.riasec,
                profile: riasecProfile
            }
        };

        console.log('Submitting all data...', finalData);

        try {
            const response = await fetch('/api/submit-assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalData) // Kirim data yang sudah diproses
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gagal mengirim data: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Data berhasil dikirim:', result);
            // Reset store jika diperlukan
            resetAssessment();
            // Redirect ke halaman sukses
            goto('/thank-you'); // Pastikan route ini ada

        } catch (error) {
            console.error('Terjadi kesalahan saat mengirim data:', error);
            // Tampilkan pesan error ke user (misalnya dengan toast atau alert)
            alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
        }
    }
</script>

<main
    class="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans"
>
    <div class="w-full max-w-3xl">
        <header class="mb-8 text-center">
            <img
                src="https://katamata.wordpress.com/wp-content/uploads/2013/11/logo-m-its-red-with-black-list.png"
                alt="Logo Himpunan Mahasiswa Mesin ITS"
                class="w-24 h-24 mx-auto mb-4"
            />
            <h1 class="text-3xl font-bold text-white tracking-tight">
                NEXUS: The Sentient Development Platform
            </h1>
            <p class="text-gray-400 mt-2">
                Pola Pengembangan Sumber Daya Mahasiswa (PPSDM) HMM ITS
            </p>
        </header>

        <div class="mb-8">
            <p class="text-center text-gray-300 mb-2">Langkah {currentStep} dari {totalSteps}</p>
            <div class="w-full bg-gray-700 rounded-full h-2.5">
                <div
                    class="bg-red-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style="width: {(currentStep / totalSteps) * 100}%"
                ></div>
            </div>
        </div>

        <div class="min-h-[500px]"> <!-- Untuk menjaga layout saat pindah step -->
            {#if currentStep === 1}
                <Step1UserData />
            {:else if currentStep === 2}
                <Step2RIASEC />
            {:else if currentStep === 3}
                <Step3PWB />
            {/if}
        </div>

        <div class="flex justify-between mt-10">
            <Button variant="secondary" on:click={prevStep} disabled={currentStep === 1}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Kembali
            </Button>
            <Button
                variant="primary"
                on:click={currentStep < totalSteps ? nextStep : handleSubmit}
                disabled={!isCurrentStepValid()}
            >
                {#if currentStep < totalSteps}
                    <span>Lanjutkan</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                {:else}
                    Selesai & Analisis
                {/if}
            </Button>
        </div>
    </div>
</main>

<style>
    :global(button > span) {
        display: inline-block;
    }
    :global(button) {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
