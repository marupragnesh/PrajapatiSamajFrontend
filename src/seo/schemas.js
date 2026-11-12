import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from './seoConfig';

/**
 * Organization JSON-LD schema for the home page.
 */
export const buildOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  email: 'pragneshmaru12112001@gmail.com',
});

/**
 * WebSite JSON-LD schema for the home page.
 */
export const buildWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: ['en', 'gu'],
});

/**
 * FAQPage JSON-LD schema matching visible Q&A items exactly.
 */
export const buildFaqSchema = (faqItems) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});
