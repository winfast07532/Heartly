-- Activate after the authenticated frontend is deployed. No stored data changes.
alter policy "Allow read heartly-couple" on public.couple_state to authenticated
using (id='heartly-couple' and (select public.heartly_member_role()) is not null);
alter policy "Allow insert heartly-couple" on public.couple_state to authenticated
with check (id='heartly-couple' and (select public.heartly_member_role()) is not null);
alter policy "Allow update heartly-couple" on public.couple_state to authenticated
using (id='heartly-couple' and (select public.heartly_member_role()) is not null)
with check (id='heartly-couple' and (select public.heartly_member_role()) is not null);
