/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'react-markdown',
    'remark-parse',
    'remark-rehype',
    'rehype-stringify',
    'unified',
    'mdast-util-to-hast',
    'mdast-util-from-markdown',
    'micromark',
    'unist-util-visit',
    'unist-util-is',
    'hast-util-to-jsx-runtime'
  ],
  experimental: {
    esmExternals: 'loose'
  },
  output: 'standalone'
}

module.exports = nextConfig
