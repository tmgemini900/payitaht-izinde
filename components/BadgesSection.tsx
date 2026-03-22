'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import { locations } from '@/data/locations'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

const ALL_BADGES = [
  { id: 'istanbul-fatihi', name: 'İstanbul Fatihi',   icon: '⚔️', description: '14 padişah türbesini ziyaret et',     color: '#D4AF37', requirement: 14 },
  { id: 'sahabe-yolcusu', name: 'Sahabe Yolcusu',    icon: '☪️', description: '10 sahabe makamını ziyaret et',        color: '#2E8B57', requirement: 10 },
  { id: 'gonul-sultani',  name: 'Gönül Sultanı',      icon: '✨', description: 'Dört manevi direği ziyaret et',        color: '#8B1A1A', requirement: 4  },
  { id: 'ilim-talebesi',  name: 'İlim Talebesi',      icon: '📚', description: '5 alim kabrini ziyaret et',           color: '#3498DB', requirement: 5  },
  { id: 'devlet-ricali',  name: 'Devlet Ricali',      icon: '🏛️', description: '8 vezir türbesini ziyaret et',       color: '#9B59B6', requirement: 8  },
  { id: 'kultur-mirasci', name: 'Kültür Mirasçısı',   icon: '🎭', description: '5 kültür insanını ziyaret et',        color: '#E67E22', requirement: 5  },
  { id: 'mimar-sinan',    name: "Sinan'ın İzinde",    icon: '⚒️', description: '3 Mimar Sinan eserini ziyaret et',   color: '#4A90D9', requirement: 3  },
  { id: 'istanbul-rehberi', name: 'İstanbul Rehberi', icon: '🗺️', description: '50 konumu ziyaret et',               color: '#F0D060', requirement: 50 },
]

export default function BadgesSection() {
  const { profile, visitedCount } = useProfile()
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const colors = tc(isDark)
  const earnedBadges = new Set(profile.badges)
  const totalLocs = locations.length

  return (
    <section id="badges" className="py-20 relative">
      <div className="absolute inset-0" style={{
        background: isDark
          ? 'linear-gradient(to bottom, #0f0f1e, #050510)'
          : 'linear-gradient(to bottom, #EDE0C4, #E8D8B4)',
      }} />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 border text-xs tracking-widest uppercase"
            style={{ borderColor: `${colors.gold}50`, color: colors.gold, borderRadius: '2px' }}
          >
            <Trophy size={12} />
            {t('badges_section_badge')}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-gold-gradient calligraphy-title mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t('badges_title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="opacity-55 max-w-lg mx-auto text-sm"
            style={{ color: colors.text2 }}
          >
            {t('badges_desc')}
          </motion.p>
        </div>

        {/* Badges grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ALL_BADGES.map((badge, i) => {
            const isEarned = earnedBadges.has(badge.id)
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="ottoman-card text-center p-5 cursor-pointer"
                style={{
                  borderRadius: '4px',
                  border: `1px solid ${isEarned ? badge.color + '66' : colors.border}`,
                  opacity: isEarned ? 1 : 0.5,
                  transition: 'all 0.3s ease',
                }}
              >
                <div className="relative inline-flex items-center justify-center mb-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                    style={{
                      background: isEarned
                        ? `radial-gradient(circle, ${badge.color}33, ${badge.color}11)`
                        : `rgba(255,255,255,0.03)`,
                      border: `2px solid ${isEarned ? badge.color + '66' : colors.border}`,
                      filter: isEarned ? 'none' : 'grayscale(100%)',
                    }}
                  >
                    {isEarned ? badge.icon : <span className="text-2xl opacity-20">🔒</span>}
                  </div>
                  {isEarned && (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                      style={{ border: `1px solid ${badge.color}44` }}
                    />
                  )}
                </div>

                <h3
                  className="text-sm font-bold mb-1"
                  style={{
                    color: isEarned ? colors.text1 : colors.muted,
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  {badge.name}
                </h3>

                <p className="text-[10px] leading-relaxed"
                  style={{ color: isEarned ? badge.color : `${badge.color}40` }}>
                  {badge.description}
                </p>

                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: `${colors.gold}08` }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: isEarned ? '100%' : '0%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="h-full transition-all"
                    style={{ background: `linear-gradient(90deg, ${badge.color}88, ${badge.color})` }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Fog of War */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 p-6 text-center"
          style={{
            background: `${colors.gold}05`,
            border: `1px solid ${colors.border}`,
            borderRadius: '4px',
          }}
        >
          <div className="text-3xl mb-3">🌫️</div>
          <h3
            className="font-bold text-xl mb-3"
            style={{ color: colors.text1, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t('badges_fog_title')}
          </h3>
          <p className="opacity-55 max-w-md mx-auto text-sm leading-relaxed" style={{ color: colors.text2 }}>
            {t('badges_fog_desc')}
          </p>

          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-gradient calligraphy-title">{visitedCount}</div>
              <div className="text-xs opacity-35" style={{ color: colors.text2 }}>{t('badges_visited')}</div>
            </div>
            <div className="w-px h-8" style={{ background: `${colors.gold}20` }} />
            <div className="text-center">
              <div className="text-2xl font-bold opacity-50" style={{ color: colors.text2 }}>{totalLocs}</div>
              <div className="text-xs opacity-35" style={{ color: colors.text2 }}>{t('badges_total')}</div>
            </div>
            <div className="w-px h-8" style={{ background: `${colors.gold}20` }} />
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: visitedCount > 0 ? colors.gold : colors.muted }}>
                %{Math.round((visitedCount / totalLocs) * 100)}
              </div>
              <div className="text-xs opacity-35" style={{ color: colors.text2 }}>{t('badges_completed')}</div>
            </div>
          </div>

          <div className="mt-4 max-w-xs mx-auto h-1.5 rounded-full overflow-hidden" style={{ background: `${colors.gold}08` }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(visitedCount / totalLocs) * 100}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #8B1A1A, #D4AF37)' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
