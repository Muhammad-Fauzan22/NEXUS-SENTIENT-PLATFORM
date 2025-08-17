export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			processed_profiles: {
				Row: {
					id: string;
					created_at: string;
					user_id: string;
					full_name: string;
					email: string;
					student_id: string;
					aspirations: string;
					portfolio_text: string;
					riasec_scores: Json;
					pwb_scores: Json;
					status: 'pending' | 'processing' | 'processed' | 'failed';
					updated_at?: string;
				};
				Insert: {
					id?: string;
					created_at?: string;
					user_id: string;
					full_name: string;
					email: string;
					student_id: string;
					aspirations: string;
					portfolio_text: string;
					riasec_scores: Json;
					pwb_scores: Json;
					status?: 'pending' | 'processing' | 'processed' | 'failed';
					updated_at?: string;
				};
				Update: {
					id?: string;
					created_at?: string;
					user_id?: string;
					full_name?: string;
					email?: string;
					student_id?: string;
					aspirations?: string;
					portfolio_text?: string;
					riasec_scores?: Json;
					pwb_scores?: Json;
					status?: 'pending' | 'processing' | 'processed' | 'failed';
					updated_at?: string;
				};
			};
			generated_idps: {
				Row: {
					id: string;
					created_at: string;
					profile_id: string;
					linkedin_summary: string;
					potential_analysis: string;
					career_goals_analysis: string;
					roadmap: Json;
					status: 'generating' | 'completed' | 'failed';
					error_message?: string;
					updated_at?: string;
				};
				Insert: {
					id?: string;
					created_at?: string;
					profile_id: string;
					linkedin_summary?: string;
					potential_analysis?: string;
					career_goals_analysis?: string;
					roadmap?: Json;
					status?: 'generating' | 'completed' | 'failed';
					error_message?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					created_at?: string;
					profile_id?: string;
					linkedin_summary?: string;
					potential_analysis?: string;
					career_goals_analysis?: string;
					roadmap?: Json;
					status?: 'generating' | 'completed' | 'failed';
					error_message?: string;
					updated_at?: string;
				};
			};
			knowledge_chunks: {
				Row: {
					id: string;
					created_at: string;
					content_text: string;
					embedding: number[];
					metadata: Json;
					source_type: 'manual' | 'scraped' | 'uploaded';
					source_url?: string;
					updated_at?: string;
				};
				Insert: {
					id?: string;
					created_at?: string;
					content_text: string;
					embedding: number[];
					metadata?: Json;
					source_type: 'manual' | 'scraped' | 'uploaded';
					source_url?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					created_at?: string;
					content_text?: string;
					embedding?: number[];
					metadata?: Json;
					source_type?: 'manual' | 'scraped' | 'uploaded';
					source_url?: string;
					updated_at?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			match_knowledge_chunks: {
				Args: {
					query_embedding: number[];
					match_threshold: number;
					match_count: number;
				};
				Returns: {
					id: string;
					content_text: string;
					similarity: number;
				}[];
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}
