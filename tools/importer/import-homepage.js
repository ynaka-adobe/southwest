/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import searchBookingParser from './parsers/search-booking.js';
import heroBannerParser from './parsers/hero-banner.js';
import bannerPromoParser from './parsers/banner-promo.js';
import cardsPromoParser from './parsers/cards-promo.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/southwest-cleanup.js';
import sectionsTransformer from './transformers/southwest-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Southwest Airlines homepage with header, hero booking area, promotional content sections, and footer',
  urls: [
    'https://www.southwest.com',
  ],
  blocks: [
    {
      name: 'search-booking',
      instances: [
        '#bookingSection > div.containerWithPadding__25mnl > div.backgroundColor__2J30W.image__JooQe',
      ],
    },
    {
      name: 'hero-banner',
      instances: [
        '#bookingSection > div.containerWithPadding__25mnl > div:nth-of-type(2)',
        '#landingHomePageIndexImgOverlay > div.bannerWithCardContainer__120BY > div.rightAlignmentGridContainer__3N6YI.grid__1TvIC',
      ],
    },
    {
      name: 'banner-promo',
      instances: [
        '#landingHomePageIndexProductOverview',
      ],
    },
    {
      name: 'cards-promo',
      instances: [
        '#specialOffersTwo',
      ],
    },
    {
      name: 'section-special-offers',
      instances: [
        '#pageContent > div.pageContent__3XVqO > section > div:nth-of-type(7)',
      ],
      section: 'light',
    },
  ],
  sections: [
    {
      id: 'hero-booking',
      name: 'Hero Booking',
      selector: '#bookingSection',
      style: null,
      blocks: ['search-booking', 'hero-banner'],
      defaultContent: [],
    },
    {
      id: 'product-overview',
      name: 'Product Overview',
      selector: '#landingHomePageIndexProductOverview',
      style: null,
      blocks: ['banner-promo'],
      defaultContent: [],
    },
    {
      id: 'rapid-rewards-banner',
      name: 'Rapid Rewards Banner',
      selector: '#landingHomePageIndexImgOverlay',
      style: null,
      blocks: ['hero-banner'],
      defaultContent: [],
    },
    {
      id: 'special-offers',
      name: 'Special Offers',
      selector: '#pageContent > div.pageContent__3XVqO > section > div:nth-of-type(7)',
      style: 'light',
      blocks: ['cards-promo'],
      defaultContent: [
        '#pageContent > div.pageContent__3XVqO > section > div:nth-of-type(7) > section.section__31vwa > div.paddingTopDefault__236N9 > div.compactHeading__1Mm_m.layout__HiTxF.bottomMedium__2ik4n.center__Ofnw0.sides__38zJG',
      ],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'search-booking': searchBookingParser,
  'hero-banner': heroBannerParser,
  'banner-promo': bannerPromoParser,
  'cards-promo': cardsPromoParser,
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    // Skip section-metadata mappings - handled by the sections transformer
    if (blockDef.name.startsWith('section-')) return;

    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (root "/" maps to /index)
    const pathname = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html$/, '');
    const path = WebImporter.FileUtils.sanitizePath(pathname || '/index');

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
