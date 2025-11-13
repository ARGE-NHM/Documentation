import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: "category",
      label: "Mengen, Kosten & LCA",
      items: [
        "mengen-kosten-lca/overview",
        "mengen-kosten-lca/qto/intro",
        "mengen-kosten-lca/cost/intro",
        "mengen-kosten-lca/lca/intro",
        "mengen-kosten-lca/generelles/ifc-guidelines",
        "mengen-kosten-lca/generelles/berechnungslogik",
      ],
    },
    {
      type: "category",
      label: "Dashboard",
      items: [
        "dashboard/overview",
        {
          type: "category",
          label: "Anwender",
          items: ["dashboard/getting-started", "dashboard/data-model"],
        },
        {
          type: "category",
          label: "Entwickler",
          items: [
            "dashboard/setup",
            "dashboard/services",
            "dashboard/api-reference",
            "dashboard/testing",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Infrastructure & Core Plugins",
      items: [
        "infrastructure-team/overview",
        "infrastructure-team/homepage",
        "infrastructure-team/project-manager",
        "infrastructure-team/ifc-uploader",
        "infrastructure-team/plugin-host",
        "infrastructure-team/plugin-manager",
		"infrastructure-team/plugin-development",
        "infrastructure-team/keycloak",
      ],
    },
  ],
};

export default sidebars;
