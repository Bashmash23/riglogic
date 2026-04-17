// Per-site WooCommerce scraper configs.
// Each site uses a slightly different theme, so selectors differ. Selectors
// were picked by inspecting the live HTML in April 2026; if a theme changes,
// update the config here and the shared scraper needs no changes.

import type { WooConfig } from "./woo";

export const filmquipConfig: WooConfig = {
  sourceHouse: "filmquip",
  firstPageUrl: "https://www.filmquipmedia.com/shop/",
  pageUrl: (n) => `https://www.filmquipmedia.com/shop/page/${n}/`,
  // The filmquip theme wraps each product in <li class="product ...">.
  cardSelector: "li.product",
  linkSelector: "a.woocommerce-loop-product__link, a[href*='/product/']",
  titleSelector: "h2.woocommerce-loop-product__title, .woocommerce-loop-product__title",
  priceSelector: ".price .woocommerce-Price-amount, .price",
  imageSelector: "img",
  outOfStockSelector: ".outofstock, .out-of-stock",
  maxPages: 30,
};

export const actionFilmzConfig: WooConfig = {
  sourceHouse: "actionfilmz",
  firstPageUrl: "https://actionfilmz.com/product-category/film-video/",
  pageUrl: (n) => `https://actionfilmz.com/product-category/film-video/page/${n}/`,
  cardSelector: "li.product, .product.type-product",
  linkSelector: "a[href*='/product/']",
  titleSelector: "h2.woocommerce-loop-product__title, .woocommerce-loop-product__title, h3, h2",
  priceSelector: ".price .woocommerce-Price-amount, .price",
  imageSelector: "img",
  outOfStockSelector: ".outofstock, .out-of-stock",
  maxPages: 50,
};

export const gearboxConfig: WooConfig = {
  sourceHouse: "gearbox",
  firstPageUrl: "https://gearbox.ae/shop/",
  pageUrl: (n) => `https://gearbox.ae/shop/page/${n}/`,
  // Gearbox runs a custom theme; each card is wrapped in a div that
  // contains <a class="single-product" href="...">.
  cardSelector: ".single-item-box, li.product, .product-item",
  linkSelector: "a.single-product, a[href*='/product/']",
  titleSelector: ".product-title, h3, h2, .woocommerce-loop-product__title",
  priceSelector: ".price .woocommerce-Price-amount, .price, .amount",
  imageSelector: "img",
  outOfStockSelector: ".outofstock, .out-of-stock",
  maxPages: 40,
};
