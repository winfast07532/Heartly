-- Account allowlist is private, never bundled with the public site.
create schema if not exists heartly_private;
revoke all on schema heartly_private from public,anon,authenticated;
create table if not exists heartly_private.members (
  email text primary key check(email=lower(email)),
  member_role text not null check(member_role in ('robert','ana'))
);
alter table heartly_private.members enable row level security;
revoke all on heartly_private.members from public,anon,authenticated;

-- This definer function has exactly one purpose: resolve the caller's own
-- confirmed identity against the private allowlist. It accepts no user ID.
create or replace function public.heartly_member_role()
returns text language sql stable security definer set search_path='' as $$
  select m.member_role from heartly_private.members m
  join auth.users u on lower(u.email)=m.email
  where u.id=(select auth.uid()) and u.email_confirmed_at is not null
    and not coalesce(u.is_anonymous,false);
$$;
revoke all on function public.heartly_member_role() from public,anon;
grant execute on function public.heartly_member_role() to authenticated;
