import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, url, image, type = 'website', schema }) {
  const siteName = 'Notesphere';
  const fullTitle = title ? `${title} — ${siteName}` : siteName;
  const defaultDescription = 'Discover insightful notes, articles, and blogs on Notesphere. Your ultimate destination for reading and sharing knowledge.';
  const defaultImage = '/og-image.jpg'; // Path to your default Open Graph image
  const baseUrl = 'https://notespher.netlify.app'; // Update this if your domain changes
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  
  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description || defaultDescription} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || `${baseUrl}${defaultImage}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={image || `${baseUrl}${defaultImage}`} />
      
      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

