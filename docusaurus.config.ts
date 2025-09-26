import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const title = 'NHMzh Nachhaltigkeitsmonitoring';
const tagline = 'Finanziert durch die Stadt Zürich';
const url = 'https://arge-nhm.github.io';
const baseUrl = '/Documentation/';
const organizationName = 'ARGE-NHM';
const projectName = 'Documentation';

const config: Config = {
  title,
  tagline,
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName,
  projectName,

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.main.ts',
          editUrl: 'https://github.com/ARGE-NHM/Documentation/edit/main/',
          routeBasePath: 'docs',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Stadt Zürich - Nachhaltigkeitsmonitoring',
        src: 'img/nhm_navbar_logo.svg',
        height: 32,
      },
      items: [
        {to: '/', label: 'Übersicht', position: 'left'},
        {to: '/docs/mengen-kosten-lca/overview', label: 'Mengen, Kosten & LCA', position: 'left'},
        {to: '/docs/dashboard/overview', label: 'Dashboard', position: 'left'},
        {to: '/docs/infrastructure-team/overview', label: 'Infrastructure & Core', position: 'left'},
        {
          href: 'https://github.com/LTplus-AG',
          label: 'LT+',
          position: 'right',
        },
        {
          href: 'https://yssentyl.com/',
          label: 'Yssentyl',
          position: 'right',
        },
        {
          href: 'https://www.ekkodale.com/',
          label: 'ekkodale',
          position: 'right',
        },
        {
          href: 'https://www.stadt-zuerich.ch/de/politik-und-verwaltung/stadtverwaltung/ted/erz.html',
          label: 'ERZ',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
