import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://flow-der-stille.de';
const BRAND_NAME = 'Flow der Stille';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanDescription(text) {
  if (!text) return '';
  return String(text)
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getGoogleCategory(prod) {
  const kat = (prod.kategorie || '').toLowerCase();
  const id = (prod.id || '').toLowerCase();
  if (kat.includes('hörbuch') || kat.includes('hoerbuch') || id.includes('schmetterling') || id.includes('mensch_sein')) {
    return '927'; // Media > Audio > Audiobooks
  }
  return '839'; // Media > Audio
}

function getProductType(prod) {
  const kat = (prod.kategorie || '').trim();
  if (kat.toLowerCase().includes('hörbuch')) {
    return 'Hörbuch > Achtsamkeit & Persönlichkeitsentwicklung';
  }
  if (kat.toLowerCase().includes('hypnose')) {
    return 'Selbsthypnose > Mentales Training & Schlaf';
  }
  if (kat.toLowerCase().includes('meditation')) {
    return 'Geführte Meditation > Vagusnerv & Innere Ruhe';
  }
  return 'Achtsamkeitsübung > Entspannung';
}

function getProductCanonicalUrl(prod) {
  const id = (prod.id || '').toLowerCase();
  if (id.includes('schmetterling')) {
    return `${SITE_URL}/hoerbuch/schmetterling`;
  }
  if (id.includes('mensch_sein') || id.includes('echtsein')) {
    return `${SITE_URL}/hoerbuch/mensch_sein`;
  }
  const anchor = prod.play_store_id || prod.id;
  return `${SITE_URL}/premium#product-${anchor}`;
}

function getCoverImage(prod) {
  const id = (prod.id || '').toLowerCase();
  const title = (prod.titel || '').toLowerCase();
  if (id.includes('mensch_sein') || id.includes('echtsein') || title.includes('echtsein')) {
    return `${SITE_URL}/images/products/cover_mensch_sein.jpg`;
  }
  if (id.includes('schmetterling') || title.includes('schmetterling')) {
    return `${SITE_URL}/images/products/cover_schmetterling.jpg`;
  }
  if (id.includes('schlaf') || title.includes('schlaf')) {
    return `${SITE_URL}/images/products/cover_schlaf.jpg`;
  }
  if (id.includes('inneres_kind') || title.includes('inneres kind')) {
    return `${SITE_URL}/images/products/cover_inneres_kind.jpg`;
  }
  if (id.includes('herzkompass') || title.includes('herzkompass')) {
    return `${SITE_URL}/images/products/cover_herzkompass.jpg`;
  }
  if (id.includes('herzoeffnung') || title.includes('herzöffnung')) {
    return `${SITE_URL}/images/products/cover_herzoeffnung.jpg`;
  }
  if (id.includes('innere_ruhe') || title.includes('innere ruhe')) {
    return `${SITE_URL}/images/products/cover_innere_ruhe.jpg`;
  }
  if (id.includes('pmr') || title.includes('muskelentspannung')) {
    return `${SITE_URL}/images/products/cover_pmr.jpg`;
  }
  if (id.includes('atem') || title.includes('atemübung')) {
    return `${SITE_URL}/images/products/cover_atemarbeit.jpg`;
  }
  if (id.includes('fokus') || title.includes('konzentration')) {
    return `${SITE_URL}/images/products/cover_fokus.jpg`;
  }
  if (id.includes('selbstbewusstsein') || title.includes('vertrauen')) {
    return `${SITE_URL}/images/products/cover_selbstbewusst.jpg`;
  }
  if (id.includes('ernaehrung') || title.includes('ernährung')) {
    return `${SITE_URL}/images/products/cover_ernaehrung.jpg`;
  }
  return `${SITE_URL}/images/products/cover_innere_ruhe.jpg`;
}

// Lade Katalog aus offlineProductsService
const serviceFilePath = path.resolve(__dirname, '../src/lib/offlineProductsService.ts');
const serviceContent = fs.readFileSync(serviceFilePath, 'utf8');
const match = serviceContent.match(/export const DEFAULT_PRODUCTS:\s*ProductData\[\]\s*=\s*(\[[\s\S]*?\]);/);

if (!match) {
  console.error('[Google Shopping] Konnte DEFAULT_PRODUCTS nicht aus offlineProductsService.ts auslesen!');
  process.exit(1);
}

const products = JSON.parse(match[1]);
const activeProducts = products.filter(p => p.is_active !== false);

const itemsXml = activeProducts.map(prod => {
  const rawId = prod.play_store_id || prod.id;
  const title = escapeXml(prod.titel.trim());
  const description = escapeXml(cleanDescription(prod.beschreibung));
  const link = escapeXml(getProductCanonicalUrl(prod));
  const imageLink = escapeXml(getCoverImage(prod));
  const priceFormatted = `${Number(prod.preis).toFixed(2)} EUR`;
  const googleCategory = getGoogleCategory(prod);
  const productType = escapeXml(getProductType(prod));
  const mpn = escapeXml(`FDS-${prod.id.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`);

  return `    <item>
      <g:id>${escapeXml(rawId)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:brand>${escapeXml(BRAND_NAME)}</g:brand>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${productType}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:mpn>${mpn}</g:mpn>
      <g:shipping>
        <g:country>DE</g:country>
        <g:service>Digitaler Sofort-Zugriff</g:service>
        <g:price>0.00 EUR</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>AT</g:country>
        <g:service>Digitaler Sofort-Zugriff</g:service>
        <g:price>0.00 EUR</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>CH</g:country>
        <g:service>Digitaler Sofort-Zugriff</g:service>
        <g:price>0.00 EUR</g:price>
      </g:shipping>
      <g:custom_label_0>Digitales Produkt</g:custom_label_0>
      <g:custom_label_1>${escapeXml(prod.kategorie)}</g:custom_label_1>
      <g:custom_label_2>Kein Abo</g:custom_label_2>
    </item>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Flow der Stille – Onlineshop für Hörbücher, geführte Meditationen &amp; Selbsthypnosen</title>
    <link>${SITE_URL}</link>
    <description>Entdecke geführte Meditationen, Hörbücher und gezielte Selbsthypnosen für innere Ruhe, Vagusnerv-Entspannung und Achtsamkeit ohne monatliches Abo.</description>
${itemsXml}
  </channel>
</rss>
`;

const publicTargetPath = path.resolve(__dirname, '../public/google-shopping-feed.xml');
fs.writeFileSync(publicTargetPath, xml, 'utf8');
console.log(`[Google Shopping] Feed erfolgreich generiert: ${publicTargetPath} (${activeProducts.length} Produkte)`);
