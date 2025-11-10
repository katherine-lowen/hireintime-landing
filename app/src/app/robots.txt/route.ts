export function GET() {
  return new Response(
`User-agent: *
Allow: /

Sitemap: https://hireintime.ai/sitemap.xml
`, { headers: { "content-type": "text/plain" } }
  );
}
