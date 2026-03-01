-- Allow multiple tasks per user.
-- Some setups accidentally create a unique constraint/index on tasks.user_id.

alter table if exists public.tasks
  drop constraint if exists tasks_user_id_key;

drop index if exists public.tasks_user_id_key;

create index if not exists idx_tasks_user_id
  on public.tasks(user_id);
