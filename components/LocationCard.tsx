'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, Users, Building2, Volume2, VolumeX } from 'lucide-react'
import { Location, categoryConfig } from '@/data/locations'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

interface LocationCardProps {
  location: Location | null
  onClose: () => void
}

export default function LocationCard({ location, onClose }: LocationCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { isDark } = useTheme()
  const { t, lang } = useLanguage()
  const colors = tc(isDark)

  // Stop speaking when location changes or card closes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [location])

  const handleSpeak = useCallback(() => {
    if (!location || !('speechSynthesis' in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const text = [
      location.name,
      location.period ? `. ${lang === 'tr' ? 'İnşa dönemi:' : 'Period:'} ${location.period}` : '',
      `. ${location.description}`,
      location.buriedPersons?.length
        ? `. ${lang === 'tr' ? 'Metfun şahsiyetler:' : 'Buried persons:'} ${location.buriedPersons.join(', ')}.`
        : '',
    ].join('')

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'tr' ? 'tr-TR' : 'en-US'
    utterance.rate = 0.88
    utterance.pitch = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [location, isSpeaking, lang])

  const handleDirections = () => {
    if (!location) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!location) return null

  const config = categoryConfig[location.category]

  return (
    <AnimatePresence>
      {location && (
        <motion.div
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
          {/* Top strip */}
          <div
            className="h-1"
            style={{ background: `linear-gradient(90deg, transparent, ${config.color}, transparent)` }}
          />

          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: `${colors.gold}20` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
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
                {/* Audio button */}
                {'speechSynthesis' in (typeof window !== 'undefined' ? window : {}) && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSpeak}
                    className="flex items-center justify-center w-7 h-7 rounded-full transition-all"
                    style={{
                      background: isSpeaking ? `${config.color}33` : `${config.color}15`,
                      border: `1px solid ${config.color}${isSpeaking ? '88' : '44'}`,
                      color: config.color,
                    }}
                    title={isSpeaking ? t('loc_stop') : t('loc_listen')}
                  >
                    {isSpeaking
                      ? <VolumeX size={12} />
                      : <Volume2 size={12} />
                    }
                  </motion.button>
                )}
                <button
                  onClick={onClose}
                  className="transition-colors"
                  style={{ color: colors.muted }}
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
              {/* Audio inline button */}
              {'speechSynthesis' in (typeof window !== 'undefined' ? window : {}) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSpeak}
                  className="mt-2 flex items-center gap-1.5 text-[11px] opacity-70 hover:opacity-100 transition-opacity"
                  style={{ color: config.color }}
                >
                  {isSpeaking ? <VolumeX size={11} /> : <Volume2 size={11} />}
                  {isSpeaking ? t('loc_stop') : t('loc_listen')}
                </motion.button>
              )}
            </div>

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

            {/* Directions button */}
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
