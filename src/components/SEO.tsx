import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  keywords?: string;
  schemaJson?: object | object[];
}

export default function SEO({ title, description, image = '/logo-transparent.png', keywords, schemaJson }: SEOProps) {
  const fullTitle = title.includes('Flow der Stille') ? title : `${title} | Flow der Stille`;
  const url = typeof window !== 'undefined' ? window.location.href : 'https://flow-der-stille.de';
  const defaultKeywords = "Meditation, Achtsamkeit, innere Ruhe, Vagusnerv, Stressreduktion, Selbsthypnose, Atempause, Darm-Hirn-Achse, Jacqueline Schmetzer, Flow der Stille";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content="Jacqueline Schmetzer, Dirk Schmetzer" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="google-site-verification" content="Hxvh5vEnODGC_YArOCRnJymGuAPlqPJwVCm46l2sFFo" />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image.startsWith('http') ? image : `https://flow-der-stille.de${image}`} />
      
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