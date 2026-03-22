'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Clock, MapPin, ChevronRight, Wand2, RefreshCw } from 'lucide-react'
import { locations, categoryConfig, LocationCategory, Location } from '@/data/locations'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

interface Interest {
  id: string
  labelTR: string
  labelEN: string
  descTR: string
  descEN: string
  icon: string
  categories: LocationCategory[]
  color: string
}

const INTERESTS: Interest[] = [
  {
    id: 'manevi',
    labelTR: 'Manevi & Dini',
    labelEN: 'Spiritual & Religious',
    descTR: 'Sahabe makamları, evliya türbeleri, tekke ve dergahlar',
    descEN: 'Companion shrines, saint tombs, tekkes and dervish lodges',
    icon: '☽',
    categories: ['sahabe', 'evliya'],
    color: '#2E8B57',
  },
  {
    id: 'tarihi',
    labelTR: 'Tarihi & Siyasi',
    labelEN: 'Historical & Political',
    descTR: 'Padişah türbeleri, vezir ve devlet adamı yapıları',
    descEN: 'Sultan tombs, vizier and statesman structures',
    icon: '👑',
    categories: ['padisah', 'devlet'],
    color: '#D4AF37',
  },
  {
    id: 'mimari',
    labelTR: 'Mimari & Sanat',
    labelEN: 'Architecture & Arts',
    descTR: 'Mimar Sinan eserleri, farklı dönem yapı üslupları',
    descEN: "Mimar Sinan's works, architectural styles from different eras",
    icon: '🏛️',
    categories: ['padisah', 'devlet', 'evliya'],
    color: '#4A90D9',
  },
  {
    id: 'ilim',
    labelTR: 'İlim & Kültür',
    labelEN: 'Knowledge & Culture',
    descTR: 'Alimler, şairler, sanatçılar ve düşünürler',
    descEN: 'Scholars, poets, artists and thinkers',
    icon: '📚',
    categories: ['alim', 'kulturel'],
    color: '#9B59B6',
  },
]

const TIME_OPTIONS = [
  { id: '2h',    labelTR: '2 Saat',    labelEN: '2 Hours',     maxLocs: 4,  icon: '⏱️' },
  { id: 'half',  labelTR: 'Yarım Gün', labelEN: 'Half Day',    maxLocs: 7,  icon: '🌤️' },
  { id: 'full',  labelTR: 'Tam Gün',   labelEN: 'Full Day',    maxLocs: 12, icon: '☀️' },
  { id: '2days', labelTR: '2 Gün',     labelEN: '2 Days',      maxLocs: 22, icon: '📅' },
]

const START_POINTS = [
  { id: 'sultanahmet', labelTR: 'Sultanahmet / Ayasofya', labelEN: 'Sultanahmet / Hagia Sophia', lat: 41.0086, lng: 28.9802 },
  { id: 'fatih',       labelTR: 'Fatih / Süleymaniye',    labelEN: 'Fatih / Süleymaniye',        lat: 41.0162, lng: 28.9640 },
  { id: 'eyup',        labelTR: 'Eyüpsultan',             labelEN: 'Eyüpsultan',                  lat: 41.0523, lng: 28.9338 },
  { id: 'uskudar',     labelTR: 'Üsküdar',                labelEN: 'Üsküdar',                     lat: 41.0212, lng: 29.0168 },
  { id: 'besiktas',    labelTR: 'Beşiktaş / Boğaz',       labelEN: 'Beşiktaş / Bosphorus',        lat: 41.0437, lng: 29.0048 },
]

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function generatePlan(
  interests: string[],
  timeOption: string,
  startPointId: string,
  seed: number = 0
): Location[] {
  const timeObj = TIME_OPTIONS.find(t => t.id === timeOption) ?? TIME_OPTIONS[1]
  const startPoint = START_POINTS.find(s => s.id === startPointId) ?? START_POINTS[0]

  const selectedInterests = INTERESTS.filter(i => interests.includes(i.id))
  const relevantCategories = new Set(
    selectedInterests.length > 0
      ? selectedInterests.flatMap(i => i.categories)
      : (Object.keys(categoryConfig) as LocationCategory[])
  )

  const scored = locations.map(loc => {
    let score = 0
    if (relevantCategories.has(loc.category)) score += 50
    if (loc.importance === 'high')   score += 30
    if (loc.importance === 'medium') score += 15
    const dist = haversineKm(startPoint.lat, startPoint.lng, loc.lat, loc.lng)
    score += Math.max(0, 20 - dist * 3)
    score += (((loc.id * 13 + seed * 7) % 17) - 8) * 0.5
    return { loc, score, dist }
  })

  scored.sort((a, b) => b.score - a.score)
  const candidates = scored.slice(0, Math.min(timeObj.maxLocs * 3, locations.length))

  const selected: typeof scored = []
  const remaining = [...candidates]

  remaining.sort((a, b) => a.dist - b.dist)
  if (remaining.length > 0) selected.push(remaining.shift()!)

  while (selected.length < timeObj.maxLocs && remaining.length > 0) {
    const last = selected[selected.length - 1]
    remaining.sort((a, b) => {
      const distA = haversineKm(last.loc.lat, last.loc.lng, a.loc.lat, a.loc.lng)
      const distB = haversineKm(last.loc.lat, last.loc.lng, b.loc.lat, b.loc.lng)
      return (distA * 2 - a.score * 0.5) - (distB * 2 - b.score * 0.5)
    })
    selected.push(remaining.shift()!)
  }

  return selected.map(s => s.loc)
}

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

  const { isDark } = useTheme()
  const { lang, t } = useLanguage()
  const colors = tc(isDark)

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
    interests: t('ai_step1'),
    time:      t('ai_step2'),
    start:     t('ai_step3'),
    result:    t('ai_step4'),
  }

  const stepProgress: Record<Step, number> = {
    interests: 25,
    time:      50,
    start:     75,
    result:    100,
  }

  const modalBg = isDark
    ? 'linear-gradient(180deg, #0d0d1e, #0a0a18)'
    : 'linear-gradient(180deg, #FDFAF2, #F4ECD8)'
  const borderColor = isDark ? 'rgba(212,175,55,0.3)' : 'rgba(139,100,20,0.3)'
  const dividerColor = isDark ? 'rgba(212,175,55,0.12)' : 'rgba(139,100,20,0.15)'

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
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-x-4 top-[5vh] bottom-[5vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[560px] z-50 flex flex-col overflow-hidden"
            style={{
              background: modalBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '6px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.1)',
            }}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-5" style={{ borderBottom: `1px solid ${dividerColor}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: `${colors.gold}22`, border: `1px solid ${colors.gold}44` }}
                  >
                    <Wand2 size={16} style={{ color: colors.gold }} />
                  </div>
                  <div>
                    <div className="font-bold text-sm tracking-wide" style={{ color: colors.gold }}>
                      {t('ai_title')}
                    </div>
                    <div className="text-xs opacity-50" style={{ color: colors.text2 }}>
                      {stepTitles[step]}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="opacity-40 hover:opacity-80 transition-opacity"
                  style={{ color: colors.text2 }}
                  title={t('ai_close')}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="h-1 rounded-full overflow-hidden" style={{ background: `${colors.gold}12` }}>
                <motion.div
                  animate={{ width: `${stepProgress[step]}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #8B1A1A, #D4AF37)' }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">

                {/* Step 1: Interests */}
                {step === 'interests' && (
                  <motion.div
                    key="interests"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-sm opacity-60 mb-5" style={{ color: colors.text2 }}>
                      {t('ai_step_interests')}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {INTERESTS.map(interest => {
                        const isSelected = selectedInterests.includes(interest.id)
                        const label = lang === 'tr' ? interest.labelTR : interest.labelEN
                        const desc  = lang === 'tr' ? interest.descTR  : interest.descEN
                        return (
                          <motion.button
                            key={interest.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => toggleInterest(interest.id)}
                            className="flex items-start gap-4 p-4 text-left transition-all"
                            style={{
                              background: isSelected ? `${interest.color}15` : `${colors.gold}05`,
                              border: `1px solid ${isSelected ? interest.color + '66' : colors.border}`,
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
                              <div className="font-semibold text-sm mb-0.5" style={{ color: isSelected ? interest.color : colors.text1 }}>
                                {label}
                              </div>
                              <div className="text-xs opacity-50" style={{ color: colors.text2 }}>{desc}</div>
                            </div>
                            <div
                              className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5"
                              style={{
                                background: isSelected ? interest.color : 'transparent',
                                border: `2px solid ${isSelected ? interest.color : colors.border}`,
                                borderRadius: '3px',
                              }}
                            >
                              {isSelected && <span className="text-[10px] text-black font-bold">✓</span>}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                    <p className="text-xs opacity-35 mt-4" style={{ color: colors.text2 }}>
                      {lang === 'tr'
                        ? 'Hiçbirini seçmezsen tüm kategoriler dahil edilir.'
                        : 'If none selected, all categories will be included.'}
                    </p>
                  </motion.div>
                )}

                {/* Step 2: Time */}
                {step === 'time' && (
                  <motion.div
                    key="time"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-sm opacity-60 mb-5" style={{ color: colors.text2 }}>
                      {t('ai_step_time')}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {TIME_OPTIONS.map(opt => {
                        const isSelected = selectedTime === opt.id
                        const label = lang === 'tr' ? opt.labelTR : opt.labelEN
                        return (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTime(opt.id)}
                            className="flex flex-col items-center p-5 transition-all"
                            style={{
                              background: isSelected ? `${colors.gold}18` : `${colors.gold}05`,
                              border: `1px solid ${isSelected ? colors.gold + '66' : colors.border}`,
                              borderRadius: '4px',
                            }}
                          >
                            <span className="text-2xl mb-2">{opt.icon}</span>
                            <div className="font-bold text-sm" style={{ color: isSelected ? colors.gold : colors.text1 }}>
                              {label}
                            </div>
                            <div className="text-[10px] opacity-40 mt-1" style={{ color: colors.text2 }}>
                              ~{opt.maxLocs} {t('ai_locations')}
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Start point */}
                {step === 'start' && (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-sm opacity-60 mb-5" style={{ color: colors.text2 }}>
                      {t('ai_step_start')}
                    </p>
                    <div className="space-y-2">
                      {START_POINTS.map(point => {
                        const isSelected = selectedStart === point.id
                        const label = lang === 'tr' ? point.labelTR : point.labelEN
                        return (
                          <motion.button
                            key={point.id}
                            whileHover={{ x: 2 }}
                            onClick={() => setSelectedStart(point.id)}
                            className="w-full flex items-center gap-3 p-3.5 text-left transition-all"
                            style={{
                              background: isSelected ? `${colors.gold}12` : `${colors.gold}04`,
                              border: `1px solid ${isSelected ? colors.gold + '55' : colors.border}`,
                              borderRadius: '3px',
                            }}
                          >
                            <MapPin size={16} style={{ color: isSelected ? colors.gold : colors.muted, flexShrink: 0 }} />
                            <span className="text-sm" style={{ color: isSelected ? colors.gold : colors.text2, opacity: isSelected ? 1 : 0.7 }}>
                              {label}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Result */}
                {step === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* Summary chips */}
                    <div
                      className="p-3 mb-5 flex flex-wrap gap-2"
                      style={{
                        background: `${colors.gold}08`,
                        border: `1px solid ${colors.gold}20`,
                        borderRadius: '4px',
                      }}
                    >
                      {selectedInterests.length > 0 && selectedInterests.map(id => {
                        const interest = INTERESTS.find(i => i.id === id)
                        if (!interest) return null
                        const label = lang === 'tr' ? interest.labelTR : interest.labelEN
                        return (
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
                            {interest.icon} {label}
                          </span>
                        )
                      })}
                      <span className="text-xs px-2 py-1 opacity-70"
                        style={{ background: `${colors.gold}12`, borderRadius: '2px', color: colors.gold }}>
                        <Clock size={10} className="inline mr-1" />
                        {lang === 'tr'
                          ? TIME_OPTIONS.find(t => t.id === selectedTime)?.labelTR
                          : TIME_OPTIONS.find(t => t.id === selectedTime)?.labelEN}
                      </span>
                      <span className="text-xs px-2 py-1 opacity-70"
                        style={{ background: `${colors.gold}12`, borderRadius: '2px', color: colors.gold }}>
                        📍 {lang === 'tr'
                          ? START_POINTS.find(s => s.id === selectedStart)?.labelTR
                          : START_POINTS.find(s => s.id === selectedStart)?.labelEN}
                      </span>
                    </div>

                    {/* Evliya comment */}
                    <div
                      className="flex gap-3 p-4 mb-5"
                      style={{
                        background: 'rgba(139,26,26,0.12)',
                        border: '1px solid rgba(139,26,26,0.25)',
                        borderRadius: '4px',
                      }}
                    >
                      <span className="text-2xl flex-shrink-0">🧙‍♂️</span>
                      <p className="text-sm opacity-75 italic leading-relaxed" style={{ color: colors.text2, fontFamily: "'Georgia', serif" }}>
                        {lang === 'tr'
                          ? `"Seyahatnamemin satırlarında ${plan.length} mücevher seçtim sana. Başla ve İstanbul'un kalbinin nasıl attığını hisset!"`
                          : `"From the pages of my Seyahatname, I have chosen ${plan.length} gems for you. Begin, and feel how Istanbul's heart beats!"`}
                      </p>
                    </div>

                    {/* Location list */}
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
                              background: `${cfg.color}08`,
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
                              <div className="text-sm font-medium leading-snug" style={{ color: colors.text1, fontFamily: "'Georgia', serif" }}>
                                {loc.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px]" style={{ color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                                <span className="text-[10px] opacity-35" style={{ color: colors.text2 }}>📍 {loc.district}</span>
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

            {/* Footer buttons */}
            <div
              className="flex-shrink-0 p-4 flex items-center justify-between gap-3"
              style={{ borderTop: `1px solid ${dividerColor}` }}
            >
              {step !== 'interests' && (
                <button
                  onClick={() => {
                    if (step === 'time') setStep('interests')
                    else if (step === 'start') setStep('time')
                    else if (step === 'result') { setStep('start'); reset() }
                  }}
                  className="text-sm opacity-40 hover:opacity-70 transition-opacity"
                  style={{ color: colors.text2 }}
                >
                  ← {t('ai_back')}
                </button>
              )}
              {step === 'result' && (
                <button
                  onClick={regenerate}
                  className="flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: colors.gold }}
                >
                  <RefreshCw size={12} />
                  {t('ai_regen')}
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
                      <><Sparkles size={14} />{lang === 'tr' ? 'Plan Oluştur' : 'Generate Plan'}</>
                    ) : (
                      <>{t('ai_next')}<ChevronRight size={14} /></>
                    )}
                  </motion.button>
                ) : (
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
                    {t('ai_show_map')}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
