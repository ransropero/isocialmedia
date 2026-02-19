const nextConfig = {
  // output: 'export',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5001/api/:path*',
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
