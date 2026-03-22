'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import InteractiveMap from '@/components/InteractiveMap'
import ThematicRoutes from '@/components/ThematicRoutes'
import ArchiveSection from '@/components/ArchiveSection'
import BadgesSection from '@/components/BadgesSection'
import EvliyaGuide from '@/components/EvliyaGuide'
import WelcomeModal from '@/components/WelcomeModal'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme, tc } from '@/context/ThemeContext'

export default function Home() {
  const [activeRouteId,     setActiveRouteId]     = useState<string | null>(null)
  const [triggerLocationId, setTriggerLocationId] = useState<number | null>(null)

  const { t } = useLanguage()
  const { isDark } = useTheme()
  const colors = tc(isDark)

  // Handle ?loc=ID deep link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const locId  = params.get('loc')
    if (locId) {
      const id = parseInt(locId, 10)
      if (!isNaN(id)) {
        setTriggerLocationId(id)
        // Scroll to map after a brief delay
        setTimeout(() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' }), 600)
        // Clean the URL without causing a navigation
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  const handleRouteActivate = (routeId: string | null) => {
    setActiveRouteId(routeId)
    if (routeId) {
      setTimeout(() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  return (
    <main className="min-h-screen ottoman-pattern">
      <WelcomeModal />
      <Navigation />
      <Hero />
      <InteractiveMap
        externalRouteId={activeRouteId}
        onExternalRouteChange={setActiveRouteId}
        triggerLocationId={triggerLocationId}
      />
      <ThematicRoutes onRouteActivate={handleRouteActivate} activeRouteId={activeRouteId} />
      <ArchiveSection />
      <BadgesSection />

      {/* Footer */}
      <footer className="relative py-12 border-t" style={{ borderColor: colors.border }}>
        <div className="absolute inset-0" style={{ background: isDark ? '#050510' : '#E8D8B4' }} />
        <div className="section-container relative z-10 text-center">
          <div className="text-[#D4AF37] text-lg mb-2">✦ ✦ ✦</div>
          <div
            className="text-xl font-bold text-gold-gradient calligraphy-title mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Payitaht&apos;ın İzinde
          </div>
          <p className="text-sm opacity-40 max-w-md mx-auto" style={{ color: colors.text2 }}>
            {t('footer_dedication')}
          </p>
          <div className="mt-6 text-xs opacity-25" style={{ color: colors.text2 }}>
            {t('footer_rights')}
          </div>
        </div>
      </footer>

      <EvliyaGuide />
    </main>
  )
}
