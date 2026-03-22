'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, Users, Building2 } from 'lucide-react'
import { Location, categoryConfig } from '@/data/locations'

interface LocationCardProps {
  location: Location | null
  onClose: () => void
}

export default function LocationCard({ location, onClose }: LocationCardProps) {
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
            background: 'linear-gradient(180deg, rgba(10,10,25,0.98), rgba(15,15,30,0.99))',
            border: `1px solid ${config.color}44`,
            borderRadius: '4px',
            backdropFilter: 'blur(20px)',
            boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px ${config.color}22`,
          }}
        >
          {/* Üst şerit */}
          <div
            className="h-1"
            style={{ background: `linear-gradient(90deg, transparent, ${config.color}, transparent)` }}
          />

          {/* Başlık */}
          <div className="p-4 border-b border-[rgba(212,175,55,0.15)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                {/* Kategori rozeti */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-widest uppercase border mb-2 badge-${location.category}`}
                  style={{ borderRadius: '2px' }}
                >
                  <span>{config.icon}</span>
                  {config.label}
                </span>
                <h3
                  className="text-[#F5F0E8] font-bold leading-snug"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1rem' }}
                >
                  {location.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 text-[#EDE0C4] hover:text-[#D4AF37] transition-colors mt-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* İçerik */}
          <div className="p-4 space-y-4">

            {/* Konum */}
            <div className="flex items-start gap-2 text-sm">
              <MapPin size={14} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-0.5">Adres</div>
                <div className="text-[#EDE0C4] opacity-80 text-xs leading-relaxed">{location.address}</div>
              </div>
            </div>

            {/* Dönem */}
            {location.period && (
              <div className="flex items-start gap-2 text-sm">
                <Clock size={14} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-0.5">Dönem / İnşa</div>
                  <div className="text-[#EDE0C4] opacity-80 text-xs">{location.period}</div>
                </div>
              </div>
            )}

            {/* Mimar */}
            {location.architect && (
              <div className="flex items-start gap-2 text-sm">
                <Building2 size={14} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-0.5">Mimar</div>
                  <div className="text-[#EDE0C4] opacity-80 text-xs">{location.architect}</div>
                </div>
              </div>
            )}

            {/* Mimari Stil */}
            {location.architecturalStyle && (
              <div className="text-xs">
                <span
                  className="px-2 py-0.5 text-[#EDE0C4] opacity-60"
                  style={{
                    background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.15)',
                    borderRadius: '2px',
                  }}
                >
                  🏛️ {location.architecturalStyle}
                </span>
              </div>
            )}

            {/* Açıklama */}
            <div>
              <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-2">Hakkında</div>
              <p
                className="text-[#EDE0C4] opacity-75 text-xs leading-relaxed"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {location.description}
              </p>
            </div>

            {/* Metfun kişiler */}
            {location.buriedPersons && location.buriedPersons.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-widest mb-2">
                  <Users size={12} />
                  Metfun Şahsiyetler
                </div>
                <ul className="space-y-1">
                  {location.buriedPersons.map((person, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-xs text-[#EDE0C4] opacity-70"
                    >
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: config.color }} />
                      {person}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ziyaret bilgisi */}
            {location.visitInfo && (
              <div
                className="p-3 text-xs text-[#EDE0C4] opacity-70 leading-relaxed"
                style={{
                  background: 'rgba(212,175,55,0.06)',
                  border: '1px solid rgba(212,175,55,0.12)',
                  borderRadius: '2px',
                  borderLeft: `3px solid ${config.color}`,
                }}
              >
                ℹ️ {location.visitInfo}
              </div>
            )}

            {/* Haritada göster butonu */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 text-xs tracking-widest uppercase font-semibold transition-all"
              style={{
                background: `linear-gradient(135deg, ${config.color}22, ${config.color}11)`,
                border: `1px solid ${config.color}44`,
                color: config.color,
                borderRadius: '2px',
              }}
            >
              📍 Yol Tarifi Al
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
