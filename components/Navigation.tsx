'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, BookOpen, Route, Trophy, Menu, X, Compass, Wand2, User, Sun, Moon } from 'lucide-react'
import AIPlanModal from './AIPlanModal'
import RouteBuilderModal from './RouteBuilderModal'
import ProfilePanel from './ProfilePanel'
import { useProfile } from '@/context/ProfileContext'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

export default function Navigation() {
  const [scrolled,         setScrolled]         = useState(false)
  const [mobileOpen,       setMobileOpen]       = useState(false)
  const [activeSection,    setActiveSection]    = useState('hero')
  const [showAIModal,      setShowAIModal]      = useState(false)
  const [showRouteBuilder, setShowRouteBuilder] = useState(false)
  const [showProfile,      setShowProfile]      = useState(false)

  const { visitedCount, profile } = useProfile()
  const { isDark, toggleTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const colors = tc(isDark)

  const navItems = [
    { label: t('nav_home'),    href: '#hero',    icon: Compass },
    { label: t('nav_map'),     href: '#map',     icon: Map },
    { label: t('nav_routes'),  href: '#routes',  icon: Route },
    { label: t('nav_archive'), href: '#archive', icon: BookOpen },
    { label: t('nav_badges'),  href: '#badges',  icon: Trophy },
  ]

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
          scrolled ? 'shadow-[0_4px_30px_rgba(212,175,55,0.12)]' : ''
        }`}
        style={{
          backdropFilter: scrolled ? 'blur(20px)' : undefined,
          background: scrolled ? colors.navBg : 'transparent',
        }}
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
                <div className="absolute inset-0 rounded-full border opacity-50 group-hover:opacity-100 transition-opacity" style={{ borderColor: colors.gold }} />
                <div className="absolute inset-1 rounded-full border opacity-20" style={{ borderColor: colors.gold }} />
                <span className="text-base">🕌</span>
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-xs tracking-[0.2em] uppercase calligraphy-title" style={{ color: colors.gold }}>
                  Payitaht&apos;ın İzinde
                </div>
                <div className="text-[10px] opacity-50 tracking-widest" style={{ color: colors.text2 }}>
                  {t('nav_subtitle')}
                </div>
              </div>
            </motion.button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.href.replace('#', '')
                return (
                  <motion.button
                    key={item.href}
                    whileHover={{ y: -1 }}
                    onClick={() => scrollTo(item.href)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs tracking-wide transition-all duration-200"
                    style={{
                      color: isActive ? colors.gold : colors.text2,
                      borderBottom: isActive ? `1px solid ${colors.gold}` : '1px solid transparent',
                    }}
                  >
                    <Icon size={13} />
                    {item.label}
                  </motion.button>
                )
              })}
            </div>

            {/* Right toolbar */}
            <div className="hidden md:flex items-center gap-2">
              {/* Language toggle */}
              <div className="flex items-center rounded overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
                {(['tr', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className="px-2.5 py-1.5 text-xs font-medium transition-all"
                    style={{
                      background: lang === l ? colors.gold : 'transparent',
                      color: lang === l ? (isDark ? '#0f0f1e' : '#F4ECD8') : colors.muted,
                    }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-2 text-xs transition-all"
                style={{
                  background: `${colors.gold}15`,
                  border: `1px solid ${colors.border}`,
                  color: colors.gold,
                  borderRadius: '2px',
                }}
                title={isDark ? t('nav_theme_light') : t('nav_theme_dark')}
              >
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                <span className="hidden lg:inline">{isDark ? t('nav_theme_light') : t('nav_theme_dark')}</span>
              </motion.button>

              {/* AI Plan */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs"
                style={{
                  background: `${colors.gold}12`,
                  border: `1px solid ${colors.border}`,
                  color: colors.gold,
                  borderRadius: '2px',
                }}
                title={t('nav_plan')}
              >
                <Wand2 size={13} />
                {t('nav_plan')}
              </motion.button>

              {/* Route */}
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
                title={t('nav_route_btn')}
              >
                <Route size={13} />
                {t('nav_route_btn')}
              </motion.button>

              {/* Profile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(true)}
                className="relative flex items-center gap-1.5 px-3 py-2 text-xs"
                style={{
                  background: colors.inputBg,
                  border: `1px solid ${colors.border}`,
                  color: colors.text2,
                  borderRadius: '2px',
                }}
                title={t('profile_title')}
              >
                <User size={13} />
                {profile.name}
                {visitedCount > 0 && (
                  <span
                    className="ml-1 px-1 py-0.5 text-[9px] font-bold rounded-full"
                    style={{ background: colors.gold, color: isDark ? '#0f0f1e' : '#F4ECD8' }}
                  >
                    {visitedCount}
                  </span>
                )}
              </motion.button>
            </div>

            {/* Mobile right buttons */}
            <div className="md:hidden flex items-center gap-1">
              {/* Language toggle mobile */}
              <div className="flex items-center rounded overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
                {(['tr', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className="px-2 py-1 text-[10px] font-medium transition-all"
                    style={{
                      background: lang === l ? colors.gold : 'transparent',
                      color: lang === l ? (isDark ? '#0f0f1e' : '#F4ECD8') : colors.muted,
                    }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <button onClick={toggleTheme} className="p-2 opacity-70 hover:opacity-100" style={{ color: colors.gold }}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setShowAIModal(true)} className="p-2 opacity-70 hover:opacity-100" style={{ color: colors.gold }}>
                <Wand2 size={18} />
              </button>
              <button onClick={() => setShowProfile(true)} className="p-2 opacity-70 hover:opacity-100" style={{ color: colors.text2 }}>
                <User size={18} />
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2" style={{ color: colors.gold }}>
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {scrolled && (
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.2)] to-transparent" />
        )}
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 backdrop-blur-xl flex flex-col pt-20 px-6"
            style={{ background: isDark ? 'rgba(8,8,20,0.98)' : 'rgba(244,236,216,0.98)' }}
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
                  className="flex items-center gap-4 py-4 text-base transition-colors"
                  style={{
                    borderBottom: `1px solid ${colors.border}`,
                    color: colors.text2,
                  }}
                >
                  <Icon size={18} style={{ color: colors.gold }} />
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
              {t('nav_route_btn')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AIPlanModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApplyPlan={() => {
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
