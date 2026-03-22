'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Read on mount only (key shouldn't change after mount)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T)
      }
    } catch (error) {
      console.warn(`[useLocalStorage] read "${key}":`, error)
    } finally {
      setIsLoaded(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount

  // Fix: functional updater avoids stale closure — always reads latest state
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const next = value instanceof Function ? value(prev) : value
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch (error) {
        console.warn(`[useLocalStorage] write "${key}":`, error)
      }
      return next
    })
  }, [key])

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.warn(`[useLocalStorage] remove "${key}":`, error)
    }
    setStoredValue(initialValue)
  }, [key, initialValue])

  return { value: storedValue, setValue, removeValue, isLoaded }
}
