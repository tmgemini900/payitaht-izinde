'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Star, Volume2, Map } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import { useTheme, tc } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

const AVATARS = ['🧭', '🧙‍♂️', '🗺️', '📜', '⚔️', '🏛️', '☽', '✨', '🔭', '📖', '👳‍♂️', '🌙']

export default function WelcomeModal() {
  const { profile, isLoaded, completeOnboarding, visitedCount } = useProfile()
  const { isDark } = useTheme()
  const { t, lang } = useLanguage()
  const colors = tc(isDark)

  // Strip potential injection characters from name input
  const sanitizeName = (s: string) => s.replace(/[<>'"&]/g, '').slice(0, 25)

  const [name, setName]     = useState('')
  const [avatar, setAvatar] = useState('🧭')
  const [step, setStep]     = useState<1 | 2>(1)

  const showModal = isLoaded && !profile.onboardingDone && visitedCount === 0

  const handleNext = () => {
    if (step === 1) { setStep(2); return }
    completeOnboarding(name, avatar)
  }

  const handleSkip = () => completeOnboarding(profile.name, profile.avatar ?? '🧭')

  if (!showModal) return null

  const features = [
    { icon: <Map size={14} />,    text: t('welcome_feature1') },
    { icon: <Volume2 size={14} />, text: t('welcome_feature2') },
    { icon: <Star size={14} />,   text: t('welcome_feature3') },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="w-full max-w-md overflow-hidden relative"
          style={{
            background: isDark
              ? 'linear-gradient(160deg, #0d0d20, #0a0a18)'
              : 'linear-gradient(160deg, #FDF8EE, #F4ECD8)',
            border: `1px solid ${colors.gold}44`,
            borderRadius: '8px',
            boxShadow: `0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px ${colors.gold}18`,
          }}
        >
          {/* Top gold line */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

          {/* Ottoman decorative circles */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${colors.gold}, transparent)`, transform: 'translate(30%, -30%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-8 pointer-events-none"
            style={{ background: `radial-gradient(circle, #8B1A1A, transparent)`, transform: 'translate(-30%, 30%)' }}
          />

          <div className="relative p-8">
            {/* Logo / Icon */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 text-3xl"
                style={{
                  background: `radial-gradient(circle, ${colors.gold}22, ${colors.gold}08)`,
                  border: `2px solid ${colors.gold}55`,
                }}
              >
                <Compass size={28} style={{ color: colors.gold }} />
              </motion.div>

              <h1
                className="text-2xl font-bold text-gold-gradient calligraphy-title mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {t('welcome_title')}
              </h1>
              <p className="text-sm opacity-55" style={{ color: colors.text2 }}>
                {t('welcome_subtitle')}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {features.map((f, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded"
                        style={{
                          background: `${colors.gold}08`,
                          border: `1px solid ${colors.gold}18`,
                        }}
                      >
                        <span style={{ color: colors.gold }}>{f.icon}</span>
                        <span className="text-sm opacity-75" style={{ color: colors.text2 }}>{f.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3 font-semibold text-sm tracking-wider"
                    style={{
                      background: 'linear-gradient(135deg, #8B1A1A, #C5392F)',
                      border: `1px solid ${colors.gold}44`,
                      color: '#F5E6C4',
                      borderRadius: '4px',
                    }}
                  >
                    {lang === 'tr' ? 'Devam Et →' : 'Continue →'}
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Name input */}
                  <div className="mb-5">
                    <label className="block text-xs uppercase tracking-widest mb-2 opacity-70" style={{ color: colors.gold }}>
                      {t('welcome_name_label')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('welcome_name_placeholder')}
                      value={name}
                      onChange={e => setName(sanitizeName(e.target.value))}
                      onKeyDown={e => e.key === 'Enter' && handleNext()}
                      maxLength={25}
                      autoFocus
                      className="w-full px-4 py-3 text-sm outline-none"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        border: `1px solid ${colors.gold}44`,
                        borderRadius: '4px',
                        color: colors.text1,
                        fontFamily: "'Georgia', serif",
                      }}
                    />
                  </div>

                  {/* Avatar grid */}
                  <div className="mb-6">
                    <label className="block text-xs uppercase tracking-widest mb-2 opacity-70" style={{ color: colors.gold }}>
                      {t('welcome_avatar_label')}
                    </label>
                    {/* 4 cols on mobile, 6 on sm+ for better tap targets */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {AVATARS.map(av => (
                        <motion.button
                          key={av}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setAvatar(av)}
                          // Minimum 44px touch target for accessibility
                          className="aspect-square flex items-center justify-center rounded transition-all"
                          style={{
                            minHeight: '44px',
                            background: avatar === av ? `${colors.gold}25` : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            border: `1px solid ${avatar === av ? colors.gold + '88' : colors.border}`,
                            fontSize: '1.4rem',
                          }}
                        >
                          {av}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className="w-full py-3 font-bold text-sm tracking-wider flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                      color: '#0f0f1e',
                      borderRadius: '4px',
                    }}
                  >
                    <Compass size={16} />
                    {t('welcome_start')}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skip */}
            <button
              onClick={handleSkip}
              className="w-full mt-3 text-xs opacity-30 hover:opacity-60 transition-opacity py-1"
              style={{ color: colors.text2 }}
            >
              {t('welcome_skip')}
            </button>

            {/* Step indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2].map(s => (
                <div
                  key={s}
                  className="rounded-full transition-all"
                  style={{
                    width: step === s ? '20px' : '6px',
                    height: '6px',
                    background: step === s ? colors.gold : `${colors.gold}30`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bottom gold line */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
