import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import atlas from "world-atlas/countries-110m.json";

// Jev reads names literally, so the atlas abbreviations are expanded.
const NAME_OVERRIDES: Record<string, string> = {
  "W. Sahara": "Western Sahara",
  "United States of America": "United States",
  "Dem. Rep. Congo": "Democratic Republic of the Congo",
  "Dominican Rep.": "Dominican Republic",
  "Falkland Is.": "Falkland Islands",
  "Fr. S. Antarctic Lands": "French Southern and Antarctic Lands",
  "Central African Rep.": "Central African Republic",
  Congo: "Republic of the Congo",
  "Eq. Guinea": "Equatorial Guinea",
  eSwatini: "Eswatini",
  "Solomon Is.": "Solomon Islands",
  "N. Cyprus": "Northern Cyprus",
  "Bosnia and Herz.": "Bosnia and Herzegovina",
  Macedonia: "North Macedonia",
  "S. Sudan": "South Sudan",
};

const EXCLUDED = new Set(["Antarctica"]);

export interface Country {
  key: string;
  name: string;
}

export type CountryFeature = Feature<Geometry, { name: string }> & {
  key: string;
};

export function toKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const topology = atlas as unknown as Topology<{
  countries: GeometryCollection<{ name: string }>;
}>;

const collection = feature(
  topology,
  topology.objects.countries,
) as FeatureCollection<Geometry, { name: string }>;

export const COUNTRY_FEATURES: CountryFeature[] = collection.features
  .filter((f) => !EXCLUDED.has(f.properties.name))
  .map((f) => {
    const name = NAME_OVERRIDES[f.properties.name] ?? f.properties.name;
    return { ...f, properties: { name }, key: toKey(name) };
  });

export const COUNTRIES: Country[] = COUNTRY_FEATURES.map(({ key, properties }) => ({
  key,
  name: properties.name,
}));
