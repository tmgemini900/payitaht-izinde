'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { divIcon, LatLngExpression } from 'leaflet'
import { Location, LocationCategory, categoryConfig, thematicRoutes } from '@/data/locations'

// ─── Özel SVG Marker ───────────────────────────────────────────
function createCustomIcon(category: LocationCategory, isVisited: boolean, isHighImportance: boolean) {
  const cfg = categoryConfig[category]
  const size = isHighImportance ? 36 : 28
  const color = cfg.markerColor
  const opacity = isVisited ? 1 : 0.85

  const svg = `
    <svg width="${size}" height="${size + 8}" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mg${category}" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.6"/>
        </radialGradient>
        ${isVisited ? `<filter id="glow${category}"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : ''}
      </defs>
      <!-- Gölge -->
      <ellipse cx="18" cy="42" rx="8" ry="3" fill="rgba(0,0,0,0.4)"/>
      <!-- Pin gövdesi -->
      <path d="M18 2 C8 2 2 10 2 18 C2 28 18 42 18 42 C18 42 34 28 34 18 C34 10 28 2 18 2Z"
        fill="url(#mg${category})"
        stroke="rgba(255,255,255,0.3)"
        stroke-width="1"
        opacity="${opacity}"
        ${isVisited ? `filter="url(#glow${category})"` : ''}
      />
      <!-- İç daire -->
      <circle cx="18" cy="18" r="9" fill="rgba(0,0,0,0.3)"/>
      <!-- Emoji / ikon merkezi  -->
      <text x="18" y="23" text-anchor="middle" font-size="12" fill="white" opacity="${opacity}">
        ${isVisited ? '✓' : cfg.icon.replace(/[^\u0000-\uFFFF]/g, '') || '●'}
      </text>
    </svg>
  `

  return divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  })
}

// ─── Harita uçuş kontrolü ───────────────────────────────────────
function FlyController({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap()
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.flyTo([lat, lng], 16, { duration: 1.2 })
    }
  }, [lat, lng, map])
  return null
}

// ─── Ana Bileşen ────────────────────────────────────────────────
interface LeafletMapProps {
  locations: Location[]
  selectedLocation: Location | null
  visitedIds: Set<number>
  activeRouteId: string | null
  onLocationSelect: (loc: Location) => void
  mapRef?: React.MutableRefObject<{ flyTo: (lat: number, lng: number) => void } | null>
}

const LeafletMap = forwardRef<unknown, LeafletMapProps>(({
  locations,
  selectedLocation,
  visitedIds,
  activeRouteId,
  onLocationSelect,
}, _ref) => {
  const activeRoute = thematicRoutes.find(r => r.id === activeRouteId)

  // Aktif rota çizgisi
  const routePolyline: LatLngExpression[] = activeRoute
    ? activeRoute.locationIds
        .map(id => locations.find(l => l.id === id))
        .filter(Boolean)
        .map(l => [l!.lat, l!.lng] as LatLngExpression)
    : []

  return (
    <MapContainer
      center={[41.015, 28.97]}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      {/* Dark tema tile katmanı */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
      />

      {/* Uçuş kontrolü */}
      {selectedLocation && (
        <FlyController lat={selectedLocation.lat} lng={selectedLocation.lng} />
      )}

      {/* Rota çizgisi */}
      {activeRoute && routePolyline.length > 1 && (
        <Polyline
          positions={routePolyline}
          pathOptions={{
            color: activeRoute.color,
            weight: 3,
            opacity: 0.75,
            dashArray: '10, 6',
          }}
        />
      )}

      {/* Marker'lar */}
      {locations.map((loc) => {
        const isVisited = visitedIds.has(loc.id)
        const isSelected = selectedLocation?.id === loc.id
        const icon = createCustomIcon(loc.category, isVisited, loc.importance === 'high')

        return (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={icon}
            eventHandlers={{ click: () => onLocationSelect(loc) }}
          >
            <Popup
              closeButton={false}
              className="ottoman-popup"
              maxWidth={260}
            >
              <div style={{ fontFamily: 'Georgia, serif', minWidth: '200px' }}>
                {/* Kategori etiketi */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '14px' }}>{categoryConfig[loc.category].icon}</span>
                  <span style={{
                    fontSize: '9px',
                    color: categoryConfig[loc.category].color,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    opacity: 0.9,
                  }}>
                    {categoryConfig[loc.category].label}
                  </span>
                </div>

                {/* Başlık */}
                <h3 style={{
                  margin: '0 0 6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#F5F0E8',
                  lineHeight: 1.3,
                }}>
                  {loc.name}
                </h3>

                {/* Adres */}
                <p style={{
                  margin: '0 0 6px',
                  fontSize: '11px',
                  color: '#D4AF37',
                  opacity: 0.8,
                }}>
                  📍 {loc.district}
                </p>

                {/* Dönem */}
                {loc.period && (
                  <p style={{
                    margin: '0 0 8px',
                    fontSize: '10px',
                    color: '#EDE0C4',
                    opacity: 0.55,
                  }}>
                    🕰 {loc.period}
                  </p>
                )}

                {/* Açıklama */}
                <p style={{
                  margin: '0 0 10px',
                  fontSize: '11px',
                  color: '#EDE0C4',
                  opacity: 0.7,
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {loc.description}
                </p>

                {/* Ziyaret rozeti */}
                {isVisited && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    background: 'rgba(212,175,55,0.15)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: '2px',
                    fontSize: '10px',
                    color: '#D4AF37',
                  }}>
                    ✓ Ziyaret Edildi
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
})

LeafletMap.displayName = 'LeafletMap'
export default LeafletMap
