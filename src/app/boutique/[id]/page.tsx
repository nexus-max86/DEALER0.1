'use client'

export default function Boutique() {
  const produits = [
    { nom: 'Air Jordan 1 Retro', prix: '85$', cat: 'Chaussures', icon: '👟' },
    { nom: 'iPhone 13 128Go', prix: '450$', cat: 'Telephones', icon: '📱' },
    { nom: 'Veste en jean', prix: '35$', cat: 'Vetements', icon: '👕' },
    { nom: 'Nike Air Max 90', prix: '75$', cat: 'Chaussures', icon: '👟' },
    { nom: 'Samsung Galaxy A54', prix: '280$', cat: 'Telephones', icon: '📱' },
    { nom: 'Sac a main', prix: '40$', cat: 'Accessoires', icon: '👜' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="text-2xl font-bold text-orange-500">DEALER</a>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-36">
        <div className="max-w-4xl mx-auto px-4 h-full flex items-end pb-0">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-bold text-orange-500 translate-y-10 border-4 border-white">
            D
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-14 pb-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">David K.</h1>
              <p className="text-sm text-gray-400 mt-1">Lubumbashi - Membre depuis juin 2026</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">23</p>
                  <p className="text-xs text-gray-400">Ventes</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">4.8</p>
                  <p className="text-xs text-gray-400">Note</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">6</p>
                  <p className="text-xs text-gray-400">Produits</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3 max-w-md">
                Vendeur serieux a Lubumbashi. Sneakers, telephones et vetements de qualite.
              </p>
            </div>
            <button className="bg-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition">
              Contacter
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium">Verifie</span>
            <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">Repond vite</span>
            <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium">Top vendeur</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Les produits de David ({produits.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {produits.map((produit, i) => (
            <div
              key={i}
              onClick={() => { window.location.href = '/produit/1' }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="bg-gray-100 rounded-t-xl h-36 flex items-center justify-center">
                <span className="text-5xl">{produit.icon}</span>
              </div>
              <div className="p-3">
                <p className="text-xs text-orange-500 font-medium">{produit.cat}</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{produit.nom}</p>
                <p className="text-base font-bold text-gray-900 mt-1">{produit.prix}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Avis des acheteurs</h2>
        <div className="space-y-3">
          {[
            { nom: 'Marie K.', note: 5, texte: 'Livraison rapide, produit conforme. Je recommande !', date: 'Il y a 3 jours' },
            { nom: 'Jean-Pierre M.', note: 5, texte: 'Vendeur tres serieux, iPhone en parfait etat.', date: 'Il y a 1 semaine' },
            { nom: 'Amina B.', note: 4, texte: 'Bon produit, communication rapide.', date: 'Il y a 2 semaines' },
          ].map((avis, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold text-sm">
                    {avis.nom[0]}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{avis.nom}</span>
                </div>
                <span className="text-xs text-gray-400">{avis.date}</span>
              </div>
              <p className="text-yellow-400 text-sm">{'⭐'.repeat(avis.note)}</p>
              <p className="text-sm text-gray-500 mt-1">{avis.texte}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-white border-t py-6 text-center text-sm text-gray-400">
        2026 DEALER - La marketplace de Lubumbashi
      </footer>

    </main>
  )
}
