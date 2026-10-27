const isGitHubActions = process.env.GITHUB_ACTIONS || false;

const basePath = isGitHubActions ? '/docklify' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    agentUpgrade: 'security',
  },
};

export default nextConfig;
