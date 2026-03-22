import type { NextConfig } from 'next'

const securityHeaders = [
  // Prevent clickjacking — don't allow the page to be embedded in an iframe
  { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Enable XSS filter in older browsers
  { key: 'X-XSS-Protection',       value: '1; mode=block' },
  // Minimal referrer information sent on cross-origin navigation
  { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
  // Restrict powerful feature APIs (allow geolocation for directions link)
  { key: 'Permissions-Policy',     value: 'camera=(), microphone=(self), geolocation=(self)' },
  // Speed up DNS lookups for external resources
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Apply security headers to every route
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },


}

export default nextConfig
