'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Search, Filter, X, Wand2, Route } from 'lucide-react'
import { locations, Location, LocationCategory, categoryConfig, thematicRoutes } from '@/data/locations'
import { useProfile } from '@/context/ProfileContext'
import LocationCard from './LocationCard'
import AIPlanModal from './AIPlanModal'
import RouteBuilderModal from './RouteBuilderModal'

const MapContainer = dynamic(
  () => import('./LeafletMap'),
  { ssr: false, loading: () => <MapSkeleton /> }
)

function MapSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #1a1a2e, #0f0f1e)' }}>
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"
        />
        <div className="text-[#D4AF37] text-sm tracking-widest">Harita Yükleniyor...</div>
      </div>
    </div>
  )
}

const allCategories = Object.keys(categoryConfig) as LocationCategory[]

interface NewBadge {
  id: string; name: string; icon: string
}

export default function InteractiveMap() {
  const { markVisited, isVisited, profile } = useProfile()

  const [selectedLocation, setSelectedLocation]   = useState<Location | null>(null)
  const [activeCategories, setActiveCategories]   = useState<Set<LocationCategory>>(new Set(allCategories))
  const [searchQuery,      setSearchQuery]         = useState('')
  const [showFilters,      setShowFilters]         = useState(false)
  const [activeRouteId,    setActiveRouteId]       = useState<string | null>(null)
  const [showAIModal,      setShowAIModal]         = useState(false)
  const [showRouteBuilder, setShowRouteBuilder]    = useState(false)
  const [aiPlanIds,        setAiPlanIds]           = useState<number[] | null>(null)
  const [newBadge,         setNewBadge]            = useState<NewBadge | null>(null)

  // Rozet kazanıldığında bildirim
  const prevBadgeCount = useState(profile.badges.length)[0]
  useEffect(() => {
    if (profile.badges.length > prevBadgeCount) {
      const latestId = profile.badges[profile.badges.length - 1]
      const badgeNames: Record<string, { name: string; icon: string }> = {
        'istanbul-fatihi': { name: 'İstanbul Fatihi', icon: '⚔️' },
        'sahabe-yolcusu':  { name: 'Sahabe Yolcusu',  icon: '☪️' },
        'gonul-sultani':   { name: 'Gönül Sultanı',   icon: '✨' },
        'ilim-talebesi':   { name: 'İlim Talebesi',   icon: '📚' },
        'devlet-ricali':   { name: 'Devlet Ricali',   icon: '🏛️' },
        'kultur-mirasci':  { name: 'Kültür Mirasçısı',icon: '🎭' },
        'mimar-sinan':     { name: "Sinan'ın İzinde", icon: '⚒️' },
        'istanbul-rehberi':{ name: 'İstanbul Rehberi',icon: '🗺️' },
      }
      if (latestId && badgeNames[latestId]) {
        setNewBadge({ id: latestId, ...badgeNames[latestId] })
        setTimeout(() => setNewBadge(null), 4000)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const visitedIds = new Set(profile.visitedIds)

  const filteredLocations = locations.filter(loc => {
    const matchCat = activeCategories.has(loc.category)
    const matchSearch = searchQuery === '' ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.buriedPersons ?? []).some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))

    if (aiPlanIds) return matchCat && matchSearch && aiPlanIds.includes(loc.id)
    if (activeRouteId) {
      const route = thematicRoutes.find(r => r.id === activeRouteId)
      return matchCat && matchSearch && (route?.locationIds.includes(loc.id) ?? false)
    }
    return matchCat && matchSearch
  })

  const handleApplyPlan = (ids: number[]) => {
    setAiPlanIds(ids)
    setActiveRouteId(null)
  }

  return (
    <section id="map" className="relative py-0">
      {/* Yeni rozet bildirimi */}
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
              <div className="text-[#D4AF37] text-xs uppercase tracking-widest">Rozet Kazandın!</div>
              <div className="text-[#F5F0E8] font-bold text-sm" style={{ fontFamily: "'Georgia', serif" }}>
                {newBadge.name}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Başlık */}
      <div className="section-container py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-xs tracking-widest uppercase"
          style={{ borderRadius: '2px' }}
        >
          🗺️ İnteraktif Harita
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-gold-gradient calligraphy-title mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          İstanbul&apos;un Manevi Haritası
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#EDE0C4] opacity-60 max-w-xl mx-auto text-sm"
        >
          {filteredLocations.length} konum görüntüleniyor · Konuma tıkla → ziyaret edildi olarak işaretle
        </motion.p>
      </div>

      {/* Kontrol paneli */}
      <div className="section-container mb-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Arama */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37] opacity-55" />
            <input
              type="text"
              placeholder="Türbe, şahsiyet veya semt ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm text-[#EDE0C4] placeholder-[rgba(237,224,196,0.3)] outline-none"
              style={{
                background: 'rgba(26,26,46,0.8)',
                border: '1px solid rgba(212,175,55,0.22)',
                borderRadius: '2px',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37] opacity-50 hover:opacity-100">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* AI Plan */}
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs transition-all"
              style={{
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#D4AF37',
                borderRadius: '2px',
              }}
            >
              <Wand2 size={13} />
              AI Plan
            </button>

            {/* Rota Builder */}
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
              Rota
            </button>

            {/* Filtre */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs transition-all"
              style={{
                background: showFilters ? 'rgba(212,175,55,0.12)' : 'rgba(26,26,46,0.8)',
                border: '1px solid rgba(212,175,55,0.22)',
                color: '#D4AF37',
                borderRadius: '2px',
              }}
            >
              <Filter size={13} />
              Filtrele
            </button>

            {/* Aktif plan/rota temizle */}
            {(aiPlanIds || activeRouteId) && (
              <button
                onClick={() => { setAiPlanIds(null); setActiveRouteId(null) }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs"
                style={{
                  background: 'rgba(139,26,26,0.2)',
                  border: '1px solid rgba(139,26,26,0.4)',
                  color: '#E05555',
                  borderRadius: '2px',
                }}
              >
                <X size={11} />
                {aiPlanIds ? 'Planı Temizle' : 'Rotayı Temizle'}
              </button>
            )}
          </div>
        </div>

        {/* Kategori filtreleri */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3"
            >
              <div className="flex flex-wrap gap-2 py-3 border-t border-[rgba(212,175,55,0.08)]">
                <button
                  onClick={() => setActiveCategories(
                    activeCategories.size === allCategories.length
                      ? new Set()
                      : new Set(allCategories)
                  )}
                  className="px-3 py-1.5 text-xs text-[#D4AF37] border border-[rgba(212,175,55,0.25)] hover:bg-[rgba(212,175,55,0.08)] transition-all"
                  style={{ borderRadius: '2px' }}
                >
                  {activeCategories.size === allCategories.length ? 'Tümünü Gizle' : 'Tümünü Göster'}
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
                        background: isActive ? `${cfg.color}18` : 'rgba(26,26,46,0.5)',
                        border: `1px solid ${isActive ? cfg.color + '44' : 'rgba(212,175,55,0.1)'}`,
                        color: isActive ? cfg.color : 'rgba(237,224,196,0.35)',
                        borderRadius: '2px',
                      }}
                    >
                      <span>{cfg.icon}</span>
                      <span className="hidden sm:inline">{cfg.label}</span>
                      <span
                        className="px-1 py-0.5 text-[9px] rounded"
                        style={{ background: `${cfg.color}25`, color: cfg.color }}
                      >
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

      {/* Harita */}
      <div className="relative mx-auto" style={{ height: '70vh', maxHeight: '700px' }}>
        <div
          className="relative w-full h-full overflow-hidden"
          style={{ border: '1px solid rgba(212,175,55,0.18)' }}
        >
          <MapContainer
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            visitedIds={visitedIds}
            activeRouteId={activeRouteId}
            onLocationSelect={handleLocationSelect}
            mapRef={{ current: null }}
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

      {/* Alt bilgi çubuğu */}
      <div className="section-container py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Ziyaret sayacı */}
          <div className="flex items-center gap-3">
            <div
              className="px-4 py-2 text-sm"
              style={{
                background: 'rgba(212,175,55,0.07)',
                border: '1px solid rgba(212,175,55,0.18)',
                borderRadius: '2px',
              }}
            >
              <span className="text-[#D4AF37] font-bold">{visitedIds.size}</span>
              <span className="text-[#EDE0C4] opacity-50 ml-1">/{locations.length} mekan ziyaret edildi</span>
            </div>
            {visitedIds.size > 0 && (
              <div className="text-[#D4AF37] text-xs opacity-50">
                %{Math.round((visitedIds.size / locations.length) * 100)} tamamlandı
              </div>
            )}
            {profile.badges.length > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
                style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  color: '#D4AF37',
                  borderRadius: '2px',
                }}
              >
                🏅 {profile.badges.length} rozet kazanıldı
              </div>
            )}
          </div>

          {/* Tematik rotalar */}
          <div className="flex flex-wrap gap-1.5">
            {thematicRoutes.slice(0, 4).map((route) => (
              <button
                key={route.id}
                onClick={() => {
                  setActiveRouteId(prev => prev === route.id ? null : route.id)
                  setAiPlanIds(null)
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs transition-all"
                style={{
                  background: activeRouteId === route.id ? `${route.color}18` : 'rgba(26,26,46,0.5)',
                  border: `1px solid ${activeRouteId === route.id ? route.color + '55' : 'rgba(212,175,55,0.1)'}`,
                  color: activeRouteId === route.id ? route.color : 'rgba(237,224,196,0.4)',
                  borderRadius: '2px',
                }}
              >
                <span>{route.icon}</span>
                <span className="hidden sm:inline">{route.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modallar */}
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
