import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Totalflux | Complete Oral Care" },
      { name: "description", content: "Discover Totalflux SLS-free toothpastes for healthy smiles, fresh breath, and everyday cavity protection." },
      { property: "og:title", content: "Totalflux | Complete Oral Care" },
      { property: "og:description", content: "SLS-free oral care for every mouth and every age." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Hero />;
}
