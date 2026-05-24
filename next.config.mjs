/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // X-XSS-Protection is deprecated in modern browsers; CSP below is
          // the correct replacement. Kept for legacy browser compat.
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // HSTS — enforces HTTPS for 1 year; includeSubDomains covers *.vercel.app
          // Note: only effective when served over HTTPS (Vercel production).
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Content Security Policy
          // - default-src 'self': blocks all unexpected resource origins
          // - script-src 'self' 'unsafe-inline': required for Next.js inline
          //   bootstrap scripts; tighten with nonces when CSP nonce support lands
          // - style-src 'self' 'unsafe-inline': required by Tailwind inline styles
          // - img-src 'self' data: blob:: Next.js Image, favicons, data URIs
          // - font-src 'self': local woff/woff2 only
          // - connect-src 'self': XHR/fetch to same origin only (SSE included)
          // - frame-ancestors 'none': belt-and-suspenders with X-Frame-Options
          // - object-src 'none': blocks Flash/plugins
          // - base-uri 'self': prevents base tag injection
          // - form-action 'self': prevents cross-origin form submission
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
