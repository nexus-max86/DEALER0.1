-- DEALER : badges payants (Pro, Vérifié), paiement manuel, publicité locale, limite d'annonces
-- 21 octobre 2026. Le paiement passe par le mobile money de DEALER et l'admin le valide.

-- 1. Badges sur le profil : lisibles par tous, modifiables seulement par l'admin (fonction plus bas)
alter table public.profiles
  add column if not exists pro_jusqua timestamptz,
  add column if not exists verifie_jusqua timestamptz,
  add column if not exists boutique_nom text;
alter table public.profiles
  add constraint profiles_boutique_longueur check (boutique_nom is null or char_length(boutique_nom) between 2 and 60);
grant update (boutique_nom) on public.profiles to authenticated;

-- 2. Offres et prix (modifiables dans l'admin)
create table if not exists public.offres (
  code text primary key,
  badge text not null check (badge in ('pro', 'verifie')),
  periode text not null check (periode in ('mois', 'an')),
  montant numeric(10,2) not null check (montant > 0),
  duree interval not null,
  libelle text not null,
  ordre int not null default 0
);
alter table public.offres enable row level security;
revoke all on table public.offres from anon, authenticated;
grant select on table public.offres to anon, authenticated;
grant update (montant) on table public.offres to authenticated;
create policy "Offres publiques" on public.offres for select to anon, authenticated using (true);
create policy "Admin modifie les prix" on public.offres for update to authenticated
  using ((select public.dealer_est_admin())) with check ((select public.dealer_est_admin()));
insert into public.offres (code, badge, periode, montant, duree, libelle, ordre) values
  ('pro_mois', 'pro', 'mois', 5, '1 month', 'Vendeur Pro · 1 mois', 1),
  ('pro_an', 'pro', 'an', 50, '1 year', 'Vendeur Pro · 1 an', 2),
  ('verifie_mois', 'verifie', 'mois', 2, '1 month', 'Vendeur vérifié · 1 mois', 3),
  ('verifie_an', 'verifie', 'an', 20, '1 year', 'Vendeur vérifié · 1 an', 4)
on conflict (code) do nothing;

-- 3. Paramètres : numéros mobile money de DEALER (modifiables dans l'admin)
create table if not exists public.parametres (
  cle text primary key,
  valeur jsonb not null default '{}'::jsonb,
  maj_le timestamptz not null default now()
);
alter table public.parametres enable row level security;
revoke all on table public.parametres from anon, authenticated;
grant select on table public.parametres to anon, authenticated;
grant update (valeur, maj_le) on table public.parametres to authenticated;
create policy "Paramètres publics" on public.parametres for select to anon, authenticated using (true);
create policy "Admin modifie les paramètres" on public.parametres for update to authenticated
  using ((select public.dealer_est_admin())) with check ((select public.dealer_est_admin()));
insert into public.parametres (cle, valeur) values
  ('paiement', '{"beneficiaire": "DEALER", "mpesa": "", "orange": "", "airtel": "", "afrimoney": ""}'::jsonb)
on conflict (cle) do nothing;

-- 4. Paiements déclarés par les vendeurs, en attente de validation
create table if not exists public.paiements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  offre text not null references public.offres(code),
  montant numeric(10,2) not null default 0,
  reference text not null unique default ('DLR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  operateur text not null check (operateur in ('mpesa', 'orange', 'airtel', 'afrimoney')),
  numero_payeur text not null check (char_length(numero_payeur) between 8 and 20),
  transaction_id text check (transaction_id is null or char_length(transaction_id) <= 60),
  piece_identite text,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'valide', 'refuse')),
  motif_refus text,
  created_at timestamptz not null default now(),
  traite_le timestamptz,
  traite_par uuid references auth.users(id)
);
create index if not exists paiements_statut_idx on public.paiements (statut, created_at desc);
create index if not exists paiements_user_idx on public.paiements (user_id, created_at desc);
alter table public.paiements enable row level security;
revoke all on table public.paiements from anon, authenticated;
grant select on table public.paiements to authenticated;
grant insert (offre, operateur, numero_payeur, transaction_id, piece_identite) on table public.paiements to authenticated;
create policy "Voir ses paiements" on public.paiements for select to authenticated
  using (user_id = (select auth.uid()) or (select public.dealer_est_admin()));
create policy "Déclarer un paiement" on public.paiements for insert to authenticated
  with check (user_id = (select auth.uid()));

create or replace function public.dealer_paiement_avant()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_offre public.offres;
begin
  select * into v_offre from public.offres where code = new.offre;
  if not found then raise exception 'Offre inconnue.' using errcode = '22023'; end if;
  new.montant := v_offre.montant;
  new.statut := 'en_attente';
  new.traite_le := null; new.traite_par := null; new.motif_refus := null;
  if v_offre.badge = 'verifie'
     and (new.piece_identite is null or split_part(new.piece_identite, '/', 1) <> new.user_id::text) then
    raise exception 'Ajoute une photo de ta pièce d''identité.' using errcode = '22023';
  end if;
  if (select count(*) from public.paiements p where p.user_id = new.user_id and p.statut = 'en_attente') >= 3 then
    raise exception 'Tu as déjà 3 paiements en attente de validation.' using errcode = '22023';
  end if;
  return new;
end;
$$;
create trigger dealer_paiement_avant before insert on public.paiements
  for each row execute function public.dealer_paiement_avant();

-- L'admin reçoit une notification à chaque paiement déclaré
create or replace function public.dealer_paiement_notifier_admin()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, titre, contenu, lien)
  select a.user_id, 'paiement', 'Paiement à valider : ' || new.montant || ' $',
         (select o.libelle from public.offres o where o.code = new.offre) || ' · ' || upper(new.operateur) || ' · réf. ' || new.reference,
         '/admin'
  from public.admins a;
  return new;
end;
$$;
create trigger dealer_paiement_notifier_admin after insert on public.paiements
  for each row execute function public.dealer_paiement_notifier_admin();

-- Validation ou refus par l'admin : active ou prolonge le badge, prévient le vendeur
create or replace function public.dealer_admin_traiter_paiement(p_id uuid, p_accepter boolean, p_motif text default null)
returns json language plpgsql security definer set search_path = ''
as $$
declare
  v_p public.paiements;
  v_o public.offres;
  v_fin timestamptz;
begin
  if not public.dealer_est_admin() then
    raise exception 'Accès réservé à l''administrateur' using errcode = '42501';
  end if;
  select * into v_p from public.paiements where id = p_id for update;
  if not found then raise exception 'Paiement introuvable.'; end if;
  if v_p.statut <> 'en_attente' then raise exception 'Ce paiement a déjà été traité.'; end if;
  select * into v_o from public.offres where code = v_p.offre;

  if p_accepter then
    if v_o.badge = 'pro' then
      update public.profiles set pro_jusqua = greatest(coalesce(pro_jusqua, now()), now()) + v_o.duree
      where id = v_p.user_id returning pro_jusqua into v_fin;
    else
      update public.profiles set verifie_jusqua = greatest(coalesce(verifie_jusqua, now()), now()) + v_o.duree
      where id = v_p.user_id returning verifie_jusqua into v_fin;
    end if;
    if v_fin is null then raise exception 'Profil du vendeur introuvable.'; end if;
    update public.paiements set statut = 'valide', traite_le = now(), traite_par = auth.uid() where id = p_id;
    insert into public.notifications (user_id, type, titre, contenu, lien) values (
      v_p.user_id, 'badge',
      case when v_o.badge = 'pro' then 'Badge Vendeur Pro activé' else 'Badge Vendeur vérifié activé' end,
      'Merci ! Ton badge est actif jusqu''au ' || to_char(v_fin at time zone 'Africa/Lubumbashi', 'DD/MM/YYYY') || '.',
      '/account');
  else
    update public.paiements set statut = 'refuse', motif_refus = nullif(trim(p_motif), ''), traite_le = now(), traite_par = auth.uid()
    where id = p_id;
    insert into public.notifications (user_id, type, titre, contenu, lien) values (
      v_p.user_id, 'badge', 'Paiement non validé',
      coalesce(nullif(trim(p_motif), ''), 'Nous n''avons pas retrouvé ton paiement (réf. ' || v_p.reference || '). Vérifie le numéro et réessaie.'),
      '/offres');
  end if;
  return json_build_object('statut', case when p_accepter then 'valide' else 'refuse' end, 'fin', v_fin);
end;
$$;
revoke all on function public.dealer_admin_traiter_paiement(uuid, boolean, text) from public, anon;
grant execute on function public.dealer_admin_traiter_paiement(uuid, boolean, text) to authenticated;

-- 5. Pièces d'identité : dossier privé, visible seulement par son auteur et l'admin
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verifications', 'verifications', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy "Déposer sa pièce d'identité" on storage.objects for insert to authenticated
  with check (bucket_id = 'verifications' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Voir sa pièce d'identité ou admin" on storage.objects for select to authenticated
  using (bucket_id = 'verifications' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.dealer_est_admin())));
create policy "Admin supprime les pièces d'identité" on storage.objects for delete to authenticated
  using (bucket_id = 'verifications' and (select public.dealer_est_admin()));
create policy "Supprimer sa pièce d'identité" on storage.objects for delete to authenticated
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 6. Publicité locale (gérée par l'admin)
create table if not exists public.publicites (
  id uuid primary key default gen_random_uuid(),
  annonceur text not null check (char_length(annonceur) between 2 and 80),
  titre text not null check (char_length(titre) between 2 and 80),
  texte text check (texte is null or char_length(texte) <= 160),
  image_url text,
  lien text check (lien is null or lien ~ '^https://'),
  categorie text,
  debut date not null default current_date,
  fin date not null,
  actif boolean not null default true,
  montant numeric(10,2),
  vues int not null default 0,
  clics int not null default 0,
  created_at timestamptz not null default now(),
  constraint publicites_dates check (fin >= debut)
);
alter table public.publicites enable row level security;
revoke all on table public.publicites from anon, authenticated;
grant select on table public.publicites to anon, authenticated;
grant insert (annonceur, titre, texte, image_url, lien, categorie, debut, fin, actif, montant) on table public.publicites to authenticated;
grant update (annonceur, titre, texte, image_url, lien, categorie, debut, fin, actif, montant) on table public.publicites to authenticated;
grant delete on table public.publicites to authenticated;
create policy "Publicités en cours" on public.publicites for select to anon, authenticated
  using (actif and current_date between debut and fin);
create policy "Admin voit les publicités" on public.publicites for select to authenticated
  using ((select public.dealer_est_admin()));
create policy "Admin crée les publicités" on public.publicites for insert to authenticated
  with check ((select public.dealer_est_admin()));
create policy "Admin modifie les publicités" on public.publicites for update to authenticated
  using ((select public.dealer_est_admin())) with check ((select public.dealer_est_admin()));
create policy "Admin supprime les publicités" on public.publicites for delete to authenticated
  using ((select public.dealer_est_admin()));

create or replace function public.dealer_compter_pub(p_id uuid, p_clic boolean default false)
returns void language sql security definer set search_path = ''
as $$
  update public.publicites
  set vues = vues + case when p_clic then 0 else 1 end,
      clics = clics + case when p_clic then 1 else 0 end
  where id = p_id and actif and current_date between debut and fin
$$;
grant execute on function public.dealer_compter_pub(uuid, boolean) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('publicites', 'publicites', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy "Admin dépose les visuels de pub" on storage.objects for insert to authenticated
  with check (bucket_id = 'publicites' and (select public.dealer_est_admin()));
create policy "Admin supprime les visuels de pub" on storage.objects for delete to authenticated
  using (bucket_id = 'publicites' and (select public.dealer_est_admin()));

-- 7. Limite : 10 annonces actives sans le badge Pro (contrôlée par la base)
create or replace function public.dealer_produit_regles()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare
  v_touche_suspension boolean;
  v_privilegie boolean := public.dealer_est_admin() or current_user in ('postgres', 'service_role', 'supabase_admin');
begin
  if tg_op = 'INSERT' then
    v_touche_suspension := new.statut = 'suspendu';
  else
    v_touche_suspension := (new.statut = 'suspendu' or old.statut = 'suspendu') and new.statut is distinct from old.statut;
  end if;
  if v_touche_suspension and not v_privilegie then
    raise exception 'Cette annonce est suspendue par l''équipe DEALER.' using errcode = '42501';
  end if;

  if new.quantite = 0 and new.statut in ('actif', 'reserve') then
    new.statut := 'vendu';
  elsif tg_op = 'UPDATE' and old.quantite = 0 and new.quantite > 0 and new.statut = 'vendu' then
    new.statut := 'actif';
  end if;

  if new.statut in ('actif', 'reserve')
     and (tg_op = 'INSERT' or old.statut not in ('actif', 'reserve'))
     and not v_privilegie
     and not exists (select 1 from public.profiles pr where pr.id = new.vendeur_id and pr.pro_jusqua > now())
     and (select count(*) from public.produits x
          where x.vendeur_id = new.vendeur_id and x.statut in ('actif', 'reserve') and x.id <> new.id) >= 10 then
    raise exception 'LIMITE_ANNONCES: 10 annonces actives maximum sans le badge Vendeur Pro.' using errcode = 'P0001';
  end if;
  return new;
end;
$function$;

-- 8. Chiffres de l'admin : revenus et badges
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
    'messages_7j', (select count(*) from public.messages where created_at > now() - interval '7 days'),
    'pro_actifs', (select count(*) from public.profiles where pro_jusqua > now()),
    'verifies_actifs', (select count(*) from public.profiles where verifie_jusqua > now()),
    'paiements_en_attente', (select count(*) from public.paiements where statut = 'en_attente'),
    'revenus_mois', (select coalesce(sum(montant), 0) from public.paiements
                     where statut = 'valide' and traite_le >= date_trunc('month', now() at time zone 'Africa/Lubumbashi') at time zone 'Africa/Lubumbashi'),
    'revenus_pub_mois', (select coalesce(sum(montant), 0) from public.publicites
                         where created_at >= date_trunc('month', now() at time zone 'Africa/Lubumbashi') at time zone 'Africa/Lubumbashi')
  );
end;
$$;

-- 9. Rappel 3 jours avant la fin d'un badge (tous les jours à 8 h, heure de Lubumbashi)
create or replace function public.dealer_rappels_badges()
returns void language sql security definer set search_path = ''
as $$
  insert into public.notifications (user_id, type, titre, contenu, lien)
  select p.id, 'badge', 'Ton badge Vendeur Pro se termine bientôt',
         'Il expire le ' || to_char(p.pro_jusqua at time zone 'Africa/Lubumbashi', 'DD/MM/YYYY') || '. Renouvelle-le pour garder tes avantages.', '/offres'
  from public.profiles p
  where p.pro_jusqua > now() + interval '2 days' and p.pro_jusqua <= now() + interval '3 days'
  union all
  select p.id, 'badge', 'Ton badge Vendeur vérifié se termine bientôt',
         'Il expire le ' || to_char(p.verifie_jusqua at time zone 'Africa/Lubumbashi', 'DD/MM/YYYY') || '. Renouvelle-le pour le garder.', '/offres'
  from public.profiles p
  where p.verifie_jusqua > now() + interval '2 days' and p.verifie_jusqua <= now() + interval '3 days'
$$;
revoke all on function public.dealer_rappels_badges() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('dealer-rappels-badges', '0 6 * * *', 'select public.dealer_rappels_badges()');
