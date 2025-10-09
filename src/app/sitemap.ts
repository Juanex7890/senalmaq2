import type { MetadataRoute } from "next";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.senalmaq.com";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

const CHANGE_FREQUENCY: ChangeFrequency = "weekly";
const ONE_HOUR = 3600;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const buildUrl = (path: string) =>
  path.startsWith("http") ? path : `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;

async function fetchSlugs(endpoint: string): Promise<string[]> {
  try {
    const response = await fetch(endpoint, { next: { revalidate: ONE_HOUR } });
    if (!response.ok) {
      throw new Error(`Unexpected response: ${response.status}`);
    }

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) {
      return [];
    }

    return Array.from(
      new Set(
        data
          .filter(isNonEmptyString)
          .map((slug) => slug.trim())
          .filter(Boolean),
      ),
    );
  } catch (error) {
    console.error(`Error fetching slugs from ${endpoint}:`, error);
    return [];
  }
}

interface RouteConfig {
  path: string;
  priority: number;
}

const STATIC_ROUTES: RouteConfig[] = [
  { path: "/", priority: 1.0 },
  { path: "/catalogo", priority: 0.6 },
  { path: "/categorias", priority: 0.6 },
  { path: "/carrito", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorySlugs, productSlugs] = await Promise.all([
    fetchSlugs(`${BASE}/api/category-slugs`),
    fetchSlugs(`${BASE}/api/product-slugs`),
  ]);

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  const lastModified = new Date();

  const register = (path: string, priority: number) => {
    const url = buildUrl(path);
    entries.set(url, {
      url,
      lastModified,
      changeFrequency: CHANGE_FREQUENCY,
      priority,
    });
  };

  STATIC_ROUTES.forEach((route) => register(route.path, route.priority));

  categorySlugs.forEach((slug) => register(`/categoria/${slug}`, 0.7));
  productSlugs.forEach((slug) => register(`/producto/${slug}`, 0.8));

  return Array.from(entries.values());
}
