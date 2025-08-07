// src/lib/stores/assessmentStore.ts
import { writable } from 'svelte/store';

// --- Definisi Tipe Data ---

// 1. RIASEC
export interface RiasecScores {
    [key: string]: number; // key: questionId, value: score (1-5)
}
export type RiasecCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export interface RiasecProfile {
    primary: RiasecCode | null;
    secondary: RiasecCode | null;
    tertiary: RiasecCode | null;
    // Bisa ditambahkan skor untuk setiap kode jika diperlukan untuk analisis lebih lanjut
    // scores: Record<RiasecCode, number>;
}

// 2. Big Five (Model OCEAN)
export interface BigFiveScores {
    openness: number | null; // Skor 1-10 atau null jika belum diisi
    conscientiousness: number | null;
    extraversion: number | null;
    agreeableness: number | null;
    neuroticism: number | null;
}

// 3. VARK
export type VarkPreference = 'V' | 'A' | 'R' | 'K' | 'Multimodal' | 'None';
export interface VarkScores {
    visual: number | null; // Skor 1-10 atau null
    aural: number | null;
    read_write: number | null;
    kinesthetic: number | null;
}

// 4. PWB (Psychological Well-Being)
export type PwbDimension =
    | 'autonomy'
    | 'environmental_mastery'
    | 'personal_growth'
    | 'positive_relations'
    | 'purpose_in_life'
    | 'self_acceptance';

export interface PwbScores {
    [key in PwbDimension]: number | null; // Skor 1-10 atau null
}

// 5. Dokumen Pengembangan Diri (UserData)
// Bisa diperluas sesuai kebutuhan
export interface UserData {
    name?: string;
    email?: string;
    nrp?: string; // Nomor Induk Mahasiswa
    // Tambahkan field lain sesuai kuesioner portofolio
    // e.g., experiences: string[], achievements: string[], interests: string[]
    [field: string]: any; // Untuk fleksibilitas
}

// --- Struktur Utama Data Asesmen ---
export interface AssessmentData {
    userData: UserData;
    riasec: {
        scores: RiasecScores;
        profile: RiasecProfile; // Akan dihitung berdasarkan skor
    };
    bigFive: BigFiveScores;
    vark: VarkScores;
    pwb: PwbScores;
    // Bisa ditambahkan field lain untuk portofolio jika diperlukan struktur khusus
}

// --- Data Awal ---
const initialData: AssessmentData = {
    userData: {},
    riasec: {
        scores: {},
        profile: { primary: null, secondary: null, tertiary: null }
    },
    bigFive: {
        openness: null,
        conscientiousness: null,
        extraversion: null,
        agreeableness: null,
        neuroticism: null
    },
    vark: {
        visual: null,
        aural: null,
        read_write: null,
        kinesthetic: null
    },
    pwb: {
        autonomy: null,
        environmental_mastery: null,
        personal_growth: null,
        positive_relations: null,
        purpose_in_life: null,
        self_acceptance: null
    }
};

// --- Store Svelte ---
export const assessmentStore = writable<AssessmentData>(initialData);

// --- Helper Functions untuk Update Store ---
export const updateUserData = (data: Partial<UserData>) => {
    assessmentStore.update((store) => ({
        ...store,
        userData: { ...store.userData, ...data }
    }));
};

export const updateRiasecScore = (questionId: string, score: number) => {
    assessmentStore.update((store) => {
        const updatedScores = { ...store.riasec.scores, [questionId]: score };
        // Di sini bisa ditambahkan logika untuk menghitung ulang profile (primer, sekunder, tersier)
        // Untuk saat ini, kita biarkan komponen atau fungsi lain yang menghitungnya jika diperlukan
        // atau bisa dihitung saat pengiriman data.
        return {
            ...store,
            riasec: {
                ...store.riasec,
                scores: updatedScores
            }
        };
    });
};

// Helper untuk Big Five, VARK, PWB bisa dibuat serupa jika diperlukan update per item
// Atau bisa langsung update object secara keseluruhan untuk komponen yang lebih kompleks

export const updateBigFiveScores = (scores: Partial<BigFiveScores>) => {
    assessmentStore.update((store) => ({
        ...store,
        bigFive: { ...store.bigFive, ...scores }
    }));
};

export const updateVarkScores = (scores: Partial<VarkScores>) => {
    assessmentStore.update((store) => ({
        ...store,
        vark: { ...store.vark, ...scores }
    }));
};

export const updatePwbScores = (scores: Partial<PwbScores>) => {
    assessmentStore.update((store) => ({
        ...store,
        pwb: { ...store.pwb, ...scores }
    }));
};

export const resetAssessment = () => {
    assessmentStore.set(initialData);
};
