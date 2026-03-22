'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, Users, Building2, Volume2, VolumeX, Share2, Check } from 'lucide-react'
import { Location, categoryConfig } from '@/data/locations'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

interface LocationCardProps {
  location: Location | null
  onClose: () => void
}

const SPEEDS = [
  { label: '0.8×', value: 0.8 },
  { label: '1×',   value: 1.0 },
  { label: '1.3×', value: 1.3 },
]

// Animated waveform bars
function Waveform({ isActive, color }: { isActive: boolean; color: string }) {
  const heights = [3, 6, 10, 14, 9, 5, 12, 7, 4, 10, 14, 8, 5, 3]
  return (
    <div className="flex items-center gap-px" style={{ height: '16px' }}>
      {heights.map((h, i) => (
        <motion.div
          key={i}
          animate={isActive
            ? { height: [`${h}px`, `${Math.min(h * 1.9, 15)}px`, `${h}px`] }
            : { height: '2px' }
          }
          transition={{
            duration: isActive ? 0.45 + (i % 4) * 0.08 : 0.25,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.035,
            ease: 'easeInOut',
          }}
          className="rounded-full flex-shrink-0"
          style={{ width: '2px', background: color, minHeight: '2px' }}
        />
      ))}
    </div>
  )
}

export default function LocationCard({ location, onClose }: LocationCardProps) {
  const [isSpeaking,   setIsSpeaking]   = useState(false)
  const [speed,        setSpeed]        = useState(1.0)
  const [voices,       setVoices]       = useState<SpeechSynthesisVoice[]>([])
  const [shareCopied,  setShareCopied]  = useState(false)

  const { isDark } = useTheme()
  const { t, lang } = useLanguage()
  const colors = tc(isDark)

  // Load TTS voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  // Cancel on location/lang change
  useEffect(() => {
    setIsSpeaking(false)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [location, lang])

  const getPreferredVoice = useCallback(() => {
    const code = lang === 'tr' ? 'tr' : 'en'
    const filtered = voices.filter(v => v.lang.toLowerCase().startsWith(code))
    // Prefer Google (network) voices — significantly better quality
    return (
      filtered.find(v => v.name.toLowerCase().includes('google')) ||
      filtered.find(v => !v.localService) ||
      filtered[0] ||
      null
    )
  }, [voices, lang])

  const handleSpeak = useCallback(() => {
    if (!location || typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const parts: string[] = [location.name]
    if (location.period)
      parts.push(`${lang === 'tr' ? 'İnşa dönemi' : 'Period'}: ${location.period}.`)
    parts.push(location.description)
    if (location.buriedPersons?.length)
      parts.push(`${lang === 'tr' ? 'Metfun şahsiyetler' : 'Buried here'}: ${location.buriedPersons.join(', ')}.`)

    const utterance = new SpeechSynthesisUtterance(parts.join('. '))
    const voice = getPreferredVoice()
    if (voice) utterance.voice = voice
    utterance.lang    = lang === 'tr' ? 'tr-TR' : 'en-US'
    utterance.rate    = speed
    utterance.pitch   = lang === 'tr' ? 1.05 : 1.0
    utterance.volume  = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend   = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [location, isSpeaking, lang, speed, getPreferredVoice])

  const handleShare = useCallback(async () => {
    if (!location || typeof window === 'undefined') return
    const url  = `${window.location.origin}?loc=${location.id}`
    const text = lang === 'tr'
      ? `${location.name} — ${location.district} | Payitaht'ın İzinde`
      : `${location.name} — ${location.district} | In the Footsteps of the Capital`

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: location.name, text, url })
        return
      } catch { /* fall through to clipboard */ }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2200)
    } catch { /* ignore */ }
  }, [location, lang])

  const handleDirections = useCallback(() => {
    if (!location) return
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`,
      '_blank', 'noopener,noreferrer'
    )
  }, [location])

  if (!location) return null

  const config    = categoryConfig[location.category]
  const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window

  return (
    <AnimatePresence>
      {location && (
        <motion.div
          key={location.id}
          initial={{ opacity: 0, x: 30, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 30, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="absolute top-4 right-4 bottom-4 w-80 z-[1000] overflow-y-auto"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(10,10,25,0.98), rgba(15,15,30,0.99))'
              : 'linear-gradient(180deg, rgba(255,252,242,0.99), rgba(248,244,230,0.99))',
            border: `1px solid ${config.color}44`,
            borderRadius: '4px',
            backdropFilter: 'blur(20px)',
            boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px ${config.color}22`,
          }}
        >
          {/* Top color strip */}
          <div
            className="h-1 flex-shrink-0"
            style={{ background: `linear-gradient(90deg, transparent, ${config.color}, transparent)` }}
          />

          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: `${colors.gold}20` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-widest uppercase border mb-2 badge-${location.category}`}
                  style={{ borderRadius: '2px' }}
                >
                  <span>{config.icon}</span>
                  {config.label}
                </span>
                <h3
                  className="font-bold leading-snug"
                  style={{ color: colors.text1, fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1rem' }}
                >
                  {location.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                {/* Share */}
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={handleShare}
                  className="flex items-center justify-center w-7 h-7 rounded-full transition-all"
                  style={{
                    background: shareCopied ? 'rgba(46,139,87,0.2)' : `${colors.gold}15`,
                    border: `1px solid ${shareCopied ? 'rgba(46,139,87,0.6)' : colors.gold + '44'}`,
                    color: shareCopied ? '#2E8B57' : colors.gold,
                  }}
                  title={t('share_location')}
                >
                  <AnimatePresence mode="wait">
                    {shareCopied
                      ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={12} /></motion.span>
                      : <motion.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }}><Share2 size={12} /></motion.span>
                    }
                  </AnimatePresence>
                </motion.button>

                {/* Audio play/stop */}
                {hasSpeech && (
                  <motion.button
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={handleSpeak}
                    className="flex items-center justify-center w-7 h-7 rounded-full transition-all"
                    style={{
                      background: isSpeaking ? `${config.color}30` : `${config.color}15`,
                      border: `1px solid ${config.color}${isSpeaking ? '88' : '44'}`,
                      color: config.color,
                      boxShadow: isSpeaking ? `0 0 10px ${config.color}44` : 'none',
                    }}
                    title={isSpeaking ? t('loc_stop') : t('loc_listen')}
                  >
                    {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </motion.button>
                )}

                {/* Close */}
                <button
                  onClick={onClose}
                  style={{ color: colors.muted }}
                  className="transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.color = colors.gold)}
                  onMouseLeave={e => (e.currentTarget.style.color = colors.muted)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">

            {/* Address */}
            <div className="flex items-start gap-2 text-sm">
              <MapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.gold }} />
              <div>
                <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: colors.gold }}>{t('loc_address')}</div>
                <div className="text-xs leading-relaxed opacity-80" style={{ color: colors.text2 }}>{location.address}</div>
              </div>
            </div>

            {/* Period */}
            {location.period && (
              <div className="flex items-start gap-2 text-sm">
                <Clock size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.gold }} />
                <div>
                  <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: colors.gold }}>{t('loc_period')}</div>
                  <div className="text-xs opacity-80" style={{ color: colors.text2 }}>{location.period}</div>
                </div>
              </div>
            )}

            {/* Architect */}
            {location.architect && (
              <div className="flex items-start gap-2 text-sm">
                <Building2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.gold }} />
                <div>
                  <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: colors.gold }}>{t('loc_architect')}</div>
                  <div className="text-xs opacity-80" style={{ color: colors.text2 }}>{location.architect}</div>
                </div>
              </div>
            )}

            {/* Architectural style */}
            {location.architecturalStyle && (
              <div className="text-xs">
                <span
                  className="px-2 py-0.5 opacity-60"
                  style={{
                    background: `${colors.gold}10`,
                    border: `1px solid ${colors.gold}20`,
                    color: colors.text2,
                    borderRadius: '2px',
                  }}
                >
                  🏛️ {location.architecturalStyle}
                </span>
              </div>
            )}

            {/* Description */}
            <div>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: colors.gold }}>{t('loc_about')}</div>
              <p
                className="text-xs leading-relaxed opacity-75"
                style={{ color: colors.text2, fontFamily: "'Georgia', serif" }}
              >
                {location.description}
              </p>
            </div>

            {/* ── Audio Player ── */}
            {hasSpeech && (
              <div
                className="rounded p-3 transition-all"
                style={{
                  background: isSpeaking ? `${config.color}0C` : `${colors.gold}06`,
                  border: `1px solid ${isSpeaking ? config.color + '44' : colors.gold + '18'}`,
                }}
              >
                {/* Top row: play button + waveform */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={handleSpeak}
                    className="flex items-center gap-2 text-xs font-semibold transition-colors"
                    style={{ color: isSpeaking ? config.color : colors.gold }}
                  >
                    <motion.div
                      animate={isSpeaking ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      {isSpeaking
                        ? <VolumeX size={13} />
                        : <Volume2 size={13} />
                      }
                    </motion.div>
                    {isSpeaking ? t('loc_stop') : t('loc_listen')}
                  </button>

                  <Waveform isActive={isSpeaking} color={isSpeaking ? config.color : colors.gold + '55'} />
                </div>

                {/* Bottom row: speed selector */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] opacity-40 mr-1 uppercase tracking-widest" style={{ color: colors.text2 }}>
                    {t('audio_speed')}
                  </span>
                  {SPEEDS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSpeed(s.value)}
                      className="px-1.5 py-0.5 text-[9px] rounded transition-all"
                      style={{
                        background: speed === s.value ? `${colors.gold}22` : 'transparent',
                        border: `1px solid ${speed === s.value ? colors.gold + '66' : 'transparent'}`,
                        color: speed === s.value ? colors.gold : colors.muted,
                        fontWeight: speed === s.value ? 700 : 400,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Share confirmation toast */}
            <AnimatePresence>
              {shareCopied && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-2 text-xs"
                  style={{
                    background: 'rgba(46,139,87,0.12)',
                    border: '1px solid rgba(46,139,87,0.3)',
                    color: '#2E8B57',
                    borderRadius: '3px',
                  }}
                >
                  <Check size={11} />
                  {t('share_copied')}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buried persons */}
            {location.buriedPersons && location.buriedPersons.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest mb-2" style={{ color: colors.gold }}>
                  <Users size={12} />
                  {t('loc_buried')}
                </div>
                <ul className="space-y-1">
                  {location.buriedPersons.map((person, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs opacity-70" style={{ color: colors.text2 }}>
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: config.color }} />
                      {person}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Visit info */}
            {location.visitInfo && (
              <div
                className="p-3 text-xs opacity-70 leading-relaxed"
                style={{
                  background: `${colors.gold}06`,
                  border: `1px solid ${colors.gold}12`,
                  borderLeft: `3px solid ${config.color}`,
                  color: colors.text2,
                  borderRadius: '2px',
                }}
              >
                ℹ️ {location.visitInfo}
              </div>
            )}

            {/* Directions */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDirections}
              className="w-full py-2.5 text-xs tracking-widest uppercase font-semibold transition-all"
              style={{
                background: `linear-gradient(135deg, ${config.color}22, ${config.color}11)`,
                border: `1px solid ${config.color}44`,
                color: config.color,
                borderRadius: '2px',
              }}
            >
              {t('loc_directions')}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
