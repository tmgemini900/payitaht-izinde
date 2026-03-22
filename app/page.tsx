import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import InteractiveMap from '@/components/InteractiveMap'
import ThematicRoutes from '@/components/ThematicRoutes'
import ArchiveSection from '@/components/ArchiveSection'
import BadgesSection from '@/components/BadgesSection'
import EvliyaGuide from '@/components/EvliyaGuide'

export default function Home() {
  return (
    <main className="min-h-screen ottoman-pattern">
      <Navigation />
      <Hero />
      <InteractiveMap />
      <ThematicRoutes />
      <ArchiveSection />
      <BadgesSection />

      {/* Footer */}
      <footer className="relative py-12 border-t border-[rgba(212,175,55,0.15)]">
        <div className="absolute inset-0 bg-[#050510]" />
        <div className="section-container relative z-10 text-center">
          <div className="text-[#D4AF37] text-lg mb-2">✦ ✦ ✦</div>
          <div
            className="text-xl font-bold text-gold-gradient calligraphy-title mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Payitaht&apos;ın İzinde
          </div>
          <p className="text-[#EDE0C4] text-xs opacity-40 max-w-md mx-auto">
            İstanbul&apos;un manevi ve tarihi coğrafyasını dijital dünyaya taşıyan bu proje,
            şehrin ebedi sakinlerinin hatırasına ithaf edilmiştir.
          </p>
          <div className="mt-6 text-[#EDE0C4] text-xs opacity-25">
            © 2025 Payitaht&apos;ın İzinde · Tüm hakları saklıdır
          </div>
        </div>
      </footer>

      {/* Evliya Çelebi yapay zeka rehberi */}
      <EvliyaGuide />
    </main>
  )
}
