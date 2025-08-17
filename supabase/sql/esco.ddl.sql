create table if not exists esco_skills (
  code text primary key,
  name text not null
);

create table if not exists esco_occupations (
  code text primary key,
  name text not null
);

create index if not exists idx_esco_skills_name on esco_skills (name);
create index if not exists idx_esco_occupations_name on esco_occupations (name);

