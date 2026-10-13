const isGitHubActions = process.env.GITHUB_ACTIONS || false;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: isGitHubActions ? '/docklify' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
