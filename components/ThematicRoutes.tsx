'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, ChevronDown, ChevronUp, Navigation, Map } from 'lucide-react'
import { thematicRoutes, locations, categoryConfig } from '@/data/locations'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

interface ThematicRoutesProps {
  onRouteActivate?: (routeId: string | null) => void
  activeRouteId?: string | null
}

export default function ThematicRoutes({ onRouteActivate, activeRouteId }: ThematicRoutesProps) {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const colors = tc(isDark)

  const handleShowOnMap = (routeId: string) => {
    const newId = activeRouteId === routeId ? null : routeId
    onRouteActivate?.(newId)
  }

  return (
    <section id="routes" className="py-20 relative">
      <div className="absolute inset-0" style={{
        background: isDark
          ? 'linear-gradient(to bottom, #0f0f1e, #0a0a18, #0f0f1e)'
          : 'linear-gradient(to bottom, #F4ECD8, #EDE0C4, #F4ECD8)',
      }} />
      <div className="absolute inset-0 ottoman-pattern-light opacity-40" />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 border text-xs tracking-widest uppercase"
            style={{
              borderColor: `${colors.gold}50`,
              color: colors.gold,
              borderRadius: '2px',
            }}
          >
            <Navigation size={12} />
            {t('routes_section_badge')}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-gold-gradient calligraphy-title mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t('routes_title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="opacity-55 max-w-lg mx-auto text-sm"
            style={{ color: colors.text2 }}
          >
            {t('routes_desc')}
          </motion.p>
        </div>

        {/* Routes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {thematicRoutes.map((route, i) => {
            const isExpanded = expandedRoute === route.id
            const isActive = activeRouteId === route.id
            const routeLocations = route.locationIds
              .map(id => locations.find(l => l.id === id))
              .filter(Boolean)

            return (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="ottoman-card overflow-hidden"
                style={{
                  borderRadius: '4px',
                  border: `1px solid ${isActive ? route.color + '88' : route.color + '33'}`,
                  boxShadow: isActive ? `0 0 20px ${route.color}22` : undefined,
                }}
              >
                {/* Color strip */}
                <div
                  className="h-1"
                  style={{ background: `linear-gradient(90deg, transparent, ${route.color}, transparent)` }}
                />

                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
                        style={{
                          background: `${route.color}18`,
                          border: `1px solid ${route.color}33`,
                          borderRadius: '4px',
                        }}
                      >
                        {route.icon}
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-bold mb-1"
                          style={{
                            color: colors.text1,
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: '1rem',
                          }}
                        >
                          {route.name}
                        </h3>
                        <p className="text-xs opacity-60 leading-relaxed" style={{ color: colors.text2 }}>
                          {route.description}
                        </p>
                      </div>
                    </div>

                    {/* Show on Map button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShowOnMap(route.id)}
                      className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition-all"
                      style={{
                        background: isActive ? `${route.color}25` : `${route.color}10`,
                        border: `1px solid ${isActive ? route.color + '88' : route.color + '33'}`,
                        color: route.color,
                        borderRadius: '2px',
                        opacity: isActive ? 1 : 0.8,
                      }}
                      title={t('routes_show_map')}
                    >
                      <Map size={11} />
                      <span className="hidden sm:inline">{isActive ? '✓' : t('routes_show_map').replace('🗺️ ', '')}</span>
                    </motion.button>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs opacity-50" style={{ color: colors.text2 }}>
                      <Clock size={12} style={{ color: route.color }} />
                      {route.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs opacity-50" style={{ color: colors.text2 }}>
                      <MapPin size={12} style={{ color: route.color }} />
                      {route.distance}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs opacity-50" style={{ color: colors.text2 }}>
                      <span style={{ color: route.color }}>◉</span>
                      {routeLocations.length} {t('routes_locs_count')}
                    </div>
                  </div>

                  {/* Expand button */}
                  <button
                    onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                    className="flex items-center gap-2 mt-4 text-xs transition-all"
                    style={{ color: route.color, opacity: 0.8 }}
                  >
                    {isExpanded ? (
                      <>{t('routes_hide_locs')} <ChevronUp size={12} /></>
                    ) : (
                      <>{t('routes_show_locs')} <ChevronDown size={12} /></>
                    )}
                  </button>
                </div>

                {/* Expanded location list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-5 pb-5"
                        style={{ borderTop: `1px solid ${route.color}22` }}
                      >
                        <div className="pt-4 space-y-2">
                          {routeLocations.map((loc, idx) => {
                            if (!loc) return null
                            const catCfg = categoryConfig[loc.category]
                            return (
                              <motion.div
                                key={loc.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center gap-3"
                              >
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                                    style={{
                                      background: `${route.color}22`,
                                      border: `1px solid ${route.color}55`,
                                      color: route.color,
                                    }}
                                  >
                                    {idx + 1}
                                  </div>
                                  {idx < routeLocations.length - 1 && (
                                    <div
                                      className="w-px h-4 mt-1"
                                      style={{ background: `${route.color}33` }}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 py-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs">{catCfg.icon}</span>
                                    <span className="text-xs font-medium" style={{ color: colors.text1, fontFamily: "'Georgia', serif" }}>
                                      {loc.name}
                                    </span>
                                  </div>
                                  <div className="text-[10px] opacity-45 mt-0.5" style={{ color: colors.text2 }}>
                                    {loc.district}
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Custom Route CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <div
            className="inline-block p-6"
            style={{
              background: `${colors.gold}06`,
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
            }}
          >
            <div className="text-2xl mb-2">✨</div>
            <h3 className="font-bold mb-2" style={{ color: colors.text1, fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('routes_custom_title')}
            </h3>
            <p className="text-xs opacity-50 mb-4 max-w-xs" style={{ color: colors.text2 }}>
              {t('routes_custom_desc')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-gold text-sm px-6 py-3"
              style={{ borderRadius: '2px' }}
              onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('routes_custom_cta')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
