import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-promo-card-image';
      } else {
        div.className = 'cards-promo-card-body';
        const paras = [...div.querySelectorAll(':scope > p')];

        // First paragraph is the eyebrow / category label (CRUISES, CARS, HOTELS).
        const eyebrow = paras[0];
        if (eyebrow && !eyebrow.querySelector('a')) {
          eyebrow.classList.add('cards-promo-eyebrow');
        }

        // Last paragraph containing a link is the CTA.
        const ctaPara = [...paras].reverse().find((p) => p.querySelector('a'));
        const cta = ctaPara ? ctaPara.querySelector('a') : null;
        if (cta) {
          cta.classList.add('button');
          ctaPara.classList.add('cards-promo-cta');
        }

        // Title paragraphs sit between the eyebrow and the first descriptive
        // paragraph. In the authored content a title may be split across
        // several short paragraphs (e.g. "Southwest" / "®" / "Cruises"), so
        // merge consecutive short title lines into one heading.
        const body = paras.filter((p) => p !== eyebrow && p !== ctaPara);
        const titleLines = [];
        while (body.length && body[0].textContent.trim().split(/\s+/).length <= 2
          && body.length > 1) {
          titleLines.push(body.shift());
        }
        if (titleLines.length) {
          const title = document.createElement('p');
          title.className = 'cards-promo-title';
          titleLines.forEach((p, i) => {
            if (i > 0) title.append(' ');
            while (p.firstChild) title.append(p.firstChild);
            p.remove();
          });
          eyebrow.after(title);
        }
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
