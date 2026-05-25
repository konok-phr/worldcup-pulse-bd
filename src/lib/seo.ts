export function buildHead(opts: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
}) {
  const title = opts.title;
  const description = opts.description;
  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: opts.type ?? "website" },
    { name: "twitter:card", content: opts.image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (opts.image) {
    meta.push({ property: "og:image", content: opts.image });
    meta.push({ name: "twitter:image", content: opts.image });
  }
  if (opts.path) {
    meta.push({ property: "og:url", content: opts.path });
  }
  const links = opts.path ? [{ rel: "canonical", href: opts.path }] : [];
  return { meta, links };
}