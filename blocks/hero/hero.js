/*
 * Hero Block
 *
 * Two variants share this file:
 *   1. Auto-block — built by scripts.js from a bare h1 + picture at the top
 *      of the page. No authoring needed; decorate() is a no-op for it.
 *   2. Authored — a "Hero" table with a background image plus a headline,
 *      fare copy, and a CTA, laid out to the right of the image.
 *
 * Authoring model (one row, one cell, all optional except the image):
 *   | Hero                                                                    |
 *   | ------------------------------------------------------------------------ |
 *   | [image]                                                                  |
 *   | ## Wanna land a low fare?                                                |
 *   | One-way as low as*                                                       |
 *   | $59                                                                      |
 *   | From **Oakland, CA**                                                     |
 *   | *Seats/days/mkts lmtd; restr./excl. apply.                               |
 *   | [Book now](https://...)                                                  |
 *
 * To overlay a search-booking block on top of the hero image, author the
 * Search Booking block in the *same section* as this one (no section break
 * in between) — see blocks/hero/hero.css for the overlay rules.
 */

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  const picture = cell.querySelector('picture');
  if (!picture) return; // auto-block variant (h1 + picture) needs no rewrap

  const content = document.createElement('div');
  content.className = 'hero-content';
  [...cell.children].forEach((child) => {
    if (child === picture) return;
    content.append(child);
  });
  cell.append(content);
}
