-- DEALER : messagerie, disponibilité et stock, alertes, statistiques, photo de profil (19 octobre 2026)
-- Ne supprime aucune donnée. Peut être relancé sans risque.

-- 0. Profil créé automatiquement à l'inscription (prénom, nom, téléphone du formulaire)
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

insert into public.profiles (id, prenom, nom, telephone, ville)
select u.id,
  nullif(trim(u.raw_user_meta_data->>'prenom'), ''),
  nullif(trim(u.raw_user_meta_data->>'nom'), ''),
  nullif(trim(u.raw_user_meta_data->>'telephone'), ''),
  'Lubumbashi'
from auth.users u
on conflict (id) do nothing;

-- Profil : description limitée, et seuls ces champs sont modifiables depuis le site
alter table public.profiles drop constraint if exists profiles_bio_longueur;
alter table public.profiles add constraint profiles_bio_longueur check (bio is null or char_length(bio) <= 500);
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, prenom, nom, telephone, ville, avatar_url, bio) on public.profiles to authenticated;
grant update (prenom, nom, telephone, ville, avatar_url, bio) on public.profiles to authenticated;

-- 1. Annonces : stock, ventes, vues et disponibilité
--    statut : 'actif' = disponible, 'reserve' = réservé, 'vendu' = vendu
alter table public.produits add column if not exists quantite integer not null default 1;
alter table public.produits add column if not exists vendus integer not null default 0;
alter table public.produits add column if not exists vues integer not null default 0;
alter table public.produits drop constraint if exists produits_quantite_valide;
alter table public.produits add constraint produits_quantite_valide check (quantite >= 0 and vendus >= 0);
alter table public.produits drop constraint if exists produits_statut_valide;
alter table public.produits add constraint produits_statut_valide check (statut in ('actif', 'reserve', 'vendu'));
alter table public.produits drop constraint if exists produits_prix_positif;
alter table public.produits add constraint produits_prix_positif check (prix > 0);

-- Stock à zéro : l'article passe en « vendu » ; réapprovisionné : il redevient disponible
create or replace function public.dealer_produit_regles()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.quantite = 0 and new.statut in ('actif', 'reserve') then
    new.statut := 'vendu';
  elsif tg_op = 'UPDATE' and old.quantite = 0 and new.quantite > 0 and new.statut = 'vendu' then
    new.statut := 'actif';
  end if;
  return new;
end;
$$;
drop trigger if exists dealer_produit_regles on public.produits;
create trigger dealer_produit_regles before insert or update of quantite, statut on public.produits
  for each row execute function public.dealer_produit_regles();

-- Le vendeur ne peut modifier que ces champs (les vues sont comptées par la base)
revoke insert, update on public.produits from anon, authenticated;
grant insert (titre, description, prix, categorie, marque, taille, couleur, etat, ville, images, vendeur_id, statut, quantite) on public.produits to authenticated;
grant update (titre, description, prix, categorie, marque, taille, couleur, etat, ville, images, statut, quantite, vendus) on public.produits to authenticated;

-- Compteur de vues (la visite du vendeur sur sa propre annonce n'est pas comptée)
create or replace function public.dealer_compter_vue(p_produit uuid)
returns void language sql security definer set search_path = public as $$
  update public.produits set vues = vues + 1
  where id = p_produit and vendeur_id is distinct from auth.uid();
$$;
revoke execute on function public.dealer_compter_vue(uuid) from public;
grant execute on function public.dealer_compter_vue(uuid) to anon, authenticated;

create index if not exists produits_statut_date_idx on public.produits (statut, created_at desc);
create index if not exists produits_vendeur_idx on public.produits (vendeur_id);

-- 2. Messagerie
alter table public.messages drop constraint if exists messages_contenu_valide;
alter table public.messages add constraint messages_contenu_valide
  check (char_length(trim(contenu)) between 1 and 2000 and expediteur_id <> destinataire_id);
revoke insert, update, delete on public.messages from anon, authenticated;
grant insert (expediteur_id, destinataire_id, produit_id, contenu) on public.messages to authenticated;
grant update (lu) on public.messages to authenticated;
drop policy if exists "Marquer ses messages lus" on public.messages;
create policy "Marquer ses messages lus" on public.messages for update to authenticated
  using ((select auth.uid()) = destinataire_id) with check ((select auth.uid()) = destinataire_id);
create index if not exists messages_destinataire_idx on public.messages (destinataire_id, lu, created_at desc);
create index if not exists messages_expediteur_idx on public.messages (expediteur_id, created_at desc);

-- 3. Notifications : écrites uniquement par la base, l'utilisateur peut seulement les marquer lues
revoke insert, update, delete on public.notifications from anon, authenticated;
grant update (lu) on public.notifications to authenticated;
create index if not exists notifications_utilisateur_idx on public.notifications (user_id, lu, created_at desc);

-- Nouveau message : notification au destinataire (regroupée tant qu'elle n'est pas lue)
drop trigger if exists on_new_message on public.messages;
drop function if exists public.notifier_message();
create or replace function public.dealer_notifier_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_nom text;
  v_titre text;
  v_lien text := '/messages/' || new.expediteur_id;
begin
  select coalesce(nullif(trim(prenom), ''), 'Un membre') into v_nom from public.profiles where id = new.expediteur_id;
  if new.produit_id is not null then
    select titre into v_titre from public.produits where id = new.produit_id;
  end if;
  update public.notifications
    set contenu = left(new.contenu, 140), created_at = now()
    where user_id = new.destinataire_id and type = 'message' and lu = false and lien = v_lien;
  if not found then
    insert into public.notifications (user_id, type, titre, contenu, lien)
    values (new.destinataire_id, 'message',
      'Message de ' || coalesce(v_nom, 'un membre') || coalesce(' : ' || left(v_titre, 50), ''),
      left(new.contenu, 140), v_lien);
  end if;
  return new;
end;
$$;
revoke execute on function public.dealer_notifier_message() from public, anon, authenticated;
drop trigger if exists dealer_notifier_message on public.messages;
create trigger dealer_notifier_message after insert on public.messages
  for each row execute function public.dealer_notifier_message();

-- 4. Alertes de disponibilité : les acheteurs qui suivent l'article ou ont écrit au vendeur sont prévenus
create unique index if not exists favoris_unique_idx on public.favoris (user_id, produit_id);

create or replace function public.dealer_alerte_disponibilite()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_titre text;
  v_texte text;
begin
  if new.statut is not distinct from old.statut then
    return new;
  end if;
  v_titre := case new.statut
    when 'vendu' then 'Vendu : '
    when 'reserve' then 'Réservé : '
    when 'actif' then 'De nouveau disponible : '
  end || left(new.titre, 60);
  v_texte := case new.statut
    when 'vendu' then 'Cet article n''est plus disponible. Regarde les articles similaires.'
    when 'reserve' then 'Un acheteur l''a réservé. On te prévient s''il redevient disponible.'
    when 'actif' then 'Cet article est de nouveau en vente.'
  end;
  insert into public.notifications (user_id, type, titre, contenu, lien)
  select distinct s.uid, 'disponibilite', v_titre, v_texte, '/product/' || new.id
  from (
    select f.user_id as uid from public.favoris f where f.produit_id = new.id
    union
    select m.expediteur_id from public.messages m where m.produit_id = new.id
  ) s
  where s.uid is not null and s.uid <> new.vendeur_id;
  return new;
end;
$$;
revoke execute on function public.dealer_alerte_disponibilite() from public, anon, authenticated;
drop trigger if exists dealer_alerte_disponibilite on public.produits;
-- « after update » (et non « update of statut ») : le statut peut aussi changer via le stock
create trigger dealer_alerte_disponibilite after update on public.produits
  for each row execute function public.dealer_alerte_disponibilite();

-- 5. Temps réel pour les messages et les notifications
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- 6. Photos de profil : dossier personnel, 2 Mo maximum
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Avatar : lecture du sien" on storage.objects;
create policy "Avatar : lecture du sien" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Avatar : ajout" on storage.objects;
create policy "Avatar : ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Avatar : suppression" on storage.objects;
create policy "Avatar : suppression" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 7. Photos d'annonces : dossier personnel, 6 Mo maximum
drop policy if exists "Upload authentifié" on storage.objects;
create policy "Upload authentifié" on storage.objects for insert to authenticated
  with check (bucket_id = 'produits' and (storage.foldername(name))[1] = (select auth.uid())::text);
update storage.buckets
  set file_size_limit = 6291456, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  where id = 'produits';
