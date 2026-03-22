'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Map, Trophy, Trash2, Route, Edit2, Check, Star } from 'lucide-react'
import { useProfile, BADGE_CONDITIONS } from '@/context/ProfileContext'
import { locations, categoryConfig } from '@/data/locations'

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
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(profile.name)
  const [confirmClear, setConfirmClear] = useState(false)

  const saveName = () => {
    if (nameInput.trim()) setName(nameInput.trim())
    setIsEditingName(false)
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0d0d1e, #080814)',
              borderLeft: '1px solid rgba(212,175,55,0.25)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Üst şerit */}
            <div className="h-1 bg-gradient-to-r from-[#8B1A1A] to-[#D4AF37]" />

            {/* Profil başlığı */}
            <div className="flex-shrink-0 p-5 border-b border-[rgba(212,175,55,0.12)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      background: 'radial-gradient(circle, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                      border: '2px solid rgba(212,175,55,0.4)',
                    }}
                  >
                    🧭
                  </div>
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
                          className="text-sm text-[#F5F0E8] outline-none bg-transparent border-b border-[#D4AF37] w-36"
                        />
                        <button onClick={saveName} className="text-[#D4AF37]">
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[#F5F0E8] font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {profile.name}
                        </span>
                        <button
                          onClick={() => { setNameInput(profile.name); setIsEditingName(true) }}
                          className="text-[#D4AF37] opacity-40 hover:opacity-80"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                    <div className="text-[#EDE0C4] text-xs opacity-40 mt-0.5">
                      İstanbul Gezgini
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="text-[#EDE0C4] opacity-40 hover:opacity-80">
                  <X size={18} />
                </button>
              </div>

              {/* Özet istatistikler */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Ziyaret', value: visitedCount, icon: '📍' },
                  { label: 'Rota',    value: profile.savedRoutes.length, icon: '🗺️' },
                  { label: 'Rozet',   value: profile.badges.length, icon: '🏅' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="text-center p-2"
                    style={{
                      background: 'rgba(212,175,55,0.06)',
                      border: '1px solid rgba(212,175,55,0.12)',
                      borderRadius: '3px',
                    }}
                  >
                    <div className="text-xs mb-0.5">{stat.icon}</div>
                    <div className="text-[#D4AF37] font-bold text-lg leading-none">{stat.value}</div>
                    <div className="text-[#EDE0C4] text-[10px] opacity-40 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sekmeler */}
            <div className="flex-shrink-0 flex border-b border-[rgba(212,175,55,0.1)]">
              {([
                { id: 'stats',  label: 'İstatistik', icon: User },
                { id: 'routes', label: 'Rotalarım',  icon: Route },
                { id: 'badges', label: 'Rozetler',   icon: Trophy },
              ] as Array<{ id: Tab; label: string; icon: React.ElementType }>).map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] tracking-wide transition-all"
                    style={{
                      color: isActive ? '#D4AF37' : 'rgba(237,224,196,0.35)',
                      borderBottom: isActive ? '2px solid #D4AF37' : '2px solid transparent',
                    }}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* İçerik */}
            <div className="flex-1 overflow-y-auto">

              {/* İstatistikler */}
              {activeTab === 'stats' && (
                <div className="p-4 space-y-4">
                  {/* Genel ilerleme */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#D4AF37] text-xs uppercase tracking-widest">Genel İlerleme</span>
                      <span className="text-[#EDE0C4] text-xs opacity-50">
                        {visitedCount}/{locations.length} ({Math.round(visitedCount / locations.length * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(visitedCount / locations.length) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #8B1A1A, #D4AF37)' }}
                      />
                    </div>
                  </div>

                  {/* Kategori bazlı */}
                  <div>
                    <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-3">Kategorilere Göre</div>
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
                              <span className="text-[10px] text-[#EDE0C4] opacity-40">
                                {visited}/{total}
                              </span>
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
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

                  {/* Sil butonu */}
                  <div className="pt-4 border-t border-[rgba(255,255,255,0.05)]">
                    {!confirmClear ? (
                      <button
                        onClick={() => setConfirmClear(true)}
                        className="flex items-center gap-2 text-xs text-red-400 opacity-40 hover:opacity-70 transition-opacity"
                      >
                        <Trash2 size={12} />
                        Tüm ilerlemeyi sıfırla
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-red-400 opacity-70">Emin misin?</span>
                        <button
                          onClick={() => { clearAll(); setConfirmClear(false) }}
                          className="text-xs text-red-400 border border-red-400 border-opacity-40 px-2 py-1 hover:bg-red-900 hover:bg-opacity-20 transition-all"
                          style={{ borderRadius: '2px' }}
                        >
                          Evet
                        </button>
                        <button
                          onClick={() => setConfirmClear(false)}
                          className="text-xs text-[#EDE0C4] opacity-50 hover:opacity-80"
                        >
                          İptal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kaydedilen rotalar */}
              {activeTab === 'routes' && (
                <div className="p-4">
                  {profile.savedRoutes.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-3xl mb-3">🗺️</div>
                      <div className="text-[#EDE0C4] text-sm opacity-40">
                        Henüz kaydedilen rota yok.
                      </div>
                      <div className="text-[#EDE0C4] text-xs opacity-25 mt-1">
                        Rota Oluşturucu&apos;yu kullanarak kendi rotanı oluştur.
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
                                <div
                                  className="text-sm font-semibold"
                                  style={{ color: '#F5F0E8', fontFamily: "'Georgia', serif" }}
                                >
                                  {route.name}
                                </div>
                                {route.description && (
                                  <div className="text-[11px] text-[#EDE0C4] opacity-45 mt-0.5 leading-relaxed">
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
                            <span className="text-[10px] opacity-40 text-[#EDE0C4]">
                              📍 {route.locationIds.length} konum
                            </span>
                            <span className="text-[10px] opacity-30 text-[#EDE0C4]">
                              {new Date(route.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Rozetler */}
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
                            background: isEarned ? `${badge.color}12` : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isEarned ? badge.color + '44' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '4px',
                            opacity: isEarned ? 1 : 0.45,
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-2"
                            style={{
                              background: isEarned
                                ? `radial-gradient(circle, ${badge.color}30, ${badge.color}10)`
                                : 'rgba(255,255,255,0.03)',
                              border: `2px solid ${isEarned ? badge.color + '66' : 'rgba(255,255,255,0.08)'}`,
                              filter: isEarned ? 'none' : 'grayscale(1)',
                            }}
                          >
                            {isEarned ? badge.icon : '🔒'}
                          </div>
                          <div
                            className="text-xs font-semibold mb-1"
                            style={{ color: isEarned ? '#F5F0E8' : 'rgba(245,240,232,0.35)', fontFamily: "'Georgia', serif" }}
                          >
                            {badge.name}
                          </div>
                          <div className="text-[10px]" style={{ color: isEarned ? badge.color : 'rgba(237,224,196,0.2)' }}>
                            {badge.description}
                          </div>
                          {isEarned && (
                            <div className="mt-1.5 flex items-center justify-center gap-1">
                              <Star size={8} style={{ color: badge.color }} />
                              <span className="text-[9px]" style={{ color: badge.color, opacity: 0.7 }}>Kazanıldı</span>
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
