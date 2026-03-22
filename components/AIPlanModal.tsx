'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Clock, MapPin, ChevronRight, Wand2, RefreshCw, Download } from 'lucide-react'
import { locations, categoryConfig, LocationCategory, Location } from '@/data/locations'

// ─── Tip tanımları ────────────────────────────────────────────────────────────
interface Interest {
  id: string
  label: string
  description: string
  icon: string
  categories: LocationCategory[]
  color: string
}

const INTERESTS: Interest[] = [
  {
    id: 'manevi',
    label: 'Manevi & Dini',
    description: 'Sahabe makamları, evliya türbeleri, tekke ve dergahlar',
    icon: '☽',
    categories: ['sahabe', 'evliya'],
    color: '#2E8B57',
  },
  {
    id: 'tarihi',
    label: 'Tarihi & Siyasi',
    description: 'Padişah türbeleri, vezir ve devlet adamı yapıları',
    icon: '👑',
    categories: ['padisah', 'devlet'],
    color: '#D4AF37',
  },
  {
    id: 'mimari',
    label: 'Mimari & Sanat',
    description: 'Mimar Sinan eserleri, farklı dönem yapı üslupları',
    icon: '🏛️',
    categories: ['padisah', 'devlet', 'evliya'],
    color: '#4A90D9',
  },
  {
    id: 'ilim',
    label: 'İlim & Kültür',
    description: 'Alimler, şairler, sanatçılar ve düşünürler',
    icon: '📚',
    categories: ['alim', 'kulturel'],
    color: '#9B59B6',
  },
]

const TIME_OPTIONS = [
  { id: '2h',       label: '2 Saat',      maxLocs: 4,  icon: '⏱️' },
  { id: 'half',     label: 'Yarım Gün',   maxLocs: 7,  icon: '🌤️' },
  { id: 'full',     label: 'Tam Gün',     maxLocs: 12, icon: '☀️' },
  { id: '2days',    label: '2 Gün',       maxLocs: 22, icon: '📅' },
]

const START_POINTS = [
  { id: 'sultanahmet', label: 'Sultanahmet / Ayasofya', lat: 41.0086, lng: 28.9802 },
  { id: 'fatih',       label: 'Fatih / Süleymaniye',    lat: 41.0162, lng: 28.9640 },
  { id: 'eyup',        label: 'Eyüpsultan',              lat: 41.0523, lng: 28.9338 },
  { id: 'uskudar',     label: 'Üsküdar',                 lat: 41.0212, lng: 29.0168 },
  { id: 'besiktas',    label: 'Beşiktaş / Boğaz',        lat: 41.0437, lng: 29.0048 },
]

// ─── Mesafe hesaplama ────────────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── AI Plan Algoritması ─────────────────────────────────────────────────────
function generatePlan(
  interests: string[],
  timeOption: string,
  startPointId: string,
  seed: number = 0
): Location[] {
  const timeObj = TIME_OPTIONS.find(t => t.id === timeOption) ?? TIME_OPTIONS[1]
  const startPoint = START_POINTS.find(s => s.id === startPointId) ?? START_POINTS[0]

  // İlgili kategorileri belirle
  const selectedInterests = INTERESTS.filter(i => interests.includes(i.id))
  const relevantCategories = new Set(
    selectedInterests.length > 0
      ? selectedInterests.flatMap(i => i.categories)
      : (Object.keys(categoryConfig) as LocationCategory[])
  )

  // Skor hesapla
  const scored = locations.map(loc => {
    let score = 0

    // Kategori eşleşmesi
    if (relevantCategories.has(loc.category)) score += 50

    // Önem seviyesi
    if (loc.importance === 'high')   score += 30
    if (loc.importance === 'medium') score += 15

    // Başlangıç noktasına yakınlık (ters orantılı)
    const dist = haversineKm(startPoint.lat, startPoint.lng, loc.lat, loc.lng)
    score += Math.max(0, 20 - dist * 3)

    // Çeşitlilik için küçük rastgele faktör
    score += (((loc.id * 13 + seed * 7) % 17) - 8) * 0.5

    return { loc, score, dist }
  })

  // Skora göre sırala
  scored.sort((a, b) => b.score - a.score)

  // İlk adayları al
  const candidates = scored.slice(0, Math.min(timeObj.maxLocs * 3, locations.length))

  // Coğrafi kümeleme: birbirine yakın konumları tercih et
  const selected: typeof scored = []
  const remaining = [...candidates]

  // İlk olarak başlangıç noktasına en yakını seç
  remaining.sort((a, b) => a.dist - b.dist)
  if (remaining.length > 0) {
    selected.push(remaining.shift()!)
  }

  while (selected.length < timeObj.maxLocs && remaining.length > 0) {
    const last = selected[selected.length - 1]
    // Bir sonraki en yakın ve yüksek skorlu olanı seç
    remaining.sort((a, b) => {
      const distA = haversineKm(last.loc.lat, last.loc.lng, a.loc.lat, a.loc.lng)
      const distB = haversineKm(last.loc.lat, last.loc.lng, b.loc.lat, b.loc.lng)
      return (distA * 2 - a.score * 0.5) - (distB * 2 - b.score * 0.5)
    })
    selected.push(remaining.shift()!)
  }

  return selected.map(s => s.loc)
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
interface AIPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyPlan?: (locationIds: number[]) => void
}

type Step = 'interests' | 'time' | 'start' | 'result'

export default function AIPlanModal({ isOpen, onClose, onApplyPlan }: AIPlanModalProps) {
  const [step, setStep] = useState<Step>('interests')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState('full')
  const [selectedStart, setSelectedStart] = useState('sultanahmet')
  const [planSeed, setPlanSeed] = useState(0)

  const plan = useMemo(() => {
    if (step !== 'result') return []
    return generatePlan(selectedInterests, selectedTime, selectedStart, planSeed)
  }, [step, selectedInterests, selectedTime, selectedStart, planSeed])

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const reset = () => {
    setStep('interests')
    setSelectedInterests([])
    setSelectedTime('full')
    setSelectedStart('sultanahmet')
    setPlanSeed(0)
  }

  const regenerate = () => setPlanSeed(prev => prev + 1)

  const stepTitles: Record<Step, string> = {
    interests: 'İlgi Alanlarını Seç',
    time:      'Ne Kadar Zamanın Var?',
    start:     'Başlangıç Noktası',
    result:    'Kişisel Gezi Planın',
  }

  const stepProgress: Record<Step, number> = {
    interests: 25,
    time:      50,
    start:     75,
    result:    100,
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-x-4 top-[5vh] bottom-[5vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[560px] z-50 flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0d0d1e, #0a0a18)',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '6px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.1)',
            }}
          >
            {/* Başlık */}
            <div className="flex-shrink-0 p-5 border-b border-[rgba(212,175,55,0.15)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
                  >
                    <Wand2 size={16} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <div className="text-[#D4AF37] font-bold text-sm tracking-wide">
                      AI Gezi Danışmanı
                    </div>
                    <div className="text-[#EDE0C4] text-xs opacity-40">
                      {stepTitles[step]}
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="text-[#EDE0C4] opacity-40 hover:opacity-80 transition-opacity">
                  <X size={18} />
                </button>
              </div>

              {/* İlerleme çubuğu */}
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  animate={{ width: `${stepProgress[step]}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #8B1A1A, #D4AF37)' }}
                />
              </div>
            </div>

            {/* İçerik */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">

                {/* Adım 1: İlgi Alanları */}
                {step === 'interests' && (
                  <motion.div
                    key="interests"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-[#EDE0C4] text-sm opacity-60 mb-5">
                      Seni en çok ne ilgilendiriyor? (Birden fazla seçebilirsin)
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {INTERESTS.map(interest => {
                        const isSelected = selectedInterests.includes(interest.id)
                        return (
                          <motion.button
                            key={interest.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => toggleInterest(interest.id)}
                            className="flex items-start gap-4 p-4 text-left transition-all"
                            style={{
                              background: isSelected ? `${interest.color}15` : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isSelected ? interest.color + '66' : 'rgba(255,255,255,0.08)'}`,
                              borderRadius: '4px',
                            }}
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                              style={{ background: `${interest.color}20`, border: `1px solid ${interest.color}33` }}
                            >
                              {interest.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm mb-0.5" style={{ color: isSelected ? interest.color : '#F5F0E8' }}>
                                {interest.label}
                              </div>
                              <div className="text-xs opacity-50 text-[#EDE0C4]">{interest.description}</div>
                            </div>
                            <div
                              className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5"
                              style={{
                                background: isSelected ? interest.color : 'transparent',
                                border: `2px solid ${isSelected ? interest.color : 'rgba(255,255,255,0.2)'}`,
                                borderRadius: '3px',
                              }}
                            >
                              {isSelected && <span className="text-[10px] text-black font-bold">✓</span>}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                    <p className="text-[#EDE0C4] text-xs opacity-35 mt-4">
                      Hiçbirini seçmezsen tüm kategoriler dahil edilir.
                    </p>
                  </motion.div>
                )}

                {/* Adım 2: Zaman */}
                {step === 'time' && (
                  <motion.div
                    key="time"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-[#EDE0C4] text-sm opacity-60 mb-5">
                      Kaç saatin var? Buna göre uygun sayıda konum önereceğim.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {TIME_OPTIONS.map(opt => {
                        const isSelected = selectedTime === opt.id
                        return (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTime(opt.id)}
                            className="flex flex-col items-center p-5 transition-all"
                            style={{
                              background: isSelected ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isSelected ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.08)'}`,
                              borderRadius: '4px',
                            }}
                          >
                            <span className="text-2xl mb-2">{opt.icon}</span>
                            <div className="font-bold text-sm" style={{ color: isSelected ? '#D4AF37' : '#F5F0E8' }}>
                              {opt.label}
                            </div>
                            <div className="text-[10px] text-[#EDE0C4] opacity-40 mt-1">
                              ~{opt.maxLocs} konum
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Adım 3: Başlangıç */}
                {step === 'start' && (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-[#EDE0C4] text-sm opacity-60 mb-5">
                      Nereden başlamak istiyorsun? Yakındaki yerleri öncelikli önereceğim.
                    </p>
                    <div className="space-y-2">
                      {START_POINTS.map(point => {
                        const isSelected = selectedStart === point.id
                        return (
                          <motion.button
                            key={point.id}
                            whileHover={{ x: 2 }}
                            onClick={() => setSelectedStart(point.id)}
                            className="w-full flex items-center gap-3 p-3.5 text-left transition-all"
                            style={{
                              background: isSelected ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isSelected ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.06)'}`,
                              borderRadius: '3px',
                            }}
                          >
                            <MapPin size={16} style={{ color: isSelected ? '#D4AF37' : 'rgba(237,224,196,0.3)', flexShrink: 0 }} />
                            <span className="text-sm" style={{ color: isSelected ? '#D4AF37' : '#EDE0C4', opacity: isSelected ? 1 : 0.6 }}>
                              {point.label}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Adım 4: Sonuç */}
                {step === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* Özet */}
                    <div
                      className="p-3 mb-5 flex flex-wrap gap-2"
                      style={{
                        background: 'rgba(212,175,55,0.06)',
                        border: '1px solid rgba(212,175,55,0.15)',
                        borderRadius: '4px',
                      }}
                    >
                      {selectedInterests.length > 0 && selectedInterests.map(id => {
                        const interest = INTERESTS.find(i => i.id === id)
                        return interest ? (
                          <span
                            key={id}
                            className="text-xs px-2 py-1"
                            style={{
                              background: `${interest.color}18`,
                              border: `1px solid ${interest.color}44`,
                              color: interest.color,
                              borderRadius: '2px',
                            }}
                          >
                            {interest.icon} {interest.label}
                          </span>
                        ) : null
                      })}
                      <span className="text-xs px-2 py-1 text-[#D4AF37] opacity-60"
                        style={{ background: 'rgba(212,175,55,0.1)', borderRadius: '2px' }}>
                        <Clock size={10} className="inline mr-1" />
                        {TIME_OPTIONS.find(t => t.id === selectedTime)?.label}
                      </span>
                      <span className="text-xs px-2 py-1 text-[#D4AF37] opacity-60"
                        style={{ background: 'rgba(212,175,55,0.1)', borderRadius: '2px' }}>
                        📍 {START_POINTS.find(s => s.id === selectedStart)?.label}
                      </span>
                    </div>

                    {/* Evliya Çelebi yorumu */}
                    <div
                      className="flex gap-3 p-4 mb-5"
                      style={{
                        background: 'rgba(139,26,26,0.12)',
                        border: '1px solid rgba(139,26,26,0.25)',
                        borderRadius: '4px',
                      }}
                    >
                      <span className="text-2xl flex-shrink-0">🧙‍♂️</span>
                      <p className="text-[#EDE0C4] text-sm opacity-75 italic leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
                        "Seyahatnamemin satırlarında {plan.length} mücevher seçtim sana. Başla ve
                        İstanbul&apos;un kalbinin nasıl attığını hisset!"
                      </p>
                    </div>

                    {/* Konum listesi */}
                    <div className="space-y-2">
                      {plan.map((loc, i) => {
                        const cfg = categoryConfig[loc.category]
                        return (
                          <motion.div
                            key={loc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-3 p-3"
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: `1px solid ${cfg.color}22`,
                              borderRadius: '3px',
                            }}
                          >
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                              style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}44` }}
                            >
                              {i + 1}
                            </div>
                            <div>
                              <div className="text-[#F5F0E8] text-sm font-medium leading-snug" style={{ fontFamily: "'Georgia', serif" }}>
                                {loc.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px]" style={{ color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                                <span className="text-[10px] text-[#EDE0C4] opacity-35">📍 {loc.district}</span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Alt butonlar */}
            <div className="flex-shrink-0 p-4 border-t border-[rgba(212,175,55,0.12)] flex items-center justify-between gap-3">
              {step !== 'interests' && (
                <button
                  onClick={() => {
                    if (step === 'time') setStep('interests')
                    else if (step === 'start') setStep('time')
                    else if (step === 'result') setStep('start')
                  }}
                  className="text-sm text-[#EDE0C4] opacity-40 hover:opacity-70 transition-opacity"
                >
                  ← Geri
                </button>
              )}
              {step === 'result' && (
                <button
                  onClick={regenerate}
                  className="flex items-center gap-1.5 text-xs text-[#D4AF37] opacity-60 hover:opacity-100 transition-opacity"
                >
                  <RefreshCw size={12} />
                  Yeniden Oluştur
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {step !== 'result' ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (step === 'interests') setStep('time')
                      else if (step === 'time') setStep('start')
                      else if (step === 'start') setStep('result')
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                      color: '#0f0f1e',
                      borderRadius: '3px',
                    }}
                  >
                    {step === 'start' ? (
                      <><Sparkles size={14} />Plan Oluştur</>
                    ) : (
                      <>Devam Et<ChevronRight size={14} /></>
                    )}
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        onApplyPlan?.(plan.map(l => l.id))
                        onClose()
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                        color: '#0f0f1e',
                        borderRadius: '3px',
                      }}
                    >
                      <MapPin size={14} />
                      Haritada Göster
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
