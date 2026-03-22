'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import { locations } from '@/data/locations'

const ALL_BADGES = [
  { id: 'istanbul-fatihi', name: 'İstanbul Fatihi',   icon: '⚔️', description: '14 padişah türbesini ziyaret et',     color: '#D4AF37', requirement: 14 },
  { id: 'sahabe-yolcusu', name: 'Sahabe Yolcusu',    icon: '☪️', description: '10 sahabe makamını ziyaret et',        color: '#2E8B57', requirement: 10 },
  { id: 'gonul-sultani',  name: 'Gönül Sultanı',      icon: '✨', description: 'Dört manevi direği ziyaret et',        color: '#8B1A1A', requirement: 4  },
  { id: 'ilim-talebesi',  name: 'İlim Talebesi',      icon: '📚', description: '5 alim kabrini ziyaret et',           color: '#3498DB', requirement: 5  },
  { id: 'devlet-ricali',  name: 'Devlet Ricali',      icon: '🏛️', description: '8 vezir türbesini ziyaret et',       color: '#9B59B6', requirement: 8  },
  { id: 'kultur-mirasci', name: 'Kültür Mirasçısı',   icon: '🎭', description: '5 kültür insanını ziyaret et',        color: '#E67E22', requirement: 5  },
  { id: 'mimar-sinan',    name: "Sinan'ın İzinde",    icon: '⚒️', description: '3 Mimar Sinan eserini ziyaret et',   color: '#4A90D9', requirement: 3  },
  { id: 'istanbul-rehberi', name: 'İstanbul Rehberi', icon: '🗺️', description: '50 konumu ziyaret et',               color: '#F0D060', requirement: 50 },
]

export default function BadgesSection() {
  const { profile, visitedCount } = useProfile()
  const earnedBadges = new Set(profile.badges)
  const totalLocs = locations.length

  return (
    <section id="badges" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f1e] to-[#050510]" />

      <div className="section-container relative z-10">
        {/* Başlık */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 border border-[rgba(212,175,55,0.3)] text-[#D4AF37] text-xs tracking-widest uppercase"
            style={{ borderRadius: '2px' }}
          >
            <Trophy size={12} />
            Başarı Madalyaları
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-gold-gradient calligraphy-title mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Dijital Başarılar
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#EDE0C4] opacity-55 max-w-lg mx-auto text-sm"
          >
            Mekanları keşfettikçe rozet kazan, İstanbul&apos;un manevi haritasını aydınlat.
          </motion.p>
        </div>

        {/* Rozetler ızgarası */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ALL_BADGES.map((badge, i) => {
            const isEarned = earnedBadges.has(badge.id)
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="ottoman-card text-center p-5 cursor-pointer"
                style={{
                  borderRadius: '4px',
                  border: `1px solid ${isEarned ? badge.color + '66' : 'rgba(212,175,55,0.08)'}`,
                  opacity: isEarned ? 1 : 0.5,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Madalya */}
                <div className="relative inline-flex items-center justify-center mb-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                    style={{
                      background: isEarned
                        ? `radial-gradient(circle, ${badge.color}33, ${badge.color}11)`
                        : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${isEarned ? badge.color + '66' : 'rgba(255,255,255,0.08)'}`,
                      filter: isEarned ? 'none' : 'grayscale(100%)',
                    }}
                  >
                    {isEarned ? badge.icon : <span className="text-2xl opacity-20">🔒</span>}
                  </div>
                  {isEarned && (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                      style={{ border: `1px solid ${badge.color}44` }}
                    />
                  )}
                </div>

                <h3
                  className="text-sm font-bold mb-1"
                  style={{
                    color: isEarned ? '#F5F0E8' : 'rgba(245,240,232,0.35)',
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  {badge.name}
                </h3>

                <p
                  className="text-[10px] leading-relaxed"
                  style={{ color: isEarned ? badge.color : 'rgba(212,175,55,0.2)' }}
                >
                  {badge.description}
                </p>

                {/* İlerleme */}
                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: isEarned ? '100%' : '0%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="h-full transition-all"
                    style={{ background: `linear-gradient(90deg, ${badge.color}88, ${badge.color})` }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Fog of War */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 p-6 text-center"
          style={{
            background: 'rgba(212,175,55,0.04)',
            border: '1px solid rgba(212,175,55,0.15)',
            borderRadius: '4px',
          }}
        >
          <div className="text-3xl mb-3">🌫️</div>
          <h3
            className="text-[#F5F0E8] font-bold text-xl mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Sisli Harita — Fog of War
          </h3>
          <p className="text-[#EDE0C4] opacity-55 max-w-md mx-auto text-sm leading-relaxed">
            Haritadaki her konuma tıkladığında ziyaret edildi olarak işaretlenir.
            İstanbul&apos;u tamamen keşfetmek için her türbeyi, her makamı adım adım ziyaret et.
          </p>

          {/* Sayaçlar */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-gradient calligraphy-title">{visitedCount}</div>
              <div className="text-xs text-[#EDE0C4] opacity-35">Ziyaret Edildi</div>
            </div>
            <div className="w-px h-8 bg-[rgba(212,175,55,0.2)]" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#EDE0C4] opacity-50">{totalLocs}</div>
              <div className="text-xs text-[#EDE0C4] opacity-35">Toplam Konum</div>
            </div>
            <div className="w-px h-8 bg-[rgba(212,175,55,0.2)]" />
            <div className="text-center">
              <div className="text-2xl font-bold" style={{
                color: visitedCount > 0 ? '#D4AF37' : 'rgba(237,224,196,0.3)'
              }}>
                %{Math.round((visitedCount / totalLocs) * 100)}
              </div>
              <div className="text-xs text-[#EDE0C4] opacity-35">Tamamlandı</div>
            </div>
          </div>

          {/* Global ilerleme çubuğu */}
          <div className="mt-4 max-w-xs mx-auto h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(visitedCount / totalLocs) * 100}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #8B1A1A, #D4AF37)' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
