/*
 * Credit Card Promo Block
 * Two-column card: product image on a light gradient panel, headline +
 * detail copy + a yellow CTA on a white panel.
 *
 * Authoring model (one row, one cell, all optional except the image):
 *   | Credit Card Promo                          |
 *   | -------------------------------------------- |
 *   | [image]                                      |
 *   | Earn 50,000 points.        <- headline       |
 *   | Plus, first checked bag is free.  <- bold this via the editor |
 *   | Terms apply.                                 |
 *   | Learn more                 <- turn into a real hyperlink      |
 *
 * The first paragraph becomes the headline; any bold text in the
 * remaining paragraphs (via the editor's Bold control) is styled navy —
 * no positional CSS is used, so paragraph count/order beyond the
 * headline doesn't matter.
 */

export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  const picture = cell.querySelector('picture');
  if (picture) {
    const pictureHolder = [...cell.children].find((child) => child.contains(picture));
    cell.prepend(picture);
    if (pictureHolder && pictureHolder !== picture) pictureHolder.remove();
  }

  const link = cell.querySelector('a');
  const ctaHolder = link ? [...cell.children].find((child) => child.contains(link)) : null;

  const imageCol = document.createElement('div');
  imageCol.className = 'credit-card-promo-image';
  if (picture) imageCol.append(picture);

  const bodyCol = document.createElement('div');
  bodyCol.className = 'credit-card-promo-body';

  const paragraphs = [...cell.querySelectorAll(':scope > p')].filter((p) => p !== ctaHolder);
  const [headline, ...rest] = paragraphs;

  if (headline) {
    const h3 = document.createElement('h3');
    h3.append(...headline.childNodes);
    bodyCol.append(h3);
  }

  rest.forEach((p) => {
    p.className = 'credit-card-promo-detail';
    bodyCol.append(p);
  });

  if (link) {
    link.className = 'button';
    const cta = document.createElement('p');
    cta.className = 'credit-card-promo-cta';
    cta.append(link);
    bodyCol.append(cta);
  }

  cell.textContent = '';
  cell.append(imageCol, bodyCol);
}
