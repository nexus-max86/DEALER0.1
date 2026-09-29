export default function PageProduit() {
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <a href="/" className="text-sm text-orange-500 hover:underline mb-4 inline-block">
          ← Retour aux produits
        </a>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gray-100 h-72 md:h-auto flex items-center justify-center">
              <span className="text-8xl">👟</span>
            </div>
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs bg-orange-100 text-orange-500 px-3 py-1 rounded-full font-medium">
                  Chaussures
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-3">Air Jordan 1 Retro High OG</h1>
                <p className="text-3xl font-bold text-orange-500 mt-2">85$</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">📍 Lubumbashi</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-400">Publie il y a 2 heures</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Air Jordan 1 Retro en excellent etat, portees 3 fois seulement.
                    Taille 42, coloris Chicago. Boite originale incluse.
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Etat</p>
                    <p className="text-sm font-semibold text-gray-700">Tres bon etat</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Taille</p>
                    <p className="text-sm font-semibold text-gray-700">42 EU</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold">
                    D
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">David K.</p>
                    <p className="text-xs text-gray-400">4.8 - 23 ventes</p>
                  </div>
                  <a href="/boutique/david" className="ml-auto text-xs text-orange-500 hover:underline">
                    Voir la boutique
                  </a>
                </div>
                <div className="flex gap-3">
                  <a href="/auth" className="flex-1 bg-orange-500 text-white py-3 rounded-full font-semibold hover:bg-orange-600 transition text-center">
                    Contacter le vendeur
                  </a>
                  <button className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center hover:border-orange-400 hover:text-orange-500 transition">
                    🤍
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t mt-8 py-6 text-center text-sm text-gray-400">
        2026 DEALER - La marketplace de Lubumbashi
      </footer>

    </main>
  )
}
