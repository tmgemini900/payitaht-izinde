'use client'

import React, { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Location, thematicRoutes } from '@/data/locations'

export interface SavedRoute {
  id: string
  name: string
  description: string
  locationIds: number[]
  color: string
  createdAt: string
  icon: string
}

export interface UserProfile {
  name: string
  visitedIds: number[]
  savedRoutes: SavedRoute[]
  badges: string[]
  favoriteCategories: string[]
  avatar?: string
  onboardingDone?: boolean
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Gezgin',
  visitedIds: [],
  savedRoutes: [],
  badges: [],
  favoriteCategories: [],
  avatar: '🧭',
  onboardingDone: false,
}

// Rozet koşulları
const BADGE_CONDITIONS: Array<{
  id: string
  name: string
  icon: string
  check: (profile: UserProfile, locations: Location[]) => boolean
}> = [
  {
    id: 'istanbul-fatihi',
    name: 'İstanbul Fatihi',
    icon: '⚔️',
    check: (p, locs) =>
      p.visitedIds.filter(id => locs.find(l => l.id === id)?.category === 'padisah').length >= 14,
  },
  {
    id: 'sahabe-yolcusu',
    name: 'Sahabe Yolcusu',
    icon: '☪️',
    check: (p, locs) =>
      p.visitedIds.filter(id => locs.find(l => l.id === id)?.category === 'sahabe').length >= 10,
  },
  {
    id: 'gonul-sultani',
    name: 'Gönül Sultanı',
    icon: '✨',
    check: (p) => [40, 41, 42, 43].every(id => p.visitedIds.includes(id)),
  },
  {
    id: 'ilim-talebesi',
    name: 'İlim Talebesi',
    icon: '📚',
    check: (p, locs) =>
      p.visitedIds.filter(id => locs.find(l => l.id === id)?.category === 'alim').length >= 5,
  },
  {
    id: 'devlet-ricali',
    name: 'Devlet Ricali',
    icon: '🏛️',
    check: (p, locs) =>
      p.visitedIds.filter(id => locs.find(l => l.id === id)?.category === 'devlet').length >= 8,
  },
  {
    id: 'kultur-mirasci',
    name: 'Kültür Mirasçısı',
    icon: '🎭',
    check: (p, locs) =>
      p.visitedIds.filter(id => locs.find(l => l.id === id)?.category === 'kulturel').length >= 5,
  },
  {
    id: 'mimar-sinan',
    name: "Sinan'ın İzinde",
    icon: '⚒️',
    check: (p) => [4, 80, 81, 82, 92].filter(id => p.visitedIds.includes(id)).length >= 3,
  },
  {
    id: 'istanbul-rehberi',
    name: 'İstanbul Rehberi',
    icon: '🗺️',
    check: (p) => p.visitedIds.length >= 50,
  },
]

interface ProfileContextValue {
  profile: UserProfile
  isLoaded: boolean
  setName: (name: string) => void
  setAvatar: (avatar: string) => void
  completeOnboarding: (name: string, avatar: string) => void
  markVisited: (locationId: number, allLocations: Location[]) => void
  unmarkVisited: (locationId: number) => void
  isVisited: (locationId: number) => boolean
  saveRoute: (route: Omit<SavedRoute, 'id' | 'createdAt'>) => void
  deleteRoute: (routeId: string) => void
  getEarnedBadges: (allLocations: Location[]) => typeof BADGE_CONDITIONS
  getAllBadgeConditions: () => typeof BADGE_CONDITIONS
  visitedCount: number
  clearAll: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { value: profile, setValue: setProfile, isLoaded } = useLocalStorage<UserProfile>(
    'payitaht-profile',
    DEFAULT_PROFILE
  )

  const setName = useCallback((name: string) => {
    setProfile(prev => ({ ...prev, name }))
  }, [setProfile])

  const setAvatar = useCallback((avatar: string) => {
    setProfile(prev => ({ ...prev, avatar }))
  }, [setProfile])

  const completeOnboarding = useCallback((name: string, avatar: string) => {
    setProfile(prev => ({ ...prev, name: name.trim() || prev.name, avatar, onboardingDone: true }))
  }, [setProfile])

  const markVisited = useCallback((locationId: number, allLocations: Location[]) => {
    setProfile(prev => {
      if (prev.visitedIds.includes(locationId)) return prev
      const newVisited = [...prev.visitedIds, locationId]
      const newProfile = { ...prev, visitedIds: newVisited }

      // Yeni rozet kontrolü
      const newBadges = BADGE_CONDITIONS
        .filter(b => !prev.badges.includes(b.id) && b.check(newProfile, allLocations))
        .map(b => b.id)

      return { ...newProfile, badges: [...prev.badges, ...newBadges] }
    })
  }, [setProfile])

  const unmarkVisited = useCallback((locationId: number) => {
    setProfile(prev => ({
      ...prev,
      visitedIds: prev.visitedIds.filter(id => id !== locationId),
    }))
  }, [setProfile])

  const isVisited = useCallback((locationId: number) => {
    return profile.visitedIds.includes(locationId)
  }, [profile.visitedIds])

  const saveRoute = useCallback((route: Omit<SavedRoute, 'id' | 'createdAt'>) => {
    const newRoute: SavedRoute = {
      ...route,
      id: `route-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setProfile(prev => ({ ...prev, savedRoutes: [...prev.savedRoutes, newRoute] }))
  }, [setProfile])

  const deleteRoute = useCallback((routeId: string) => {
    setProfile(prev => ({
      ...prev,
      savedRoutes: prev.savedRoutes.filter(r => r.id !== routeId),
    }))
  }, [setProfile])

  const getEarnedBadges = useCallback((allLocations: Location[]) => {
    return BADGE_CONDITIONS.filter(b => profile.badges.includes(b.id) || b.check(profile, allLocations))
  }, [profile])

  const getAllBadgeConditions = useCallback(() => BADGE_CONDITIONS, [])

  const clearAll = useCallback(() => {
    setProfile(DEFAULT_PROFILE)
  }, [setProfile])

  return (
    <ProfileContext.Provider value={{
      profile,
      isLoaded,
      setName,
      setAvatar,
      completeOnboarding,
      markVisited,
      unmarkVisited,
      isVisited,
      saveRoute,
      deleteRoute,
      getEarnedBadges,
      getAllBadgeConditions,
      visitedCount: profile.visitedIds.length,
      clearAll,
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}

export { BADGE_CONDITIONS }
