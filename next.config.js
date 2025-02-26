/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true
  },
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    unoptimized: true
  },
  // 添加 webpack 配置
  webpack: (config, { dev, isServer }) => {
    // 在开发环境禁用缓存
    if (dev) {
      config.cache = false
    }
    return config
  }
}

module.exports = nextConfig