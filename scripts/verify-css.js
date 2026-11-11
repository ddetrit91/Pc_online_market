async function verifyRoute(routePath) {
  const url = `http://localhost:3000${routePath}`;
  const htmlRes = await fetch(url);
  console.log(`\nChecking route: ${routePath} (HTML status: ${htmlRes.status})`);
  if (htmlRes.status !== 200) {
    throw new Error(`Route ${routePath} returned status ${htmlRes.status}`);
  }
  const html = await htmlRes.text();
  
  const regex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  const cssLinks = [];
  while ((match = regex.exec(html)) !== null) {
    cssLinks.push(match[1]);
  }
  
  if (cssLinks.length === 0) {
    console.warn(`  WARNING: No stylesheet <link> tags found in ${routePath}!`);
  }
  
  for (const href of cssLinks) {
    const fullUrl = href.startsWith('http') ? href : 'http://localhost:3000' + href;
    const res = await fetch(fullUrl);
    const body = await res.text();
    console.log(`  CSS URL: ${fullUrl}`);
    console.log(`    Status: ${res.status} | Content-Type: ${res.headers.get('content-type')} | Size: ${body.length} bytes`);
    if (res.status !== 200 || body.length < 50) {
      throw new Error(`CSS check failed for ${fullUrl} on route ${routePath}`);
    }
  }
}

async function run() {
  const routes = ['/', '/builder', '/fps', '/admin'];
  for (const r of routes) {
    await verifyRoute(r);
  }
  console.log('\n======================================================');
  console.log('>>> ALL ROUTES & STYLESHEETS VERIFIED: 100% OK! <<<');
  console.log('======================================================\n');
}

run().catch((err) => {
  console.error('\n>>> VERIFICATION FAILED:', err.message);
  process.exit(1);
});
