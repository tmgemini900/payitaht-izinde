'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Search, Filter } from 'lucide-react'
import { locations, categoryConfig, LocationCategory } from '@/data/locations'

const allCategories = Object.keys(categoryConfig) as LocationCategory[]

export default function ArchiveSection() {
  const [activeCategory, setActiveCategory] = useState<LocationCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'district'>('category')

  const filtered = locations
    .filter(loc => {
      const matchCat = activeCategory === 'all' || loc.category === activeCategory
      const matchSearch = searchQuery === '' ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.buriedPersons ?? []).some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCat && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'tr')
      if (sortBy === 'district') return a.district.localeCompare(b.district, 'tr')
      return a.category.localeCompare(b.category)
    })

  return (
    <section id="archive" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0f0f1e] to-[#0f0f1e]" />

      <div className="section-container relative z-10">
        {/* Başlık */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-xs tracking-widest uppercase"
            style={{ borderRadius: '2px' }}
          >
            <BookOpen size={12} />
            Arşiv
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-gold-gradient calligraphy-title mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Türbeler Envanteri
          </motion.h2>
        </div>

        {/* Arama ve filtreler */}
        <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
          {/* Arama */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37] opacity-50" />
            <input
              type="text"
              placeholder="İsim, semt veya şahsiyet ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm text-[#EDE0C4] placeholder-[rgba(237,224,196,0.3)] outline-none"
              style={{
                background: 'rgba(26,26,46,0.8)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '2px',
              }}
            />
          </div>

          {/* Sıralama */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 text-xs text-[#EDE0C4] outline-none"
            style={{
              background: 'rgba(26,26,46,0.8)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '2px',
            }}
          >
            <option value="category">Kategoriye Göre</option>
            <option value="name">İsme Göre (A-Z)</option>
            <option value="district">Semte Göre</option>
          </select>
        </div>

        {/* Kategori filtreleri */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className="px-3 py-1.5 text-xs transition-all"
            style={{
              background: activeCategory === 'all' ? 'rgba(212,175,55,0.2)' : 'rgba(26,26,46,0.6)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: activeCategory === 'all' ? '#D4AF37' : 'rgba(237,224,196,0.4)',
              borderRadius: '2px',
            }}
          >
            Tümü ({locations.length})
          </button>
          {allCategories.map((cat) => {
            const cfg = categoryConfig[cat]
            const count = locations.filter(l => l.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all"
                style={{
                  background: activeCategory === cat ? `${cfg.color}22` : 'rgba(26,26,46,0.6)',
                  border: `1px solid ${activeCategory === cat ? cfg.color + '66' : 'rgba(212,175,55,0.15)'}`,
                  color: activeCategory === cat ? cfg.color : 'rgba(237,224,196,0.4)',
                  borderRadius: '2px',
                }}
              >
                {cfg.icon} {cfg.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Sonuç sayısı */}
        <div className="text-xs text-[#EDE0C4] opacity-40 mb-4">
          {filtered.length} kayıt bulundu
        </div>

        {/* Liste */}
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((loc, i) => {
              const cfg = categoryConfig[loc.category]
              return (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="flex items-start gap-4 p-4 group cursor-pointer transition-all duration-200"
                  style={{
                    background: 'rgba(26,26,46,0.4)',
                    border: `1px solid rgba(212,175,55,0.08)`,
                    borderRadius: '2px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${cfg.color}0A`
                    e.currentTarget.style.borderColor = `${cfg.color}33`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(26,26,46,0.4)'
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.08)'
                  }}
                >
                  {/* Numara */}
                  <div
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-xs font-bold"
                    style={{
                      background: `${cfg.color}15`,
                      border: `1px solid ${cfg.color}33`,
                      color: cfg.color,
                      borderRadius: '2px',
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Kategori ikonu */}
                  <div className="flex-shrink-0 text-lg mt-0.5">{cfg.icon}</div>

                  {/* Bilgiler */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="text-sm font-semibold text-[#F5F0E8] group-hover:text-[#D4AF37] transition-colors leading-snug"
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        {loc.name}
                      </h3>
                      <span
                        className="flex-shrink-0 text-[10px] px-2 py-0.5"
                        style={{
                          background: `${cfg.color}15`,
                          border: `1px solid ${cfg.color}33`,
                          color: cfg.color,
                          borderRadius: '2px',
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-[#D4AF37] opacity-60">📍 {loc.district}</span>
                      {loc.period && (
                        <span className="text-[11px] text-[#EDE0C4] opacity-35">🕰 {loc.period}</span>
                      )}
                    </div>

                    {loc.buriedPersons && loc.buriedPersons.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {loc.buriedPersons.slice(0, 3).map((person, pi) => (
                          <span
                            key={pi}
                            className="text-[10px] px-1.5 py-0.5 text-[#EDE0C4] opacity-50"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '2px',
                            }}
                          >
                            {person}
                          </span>
                        ))}
                        {loc.buriedPersons.length > 3 && (
                          <span className="text-[10px] text-[#D4AF37] opacity-40">
                            +{loc.buriedPersons.length - 3} kişi daha
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
