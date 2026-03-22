'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Save, GripVertical, Route, Palette, ArrowUp, ArrowDown } from 'lucide-react'
import { locations, categoryConfig } from '@/data/locations'
import { useProfile } from '@/context/ProfileContext'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

const ROUTE_COLORS = [
  '#D4AF37', '#8B1A1A', '#2E8B57', '#4A90D9',
  '#9B59B6', '#E67E22', '#1E90FF', '#E74C3C',
]

const ROUTE_ICONS = ['🗺️', '👑', '☪️', '✨', '📚', '⚔️', '🏛️', '⚓', '🎭', '📜']

interface RouteBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedIds?: number[]
}

export default function RouteBuilderModal({ isOpen, onClose, preselectedIds = [] }: RouteBuilderModalProps) {
  const { saveRoute } = useProfile()
  const { isDark } = useTheme()
  const { t } = useLanguage()
  const colors = tc(isDark)

  const [routeName, setRouteName] = useState('')
  const [routeDescription, setRouteDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(ROUTE_COLORS[0])
  const [selectedIcon, setSelectedIcon] = useState(ROUTE_ICONS[0])
  const [selectedIds, setSelectedIds] = useState<number[]>(preselectedIds)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [saved, setSaved] = useState(false)

  const addLocation = useCallback((id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev : [...prev, id])
  }, [])

  const removeLocation = useCallback((id: number) => {
    setSelectedIds(prev => prev.filter(i => i !== id))
  }, [])

  const moveUp = useCallback((index: number) => {
    if (index === 0) return
    setSelectedIds(prev => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }, [])

  const moveDown = useCallback((index: number) => {
    setSelectedIds(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }, [])

  const handleSave = () => {
    if (!routeName.trim() || selectedIds.length === 0) return
    saveRoute({
      name: routeName.trim(),
      description: routeDescription.trim(),
      locationIds: selectedIds,
      color: selectedColor,
      icon: selectedIcon,
    })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 1500)
  }

  const availableLocations = locations.filter(loc => {
    if (selectedIds.includes(loc.id)) return false
    const matchSearch = searchQuery === '' ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = filterCategory === 'all' || loc.category === filterCategory
    return matchSearch && matchCat
  })

  const selectedLocations = selectedIds.map(id => locations.find(l => l.id === id)).filter(Boolean)

  const modalBg = isDark
    ? 'linear-gradient(180deg, #0d0d1e, #0a0a18)'
    : 'linear-gradient(180deg, #FDFAF2, #F4ECD8)'
  const borderColor = isDark ? 'rgba(212,175,55,0.25)' : 'rgba(139,100,20,0.25)'
  const dividerColor = isDark ? 'rgba(212,175,55,0.1)' : 'rgba(139,100,20,0.12)'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(212,175,55,0.2)' : 'rgba(139,100,20,0.2)'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex overflow-hidden"
            style={{
              background: modalBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '6px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          >
            {/* Left panel: Location picker */}
            <div className="flex-1 flex flex-col min-w-0" style={{ borderRight: `1px solid ${dividerColor}` }}>
              {/* Header */}
              <div className="flex-shrink-0 p-4" style={{ borderBottom: `1px solid ${dividerColor}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Route size={16} style={{ color: colors.gold }} />
                    <span className="font-bold text-sm" style={{ color: colors.gold }}>{t('rb_title')}</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="opacity-40 hover:opacity-80 transition-opacity"
                    style={{ color: colors.text2 }}
                    title={t('rb_close')}
                  >
                    <X size={18} />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={t('rb_search')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none mb-2"
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '3px',
                    color: colors.text2,
                  }}
                />

                {/* Category filters */}
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className="px-2 py-1 text-[10px] transition-all"
                    style={{
                      background: filterCategory === 'all' ? `${colors.gold}20` : 'transparent',
                      border: `1px solid ${filterCategory === 'all' ? colors.gold + '55' : colors.border}`,
                      color: filterCategory === 'all' ? colors.gold : colors.muted,
                      borderRadius: '2px',
                    }}
                  >
                    {t('archive_all')}
                  </button>
                  {Object.entries(categoryConfig).map(([cat, cfg]) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className="px-2 py-1 text-[10px] transition-all"
                      style={{
                        background: filterCategory === cat ? `${cfg.color}20` : 'transparent',
                        border: `1px solid ${filterCategory === cat ? cfg.color + '55' : colors.border}`,
                        color: filterCategory === cat ? cfg.color : colors.muted,
                        borderRadius: '2px',
                      }}
                    >
                      {cfg.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {availableLocations.slice(0, 60).map(loc => {
                  const cfg = categoryConfig[loc.category]
                  return (
                    <motion.button
                      key={loc.id}
                      whileHover={{ x: 2 }}
                      onClick={() => addLocation(loc.id)}
                      className="w-full flex items-center gap-2.5 p-2.5 text-left transition-all"
                      style={{
                        background: `${colors.gold}04`,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '3px',
                      }}
                    >
                      <span className="text-base flex-shrink-0">{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: colors.text1, fontFamily: "'Georgia', serif" }}>
                          {loc.name}
                        </div>
                        <div className="text-[10px] opacity-40" style={{ color: colors.text2 }}>{loc.district}</div>
                      </div>
                      <Plus size={12} style={{ color: cfg.color, flexShrink: 0, opacity: 0.7 }} />
                    </motion.button>
                  )
                })}
                {availableLocations.length === 0 && (
                  <div className="text-center opacity-30 text-sm py-8" style={{ color: colors.text2 }}>
                    {t('map_search')}...
                  </div>
                )}
              </div>
            </div>

            {/* Right panel: Route details */}
            <div className="w-72 flex-shrink-0 flex flex-col">
              {/* Route info */}
              <div className="flex-shrink-0 p-4" style={{ borderBottom: `1px solid ${dividerColor}` }}>
                <div className="text-xs uppercase tracking-widest mb-3 opacity-70" style={{ color: colors.gold }}>
                  {t('rb_route_name')}
                </div>
                <input
                  type="text"
                  placeholder={t('rb_name_placeholder')}
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none mb-2"
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '3px',
                    color: colors.text2,
                  }}
                  maxLength={40}
                />
                <textarea
                  placeholder={t('rb_desc_placeholder')}
                  value={routeDescription}
                  onChange={e => setRouteDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs outline-none resize-none mb-3"
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '3px',
                    color: colors.text2,
                  }}
                />

                {/* Icon selector */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase tracking-widest mb-1.5 opacity-40" style={{ color: colors.text2 }}>
                    {t('rb_route_icon')}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ROUTE_ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        className="w-7 h-7 text-sm flex items-center justify-center transition-all"
                        style={{
                          background: selectedIcon === icon ? `${colors.gold}22` : `${colors.gold}06`,
                          border: `1px solid ${selectedIcon === icon ? colors.gold + '66' : colors.border}`,
                          borderRadius: '3px',
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color selector */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest mb-1.5 opacity-40 flex items-center gap-1" style={{ color: colors.text2 }}>
                    <Palette size={10} />{t('rb_route_color')}
                  </div>
                  <div className="flex gap-1.5">
                    {ROUTE_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className="w-6 h-6 rounded-full transition-all"
                        style={{
                          background: color,
                          outline: selectedColor === color ? `2px solid ${color}` : 'none',
                          outlineOffset: '2px',
                          transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected locations */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="text-[10px] uppercase tracking-widest mb-2 opacity-40" style={{ color: colors.text2 }}>
                  {t('rb_selected')} ({selectedLocations.length})
                </div>
                {selectedLocations.length === 0 ? (
                  <div className="text-center opacity-20 text-xs py-6" style={{ color: colors.text2 }}>
                    {t('rb_empty')}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {selectedLocations.map((loc, i) => {
                      if (!loc) return null
                      const cfg = categoryConfig[loc.category]
                      return (
                        <motion.div
                          key={loc.id}
                          layout
                          className="flex items-center gap-2 p-2"
                          style={{
                            background: `${selectedColor}0A`,
                            border: `1px solid ${selectedColor}22`,
                            borderRadius: '3px',
                          }}
                        >
                          <GripVertical size={10} className="opacity-20 flex-shrink-0" style={{ color: colors.text2 }} />
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                            style={{ background: `${selectedColor}25`, color: selectedColor, border: `1px solid ${selectedColor}44` }}
                          >
                            {i + 1}
                          </div>
                          <span className="text-xs flex-shrink-0">{cfg.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] truncate" style={{ color: colors.text1, fontFamily: "'Georgia', serif" }}>
                              {loc.name}
                            </div>
                          </div>
                          <div className="flex gap-0.5 flex-shrink-0">
                            <button onClick={() => moveUp(i)} className="opacity-30 hover:opacity-70" style={{ color: colors.text2 }}>
                              <ArrowUp size={10} />
                            </button>
                            <button onClick={() => moveDown(i)} className="opacity-30 hover:opacity-70" style={{ color: colors.text2 }}>
                              <ArrowDown size={10} />
                            </button>
                            <button onClick={() => removeLocation(loc.id)} className="opacity-30 hover:opacity-70 ml-1 text-red-400">
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Save button */}
              <div className="flex-shrink-0 p-3" style={{ borderTop: `1px solid ${dividerColor}` }}>
                <AnimatePresence mode="wait">
                  {saved ? (
                    <motion.div
                      key="saved"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full py-2.5 text-center text-sm font-bold text-[#2E8B57]"
                      style={{
                        background: 'rgba(46,139,87,0.15)',
                        border: '1px solid rgba(46,139,87,0.3)',
                        borderRadius: '3px',
                      }}
                    >
                      ✓ {t('rb_save')}!
                    </motion.div>
                  ) : (
                    <motion.button
                      key="save"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={!routeName.trim() || selectedIds.length === 0}
                      className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold transition-all"
                      style={{
                        background: routeName.trim() && selectedIds.length > 0
                          ? `linear-gradient(135deg, ${selectedColor}CC, ${selectedColor}88)`
                          : `${colors.gold}08`,
                        border: `1px solid ${routeName.trim() && selectedIds.length > 0 ? selectedColor + '66' : colors.border}`,
                        color: routeName.trim() && selectedIds.length > 0 ? '#0f0f1e' : colors.muted,
                        borderRadius: '3px',
                        cursor: routeName.trim() && selectedIds.length > 0 ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Save size={14} />
                      {t('rb_save')}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
