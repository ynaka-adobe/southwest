/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/search-booking.js
  function parse(element, { document }) {
    const cells = [];
    const configLink = element.querySelector('a[href*="query-index"], a[href*=".json"]');
    const configCell = configLink ? configLink.getAttribute("href") : "";
    cells.push([configCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "search-booking", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  function parse2(element, { document }) {
    const bgImage = element.querySelector(
      'img.bannerWithCardImage__2lNUF, img[class*="banner"], picture img[class*="background"]'
    );
    let heading = element.querySelector("h1, h2, h3");
    if (!heading) {
      const offerText = element.querySelector(".textContent__3-wMK");
      if (offerText) heading = offerText;
    }
    const bodyParts = [];
    const cardContent = element.querySelector('.cardContentContainer__2Sd_O, [class*="cardContent"]');
    const benefitsList = cardContent ? cardContent.querySelector("ul") : null;
    if (benefitsList) bodyParts.push(benefitsList);
    const ctaLinks = Array.from(
      element.querySelectorAll('a.ctaButton__2VPSU, a.ctaLink__3Nbnc, a[class*="cta"], a.button__uPCsA')
    ).filter((a, i, arr) => arr.indexOf(a) === i);
    if (!heading && bodyParts.length === 0 && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    contentCell.push(...bodyParts);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/banner-promo.js
  function parse3(element, { document }) {
    const image = element.querySelector(":scope > .container__3p4xS > img, img");
    const eyebrow = element.querySelector('.eyebrowText__C7SsY, [class*="eyebrow"]');
    const bodyText = element.querySelector("#bns-text, .textContent__3-wMK .htmlValue__1ElrM p");
    const disclaimer = element.querySelector("#bns-disclaimer");
    const ctaLinks = Array.from(
      element.querySelectorAll('a.ctaButton__2VPSU, a[class*="cta"]')
    ).filter((a, i, arr) => arr.indexOf(a) === i);
    if (!image && !eyebrow && !bodyText && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) cells.push([image]);
    const contentCell = [];
    if (eyebrow) contentCell.push(eyebrow);
    if (bodyText && bodyText !== eyebrow) contentCell.push(bodyText);
    if (disclaimer) contentCell.push(disclaimer);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "banner-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse4(element, { document }) {
    const cards = Array.from(element.querySelectorAll('.cardContainer__1vXfk, [class*="cardContainer"]'));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector("img.specialOfferImage__2EDwR, .specialOfferContainer__3rd3v picture img, picture img");
      const textCell = [];
      const eyebrow = card.querySelector('.eyebrowText__2X8D7, [class*="eyebrowText"]');
      if (eyebrow) textCell.push(eyebrow);
      const contentContainer = card.querySelector('.contentContainer__3AHPn, [class*="contentContainer"]');
      let title = null;
      if (contentContainer) {
        const secondary = contentContainer.querySelector(".secondaryContentContainer__2C2GJ");
        title = Array.from(contentContainer.querySelectorAll(".htmlValue__1ElrM")).find(
          (el) => !secondary || !secondary.contains(el)
        );
      }
      if (title) textCell.push(title);
      const description = card.querySelector('.secondaryContentContainer__2C2GJ .copy__15ldO, .copy__15ldO, [class*="copy"]');
      if (description && description !== title) textCell.push(description);
      const ctaLinks = Array.from(
        card.querySelectorAll('.callToAction__3OG3P a, a[class*="cta"], a.button__uPCsA')
      ).filter((a, i, arr) => arr.indexOf(a) === i);
      textCell.push(...ctaLinks);
      cells.push([image || "", textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/southwest-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#_bcnf"
      ]);
      const TRACKING_HOSTS = [
        "analytics.tiktok.com",
        "servedby.flashtalking.com",
        "facebook.com/tr",
        "ct.pinterest.com",
        "analytics.yahoo.com",
        "tr.snapchat.com",
        "amazon-adsystem.com",
        "doubleclick.net",
        "alb.reddit.com",
        "everesttech.net",
        "siteimproveanalytics.io"
      ];
      element.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (TRACKING_HOSTS.some((host) => src.includes(host))) {
          const wrapper = img.closest("picture") || img;
          wrapper.remove();
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "nav",
        "footer",
        "a.hiddenFromScreen__7AFk4"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "noscript",
        "link",
        "style",
        "script",
        "source"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
      });
    }
  }

  // tools/importer/transformers/southwest-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) {
      return;
    }
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) {
      return;
    }
    const document = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) {
        continue;
      }
      const target = element.querySelector(section.selector);
      if (!target) {
        continue;
      }
      if (section.style) {
        const meta = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (target.nextSibling) {
          target.parentNode.insertBefore(meta, target.nextSibling);
        } else {
          target.parentNode.appendChild(meta);
        }
      }
      if (i > 0) {
        const hr = document.createElement("hr");
        target.parentNode.insertBefore(hr, target);
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Southwest Airlines homepage with header, hero booking area, promotional content sections, and footer",
    urls: [
      "https://www.southwest.com"
    ],
    blocks: [
      {
        name: "search-booking",
        instances: [
          "#bookingSection > div.containerWithPadding__25mnl > div.backgroundColor__2J30W.image__JooQe"
        ]
      },
      {
        name: "hero-banner",
        instances: [
          "#bookingSection > div.containerWithPadding__25mnl > div:nth-of-type(2)",
          "#landingHomePageIndexImgOverlay > div.bannerWithCardContainer__120BY > div.rightAlignmentGridContainer__3N6YI.grid__1TvIC"
        ]
      },
      {
        name: "banner-promo",
        instances: [
          "#landingHomePageIndexProductOverview"
        ]
      },
      {
        name: "cards-promo",
        instances: [
          "#specialOffersTwo"
        ]
      },
      {
        name: "section-special-offers",
        instances: [
          "#pageContent > div.pageContent__3XVqO > section > div:nth-of-type(7)"
        ],
        section: "light"
      }
    ],
    sections: [
      {
        id: "hero-booking",
        name: "Hero Booking",
        selector: "#bookingSection",
        style: null,
        blocks: ["search-booking", "hero-banner"],
        defaultContent: []
      },
      {
        id: "product-overview",
        name: "Product Overview",
        selector: "#landingHomePageIndexProductOverview",
        style: null,
        blocks: ["banner-promo"],
        defaultContent: []
      },
      {
        id: "rapid-rewards-banner",
        name: "Rapid Rewards Banner",
        selector: "#landingHomePageIndexImgOverlay",
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "special-offers",
        name: "Special Offers",
        selector: "#pageContent > div.pageContent__3XVqO > section > div:nth-of-type(7)",
        style: "light",
        blocks: ["cards-promo"],
        defaultContent: [
          "#pageContent > div.pageContent__3XVqO > section > div:nth-of-type(7) > section.section__31vwa > div.paddingTopDefault__236N9 > div.compactHeading__1Mm_m.layout__HiTxF.bottomMedium__2ik4n.center__Ofnw0.sides__38zJG"
        ]
      }
    ]
  };
  var parsers = {
    "search-booking": parse,
    "hero-banner": parse2,
    "banner-promo": parse3,
    "cards-promo": parse4
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      if (blockDef.name.startsWith("section-")) return;
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const pathname = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      const path = WebImporter.FileUtils.sanitizePath(pathname || "/index");
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
