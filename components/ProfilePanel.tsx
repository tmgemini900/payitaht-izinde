'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Map, Trophy, Trash2, Route, Edit2, Check, Star, Share2 } from 'lucide-react'
import { useProfile, BADGE_CONDITIONS } from '@/context/ProfileContext'
import { locations, categoryConfig } from '@/data/locations'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

type Tab = 'stats' | 'routes' | 'badges'

interface ProfilePanelProps {
  isOpen: boolean
  onClose: () => void
}

const ALL_BADGES = [
  { id: 'istanbul-fatihi', name: 'İstanbul Fatihi',  icon: '⚔️', description: '14 padişah türbesi', color: '#D4AF37' },
  { id: 'sahabe-yolcusu', name: 'Sahabe Yolcusu',   icon: '☪️', description: '10 sahabe makamı',   color: '#2E8B57' },
  { id: 'gonul-sultani',  name: 'Gönül Sultanı',     icon: '✨', description: 'Dört manevi direk',   color: '#8B1A1A' },
  { id: 'ilim-talebesi',  name: 'İlim Talebesi',     icon: '📚', description: '5 alim kabri',        color: '#3498DB' },
  { id: 'devlet-ricali',  name: 'Devlet Ricali',     icon: '🏛️', description: '8 vezir türbesi',    color: '#9B59B6' },
  { id: 'kultur-mirasci', name: 'Kültür Mirasçısı',  icon: '🎭', description: '5 kültür insanı',    color: '#E67E22' },
  { id: 'mimar-sinan',    name: "Sinan'ın İzinde",   icon: '⚒️', description: '3 Sinan eseri',      color: '#4A90D9' },
  { id: 'istanbul-rehberi', name: 'İstanbul Rehberi',icon: '🗺️', description: '50 konum',           color: '#F0D060' },
]

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { profile, setName, deleteRoute, visitedCount, clearAll } = useProfile()
  const [activeTab,     setActiveTab]     = useState<Tab>('stats')
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput,     setNameInput]     = useState(profile.name)
  const [confirmClear,  setConfirmClear]  = useState(false)
  const [shareCopied,   setShareCopied]   = useState(false)
  const { isDark } = useTheme()
  const { t, lang } = useLanguage()
  const colors = tc(isDark)

  const saveName = () => {
    if (nameInput.trim()) setName(nameInput.trim())
    setIsEditingName(false)
  }

  const handleShareStats = async () => {
    const totalLocs = locations.length
    const pct       = Math.round((visitedCount / totalLocs) * 100)
    const badgeIcons = profile.badges
      .map(id => BADGE_CONDITIONS.find(b => b.id === id)?.icon ?? '')
      .join(' ')
    const text = lang === 'tr'
      ? `İstanbul'u %${pct} keşfettim! ${visitedCount} mekan ziyaret ettim.${badgeIcons ? ` Rozetlerim: ${badgeIcons}` : ''} 🗺️ payitaht-izinde.vercel.app`
      : `I've explored ${pct}% of Istanbul! Visited ${visitedCount} locations.${badgeIcons ? ` Badges: ${badgeIcons}` : ''} 🗺️ payitaht-izinde.vercel.app`

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: lang === 'tr' ? "Payitaht'ın İzinde" : 'In the Footsteps of the Capital', text, url: 'https://payitaht-izinde.vercel.app' })
        return
      } catch { /* fall through */ }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    } catch { /* ignore */ }
  }

  const visitedByCategory = Object.keys(categoryConfig).reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = profile.visitedIds.filter(id => locations.find(l => l.id === id)?.category === cat).length
    return acc
  }, {})

  const totalByCategory = Object.keys(categoryConfig).reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = locations.filter(l => l.category === cat).length
    return acc
  }, {})

  const earnedBadges = new Set(profile.badges)

  const tabs = [
    { id: 'stats'  as Tab, label: t('profile_stats_tab'),  icon: User },
    { id: 'routes' as Tab, label: t('profile_routes_tab'), icon: Route },
    { id: 'badges' as Tab, label: t('profile_badges_tab'), icon: Trophy },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col overflow-hidden"
            style={{
              background: isDark
                ? 'linear-gradient(180deg, #0d0d1e, #080814)'
                : 'linear-gradient(180deg, #F4ECD8, #EDE0C4)',
              borderLeft: `1px solid ${colors.border}`,
              boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
            }}
          >
            <div className="h-1 bg-gradient-to-r from-[#8B1A1A] to-[#D4AF37]" />

            {/* Profile header */}
            <div className="flex-shrink-0 p-5 border-b" style={{ borderColor: `${colors.gold}15` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl cursor-default"
                    style={{
                      background: `radial-gradient(circle, ${colors.gold}22, ${colors.gold}06)`,
                      border: `2px solid ${colors.gold}44`,
                    }}
                  >
                    {profile.avatar ?? '🧭'}
                  </motion.div>
                  <div>
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={e => setNameInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveName()}
                          autoFocus
                          maxLength={25}
                          className="text-sm outline-none bg-transparent border-b"
                          style={{ color: colors.text1, borderColor: colors.gold, width: '9rem' }}
                        />
                        <button onClick={saveName} style={{ color: colors.gold }}>
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: colors.text1, fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {profile.name}
                        </span>
                        <button
                          onClick={() => { setNameInput(profile.name); setIsEditingName(true) }}
                          className="opacity-40 hover:opacity-80 transition-opacity"
                          style={{ color: colors.gold }}
                          title={t('profile_edit')}
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                    <div className="text-xs opacity-40 mt-0.5" style={{ color: colors.text2 }}>
                      {t('profile_explorer')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShareStats}
                    className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
                    style={{
                      background: shareCopied ? 'rgba(46,139,87,0.2)' : `${colors.gold}15`,
                      border: `1px solid ${shareCopied ? 'rgba(46,139,87,0.5)' : colors.gold + '33'}`,
                      color: shareCopied ? '#2E8B57' : colors.gold,
                    }}
                    title={t('share_stats')}
                  >
                    <AnimatePresence mode="wait">
                      {shareCopied
                        ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={13} /></motion.span>
                        : <motion.span key="s" initial={{ scale: 0 }} animate={{ scale: 1 }}><Share2 size={13} /></motion.span>
                      }
                    </AnimatePresence>
                  </motion.button>
                  <button onClick={onClose} className="opacity-40 hover:opacity-80 transition-opacity" style={{ color: colors.text2 }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: t('profile_stat_visit'), value: visitedCount, icon: '📍' },
                  { label: t('profile_stat_route'), value: profile.savedRoutes.length, icon: '🗺️' },
                  { label: t('profile_stat_badge'), value: profile.badges.length, icon: '🏅' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="text-center p-2"
                    style={{
                      background: `${colors.gold}08`,
                      border: `1px solid ${colors.gold}15`,
                      borderRadius: '3px',
                    }}
                  >
                    <div className="text-xs mb-0.5">{stat.icon}</div>
                    <div className="font-bold text-lg leading-none" style={{ color: colors.gold }}>{stat.value}</div>
                    <div className="text-[10px] opacity-40 mt-0.5" style={{ color: colors.text2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 flex border-b" style={{ borderColor: `${colors.gold}12` }}>
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] tracking-wide transition-all"
                    style={{
                      color: isActive ? colors.gold : colors.muted,
                      borderBottom: `2px solid ${isActive ? colors.gold : 'transparent'}`,
                    }}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">

              {/* Stats tab */}
              {activeTab === 'stats' && (
                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-widest" style={{ color: colors.gold }}>{t('profile_general_progress')}</span>
                      <span className="text-xs opacity-50" style={{ color: colors.text2 }}>
                        {visitedCount}/{locations.length} ({Math.round(visitedCount / locations.length * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: `${colors.gold}08` }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(visitedCount / locations.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #8B1A1A, #D4AF37)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-widest mb-3" style={{ color: colors.gold }}>
                      {t('profile_by_category')}
                    </div>
                    <div className="space-y-2.5">
                      {Object.entries(categoryConfig).map(([cat, cfg]) => {
                        const visited = visitedByCategory[cat] ?? 0
                        const total = totalByCategory[cat] ?? 0
                        const pct = total > 0 ? (visited / total) * 100 : 0
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs flex items-center gap-1.5" style={{ color: cfg.color }}>
                                {cfg.icon} {cfg.label}
                              </span>
                              <span className="text-[10px] opacity-40" style={{ color: colors.text2 }}>
                                {visited}/{total}
                              </span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: `${colors.gold}06` }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full rounded-full"
                                style={{ background: cfg.color }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t" style={{ borderColor: `${colors.gold}08` }}>
                    {!confirmClear ? (
                      <button
                        onClick={() => setConfirmClear(true)}
                        className="flex items-center gap-2 text-xs text-red-400 opacity-40 hover:opacity-70 transition-opacity"
                      >
                        <Trash2 size={12} />
                        {t('profile_reset')}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-red-400 opacity-70">{t('profile_confirm_reset')}</span>
                        <button
                          onClick={() => { clearAll(); setConfirmClear(false) }}
                          className="text-xs text-red-400 border border-red-400 border-opacity-40 px-2 py-1 hover:bg-red-900 hover:bg-opacity-20 transition-all"
                          style={{ borderRadius: '2px' }}
                        >
                          {t('profile_yes')}
                        </button>
                        <button
                          onClick={() => setConfirmClear(false)}
                          className="text-xs opacity-50 hover:opacity-80"
                          style={{ color: colors.text2 }}
                        >
                          {t('profile_cancel')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Routes tab */}
              {activeTab === 'routes' && (
                <div className="p-4">
                  {profile.savedRoutes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-3xl mb-3">🗺️</div>
                      <div className="text-sm opacity-40" style={{ color: colors.text2 }}>
                        {t('profile_no_routes')}
                      </div>
                      <div className="text-xs opacity-25 mt-1" style={{ color: colors.text2 }}>
                        {t('profile_no_routes_hint')}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profile.savedRoutes.map(route => (
                        <motion.div
                          key={route.id}
                          layout
                          className="p-3"
                          style={{
                            background: `${route.color}0A`,
                            border: `1px solid ${route.color}25`,
                            borderRadius: '4px',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{route.icon}</span>
                              <div>
                                <div className="text-sm font-semibold" style={{ color: colors.text1, fontFamily: "'Georgia', serif" }}>
                                  {route.name}
                                </div>
                                {route.description && (
                                  <div className="text-[11px] opacity-45 mt-0.5 leading-relaxed" style={{ color: colors.text2 }}>
                                    {route.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteRoute(route.id)}
                              className="text-red-400 opacity-30 hover:opacity-70 flex-shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] opacity-40" style={{ color: colors.text2 }}>
                              📍 {route.locationIds.length} {t('profile_locations')}
                            </span>
                            <span className="text-[10px] opacity-30" style={{ color: colors.text2 }}>
                              {new Date(route.createdAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Badges tab */}
              {activeTab === 'badges' && (
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {ALL_BADGES.map(badge => {
                      const isEarned = earnedBadges.has(badge.id)
                      return (
                        <motion.div
                          key={badge.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-3 text-center"
                          style={{
                            background: isEarned ? `${badge.color}12` : `${colors.gold}04`,
                            border: `1px solid ${isEarned ? badge.color + '44' : colors.border}`,
                            borderRadius: '4px',
                            opacity: isEarned ? 1 : 0.45,
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-2"
                            style={{
                              background: isEarned
                                ? `radial-gradient(circle, ${badge.color}30, ${badge.color}10)`
                                : `${colors.gold}06`,
                              border: `2px solid ${isEarned ? badge.color + '66' : colors.border}`,
                              filter: isEarned ? 'none' : 'grayscale(1)',
                            }}
                          >
                            {isEarned ? badge.icon : '🔒'}
                          </div>
                          <div
                            className="text-xs font-semibold mb-1"
                            style={{
                              color: isEarned ? colors.text1 : colors.muted,
                              fontFamily: "'Georgia', serif",
                            }}
                          >
                            {badge.name}
                          </div>
                          <div className="text-[10px]" style={{ color: isEarned ? badge.color : colors.muted }}>
                            {badge.description}
                          </div>
                          {isEarned && (
                            <div className="mt-1.5 flex items-center justify-center gap-1">
                              <Star size={8} style={{ color: badge.color }} />
                              <span className="text-[9px]" style={{ color: badge.color, opacity: 0.7 }}>
                                {t('profile_badge_earned')}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
