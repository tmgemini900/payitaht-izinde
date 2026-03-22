import type { Metadata } from 'next'
import './globals.css'
import { ProfileProvider } from '@/context/ProfileContext'

export const metadata: Metadata = {
  title: "Payitaht'ın İzinde – İstanbul'un Manevi Haritası",
  description:
    "İstanbul'un 124 türbesi, 29 sahabe makamı, padişah türbeleri ve manevi rotaları ile interaktif tarihi gezi rehberi.",
  keywords: [
    "İstanbul türbeleri",
    "Osmanlı tarihi",
    "sahabe kabirleri",
    "manevi İstanbul",
    "Eyüp Sultan",
    "Fatih türbesi",
    "tarihi rotalar",
  ],
  openGraph: {
    title: "Payitaht'ın İzinde",
    description: "İstanbul'un manevi ve tarihi coğrafyasını keşfet",
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="ottoman-pattern antialiased">
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </body>
    </html>
  )
}
