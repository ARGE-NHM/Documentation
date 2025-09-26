import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Mengen, Kosten & LCA',
      items: [
        {
          type: 'category',
          label: 'Generelles',
          items: [
            'mengen-kosten-lca/overview',
            'mengen-kosten-lca/shared/ifc-guidelines',
            'mengen-kosten-lca/shared/architecture',
          ],
        },
        'mengen-kosten-lca/qto/intro',
        'mengen-kosten-lca/cost/intro',
        'mengen-kosten-lca/lca/intro',
      ],
    },
    {
      type: 'category',
      label: 'Dashboard',
      items: ['dashboard/overview'],
    },
    {
      type: 'category',
      label: 'Infrastructure & Core Plugins',
      items: ['infrastructure-team/overview'],
    },
  ],
};

export default sidebars;
 