'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Search } from 'lucide-react'
import { locations, categoryConfig, LocationCategory } from '@/data/locations'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import type { Translations } from '@/data/translations'

const allCategories = Object.keys(categoryConfig) as LocationCategory[]

export default function ArchiveSection() {
  const [activeCategory, setActiveCategory] = useState<LocationCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'district'>('category')
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const colors = tc(isDark)

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
      <div className="absolute inset-0" style={{
        background: isDark
          ? 'linear-gradient(to bottom, #050510, #0f0f1e, #0f0f1e)'
          : 'linear-gradient(to bottom, #E8D8B4, #F4ECD8, #F4ECD8)',
      }} />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 border text-xs tracking-widest uppercase"
            style={{ borderColor: `${colors.gold}50`, color: colors.gold, borderRadius: '2px' }}
          >
            <BookOpen size={12} />
            {t('archive_section_badge')}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-gold-gradient calligraphy-title mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {t('archive_title')}
          </motion.h2>
        </div>

        {/* Search and filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{ color: colors.gold }} />
            <input
              type="text"
              placeholder={t('archive_search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm outline-none"
              style={{
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
                color: colors.text2,
                borderRadius: '2px',
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 text-xs outline-none"
            style={{
              background: colors.inputBg,
              border: `1px solid ${colors.border}`,
              color: colors.text2,
              borderRadius: '2px',
            }}
          >
            <option value="category">{t('archive_sort_cat')}</option>
            <option value="name">{t('archive_sort_name')}</option>
            <option value="district">{t('archive_sort_district')}</option>
          </select>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className="px-3 py-1.5 text-xs transition-all"
            style={{
              background: activeCategory === 'all' ? `${colors.gold}22` : colors.inputBg,
              border: `1px solid ${colors.gold}44`,
              color: activeCategory === 'all' ? colors.gold : colors.muted,
              borderRadius: '2px',
            }}
          >
            {t('archive_all')} ({locations.length})
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
                  background: activeCategory === cat ? `${cfg.color}22` : colors.inputBg,
                  border: `1px solid ${activeCategory === cat ? cfg.color + '66' : colors.border}`,
                  color: activeCategory === cat ? cfg.color : colors.muted,
                  borderRadius: '2px',
                }}
              >
                {cfg.icon} {t(`cat_${cat}` as keyof Translations)} ({count})
              </button>
            )
          })}
        </div>

        {/* Result count */}
        <div className="text-xs opacity-40 mb-4" style={{ color: colors.text2 }}>
          {filtered.length} {t('archive_results')}
        </div>

        {/* List */}
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
                    background: colors.sectionBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '2px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${cfg.color}0A`
                    e.currentTarget.style.borderColor = `${cfg.color}33`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.sectionBg
                    e.currentTarget.style.borderColor = colors.border
                  }}
                >
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

                  <div className="flex-shrink-0 text-lg mt-0.5">{cfg.icon}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="text-sm font-semibold group-hover:text-[#D4AF37] transition-colors leading-snug"
                        style={{ color: colors.text1, fontFamily: "'Georgia', serif" }}
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
                        {t(`cat_${loc.category}` as keyof Translations)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] opacity-60" style={{ color: colors.gold }}>📍 {loc.district}</span>
                      {loc.period && (
                        <span className="text-[11px] opacity-35" style={{ color: colors.text2 }}>🕰 {loc.period}</span>
                      )}
                    </div>

                    {loc.buriedPersons && loc.buriedPersons.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {loc.buriedPersons.slice(0, 3).map((person, pi) => (
                          <span
                            key={pi}
                            className="text-[10px] px-1.5 py-0.5 opacity-50"
                            style={{
                              background: `${colors.gold}08`,
                              border: `1px solid ${colors.gold}12`,
                              color: colors.text2,
                              borderRadius: '2px',
                            }}
                          >
                            {person}
                          </span>
                        ))}
                        {loc.buriedPersons.length > 3 && (
                          <span className="text-[10px] opacity-40" style={{ color: colors.gold }}>
                            +{loc.buriedPersons.length - 3} {t('archive_more_people')}
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
