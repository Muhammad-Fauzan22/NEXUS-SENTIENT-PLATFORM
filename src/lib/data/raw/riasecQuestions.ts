/**
 * Mendefinisikan kontrak tipe untuk setiap pertanyaan RIASEC.
 * Ini memastikan konsistensi data di seluruh aplikasi.
 */
export interface RIASECQuestion {
	id: number;
	text: string;
}

/**
 * Sumber kebenaran (Single Source of Truth) untuk semua pertanyaan asesmen RIASEC.
 * Memisahkan data dari logika presentasi memungkinkan pemeliharaan yang lebih mudah.
 */
export const riasecQuestions: RIASECQuestion[] = [
    { id: 1, text: 'Saya suka bekerja dengan perkakas.' },
    { id: 2, text: 'Saya suka melakukan eksperimen ilmiah.' },
    { id: 3, text: 'Saya suka menggambar atau melukis.' },
    { id: 4, text: 'Saya suka membantu orang lain.' },
    { id: 5, text: 'Saya suka memimpin sebuah tim.' },
    { id: 6, text: 'Saya suka bekerja dengan angka.' },
    { id: 7, text: 'Saya bisa memperbaiki barang-barang elektronik.' },
    { id: 8, text: 'Saya bisa memahami teori-teori ilmiah.' },
    { id: 9, text: 'Saya bisa bermain alat musik.' },
    { id: 10, text: 'Saya pandai mengajar orang lain.' },
    { id: 11, text: 'Saya pandai meyakinkan orang lain.' },
    { id: 12, text: 'Saya pandai menjaga catatan yang rapi.' },
    { id: 13, text: 'Saya suka bekerja di luar ruangan.' },
    { id: 14, text: 'Saya suka membaca buku-buku ilmiah.' },
    { id: 15, text: 'Saya suka menulis cerita atau puisi.' },
    { id: 16, text: 'Saya suka bekerja dalam tim.' },
    { id: 17, text: 'Saya suka memulai bisnis sendiri.' },
    { id: 18, text: 'Saya suka mengikuti prosedur yang jelas.' },
    { id: 19, text: 'Saya suka membangun sesuatu.' },
    { id: 20, text: 'Saya suka memecahkan masalah matematika.' },
    { id: 21, text: 'Saya suka mendesain sesuatu.' },
    { id: 22, text: 'Saya suka menjadi sukarelawan.' },
    { id: 23, text: 'Saya suka memberikan pidato.' },
    { id: 24, text: 'Saya suka mengelola anggaran.' },
    { id: 25, text: 'Saya suka bekerja dengan mesin.' },
    { id: 26, text: 'Saya suka melakukan penelitian.' },
    { id: 27, text: 'Saya suka fotografi.' },
    { id: 28, text: 'Saya suka mendengarkan masalah orang lain.' },
    { id: 29, text: 'Saya suka menjual produk atau ide.' },
    { id: 30, text: 'Saya suka membuat jadwal.' },
    { id: 31, text: 'Saya suka berolahraga.' },
    { id: 32, text: 'Saya suka menganalisis data.' },
    { id: 33, text: 'Saya suka berakting dalam drama.' },
    { id: 34, text: 'Saya suka merawat orang sakit.' },
    { id: 35, text: 'Saya suka bernegosiasi.' },
    { id: 36, text: 'Saya suka memeriksa dokumen untuk mencari kesalahan.' },
    { id: 37, text: 'Saya suka bekerja dengan tangan saya.' },
    { id: 38, text: 'Saya suka belajar tentang alam semesta.' },
    { id: 39, text: 'Saya suka menciptakan resep baru.' },
    { id: 40, text: 'Saya suka menasihati teman-teman saya.' },
    { id: 41, text: 'Saya suka mengorganisir acara.' },
    { id: 42, text: 'Saya suka bekerja di kantor.' }
];