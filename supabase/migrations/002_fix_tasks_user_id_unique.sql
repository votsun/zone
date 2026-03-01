

alter table if exists public.tasks
  drop constraint if exists tasks_user_id_key;

drop index if exists public.tasks_user_id_key;

create index if not exists idx_tasks_user_id
  on public.tasks(user_id);
