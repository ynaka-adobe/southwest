/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards.
 * Source: southwest.com homepage (#specialOffersTwo) — 3-card promotional grid.
 *
 * Cards library structure (DA): 2 columns, one row per card.
 *   Row 1: block name.
 *   Each subsequent row = one card:
 *     Cell 1: image (mandatory).
 *     Cell 2: text — title (heading) + description + CTA.
 *
 * Source per card (.cardContainer__1vXfk):
 *   img.specialOfferImage__2EDwR      -> card image
 *   .eyebrowText__2X8D7               -> category label (e.g. "CRUISES")
 *   .contentContainer .htmlValue      -> title ("Southwest Cruises")
 *   .secondaryContentContainer .copy  -> description
 *   .callToAction__3OG3P a            -> CTA
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.cardContainer__1vXfk, [class*="cardContainer"]'));

  // Empty-block guard.
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    // --- Cell 1: image ---
    const image = card.querySelector('img.specialOfferImage__2EDwR, .specialOfferContainer__3rd3v picture img, picture img');

    // --- Cell 2: text content ---
    const textCell = [];

    // Eyebrow / category label.
    const eyebrow = card.querySelector('.eyebrowText__2X8D7, [class*="eyebrowText"]');
    if (eyebrow) textCell.push(eyebrow);

    // Title: the htmlValue inside the primary content container (not the
    // description copy block).
    const contentContainer = card.querySelector('.contentContainer__3AHPn, [class*="contentContainer"]');
    let title = null;
    if (contentContainer) {
      const secondary = contentContainer.querySelector('.secondaryContentContainer__2C2GJ');
      title = Array.from(contentContainer.querySelectorAll('.htmlValue__1ElrM')).find(
        (el) => !secondary || !secondary.contains(el),
      );
    }
    if (title) textCell.push(title);

    // Description.
    const description = card.querySelector('.secondaryContentContainer__2C2GJ .copy__15ldO, .copy__15ldO, [class*="copy"]');
    if (description && description !== title) textCell.push(description);

    // CTA(s).
    const ctaLinks = Array.from(
      card.querySelectorAll('.callToAction__3OG3P a, a[class*="cta"], a.button__uPCsA'),
    ).filter((a, i, arr) => arr.indexOf(a) === i);
    textCell.push(...ctaLinks);

    // 2-column row: image cell + text cell. Pad image with '' if missing so
    // every row keeps two cells.
    cells.push([image || '', textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
