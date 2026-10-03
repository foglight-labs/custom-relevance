import { Suspense } from "react";
import type { Metadata } from "next";
import { MapPlayground, MapPlaygroundFromUrl } from "@/components/map/map-playground";

export const metadata: Metadata = {
  title: "World map · Custom Relevance",
  description: "Type any factor and Jev scores every country in the world on it.",
};

export default function MapPage() {
  return (
    // useSearchParams needs a Suspense boundary to prerender; the fallback is
    // the empty map, so the page shell still arrives as static HTML.
    <Suspense fallback={<MapPlayground factor="" />}>
      <MapPlaygroundFromUrl />
    </Suspense>
  );
}
