-- skill_trends table
create table if not exists skill_trends (
  id bigserial primary key,
  skill_name text not null,
  mention_count_7d int default 0,
  mention_count_30d int default 0,
  velocity_score float default 0,
  related_roles text default '',
  updated_at timestamptz default now()
);

-- scraped_articles table
create table if not exists scraped_articles (
  id bigserial primary key,
  title text not null,
  url text,
  body text,
  published_at timestamptz,
  scraped_at timestamptz default now()
);

-- indexes
create index if not exists idx_skill_trends_skill on skill_trends (skill_name);
create index if not exists idx_skill_trends_velocity on skill_trends (velocity_score desc);
create index if not exists idx_scraped_articles_published on scraped_articles (published_at desc);

