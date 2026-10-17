// =============================================================================
// FLOW DER STILLE – Vorrendern (Prerendering) für Google & KI-Crawler
// -----------------------------------------------------------------------------
// Rendert jede Adresse aus dist/sitemap.xml in einem lokalen Chrome und speichert
// das fertige HTML nach dist/prerender/<pfad>.html. Für jede erfolgreich gerenderte
// Seite schreibt es eine feste Rewrite-Regel in dist/.htaccess, die diese
// Dateien ausliefert, sodass Google Titel, Beschreibung, Canonical UND Text sofort im
// ersten HTML sieht (statt einer leeren <div id="root">).
//
// Aufruf:   npm run build:web     (= npm run build + dieses Skript)
// Chrome:   wird automatisch gesucht, sonst CHROME_PATH=/pfad/zu/chrome setzen
// =============================================================================
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const OUT = path.join(DIST, 'prerender');
const HTACCESS = path.join(DIST, '.htaccess');

// Feste Rewrite-Regeln (eine pro Seite) zwischen die Marker in dist/.htaccess schreiben.
// Bewusst ohne Dateisystem-Prüfungen (-f / DOCUMENT_ROOT), die sich bei Hostinger/LiteSpeed anders verhalten.
function writeHtaccessRules(renderedPaths) {
  const escape = (p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rules = renderedPaths.map((p) =>
    p === '/'
      ? '  RewriteRule ^$ /prerender/index.html [L]'
      : `  RewriteRule ^${escape(p.slice(1))}$ /prerender${p}.html [L]`,
  );
  const htaccess = fs.readFileSync(HTACCESS, 'utf8');
  const block = /(  # >>> PRERENDER-START\n)[\s\S]*?(  # <<< PRERENDER-END)/;
  if (!block.test(htaccess)) throw new Error('PRERENDER-Marker in dist/.htaccess fehlen.');
  fs.writeFileSync(HTACCESS, htaccess.replace(block, (_, start, end) => `${start}${rules.map((r) => r + '\n').join('')}${end}`));
}
const SITE = 'https://flow-der-stille.de';

// Externe Dienste beim Vorrendern blockieren (keine Tracking-Hits, keine fremden Skripte im HTML)
const BLOCKED = /googletagmanager|google-analytics|doubleclick|facebook|fbcdn|paypal|stripe/i;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.xml': 'application/xml',
  '.mp3': 'audio/mpeg',
};

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error('Kein Chrome gefunden. Bitte CHROME_PATH setzen.');
  return found;
}

// Mini-Server: liefert dist/ aus, unbekannte Pfade bekommen die App-Hülle (dist/index.html)
function startServer() {
  const shell = fs.readFileSync(path.join(DIST, 'index.html'));
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(DIST, urlPath);
    if (file.startsWith(DIST) && !file.startsWith(OUT) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      return fs.createReadStream(file).pipe(res);
    }
    if (urlPath.startsWith('/api/')) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { 'Content-Type': MIME['.html'] });
    res.end(shell);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function readSitemapPaths() {
  const xml = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim().replace(/&amp;/g, '&'))
    .filter((loc) => loc.startsWith(SITE))
    .map((loc) => loc.slice(SITE.length) || '/');
}

async function renderPage(browser, origin, urlPath) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900 });
    await page.setRequestInterception(true);
    page.on('request', (r) => (BLOCKED.test(r.url()) ? r.abort() : r.continue()));

    await page.goto(origin + urlPath, { waitUntil: 'networkidle0', timeout: 45000 });
    await page.waitForFunction(
      () => document.querySelector('link[rel="canonical"]') && document.querySelector('#root')?.children.length,
      { timeout: 15000 },
    );
    await new Promise((r) => setTimeout(r, 800)); // Animationen & späte Helmet-Updates abwarten

    const result = await page.evaluate(async () => {
      // Alles aus der Hülle (dist/index.html) bleibt unverändert; nur von React erzeugte
      // Head-Tags werden markiert, damit main.tsx sie beim Start entfernt (keine Duplikate).
      const shellHtml = await (await fetch('/index.html')).text();
      const shellHead = new DOMParser().parseFromString(shellHtml, 'text/html').head;
      const shellTags = new Set([...shellHead.children].map((n) => n.outerHTML));
      // Genau ein <title>: Hüllen-Titel raus, sobald die Seite einen eigenen setzt
      const titles = [...document.head.querySelectorAll('title')];
      if (titles.length > 1) titles.filter((t) => shellTags.has(t.outerHTML)).forEach((t) => t.remove());
      document.head
        .querySelectorAll('title, meta, link[rel="canonical"], script[type="application/ld+json"]')
        .forEach((n) => { if (!shellTags.has(n.outerHTML)) n.setAttribute('data-prerender', ''); });

      // Von Drittanbietern nachgeladene Skripte nicht ins HTML übernehmen
      document.querySelectorAll('script[src]').forEach((s) => {
        if (!s.getAttribute('src').startsWith('/')) s.remove();
      });

      const notFound = /existiert leider nicht/.test(document.body.innerText);
      const robots = document.querySelector('meta[name="robots"][data-prerender]')?.content || '';
      return { html: '<!doctype html>\n' + document.documentElement.outerHTML, notFound, robots };
    });

    const permanent = (msg) => Object.assign(new Error(msg), { permanent: true });
    if (result.notFound) throw permanent('App zeigt die 404-Seite');
    if (/noindex/.test(result.robots)) throw permanent('Seite ist noindex – gehört nicht in die Sitemap');
    return result.html.split(origin).join(SITE);
  } finally {
    await page.close().catch(() => {}); // Tab ist nach einem Absturz evtl. schon weg
  }
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('dist/index.html fehlt – zuerst "npm run build" ausführen.');

  fs.rmSync(OUT, { recursive: true, force: true });
  const paths = readSitemapPaths();
  const server = await startServer();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const launch = () => puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    protocolTimeout: 60000,
    args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
  });
  let browser = await launch();

  let ok = 0;
  const failed = [];
  const rendered = [];
  for (const urlPath of paths) {
    // Chrome stürzt gelegentlich ab („Connection closed“) → neu starten und bis zu 3× versuchen
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (!browser.connected) browser = await launch();
        // Watchdog: hängt Chrome, wird es nach 90 s beendet und neu gestartet
        let timer;
        const watchdog = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('Zeitüberschreitung (90 s)')), 90000);
        });
        let html;
        try {
          html = await Promise.race([renderPage(browser, origin, urlPath), watchdog]);
        } catch (err) {
          if (!err.permanent) {
            browser.process()?.kill('SIGKILL');
            browser = await launch();
          }
          throw err;
        } finally {
          clearTimeout(timer);
        }
        const target = path.join(OUT, urlPath === '/' ? 'index.html' : `${urlPath}.html`);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, html);
        ok++;
        rendered.push(urlPath);
        console.log(`  ✓ ${urlPath} (${new Date().toLocaleTimeString("de-DE")})`);
        break;
      } catch (err) {
        const retry = attempt < 3 && !err.permanent;
        console.warn(`  ${retry ? '↻' : '✗'} ${urlPath} – ${err.message}`);
        if (!retry) { failed.push(urlPath); break; }
      }
    }
  }

  await browser.close().catch(() => browser.process()?.kill('SIGKILL'));
  server.close();
  writeHtaccessRules(rendered);
  console.log(`\nVorgerendert: ${ok}/${paths.length} Seiten → dist/prerender/ (+ Regeln in dist/.htaccess)`);
  if (failed.length) {
    console.warn(`Nicht vorgerendert (werden wie bisher als normale App ausgeliefert): ${failed.join(', ')}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
