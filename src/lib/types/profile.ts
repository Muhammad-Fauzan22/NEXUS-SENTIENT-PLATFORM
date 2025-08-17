/**
 * Interface untuk skor asesmen RIASEC (Holland Code)
 */
export interface IRiasecScores {
	/**
	 * Skor untuk tipe Realistic (R)
	 */
	realistic: number | null;

	/**
	 * Skor untuk tipe Investigative (I)
	 */
	investigative: number | null;

	/**
	 * Skor untuk tipe Artistic (A)
	 */
	artistic: number | null;

	/**
	 * Skor untuk tipe Social (S)
	 */
	social: number | null;

	/**
	 * Skor untuk tipe Enterprising (E)
	 */
	enterprising: number | null;

	/**
	 * Skor untuk tipe Conventional (C)
	 */
	conventional: number | null;
}

/**
 * Interface untuk skor asesmen Big Five (OCEAN)
 */
export interface IBigFiveScores {
	/**
	 * Skor untuk dimensi Openness to Experience
	 */
	openness: number | null;

	/**
	 * Skor untuk dimensi Conscientiousness
	 */
	conscientiousness: number | null;

	/**
	 * Skor untuk dimensi Extraversion
	 */
	extraversion: number | null;

	/**
	 * Skor untuk dimensi Agreeableness
	 */
	agreeableness: number | null;

	/**
	 * Skor untuk dimensi Neuroticism
	 */
	neuroticism: number | null;
}

/**
 * Interface untuk struktur data profil mahasiswa
 */
export interface IStudentProfile {
	/**
	 * UUID unik dari Supabase
	 * @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
	 */
	id: string;

	/**
	 * Timestamp kapan profil dibuat dalam format ISO 8601
	 * @example "2023-12-01T10:30:00Z"
	 */
	createdAt: string;

	/**
	 * Nama lengkap mahasiswa
	 * @example "Budi Santoso"
	 */
	fullName: string;

	/**
	 * Alamat email mahasiswa
	 * @example "budi.santoso@student.its.ac.id"
	 */
	email: string;

	/**
	 * Nomor Pokok Mahasiswa (NRP)
	 * @example "5123123456"
	 */
	studentId: string;

	/**
	 * Objek yang berisi semua hasil asesmen mentah dari mahasiswa
	 */
	assessmentData: {
		/**
		 * Hasil asesmen RIASEC (Holland Code)
		 */
		riasec: Partial<IRiasecScores>;

		/**
		 * Hasil asesmen Big Five Personality Traits
		 */
		bigFive: Partial<IBigFiveScores>;

		/**
		 * Hasil asesmen VARK Learning Styles
		 */
		vark: any;

		/**
		 * Hasil asesmen Psychological Well-Being (PWB)
		 */
		pwb: any;

		/**
		 * Data portofolio mahasiswa
		 */
		portfolio: any;
	};
}
