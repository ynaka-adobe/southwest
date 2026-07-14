/*
 * Quick Links Block
 * Thin navy utility bar with an icon + label per link (e.g. "Check in |
 * Flight status | Manage trip"), separators drawn by CSS.
 *
 * Authoring model: a bullet list of links, in any single cell.
 *   | Quick Links               |
 *   | -------------------------- |
 *   | - [Check in](/air/check-in) |
 *   | - [Flight status](/air/flight-status) |
 *   | - [Manage trip](/air/manage-reservation) |
 *
 * Icons are looked up by link label text below, not authored — add an
 * entry to ICONS to support a new label.
 */

const ICONS = {
  'check in': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>',
  'flight status': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  'manage trip': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"/></svg>',
};

export default function decorate(block) {
  const links = [...block.querySelectorAll('a')];

  const list = document.createElement('ul');
  list.className = 'quick-links-list';

  links.forEach((link) => {
    const li = document.createElement('li');
    li.className = 'quick-links-item';

    const svg = ICONS[link.textContent.trim().toLowerCase()];
    if (svg) {
      const icon = document.createElement('span');
      icon.className = 'quick-links-icon';
      icon.innerHTML = svg;
      li.append(icon);
    }

    link.className = 'quick-links-label';
    li.append(link);
    list.append(li);
  });

  block.textContent = '';
  block.append(list);
}
