/*
 * Search Booking Block
 * Mounts the flight search & booking micro-frontend, a self-contained
 * <sw-flight-search> web component: https://southwest-apps.vercel.app/
 */

const WIDGET_SCRIPT_URL = 'https://southwest-apps.vercel.app/flight-search-widget.js';
const WIDGET_TAG = 'sw-flight-search';

let widgetScriptPromise;
function loadWidgetScript() {
  if (customElements.get(WIDGET_TAG)) return Promise.resolve();
  if (!widgetScriptPromise) {
    widgetScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = WIDGET_SCRIPT_URL;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  return widgetScriptPromise;
}

export default async function decorate(block) {
  block.textContent = '';
  await loadWidgetScript();
  block.append(document.createElement(WIDGET_TAG));
}
