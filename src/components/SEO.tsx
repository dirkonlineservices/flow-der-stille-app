import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
}

export default function SEO({ title, description }: SEOProps) {
  return (
    <Helmet>
      <title>{title} | Flow der Stille</title>
      <meta name="description" content={description} />
      {/* Canonical Link hilft Google, Dubletten zu vermeiden */}
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
}