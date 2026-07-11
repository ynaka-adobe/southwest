import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  let fragment;
  if (footerMeta) {
    fragment = await loadFragment(new URL(footerMeta, window.location).pathname);
  } else {
    // dual-fetch: localhost /content/footer first, then production /footer
    fragment = await loadFragment('/content/footer');
    if (!fragment) fragment = await loadFragment('/footer');
  }

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Strip EDS auto-applied .button decoration — footer links are plain text links
  footer.querySelectorAll('a.button').forEach((a) => {
    a.classList.remove('button');
    const bc = a.closest('.button-container');
    if (bc) bc.classList.remove('button-container');
  });

  // Section 0 = callouts, 1 = link columns, 2 = legal / legend
  const regions = ['callouts', 'columns', 'legal'];
  regions.forEach((c, i) => {
    const section = footer.children[i];
    if (section) section.classList.add(`footer-${c}`);
  });

  // Tag the callouts list (wrapped in .default-content-wrapper by EDS)
  const calloutsList = footer.querySelector('.footer-callouts ul');
  if (calloutsList) calloutsList.classList.add('footer-callouts-list');

  // Link columns: make each heading toggle its list as an accordion on mobile.
  // EDS wraps content in .default-content-wrapper, so query the ul from within.
  const columns = footer.querySelector('.footer-columns');
  const columnsList = columns?.querySelector('ul');
  if (columnsList) {
    columnsList.classList.add('footer-columns-list');
    columnsList.querySelectorAll(':scope > li').forEach((col) => {
      const list = col.querySelector(':scope > ul');
      if (!list) return;
      col.classList.add('footer-column');
      const heading = col.querySelector(':scope > p');
      if (heading) {
        heading.classList.add('footer-column-heading');
        heading.addEventListener('click', (e) => {
          // On mobile the heading toggles the accordion; on desktop the columns
          // are always open, so let the heading link navigate normally.
          if (!isDesktop.matches && e.target.tagName !== 'A') {
            e.preventDefault();
            const open = col.getAttribute('aria-expanded') === 'true';
            col.setAttribute('aria-expanded', open ? 'false' : 'true');
          }
        });
      }
      col.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');
    });
  }

  // Keep desktop columns open when crossing the breakpoint.
  isDesktop.addEventListener('change', () => {
    footer.querySelectorAll('.footer-column').forEach((col) => {
      col.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');
    });
  });

  const footerWrapper = document.createElement('div');
  footerWrapper.className = 'footer-wrapper';
  footerWrapper.append(footer);
  block.append(footerWrapper);
}
