/**
 * Search Booking block
 *
 * A flight/travel booking widget derived from the search block family.
 * Renders a compact booking form (trip-type tabs, origin/destination,
 * dates, passengers) with a primary Search / Book action.
 *
 * Authoring model (table rows, all optional):
 *   | Tabs        | Flights, Hotels, Cars, Cruises |
 *   | Trip types  | Round-trip, One-way, Multi-city |
 *   | Depart      | Depart placeholder |
 *   | Arrive      | Arrive placeholder |
 *   | CTA         | [Search flights](https://...) |
 *
 * The widget itself is application-driven at runtime; this decoration
 * builds an accessible static shell that the booking application enhances.
 */

function readRows(block) {
  const config = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      [, config[key]] = cells;
    }
  });
  return config;
}

function buildTabs(cell) {
  if (!cell) return null;
  const nav = document.createElement('div');
  nav.className = 'search-booking-tabs';
  const items = cell.textContent.split(',').map((t) => t.trim()).filter(Boolean);
  items.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'search-booking-tab';
    btn.textContent = label;
    if (i === 0) btn.classList.add('search-booking-tab-active');
    nav.append(btn);
  });
  return items.length ? nav : null;
}

function buildTripTypes(cell) {
  if (!cell) return null;
  const group = document.createElement('div');
  group.className = 'search-booking-triptypes';
  group.setAttribute('role', 'radiogroup');
  cell.textContent.split(',').map((t) => t.trim()).filter(Boolean).forEach((label, i) => {
    const opt = document.createElement('label');
    opt.className = 'search-booking-triptype';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'search-booking-triptype';
    if (i === 0) input.checked = true;
    opt.append(input, document.createTextNode(label));
    group.append(opt);
  });
  return group;
}

function buildField(labelText, placeholder) {
  const field = document.createElement('div');
  field.className = 'search-booking-field';
  const label = document.createElement('span');
  label.className = 'search-booking-label';
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-booking-input';
  input.placeholder = placeholder || '';
  field.append(label, input);
  return field;
}

export default function decorate(block) {
  const config = readRows(block);
  const tabs = buildTabs(config.tabs);
  const tripTypes = buildTripTypes(config['trip types'] || config.triptypes);
  const departPh = config.depart ? config.depart.textContent.trim() : 'Depart';
  const arrivePh = config.arrive ? config.arrive.textContent.trim() : 'Arrive';
  const ctaCell = config.cta;

  block.innerHTML = '';

  if (tabs) block.append(tabs);

  const form = document.createElement('form');
  form.className = 'search-booking-form';
  form.setAttribute('role', 'search');

  if (tripTypes) form.append(tripTypes);

  const fields = document.createElement('div');
  fields.className = 'search-booking-fields';
  fields.append(
    buildField('From', departPh),
    buildField('To', arrivePh),
    buildField('Depart', 'MM/DD'),
    buildField('Return', 'MM/DD'),
  );
  form.append(fields);

  const actions = document.createElement('div');
  actions.className = 'search-booking-actions';
  const cta = ctaCell && ctaCell.querySelector('a');
  if (cta) {
    cta.classList.add('button', 'search-booking-submit');
    actions.append(cta);
  } else {
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'button search-booking-submit';
    submit.textContent = 'Search';
    actions.append(submit);
  }
  form.append(actions);

  block.append(form);
}
