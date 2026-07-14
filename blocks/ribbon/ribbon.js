/*
 * Ribbon Block
 * Thin full-width promo strip: small icon/image, a line of text, and an
 * inline CTA link (e.g. "Earn 50,000 points... Learn more").
 *
 * Authoring model (one row, three cells, all optional):
 *   | Ribbon                        |                                                    |             |
 *   | ------------------------------ | -------------------------------------------------- | ----------- |
 *   | [image]                        | Earn 50,000 points + first checked bag is free.     | [Learn more](https://...) |
 *
 * Cell order doesn't matter — decorate() picks up the first <picture>,
 * the first plain-text <p>, and the first <a> anywhere in the block.
 */

export default function decorate(block) {
  const picture = block.querySelector('picture');
  const link = block.querySelector('a');
  const textParagraph = [...block.querySelectorAll('p')]
    .find((p) => p.textContent.trim() && !p.querySelector('picture, a'));

  const content = document.createElement('div');
  content.className = 'ribbon-content';

  if (picture) {
    const icon = document.createElement('div');
    icon.className = 'ribbon-icon';
    icon.append(picture);
    content.append(icon);
  }

  const text = document.createElement('p');
  text.className = 'ribbon-text';
  if (textParagraph) text.append(...textParagraph.childNodes);
  if (link) {
    // undo the global auto-button decoration; this is a plain hyperlink
    link.classList.remove('button', 'primary', 'secondary');
    link.classList.add('ribbon-cta');
    text.append(' ', link);
  }
  content.append(text);

  block.textContent = '';
  block.append(content);
}
