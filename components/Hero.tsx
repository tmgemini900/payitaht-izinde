'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Map, BookOpen, Compass } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme, tc } from '@/context/ThemeContext'

function OttomanPattern({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="100" cy="100" r="90" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
      <circle cx="100" cy="100" r="70" stroke="#D4AF37" strokeWidth="0.5" opacity="0.2" />
      <circle cx="100" cy="100" r="50" stroke="#D4AF37" strokeWidth="0.5" opacity="0.2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line key={angle} x1="100" y1="100"
          x2={100 + 90 * Math.cos((angle * Math.PI) / 180)}
          y2={100 + 90 * Math.sin((angle * Math.PI) / 180)}
          stroke="#D4AF37" strokeWidth="0.4" opacity="0.2" />
      ))}
      <polygon points="100,15 115,85 185,100 115,115 100,185 85,115 15,100 85,85"
        stroke="#D4AF37" strokeWidth="0.8" fill="none" opacity="0.3" />
      {[0, 90, 180, 270].map((angle) => (
        <ellipse key={angle}
          cx={100 + 50 * Math.cos((angle * Math.PI) / 180)}
          cy={100 + 50 * Math.sin((angle * Math.PI) / 180)}
          rx="15" ry="8"
          transform={`rotate(${angle}, ${100 + 50 * Math.cos((angle * Math.PI) / 180)}, ${100 + 50 * Math.sin((angle * Math.PI) / 180)})`}
          stroke="#D4AF37" strokeWidth="0.5" fill="none" opacity="0.2" />
      ))}
    </svg>
  )
}

export default function Hero() {
  const { t } = useLanguage()
  const { isDark } = useTheme()
  const colors = tc(isDark)

  const stats = [
    { value: '124', label: t('hero_stat_turbe') },
    { value: '29',  label: t('hero_stat_sahabe') },
    { value: '14',  label: t('hero_stat_padisah') },
    { value: '7',   label: t('hero_stat_routes') },
  ]

  const scrollToMap = () => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{
        background: isDark
          ? 'linear-gradient(to bottom, #050510, #0f0f1e, #0a0a18)'
          : 'linear-gradient(to bottom, #E8D8B4, #F4ECD8, #EDE0C4)',
      }} />

      <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] opacity-20">
        <OttomanPattern className="w-full h-full" />
      </motion.div>
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] opacity-15">
        <OttomanPattern className="w-full h-full" />
      </motion.div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[80px]"
        style={{ background: isDark ? 'rgba(212,175,55,0.04)' : 'rgba(160,112,16,0.06)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[60px]"
        style={{ background: isDark ? 'rgba(139,26,26,0.06)' : 'rgba(139,26,26,0.04)' }} />

      <div className="relative z-10 section-container text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 border text-xs tracking-[0.25em] uppercase"
          style={{ borderColor: `${colors.gold}55`, color: colors.gold, borderRadius: '2px' }}
        >
          <Compass size={12} />
          {t('hero_badge')}
          <Compass size={12} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl mb-4"
          style={{ color: `${colors.gold}80` }}
        >
          ✦ ✦ ✦
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 calligraphy-title"
          style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
        >
          <span className="text-gold-gradient">Payitaht&apos;ın</span>
          <br />
          <span style={{ color: colors.text1 }}>İzinde</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl opacity-75 max-w-2xl mx-auto mb-2"
          style={{ color: colors.text2, fontFamily: "'Georgia', serif" }}
        >
          {t('hero_line1')}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base md:text-lg opacity-80 max-w-xl mx-auto mb-10"
          style={{ color: colors.gold }}
        >
          {t('hero_line2')}
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="tugra-divider max-w-lg mx-auto mb-10"
        >
          <span style={{ color: colors.gold }} className="text-lg">☽</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={scrollToMap}
            className="btn-gold flex items-center gap-3 text-base px-8 py-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            style={{ borderRadius: '2px' }}
          >
            <Map size={18} />
            {t('hero_cta_map')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-ottoman flex items-center gap-3 text-base px-8 py-4"
            style={{ borderRadius: '2px' }}
          >
            <BookOpen size={18} />
            {t('hero_cta_routes')}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="ottoman-card arabesque-border p-4 text-center"
              style={{ borderRadius: '2px' }}
            >
              <div className="text-3xl font-bold text-gold-gradient calligraphy-title mb-1">
                {stat.value}
              </div>
              <div className="text-xs opacity-60 tracking-wide" style={{ color: colors.text2 }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        onClick={scrollToMap}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-50 hover:opacity-100 transition-opacity float-animate"
        style={{ color: colors.gold }}
        aria-label={t('hero_scroll_down')}
      >
        <ChevronDown size={32} />
      </motion.button>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${colors.bg1}, transparent)` }} />
    </section>
  )
}
