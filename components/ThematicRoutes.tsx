'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, ChevronDown, ChevronUp, Navigation } from 'lucide-react'
import { thematicRoutes, locations, categoryConfig } from '@/data/locations'

export default function ThematicRoutes() {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)

  return (
    <section id="routes" className="py-20 relative">
      {/* Arka plan */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f1e] via-[#0a0a18] to-[#0f0f1e]" />
      <div className="absolute inset-0 ottoman-pattern-light opacity-40" />

      <div className="section-container relative z-10">
        {/* Başlık */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-xs tracking-widest uppercase"
            style={{ borderRadius: '2px' }}
          >
            <Navigation size={12} />
            Tematik Rotalar
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-gold-gradient calligraphy-title mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Tarihin İzinde Rotalar
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#EDE0C4] opacity-55 max-w-lg mx-auto text-sm"
          >
            Tarih boyunca şekillenen İstanbul&apos;u, özenle hazırlanan tematik rotalar eşliğinde keşfedin.
          </motion.p>
        </div>

        {/* Rotalar Izgarası */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {thematicRoutes.map((route, i) => {
            const isExpanded = expandedRoute === route.id
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
                  border: `1px solid ${route.color}33`,
                }}
              >
                {/* Renkli üst şerit */}
                <div
                  className="h-1"
                  style={{ background: `linear-gradient(90deg, transparent, ${route.color}, transparent)` }}
                />

                {/* Kart başlığı */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
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
                      <div>
                        <h3
                          className="font-bold text-[#F5F0E8] mb-1"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1rem' }}
                        >
                          {route.name}
                        </h3>
                        <p className="text-[#EDE0C4] text-xs opacity-60 leading-relaxed">
                          {route.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Meta bilgi */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#EDE0C4] opacity-50">
                      <Clock size={12} style={{ color: route.color }} />
                      {route.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#EDE0C4] opacity-50">
                      <MapPin size={12} style={{ color: route.color }} />
                      {route.distance}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#EDE0C4] opacity-50">
                      <span style={{ color: route.color }}>◉</span>
                      {routeLocations.length} konum
                    </div>
                  </div>

                  {/* Genişlet butonu */}
                  <button
                    onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                    className="flex items-center gap-2 mt-4 text-xs transition-all"
                    style={{ color: route.color, opacity: 0.8 }}
                  >
                    {isExpanded ? (
                      <>Konumları Gizle <ChevronUp size={12} /></>
                    ) : (
                      <>Konumları Gör <ChevronDown size={12} /></>
                    )}
                  </button>
                </div>

                {/* Genişletilmiş konum listesi */}
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
                                {/* Bağlantı çizgisi */}
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
                                {/* Konum bilgisi */}
                                <div className="flex-1 py-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs">{catCfg.icon}</span>
                                    <span
                                      className="text-xs font-medium"
                                      style={{ color: '#F5F0E8', fontFamily: "'Georgia', serif" }}
                                    >
                                      {loc.name}
                                    </span>
                                  </div>
                                  <div className="text-[10px] opacity-45 text-[#EDE0C4] mt-0.5">
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

        {/* Özel Rota CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <div
            className="inline-block p-6"
            style={{
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '4px',
            }}
          >
            <div className="text-2xl mb-2">✨</div>
            <h3 className="text-[#F5F0E8] font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Kendi Rotanı Oluştur
            </h3>
            <p className="text-[#EDE0C4] text-xs opacity-50 mb-4 max-w-xs">
              Haritadan konumları seçerek kişisel gezi rotanı oluştur ve profil sayfana kaydet.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-gold text-sm px-6 py-3"
              style={{ borderRadius: '2px' }}
            >
              Rota Oluştur
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
