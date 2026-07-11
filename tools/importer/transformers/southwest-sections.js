/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: southwest.com section breaks and section metadata.
 *
 * Driven entirely by payload.template.sections (from tools/importer/page-templates.json).
 * For each section (processed in reverse document order so insertions do not shift
 * the positions of earlier sections):
 *   - Insert a section-metadata block (via WebImporter.Blocks.createBlock) after the
 *     section when section.style is set.
 *   - Insert an <hr> before the section for every section except the first, so EDS
 *     renders a section break between authorable regions.
 *
 * Section selectors are supplied by the template and were validated against
 * migration-work/cleaned.html for the southwest.com homepage.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) {
    return;
  }

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) {
    return;
  }

  const document = element.ownerDocument;

  // Process in reverse so earlier section elements keep their positions while we insert.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) {
      continue;
    }

    const target = element.querySelector(section.selector);
    if (!target) {
      continue;
    }

    // Section Metadata block (only when a style is defined for the section).
    if (section.style) {
      const meta = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (target.nextSibling) {
        target.parentNode.insertBefore(meta, target.nextSibling);
      } else {
        target.parentNode.appendChild(meta);
      }
    }

    // Section break before every section except the first.
    if (i > 0) {
      const hr = document.createElement('hr');
      target.parentNode.insertBefore(hr, target);
    }
  }
}
