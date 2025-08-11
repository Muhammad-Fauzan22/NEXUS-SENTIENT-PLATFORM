export interface PWBQuestion {
	id: number;
	text: string;
	reversed: boolean; // True if a lower score is better
}

export const pwbQuestions: PWBQuestion[] = [
    { id: 1, text: 'Saya cenderung merasa bangga dengan diri saya.', reversed: false },
    { id: 2, text: 'Saya sering merasa kecewa dengan pencapaian saya.', reversed: true },
    { id: 3, text: 'Bagi saya, hidup adalah proses belajar, berubah, dan berkembang yang berkelanjutan.', reversed: false },
    { id: 4, text: 'Saya merasa tidak banyak berkembang dalam hidup saya akhir-akhir ini.', reversed: true },
    { id: 5, text: 'Saya memiliki tujuan dan arah dalam hidup.', reversed: false },
    { id: 6, text: 'Saya tidak yakin apa tujuan hidup saya.', reversed: true },
    { id: 7, text: 'Orang-orang akan menggambarkan saya sebagai orang yang suka memberi.', reversed: false },
    { id: 8, text: 'Saya merasa sulit untuk membuka diri dan percaya pada orang lain.', reversed: true },
    { id: 9, text: 'Saya mampu mengelola tanggung jawab saya dengan baik.', reversed: false },
    { id: 10, text: 'Saya sering merasa kewalahan dengan tuntutan hidup.', reversed: true },
    { id: 11, text: 'Saya memiliki kepercayaan pada pendapat saya, bahkan jika bertentangan dengan konsensus umum.', reversed: false },
    { id: 12, text: 'Saya cenderung terpengaruh oleh orang-orang dengan pendapat yang kuat.', reversed: true },
    { id: 13, text: 'Secara umum, saya merasa positif tentang diri saya.', reversed: false },
    { id: 14, text: 'Saya merasa tidak memiliki banyak teman dekat.', reversed: true }
];