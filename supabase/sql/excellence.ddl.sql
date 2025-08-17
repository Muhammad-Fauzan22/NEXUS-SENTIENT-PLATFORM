-- Excellence Library schema
create type if not exists excellence_source as enum ('code_repo', 'web_doc', 'blog', 'guideline', 'dataset');

create table if not exists excellence_docs (
  id uuid primary key default gen_random_uuid(),
  source excellence_source not null,
  source_id text,
  title text,
  url text,
  path text,
  lang text,
  tags text[],
  content text,
  content_hash text,
  tokens int,
  -- optional: add pgvector extension and set the right dimension later
  embedding vector(768),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_excellence_docs_hash on excellence_docs (content_hash);
create index if not exists idx_excellence_docs_tags on excellence_docs using gin (tags);
create index if not exists idx_excellence_docs_source on excellence_docs (source);

