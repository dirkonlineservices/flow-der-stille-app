/**
 * googleShoppingFeed.ts
 *
 * Generiert den offiziellen Google Shopping / Google Merchant Center Feed (XML / RSS 2.0)
 * sowie Schema.org Product & Offer Datenstrukturen für Google Search & KI-Modelle.
 */

import { DEFAULT_PRODUCTS, ProductData, getProductCoverImage } from './offlineProductsService';

const SITE_URL = 'https://flow-der-stille.de';
const BRAND_NAME = 'Flow der Stille';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanDescription(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Ermittelt die offizielle Google-Produktkategorie.
 * 927 = Medien > Audio > Hörbücher
 * 839 = Medien > Audio
 */
function getGoogleCategory(prod: ProductData): string {
  const kat = (prod.kategorie || '').toLowerCase();
  const id = (prod.id || '').toLowerCase();
  if (kat.includes('hörbuch') || kat.includes('hoerbuch') || id.includes('schmetterling') || id.includes('mensch_sein')) {
    return '927'; // Media > Audio > Audiobooks
  }
  return '839'; // Media > Audio
}

function getProductType(prod: ProductData): string {
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

function getProductCanonicalUrl(prod: ProductData): string {
  const id = prod.id.toLowerCase();
  if (id.includes('schmetterling')) {
    return `${SITE_URL}/hoerbuch/schmetterling`;
  }
  if (id.includes('mensch_sein') || id.includes('echtsein')) {
    return `${SITE_URL}/hoerbuch/mensch_sein`;
  }
  const anchor = prod.play_store_id || prod.id;
  return `${SITE_URL}/premium#product-${anchor}`;
}

/**
 * Erzeugt den vollständigen Google Shopping RSS 2.0 XML Feed
 */
export function generateGoogleShoppingXml(products: ProductData[] = DEFAULT_PRODUCTS): string {
  const activeProducts = products.filter(p => p.is_active !== false);

  const itemsXml = activeProducts.map(prod => {
    const rawId = prod.play_store_id || prod.id;
    const title = escapeXml(prod.titel.trim());
    const description = escapeXml(cleanDescription(prod.beschreibung));
    const link = escapeXml(getProductCanonicalUrl(prod));
    
    let coverPath = getProductCoverImage(prod);
    if (coverPath.startsWith('/')) {
      coverPath = `${SITE_URL}${coverPath}`;
    }
    const imageLink = escapeXml(coverPath);
    
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Flow der Stille – Onlineshop für Hörbücher, geführte Meditationen &amp; Selbsthypnosen</title>
    <link>${SITE_URL}</link>
    <description>Entdecke geführte Meditationen, Hörbücher und gezielte Selbsthypnosen für innere Ruhe, Vagusnerv-Entspannung und Achtsamkeit ohne monatliches Abo.</description>
${itemsXml}
  </channel>
</rss>`;
}

/**
 * Erzeugt Schema.org JSON-LD Objekte für ein Produkt oder den gesamten Katalog
 */
export function generateSchemaOrgProducts(products: ProductData[] = DEFAULT_PRODUCTS) {
  const activeProducts = products.filter(p => p.is_active !== false);

  return {
    "@context": "https://schema.org",
    "@graph": activeProducts.map(prod => {
      const canonicalUrl = getProductCanonicalUrl(prod);
      let coverPath = getProductCoverImage(prod);
      if (coverPath.startsWith('/')) {
        coverPath = `${SITE_URL}${coverPath}`;
      }

      const isAudiobook = (prod.kategorie || '').toLowerCase().includes('hörbuch') || prod.id.includes('schmetterling') || prod.id.includes('mensch_sein');

      return {
        "@type": isAudiobook ? ["Product", "Audiobook"] : "Product",
        "@id": canonicalUrl,
        "name": prod.titel.trim(),
        "description": cleanDescription(prod.beschreibung),
        "image": coverPath,
        "sku": prod.play_store_id || prod.id,
        "brand": {
          "@type": "Brand",
          "name": BRAND_NAME
        },
        "category": prod.kategorie,
        "offers": {
          "@type": "Offer",
          "url": canonicalUrl,
          "priceCurrency": "EUR",
          "price": Number(prod.preis).toFixed(2),
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition",
          "priceValidUntil": "2027-12-31",
          "seller": {
            "@type": "Organization",
            "name": BRAND_NAME,
            "url": SITE_URL
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "DE",
            "returnPolicyCategory": "https://schema.org/DigitalContentWaiverReturnPolicy",
            "merchantReturnLink": `${SITE_URL}/rueckgaberichtlinie`
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0.00",
              "currency": "EUR"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "DE"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 0,
                "unitCode": "DAY"
              }
            }
          }
        }
      };
    })
  };
}
