import type { Metadata } from 'next'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Offres from './Offres'

export const metadata: Metadata = {
  title: 'Badges Vendeur Pro et Vendeur vérifié',
  description: 'Vends plus sur DEALER : badge Pro, annonces illimitées, nom de boutique et badge Vérifié. Paiement par mobile money.',
}

export default function PageOffres() {
  return (
    <>
      <Header />
      <Offres />
      <BottomNav />
    </>
  )
}
