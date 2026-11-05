import type { Metadata } from 'next'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import GuideInstallation from '@/components/GuideInstallation'

export const metadata: Metadata = {
  title: 'Installer DEALER sur ton téléphone',
  description: 'Guide en images pour installer DEALER sur Android et iPhone, gratuitement et en moins d’une minute.',
}

export default function Installer() {
  return (
    <>
      <Header />
      <GuideInstallation />
      <BottomNav />
    </>
  )
}
