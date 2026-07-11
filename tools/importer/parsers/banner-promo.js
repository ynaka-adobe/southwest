/* eslint-disable */
/* global WebImporter */
/**
 * Parser for banner-promo. Base: banner (custom — not in the library catalog,
 * so structure is inferred from source HTML).
 * Source: southwest.com homepage (#landingHomePageIndexProductOverview) —
 * "Getaways by Southwest" promotional banner.
 *
 * Source structure:
 *   img (banner image)
 *   .textContent__3-wMK:
 *     eyebrow badge  -> "GETAWAYS BY SOUTHWEST"
 *     #bns-text      -> promo description
 *     #bns-disclaimer-> fine print (with links)
 *   a.ctaButton__2VPSU -> "See all deals" CTA
 *
 * Modeled as a single-column banner:
 *   Row 1: block name.
 *   Row 2: image (optional).
 *   Row 3: content cell — eyebrow/heading + body/description + disclaimer + CTA.
 */
export default function parse(element, { document }) {
  // --- Image ---
  const image = element.querySelector(':scope > .container__3p4xS > img, img');

  // --- Eyebrow / heading ---
  const eyebrow = element.querySelector('.eyebrowText__C7SsY, [class*="eyebrow"]');

  // --- Body / description ---
  const bodyText = element.querySelector('#bns-text, .textContent__3-wMK .htmlValue__1ElrM p');

  // --- Disclaimer (fine print, keeps its links) ---
  const disclaimer = element.querySelector('#bns-disclaimer');

  // --- CTA(s) ---
  const ctaLinks = Array.from(
    element.querySelectorAll('a.ctaButton__2VPSU, a[class*="cta"]'),
  ).filter((a, i, arr) => arr.indexOf(a) === i);

  // Empty-block guard.
  if (!image && !eyebrow && !bodyText && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image (optional).
  if (image) cells.push([image]);

  // Row 3: content cell.
  const contentCell = [];
  if (eyebrow) contentCell.push(eyebrow);
  if (bodyText && bodyText !== eyebrow) contentCell.push(bodyText);
  if (disclaimer) contentCell.push(disclaimer);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner-promo', cells });
  element.replaceWith(block);
}
