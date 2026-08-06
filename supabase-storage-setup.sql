insert into storage.buckets (id, name, public)
values ('receipt-photos', 'receipt-photos', false)
on conflict (id) do nothing;

create policy "Users can view their own receipt photos"
on storage.objects
for select
using (
  bucket_id = 'receipt-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload their own receipt photos"
on storage.objects
for insert
with check (
  bucket_id = 'receipt-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own receipt photos"
on storage.objects
for update
using (
  bucket_id = 'receipt-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'receipt-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own receipt photos"
on storage.objects
for delete
using (
  bucket_id = 'receipt-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
