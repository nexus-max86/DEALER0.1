-- DEALER : droits d'administration (19 octobre 2026)
-- L'admin est un compte DEALER normal inscrit dans la table « admins ».
-- La base vérifie elle-même ce droit : sans ce compte, la page /admin ne peut rien modifier.

-- 1. Liste des administrateurs (invisible pour les visiteurs et les membres)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ajoute_le timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on table public.admins from anon, authenticated;

create or replace function public.dealer_est_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
$$;
revoke all on function public.dealer_est_admin() from public, anon;
grant execute on function public.dealer_est_admin() to authenticated;

-- Compte administrateur : agencysnexus@gmail.com
insert into public.admins (user_id)
select id from auth.users where lower(email) = 'agencysnexus@gmail.com'
on conflict (user_id) do nothing;

-- 2. Nouveau statut « suspendu » (annonce masquée par l'admin)
alter table public.produits
  drop constraint if exists produits_statut_valide,
  add constraint produits_statut_valide check (statut in ('actif', 'reserve', 'vendu', 'suspendu'));

-- 3. Seul l'admin peut suspendre ou réactiver une annonce
create or replace function public.dealer_produit_regles()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare
  v_touche_suspension boolean;
begin
  if tg_op = 'INSERT' then
    v_touche_suspension := new.statut = 'suspendu';
  else
    v_touche_suspension := (new.statut = 'suspendu' or old.statut = 'suspendu') and new.statut is distinct from old.statut;
  end if;
  if v_touche_suspension
     and not (public.dealer_est_admin() or current_user in ('postgres', 'service_role', 'supabase_admin')) then
    raise exception 'Cette annonce est suspendue par l''équipe DEALER.' using errcode = '42501';
  end if;

  if new.quantite = 0 and new.statut in ('actif', 'reserve') then
    new.statut := 'vendu';
  elsif tg_op = 'UPDATE' and old.quantite = 0 and new.quantite > 0 and new.statut = 'vendu' then
    new.statut := 'actif';
  end if;
  return new;
end;
$function$;

-- 4. Alertes : la modération prévient le vendeur, pas les acheteurs
create or replace function public.dealer_alerte_disponibilite()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_titre text;
  v_texte text;
begin
  if new.statut is not distinct from old.statut then
    return new;
  end if;

  if new.statut = 'suspendu' or old.statut = 'suspendu' then
    if new.vendeur_id is not null then
      insert into public.notifications (user_id, type, titre, contenu, lien)
      values (
        new.vendeur_id,
        'moderation',
        case when new.statut = 'suspendu' then 'Annonce suspendue : ' else 'Annonce réactivée : ' end || left(new.titre, 60),
        case when new.statut = 'suspendu'
          then 'L''équipe DEALER a suspendu cette annonce. Elle n''est plus visible sur le site.'
          else 'Ton annonce est de nouveau visible sur DEALER.' end,
        '/account'
      );
    end if;
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
$function$;

-- 5. Droits de l'admin sur les annonces et leurs photos
create policy "Admin peut modifier" on public.produits
  for update to authenticated
  using ((select public.dealer_est_admin()))
  with check ((select public.dealer_est_admin()));

create policy "Admin peut supprimer" on public.produits
  for delete to authenticated
  using ((select public.dealer_est_admin()));

create policy "Admin supprime les photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'produits' and (select public.dealer_est_admin()));

-- 6. Chiffres et liste des membres, réservés à l'admin
create or replace function public.dealer_admin_stats()
returns json
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if not public.dealer_est_admin() then
    raise exception 'Accès réservé à l''administrateur' using errcode = '42501';
  end if;
  return json_build_object(
    'membres', (select count(*) from auth.users),
    'membres_7j', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'non_confirmes', (select count(*) from auth.users where email_confirmed_at is null),
    'annonces', (select count(*) from public.produits),
    'disponibles', (select count(*) from public.produits where statut = 'actif'),
    'reservees', (select count(*) from public.produits where statut = 'reserve'),
    'vendues', (select count(*) from public.produits where statut = 'vendu'),
    'suspendues', (select count(*) from public.produits where statut = 'suspendu'),
    'ventes', (select coalesce(sum(vendus), 0) from public.produits),
    'vues', (select coalesce(sum(vues), 0) from public.produits),
    'messages', (select count(*) from public.messages),
    'messages_7j', (select count(*) from public.messages where created_at > now() - interval '7 days')
  );
end;
$$;
revoke all on function public.dealer_admin_stats() from public, anon;
grant execute on function public.dealer_admin_stats() to authenticated;

create or replace function public.dealer_admin_membres()
returns table (
  id uuid, email text, prenom text, nom text, ville text, telephone text,
  inscrit_le timestamptz, email_confirme boolean, derniere_connexion timestamptz,
  annonces bigint, admin boolean
)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if not public.dealer_est_admin() then
    raise exception 'Accès réservé à l''administrateur' using errcode = '42501';
  end if;
  return query
  select u.id, u.email::text, p.prenom::text, p.nom::text, p.ville::text, p.telephone::text,
         u.created_at, u.email_confirmed_at is not null, u.last_sign_in_at,
         (select count(*) from public.produits x where x.vendeur_id = u.id),
         exists (select 1 from public.admins a where a.user_id = u.id)
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc
  limit 500;
end;
$$;
revoke all on function public.dealer_admin_membres() from public, anon;
grant execute on function public.dealer_admin_membres() to authenticated;
