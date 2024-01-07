/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/translations/:lang",
        destination: "/?lang=:lang",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
