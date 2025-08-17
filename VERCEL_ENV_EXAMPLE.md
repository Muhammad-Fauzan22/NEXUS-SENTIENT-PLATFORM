# Vercel Environment Variables (Example)

Project Settings → Environment Variables

Required:

- SUPABASE_URL = https://YOUR-PROJECT.supabase.co
- SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
- OPENAI_API_KEY = sk-... (or compatible embeddings provider)
- NOTION_API_KEY = secret_xxx
  Optional (enable Notion doc-by-name ingestion):
- NOTION_DOCS_DATABASE_ID = your-notion-db-id
- NOTION_DOC_NAMES = AD/ART,SOP,Kurikulum

After setting envs: trigger Redeploy.
