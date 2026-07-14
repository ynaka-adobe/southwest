/*
 * Site-wide Feedback tab: mounts the <sw-feedback> micro-frontend
 * (https://southwest-apps.vercel.app/) once per page. The widget is
 * self-contained (shadow DOM) and already position: fixed, vertically
 * centered — but pinned to the left edge with no config for that. Its
 * default styles live in its own shadow-root stylesheet (not reachable
 * from outside the shadow boundary), so move it to the right edge by
 * appending an override stylesheet into that same shadow root instead.
 */

const WIDGET_SCRIPT_URL = 'https://southwest-apps.vercel.app/feedback-widget.js';
const WIDGET_TAG = 'sw-feedback';

const TAB_OVERRIDE_CSS = `
  .sw-fb__tab {
    left: auto !important;
    right: 0 !important;
    border-radius: 6px 0 0 6px !important;
  }
`;

export default function initFeedback() {
  if (document.querySelector(WIDGET_TAG)) return;

  const script = document.createElement('script');
  script.src = WIDGET_SCRIPT_URL;
  script.onload = () => {
    const widget = document.createElement(WIDGET_TAG);
    document.body.append(widget);

    if (widget.shadowRoot) {
      const style = document.createElement('style');
      style.textContent = TAB_OVERRIDE_CSS;
      widget.shadowRoot.append(style);
    }
  };
  document.head.append(script);
}
