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
 *   | Hero                                                     |
 *   | ---------------------------------------------------------|
 *   | [image]                                                  |
 *   | Wanna land a low fare?     <- apply Heading 2 in the editor
 *   | One-way as low as*                                       |
 *   | $59                                                      |
 *   | From Oakland, CA           <- bold "Oakland, CA"
 *   | *Seats/days/mkts lmtd; restr./excl. apply.                |
 *   | Book now                  <- turn into a real hyperlink
 *
 * Use the rich-text editor's actual Heading/Bold/Link controls for the
 * items above, not typed markdown syntax (##, **, [text](url)) — DA
 * renders those literally as plain text.
 *
 * If the headline paragraph isn't already a heading, decorate() promotes
 * it to <h2> automatically so paragraph counting (see hero.css) and
 * styling stay correct either way.
 *
 * To overlay a search-booking block on top of the hero image, author the
 * Search Booking block immediately after this one, as its next sibling
 * (no other block in between) — see blocks/hero/hero.css for the
 * overlay rules.
 */

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  const picture = cell.querySelector('picture');
  if (!picture) return; // auto-block variant (h1 + picture) needs no rewrap

  // hoist the picture out of whatever it's wrapped in (DA wraps a lone
  // image in a <p>) so it doesn't get swept into hero-content below and
  // throw off the paragraph-position CSS in hero.css
  const pictureHolder = [...cell.children].find((child) => child.contains(picture));
  cell.prepend(picture);
  if (pictureHolder && pictureHolder !== picture) pictureHolder.remove();

  const content = document.createElement('div');
  content.className = 'hero-content';
  [...cell.children].forEach((child) => {
    if (child === picture) return;
    content.append(child);
  });
  cell.append(content);

  // promote the headline to a real heading if it was authored as plain text
  const heading = content.querySelector(':scope > h1, :scope > h2, :scope > h3');
  const firstParagraph = content.querySelector(':scope > p');
  if (!heading && firstParagraph) {
    const h2 = document.createElement('h2');
    h2.append(...firstParagraph.childNodes);
    firstParagraph.replaceWith(h2);
  }
}
