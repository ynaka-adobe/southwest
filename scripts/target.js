import { decorateBlock, getMetadata, loadBlock } from './aem.js';

/** AEM Universal Editor iframe; skip Target so at.js does not fight UE/CSP. */
export function isUePreviewHost(hostname = window.location.hostname) {
  return /\.(?:stage-ue|ue)\.da\.live$/.test(hostname);
}

/**
 * Target offer HTML can contain raw EDS block markup (e.g. a "ribbon" div),
 * but Target injects it directly into the DOM (via applyOffer or an
 * outerHTML swap) well after the page's own decorateBlocks()/loadBlocks()
 * pass already ran — so it never gets the "block" class, data-block-name,
 * or its CSS/JS. Find and decorate any such block-shaped div under `root`
 * so it renders and behaves the same as a normal, authored block.
 * @param {Element} root
 */
function decorateAndLoadNestedBlocks(root) {
  root.querySelectorAll('div[class]').forEach((el) => {
    if (el.classList.length !== 1 || el.classList.contains('block')) return;
    if (el.dataset.blockStatus) return;
    decorateBlock(el);
    loadBlock(el);
  });
}

/**
 * t.applyOffer() mutates the DOM asynchronously with no completion callback,
 * so scanning for new content immediately after calling it is a race —
 * wait for an actual mutation under `el` (or give up after `timeoutMs`).
 * @param {Element} el
 * @param {number} [timeoutMs]
 */
function waitForMutation(el, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      observer.disconnect();
      clearTimeout(timer);
      resolve();
    });
    observer.observe(el, { childList: true, subtree: true });
    const timer = setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeoutMs);
  });
}

/**
 * @param {unknown} e
 * @param {Element} [el]
 */
function logTargetError(e, el) {
  // eslint-disable-next-line no-console
  console.error('[target]', e, el);
}

export async function loadTarget() {
  if (isUePreviewHost()) return;
  const targetMeta = getMetadata('target');
  if (!targetMeta) return;

  const serverDomain = getMetadata('target-server-domain')?.trim();
  window.targetGlobalSettings = {
    secureOnly: true,
    overrideMboxEdgeServer: false,
    ...(serverDomain ? { serverDomain } : {}),
  };

  try {
    await import('../deps/at/at.js');
    const pageLoadRequest = { execute: { pageLoad: {} } };
    const offers = await window.adobe.target.getOffers({
      request: pageLoadRequest,
    });

    if (typeof window.adobe.target.applyOffers === 'function') {
      await window.adobe.target.applyOffers({
        request: pageLoadRequest,
        response: offers,
      });
    } else {
      offers?.execute?.pageLoad?.options?.forEach((opt) => {
        const payload = opt?.content?.[0];
        if (!payload) return;
        const { cssSelector, content } = payload;
        if (!cssSelector || content == null) return;
        const el = document.querySelector(cssSelector);
        if (!el) return;
        const { parentElement } = el;
        el.outerHTML = content;
        // el is now detached (outerHTML replaced it); the new content
        // lives under its old parent, so scope decoration there.
        if (parentElement) decorateAndLoadNestedBlocks(parentElement);
      });
    }
  } catch (e) {
    logTargetError(e, document.body);
  }
}

/**
 * Legacy mbox flow (getOffer + applyOffer). Runs after blocks render.
 * Opt-in via meta target-mbox-hero and optional target-mbox-hero-selector.
 */
export async function applyTargetHeroMboxIfConfigured() {
  if (isUePreviewHost()) return;
  const mbox = getMetadata('target-mbox-hero')?.trim();
  if (!mbox) return;

  const selectorList = (getMetadata('target-mbox-hero-selector')?.trim()
    || '.hero-promo, .hero.block .hero-inner')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const t = window.adobe?.target;
  if (!t?.getOffer || !t?.applyOffer) return;

  const resolveSelector = () => {
    for (let i = 0; i < selectorList.length; i += 1) {
      const el = document.querySelector(selectorList[i]);
      if (el) return { el, selector: selectorList[i] };
    }
    return null;
  };

  await new Promise((resolve) => {
    t.getOffer({
      mbox,
      // NB: this must stay a plain (non-async) function — at.js's internal
      // getOffer() validation rejects an async success callback ("success
      // option is required"), silently dropping the whole call with
      // neither success nor error ever firing. Do the async decoration
      // work via .then() instead of awaiting inside the callback itself.
      success(offers) {
        const match = resolveSelector();
        if (!match) {
          resolve();
          return;
        }
        t.applyOffer({ mbox, selector: match.selector, offer: offers });
        waitForMutation(match.el).then(() => {
          decorateAndLoadNestedBlocks(match.el);
          resolve();
        });
      },
      error: resolve,
    });
  });
}
