'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, MessageCircle } from 'lucide-react'

const welcomeMessages = [
  "Selam olsun sana, ey İstanbul aşığı! Ben Evliya Çelebi... Bu şehri 17. yüzyılda adım adım gezdim, şimdi seninle yeniden çıkıyorum yola!",
  "İstanbul'un her taşının altında bir tarih yatar. 124 türbe, 29 sahabe makamı... Hangisinden başlamak istersin?",
  "Bilir misin, Kanuni Sultan Süleyman türbesini ilk ziyaret ettiğimde gözlerimden yaşlar aktı. O muhteşem çinilere bak bir kez...",
  "Eyüpsultan'da Halid bin Zeyd Hazretleri'nin türbesini gördün mü? Orası şehrin manevi kalbidir, defalarca ziyaret ettim.",
  "Seyahatname'mde İstanbul'a 55 yıl ayırdım. Şimdi sen de bu yolculuğa ortak ol! Haritaya tıkla, rotanı seç.",
]

const locationTips: Record<string, string> = {
  padisah:  "Padişah türbelerinde genellikle hanedan üyeleri de medfundur. Osmanlı'nın koca tarihini bir türbede okuyabilirsin.",
  sahabe:   "Sahabe makamlarına varınca dur bir an... 7. yüzyıldan beri bu topraklar onların manevi koruyuculuğunda.",
  evliya:   "Evliya türbeleri bir tekke gibidir; şehrin ruhunu orada hissedersin. Her birinin kendine has bir kokusu vardır.",
  alim:     "Fatih Haziresi'ne gittiğinde eğer bilge olmak istiyorsan, Ali Kuşçu'nun kabri başında otur ve düşün.",
  devlet:   "Divanyolu'ndaki vezir türbelerini sayarken gözünde canlandır: kılıç sesi, at kişnemeleri, protokol törenleri...",
  kulturel: "Aşiyan'a çık, Boğaz'a bak. Yahya Kemal orada şiirler yazmış. Tanpınar orada İstanbul'u düşünmüş.",
}

interface EvliyaGuideProps {
  activeCategory?: string | null
  locationName?: string | null
}

export default function EvliyaGuide({ activeCategory, locationName }: EvliyaGuideProps) {
  const [isOpen,      setIsOpen]      = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentMsg,  setCurrentMsg]  = useState(0)
  const [isTyping,    setIsTyping]    = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [fullText,    setFullText]    = useState('')

  const getMessage = () => {
    if (locationName) {
      return `"${locationName}" hakkında şunları söyleyeyim: ${locationTips[activeCategory || 'padisah'] || welcomeMessages[0]}`
    }
    if (activeCategory && locationTips[activeCategory]) {
      return locationTips[activeCategory]
    }
    return welcomeMessages[currentMsg]
  }

  useEffect(() => {
    const msg = getMessage()
    setFullText(msg)
    setDisplayText('')
    setIsTyping(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, locationName, currentMsg])

  useEffect(() => {
    if (!isTyping) return
    if (displayText.length >= fullText.length) {
      setIsTyping(false)
      return
    }
    const timer = setTimeout(() => {
      setDisplayText(fullText.slice(0, displayText.length + 1))
    }, 25)
    return () => clearTimeout(timer)
  }, [isTyping, displayText, fullText])

  const nextMessage = () => {
    setCurrentMsg((prev) => (prev + 1) % welcomeMessages.length)
  }

  // İlk mesajı otomatik göster
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Açma butonu (küçültülmüşse) */}
      <AnimatePresence>
        {(!isOpen || isMinimized) && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false) }}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center glow-animate shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            style={{
              background: 'linear-gradient(135deg, #8B1A1A, #C5392F)',
              border: '2px solid #D4AF37',
            }}
            title="Evliya Çelebi ile konuş"
          >
            <MessageCircle size={24} className="text-[#D4AF37]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Ana panel */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]"
          >
            <div
              className="ottoman-card arabesque-border overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
              style={{ borderRadius: '4px' }}
            >
              {/* Başlık çubuğu */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,26,26,0.9), rgba(100,15,15,0.9))',
                  borderBottom: '1px solid rgba(212,175,55,0.3)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] glow-animate" />
                  <span className="text-[#D4AF37] text-sm font-semibold tracking-wide">
                    Evliya Çelebi Rehberiniz
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="text-[#EDE0C4] hover:text-[#D4AF37] transition-colors text-xs opacity-60 hover:opacity-100"
                    title="Küçült"
                  >
                    ─
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-[#EDE0C4] hover:text-[#D4AF37] transition-colors opacity-60 hover:opacity-100"
                    title="Kapat"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Karakter ve mesaj */}
              <div className="p-4">
                <div className="flex gap-3 mb-4">
                  {/* Animasyonlu karakter */}
                  <motion.div
                    animate={{
                      y: [0, -4, 0],
                      rotateZ: [0, 1, -1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                    style={{
                      background: 'radial-gradient(circle, rgba(212,175,55,0.15), transparent)',
                      border: '1px solid rgba(212,175,55,0.3)',
                    }}
                  >
                    🧙‍♂️
                  </motion.div>

                  {/* Konuşma balonu */}
                  <div className="flex-1 relative">
                    <div
                      className="p-3 text-[#EDE0C4] text-sm leading-relaxed"
                      style={{
                        background: 'rgba(212,175,55,0.05)',
                        border: '1px solid rgba(212,175,55,0.15)',
                        borderRadius: '0 8px 8px 8px',
                        minHeight: '70px',
                        fontFamily: "'Georgia', serif",
                      }}
                    >
                      {displayText}
                      {isTyping && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.7, repeat: Infinity }}
                          className="inline-block w-0.5 h-3 ml-0.5 bg-[#D4AF37] align-middle"
                        />
                      )}
                    </div>
                    {/* Balonun ok kısmı */}
                    <div
                      className="absolute top-2 -left-2 w-0 h-0"
                      style={{
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderRight: '8px solid rgba(212,175,55,0.15)',
                      }}
                    />
                  </div>
                </div>

                {/* Aksiyonlar */}
                {!isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between"
                  >
                    <button
                      onClick={nextMessage}
                      className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-[#F0D060] transition-colors"
                    >
                      Devam et
                      <ChevronRight size={12} />
                    </button>
                    <div className="flex gap-1">
                      {welcomeMessages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentMsg(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            i === currentMsg ? 'bg-[#D4AF37] scale-125' : 'bg-[rgba(212,175,55,0.3)]'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Alt çizgi */}
              <div className="h-[2px] bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.4)] to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
