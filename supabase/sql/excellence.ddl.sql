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
  -- Use 1536 to be compatible with common embedding providers
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_excellence_docs_hash on excellence_docs (content_hash);
create index if not exists idx_excellence_docs_tags on excellence_docs using gin (tags);
create index if not exists idx_excellence_docs_source on excellence_docs (source);

-- RPC: similarity search on excellence_docs
create or replace function match_excellence_docs(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
) returns table(
  id uuid,
  title text,
  url text,
  path text,
  content text,
  content_hash text,
  similarity float
) language sql stable as $$
  select
    ed.id,
    ed.title,
    ed.url,
    ed.path,
    ed.content,
    ed.content_hash,
    1 - (ed.embedding <=> query_embedding) as similarity
  from excellence_docs ed
  where ed.embedding is not null
  and 1 - (ed.embedding <=> query_embedding) > match_threshold
  order by ed.embedding <=> query_embedding asc
  limit match_count;
$$;

