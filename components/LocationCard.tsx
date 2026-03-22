'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, Users, Building2, Volume2, VolumeX, Share2, Check } from 'lucide-react'
import { Location, categoryConfig } from '@/data/locations'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'
import type { Translations } from '@/data/translations'

interface LocationCardProps {
  location: Location | null
  isVisited: boolean
  onToggleVisited: (id: number) => void
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

export default function LocationCard({ location, isVisited, onToggleVisited, onClose }: LocationCardProps) {
  const [isSpeaking,    setIsSpeaking]    = useState(false)
  const [speed,         setSpeed]         = useState(1.0)
  const [voices,        setVoices]        = useState<SpeechSynthesisVoice[]>([])
  const [shareCopied,   setShareCopied]   = useState(false)
  const [justMarked,    setJustMarked]    = useState(false)

  // Keep utterance in ref to prevent GC mid-playback (Chrome bug)
  const utteranceRef    = useRef<SpeechSynthesisUtterance | null>(null)
  // Chrome: synthesis silently pauses after ~15 s → keep-alive interval
  const resumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { isDark } = useTheme()
  const { t, lang } = useLanguage()
  const colors = tc(isDark)

  // ── Load TTS voices ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  // ── Cancel on location / lang change ───────────────────────────
  useEffect(() => {
    stopSpeech()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.id, lang])

  // ── Cleanup on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => stopSpeech()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current)
      resumeIntervalRef.current = null
    }
    utteranceRef.current = null
    setIsSpeaking(false)
  }

  const getPreferredVoice = useCallback((): SpeechSynthesisVoice | null => {
    const code = lang === 'tr' ? 'tr' : 'en'
    const filtered = voices.filter(v => v.lang.toLowerCase().startsWith(code))
    // Google voices are significantly better quality; prefer them
    return (
      filtered.find(v => v.name.toLowerCase().includes('google')) ||
      filtered.find(v => !v.localService) ||     // network voice as fallback
      filtered[0] ||
      null
    )
  }, [voices, lang])

  const handleSpeak = useCallback(() => {
    if (!location || typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (isSpeaking) {
      stopSpeech()
      return
    }

    // Always cancel first to flush any queued utterances
    window.speechSynthesis.cancel()

    const parts: string[] = [location.name]
    if (location.period)
      parts.push(`${lang === 'tr' ? 'İnşa dönemi' : 'Period'}: ${location.period}.`)
    parts.push(location.description)
    if (location.buriedPersons?.length)
      parts.push(
        `${lang === 'tr' ? 'Metfun şahsiyetler' : 'Buried here'}: ${location.buriedPersons.join(', ')}.`
      )

    const utterance = new SpeechSynthesisUtterance(parts.join('. '))
    utteranceRef.current = utterance // Prevent GC

    const voice = getPreferredVoice()
    if (voice) utterance.voice = voice
    utterance.lang   = lang === 'tr' ? 'tr-TR' : 'en-US'
    utterance.rate   = speed
    utterance.pitch  = lang === 'tr' ? 1.05 : 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend   = () => {
      setIsSpeaking(false)
      if (resumeIntervalRef.current) { clearInterval(resumeIntervalRef.current); resumeIntervalRef.current = null }
      utteranceRef.current = null
    }
    utterance.onerror = (e) => {
      // 'interrupted' fires when we cancel() manually — not a real error
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('[TTS]', e.error)
      }
      setIsSpeaking(false)
      if (resumeIntervalRef.current) { clearInterval(resumeIntervalRef.current); resumeIntervalRef.current = null }
    }

    window.speechSynthesis.speak(utterance)

    // ── Chrome keep-alive fix ──────────────────────────────────────
    // Chrome pauses synthesis silently after ~14 s. Periodic resume() prevents it.
    resumeIntervalRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(resumeIntervalRef.current!)
        resumeIntervalRef.current = null
        return
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
    }, 8000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, isSpeaking, lang, speed, getPreferredVoice])

  const handleShare = useCallback(async () => {
    if (!location || typeof window === 'undefined') return
    const url  = `${window.location.origin}?loc=${location.id}`
    const text = lang === 'tr'
      ? `${location.name} — ${location.district} | Payitaht'ın İzinde`
      : `${location.name} — ${location.district} | In the Footsteps of the Capital`

    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title: location.name, text, url }); return } catch { /* fallback */ }
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
          // Mobile: slides up from bottom  |  Desktop: slides in from right
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          // ── Responsive layout ──────────────────────────────────────
          // Mobile:  fixed bottom sheet, full width, max 68vh
          // Desktop: absolute right panel inside map container
          className={[
            'z-[1000] overflow-y-auto',
            // mobile
            'fixed bottom-0 left-0 right-0 max-h-[68vh] rounded-t-2xl',
            // sm+
            'sm:absolute sm:top-4 sm:right-4 sm:bottom-4 sm:left-auto sm:w-80 sm:max-h-none sm:rounded-none',
          ].join(' ')}
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(10,10,25,0.99), rgba(15,15,30,1))'
              : 'linear-gradient(180deg, rgba(255,252,242,0.99), rgba(248,244,230,0.99))',
            border: `1px solid ${config.color}44`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px ${config.color}22`,
          }}
        >
          {/* Drag handle (mobile visual cue) */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full opacity-30" style={{ background: colors.gold }} />
          </div>

          {/* Top color strip */}
          <div
            className="h-0.5 sm:h-1 flex-shrink-0"
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
                  {t(`cat_${location.category}` as keyof Translations)}
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
                  whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
                  onClick={handleShare}
                  aria-label={t('share_location')}
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
                  style={{
                    background: shareCopied ? 'rgba(46,139,87,0.2)' : `${colors.gold}15`,
                    border: `1px solid ${shareCopied ? 'rgba(46,139,87,0.6)' : colors.gold + '44'}`,
                    color: shareCopied ? '#2E8B57' : colors.gold,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {shareCopied
                      ? <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={13} /></motion.span>
                      : <motion.span key="s" initial={{ scale: 0 }} animate={{ scale: 1 }}><Share2 size={13} /></motion.span>
                    }
                  </AnimatePresence>
                </motion.button>

                {/* Audio play/stop */}
                {hasSpeech && (
                  <motion.button
                    whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
                    onClick={handleSpeak}
                    aria-label={isSpeaking ? t('loc_stop') : t('loc_listen')}
                    className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
                    style={{
                      background: isSpeaking ? `${config.color}30` : `${config.color}15`,
                      border: `1px solid ${config.color}${isSpeaking ? '88' : '44'}`,
                      color: config.color,
                      boxShadow: isSpeaking ? `0 0 12px ${config.color}44` : 'none',
                    }}
                  >
                    {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </motion.button>
                )}

                {/* Close */}
                <button
                  onClick={onClose}
                  aria-label={t('btn_close')}
                  style={{ color: colors.muted }}
                  className="w-8 h-8 flex items-center justify-center transition-colors"
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
            <div className="flex items-start gap-2">
              <MapPin size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.gold }} />
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: colors.gold }}>{t('loc_address')}</div>
                <div className="text-xs leading-relaxed opacity-80" style={{ color: colors.text2 }}>{location.address}</div>
              </div>
            </div>

            {/* Period */}
            {location.period && (
              <div className="flex items-start gap-2">
                <Clock size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.gold }} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: colors.gold }}>{t('loc_period')}</div>
                  <div className="text-xs opacity-80" style={{ color: colors.text2 }}>{location.period}</div>
                </div>
              </div>
            )}

            {/* Architect */}
            {location.architect && (
              <div className="flex items-start gap-2">
                <Building2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.gold }} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: colors.gold }}>{t('loc_architect')}</div>
                  <div className="text-xs opacity-80" style={{ color: colors.text2 }}>{location.architect}</div>
                </div>
              </div>
            )}

            {/* Architectural style */}
            {location.architecturalStyle && (
              <span
                className="inline-block text-xs px-2 py-0.5 opacity-60"
                style={{
                  background: `${colors.gold}10`,
                  border: `1px solid ${colors.gold}20`,
                  color: colors.text2,
                  borderRadius: '2px',
                }}
              >
                🏛️ {location.architecturalStyle}
              </span>
            )}

            {/* Description */}
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: colors.gold }}>{t('loc_about')}</div>
              <p
                className="text-xs leading-relaxed opacity-75"
                style={{ color: colors.text2, fontFamily: "'Georgia', serif" }}
              >
                {location.description}
              </p>
            </div>

            {/* ── Audio Player ─────────────────────────────────────── */}
            {hasSpeech && (
              <div
                className="rounded-lg p-3 transition-all duration-300"
                style={{
                  background: isSpeaking ? `${config.color}0E` : `${colors.gold}07`,
                  border: `1px solid ${isSpeaking ? config.color + '50' : colors.gold + '18'}`,
                }}
              >
                {/* Play/stop + waveform */}
                <div className="flex items-center justify-between mb-2.5">
                  <button
                    onClick={handleSpeak}
                    aria-label={isSpeaking ? t('loc_stop') : t('loc_listen')}
                    className="flex items-center gap-2 text-xs font-semibold transition-colors"
                    style={{ color: isSpeaking ? config.color : colors.gold }}
                  >
                    <motion.div
                      animate={isSpeaking ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </motion.div>
                    <span>{isSpeaking ? t('loc_stop') : t('loc_listen')}</span>
                  </button>
                  <Waveform isActive={isSpeaking} color={isSpeaking ? config.color : `${colors.gold}55`} />
                </div>

                {/* Speed controls */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest opacity-40 mr-1" style={{ color: colors.text2 }}>
                    {t('audio_speed')}
                  </span>
                  {SPEEDS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => { setSpeed(s.value); if (isSpeaking) { stopSpeech(); setTimeout(handleSpeak, 50) } }}
                      className="px-2 py-0.5 text-[9px] rounded transition-all"
                      style={{
                        background: speed === s.value ? `${colors.gold}25` : 'transparent',
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
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest mb-2" style={{ color: colors.gold }}>
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

            {/* ── Visit Toggle Button ──────────────────────────────── */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (!location) return
                onToggleVisited(location.id)
                if (!isVisited) {
                  setJustMarked(true)
                  setTimeout(() => setJustMarked(false), 2500)
                }
              }}
              className="w-full py-3 text-xs tracking-widest uppercase font-semibold transition-all flex items-center justify-center gap-2"
              style={isVisited ? {
                background: 'rgba(46,139,87,0.15)',
                border: '1px solid rgba(46,139,87,0.5)',
                color: '#2E8B57',
                borderRadius: '2px',
              } : {
                background: `linear-gradient(135deg, ${colors.gold}18, ${colors.gold}08)`,
                border: `1px solid ${colors.gold}55`,
                color: colors.gold,
                borderRadius: '2px',
              }}
            >
              <AnimatePresence mode="wait">
                {isVisited ? (
                  <motion.span
                    key="visited"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={13} />
                    {justMarked
                      ? <span style={{ color: '#2E8B57' }}>✨ {t('loc_mark_visited_done')}!</span>
                      : <span>{t('loc_mark_visited_done')} · <span className="opacity-60 normal-case text-[10px]">{t('loc_unmark_visited')}</span></span>
                    }
                  </motion.span>
                ) : (
                  <motion.span
                    key="unvisited"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>🕌</span>
                    {t('loc_mark_visited')}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Directions */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleDirections}
              className="w-full py-3 text-xs tracking-widest uppercase font-semibold transition-all"
              style={{
                background: `linear-gradient(135deg, ${config.color}22, ${config.color}11)`,
                border: `1px solid ${config.color}44`,
                color: config.color,
                borderRadius: '2px',
              }}
            >
              {t('loc_directions')}
            </motion.button>

            {/* Bottom safe area spacing on mobile */}
            <div className="sm:hidden h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
