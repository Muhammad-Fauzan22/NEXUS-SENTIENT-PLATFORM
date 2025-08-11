export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            raw_assessment_data: {
                Row: {
                    id: string
                    created_at: string
                    submission_data: Json
                }
                Insert: {
                    id?: string
                    created_at?: string
                    submission_data: Json
                }
                Update: {
                    id?: string
                    created_at?: string
                    submission_data?: Json
                }
                Relationships: []
            }
            processed_profiles: {
                Row: {
                    id: string
                    raw_assessment_id: string
                    created_at: string
                    aspirations: string
                    portfolio_text: string
                    analyzed_summary: string
                    riasec_scores: Json
                    pwb_scores: Json
                }
                Insert: {
                    id?: string
                    raw_assessment_id?: string
                    created_at?: string
                    aspirations: string
                    portfolio_text: string
                    analyzed_summary: string
                    riasec_scores: Json
                    pwb_scores: Json
                }
                Update: {
                    id?: string
                    raw_assessment_id?: string
                    created_at?: string
                    aspirations?: string
                    portfolio_text?: string
                    analyzed_summary?: string
                    riasec_scores?: Json
                    pwb_scores?: Json
                }
                Relationships: [
                    {
                        foreignKeyName: "processed_profiles_raw_assessment_id_fkey"
                        columns: ["raw_assessment_id"]
                        isOneToOne: true
                        referencedRelation: "raw_assessment_data"
                        referencedColumns: ["id"]
                    }
                ]
            }
            idp_records: {
                Row: {
                    id: string
                    profile_id: string
                    created_at: string
                    json_content: Json
                    html_content: string
                    pdf_url: string | null
                    status: string
                    error_message: string | null
                }
                Insert: {
                    id?: string
                    profile_id: string
                    created_at?: string
                    json_content: Json
                    html_content: string
                    pdf_url?: string | null
                    status?: string
                    error_message?: string | null
                }
                Update: {
                    id?: string
                    profile_id?: string
                    created_at?: string
                    json_content?: Json
                    html_content?: string
                    pdf_url?: string | null
                    status?: string
                    error_message?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "idp_records_profile_id_fkey"
                        columns: ["profile_id"]
                        isOneToOne: false
                        referencedRelation: "processed_profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            knowledge_chunks: {
                Row: {
                    id: string
                    source_document: string
                    content_text: string
                    content_embedding: string // pgvector stores this as a string representation
                    created_at: string
                }
                Insert: {
                    id: string
                    source_document: string
                    content_text: string
                    content_embedding: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    source_document?: string
                    content_text?: string
                    content_embedding?: string
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            match_knowledge_chunks: {
                Args: {
                    query_embedding: number[]
                    match_threshold: number
                    match_count: number
                }
                Returns: {
                    id: string
                    content_text: string
                    source_document: string
                    similarity: number
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}