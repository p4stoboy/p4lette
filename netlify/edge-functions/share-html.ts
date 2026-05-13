import type { Context } from "https://edge.netlify.com";

// Rewrites the OG/Twitter meta tags in dist/index.html for /share?p=… so
// scrapers see a per-palette og:image (pointing at the /og edge fn). Browsers
// receive the same HTML and the SPA hydrates into PosterSharePage — the meta
// tags don't affect that. Each share URL is its own cache entry both at the
// scraper (by HTML URL) and at the OG image (by /og?p=… URL), so the previews
// are per-palette, never a single mutable global.

const META_RE = (prop: string): RegExp =>
  new RegExp(
    `(<meta\\s+(?:property|name)="${prop}"\\s+content=")([^"]*)(")`,
    "i",
  );

const swap = (html: string, prop: string, value: string): string =>
  html.replace(META_RE(prop), `$1${escapeAttr(value)}$3`);

// Minimal attribute-value escape — values are server-built from a hex query
// so no script injection risk, but `"` would close the attribute.
const escapeAttr = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const HEX_RE = /^[0-9a-fA-F]{6}$/;

export default async (req: Request, ctx: Context): Promise<Response> => {
  const url = new URL(req.url);
  const p = url.searchParams.get("p") ?? "";

  // No palette → pass through (the SPA shows "NOTHING TO SHOW."; the
  // site-wide og:image is fine).
  if (!p) return ctx.next();

  const upstream = await ctx.next();
  const ct = upstream.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) return upstream;

  const html = await upstream.text();
  const ogUrl = `${url.origin}/og?p=${encodeURIComponent(p)}`;
  const count = p.split("-").filter((s) => HEX_RE.test(s)).length;
  const alt =
    count === 0
      ? "P4LETTE — a shared palette."
      : `P4LETTE — a shared palette of ${count} colour${count === 1 ? "" : "s"}.`;
  const desc = "A shared palette from P4LETTE.";

  const out: Array<[string, string]> = [
    ["og:image", ogUrl],
    ["og:image:alt", alt],
    ["og:description", desc],
    ["twitter:image", ogUrl],
    ["twitter:description", desc],
  ];

  const rewritten = out.reduce((h, [k, v]) => swap(h, k, v), html);

  return new Response(rewritten, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
};
