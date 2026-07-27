/*
 * Fetches visitor geolocation from the /api/geo edge function (see
 * /edge-functions) and exposes it for personalization:
 *   - window.swGeo — read synchronously by any block/script after this
 *     resolves (e.g. from a 'sw-geo' event listener, see below)
 *   - a 'sw-geo' CustomEvent on document, for code that runs before this
 *     resolves and needs to react once geo data is available
 *
 * Only calls the endpoint if the short-lived 'sw-geo' cookie (set by the
 * edge function itself) isn't already present, to avoid an extra request
 * on every page navigation within the same session.
 */

function getGeoCookie() {
  const match = document.cookie.match(/(?:^|;\s*)sw-geo=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export default async function initGeo() {
  const cached = getGeoCookie();
  if (cached) {
    window.swGeo = cached;
    document.dispatchEvent(new CustomEvent('sw-geo', { detail: cached }));
    return;
  }

  try {
    const res = await fetch('/api/geo', { credentials: 'same-origin' });
    if (!res.ok) return;
    const geo = await res.json();
    window.swGeo = geo;
    document.dispatchEvent(new CustomEvent('sw-geo', { detail: geo }));
  } catch {
    // edge function unavailable (e.g. local dev without it deployed) —
    // personalization simply doesn't activate, nothing else depends on it
  }
}
