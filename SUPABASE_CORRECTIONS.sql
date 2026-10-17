-- DEALER : corrections de l'inscription et de la publication (17 octobre 2026)
-- À coller dans Supabase > SQL Editor > Run. Ne supprime aucune donnée.
-- Le site fonctionne aussi sans ce script (il crée le profil lui-même à la connexion),
-- mais ce script rend la création du profil automatique côté base.

-- 1. Profil créé automatiquement à chaque inscription (prénom, nom, téléphone du formulaire)
create or replace function public.dealer_nouveau_profil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, prenom, nom, telephone, ville)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data->>'prenom'), ''),
    nullif(trim(new.raw_user_meta_data->>'nom'), ''),
    nullif(trim(new.raw_user_meta_data->>'telephone'), ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'ville'), ''), 'Lubumbashi')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.dealer_nouveau_profil() from public, anon, authenticated;
drop trigger if exists dealer_nouveau_profil on auth.users;
create trigger dealer_nouveau_profil after insert on auth.users
  for each row execute function public.dealer_nouveau_profil();

-- 2. Profils manquants pour les comptes déjà créés
insert into public.profiles (id, prenom, nom, telephone, ville)
select u.id,
  nullif(trim(u.raw_user_meta_data->>'prenom'), ''),
  nullif(trim(u.raw_user_meta_data->>'nom'), ''),
  nullif(trim(u.raw_user_meta_data->>'telephone'), ''),
  'Lubumbashi'
from auth.users u
on conflict (id) do nothing;

-- 3. Photos : chacun dépose uniquement dans son propre dossier, images de 6 Mo maximum
drop policy if exists "Upload authentifié" on storage.objects;
create policy "Upload authentifié" on storage.objects for insert to authenticated
  with check (bucket_id = 'produits' and (storage.foldername(name))[1] = (select auth.uid())::text);
update storage.buckets
  set file_size_limit = 6291456, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  where id = 'produits';

-- Vérification
select (select count(*) from auth.users) as comptes, (select count(*) from public.profiles) as profils;
