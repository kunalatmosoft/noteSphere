import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'

export function useAnalytics() {
  const location = useLocation()
  const initialized = useRef(false)

  // 1. Initialize GA4 on first load
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_ID
    if (gaId && !initialized.current) {
      ReactGA.initialize(gaId)
      initialized.current = true
    }
  }, [])

  // 2. Track page views on route changes
  useEffect(() => {
    if (initialized.current) {
      ReactGA.send({ 
        hitType: 'pageview', 
        page: location.pathname + location.search 
      })
    }
  }, [location])
}