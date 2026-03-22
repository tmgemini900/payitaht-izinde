'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Search, Filter, X, Wand2, Route } from 'lucide-react'
import { locations, Location, LocationCategory, categoryConfig, thematicRoutes } from '@/data/locations'
import { useProfile } from '@/context/ProfileContext'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import type { Translations } from '@/data/translations'
import LocationCard from './LocationCard'
import AIPlanModal from './AIPlanModal'
import RouteBuilderModal from './RouteBuilderModal'

const MapContainer = dynamic(
  () => import('./LeafletMap'),
  { ssr: false, loading: () => <MapSkeleton /> }
)

function MapSkeleton() {
  const { isDark } = useTheme()
  const { t } = useLanguage()
  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: isDark ? 'radial-gradient(ellipse at center, #1a1a2e, #0f0f1e)' : 'radial-gradient(ellipse at center, #EDE0C4, #F4ECD8)' }}>
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-t-transparent rounded-full mx-auto mb-4"
          style={{ borderColor: '#D4AF37' }}
        />
        <div className="text-sm tracking-widest" style={{ color: '#D4AF37' }}>{t('map_loading')}</div>
      </div>
    </div>
  )
}

const allCategories = Object.keys(categoryConfig) as LocationCategory[]

interface NewBadge { id: string; nameKey: keyof Translations; icon: string }

interface InteractiveMapProps {
  externalRouteId?: string | null
  onExternalRouteChange?: (id: string | null) => void
  triggerLocationId?: number | null
}

export default function InteractiveMap({ externalRouteId, onExternalRouteChange, triggerLocationId }: InteractiveMapProps) {
  const { markVisited, isVisited, profile } = useProfile()
  const { isDark } = useTheme()
  const { t, lang } = useLanguage()
  const colors = tc(isDark)

  const [selectedLocation, setSelectedLocation]   = useState<Location | null>(null)
  const [activeCategories, setActiveCategories]   = useState<Set<LocationCategory>>(new Set(allCategories))
  const [searchQuery,      setSearchQuery]         = useState('')
  const [showFilters,      setShowFilters]         = useState(false)
  const [activeRouteId,    setActiveRouteId]       = useState<string | null>(null)
  const [showAIModal,      setShowAIModal]         = useState(false)
  const [showRouteBuilder, setShowRouteBuilder]    = useState(false)
  const [aiPlanIds,        setAiPlanIds]           = useState<number[] | null>(null)
  const [newBadge,         setNewBadge]            = useState<NewBadge | null>(null)

  // Sync external route id from ThematicRoutes section
  useEffect(() => {
    if (externalRouteId !== undefined) {
      setActiveRouteId(externalRouteId)
      if (externalRouteId) setAiPlanIds(null)
    }
  }, [externalRouteId])

  // Open location from URL deep link
  useEffect(() => {
    if (!triggerLocationId) return
    const loc = locations.find(l => l.id === triggerLocationId)
    if (loc) setSelectedLocation(loc)
  }, [triggerLocationId])

  // Fix: use ref to track previous badge count
  const prevBadgeCountRef = useRef(profile.badges.length)
  useEffect(() => {
    if (profile.badges.length > prevBadgeCountRef.current) {
      const latestId = profile.badges[profile.badges.length - 1]
      const badgeMeta: Record<string, { nameKey: keyof Translations; icon: string }> = {
        'istanbul-fatihi': { nameKey: 'badge_istanbul_fatihi', icon: '⚔️' },
        'sahabe-yolcusu':  { nameKey: 'badge_sahabe_yolcusu',  icon: '☪️' },
        'gonul-sultani':   { nameKey: 'badge_gonul_sultani',   icon: '✨' },
        'ilim-talebesi':   { nameKey: 'badge_ilim_talebesi',   icon: '📚' },
        'devlet-ricali':   { nameKey: 'badge_devlet_ricali',   icon: '🏛️' },
        'kultur-mirasci':  { nameKey: 'badge_kultur_mirasci',  icon: '🎭' },
        'mimar-sinan':     { nameKey: 'badge_mimar_sinan',     icon: '⚒️' },
        'istanbul-rehberi':{ nameKey: 'badge_istanbul_rehberi',icon: '🗺️' },
      }
      if (latestId && badgeMeta[latestId]) {
        setNewBadge({ id: latestId, ...badgeMeta[latestId] })
        setTimeout(() => setNewBadge(null), 4000)
      }
    }
    prevBadgeCountRef.current = profile.badges.length
  }, [profile.badges.length])

  const toggleCategory = useCallback((cat: LocationCategory) => {
    setActiveCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }, [])

  const handleLocationSelect = useCallback((loc: Location) => {
    setSelectedLocation(loc)
    markVisited(loc.id, locations)
  }, [markVisited])

  // Memoize the visited Set so Leaflet doesn't re-render markers on unrelated state changes
  const visitedIds = useMemo(() => new Set(profile.visitedIds), [profile.visitedIds])

  // Memoize filtered locations — expensive filter + includes over 100+ items
  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return locations.filter(loc => {
      const matchCat = activeCategories.has(loc.category)
      const matchSearch = q === '' ||
        loc.name.toLowerCase().includes(q) ||
        loc.district.toLowerCase().includes(q) ||
        (loc.buriedPersons ?? []).some(p => p.toLowerCase().includes(q))

      if (aiPlanIds) return matchCat && matchSearch && aiPlanIds.includes(loc.id)
      if (activeRouteId) {
        const route = thematicRoutes.find(r => r.id === activeRouteId)
        return matchCat && matchSearch && (route?.locationIds.includes(loc.id) ?? false)
      }
      return matchCat && matchSearch
    })
  }, [activeCategories, searchQuery, activeRouteId, aiPlanIds])

  const handleApplyPlan = (ids: number[]) => {
    setAiPlanIds(ids)
    setActiveRouteId(null)
    onExternalRouteChange?.(null)
  }

  const handleRouteToggle = (routeId: string) => {
    const newId = activeRouteId === routeId ? null : routeId
    setActiveRouteId(newId)
    setAiPlanIds(null)
    onExternalRouteChange?.(newId)
  }

  const handleClearAll = () => {
    setAiPlanIds(null)
    setActiveRouteId(null)
    onExternalRouteChange?.(null)
  }

  return (
    <section id="map" className="relative py-0">
      {/* Badge notification */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -60, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 flex items-center gap-3 px-5 py-3"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))',
              border: '1px solid rgba(212,175,55,0.5)',
              borderRadius: '4px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.2)',
            }}
          >
            <span className="text-2xl medal-animate">{newBadge.icon}</span>
            <div>
              <div className="text-[#D4AF37] text-xs uppercase tracking-widest">{t('badge_earned')}</div>
              <div className="font-bold text-sm" style={{ color: colors.text1, fontFamily: "'Georgia', serif" }}>
                {t(newBadge.nameKey)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section header */}
      <div className="section-container py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 border text-xs tracking-widest uppercase"
          style={{ borderColor: `${colors.gold}50`, color: colors.gold, borderRadius: '2px' }}
        >
          {t('map_section_badge')}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-gold-gradient calligraphy-title mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t('map_title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="opacity-60 max-w-xl mx-auto text-sm"
          style={{ color: colors.text2 }}
        >
          {filteredLocations.length} {t('map_desc')}
        </motion.p>
      </div>

      {/* Controls */}
      <div className="section-container mb-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-55" style={{ color: colors.gold }} />
            <input
              type="text"
              placeholder={t('map_search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm outline-none"
              style={{
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
                color: colors.text2,
                borderRadius: '2px',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                style={{ color: colors.gold }}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs transition-all"
              style={{
                background: `${colors.gold}12`,
                border: `1px solid ${colors.border}`,
                color: colors.gold,
                borderRadius: '2px',
              }}
            >
              <Wand2 size={13} />
              {t('map_ai_plan')}
            </button>

            <button
              onClick={() => setShowRouteBuilder(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs transition-all"
              style={{
                background: 'rgba(139,26,26,0.12)',
                border: '1px solid rgba(139,26,26,0.35)',
                color: '#E05555',
                borderRadius: '2px',
              }}
            >
              <Route size={13} />
              {t('map_route')}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs transition-all"
              style={{
                background: showFilters ? `${colors.gold}12` : colors.inputBg,
                border: `1px solid ${colors.border}`,
                color: colors.gold,
                borderRadius: '2px',
              }}
            >
              <Filter size={13} />
              {t('map_filter')}
            </button>

            {(aiPlanIds || activeRouteId) && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 text-xs"
                style={{
                  background: 'rgba(139,26,26,0.2)',
                  border: '1px solid rgba(139,26,26,0.4)',
                  color: '#E05555',
                  borderRadius: '2px',
                }}
              >
                <X size={11} />
                {aiPlanIds ? t('map_clear_plan') : t('map_clear_route')}
              </button>
            )}
          </div>
        </div>

        {/* Category filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3"
            >
              <div className="flex flex-wrap gap-2 py-3 border-t" style={{ borderColor: `${colors.gold}10` }}>
                <button
                  onClick={() => setActiveCategories(
                    activeCategories.size === allCategories.length
                      ? new Set()
                      : new Set(allCategories)
                  )}
                  className="px-3 py-1.5 text-xs border hover:bg-[rgba(212,175,55,0.08)] transition-all"
                  style={{ color: colors.gold, borderColor: `${colors.gold}25`, borderRadius: '2px' }}
                >
                  {activeCategories.size === allCategories.length ? t('map_hide_all') : t('map_show_all')}
                </button>
                {allCategories.map((cat) => {
                  const cfg = categoryConfig[cat]
                  const isActive = activeCategories.has(cat)
                  const count = locations.filter(l => l.category === cat).length
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all"
                      style={{
                        background: isActive ? `${cfg.color}18` : colors.inputBg,
                        border: `1px solid ${isActive ? cfg.color + '44' : colors.border}`,
                        color: isActive ? cfg.color : colors.muted,
                        borderRadius: '2px',
                      }}
                    >
                      <span>{cfg.icon}</span>
                      <span className="hidden sm:inline">{t(`cat_${cat}` as keyof Translations)}</span>
                      <span className="px-1 py-0.5 text-[9px] rounded" style={{ background: `${cfg.color}25`, color: cfg.color }}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map */}
      <div className="relative mx-auto" style={{ height: '70vh', maxHeight: '700px' }}>
        <div
          className="relative w-full h-full overflow-hidden"
          style={{ border: `1px solid ${colors.border}` }}
        >
          <MapContainer
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            visitedIds={visitedIds}
            activeRouteId={activeRouteId}
            onLocationSelect={handleLocationSelect}
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full pointer-events-auto">
              <LocationCard
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="section-container py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="px-4 py-2 text-sm"
              style={{
                background: `${colors.gold}08`,
                border: `1px solid ${colors.border}`,
                borderRadius: '2px',
              }}
            >
              <span className="font-bold" style={{ color: colors.gold }}>{visitedIds.size}</span>
              <span className="opacity-50 ml-1" style={{ color: colors.text2 }}>/{locations.length} {t('map_visited')}</span>
            </div>
            {visitedIds.size > 0 && (
              <div className="text-xs opacity-50" style={{ color: colors.gold }}>
                %{Math.round((visitedIds.size / locations.length) * 100)} {t('map_completed')}
              </div>
            )}
            {profile.badges.length > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
                style={{
                  background: `${colors.gold}10`,
                  border: `1px solid ${colors.gold}25`,
                  color: colors.gold,
                  borderRadius: '2px',
                }}
              >
                🏅 {profile.badges.length} {t('map_badges')}
              </div>
            )}
          </div>

          {/* Quick route buttons */}
          <div className="flex flex-wrap gap-1.5">
            {thematicRoutes.slice(0, 4).map((route) => (
              <button
                key={route.id}
                onClick={() => handleRouteToggle(route.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs transition-all"
                style={{
                  background: activeRouteId === route.id ? `${route.color}18` : colors.inputBg,
                  border: `1px solid ${activeRouteId === route.id ? route.color + '55' : colors.border}`,
                  color: activeRouteId === route.id ? route.color : colors.muted,
                  borderRadius: '2px',
                }}
              >
                <span>{route.icon}</span>
                <span className="hidden sm:inline">{lang === 'en' ? route.nameEn : route.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AIPlanModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApplyPlan={handleApplyPlan}
      />
      <RouteBuilderModal
        isOpen={showRouteBuilder}
        onClose={() => setShowRouteBuilder(false)}
      />
    </section>
  )
}
