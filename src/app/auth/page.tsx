'use client'
import { useEffect, useState } from 'react'
import { supabase, assurerProfil } from '@/lib/supabase'
import Header from '@/components/Header'

type Mode = 'connexion' | 'inscription' | 'verifier-email' | 'oubli' | 'nouveau-mdp'

type ErreurAuth = { code?: string; message?: string; status?: number }

// N'accepte que les redirections internes au site
function destinationSure(v: string | null) {
  return v && v.startsWith('/') && !v.startsWith('//') ? v : '/'
}

function traduireErreur(err: ErreurAuth | null): string {
  if (!err) return ''
  const code = err.code || ''
  const msg = (err.message || '').toLowerCase()
  if (code === 'invalid_credentials' || msg.includes('invalid login')) return 'Email ou mot de passe incorrect.'
  if (code === 'email_not_confirmed' || msg.includes('not confirmed')) return "Ton email n'est pas encore confirmé. Ouvre le mail de confirmation (regarde aussi dans « Spam ») et clique sur le lien."
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || err.status === 429) return 'Trop de tentatives en peu de temps. Attends une minute, puis réessaie.'
  if (code === 'user_already_exists' || code === 'email_exists' || msg.includes('already registered')) return 'Un compte existe déjà avec cet email : connecte-toi.'
  if (code === 'weak_password' || msg.includes('password should')) return 'Mot de passe trop court : au moins 6 caractères.'
  if (code === 'email_address_invalid' || msg.includes('invalid format') || msg.includes('is invalid')) return "Cette adresse email n'est pas valide."
  if (code === 'signup_disabled') return 'Les inscriptions sont fermées pour le moment.'
  if (code === 'same_password') return "Choisis un mot de passe différent de l'ancien."
  if (msg.includes('fetch') || msg.includes('network')) return 'Pas de connexion internet. Vérifie ton réseau, puis réessaie.'
  return "Ça n'a pas marché (" + (err.message || 'erreur inconnue') + '). Réessaie dans un instant.'
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 8,
  fontSize: 16, fontFamily: 'inherit', outline: 'none', background: 'white',
}
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }
const aideStyle: React.CSSProperties = { fontSize: 12, color: 'var(--text-secondary)', marginTop: 5 }
const lienStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }

export default function Auth() {
  const [mode, setMode] = useState<Mode>('connexion')
  const [suite, setSuite] = useState('/')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [voirMdp, setVoirMdp] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')
  const [erreur, setErreur] = useState('')
  const [renvoi, setRenvoi] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    const next = destinationSure(url.searchParams.get('next'))
    setSuite(next)
    const recuperation = window.location.hash.includes('type=recovery')
    if (recuperation) setMode('nouveau-mdp')
    else if (url.searchParams.get('mode') === 'inscription') setMode('inscription')

    const { data: ecoute } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') setMode('nouveau-mdp')
    })

    // Déjà connecté (ou retour du lien de confirmation) : on continue directement
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session || recuperation) return
      await assurerProfil(data.session.user).catch(() => {})
      setInfo(url.searchParams.get('confirme') ? 'Email confirmé, tu es connecté. Redirection…' : 'Tu es déjà connecté. Redirection…')
      setTimeout(() => { window.location.href = next }, 900)
    })
    return () => ecoute.subscription.unsubscribe()
  }, [])

  function changerMode(m: Mode) {
    setMode(m); setErreur(''); setInfo(''); setRenvoi(false)
  }

  function lienRetour() {
    return window.location.origin + '/auth?confirme=1' + (suite !== '/' ? '&next=' + encodeURIComponent(suite) : '')
  }

  async function handleConnexion(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErreur(''); setInfo(''); setRenvoi(false)
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      setErreur(traduireErreur(error))
      setRenvoi(error.code === 'email_not_confirmed')
      setLoading(false)
      return
    }
    await assurerProfil(data.user).catch(() => {})
    setInfo('Connecté ! Redirection…')
    window.location.href = suite
  }

  async function handleInscription(e: React.FormEvent) {
    e.preventDefault()
    setErreur(''); setInfo(''); setRenvoi(false)
    if (password.length < 6) { setErreur('Mot de passe trop court : au moins 6 caractères.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: lienRetour(),
        data: { prenom: prenom.trim(), nom: nom.trim(), telephone: telephone.trim(), ville: 'Lubumbashi' },
      },
    })
    if (error) {
      setErreur(traduireErreur(error))
      if (error.code === 'user_already_exists' || error.code === 'email_exists') setMode('connexion')
      setLoading(false)
      return
    }
    // Supabase renvoie un compte sans identité quand l'email est déjà inscrit
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setMode('connexion')
      setErreur('Un compte existe déjà avec cet email : connecte-toi, ou utilise « Mot de passe oublié ».')
      setLoading(false)
      return
    }
    if (data.session && data.user) {
      await assurerProfil(data.user).catch(() => {})
      setInfo('Compte créé ! Bienvenue sur DEALER.')
      window.location.href = suite
      return
    }
    // La confirmation par email est activée : on explique clairement la suite
    setMode('verifier-email')
    setLoading(false)
  }

  async function renvoyerEmail() {
    setLoading(true); setErreur(''); setInfo('')
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: lienRetour() } })
    if (error) setErreur(traduireErreur(error))
    else setInfo('Email renvoyé à ' + email.trim() + '. Regarde aussi dans « Spam ».')
    setLoading(false)
  }

  async function handleOubli(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErreur(''); setInfo('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + '/auth' })
    if (error) setErreur(traduireErreur(error))
    else setInfo("Si un compte existe avec cet email, tu vas recevoir un lien pour choisir un nouveau mot de passe. Regarde aussi dans « Spam ».")
    setLoading(false)
  }

  async function handleNouveauMdp(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setErreur('Mot de passe trop court : au moins 6 caractères.'); return }
    setLoading(true); setErreur('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setErreur(traduireErreur(error)); setLoading(false); return }
    setInfo('Mot de passe changé, tu es connecté. Redirection…')
    window.location.href = suite
  }

  const titres: Record<Mode, [string, string]> = {
    connexion: ['Content de te revoir', 'Connecte-toi pour publier et gérer tes annonces.'],
    inscription: ['Crée ton compte DEALER', "Gratuit. Ensuite, tu peux publier ta première annonce tout de suite."],
    'verifier-email': ['Dernière étape : confirme ton email', ''],
    oubli: ['Mot de passe oublié', "Indique ton email : on t'envoie un lien pour en choisir un nouveau."],
    'nouveau-mdp': ['Choisis un nouveau mot de passe', 'Au moins 6 caractères.'],
  }

  const champMdp = (autoComplete: string) => (
    <div>
      <label htmlFor="mdp" style={labelStyle}>Mot de passe</label>
      <div style={{ position: 'relative' }}>
        <input id="mdp" type={voirMdp ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
          placeholder="6 caractères minimum" required minLength={6} autoComplete={autoComplete} style={{ ...inputStyle, paddingRight: 84 }} />
        <button type="button" onClick={() => setVoirMdp(!voirMdp)}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', ...lienStyle, fontSize: 13 }}>
          {voirMdp ? 'Masquer' : 'Afficher'}
        </button>
      </div>
    </div>
  )

  const boutonPrincipal = (texte: string) => (
    <button type="submit" disabled={loading}
      style={{ background: loading ? 'var(--border)' : 'var(--primary)', color: 'white', fontWeight: 700, padding: '14px 0', borderRadius: 8, fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
      {loading ? 'Patiente…' : texte}
    </button>
  )

  return (
    <>
      <Header />
      <main style={{ background: 'var(--surface)', minHeight: '100vh', padding: '32px 16px 80px' }}>
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>{titres[mode][0]}</h1>
            {titres[mode][1] && <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>{titres[mode][1]}</p>}
          </div>

          {(mode === 'connexion' || mode === 'inscription') && (
            <div role="tablist" style={{ display: 'flex', background: 'var(--border)', borderRadius: 10, padding: 4, marginBottom: 20 }}>
              {(['connexion', 'inscription'] as const).map(m => (
                <button key={m} role="tab" aria-selected={mode === m} onClick={() => changerMode(m)}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: 'none', background: mode === m ? 'var(--white)' : 'transparent', color: mode === m ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {m === 'connexion' ? "J'ai déjà un compte" : 'Je crée mon compte'}
                </button>
              ))}
            </div>
          )}

          {info && <div role="status" style={{ background: '#DCFCE7', color: '#166534', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 500 }}>{info}</div>}
          {erreur && (
            <div role="alert" style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
              {erreur}
              {renvoi && <div style={{ marginTop: 8 }}><button type="button" onClick={renvoyerEmail} disabled={loading} style={{ ...lienStyle, color: '#991B1B', textDecoration: 'underline' }}>Renvoyer le mail de confirmation</button></div>}
            </div>
          )}

          <div className="card" style={{ padding: 28 }}>
            {mode === 'connexion' && (
              <form onSubmit={handleConnexion} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="email" style={labelStyle}>Email</label>
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required autoComplete="email" inputMode="email" style={inputStyle} />
                </div>
                {champMdp('current-password')}
                {boutonPrincipal('Se connecter')}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <button type="button" onClick={() => changerMode('oubli')} style={{ ...lienStyle, fontWeight: 500, color: 'var(--text-secondary)' }}>Mot de passe oublié ?</button>
                  <button type="button" onClick={() => changerMode('inscription')} style={lienStyle}>Pas de compte ? Inscris-toi</button>
                </div>
              </form>
            )}

            {mode === 'inscription' && (
              <form onSubmit={handleInscription} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label htmlFor="prenom" style={labelStyle}>Prénom</label>
                    <input id="prenom" type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="David" required autoComplete="given-name" style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="nom" style={labelStyle}>Nom <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(facultatif)</span></label>
                    <input id="nom" type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Kabeya" autoComplete="family-name" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label htmlFor="tel" style={labelStyle}>Numéro WhatsApp <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(facultatif)</span></label>
                  <input id="tel" type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+243 97 000 0000" autoComplete="tel" inputMode="tel" style={inputStyle} />
                  <p style={aideStyle}>Les acheteurs te contacteront sur ce numéro quand tu vends.</p>
                </div>
                <div>
                  <label htmlFor="email" style={labelStyle}>Email</label>
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required autoComplete="email" inputMode="email" style={inputStyle} />
                </div>
                {champMdp('new-password')}
                {boutonPrincipal('Créer mon compte')}
                <p style={{ ...aideStyle, textAlign: 'center' }}>
                  En créant un compte, tu acceptes notre <a href="/confidentialite" style={{ color: 'var(--primary)' }}>politique de confidentialité</a>.
                </p>
              </form>
            )}

            {mode === 'verifier-email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 15, lineHeight: 1.6 }}>
                <p>Ton compte est créé. Pour l'activer :</p>
                <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Ouvre ta boîte mail <b style={{ overflowWrap: 'anywhere' }}>{email.trim()}</b>.</li>
                  <li>Ouvre le message de confirmation. S'il n'est pas là, regarde dans <b>« Spam »</b> ou « Promotions ».</li>
                  <li>Clique sur le lien : tu reviens ici, déjà connecté.</li>
                </ol>
                <button type="button" onClick={renvoyerEmail} disabled={loading}
                  style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)', background: 'white', fontWeight: 700, padding: '12px 0', borderRadius: 8, fontSize: 15, cursor: 'pointer' }}>
                  {loading ? 'Patiente…' : 'Je n’ai rien reçu : renvoyer le mail'}
                </button>
                <button type="button" onClick={() => changerMode('connexion')} style={lienStyle}>J'ai confirmé : me connecter</button>
              </div>
            )}

            {mode === 'oubli' && (
              <form onSubmit={handleOubli} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="email" style={labelStyle}>Email du compte</label>
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" required autoComplete="email" inputMode="email" style={inputStyle} />
                </div>
                {boutonPrincipal('Recevoir le lien')}
                <button type="button" onClick={() => changerMode('connexion')} style={lienStyle}>← Retour à la connexion</button>
              </form>
            )}

            {mode === 'nouveau-mdp' && (
              <form onSubmit={handleNouveauMdp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {champMdp('new-password')}
                {boutonPrincipal('Enregistrer le mot de passe')}
              </form>
            )}
          </div>

          {mode === 'inscription' && (
            <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
              {[
                ['1', 'Tu remplis ce formulaire (1 minute).'],
                ['2', 'Tu publies ton article avec ses photos.'],
                ['3', 'Les acheteurs te contactent sur WhatsApp.'],
              ].map(([n, t]) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</span>
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
