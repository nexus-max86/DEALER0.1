"use client"
import { useState } from "react"

export default function Vendre() {
  const [etape, setEtape] = useState(1)
  const [categorie, setCategorie] = useState("")

  const categories = [
    { icon: "👟", nom: "Chaussures" },
    { icon: "👕", nom: "Vêtements" },
    { icon: "📱", nom: "Téléphones" },
    { icon: "💄", nom: "Beauté" },
    { icon: "🎮", nom: "Électronique" },
    { icon: "🚗", nom: "Automobile" },
    { icon: "🏠", nom: "Maison" },
    { icon: "📦", nom: "Autre" },
  ]

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-orange-500">DEALER</a>
          <span className="text-sm text-gray-400">Publier une annonce</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* BARRE DE PROGRESSION */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                etape >= n ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {n}
              </div>
              <span className={`text-xs font-medium ${etape >= n ? "text-orange-500" : "text-gray-400"}`}>
                {n === 1 ? "Catégorie" : n === 2 ? "Détails" : "Photos"}
              </span>
              {n < 3 && <div className={`flex-1 h-1 rounded ${etape > n ? "bg-orange-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">

          {/* ETAPE 1 — CATEGORIE */}
          {etape === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Quelle catégorie ?</h2>
              <p className="text-sm text-gray-400 mb-6">Choisis la catégorie qui correspond à ton produit</p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.nom}
                    onClick={() => setCategorie(cat.nom)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition ${
                      categorie === cat.nom
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-100 hover:border-orange-200"
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{cat.nom}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => categorie && setEtape(2)}
                className={`w-full mt-6 py-3 rounded-full font-semibold transition ${
                  categorie
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continuer →
              </button>
            </div>
          )}

          {/* ETAPE 2 — DETAILS */}
          {etape === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Détails du produit</h2>
              <p className="text-sm text-gray-400 mb-6">Plus c'est détaillé, plus tu vendras vite</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Titre de l'annonce</label>
                  <input
                    type="text"
                    placeholder="Ex: Air Jordan 1 Retro taille 42 comme neuf"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Décris ton produit : état, taille, couleur, pourquoi tu vends..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Prix ($)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">État</label>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
                      <option>Neuf avec étiquette</option>
                      <option>Très bon état</option>
                      <option>Bon état</option>
                      <option>État correct</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Ville</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
                    <option>Lubumbashi</option>
                    <option>Kinshasa</option>
                    <option>Kolwezi</option>
                    <option>Likasi</option>
                    <option>Goma</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEtape(1)}
                    className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-500 hover:border-orange-400 hover:text-orange-500 transition"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => setEtape(3)}
                    className="flex-1 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                  >
                    Continuer →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ETAPE 3 — PHOTOS */}
          {etape === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Ajoute des photos</h2>
              <p className="text-sm text-gray-400 mb-6">Les annonces avec photos se vendent 3x plus vite</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {/* Photo principale */}
                <div className="col-span-3 border-2 border-dashed border-orange-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50 transition">
                  <span className="text-4xl mb-2">📷</span>
                  <p className="text-sm font-medium text-orange-500">Photo principale</p>
                  <p className="text-xs text-gray-400 mt-1">Clique pour ajouter</p>
                </div>
                {/* Photos secondaires */}
                {[1, 2, 3].map((n) => (
                  <div key={n} className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex items-center justify-center cursor-pointer hover:border-orange-300 transition">
                    <span className="text-2xl">➕</span>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-orange-600 font-medium">💡 Conseils pour de bonnes photos</p>
                <ul className="text-xs text-orange-500 mt-1 space-y-0.5">
                  <li>• Prends les photos en pleine lumière naturelle</li>
                  <li>• Montre le produit sous plusieurs angles</li>
                  <li>• Photographie les défauts si il y en a</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEtape(2)}
                  className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-500 hover:border-orange-400 hover:text-orange-500 transition"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => alert("🎉 Annonce publiée ! (La connexion Supabase sera ajoutée prochainement)")}
                  className="flex-1 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                >
                  Publier l'annonce 🚀
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </main>
  )
}