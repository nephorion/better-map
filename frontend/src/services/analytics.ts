export const GOOGLE_ANALYTICS_ID = 'G-PZ4DB72GNK'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function initializeGoogleAnalytics(documentRef = document, windowRef = window) {
  try {
    const existing = documentRef.getElementById('better-map-google-analytics')
    windowRef.dataLayer = windowRef.dataLayer ?? []
    windowRef.gtag =
      windowRef.gtag ??
      function gtag(...args: unknown[]) {
        windowRef.dataLayer?.push(args)
      }

    if (!existing) {
      const script = documentRef.createElement('script')
      script.id = 'better-map-google-analytics'
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`
      documentRef.head.append(script)
    }

    windowRef.gtag('js', new Date())
    windowRef.gtag('config', GOOGLE_ANALYTICS_ID)
    return true
  } catch {
    return false
  }
}
