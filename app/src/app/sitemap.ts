export default function sitemap() {
  const base = "https://hireintime.ai";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  ];
}
