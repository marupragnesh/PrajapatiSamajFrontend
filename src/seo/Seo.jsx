import { Helmet } from 'react-helmet-async';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  OG_IMAGE_PATH,
} from './seoConfig';

/**
 * Reusable SEO metadata component using react-helmet-async.
 * Handles title, description, canonical, robots, Open Graph, Twitter, and JSON-LD.
 */
const Seo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  noindex = false,
  jsonLd = null,
}) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = normalizedPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalizedPath}`;
  const ogImageUrl = OG_IMAGE_PATH ? `${SITE_URL}${OG_IMAGE_PATH}` : null;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      {!noindex && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content={ogImageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}

      {/* Structured Data */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
