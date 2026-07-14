/*
 * Credit Card Promo Block
 * Two-column card: product image on a light gradient panel, headline +
 * detail copy + a yellow CTA on a white panel.
 *
 * Authoring model — one row, two columns (image | content):
 *
 *   | Credit Card Promo              |                                       |
 *   | ------------------------------- | ------------------------------------- |
 *   | [image]                         | Earn 50,000 points.        <- headline |
 *   |                                  | Plus, first checked bag is free.  <- bold via the editor |
 *   |                                  | Terms apply.                          |
 *   |                                  | Learn more                 <- turn into a real hyperlink |
 *
 * Within the content column: the first paragraph becomes the headline;
 * any bold text in the remaining paragraphs (via the editor's Bold
 * control) renders navy — no positional CSS beyond "first paragraph is
 * the headline", so paragraph count/order after that doesn't matter.
 */

export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const [imageCell, contentCell] = row.children;
  if (imageCell) imageCell.className = 'credit-card-promo-image';
  if (!contentCell) return;

  contentCell.className = 'credit-card-promo-body';

  const link = contentCell.querySelector('a');
  const ctaHolder = link ? [...contentCell.children].find((child) => child.contains(link)) : null;

  const paragraphs = [...contentCell.querySelectorAll(':scope > p')].filter((p) => p !== ctaHolder);
  const [headline, ...rest] = paragraphs;

  if (headline) {
    const h3 = document.createElement('h3');
    h3.append(...headline.childNodes);
    headline.replaceWith(h3);
  }

  rest.forEach((p) => {
    p.className = 'credit-card-promo-detail';
  });

  if (link) {
    link.className = 'button';
    if (ctaHolder) ctaHolder.className = 'credit-card-promo-cta';
  }
}
