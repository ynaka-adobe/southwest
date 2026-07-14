import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

const LOGIN_WIDGET_SCRIPT_URL = 'https://southwest-apps.vercel.app/login-widget.js';
const LOGIN_WIDGET_TAG = 'sw-login';

let loginWidgetScriptPromise;
function loadLoginWidgetScript() {
  if (customElements.get(LOGIN_WIDGET_TAG)) return Promise.resolve();
  if (!loginWidgetScriptPromise) {
    loginWidgetScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = LOGIN_WIDGET_SCRIPT_URL;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  return loginWidgetScriptPromise;
}

// Swap the plain "Log in" nav link for the <sw-login> micro-frontend: a
// styled trigger button that opens its own login popover on click, no
// extra wiring needed since the widget owns that behavior itself.
async function replaceLoginLinkWithWidget(nav) {
  const utility = nav.querySelector('.nav-utility');
  if (!utility) return;
  const loginLink = [...utility.querySelectorAll('a')]
    .find((a) => a.textContent.trim().toLowerCase() === 'log in');
  if (!loginLink) return;

  await loadLoginWidgetScript();
  const widget = document.createElement(LOGIN_WIDGET_TAG);

  // Widget bug workaround: its "close on outside click" listener is
  // registered on `document` and compares event.target against a ref
  // *inside* its own shadow root. Once retargeted across the shadow
  // boundary, event.target is the <sw-login> host itself, which a
  // shadow-internal ref can never "contain" — so every click inside the
  // widget (typing, clicking submit, anything) is misread as "outside"
  // and closes the popover before it can do anything. Stop pointerdown
  // events from ever reaching that document listener when they
  // originate inside this widget; genuine outside clicks are untouched
  // since they never pass through this element. Real fix belongs in the
  // widget itself (use event.composedPath() instead of event.target).
  widget.addEventListener('pointerdown', (e) => e.stopPropagation());

  loginLink.replaceWith(widget);
}

// "Create account" is redundant now that the login widget's own popover
// includes an "Enroll Now" link, so drop the nav link entirely.
function removeCreateAccountLink(nav) {
  const utility = nav.querySelector('.nav-utility');
  if (!utility) return;
  const createAccountLink = [...utility.querySelectorAll('a')]
    .find((a) => a.textContent.trim().toLowerCase() === 'create account');
  if (!createAccountLink) return;

  const item = createAccountLink.closest('li') || createAccountLink;
  item.remove();
}

function closeAllPanels(nav, exceptTrigger = null) {
  nav.querySelectorAll('.nav-megamenu > li[aria-expanded="true"]').forEach((li) => {
    if (li !== exceptTrigger) li.setAttribute('aria-expanded', 'false');
  });
}

function closeAllPanelsOnResize(nav) {
  // Nav triggers stay visible at all breakpoints (Southwest shows them inline on
  // mobile as an accordion). On any breakpoint change, collapse open panels so a
  // desktop dropdown does not linger as an expanded mobile accordion (and vice versa).
  closeAllPanels(nav);
}

function decorateMegamenu(nav, navMenu) {
  navMenu.classList.add('nav-megamenu');
  const topItems = navMenu.querySelectorAll(':scope > li');
  topItems.forEach((item) => {
    const panel = item.querySelector(':scope > ul');
    if (!panel) return;
    item.classList.add('nav-drop');
    panel.classList.add('nav-panel');
    item.setAttribute('aria-expanded', 'false');

    // The trigger label is the item's first <p> or <a>
    const label = item.querySelector(':scope > p, :scope > a');
    if (label) {
      label.classList.add('nav-trigger');
      label.addEventListener('click', (e) => {
        // On desktop, the top-level label toggles the panel instead of navigating.
        if (isDesktop.matches) {
          e.preventDefault();
          const open = item.getAttribute('aria-expanded') === 'true';
          closeAllPanels(nav, item);
          item.setAttribute('aria-expanded', open ? 'false' : 'true');
        } else {
          // On mobile, tapping the label toggles its accordion section.
          const isLabelTag = e.target.closest('.nav-trigger') === label
            && e.target.tagName !== 'A';
          if (isLabelTag) {
            e.preventDefault();
            const open = item.getAttribute('aria-expanded') === 'true';
            item.setAttribute('aria-expanded', open ? 'false' : 'true');
          }
        }
      });
    }
  });

  // Close any open panel when clicking outside the nav (desktop).
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && !nav.contains(e.target)) closeAllPanels(nav);
  });
  // Close on Escape.
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeAllPanels(nav);
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  let fragment;
  if (navMeta) {
    fragment = await loadFragment(new URL(navMeta, window.location).pathname);
  } else {
    // dual-fetch: localhost /content/nav first, then production /nav
    fragment = await loadFragment('/content/nav');
    if (!fragment) fragment = await loadFragment('/nav');
  }

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Section 0 = brand, 1 = utility bar, 2 = main megamenu nav
  const classes = ['brand', 'utility', 'sections'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Strip auto-applied .button decoration from brand + utility links
  nav.querySelectorAll('.nav-brand a.button, .nav-utility a.button').forEach((a) => {
    a.classList.remove('button');
    const bc = a.closest('.button-container');
    if (bc) bc.classList.remove('button-container');
  });

  removeCreateAccountLink(nav);

  // Progressive enhancement: swap in the login widget once its script
  // loads; don't block header rendering on it.
  replaceLoginLinkWithWidget(nav);

  // Main megamenu nav (EDS wraps content in .default-content-wrapper)
  const navSections = nav.querySelector('.nav-sections');
  const navMenu = navSections?.querySelector('ul');
  if (navMenu) {
    // strip auto-applied .button decoration so trigger links style as nav text
    navMenu.querySelectorAll('a.button').forEach((a) => {
      a.classList.remove('button');
      const bc = a.closest('.button-container');
      if (bc) bc.classList.remove('button-container');
    });
    decorateMegamenu(nav, navMenu);
  }

  nav.setAttribute('aria-expanded', 'true');

  // Nav triggers are always visible (desktop dropdowns / mobile accordion).
  // On breakpoint change, collapse any open panel so state does not carry over.
  isDesktop.addEventListener('change', () => closeAllPanelsOnResize(nav));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
