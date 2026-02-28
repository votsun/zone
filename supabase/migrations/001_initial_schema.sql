-- Initial schema
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists micro_steps (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  content text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  raw_text text not null,
  structured_json jsonb,
  created_at timestamptz not null default now()
);
