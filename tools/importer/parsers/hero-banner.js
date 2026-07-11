/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: southwest.com homepage. Two instances:
 *   1) Promo message beside the booking widget (#bookingSectionOffer inside
 *      #bookingSection > ... > div:nth-of-type(2)):
 *        heading = "Great sale fares. Plane and simple." + offer text,
 *        CTA = a.ctaButton__2VPSU ("Book now"). No background image inside element.
 *   2) Rapid Rewards image-overlay card
 *      (#landingHomePageIndexImgOverlay > ... > div.rightAlignmentGridContainer):
 *        heading = h2 ("Join Rapid Rewards..."), body = benefits <ul>,
 *        CTA = a.ctaLink__3Nbnc ("Join for free"). Background image is a sibling
 *        outside the selected element, so not captured here.
 *
 * Hero library structure (DA): 1 column, 3 rows.
 *   Row 1: block name. Row 2: background image (optional). Row 3: title +
 *   subheading/body + CTA(s), all in a single cell.
 */
export default function parse(element, { document }) {
  // --- Background image (optional). Only present if inside the element. ---
  const bgImage = element.querySelector(
    'img.bannerWithCardImage__2lNUF, img[class*="banner"], picture img[class*="background"]',
  );

  // --- Heading ---
  // Instance 2 uses a semantic <h2>. Instance 1 has no heading tag; its title
  // lives in the offer's textContent block, so fall back to that.
  let heading = element.querySelector('h1, h2, h3');
  if (!heading) {
    const offerText = element.querySelector('.textContent__3-wMK');
    if (offerText) heading = offerText;
  }

  // --- Body / subheading ---
  // Instance 2: benefits list, which lives inside the card content container.
  // Scope the list lookup to the card so we never pick up the booking widget's
  // trip-type <ul> (instance 1's promo has no body list of its own).
  const bodyParts = [];
  const cardContent = element.querySelector('.cardContentContainer__2Sd_O, [class*="cardContent"]');
  const benefitsList = cardContent ? cardContent.querySelector('ul') : null;
  if (benefitsList) bodyParts.push(benefitsList);

  // --- CTA(s) ---
  const ctaLinks = Array.from(
    element.querySelectorAll('a.ctaButton__2VPSU, a.ctaLink__3Nbnc, a[class*="cta"], a.button__uPCsA'),
  ).filter((a, i, arr) => arr.indexOf(a) === i);

  // Empty-block guard: nothing meaningful to author.
  if (!heading && bodyParts.length === 0 && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (optional).
  if (bgImage) cells.push([bgImage]);

  // Row 3: content cell (single cell holding title + body + CTAs).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  contentCell.push(...bodyParts);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
