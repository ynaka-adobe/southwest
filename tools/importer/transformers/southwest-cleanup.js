/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: southwest.com site-wide cleanup.
 *
 * Removes non-authorable global chrome and widgets so the import contains only
 * page-level authorable content. Every selector below was verified against
 * migration-work/cleaned.html for the southwest.com homepage.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie / consent widget (found: <div id="onetrust-consent-sdk">, #onetrust-banner-sdk, #onetrust-pc-sdk).
    // Remove before parsing so its overlay/text does not get matched into blocks.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
    ]);

    // Tracking / beacon iframes (found: <iframe id="_bcnf" src=".../beacon/bf/bf.html">).
    WebImporter.DOMUtils.remove(element, [
      '#_bcnf',
    ]);

    // Tracking / analytics beacon pixels — 1x1 <img> tags pointing at ad/analytics
    // domains. They carry no authorable content and would render as broken images.
    const TRACKING_HOSTS = [
      'analytics.tiktok.com',
      'servedby.flashtalking.com',
      'facebook.com/tr',
      'ct.pinterest.com',
      'analytics.yahoo.com',
      'tr.snapchat.com',
      'amazon-adsystem.com',
      'doubleclick.net',
      'alb.reddit.com',
      'everesttech.net',
      'siteimproveanalytics.io',
    ];
    element.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (TRACKING_HOSTS.some((host) => src.includes(host))) {
        const wrapper = img.closest('picture') || img;
        wrapper.remove();
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome that is not authorable page content.
    // Found in captured DOM:
    //   <header class="header__2FKbi desktop__3WQ-s">
    //   <nav class="background__A3Wlu">
    //   <footer class="dotcomFooter__O-3ea">
    //   <a href="#content" class="hiddenFromScreen__7AFk4">Skip to content</a>
    WebImporter.DOMUtils.remove(element, [
      'header',
      'nav',
      'footer',
      'a.hiddenFromScreen__7AFk4',
    ]);

    // Leftover non-authorable embeds (found: <iframe> beacon/resize frames, <noscript>, <link>, <style>, <script>).
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'noscript',
      'link',
      'style',
      'script',
      'source',
    ]);

    // Strip tracking / handler attributes present in the source markup.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
    });
  }
}
