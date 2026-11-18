# RELO — Multiple-image gallery edition

## Files
- `index.html`: storefront structure, navigation, SEO metadata and disclosure.
- `styles.css`: responsive styling and gallery controls.
- `app.js`: product rendering, search, category filtering, sorting and image slides.
- `products.js`: editable product data.
- `products.sample.json`: sample catalogue data.

## Add multiple product images
Edit `products.js`. For each product, use `imageUrls` with an array of direct, public HTTPS image URLs:

```js
{
  id: "bag-002",
  name: "Everyday Shoulder Bag",
  category: "Bags",
  price: "899",
  currency: "INR",
  description: "A compact shoulder bag for everyday use.",
  platform: "Meesho",
  imageUrls: [
    "https://your-image-host.com/bag-front.jpg",
    "https://your-image-host.com/bag-side.jpg",
    "https://your-image-host.com/bag-inside.jpg"
  ],
  affiliateUrl: "PASTE_THE_EXACT_AFFILIATE_URL_HERE",
  tags: ["bag", "everyday"],
  featured: true,
  active: true
}
```

Visitors can use left/right arrows or the dots to change images. On mobile they can swipe left or right. `imageUrls` must contain direct image-file URLs, not product-page URLs. Only use images you're permitted to use. The older single-image `imageUrl` property still works if `imageUrls` is empty.

## Publish
1. Open https://github.com/swaritps/relo-store
2. Upload and replace `index.html`, `styles.css`, `app.js`, `products.js` in the repository root.
3. Commit changes to `main`.
4. Wait for GitHub Pages deployment, then refresh https://swaritps.github.io/relo-store/.
5. If an old version remains, hard-refresh with Ctrl+F5 or wait for caching to clear.

Keep affiliate URLs exactly as issued, including tracking parameters. Never put affiliate account passwords or private credentials in these files.

## Google Sites
Continue embedding the GitHub Pages URL in Google Sites. The image gallery works inside the embed; the iframe height and width remain controlled by Google Sites.
