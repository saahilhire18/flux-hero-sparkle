export type ProductCallout = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  model: string;
  accent: string;
  callouts: ProductCallout[];
};

export const PRODUCTS: Product[] = [
  {
    id: "paste-4",
    name: "Totalflux Complete Care",
    subtitle: "Complete Oral Protection",
    description:
      "Complete daily oral care with cavity protection and long-lasting freshness.",
    model: "/models/paste-4.glb",
    accent: "#3C82F6",
    callouts: [
      {
        label: "Protection",
        value: "Cavity Protection",
      },
      {
        label: "Formula",
        value: "SLS Free",
      },
    ],
  },

  {
    id: "paste-2",
    name: "Totalflux Fresh",
    subtitle: "Fresh Breath",
    description:
      "A refreshing toothpaste designed to keep your mouth feeling clean and fresh.",
    model: "/models/paste-2.glb",
    accent: "#22A06B",
    callouts: [
      {
        label: "Freshness",
        value: "Fresh Breath",
      },
      {
        label: "Formula",
        value: "SLS Free",
      },
    ],
  },

  {
    id: "paste-3",
    name: "Totalflux Gum Care",
    subtitle: "Healthy Gums",
    description:
      "Gentle everyday oral care focused on maintaining healthy gums.",
    model: "/models/paste-3.glb",
    accent: "#E58A2B",
    callouts: [
      {
        label: "Care",
        value: "Gum Protection",
      },
      {
        label: "Formula",
        value: "SLS Free",
      },
    ],
  },

  {
    id: "paste-4",
    name: "Totalflux Kids",
    subtitle: "Gentle Everyday Care",
    description:
      "Gentle everyday oral care designed for younger smiles.",
    model: "/models/paste-4.glb",
    accent: "#D65A9A",
    callouts: [
      {
        label: "Care",
        value: "Gentle Formula",
      },
      {
        label: "Formula",
        value: "SLS Free",
      },
    ],
  },

  {
    id: "paste-5",
    name: "Totalflux Advanced",
    subtitle: "Advanced Oral Care",
    description:
      "Advanced daily protection for a complete oral-care routine.",
    model: "/models/paste-2.glb",
    accent: "#7048C8",
    callouts: [
      {
        label: "Protection",
        value: "Complete Care",
      },
      {
        label: "Freshness",
        value: "Fresh Breath",
      },
    ],
  },
];