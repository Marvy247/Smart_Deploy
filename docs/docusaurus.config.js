// @ts-check
const {themes} = require('@docusaurus/preset-classic');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Smart Deploy',
  tagline: 'Smart Contract Deployment Platform',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Smart Deploy',
      logo: {
        alt: 'Smart Deploy Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'getting-started/installation',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/Marvy247/Smart_Deploy',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Smart Deploy`,
    },
  },
};

module.exports = config;
