/* eslint-disable */
/* global WebImporter */
/**
 * Parser for search-booking. Base: search.
 * Source: southwest.com homepage (#bookingSection).
 * Generated for DA (Document Authoring) — no field hinting.
 *
 * The source is an application-driven flight-booking widget (tabbed trip types,
 * airport/date/passenger fields, promo code, Search button). Its markup is
 * entirely runtime-generated and cannot be meaningfully extracted as authored
 * content. It is modeled as a `search` block: row 1 is the block name, row 2 is
 * a config cell that the author supplies (the runtime provides the widget).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 2: config cell for the search/booking widget. The runtime drives the
  // actual widget; the author supplies configuration here. Emit any query-index
  // URL if present in the source, otherwise leave an empty config cell for the
  // author to complete.
  const configLink = element.querySelector('a[href*="query-index"], a[href*=".json"]');
  const configCell = configLink ? configLink.getAttribute('href') : '';

  cells.push([configCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'search-booking', cells });
  element.replaceWith(block);
}
