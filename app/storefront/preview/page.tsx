import {
    StorefrontView,
    type StorefrontProduct,
} from "@/components/storefront/storefront-view";
import { defaultStoreConfig } from "@/lib/store/config";
import { loadStoreConfig } from "@/lib/store/config-service";

const sampleProducts: StorefrontProduct[] = [
  {
    id: "p1",
    name: "Canvas Tote",
    price: 38,
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "p2",
    name: "Modern Lamp",
    price: 72,
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "p3",
    name: "Indoor Plant",
    price: 24,
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=600&q=80",
  },
];

export default async function StorefrontPreviewPage() {
  const config = (await loadStoreConfig()) ?? defaultStoreConfig;

  return (
    <StorefrontView config={config} products={sampleProducts} />
  );
}
