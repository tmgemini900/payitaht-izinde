'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, BookOpen, Route, Trophy, Menu, X, Compass, Wand2, User } from 'lucide-react'
import AIPlanModal from './AIPlanModal'
import RouteBuilderModal from './RouteBuilderModal'
import ProfilePanel from './ProfilePanel'
import { useProfile } from '@/context/ProfileContext'

const navItems = [
  { label: 'Ana Sayfa',  href: '#hero',    icon: Compass },
  { label: 'Harita',     href: '#map',     icon: Map },
  { label: 'Rotalar',    href: '#routes',  icon: Route },
  { label: 'Arşiv',      href: '#archive', icon: BookOpen },
  { label: 'Başarılar',  href: '#badges',  icon: Trophy },
]

export default function Navigation() {
  const [scrolled,      setScrolled]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [showAIModal,   setShowAIModal]   = useState(false)
  const [showRouteBuilder, setShowRouteBuilder] = useState(false)
  const [showProfile,   setShowProfile]   = useState(false)

  const { visitedCount, profile } = useProfile()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href: string) => {
    const id = href.replace('#', '')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
    setActiveSection(id)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-xl bg-[rgba(15,15,30,0.96)] shadow-[0_4px_30px_rgba(212,175,55,0.12)]'
            : 'bg-transparent'
        }`}
      >
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />

        <div className="section-container">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => scrollTo('#hero')}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[#D4AF37] opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-1 rounded-full border border-[#D4AF37] opacity-20" />
                <span className="text-base">🕌</span>
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[#D4AF37] font-bold text-xs tracking-[0.2em] uppercase calligraphy-title">
                  Payitaht&apos;ın İzinde
                </div>
                <div className="text-[#EDE0C4] text-[10px] opacity-50 tracking-widest">
                  İstanbul · Manevi Harita
                </div>
              </div>
            </motion.button>

            {/* Masaüstü menü */}
            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.href.replace('#', '')
                return (
                  <motion.button
                    key={item.href}
                    whileHover={{ y: -1 }}
                    onClick={() => scrollTo(item.href)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'text-[#D4AF37] border-b border-[#D4AF37]'
                        : 'text-[#EDE0C4] hover:text-[#D4AF37]'
                    }`}
                  >
                    <Icon size={13} />
                    {item.label}
                  </motion.button>
                )
              })}
            </div>

            {/* Sağ araç çubuğu */}
            <div className="hidden md:flex items-center gap-2">
              {/* AI Plan */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs"
                style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#D4AF37',
                  borderRadius: '2px',
                }}
                title="AI Gezi Planı"
              >
                <Wand2 size={13} />
                Gezi Planı
              </motion.button>

              {/* Rota Oluştur */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRouteBuilder(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs"
                style={{
                  background: 'rgba(139,26,26,0.15)',
                  border: '1px solid rgba(139,26,26,0.4)',
                  color: '#E05555',
                  borderRadius: '2px',
                }}
                title="Rota Oluştur"
              >
                <Route size={13} />
                Rota
              </motion.button>

              {/* Profil */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(true)}
                className="relative flex items-center gap-1.5 px-3 py-2 text-xs"
                style={{
                  background: 'rgba(26,26,46,0.8)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  color: '#EDE0C4',
                  borderRadius: '2px',
                }}
                title="Profilim"
              >
                <User size={13} />
                {profile.name}
                {visitedCount > 0 && (
                  <span
                    className="ml-1 px-1 py-0.5 text-[9px] font-bold rounded-full"
                    style={{ background: '#D4AF37', color: '#0f0f1e' }}
                  >
                    {visitedCount}
                  </span>
                )}
              </motion.button>
            </div>

            {/* Mobil sağ butonlar */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setShowAIModal(true)}
                className="text-[#D4AF37] p-2 opacity-70 hover:opacity-100"
              >
                <Wand2 size={18} />
              </button>
              <button
                onClick={() => setShowProfile(true)}
                className="text-[#EDE0C4] p-2 opacity-70 hover:opacity-100"
              >
                <User size={18} />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-[#D4AF37] p-2"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {scrolled && (
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.2)] to-transparent" />
        )}
      </motion.nav>

      {/* Mobil menü */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[rgba(8,8,20,0.98)] backdrop-blur-xl flex flex-col pt-20 px-6"
          >
            {navItems.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => scrollTo(item.href)}
                  className="flex items-center gap-4 py-4 border-b border-[rgba(212,175,55,0.1)] text-[#EDE0C4] hover:text-[#D4AF37] transition-colors text-base"
                >
                  <Icon size={18} className="text-[#D4AF37]" />
                  {item.label}
                </motion.button>
              )
            })}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              onClick={() => { setShowRouteBuilder(true); setMobileOpen(false) }}
              className="mt-6 btn-ottoman text-center text-sm flex items-center justify-center gap-2"
            >
              <Route size={14} />
              Rota Oluştur
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modallar */}
      <AIPlanModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApplyPlan={(ids) => {
          document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })
        }}
      />
      <RouteBuilderModal
        isOpen={showRouteBuilder}
        onClose={() => setShowRouteBuilder(false)}
      />
      <ProfilePanel
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  )
}
