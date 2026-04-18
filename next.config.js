/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    // book.md is read at runtime by lib/dd/book-content.ts; ensure Vercel
    // bundles it with the function instead of tree-shaking it away.
    outputFileTracingIncludes: {
      '/book/**/*': ['./book.md'],
    },
  },
}

module.exports = nextConfig
