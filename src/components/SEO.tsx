import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  keywords?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  schemaJson?: object | object[];
}

export default function SEO({ 
  title, 
  description, 
  image = '/logo-transparent.png', 
  keywords, 
  canonicalUrl,
  noindex = false,
  schemaJson 
}: SEOProps) {
  const fullTitle = title.includes('Flow der Stille') ? title : `${title} | Flow der Stille`;

  // 🛡️ SEO-Korrektur: Canonical URLs dürfen NIEMALS Query-Strings (z.B. ?autoplay=true, ?fbclid=...) enthalten!
  const cleanCanonicalUrl = canonicalUrl || (
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://flow-der-stille.de'
  );

  const defaultKeywords = "Meditation, geführte Meditation, Achtsamkeit, innere Ruhe, Vagusnerv, Nervensystem regulieren, Stressabbau, Stressreduktion, Selbsthypnose, Einschlafhilfe, tiefer Schlaf, Hörbuch Achtsamkeit, Hörbuch Loslassen, Atempause, Darm-Hirn-Achse, Jacqueline Schmetzer, Lisa, Flow der Stille";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content="Jacqueline Schmetzer, Dirk Schmetzer" />
      
      {/* 🛡️ Dynamische Steuerung: Keine Indexierung für private/interne Seiten */}
      <meta 
        name="robots" 
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} 
      />
      <meta name="google-site-verification" content="Hxvh5vEnODGC_YArOCRnJymGuAPlqPJwVCm46l2sFFo" />
      
      {/* Canonical Tag immer sauber ohne URL-Parameter */}
      <link rel="canonical" href={cleanCanonicalUrl} />

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={cleanCanonicalUrl} />
      <meta property="og:image" content={image.startsWith('http') ? image : `https://flow-der-stille.de${image}`} />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content="Flow der Stille" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `https://flow-der-stille.de${image}`} />

      {/* Structured Data JSON-LD for GEO & Search Engine Parsing */}
      {schemaJson && (
        <script type="application/ld+json">
          {JSON.stringify(schemaJson)}
        </script>
      )}
    </Helmet>
  );
}