import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Banner Promo — full-width promotional lifestyle banner.
 *
 * Authored structure: a single body cell containing
 *   p1: eyebrow ("GETAWAYS BY SOUTHWEST™")
 *   p2: promo heading paragraph
 *   p3: fine-print disclaimer (with inline links)
 *   p4: standalone CTA link ("See all deals")
 *
 * An optional first cell may contain a lifestyle image/picture; when present
 * it becomes the banner background. When absent, a lazy-loaded fallback
 * image is used instead (see FALLBACK_IMAGE_URL below).
 */

// Used only when no image is authored in the block. A real <img
// loading="lazy"> (appended below) rather than a CSS background-image, so
// the browser can defer fetching this ~145KB asset until the block nears
// the viewport instead of always fetching it eagerly.
const FALLBACK_IMAGE_URL = 'https://www.southwest.com/swa-resources/images/responsive/homepage/prod_ov/dXL-gtwys-HP4-ProductOverview-bs300-IMG.webp';

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  let imageCell = null;
  let bodyCell = null;
  let mbox = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    // Mbox metadata row: first cell text is "mbox" (case-insensitive)
    if (cells.length === 2 && cells[0].textContent.trim().toLowerCase() === 'mbox') {
      mbox = cells[1].textContent.trim();
      row.remove();
      return;
    }
    cells.forEach((cell) => {
      if (!imageCell && cell.querySelector('picture, img') && !cell.querySelector('p, a, h1, h2, h3')) {
        imageCell = cell;
      } else if (!bodyCell) {
        bodyCell = cell;
      }
    });
  });

  // Expose mbox as a data attribute so at.js can target this element
  if (mbox) block.dataset.mbox = mbox;

  block.innerHTML = '';

  if (imageCell) {
    imageCell.className = 'banner-promo-image';
    imageCell.querySelectorAll('picture > img').forEach((img) => {
      const widths = [{ width: '1600' }, { media: '(min-width: 900px)', width: '1600' }];
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, widths));
    });
    block.append(imageCell);
  } else {
    const fallbackImg = document.createElement('img');
    fallbackImg.className = 'banner-promo-fallback-image';
    fallbackImg.src = FALLBACK_IMAGE_URL;
    fallbackImg.loading = 'lazy';
    fallbackImg.alt = '';
    block.append(fallbackImg);
  }

  if (bodyCell) {
    bodyCell.className = 'banner-promo-body';
    const paragraphs = [...bodyCell.querySelectorAll(':scope > p')];

    // Text column holds the eyebrow, heading and fine-print; the CTA sits
    // beside it as a separate flex item.
    const textCol = document.createElement('div');
    textCol.className = 'banner-promo-text';
    let ctaContainer = null;

    paragraphs.forEach((p, i) => {
      const links = [...p.querySelectorAll('a')];
      const onlyLink = links.length === 1
        && p.textContent.trim() === links[0].textContent.trim();

      if (onlyLink) {
        // Standalone CTA link — style as button, keep as sibling of text col.
        p.className = 'button-container';
        links[0].classList.add('button');
        ctaContainer = p;
      } else if (i === 0) {
        p.className = 'banner-promo-eyebrow';
        textCol.append(p);
      } else if (i === 1) {
        p.className = 'banner-promo-heading';
        textCol.append(p);
      } else {
        // Fine-print disclaimer — strip any auto-applied button styling.
        p.className = 'banner-promo-fineprint';
        links.forEach((a) => {
          a.classList.remove('button');
          a.closest('.button-container')?.classList.remove('button-container');
        });
        textCol.append(p);
      }
    });

    bodyCell.textContent = '';
    bodyCell.append(textCol);
    if (ctaContainer) bodyCell.append(ctaContainer);

    block.append(bodyCell);
  }
}
