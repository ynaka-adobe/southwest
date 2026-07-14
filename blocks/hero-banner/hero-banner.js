export default function decorate(block) {
  // hero-banner is mostly a visual promo card driven by CSS. Two variants
  // share the .hero-banner class, distinguished by context:
  //   - .banner-promo-container .hero-banner  → promo over the navy booking section
  //   - .hero-banner (default)                → Rapid Rewards card, optionally
  //                                              over a full-bleed photo
  //
  // For the photo variant, the image is authored either inside this block
  // or (as the current Rapid Rewards content does) as the immediately
  // preceding sibling — pull it in either way so it can become the
  // full-bleed background, with the rest of the content floated on top
  // as a white card.
  let picture = block.querySelector('picture');

  if (!picture) {
    const prev = block.parentElement?.previousElementSibling;
    const prevPicture = prev?.querySelector('picture');
    if (prevPicture) {
      picture = prevPicture;
      prev.remove(); // drop the now-empty default-content-wrapper
    }
  }

  if (!picture) return; // no image: keep the existing plain-card rendering

  block.classList.add('hero-banner-has-image');
  block.prepend(picture);

  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  const card = document.createElement('div');
  card.className = 'hero-banner-card';
  [...cell.children].forEach((child) => card.append(child));
  cell.append(card);
}
