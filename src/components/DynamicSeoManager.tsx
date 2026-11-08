import React, { useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { buildViewSeoMetadata, resolveSeoViewKey } from '../utils/seoEngine';

function upsertMetaTag(
  selectorAttr: 'name' | 'property',
  attrValue: string,
  content: string
) {
  let meta = document.head.querySelector<HTMLMetaElement>(
    `meta[${selectorAttr}="${attrValue}"]`
  );
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(selectorAttr, attrValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function upsertCanonicalLink(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLdScript(jsonLd: Record<string, unknown>) {
  const scriptId = 'dynamic-seo-jsonld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd);
}

export const DynamicSeoManager: React.FC = () => {
  const {
    currentPage,
    activeSeoSection,
    setActiveSeoSection,
    config,
    services,
  } = useStudio();

  // Synchronize head meta tags whenever view, section, config, or services change
  useEffect(() => {
    const viewKey = resolveSeoViewKey(currentPage, activeSeoSection);
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://rodrigocutsss.com.ar';

    const seo = buildViewSeoMetadata({
      viewKey,
      config,
      services,
      origin,
    });

    const fullCanonicalUrl = `${origin.replace(/\/$/, '')}${seo.canonicalPath}`;

    document.title = seo.title;
    document.documentElement.dataset.seoView = seo.viewKey;

    upsertMetaTag('name', 'description', seo.description);
    upsertMetaTag('name', 'keywords', seo.keywords);
    upsertMetaTag('name', 'robots', seo.robots);

    // OpenGraph tags
    upsertMetaTag('property', 'og:type', seo.ogType);
    upsertMetaTag('property', 'og:title', seo.ogTitle);
    upsertMetaTag('property', 'og:description', seo.ogDescription);
    upsertMetaTag('property', 'og:site_name', seo.ogSiteName);
    upsertMetaTag('property', 'og:locale', seo.ogLocale);
    upsertMetaTag('property', 'og:url', fullCanonicalUrl);

    // Twitter Card tags
    upsertMetaTag('name', 'twitter:card', seo.twitterCard);
    upsertMetaTag('name', 'twitter:title', seo.twitterTitle);
    upsertMetaTag('name', 'twitter:description', seo.twitterDescription);

    // Canonical & Schema.org JSON-LD
    upsertCanonicalLink(fullCanonicalUrl);
    upsertJsonLdScript(seo.jsonLd);
  }, [currentPage, activeSeoSection, config, services]);

  // Observe visible sections on HomePage so scrolling also updates active view metadata
  useEffect(() => {
    if (currentPage !== 'home' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const sectionIds = [
      'inicio',
      'turnero',
      'servicios',
      'transformaciones',
      'obras',
      'opiniones',
      'estudio',
      'ubicacion',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const topId = visible[0].target.id;
          if (topId === 'inicio') {
            setActiveSeoSection(null);
          } else if (topId) {
            setActiveSeoSection(topId);
          }
        }
      },
      {
        root: null,
        rootMargin: '-28% 0px -52% 0px',
        threshold: [0.15, 0.4],
      }
    );

    const timer = setTimeout(() => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [currentPage, setActiveSeoSection, config.layoutMode, config.sectionOrder]);

  return null;
};
