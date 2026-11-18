/* RELO storefront logic. Affiliate destinations are never rewritten. */
(() => {
  "use strict";
  const products = Array.isArray(window.RELO_PRODUCTS) ? window.RELO_PRODUCTS : [];
  const grid = document.getElementById("productGrid");
  const search = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");
  const sort = document.getElementById("sortFilter");
  const count = document.getElementById("resultsCount");
  const empty = document.getElementById("emptyState");
  const title = document.getElementById("collectionTitle");
  const intro = document.getElementById("collectionIntro");
  const money = (p) => {
    if (p.price === "" || p.price === null || p.price === undefined) return "See retailer for price";
    const n = Number(p.price);
    if (!Number.isFinite(n)) return String(p.price);
    try { return new Intl.NumberFormat("en-IN", {style:"currency",currency:p.currency || "INR",maximumFractionDigits:0}).format(n); }
    catch { return `${p.currency || "INR"} ${n}`; }
  };
  const safeText = (value) => String(value ?? "");
  function currentHashCategory() {
    const match = location.hash.match(/^#category\/(.+)$/i);
    return match ? decodeURIComponent(match[1]) : "All";
  }
  function updateHeading() {
    const c = currentHashCategory();
    if (c !== "All") {
      category.value = [...category.options].some(o => o.value === c || o.text === c) ? c : "All";
      title.textContent = `${c} finds`;
      intro.textContent = `Explore our ${c.toLowerCase()} edit.`;
    } else {
      title.textContent = "Fresh finds, thoughtfully picked.";
      intro.textContent = "Browse the edit and find your next favourite.";
    }
  }
  function card(p) {
    const article = document.createElement("article");
    article.className = "product-card";
    const image = document.createElement("div");
    image.className = "product-image";
    if (p.imageUrl) {
      const img = document.createElement("img");
      img.src = p.imageUrl; img.alt = safeText(p.name); img.loading = "lazy";
      img.onerror = () => { img.remove(); image.innerHTML = '<span class="product-placeholder">RELO</span>'; };
      image.appendChild(img);
    } else {
      const mark = document.createElement("span"); mark.className = "product-placeholder"; mark.textContent = "RELO"; image.appendChild(mark);
    }
    if (p.featured) { const tag = document.createElement("span"); tag.className = "product-tag"; tag.textContent = "The edit"; image.appendChild(tag); }
    const info = document.createElement("div"); info.className = "product-info";
    const meta = document.createElement("div"); meta.className = "product-meta"; meta.textContent = `${safeText(p.category)} · ${safeText(p.platform)}`;
    const name = document.createElement("h3"); name.className = "product-name"; name.textContent = safeText(p.name);
    const desc = document.createElement("p"); desc.className = "product-description"; desc.textContent = safeText(p.description);
    const bottom = document.createElement("div"); bottom.className = "product-bottom";
    const price = document.createElement("span"); price.className = "product-price"; price.textContent = money(p);
    const link = document.createElement("a"); link.className = "shop-link"; link.textContent = "View product ↗";
    if (p.affiliateUrl && /^https?:\/\//i.test(p.affiliateUrl)) {
      // Preserve the affiliate URL byte-for-byte: no trimming, query edits, or redirect wrappers.
      link.href = p.affiliateUrl; link.target = "_blank"; link.rel = "sponsored nofollow noopener noreferrer";
      link.addEventListener("click", () => {
        try {
          const key = "relo_affiliate_clicks";
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          data[p.id] = (data[p.id] || 0) + 1;
          localStorage.setItem(key, JSON.stringify(data));
        } catch (_) { /* Storage may be unavailable; outbound link still works. */ }
      });
    } else {
      link.href = "#"; link.classList.add("disabled"); link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", e => e.preventDefault());
      link.textContent = "Add affiliate link";
    }
    bottom.append(price, link); info.append(meta, name, desc, bottom); article.append(image, info);
    return article;
  }
  function render() {
    const term = search.value.trim().toLowerCase();
    const selected = category.value;
    let list = products.filter(p => p.active !== false);
    if (selected !== "All") list = list.filter(p => p.category === selected);
    if (term) list = list.filter(p => [p.name,p.description,p.category,p.platform,...(p.tags || [])].join(" ").toLowerCase().includes(term));
    if (sort.value === "name") list.sort((a,b) => a.name.localeCompare(b.name));
    if (sort.value === "price-low") list.sort((a,b) => (Number(a.price)||Infinity) - (Number(b.price)||Infinity));
    if (sort.value === "price-high") list.sort((a,b) => (Number(b.price)||-Infinity) - (Number(a.price)||-Infinity));
    if (sort.value === "featured") list.sort((a,b) => Number(Boolean(b.featured))-Number(Boolean(a.featured)));
    grid.replaceChildren(...list.map(card));
    count.textContent = `${list.length} ${list.length === 1 ? "product" : "products"}`;
    empty.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
  }
  [search, category, sort].forEach(el => el.addEventListener("input", render));
  document.getElementById("clearFilters").addEventListener("click", () => {
    search.value = ""; category.value = "All"; sort.value = "featured";
    if (location.hash.startsWith("#category/")) history.replaceState(null, "", "#shop");
    updateHeading(); render();
  });
  window.addEventListener("hashchange", () => { updateHeading(); render(); });
  const menuButton = document.getElementById("mobileMenu");
  const mobileNav = document.getElementById("mobileNav");
  menuButton.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    mobileNav.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false");
  }));
  document.getElementById("year").textContent = new Date().getFullYear();
  updateHeading(); render();
})();
